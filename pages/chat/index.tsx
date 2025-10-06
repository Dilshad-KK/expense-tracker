import React, { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { HiPhone, HiVideoCamera, HiXMark, HiOutlineTrash, HiPaperAirplane } from 'react-icons/hi2';
import { supabase } from '@/lib/supabase';

// Lazy import socket.io-client to avoid SSR issues
const useSocket = () => {
  const [ioClient, setIoClient] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import('socket.io-client');
      if (!mounted) return;
      const socket = mod.io(undefined, {
        path: '/api/socketio',
        transports: ['websocket', 'polling'],
        forceNew: true,
        withCredentials: false,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });
      setIoClient(socket);
      return () => { try { socket.close(); } catch {} };
    })();
    return () => { mounted = false; };
  }, []);
  return ioClient;
};

type Message = { id?: string; text: string; from: string; to: string; message_id?: string; created_at?: string };

function resolveIdentity(): { self: string; peer: string } {
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
  const seenIdsRef = useRef<Set<string>>(new Set());
  const seenSigRef = useRef<Set<string>>(new Set());
  const realtimeActiveRef = useRef<boolean>(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [clearing, setClearing] = useState(false);

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
    fetch('/api/socketio?init=1', { cache: 'no-store', keepalive: true } as any).catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket || !ready) return;
    try {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('chat:message');
      socket.off('webrtc:offer');
      socket.off('webrtc:answer');
      socket.off('webrtc:candidate');
      socket.off('webrtc:end');
    } catch {}
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onConnectError = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.emit('presence:join', { userId: self });
    
    const onMsg = (msg: Message) => {
      if (msg.to && msg.to !== self) return;
      if (!connected) return;
      if (msg.message_id) {
        if (seenIdsRef.current.has(msg.message_id)) return;
        seenIdsRef.current.add(msg.message_id);
      } else {
        const sig = signature(msg);
        if (sig && seenSigRef.current.has(sig)) return;
        if (sig) seenSigRef.current.add(sig);
      }
      setMessages((prev) => mergeUnique([...prev, { ...msg, created_at: msg.created_at || new Date().toISOString() }]));
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

  const supaChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!ready || connected) return;
    if (supaChannelRef.current) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let realtimeActive = false;
    (async () => {
      try {
        const res = await fetch(`/api/chat/messages?between=${encodeURIComponent(self)},${encodeURIComponent(peer)}`);
        if (res.ok) {
          const data: Message[] = await res.json();
          setMessages(mergeUnique(data || []));
        }
      } catch {}
      try {
        channel = supabase
          .channel(`chat_${self}_${peer}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `from=eq.${peer},to=eq.${self}` }, (payload: any) => {
            const r = payload?.new || {};
            if (r.message_id) {
              if (seenIdsRef.current.has(r.message_id)) return;
              seenIdsRef.current.add(r.message_id);
            } else {
              const sig = signature(r);
              if (sig && seenSigRef.current.has(sig)) return;
              if (sig) seenSigRef.current.add(sig);
            }
            setMessages((prev) => mergeUnique([...prev, r]));
          });
        channel.subscribe((status: any) => {
          if (status === 'SUBSCRIBED') { realtimeActive = true; realtimeActiveRef.current = true; }
        });
        supaChannelRef.current = channel;
      } catch {}
    })();
    return () => {
      try {
        const ch = supaChannelRef.current || channel;
        if (ch) supabase.removeChannel(ch);
      } catch {}
      supaChannelRef.current = null;
      realtimeActiveRef.current = false;
    };
  }, [ready, self, peer, connected]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    let timer: any;
    const poll = async () => {
      try {
        if (connected || realtimeActiveRef.current) return;
        const res = await fetch(`/api/chat/messages?between=${encodeURIComponent(self)},${encodeURIComponent(peer)}`);
        if (!res.ok) return schedule();
        const data: Message[] = await res.json();
        if (cancelled) return;
        setMessages((prev) => mergeUnique([...prev, ...data]));
      } catch {}
      schedule();
    };
    const schedule = () => {
      if (connected || realtimeActiveRef.current) return;
      timer = setTimeout(poll, 5000);
    };
    schedule();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [ready, self, peer, connected]);

  async function sendMessage() {
    if (!text.trim() || !ready) return;
    const msg: Message = { text: text.trim(), from: self, to: peer, message_id: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`, created_at: new Date().toISOString() };
    if (msg.message_id) seenIdsRef.current.add(msg.message_id);
    else {
      const sig = signature(msg);
      if (sig) seenSigRef.current.add(sig);
    }
    setMessages((prev) => mergeUnique([...prev, msg]));
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
        try { await fetch('/api/chat/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(msg) }); } catch {}
      }
    } catch {}
  }

  function signature(m: Partial<Message>) {
    const created = m.created_at ? new Date(m.created_at).getTime() : 0;
    return `${m.from}|${m.to}|${m.text}|${created}`;
  }
  
  function mergeUnique(list: Message[]): Message[] {
    const byKey = new Map<string, Message>();
    const sigToKey = new Map<string, string>();
    for (const m of list) {
      const sig = signature(m);
      const id = m.message_id;
      if (id) {
        const existingKey = byKey.has(id) ? id : (sig && sigToKey.get(sig)) || undefined;
        if (existingKey && existingKey !== id) {
          const prev = byKey.get(existingKey)!;
          byKey.delete(existingKey);
          byKey.set(id, { ...prev, ...m, message_id: id });
        } else {
          byKey.set(id, m);
        }
        seenIdsRef.current.add(id);
        if (sig) sigToKey.set(sig, id);
      } else if (sig) {
        const mapped = sigToKey.get(sig);
        if (mapped) continue;
        byKey.set(sig, m);
        seenSigRef.current.add(sig);
      }
    }
    const arr = Array.from(byKey.values());
    arr.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
    return arr;
  }

  useEffect(() => {
    try { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }, [messages.length]);

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
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 text-base-content pb-24 flex flex-col">
      <Head>
        <title>Chat with {peer}</title>
      </Head>
      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col h-screen">
        {/* Enhanced Header */}
        <div className="px-6 py-4 border-b border-base-300/60 bg-base-100/80 backdrop-blur-lg sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 ${peer === 'Dilshad' ? 'bg-gradient-to-br from-info to-info/80' : 'bg-gradient-to-br from-secondary to-secondary/80'} rounded-full flex items-center justify-center shadow-md`}>
              <span className="text-white text-lg font-semibold font-poppinsMed">
                {peer?.startsWith('D') ? 'D' : 'S'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-semibold text-base-content truncate font-poppinsMed">
                {peer}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className={`h-2 w-2 rounded-full ${connected ? 'bg-success animate-pulse' : 'bg-warning'}`} />
                <div className={`text-xs ${connected ? 'text-success' : 'text-warning'}`}>
                  {connected ? 'Online' : 'Connecting...'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-error hover:bg-error/10 transition-all"
                title="Clear chat"
                disabled={!ready || clearing}
                onClick={async () => {
                  try {
                    if (!confirm('Clear all messages in this chat?')) return;
                    setClearing(true);
                    await fetch('/api/chat/clear', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ between: `${self},${peer}` }),
                    });
                    setMessages([]);
                    try { seenIdsRef.current.clear(); seenSigRef.current.clear(); } catch {}
                  } finally {
                    setClearing(false);
                  }
                }}
              >
                <HiOutlineTrash className="w-4 h-4" />
              </button>
              {!inCall && (
                <>
                  <button 
                    className="btn btn-circle btn-sm bg-success/20 text-success hover:bg-success/30 border-0 transition-all" 
                    title="Voice call" 
                    onClick={() => startCall(true)}
                  >
                    <HiPhone className="w-4 h-4" />
                  </button>
                  <button 
                    className="btn btn-circle btn-sm bg-primary/20 text-primary hover:bg-primary/30 border-0 transition-all" 
                    title="Video call" 
                    onClick={() => startCall(false)}
                  >
                    <HiVideoCamera className="w-4 h-4" />
                  </button>
                </>
              )}
              {inCall && (
                <button 
                  className="btn btn-circle btn-sm bg-error text-error-content hover:bg-error/90 border-0 transition-all shadow-lg" 
                  title="End call" 
                  onClick={endCall}
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Call Preview */}
        {inCall && (
          <div className="px-6 py-4 bg-base-200/80 border-b border-base-300/60 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-base-300">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full aspect-video object-cover bg-base-300" />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  You
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-primary/30">
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full aspect-video object-cover bg-base-300" />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {peer}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 bg-base-200/30">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-base-content/60">
              <div className="w-16 h-16 bg-base-300 rounded-full flex items-center justify-center mb-4">
                <HiPaperAirplane className="w-6 h-6 text-base-content/40" />
              </div>
              <div className="text-lg font-medium mb-2">No messages yet</div>
              <div className="text-sm text-center max-w-xs">
                Start a conversation with {peer} by sending your first message.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m, i) => {
                const isOwn = m.from === self;
                const showAvatar = i === 0 || messages[i - 1]?.from !== m.from;
                
                return (
                  <div key={(m as any).message_id || (m as any).id || i} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isOwn && showAvatar && (
                      <div className={`h-8 w-8 ${peer === 'Dilshad' ? 'bg-info' : 'bg-secondary'} rounded-full flex items-center justify-center flex-shrink-0 mb-1`}>
                        <span className="text-white text-xs font-medium">
                          {peer?.startsWith('D') ? 'D' : 'S'}
                        </span>
                      </div>
                    )}
                    <div className={`max-w-[70%] ${isOwn ? 'flex flex-col items-end' : ''}`}>
                      <div className={`px-4 py-3 rounded-3xl ${isOwn 
                        ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-content rounded-br-md shadow-lg' 
                        : 'bg-base-100 text-base-content border border-base-300/50 rounded-bl-md shadow-sm'
                      }`}>
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</div>
                      </div>
                      <div className={`text-[10px] text-base-content/50 mt-1 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {new Date(m.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {isOwn && showAvatar && (
                      <div className="h-8 w-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mb-1 border border-primary/20">
                        <span className="text-primary text-xs font-medium">
                          {self?.startsWith('D') ? 'D' : 'S'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Enhanced Input Area */}
        <div className="border-t border-base-300/60 bg-base-100/80 backdrop-blur-lg sticky bottom-0 z-10 p-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-base-200 rounded-2xl border border-base-300/50 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <textarea
                className="textarea textarea-ghost w-full resize-none border-0 focus:outline-none focus:ring-0 bg-transparent min-h-[48px] max-h-32 py-3 px-4 text-[16px] leading-[22px] placeholder:text-[16px]"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Message ${peer}...`}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
            </div>
            <button 
              className="btn btn-circle btn-primary text-primary-content shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:shadow-none"
              onClick={sendMessage} 
              disabled={!ready || !text.trim()}
            >
              <HiPaperAirplane className="w-5 h-5 transform rotate-45" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Chat), { ssr: false });
