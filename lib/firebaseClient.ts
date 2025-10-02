import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
};

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

    // Ensure permission
    if (Notification.permission === 'default') {
      const res = await Notification.requestPermission();
      if (res !== 'granted') return null;
    } else if (Notification.permission !== 'granted') {
      return null;
    }

    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY as string | undefined;
    if (!vapidKey) return null;

    const token = await getToken(messaging, { vapidKey });
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

