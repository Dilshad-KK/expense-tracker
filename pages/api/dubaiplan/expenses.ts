import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

// Table: dubai_plan_expenses
// Columns: id (uuid), user (text), category (text), amount (numeric), created_at (timestamptz)

const DEFAULT_CATEGORIES = ['Travel', 'Rent', 'Food', 'Transport', 'Visa', 'Misc'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { user } = req.query as { user?: string };
      if (!user) return res.status(400).json({ error: 'user is required' });

      // Fetch existing
      let { data, error } = await supabase
        .from('dubai_plan_expenses')
        .select('*')
        .eq('user', user)
        .order('created_at', { ascending: true });

      if (error) return res.status(500).json({ error: error.message });

      // Seed defaults if none exist
      if (!data || data.length === 0) {
        const rows = DEFAULT_CATEGORIES.map((c) => ({ user, category: c, amount: 0 }));
        const seeded = await supabase.from('dubai_plan_expenses').insert(rows).select('*');
        if (seeded.error) return res.status(500).json({ error: seeded.error.message });
        data = seeded.data || [];
      }
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { user, category, amount } = req.body || {};
      if (!user || !category) return res.status(400).json({ error: 'user and category are required' });
      const { data, error } = await supabase.from('dubai_plan_expenses').insert([{ user, category, amount: amount ?? 0 }]).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, category, amount } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      const patch: any = {};
      if (category !== undefined) patch.category = category;
      if (amount !== undefined) patch.amount = amount;
      const { data, error } = await supabase.from('dubai_plan_expenses').update(patch).eq('id', id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query as { id?: string };
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('dubai_plan_expenses').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' });
  }
}

