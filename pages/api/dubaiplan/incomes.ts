import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

// Table: dubai_plan_incomes
// Columns: id (uuid), user (text), source (text), amount (numeric), date (date), created_at (timestamptz)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { user } = req.query as { user?: string };
      let q = supabase.from('dubai_plan_incomes').select('*').order('date', { ascending: false }).order('created_at', { ascending: false });
      if (user) q = q.eq('user', user);
      const { data, error } = await q;
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { user, source, amount, date } = req.body || {};
      if (!user || !source || !amount || !date) return res.status(400).json({ error: 'user, source, amount, date are required' });
      const row = { user, source, amount, date };
      const { data, error } = await supabase.from('dubai_plan_incomes').insert([row]).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, source, amount, date } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      const patch: any = {};
      if (source !== undefined) patch.source = source;
      if (amount !== undefined) patch.amount = amount;
      if (date !== undefined) patch.date = date;
      const { data, error } = await supabase.from('dubai_plan_incomes').update(patch).eq('id', id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query as { id?: string };
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('dubai_plan_incomes').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' });
  }
}

