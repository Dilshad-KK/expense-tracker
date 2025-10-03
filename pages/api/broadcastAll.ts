import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
import admin from 'firebase-admin';
import { configureWebPush } from '@/lib/webpush';

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
    ? JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!, 'base64').toString('utf-8'))
    : null;
  if (serviceAccountJson) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccountJson) });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { title, body, icon, click_action } = req.body || {};

  const result: any = { success: true, fcm: null, webpush: null };

  try {
    // FCM Broadcast (Android/Desktop)
    if (admin.apps.length) {
      const { data: fcmRows, error: fcmErr } = await supabaseServer.from('fcm_tokens').select('token');
      if (fcmErr) throw new Error(fcmErr.message);
      const tokens = (fcmRows || []).map((r: any) => r.token).filter(Boolean);
      let fcmSent = 0;
      let fcmFailures = 0;
      if (tokens.length) {
        const chunkSize = 500;
        for (let i = 0; i < tokens.length; i += chunkSize) {
          const chunk = tokens.slice(i, i + chunkSize);
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
              notification: {
                title: title || 'Notification',
                body: body || '',
                icon: icon || '/assets/icon-192x192.png',
              },
            },
          });
          fcmSent += response.successCount;
          fcmFailures += response.failureCount;
          const invalidIdx = response.responses
            .map((r, idx) => (r.success ? null : idx))
            .filter((v) => v !== null) as number[];
          const invalidTokens = invalidIdx.map((j) => chunk[j]).filter(Boolean);
          if (invalidTokens.length) await supabaseServer.from('fcm_tokens').delete().in('token', invalidTokens);
        }
      }
      result.fcm = { sent: fcmSent, failures: fcmFailures };
    } else {
      result.fcm = { skipped: true, reason: 'FIREBASE_SERVICE_ACCOUNT_BASE64 not configured' };
    }

    // Web Push Broadcast (iOS PWAs and others)
    try {
      const webpush = configureWebPush();
      const { data: wpRows, error: wpErr } = await supabaseServer.from('webpush_subscriptions').select('endpoint, subscription');
      if (wpErr) throw new Error(wpErr.message);
      const subs = (wpRows || []).map((r: any) => r.subscription).filter(Boolean);
      let wpSent = 0;
      let wpFailures = 0;
      const payload = JSON.stringify({
        source: 'wp',
        title: title || 'Notification',
        body: body || '',
        icon: icon || '/assets/icon-192x192.png',
        click_action: click_action || '/',
      });
      for (const sub of subs) {
        try {
          await webpush.sendNotification(sub, payload);
          wpSent++;
        } catch (e) {
          wpFailures++;
          const endpoint = sub?.endpoint;
          if (endpoint) await supabaseServer.from('webpush_subscriptions').delete().eq('endpoint', endpoint);
        }
      }
      result.webpush = { sent: wpSent, failures: wpFailures };
    } catch (e: any) {
      result.webpush = { skipped: true, reason: e?.message || 'WEB_PUSH not configured' };
    }

    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || 'Broadcast failed', details: result });
  }
}

