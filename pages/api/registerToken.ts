import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { token, device } = req.body || {};
  if (!token) return res.status(400).json({ error: 'Missing token' });
  try {
    // Upsert by token; requires a unique constraint on token if you want DB-level dedupe
    const { data, error } = await supabase
      .from('fcm_tokens')
      .upsert({ token, device }, { onConflict: 'token' })
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, data });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to register token' });
  }
}

