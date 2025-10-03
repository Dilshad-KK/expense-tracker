import { useEffect, useState } from 'react';
import { requestFcmToken, getFirebaseEnvStatus } from '@/lib/firebaseClient';
import { subscribeWebPush } from '@/lib/webpushClient';

export default function NotificationsTestPage() {
  const [token, setToken] = useState<string | null>(null);
  const [title, setTitle] = useState('Hello from FCM');
  const [body, setBody] = useState('This is a test notification');
  const [status, setStatus] = useState<string>('');
  const [items, setItems] = useState<any[]>([]);
  const env = getFirebaseEnvStatus();
  const [swInfo, setSwInfo] = useState<string>('');
  const [swScript, setSwScript] = useState<string>('');
  // Avoid hydration mismatch by determining permission on client after mount
  const [permission, setPermission] = useState<string>('checking...');
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const t = await requestFcmToken();
      setToken(t);
    })();
    (async () => {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        const ctrl = navigator.serviceWorker.controller;
        setSwInfo(`registered=${!!reg}, active=${!!reg?.active}, scope=${reg?.scope || ''}, controlled=${!!ctrl}`);
        setSwScript(reg?.active?.scriptURL || '');
      } else {
        setSwInfo('serviceWorker not supported');
      }
    })();
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setPermission(Notification.permission);
      } else {
        setPermission('unsupported');
      }
      const ua = navigator.userAgent || '';
      setIsIOS(/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1));
      const standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (navigator as any).standalone === true;
      setIsStandalone(!!standalone);
    }
    // Load latest notifications
    (async () => {
      try {
        const res = await fetch('/api/notifications');
        const json = await res.json();
        if (json?.items) setItems(json.items);
      } catch {}
    })();
  }, []);

  const sendTest = async () => {
    if (!token) {
      setStatus('No token. Allow notifications first.');
      return;
    }
    setStatus('Sending...');
    try {
      const res = await fetch('/api/sendNotification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fcmToken: token, title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      setStatus('Sent! Check your device.');
    } catch (e: any) {
      setStatus(`Error: ${e.message || 'Failed to send'}`);
    }
  };

  const broadcastTest = async () => {
    setStatus('Broadcasting...');
    try {
      const res = await fetch('/api/broadcastNotification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      setStatus(`Broadcast sent: ${data.sent} success, ${data.failures} failures`);
    } catch (e: any) {
      setStatus(`Broadcast error: ${e.message || 'Failed'}`);
    }
  };

  const broadcastAll = async () => {
    setStatus('Broadcasting to all (FCM + Web Push)...');
    try {
      const res = await fetch('/api/broadcastAll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      const fcm = data?.fcm ? `FCM sent ${data.fcm.sent || 0}, fail ${data.fcm.failures || 0}` : '';
      const wp = data?.webpush ? ` | WebPush sent ${data.webpush.sent || 0}, fail ${data.webpush.failures || 0}` : '';
      setStatus(`Broadcast: ${fcm}${wp}`);
    } catch (e: any) {
      setStatus(`Broadcast all error: ${e.message || 'Failed'}`);
    }
  };

  const copyToken = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setStatus('Token copied to clipboard');
  };

  const subscribeWP = async () => {
    setStatus('Subscribing to Web Push...');
    const res = await subscribeWebPush();
    setStatus(res.ok ? 'Web Push subscription saved' : `Web Push subscription failed: ${res.reason || ''}`);
  };

  const broadcastWP = async () => {
    setStatus('Broadcasting via Web Push...');
    try {
      const res = await fetch('/api/webpush/broadcast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, body }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      setStatus(`Web Push: ${data.sent} success, ${data.failures} failures`);
    } catch (e: any) {
      setStatus(`Web Push error: ${e.message || 'Failed'}`);
    }
  };

  const handleEnableNotifications = async () => {
    // Decide channel based on platform and install
    if (isIOS) {
      if (!isStandalone) {
        setStatus('Install this app to Home Screen to enable iOS Web Push.');
        return;
      }
      setStatus('Subscribing (Web Push)...');
      const res = await subscribeWebPush();
      setStatus(res.ok ? 'Subscribed to Web Push' : `Web Push failed: ${res.reason || ''}`);
      return;
    }
    setStatus('Requesting FCM token...');
    const t = await requestFcmToken();
    setToken(t);
    setStatus(t ? 'FCM token registered' : 'FCM token request failed');
  };

  const resetPWA = async () => {
    setStatus('Resetting PWA: unregistering service workers and clearing caches...');
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        // Try to unsubscribe existing push subscriptions before unregister
        for (const r of regs) {
          try {
            const sub = await r.pushManager.getSubscription();
            if (sub) await sub.unsubscribe();
          } catch {}
        }
        await Promise.all(regs.map(r => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      // Do not wipe localStorage/sessionStorage automatically to avoid data loss
      setStatus('Reset complete. Reloading...');
      setTimeout(() => window.location.reload(), 500);
    } catch (e: any) {
      setStatus(`Reset failed: ${e?.message || 'unknown error'}`);
    }
  };

  return (
    <div style={{ padding: 16, paddingBottom: 120 }}>
      <h1>Notifications Test</h1>
      <p>Permission: {permission}</p>
      <p>Channel: {isIOS ? (isStandalone ? 'Web Push (iOS PWA)' : 'Install PWA to enable Web Push') : 'FCM (Android/Desktop)'}</p>
      <button onClick={handleEnableNotifications} style={{ marginTop: 8, padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>Enable Notifications</button>
      <p>SW: {swInfo}</p>
      {swScript ? <p>SW script: {swScript}</p> : null}
      <div style={{margin: '8px 0'}}>
        <strong>Env:</strong>
        <div>API Key: {String(env.apiKey)}</div>
        <div>Auth Domain: {String(env.authDomain)}</div>
        <div>Project ID: {String(env.projectId)}</div>
        <div>Storage Bucket: {String(env.storageBucket)}</div>
        <div>Messaging Sender ID: {String(env.messagingSenderId)}</div>
        <div>App ID: {String(env.appId)}</div>
        <div>VAPID Key: {String(env.vapidKey)}</div>
      </div>
      <div>
        <strong>FCM Token:</strong>
        <div style={{ wordBreak: 'break-all', marginTop: 8 }}>{token || 'No token yet'}</div>
        <button onClick={copyToken} disabled={!token} style={{ marginTop: 8, padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>Copy Token</button>
      </div>
      <hr style={{ margin: '16px 0' }}/>
      <div>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        </label>
      </div>
      <div style={{ marginTop: 8 }}>
        <label>
          Body
          <input value={body} onChange={(e) => setBody(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        </label>
      </div>
      {!isIOS && (
        <>
          <button onClick={sendTest} style={{ marginTop: 12, padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>Send Test Notification</button>
          <button onClick={broadcastTest} style={{ marginTop: 12, marginLeft: 8, padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>Broadcast FCM</button>
        </>
      )}
      <div style={{ marginTop: 16 }}>
        <strong>iOS PWA/Web Push</strong>
        <div style={{ marginTop: 8 }}>
          <button onClick={subscribeWP} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>Subscribe Web Push (install PWA on iOS)</button>
          <button onClick={broadcastWP} style={{ marginLeft: 8, padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>Broadcast Web Push</button>
          <button onClick={broadcastAll} style={{ marginLeft: 8, padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>Broadcast All</button>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <div className='text-black text-[14px] font-poppinsMed mb-2'>Recent Notifications</div>
        <div>
          {items.map((n, idx) => (
            <div key={idx} className='mb-2 p-3 rounded-[12px] border border-[#e5e7eb] bg-white flex justify-between items-center'>
              <div>
                <div className='text-[12px] font-poppinsMed text-black'>{n.title}</div>
                <div className='text-[11px] text-black/70'>{n.body}</div>
              </div>
              <a href={n.link || '/'} className='text-[10px] text-[#514cff] font-poppinsMed'>Open</a>
            </div>
          ))}
        </div>
        <button onClick={async () => { setStatus('Marking all as read...'); await fetch('/api/notifications', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ action: 'mark_all_read' })}); setStatus('All marked as read'); }} style={{ marginTop: 8, padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>Mark all as read</button>
      </div>
      <div style={{ marginTop: 16 }}>
        <strong>Maintenance</strong>
        <div style={{ marginTop: 8 }}>
          <button onClick={resetPWA} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>Reset PWA (Unregister SW & Clear caches)</button>
        </div>
      </div>
      <div style={{ marginTop: 8 }}>{status}</div>
      <div style={{ height: 80 }} />
    </div>
  );
}
