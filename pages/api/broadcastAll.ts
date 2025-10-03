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
  const { title, body, icon, click_action, image, badge, requireInteraction, vibrate, actions } = req.body || {};
  // Ensure absolute URLs for assets (FCM rendering may reject/ignore relative paths)
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = req.headers.host as string;
  const origin = `${proto}://${host}`;
  const toAbs = (u?: string) => (u && u.startsWith('/') ? `${origin}${u}` : u);
  const iconAbs = toAbs(icon) || `${origin}/assets/icon-192x192.png`;
  const imageAbs = toAbs(image);

  const result: any = { success: true, fcm: null, webpush: null };

  try {
    // Persist a notification record for listing/unread count
    try {
      await supabaseServer.from('notifications').insert({
        title: title || 'Notification',
        body: body || '',
        icon: icon || '/assets/icon-192x192.png',
        link: click_action || '/',
        read: false,
      });
    } catch {}

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
              icon: iconAbs,
              click_action: click_action || '/',
              image: imageAbs || '',
              badge: badge || '',
              requireInteraction: String(!!requireInteraction),
              vibrate: Array.isArray(vibrate) ? JSON.stringify(vibrate) : (vibrate || ''),
              actions: actions ? JSON.stringify(actions) : '',
            },
            webpush: {
              headers: { TTL: '2419200' },
              fcmOptions: { link: click_action || '/' },
              // Keep notification minimal for maximum compatibility
              notification: {
                title: title || 'Notification',
                body: body || '',
                icon: iconAbs,
              },
            },
          });
          fcmSent += response.successCount;
          fcmFailures += response.failureCount;
          // Only remove tokens that are definitively invalid/unregistered
          const invalidTokens: string[] = [];
          response.responses.forEach((r, idx) => {
            // @ts-ignore - error may be undefined
            const code = r?.error?.code || r?.error?.errorInfo?.code;
            if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
              invalidTokens.push(chunk[idx]);
            }
          });
          if (invalidTokens.length) {
            await supabaseServer.from('fcm_tokens').delete().in('token', invalidTokens);
          }
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
        icon: iconAbs,
        click_action: click_action || '/',
        image: imageAbs,
        badge,
        requireInteraction,
        vibrate,
        actions,
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
