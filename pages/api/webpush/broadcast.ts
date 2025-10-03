import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
import { configureWebPush } from '@/lib/webpush';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const webpush = configureWebPush();
  const { title, body, icon, click_action } = req.body || {};
  try {
    const { data, error } = await supabaseServer.from('webpush_subscriptions').select('endpoint, subscription');
    if (error) return res.status(500).json({ error: error.message });
    const subs = (data || []).map((r: any) => r.subscription).filter(Boolean);
    if (!subs.length) return res.status(200).json({ success: true, sent: 0, failures: 0 });

    let sent = 0;
    let failures = 0;
    const payload = JSON.stringify({
      source: 'wp',
      title: title || 'Notification',
      body: body || '',
      icon: icon || '/assets/icon-192x192.png',
      click_action: click_action || '/',
    });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (e: any) {
        failures++;
        // Optionally, delete gone subscriptions (410/404)
        // We need endpoint to delete; payload contains subscription endpoint at sub.endpoint
        try {
          const endpoint = sub?.endpoint;
          if (endpoint) await supabaseServer.from('webpush_subscriptions').delete().eq('endpoint', endpoint);
        } catch {}
      }
    }
    return res.status(200).json({ success: true, sent, failures });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message || 'Broadcast failed' });
  }
}
