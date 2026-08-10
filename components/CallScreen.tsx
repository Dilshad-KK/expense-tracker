import React, { useEffect, useRef, useState } from 'react';
import { IoClose, IoMicOff, IoMic, IoVolumeHigh, IoVolumeMedium } from 'react-icons/io5';

interface CallScreenProps {
  status: 'idle' | 'calling' | 'ringing' | 'connected';
  remoteStream: MediaStream | null;
  isMuted: boolean;
  onAccept: () => void;
  onReject: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
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
  isMuted,
  onAccept,
  onReject,
  onEndCall,
  onToggleMute,
  otherUser
}: CallScreenProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const ringtoneRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);

  // Play incoming ringtone when ringing
  useEffect(() => {
    if (status === 'ringing') {
      if (!ringtoneRef.current) {
        ringtoneRef.current = new Audio('/assets/ringtone.mp3'); 
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

  // Bind remote stream to audio element when connected
  useEffect(() => {
    if (status === 'connected' && remoteStream && audioRef.current) {
      audioRef.current.srcObject = remoteStream;
      audioRef.current.play().catch(e => console.log('Audio autoplay blocked', e));
    }
  }, [status, remoteStream]);

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
      <audio ref={audioRef} autoPlay playsInline />
      
      {/* Top section: Avatar and Status */}
      <div className="flex flex-col items-center mt-10">
        <div className={`h-[120px] w-[120px] rounded-full flex items-center justify-center text-white text-5xl shadow-2xl ${AVATAR_BG[otherUser] ?? "bg-secondary"}`}>
          {AVATAR_INITIAL[otherUser] ?? "?"}
        </div>
        <h2 className="text-2xl font-poppinsBold text-base-content mt-6">{otherUser}</h2>
        
        <p className="text-base-content/60 font-poppinsMed mt-2 text-lg">
          {isCalling && 'Calling...'}
          {isRinging && 'Incoming Call'}
          {isConnected && formatDuration(duration)}
        </p>
      </div>

      {/* Bottom section: Controls */}
      <div className="w-full max-w-sm flex flex-col items-center gap-12">
        {isConnected && (
          <div className="flex justify-center gap-8 w-full">
            <button 
              onClick={onToggleMute}
              className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl transition-colors ${
                isMuted ? 'bg-white text-black' : 'bg-base-200/50 text-white border border-white/20'
              }`}
            >
              {isMuted ? <IoMicOff /> : <IoMic />}
            </button>
            <button 
              className="h-16 w-16 rounded-full flex items-center justify-center text-2xl bg-base-200/50 text-white border border-white/20 transition-colors"
            >
              <IoVolumeHigh />
            </button>
          </div>
        )}

        <div className="flex justify-center gap-10 w-full">
          {isRinging && (
            <button 
              onClick={onAccept}
              className="h-[72px] w-[72px] rounded-full bg-success flex items-center justify-center text-white text-3xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              <IoMic />
            </button>
          )}
          
          <button 
            onClick={isRinging ? onReject : onEndCall}
            className="h-[72px] w-[72px] rounded-full bg-error flex items-center justify-center text-white text-4xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            <IoClose />
          </button>
        </div>
      </div>
    </div>
  );
}
