import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { registerBiometric, removeBiometric, isBiometricRegistered } from '@/lib/webauthn';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
}

export default function SettingsModal({ isOpen, onClose, currentUser }: SettingsModalProps) {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      setBiometricEnabled(isBiometricRegistered(currentUser));
    }
  }, [isOpen, currentUser]);

  const handleToggleBiometric = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setLoading(true);

    if (isChecked) {
      const success = await registerBiometric(currentUser);
      if (success) {
        setBiometricEnabled(true);
      } else {
        // Revert toggle if registration failed or cancelled
        e.target.checked = false;
        setBiometricEnabled(false);
      }
    } else {
      removeBiometric(currentUser);
      setBiometricEnabled(false);
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-base-200 w-full max-w-sm rounded-box overflow-hidden shadow-2xl transform transition-all">
        
        {/* Header */}
        <div className="bg-primary px-5 py-4 flex items-center justify-between">
          <h2 className="text-white font-poppinsBold text-lg">Settings</h2>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white bg-black/20 hover:bg-black/30 p-2 rounded-full transition-colors active:scale-95"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex flex-col gap-6">
            
            <div className="flex items-center justify-between bg-base-100 p-4 rounded-box shadow-sm border border-base-content/5">
              <div className="flex flex-col">
                <span className="font-poppinsMed text-base-content">App Lock</span>
                <span className="text-xs text-base-content/60 leading-tight mt-1 pr-4">
                  Require Face ID or Touch ID to open the app
                </span>
              </div>
              <input 
                type="checkbox" 
                className="toggle toggle-primary toggle-md" 
                checked={biometricEnabled}
                onChange={handleToggleBiometric}
                disabled={loading}
              />
            </div>

            {/* Other settings can go here in the future */}

          </div>
        </div>

      </div>
    </div>
  );
}
