import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { count } = req.query;
      if (count) {
        const { count: unreadCount, error } = await supabaseServer
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('read', false);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ unread: unreadCount || 0 });
      }
      const { data, error } = await supabaseServer
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ items: data });
    }

    if (req.method === 'POST') {
      const { action } = req.body || {};
      if (action === 'mark_all_read') {
        const { error } = await supabaseServer
          .from('notifications')
          .update({ read: true })
          .eq('read', false);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' });
  }
}

