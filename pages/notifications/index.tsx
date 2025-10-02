import { useEffect, useState } from 'react';
import { requestFcmToken } from '@/lib/firebaseClient';

export default function NotificationsTestPage() {
  const [token, setToken] = useState<string | null>(null);
  const [title, setTitle] = useState('Hello from FCM');
  const [body, setBody] = useState('This is a test notification');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    (async () => {
      const t = await requestFcmToken();
      setToken(t);
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

