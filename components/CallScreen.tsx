import React, { useEffect, useRef, useState } from 'react';
import { IoMicOff, IoMic, IoVolumeHigh, IoVolumeMedium, IoVideocam, IoVideocamOff } from 'react-icons/io5';
import { MdCall, MdCallEnd } from 'react-icons/md';

interface CallScreenProps {
  status: 'idle' | 'calling' | 'ringing' | 'connected';
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isVideoCall: boolean;
  onAccept: () => void;
  onReject: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  otherUser: string;
}

const AVATAR_BG: Record<string, string> = {
  Dilshad: "bg-info",
  "Shifa Dilshad": "bg-secondary",
};
const AVATAR_INITIAL: Record<string, string> = {
  Dilshad: "D",
  "Shifa Dilshad": "S",
};

export default function CallScreen({
  status,
  remoteStream,
  localStream,
  isMuted,
  isVideoOff,
  isVideoCall,
  onAccept,
  onReject,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  otherUser
}: CallScreenProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const ringtoneRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);
  const [isSpeaker, setIsSpeaker] = useState(true); // Default to speaker for now

  // Play incoming ringtone when ringing
  useEffect(() => {
    if (status === 'ringing') {
      if (!ringtoneRef.current) {
        ringtoneRef.current = new Audio('/assets/ringtone.wav'); 
        ringtoneRef.current.loop = true;
      }
      ringtoneRef.current.play().catch(e => console.log('Audio autoplay blocked', e));
    } else {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
    }
  }, [status]);

  // Bind remote stream to audio/video element when connected
  useEffect(() => {
    if (status === 'connected' && remoteStream) {
      if (isVideoCall && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      } else if (!isVideoCall && audioRef.current) {
        audioRef.current.srcObject = remoteStream;
        audioRef.current.play().catch(e => console.log('Audio autoplay blocked', e));
      }
    }
  }, [status, remoteStream, isVideoCall]);

  // Bind local stream for PIP preview
  useEffect(() => {
    if (isVideoCall && localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoCall]);

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'connected') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (status === 'idle') return null;

  const isRinging = status === 'ringing';
  const isCalling = status === 'calling';
  const isConnected = status === 'connected';

  return (
    <div className="fixed inset-0 z-[10000] bg-base-300 flex flex-col items-center justify-between pb-12 pt-20 px-6 backdrop-blur-md bg-opacity-95">
      {!isVideoCall && <audio ref={audioRef} autoPlay playsInline />}
      
      {/* Remote Video Background (if video call) */}
      {isVideoCall && (
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-[-1] bg-black"
        />
      )}

      {/* Local Video PIP */}
      {isVideoCall && localStream && (
        <div className="absolute top-16 right-4 w-28 h-40 bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-base-100 z-10">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform -scale-x-100"
          />
        </div>
      )}

      {/* Top section: Avatar and Status (hide avatar if video connected) */}
      <div className={`flex flex-col items-center mt-10 transition-opacity ${isVideoCall && isConnected ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className={`h-[120px] w-[120px] rounded-full flex items-center justify-center text-white text-5xl shadow-2xl ${AVATAR_BG[otherUser] ?? "bg-secondary"}`}>
          {AVATAR_INITIAL[otherUser] ?? "?"}
        </div>
        <h2 className="text-2xl font-poppinsBold text-white mt-6 drop-shadow-md">{otherUser}</h2>
        
        <p className="text-white/80 font-poppinsMed mt-2 text-lg drop-shadow-md">
          {isCalling && (isVideoCall ? 'Video Calling...' : 'Calling...')}
          {isRinging && (isVideoCall ? 'Incoming Video Call' : 'Incoming Call')}
          {isConnected && !isVideoCall && formatDuration(duration)}
        </p>
      </div>

      {/* Video Call Timer */}
      {isVideoCall && isConnected && (
        <div className="absolute top-16 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-poppinsMed z-10">
          {formatDuration(duration)}
        </div>
      )}

      {/* Bottom section: Controls */}
      <div className="w-full max-w-sm flex flex-col items-center gap-8 z-10">
        {isConnected && (
          <div className="flex justify-center gap-6 w-full">
            <button 
              onClick={onToggleMute}
              className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl transition-colors ${
                isMuted ? 'bg-white text-black' : 'bg-base-200/50 text-white border border-white/20'
              } backdrop-blur-md`}
            >
              {isMuted ? <IoMicOff /> : <IoMic />}
            </button>
            
            {isVideoCall ? (
              <button 
                onClick={onToggleVideo}
                className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl transition-colors ${
                  isVideoOff ? 'bg-white text-black' : 'bg-base-200/50 text-white border border-white/20'
                } backdrop-blur-md`}
              >
                {isVideoOff ? <IoVideocamOff /> : <IoVideocam />}
              </button>
            ) : (
              <button 
                onClick={() => setIsSpeaker(!isSpeaker)}
                className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl transition-colors ${
                  isSpeaker ? 'bg-white text-black' : 'bg-base-200/50 text-white border border-white/20'
                } backdrop-blur-md`}
              >
                {isSpeaker ? <IoVolumeHigh /> : <IoVolumeMedium />}
              </button>
            )}
          </div>
        )}

        <div className="flex justify-center gap-10 w-full mt-4">
          <button 
            onClick={isRinging ? onReject : onEndCall}
            className="h-[72px] w-[72px] rounded-full bg-error flex items-center justify-center text-white text-[32px] shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            <MdCallEnd />
          </button>
          
          {isRinging && (
            <button 
              onClick={onAccept}
              className="h-[72px] w-[72px] rounded-full bg-success flex items-center justify-center text-white text-[32px] shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              {isVideoCall ? <IoVideocam /> : <MdCall />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
