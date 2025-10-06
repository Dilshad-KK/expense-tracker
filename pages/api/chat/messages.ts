import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { between } = req.query;
    try {
      let query = supabase.from('chat_messages').select('*').order('created_at', { ascending: true });
      if (typeof between === 'string') {
        const [a, b] = between.split(',').map((s) => s.trim());
        if (a && b) {
          query = query.or(`and(from.eq.${a},to.eq.${b}),and(from.eq.${b},to.eq.${a})`);
        }
      }
      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data || []);
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || 'Failed to fetch messages' });
    }
  }

  if (req.method === 'POST') {
    const { text, from, to } = req.body || {};
    if (!text || !from || !to) return res.status(400).json({ error: 'text, from, to required' });
    const { data, error } = await supabase.from('chat_messages').insert([{ text, from, to }]).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data?.[0] || null);
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}

