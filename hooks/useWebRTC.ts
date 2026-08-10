import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected';

interface UseWebRTCProps {
  currentUser: string;
  otherUser: string;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export function useWebRTC({ currentUser, otherUser }: UseWebRTCProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // 1. Setup Supabase Realtime channel for signaling
  useEffect(() => {
    if (!currentUser || !otherUser) return;

    const channel = supabase.channel(`webrtc_signaling`);
    
    channel
      .on('broadcast', { event: 'webrtc_offer' }, async (payload) => {
        const { sender, target, offer } = payload.payload;
        if (target === currentUser) {
          console.log('Received call offer from', sender);
          setCallStatus('ringing');
          await setupPeerConnection();
          if (pcRef.current) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
          }
        }
      })
      .on('broadcast', { event: 'webrtc_answer' }, async (payload) => {
        const { sender, target, answer } = payload.payload;
        if (target === currentUser && pcRef.current) {
          console.log('Received call answer from', sender);
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          setCallStatus('connected');
        }
      })
      .on('broadcast', { event: 'webrtc_ice' }, async (payload) => {
        const { target, candidate } = payload.payload;
        if (target === currentUser && pcRef.current) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error('Error adding received ice candidate', e);
          }
        }
      })
      .on('broadcast', { event: 'webrtc_end' }, (payload) => {
        const { target } = payload.payload;
        if (target === currentUser) {
          cleanupCall();
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to WebRTC signaling channel');
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      cleanupCall();
    };
  }, [currentUser, otherUser]);

  const sendSignalingMessage = async (event: string, payload: any) => {
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event,
        payload
      });
    }
  };

  const setupPeerConnection = async () => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Get microphone access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    } catch (e) {
      console.error('Error accessing microphone', e);
      return;
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage('webrtc_ice', {
          sender: currentUser,
          target: otherUser,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        cleanupCall();
      }
    };
  };

  const initiateCall = async () => {
    if (callStatus !== 'idle') return;
    setCallStatus('calling');
    await setupPeerConnection();
    
    if (pcRef.current) {
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      
      await sendSignalingMessage('webrtc_offer', {
        sender: currentUser,
        target: otherUser,
        offer
      });

      // Also trigger a push notification so they open the app
      fetch("/api/broadcastNotification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: `Incoming call from ${currentUser}`, 
          body: "Tap to answer", 
          click_action: "/chat" 
        }),
      }).catch(console.error);
    }
  };

  const acceptCall = async () => {
    if (callStatus !== 'ringing' || !pcRef.current) return;
    setCallStatus('connected');

    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    await sendSignalingMessage('webrtc_answer', {
      sender: currentUser,
      target: otherUser,
      answer
    });
  };

  const rejectCall = () => {
    endCall();
  };

  const endCall = () => {
    sendSignalingMessage('webrtc_end', {
      sender: currentUser,
      target: otherUser
    });
    cleanupCall();
  };

  const cleanupCall = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setCallStatus('idle');
    setIsMuted(false);
  }, [localStream]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!localStream.getAudioTracks()[0].enabled);
    }
  };

  return {
    callStatus,
    localStream,
    remoteStream,
    isMuted,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute
  };
}
