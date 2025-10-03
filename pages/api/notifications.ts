import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { count, filter } = req.query as { count?: string; filter?: string };
      if (count) {
        const { count: unreadCount, error } = await supabaseServer
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('read', false);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ unread: unreadCount || 0 });
      }
      let query = supabaseServer
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (filter === 'unread') query = query.eq('read', false);
      if (filter === 'read') query = query.eq('read', true);
      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ items: data });
    }

    if (req.method === 'POST') {
      const { action, id } = req.body || {};
      if (action === 'mark_all_read') {
        const { error } = await supabaseServer
          .from('notifications')
          .update({ read: true })
          .eq('read', false);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
      }
      if (action === 'mark_read' && id) {
        const { error } = await supabaseServer
          .from('notifications')
          .update({ read: true })
          .eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
      }
      if (action === 'clear_all') {
        const { error } = await supabaseServer
          .from('notifications')
          .delete()
          .neq('id', null); // delete all rows
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true, cleared: 'all' });
      }
      if (action === 'clear_read') {
        const { error } = await supabaseServer
          .from('notifications')
          .delete()
          .eq('read', true);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true, cleared: 'read' });
      }
      if (action === 'clear' && id) {
        const { error } = await supabaseServer
          .from('notifications')
          .delete()
          .eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true, cleared: id });
      }
      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' });
  }
}
