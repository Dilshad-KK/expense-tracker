import NavLinks from "@/components/navlinks";
import "@/styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { AppProps } from "next/app";
import { useEffect } from 'react';
import { requestFcmToken, subscribeForegroundMessages } from '@/lib/firebaseClient';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Request FCM token and listen to foreground messages
    (async () => {
      const token = await requestFcmToken();
      if (token) {
        // Persist if you need it server-side; for now log
        // console.log('FCM token:', token);
      }
      // Optional: listen to foreground notifications and surface UI
      const unsubscribe = await subscribeForegroundMessages((payload) => {
        // console.log('Foreground message:', payload);
      });
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    })();
  }, []);
  return (
    <>
      <Component {...pageProps} />
      <NavLinks />
    </>
  )
}
