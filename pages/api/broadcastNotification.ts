import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import admin from 'firebase-admin';

// Ensure Admin initialized (rely on existing init in sendNotification if needed)
if (!admin.apps.length) {
  const serviceAccountJson = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!, 'base64').toString('utf-8')
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountJson),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { title, body, icon, click_action } = req.body || {};
  try {
    const { data, error } = await supabase.from('fcm_tokens').select('token');
    if (error) return res.status(500).json({ error: error.message });
    const tokens = (data || []).map((r: any) => r.token).filter(Boolean);
    if (!tokens.length) return res.status(200).json({ success: true, sent: 0, failures: 0, results: [] });

    // Chunk tokens to 500 per request (FCM limit)
    const chunkSize = 500;
    const chunks: string[][] = [];
    for (let i = 0; i < tokens.length; i += chunkSize) chunks.push(tokens.slice(i, i + chunkSize));

    const results: any[] = [];
    let sent = 0;
    let failures = 0;
    for (const chunk of chunks) {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: chunk,
        data: {
          title: title || 'Notification',
          body: body || '',
          icon: icon || '/assets/icon-192x192.png',
          click_action: click_action || '/',
        },
        webpush: {
          headers: { TTL: '2419200' },
          fcmOptions: { link: click_action || '/' },
        },
      });
      sent += response.successCount;
      failures += response.failureCount;
      results.push(response.responses);

      // Remove invalid tokens
      const invalidIdx = response.responses
        .map((r, idx) => (r.success ? null : idx))
        .filter((v) => v !== null) as number[];
      const invalidTokens = invalidIdx
        .map((i) => chunk[i])
        .filter((t) => !!t);
      if (invalidTokens.length) {
        await supabase.from('fcm_tokens').delete().in('token', invalidTokens);
      }
    }

    return res.status(200).json({ success: true, sent, failures, results });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message || 'Broadcast failed' });
  }
}

