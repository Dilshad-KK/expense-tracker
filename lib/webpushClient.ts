// Client helper for standards-based Web Push (works on iOS PWAs)

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function subscribeWebPush(): Promise<{ ok: boolean; reason?: string }> {
  if (typeof window === 'undefined') return { ok: false, reason: 'no_window' };
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return { ok: false, reason: 'unsupported' };
  try {
    // Must be installed as a PWA on iOS for permission to be granted
    if (Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return { ok: false, reason: 'permission_denied' };
    } else if (Notification.permission !== 'granted') {
      return { ok: false, reason: 'permission_denied' };
    }

    const publicKey = (process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY || process.env.NEXT_PUBLIC_FCM_VAPID || process.env.NEXT_PUBLIC_FCM_VAPID_KEY || '') as string;
    if (!publicKey) return { ok: false, reason: 'missing_vapid' };

    // Ensure we have a registration; fall back to registering '/sw.js' if missing
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      try {
        reg = await navigator.serviceWorker.register('/sw.js');
      } catch (e) {
        // ignore
      }
    }
    if (!reg) return { ok: false, reason: 'no_sw' };

    // Try to wait for ready but don't hang forever
    const readyOrTimeout = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);
    if (readyOrTimeout && (readyOrTimeout as ServiceWorkerRegistration).pushManager) {
      reg = readyOrTimeout as ServiceWorkerRegistration;
    }

    // If an old subscription exists (likely with a different VAPID key), unsubscribe first
    try {
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
      }
    } catch {}

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const res = await fetch('/api/webpush/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub, device: navigator.userAgent }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, reason: data?.error || 'subscribe_store_failed' };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, reason: e?.message || 'subscribe_failed' };
  }
}
