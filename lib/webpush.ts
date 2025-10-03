import webpush from 'web-push';

const VAPID_PUBLIC = process.env.WEB_PUSH_VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY || process.env.NEXT_PUBLIC_FCM_VAPID || process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
const VAPID_PRIVATE = process.env.WEB_PUSH_VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.WEB_PUSH_VAPID_SUBJECT || 'mailto:admin@example.com';

export function configureWebPush() {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    throw new Error('Missing WEB_PUSH_VAPID_PUBLIC_KEY/WEB_PUSH_VAPID_PRIVATE_KEY');
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  return webpush;
}

