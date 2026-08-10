import React, { useState } from 'react';
import { verifyBiometric } from '@/lib/webauthn';
import { IoFingerPrintOutline } from 'react-icons/io5';

interface LockScreenProps {
  currentUser: string;
  onUnlock: () => void;
}

export default function LockScreen({ currentUser, onUnlock }: LockScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleUnlock = async () => {
    setLoading(true);
    setError(false);
    const success = await verifyBiometric(currentUser);
    setLoading(false);
    
    if (success) {
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] bg-base-100 dark:bg-base-400 flex flex-col items-center justify-center p-6">
      
      {/* Avatar */}
      <div className="h-[120px] w-[120px] bg-primary/10 rounded-full flex items-center justify-center mb-8 relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
        <img src="/assets/icons/avatar.png" className="h-[70px] relative z-10 drop-shadow-md" alt="Avatar" />
      </div>

      <h1 className="text-2xl font-poppinsBold text-base-content mb-2 text-center">
        App Locked
      </h1>
      <p className="text-base-content/60 font-poppins text-center max-w-[280px] mb-12">
        Please authenticate to access your expense tracker.
      </p>

      {/* Unlock Button */}
      <button 
        onClick={handleUnlock}
        disabled={loading}
        className="w-full max-w-[280px] bg-primary text-white h-14 rounded-full flex items-center justify-center gap-3 font-poppinsMed text-[16px] shadow-lg shadow-primary/30 active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-wait"
      >
        <IoFingerPrintOutline className="text-2xl" />
        {loading ? 'Verifying...' : 'Unlock with Face ID'}
      </button>

      {error && (
        <p className="text-error font-poppinsMed text-[13px] mt-4 animate-bounce">
          Authentication failed. Please try again.
        </p>
      )}
    </div>
  );
}
