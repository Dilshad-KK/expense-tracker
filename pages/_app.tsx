import NavLinks from "@/components/navlinks";
import "@/styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from 'react';
import { requestFcmToken, subscribeForegroundMessages } from '@/lib/firebaseClient';

export default function App({ Component, pageProps }: AppProps) {
  const [toast, setToast] = useState<null | { title?: string; body?: string }>(null);

  useEffect(() => {
    // Request FCM token and listen to foreground messages
    let unsub: undefined | (() => void);
    (async () => {
      // In development, manually register a minimal SW so getToken works
      if (process.env.NODE_ENV === 'development' && 'serviceWorker' in navigator) {
        try {
          const existing = await navigator.serviceWorker.getRegistration();
          if (!existing) {
            await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;
          }
        } catch {
          // ignore registration errors in dev
        }
      }
      const token = await requestFcmToken();
      if (token) {
        // console.log('FCM token:', token);
      }
      unsub = await subscribeForegroundMessages((payload: any) => {
        const title = payload?.data?.title || payload?.notification?.title || 'Notification';
        const body = payload?.data?.body || payload?.notification?.body || '';
        setToast({ title, body });
        // Auto-hide after 4 seconds
        setTimeout(() => setToast(null), 4000);
      });
    })();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);
  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 9999 }}>
          <div className="shadow-lg rounded-[12px] bg-white border border-[#e5e7eb] px-4 py-3 max-w-[300px]">
            <div className="text-[12px] font-poppinsMed text-black mb-[4px]">{toast.title}</div>
            <div className="text-[11px] text-black/70">{toast.body}</div>
          </div>
        </div>
      )}
      <Component {...pageProps} />
      <NavLinks />
    </>
  )
}
