// Fallbacks use your known Firebase Web config so the app still works
const FB_FALLBACK = {
  apiKey: 'AIzaSyBbe4yHfoeHNOlVDOQtJRI3gc1APuLOoFM',
  authDomain: 'expense-tracker-10bdc.firebaseapp.com',
  projectId: 'expense-tracker-10bdc',
  storageBucket: 'expense-tracker-10bdc.firebasestorage.app',
  messagingSenderId: '488731254443',
  appId: '1:488731254443:web:b490a5642393d7363921ee',
};

export const firebaseConfig = {
  // Support both names; prefer NEXT_PUBLIC_FIREBASE_API (no _KEY)
  apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || FB_FALLBACK.apiKey) as string,
  authDomain: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || FB_FALLBACK.authDomain) as string,
  projectId: (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || FB_FALLBACK.projectId) as string,
  storageBucket: (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || FB_FALLBACK.storageBucket) as string,
  messagingSenderId: (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || FB_FALLBACK.messagingSenderId) as string,
  appId: (process.env.NEXT_PUBLIC_FIREBASE_APP_ID || FB_FALLBACK.appId) as string,
};

// Support both env names: prefer NEXT_PUBLIC_FCM_VAPID, fallback to legacy NEXT_PUBLIC_FCM_VAPID_KEY
export const vapidPublicKey = (
  process.env.NEXT_PUBLIC_FCM_VAPID || process.env.NEXT_PUBLIC_FCM_VAPID_KEY || ''
) as string;

export function firebaseEnvFlags() {
  return {
    apiKey: !!firebaseConfig.apiKey,
    authDomain: !!firebaseConfig.authDomain,
    projectId: !!firebaseConfig.projectId,
    storageBucket: !!firebaseConfig.storageBucket,
    messagingSenderId: !!firebaseConfig.messagingSenderId,
    appId: !!firebaseConfig.appId,
    vapidPublicKey: !!vapidPublicKey,
  };
}
