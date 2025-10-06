import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import { firebaseConfig, vapidPublicKey, firebaseEnvFlags as flags } from './firebaseConfig';

export function initFirebaseApp() {
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
}

export async function getMessagingInstance(): Promise<Messaging | null> {
  try {
    const supported = await isSupported();
    if (!supported) return null;
    initFirebaseApp();
    return getMessaging();
  } catch {
    return null;
  }
}

export async function requestFcmToken(): Promise<string | null> {
  try {
    if (typeof window === 'undefined') return null;
    if (!('Notification' in window)) return null;
    if (!('serviceWorker' in navigator)) return null;

    // Ensure permission
    if (Notification.permission === 'default') {
      const res = await Notification.requestPermission();
      if (res !== 'granted') return null;
    } else if (Notification.permission !== 'granted') {
      return null;
    }

    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    const vapidKey = vapidPublicKey;
    if (!vapidKey) return null;

    // Ensure we use the same SW that next-pwa registered (typically /sw.js at root)
    let registration: ServiceWorkerRegistration | undefined;
    try {
      registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        const readyReg = await navigator.serviceWorker.ready;
        registration = readyReg;
      }
    } catch {
      // ignore and let it be undefined
    }

    const token = await getToken(messaging, registration ? { vapidKey, serviceWorkerRegistration: registration } : { vapidKey });
    if (token) {
      try {
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;
        let user: string | undefined = undefined;
        try { user = localStorage.getItem('userIdentity') || undefined; } catch {}
        await fetch('/api/registerToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, device: ua, user }),
        });
      } catch {
        // ignore registration errors client-side
      }
    }
    return token || null;
  } catch {
    return null;
  }
}

export async function subscribeForegroundMessages(cb: (payload: any) => void) {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};
  const unsubscribe = onMessage(messaging, (payload) => cb(payload));
  return unsubscribe;
}

export function getFirebaseEnvStatus() {
  const f = flags();
  return {
    apiKey: f.apiKey,
    authDomain: f.authDomain,
    projectId: f.projectId,
    storageBucket: f.storageBucket,
    messagingSenderId: f.messagingSenderId,
    appId: f.appId,
    vapidKey: f.vapidPublicKey,
  };
}
