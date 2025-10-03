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
