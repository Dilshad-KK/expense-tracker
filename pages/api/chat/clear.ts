import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const decoded = await verify(req);
    const phone = decoded?.phone_number || decoded?.phoneNumber;
    if (!isAllowed(phone)) return res.status(403).json({ error: 'forbidden' });
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
