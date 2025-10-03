// Client helper for standards-based Web Push (works on iOS PWAs)

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function subscribeWebPush(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  // Must be installed as a PWA on iOS for permission to be granted
  if (Notification.permission === 'default') {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return false;
  } else if (Notification.permission !== 'granted') {
    return false;
  }

  const publicKey = (process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY || process.env.NEXT_PUBLIC_FCM_VAPID || process.env.NEXT_PUBLIC_FCM_VAPID_KEY || '') as string;
  if (!publicKey) return false;

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  // Send subscription to server for storage
  const res = await fetch('/api/webpush/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: sub, device: navigator.userAgent }),
  });
  return res.ok;
}

