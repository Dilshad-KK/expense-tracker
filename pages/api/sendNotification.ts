import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  const serviceAccountJson = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!, 'base64').toString('utf-8')
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountJson),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fcmToken, title, body, icon, click_action } = req.body;

  if (!fcmToken) {
    return res.status(400).json({ error: "FCM token is required" });
  }

  // Use data-only payload so the app SW handles display via onBackgroundMessage
  const message: admin.messaging.Message = {
    token: fcmToken,
    data: {
      title: title || 'Notification',
      body: body || '',
      icon: icon || '/assets/icon-192x192.png',
      click_action: click_action || '/',
    },
    webpush: {
      headers: {
        TTL: '2419200',
      },
      fcmOptions: {
        link: click_action || '/',
      },
    },
  };

  try {
    const id = await admin.messaging().send(message);
    return res.status(200).json({ success: true, messageId: id, message: "Notification sent!" });
  } catch (error: any) {
    const code = error?.code || error?.errorInfo?.code || 'unknown';
    const msg = error?.message || error?.errorInfo?.message || 'Unknown error';
    console.error("FCM Error:", code, msg);
    return res.status(500).json({ success: false, error: "Failed to send notification", code, details: msg });
  }
}
