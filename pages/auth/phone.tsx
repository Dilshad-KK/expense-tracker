import React, { useEffect, useRef, useState } from 'react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { initFirebaseApp } from '@/lib/firebaseClient';
import { useRouter } from 'next/router';

const PhoneAuth = () => {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<'enter' | 'verify'>('enter');
  const [error, setError] = useState('');
  const confirmationRef = useRef<any>(null);
  const recaptchaRef = useRef<any>(null);

  useEffect(() => {
    try { initFirebaseApp(); } catch {}
    const auth = getAuth();
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    }
  }, []);

  const sendCode = async () => {
    setError('');
    try {
      const auth = getAuth();
      const appVerifier = recaptchaRef.current as RecaptchaVerifier;
      confirmationRef.current = await signInWithPhoneNumber(auth, phone, appVerifier);
      setPhase('verify');
    } catch (e: any) {
      setError(e?.message || 'Failed to send code');
    }
  };

  const verifyCode = async () => {
    setError('');
    try {
      const conf = confirmationRef.current;
      if (!conf) return;
      await conf.confirm(code);
      router.replace('/chat');
    } catch (e: any) {
      setError(e?.message || 'Invalid code');
    }
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-base-200 rounded-xl p-4 border border-base-300">
        <div className="text-sm font-poppinsMed mb-2">Phone Sign In</div>
        {phase === 'enter' ? (
          <>
            <input className="input input-bordered w-full mb-2" placeholder="Phone (E.164 e.g., +919645096941)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button className="btn btn-primary w-full" onClick={sendCode} disabled={!phone}>Send Code</button>
          </>
        ) : (
          <>
            <input className="input input-bordered w-full mb-2" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="btn btn-primary w-full" onClick={verifyCode} disabled={!code}>Verify</button>
          </>
        )}
        {error && <div className="text-error text-xs mt-2">{error}</div>}
        <div id="recaptcha-container" />
      </div>
    </div>
  );
};

export default PhoneAuth;
