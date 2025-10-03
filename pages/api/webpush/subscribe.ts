import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const { subscription, device } = req.body || {};
    if (!subscription || !subscription.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
    const row = { endpoint: subscription.endpoint, subscription, device };
    const { error } = await supabase.from('webpush_subscriptions').upsert(row, { onConflict: 'endpoint' });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to save subscription' });
  }
}

