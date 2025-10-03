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
      const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
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
        if (!hasServiceRole) {
          return res.status(403).json({ error: 'Deletes require SUPABASE_SERVICE_ROLE_KEY. Set it in env and redeploy.' });
        }
        // Robust path: fetch IDs, then delete via IN (...)
        const { data: idsRows, error: selErr } = await supabaseServer
          .from('notifications')
          .select('id');
        if (selErr) return res.status(500).json({ error: selErr.message });
        const ids = (idsRows || []).map((r: any) => r.id).filter((v: any) => v !== null && v !== undefined);
        if (!ids.length) return res.status(200).json({ success: true, cleared: 0 });
        const { data, error } = await supabaseServer
          .from('notifications')
          .delete()
          .in('id', ids)
          .select('*');
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true, cleared: Array.isArray(data) ? data.length : 0 });
      }
      if (action === 'clear_read') {
        if (!hasServiceRole) {
          return res.status(403).json({ error: 'Deletes require SUPABASE_SERVICE_ROLE_KEY. Set it in env and redeploy.' });
        }
        const { data: idsRows, error: selErr } = await supabaseServer
          .from('notifications')
          .select('id')
          .eq('read', true);
        if (selErr) return res.status(500).json({ error: selErr.message });
        const ids = (idsRows || []).map((r: any) => r.id);
        if (!ids.length) return res.status(200).json({ success: true, cleared: 0 });
        const { data, error } = await supabaseServer
          .from('notifications')
          .delete()
          .in('id', ids)
          .select('*');
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true, cleared: Array.isArray(data) ? data.length : 0 });
      }
      if (action === 'clear' && id) {
        if (!hasServiceRole) {
          return res.status(403).json({ error: 'Deletes require SUPABASE_SERVICE_ROLE_KEY. Set it in env and redeploy.' });
        }
        const { data, error } = await supabaseServer
          .from('notifications')
          .delete()
          .eq('id', id)
          .select('*');
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true, cleared: Array.isArray(data) ? data.length : 0 });
      }
      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' });
  }
}
