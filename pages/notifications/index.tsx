import { useEffect, useState } from 'react';
import { requestFcmToken, getFirebaseEnvStatus } from '@/lib/firebaseClient';

export default function NotificationsTestPage() {
  const [token, setToken] = useState<string | null>(null);
  const [title, setTitle] = useState('Hello from FCM');
  const [body, setBody] = useState('This is a test notification');
  const [status, setStatus] = useState<string>('');
  const env = getFirebaseEnvStatus();
  const [swInfo, setSwInfo] = useState<string>('');

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
      } else {
        setSwInfo('serviceWorker not supported');
      }
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

  const copyToken = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setStatus('Token copied to clipboard');
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Notifications Test</h1>
      <p>Permission: {typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'}</p>
      <p>SW: {swInfo}</p>
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
        <button onClick={copyToken} disabled={!token} style={{ marginTop: 8 }}>Copy Token</button>
      </div>
      <hr style={{ margin: '16px 0' }}/>
      <div>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 4 }} />
        </label>
      </div>
      <div style={{ marginTop: 8 }}>
        <label>
          Body
          <input value={body} onChange={(e) => setBody(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 4 }} />
        </label>
      </div>
      <button onClick={sendTest} style={{ marginTop: 12 }}>Send Test Notification</button>
      <div style={{ marginTop: 8 }}>{status}</div>
    </div>
  );
}
