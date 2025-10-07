import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

// Table: dubai_plan_monthly_deductions
// Columns: id (uuid), user (text), title (text), amount (numeric), created_at (timestamptz)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { user } = req.query as { user?: string };
      if (!user) return res.status(400).json({ error: 'user is required' });
      const { data, error } = await supabase
        .from('dubai_plan_monthly_deductions')
        .select('*')
        .eq('user', user)
        .order('created_at', { ascending: true });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { user, title, amount } = req.body || {};
      if (!user || !title) return res.status(400).json({ error: 'user and title are required' });
      const { data, error } = await supabase
        .from('dubai_plan_monthly_deductions')
        .insert([{ user, title, amount: amount ?? 0 }])
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, title, amount } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      const patch: any = {};
      if (title !== undefined) patch.title = title;
      if (amount !== undefined) patch.amount = amount;
      const { data, error } = await supabase
        .from('dubai_plan_monthly_deductions')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query as { id?: string };
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('dubai_plan_monthly_deductions').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' });
  }
}

