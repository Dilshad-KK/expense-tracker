import NavLinks from "@/components/navlinks";
import "@/styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { AppProps } from "next/app";
import { useEffect } from 'react';


export default function App({ Component, pageProps }: AppProps) {

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('react-onesignal').then(async (OneSignal) => {
        await OneSignal.default.init({
          appId: '00b19587-74cb-4d19-931d-e74f5a20e8a1',
          notifyButton: {
            enable: true,
            showCredit: false,
            prenotify: true,
            position: 'bottom-right',
            text: {
              'tip.state.unsubscribed': 'Subscribe to notifications',
              'tip.state.subscribed': "You're subscribed to notifications",
              'tip.state.blocked': 'You have blocked notifications',
              'message.prenotify': 'Click to subscribe to push notifications',
              'message.action.subscribing': 'Subscribing...',
              'message.action.subscribed': "Thanks for subscribing!",
              'message.action.resubscribed': "You're subscribed to notifications",
              'message.action.unsubscribed': "You won't receive notifications again",
              'dialog.main.title': 'Manage Site Notifications',
              'dialog.main.button.subscribe': 'SUBSCRIBE',
              'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
              'dialog.blocked.title': 'Unblock Notifications',
              'dialog.blocked.message': 'Follow these instructions to allow notifications:',
            },
          },
        });
      });
    }
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <NavLinks />
    </>
  )
}