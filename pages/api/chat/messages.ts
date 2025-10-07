import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import admin from 'firebase-admin';

if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  const serviceAccountJson = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!, 'base64').toString('utf-8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccountJson) });
}

function isAllowed(phone?: string | null) {
  const allowEnv = (process.env.ALLOWED_PHONES || process.env.NEXT_PUBLIC_ALLOWED_PHONES || '+919645096941').split(',').map(s=>s.trim());
  return !!phone && allowEnv.includes(phone);
}

async function verify(req: NextApiRequest) {
  try {
    const authz = req.headers.authorization || '';
    const token = authz.startsWith('Bearer ') ? authz.slice(7) : '';
    if (!token || !admin.apps.length) return null;
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded as any;
  } catch { return null; }
}

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
    const { text, from, to, message_id } = req.body || {};
    const decoded = await verify(req);
    const phone = decoded?.phone_number || decoded?.phoneNumber;
    if (!isAllowed(phone)) return res.status(403).json({ error: 'forbidden' });
    if (!text || !from || !to) return res.status(400).json({ error: 'text, from, to required' });
    const mid = message_id || `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const { data, error } = await supabase
      .from('chat_messages')
      .upsert([{ text, from, to, message_id: mid }], { onConflict: 'message_id' })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data || null);
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
