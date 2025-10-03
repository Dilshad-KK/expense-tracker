export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
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
