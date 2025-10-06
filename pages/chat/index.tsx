import React, { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { HiPhone, HiVideoCamera, HiXMark } from 'react-icons/hi2';
import { supabase } from '@/lib/supabase';

// Lazy import socket.io-client to avoid SSR issues
const useSocket = () => {
  const [ioClient, setIoClient] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import('socket.io-client');
      if (!mounted) return;
      const socket = mod.io({ path: '/api/socketio', transports: ['websocket', 'polling'] });
      setIoClient(socket);
      return () => { try { socket.close(); } catch {} };
    })();
    return () => { mounted = false; };
  }, []);
  return ioClient;
};

type Message = { id?: string; text: string; from: string; to: string; message_id?: string; created_at?: string };

function resolveIdentity(): { self: string; peer: string } {
  // Use saved identity; fallback to timezone-based guess from Profile screen
  if (typeof window === 'undefined') return { self: 'Dilshad', peer: 'Shifa Dilshad' };
  try {
    const current = localStorage.getItem('userIdentity');
    let self = current || '';
    if (!self) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      self = tz.includes('Asia/Dubai') ? 'Dilshad' : 'Shifa Dilshad';
      localStorage.setItem('userIdentity', self);
    }
    const peer = self === 'Dilshad' ? 'Shifa Dilshad' : 'Dilshad';
    return { self, peer };
  } catch {
    return { self: 'Dilshad', peer: 'Shifa Dilshad' };
  }
}

const Chat = () => {
  const socket = useSocket();
  const [{ self, peer }, setIdent] = useState<{ self: string; peer: string }>(() => resolveIdentity());
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);

  // WebRTC state
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [inCall, setInCall] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(false);

  const ready = useMemo(() => !!self && !!peer, [self, peer]);

  // Boot Socket.IO server once
  useEffect(() => {
    // ping the socket route to ensure server is initialized
    fetch('/api/socketio').catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket || !ready) return;
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onConnectError = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.emit('presence:join', { userId: self });
    // Receive messages
    const onMsg = (msg: Message) => {
      if (msg.to && msg.to !== self) return; // not for me
      setMessages((prev) => {
        if (msg.message_id && prev.some((m) => m.message_id === msg.message_id)) return prev;
        return [...prev, { ...msg, created_at: msg.created_at || new Date().toISOString() }];
      });
    };
    socket.on('chat:message', onMsg);

    // Signaling handlers
    const onOffer = async (data: any) => {
      if (data.to && data.to !== self) return;
      await ensurePeerConnection();
      await pcRef.current!.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pcRef.current!.createAnswer();
      await pcRef.current!.setLocalDescription(answer);
      socket.emit('webrtc:answer', { from: self, to: peer, answer });
    };
    const onAnswer = async (data: any) => {
      if (data.to && data.to !== self) return;
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
    };
    const onCandidate = async (data: any) => {
      if (data.to && data.to !== self) return;
      try {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch {}
    };
    const onEnd = () => endCall();
    socket.on('webrtc:offer', onOffer);
    socket.on('webrtc:answer', onAnswer);
    socket.on('webrtc:candidate', onCandidate);
    socket.on('webrtc:end', onEnd);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('chat:message', onMsg);
      socket.off('webrtc:offer', onOffer);
      socket.off('webrtc:answer', onAnswer);
      socket.off('webrtc:candidate', onCandidate);
      socket.off('webrtc:end', onEnd);
      socket.off('connect_error', onConnectError);
    };
  }, [socket, ready, self, peer]);

  useEffect(() => {
    if (!ready) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      // Load history between the two users
      try {
        const res = await fetch(`/api/chat/messages?between=${encodeURIComponent(self)},${encodeURIComponent(peer)}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data || []);
        }
      } catch {}
      // Realtime fallback via Supabase
      try {
        channel = supabase
          .channel(`chat_${self}_${peer}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `from=eq.${peer},to=eq.${self}` }, (payload: any) => {
            const r = payload?.new || {};
            setMessages((prev) => (prev.some((m) => m.message_id && m.message_id === r.message_id) ? prev : [...prev, r]));
          })
          .subscribe();
      } catch {}
    })();
    return () => { try { channel && supabase.removeChannel(channel); } catch {} };
  }, [ready, self, peer]);

  async function sendMessage() {
    if (!text.trim() || !ready) return;
    const msg: Message = { text: text.trim(), from: self, to: peer, message_id: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, msg]);
    setText('');
    try {
      let acked = false;
      await new Promise<void>((resolve) => {
        try {
          socket?.timeout(2000).emit('chat:message', msg, (err: any, res: any) => {
            if (!err && res && res.ok) { acked = true; }
            resolve();
          });
        } catch { resolve(); }
      });
      if (!acked) {
        // Fallback: persist via API
        try { await fetch('/api/chat/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(msg) }); } catch {}
      }
    } catch {}
  }

  async function ensurePeerConnection() {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pc.onicecandidate = (e) => {
      if (e.candidate) socket?.emit('webrtc:candidate', { from: self, to: peer, candidate: e.candidate });
    };
    pc.ontrack = (e) => {
      const [stream] = e.streams;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
    };
    pcRef.current = pc;
    return pc;
  }

  async function startCall(audioOnly = false) {
    setIsAudioOnly(audioOnly);
    const pc = await ensurePeerConnection();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: !audioOnly, audio: true });
      localStreamRef.current = stream;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket?.emit('webrtc:offer', { from: self, to: peer, offer });
      setInCall(true);
    } catch (err) {
      console.error('getUserMedia error', err);
    }
  }

  function endCall() {
    try { socket?.emit('webrtc:end', { from: self, to: peer }); } catch {}
    try { pcRef.current?.getSenders().forEach((s) => { try { s.track?.stop(); } catch {} }); } catch {}
    try { localStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    try { pcRef.current?.close(); } catch {}
    pcRef.current = null;
    localStreamRef.current = null;
    setInCall(false);
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content pb-24 flex flex-col">
      <Head>
        <title>Chat</title>
      </Head>
      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-base-300 flex items-center gap-3 bg-base-100 sticky top-0 z-10">
          <div className={`h-9 w-9 ${peer === 'Dilshad' ? 'bg-info' : 'bg-secondary'} rounded-full flex items-center justify-center `}>
            <span className="text-white text-sm font-poppinsMed">{peer?.startsWith('D') ? 'D' : 'S'}</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-poppinsMed">{peer}</div>
            <div className={`text-[11px] ${connected ? 'text-success' : 'text-base-content/60'}`}>{connected ? 'online' : 'offline'}</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {!inCall && (
              <>
                <button className="btn btn-ghost btn-sm" title="Voice call" onClick={() => startCall(true)}>
                  <HiPhone className="w-4 h-4" />
                </button>
                <button className="btn btn-ghost btn-sm" title="Video call" onClick={() => startCall(false)}>
                  <HiVideoCamera className="w-4 h-4" />
                </button>
              </>
            )}
            {inCall && (
              <button className="btn btn-error btn-sm text-error-content" title="End call" onClick={endCall}>
                <HiXMark className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Call preview */}
        {inCall && (
          <div className="px-4 py-2 bg-base-200/60 border-b border-base-300">
            <div className="grid grid-cols-2 gap-2">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full rounded border border-base-300" />
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded border border-base-300" />
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 bg-base-200/40">
          {messages.map((m, i) => (
            <div key={i} className={`mb-2 flex ${m.from === self ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-3 py-2 rounded-2xl max-w-[80%] ${m.from === self ? 'bg-primary text-primary-content rounded-tr-sm' : 'bg-base-300 text-base-content rounded-tl-sm'}`}>
                <div className="text-[10px] opacity-75 mb-1">{new Date(m.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Composer */}
        <div className="border-t border-base-300 bg-base-100 sticky bottom-0 p-3 flex gap-2">
          <input className="input input-bordered flex-1" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} />
          <button className="btn btn-primary" onClick={sendMessage} disabled={!ready || !text.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Chat), { ssr: false });
