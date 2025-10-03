import { useEffect, useState } from 'react';
import moment from 'moment';

export default function NotificationsPage() {
  const [status, setStatus] = useState<string>('');
  const [items, setItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/notifications');
        const json = await res.json();
        if (json?.items) setItems(json.items);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

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

  const refresh = async () => {
    setStatus('Refreshing...');
    try {
      const res = await fetch(`/api/notifications?filter=${activeTab}`);
      const json = await res.json();
      setItems(json?.items || []);
      setStatus('');
    } catch (e: any) {
      setStatus('Refresh failed');
    }
  };

  const markAllRead = async () => {
    setStatus('Marking all as read...');
    await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'mark_all_read' }) });
    await refresh();
  };

  const markRead = async (id: any) => {
    await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'mark_read', id }) });
    await refresh();
  };

  const filtered = items.filter((n) => (activeTab === 'unread' ? !n.read : !!n.read));

  return (
    <div className='px-4 py-4' style={{ paddingBottom: 120 }}>
      <div className='flex items-center justify-between mb-3'>
        <h1 className='text-black text-[16px] font-poppinsMed'>Notifications</h1>
        <div>
          <button onClick={markAllRead} className='text-[10px] text-[#514cff] border border-[#e5e7eb] px-3 py-2 rounded-[8px] bg-white'>Mark all read</button>
          <button onClick={refresh} className='ml-2 text-[10px] text-[#514cff] border border-[#e5e7eb] px-3 py-2 rounded-[8px] bg-white'>Refresh</button>
        </div>
      </div>

      <div className='flex mb-4 border border-[#e5e7eb] rounded-[10px] overflow-hidden bg-white'>
        <button onClick={() => setActiveTab('unread')} className={`flex-1 px-3 py-2 text-[12px] font-poppinsMed ${activeTab==='unread' ? 'bg-[#f3f3fd] text-black' : 'text-black/60'}`}>Unread</button>
        <button onClick={() => setActiveTab('read')} className={`flex-1 px-3 py-2 text-[12px] font-poppinsMed ${activeTab==='read' ? 'bg-[#f3f3fd] text-black' : 'text-black/60'}`}>Read</button>
      </div>

      {loading ? (
        <div className='text-[12px] text-black/60'>Loading…</div>
      ) : (
        <div>
          {filtered.length === 0 && (
            <div className='text-[12px] text-black/60'>No {activeTab} notifications</div>
          )}
          {filtered.map((n, idx) => (
            <div key={idx} className='mb-2 p-3 rounded-[12px] border border-[#e5e7eb] bg-white'>
              <div className='flex justify-between items-start'>
                <div className='mr-2'>
                  <div className='text-[12px] font-poppinsMed text-black'>{n.title}</div>
                  <div className='text-[11px] text-black/70'>{n.body}</div>
                  {n.created_at && (
                    <div className='text-[10px] text-black/50 mt-1'>{moment(n.created_at).fromNow()}</div>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  {n.link && (<a href={n.link} className='text-[10px] text-[#514cff] font-poppinsMed'>Open</a>)}
                  {!n.read && (<button onClick={() => markRead(n.id)} className='text-[10px] text-[#514cff] border border-[#e5e7eb] px-2 py-1 rounded-[8px] bg-white'>Mark read</button>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className='mt-4 text-[11px] text-black/60'>{status}</div>

      <div style={{ height: 80 }} />
      <div className='mt-2'>
        <button onClick={resetPWA} className='text-[10px] text-[#514cff] border border-[#e5e7eb] px-3 py-2 rounded-[8px] bg-white'>Reset PWA (Unregister SW & Clear caches)</button>
      </div>
    </div>
  );
}
