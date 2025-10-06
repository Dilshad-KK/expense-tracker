import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const { subscription, device, user } = req.body || {};
    if (!subscription || !subscription.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
    const row = { endpoint: subscription.endpoint, subscription, device, user };
    const { error } = await supabaseServer.from('webpush_subscriptions').upsert(row, { onConflict: 'endpoint' });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to save subscription' });
  }
}
