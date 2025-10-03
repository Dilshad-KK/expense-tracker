import type { NextApiRequest, NextApiResponse } from 'next';
import moment from 'moment';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) return res.status(500).json({ error: error.message });
    const latest = data?.[0];
    if (!latest?.last_period_date || !latest?.cycle_length) {
      return res.status(400).json({ error: 'Insufficient period data' });
    }
    const last = moment(latest.last_period_date);
    const next = last.clone().add(latest.cycle_length, 'days');
    const diff = next.diff(moment(), 'days');
    if (diff > 1) {
      return res.status(200).json({ skipped: true, reason: 'More than 1 day away' });
    }
    // Broadcast a reminder
    const origin = `${(req.headers['x-forwarded-proto'] || 'https')}://${req.headers.host}`;
    const body = diff <= 0 ? 'Period expected today' : 'Period expected tomorrow';
    await fetch(`${origin}/api/broadcastAll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Period Reminder', body, click_action: '/periods' }),
    });
    return res.status(200).json({ success: true, next: next.toISOString(), message: body });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed to notify' });
  }
}

