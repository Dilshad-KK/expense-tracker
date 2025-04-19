import NavLinks from "@/components/navlinks";
import "@/styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { AppProps } from "next/app";
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const initOneSignal = async () => {
      if (typeof window !== 'undefined') {
        const OneSignal = (await import('react-onesignal')).default;

        await OneSignal.init({
          appId: '00b19587-74cb-4d19-931d-e74f5a20e8a1',
          notifyButton: {
            enable: true,
            showCredit: false,
            prenotify: true,
            position: 'bottom-right',
            text: {
              'tip.state.unsubscribed': 'Subscribe to notifications',
              'tip.state.subscribed': "You're subscribed!",
              'tip.state.blocked': 'Notifications are blocked',
              'message.prenotify': 'Click to subscribe to push notifications',
              'message.action.subscribing': 'Subscribing...',
              'message.action.subscribed': 'Thanks for subscribing!',
              'message.action.resubscribed': "You're subscribed again!",
              'message.action.unsubscribed': "You won't receive notifications",
              'dialog.main.title': 'Notifications Settings',
              'dialog.main.button.subscribe': 'SUBSCRIBE',
              'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
              'dialog.blocked.title': 'Unblock Notifications',
              'dialog.blocked.message': 'Follow browser instructions to allow notifications.',
            },
          },
          allowLocalhostAsSecureOrigin: true,
        });
      }
    };

    initOneSignal();
  }, []);
  return (
    <>
      <Component {...pageProps} />
      <NavLinks />
    </>
  )
}