import NavLinks from "@/components/navlinks";
import "@/styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from 'react';
import { requestFcmToken, subscribeForegroundMessages, initFirebaseApp } from '@/lib/firebaseClient';
import { subscribeWebPush } from '@/lib/webpushClient';
import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { fetchUnreadCount, fetchNotifications } from '@/store/notificationsSlice';
import { applyTheme } from '@/utils/theme';

export default function App({ Component, pageProps }: AppProps) {
  const [toast, setToast] = useState<null | { title?: string; body?: string }>(null);
  const [iosPromptVisible, setIosPromptVisible] = useState(false);
  const [envChecked, setEnvChecked] = useState(false);
  const [channelInfo, setChannelInfo] = useState<string>('');
  // Using store.dispatch directly (this component defines Provider below)

  useEffect(() => {
    // Auth temporarily disabled: skip Firebase auth state handling
    try { initFirebaseApp(); } catch {}
    // Initial unread fetch on app load
    try { store.dispatch(fetchUnreadCount()); } catch {}
    try { store.dispatch(fetchNotifications('unread' as any)); } catch {}
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
        try {
          store.dispatch(fetchUnreadCount());
          store.dispatch(fetchNotifications('unread' as any));
        } catch {}
      });
    })();
    return () => { if (typeof unsub === 'function') unsub(); };
  }, []);

  // Apply theme from Redux store and subscribe to changes
  useEffect(() => {
    try { applyTheme((store.getState() as any).ui.theme); } catch {}
    const unsubscribe = store.subscribe(() => {
      try { applyTheme((store.getState() as any).ui.theme); } catch {}
    });
    return () => { try { unsubscribe(); } catch {} };
  }, []);

  // ── Sync <meta name="theme-color"> with the active DaisyUI primary colour ──
  // Runs after every theme change so the Android status bar / browser chrome
  // always matches the app's primary colour.
  useEffect(() => {
    const updateThemeColor = () => {
      try {
        const themeName: string = (store.getState() as any).ui.theme ?? 'ikbu';
        // Fast-path: known custom themes
        const knownColors: Record<string, string> = {
          ikbu: '#514cff',
          'ikbu-dark': '#7c83ff',
        };
        if (knownColors[themeName]) {
          document.querySelector('meta[name="theme-color"]')?.setAttribute('content', knownColors[themeName]);
          return;
        }
        // For any other DaisyUI theme, read the CSS variable from the document root.
        // DaisyUI exposes --p as an oklch channel string, e.g. "62.8% 0.258 29.2"
        const raw = getComputedStyle(document.documentElement).getPropertyValue('--p').trim();
        if (raw) {
          document.querySelector('meta[name="theme-color"]')?.setAttribute('content', `oklch(${raw})`);
        }
      } catch {}
    };

    updateThemeColor();
    const unsub = store.subscribe(updateThemeColor);
    return () => { try { unsub(); } catch {} };
  }, []);


  // Show iOS PWA notification enable banner on first load (installed PWA only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
    const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (navigator as any).standalone === true;
    const perm = 'Notification' in window ? Notification.permission : 'unsupported';
    setChannelInfo(isIOS ? (isStandalone ? 'Web Push (iOS PWA)' : 'Install PWA to enable Web Push') : 'FCM (Android/Desktop)');
    const dismissed = localStorage.getItem('iosPushPromptDismissed') === '1';
    if (isIOS && isStandalone && perm === 'default' && !dismissed) {
      setIosPromptVisible(true);
    }
    setEnvChecked(true);
  }, []);

  const enableIosPush = async () => {
    const res = await subscribeWebPush();
    if (res.ok) {
      setIosPromptVisible(false);
      localStorage.setItem('iosPushPromptDismissed', '1');
      setToast({ title: 'Notifications Enabled', body: 'You will receive alerts on this device.' });
      setTimeout(() => setToast(null), 3000);
    } else {
      setToast({ title: 'Enable Failed', body: res.reason || 'Please check Settings > Notifications.' });
      setTimeout(() => setToast(null), 4000);
    }
  };

  // Listen for SW messages (e.g., Web Push foreground notifications) and show a toast
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const handler = (event: MessageEvent) => {
      try {
        const data: any = event.data || {};
        if (data && data.type === 'PUSH') {
          const title = data.title || 'Notification';
          const body = data.body || '';
          setToast({ title, body });
          setTimeout(() => setToast(null), 4000);
          // Refresh unread count and unread list opportunistically
          store.dispatch(fetchUnreadCount());
          store.dispatch(fetchNotifications('unread' as any));
        }
      } catch {}
    };
    navigator.serviceWorker.addEventListener('message', handler as any);
    return () => {
      try { navigator.serviceWorker.removeEventListener('message', handler as any); } catch {}
    };
  }, []);

  // Refresh unread count when app comes to foreground
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        store.dispatch(fetchUnreadCount());
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);
  return (
    <Provider store={store}>
      {envChecked && iosPromptVisible && (
        <div style={{ position: 'fixed', bottom: 72, left: 12, right: 12, zIndex: 9999 }}>
          <div className="shadow-lg rounded-[12px] bg-base-100 dark:bg-base-200 border border-base-300 dark:border-base-400 px-4 py-3">
            <div className="text-[12px] font-poppinsMed text-base-content mb-[4px]">Enable Notifications</div>
            <div className="text-[11px] text-base-content/70 mb-2">Tap to allow push notifications for this PWA. You can change this later in Settings.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={enableIosPush} className="btn btn-primary btn-xs normal-case text-[12px]">Enable</button>
              <button onClick={() => { setIosPromptVisible(false); localStorage.setItem('iosPushPromptDismissed','1'); }} className="text-primary bg-base-100 dark:bg-base-200 border border-base-300 dark:border-base-400 px-3 py-2 rounded-[8px] text-[12px]">Later</button>
              <div className="text-[10px] text-base-content/60 ml-auto self-center">{channelInfo}</div>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 9999 }}>
          <div className="shadow-lg rounded-[12px] bg-base-100 dark:bg-base-200 border border-base-300 dark:border-base-400 px-4 py-3 max-w-[300px]">
            <div className="text-[12px] font-poppinsMed text-base-content mb-[4px]">{toast.title}</div>
            <div className="text-[11px] text-base-content/70">{toast.body}</div>
          </div>
        </div>
      )}
      <Component {...pageProps} />
      <NavLinks />
    </Provider>
  )
}
