import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const { between } = req.body || {};
    if (!between || typeof between !== 'string' || !between.includes(',')) {
      return res.status(400).json({ error: 'between must be "userA,userB"' });
    }
    const [a, b] = between.split(',').map((s: string) => s.trim());
    if (!a || !b) return res.status(400).json({ error: 'between requires two users' });

    // Delete both directions in one round-trip
    const { error } = await supabaseServer
      .from('chat_messages')
      // or(and(from.eq.a,to.eq.b),and(from.eq.b,to.eq.a)) is not supported in delete; do two filters
      .delete()
      .or(`and(from.eq.${a},to.eq.${b}),and(from.eq.${b},to.eq.${a})`);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed to clear chat' });
  }
}

