import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { Socket } from 'net';
import { supabaseServer } from '@/lib/supabaseServer';
import admin from 'firebase-admin';
import { configureWebPush } from '@/lib/webpush';

type NextApiResponseWithSocket = NextApiResponse & {
  socket: Socket & { server: HTTPServer & { io?: IOServer } };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(_req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server as any, {
      path: '/api/socketio',
      addTrailingSlash: true,
      serveClient: false,
      transports: ['polling', 'websocket'],
      allowEIO3: true,
      cors: { origin: true, methods: ['GET', 'POST'], credentials: true },
    });
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      // Track who is connected (simple, two-user scenario)
      socket.on('presence:join', (payload: { userId: string }) => {
        try { socket.data.userId = payload?.userId; } catch {}
        socket.broadcast.emit('presence:join', { userId: socket.data.userId });
      });

      socket.on('disconnect', () => {
        if (socket.data?.userId) {
          socket.broadcast.emit('presence:leave', { userId: socket.data.userId });
        }
      });

      // Chat messages
      socket.on('chat:message', async (msg: { id?: string; text: string; from: string; to: string; message_id?: string; created_at?: string }, ack?: (r: { ok: boolean }) => void) => {
        const mid = msg.message_id || `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        const payload = { text: msg.text, from: msg.from, to: msg.to, message_id: mid } as const;
        // Persist to Supabase if possible
        try {
          const { data, error } = await supabaseServer
            .from('chat_messages')
            .upsert(payload as any, { onConflict: 'message_id' })
            .select()
            .single();
          if (error) throw error;
          if (typeof ack === 'function') ack({ ok: true });
          // Fan out to the other peer(s) with DB timestamp
          socket.broadcast.emit('chat:message', { ...payload, created_at: data?.created_at || new Date().toISOString() });
        } catch {
          if (typeof ack === 'function') ack({ ok: false });
          // Even on failure, still fan out so peer can see it (no DB ts)
          socket.broadcast.emit('chat:message', { ...payload, created_at: new Date().toISOString() });
        }

        // Create an in-app notification row and attempt push to recipient
        try {
          const title = `New message from ${msg.from}`;
          const body = msg.text.length > 140 ? msg.text.slice(0, 140) + '…' : msg.text;
          await supabaseServer.from('notifications').insert({
            title,
            body,
            icon: '/assets/icon-192x192.png',
            link: '/chat',
            read: false,
          });
        } catch {}

        // Send FCM push to recipient's devices if service account configured
        try {
          if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
            const sa = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!, 'base64').toString('utf-8'));
            admin.initializeApp({ credential: admin.credential.cert(sa) });
          }
          if (admin.apps.length) {
            const { data: rows } = await supabaseServer.from('fcm_tokens').select('token').eq('user', msg.to);
            const tokens = (rows || []).map((r: any) => r.token).filter(Boolean);
            if (tokens.length) {
              await admin.messaging().sendEachForMulticast({
                tokens,
                data: {
                  title: `New message from ${msg.from}`,
                  body: payload.text,
                  icon: '/assets/icon-192x192.png',
                  click_action: '/chat',
                },
                webpush: {
                  headers: { TTL: '2419200' },
                  fcmOptions: { link: '/chat' },
                  notification: { title: `New message from ${msg.from}`, body: payload.text, icon: '/assets/icon-192x192.png' },
                },
              });
            }
          }
        } catch {}

        // Send Web Push to recipient's subscriptions (iOS PWA etc.)
        try {
          const webpush = configureWebPush();
          const { data: subs } = await supabaseServer
            .from('webpush_subscriptions')
            .select('subscription')
            .eq('user', msg.to);
          const payloadWp = JSON.stringify({
            source: 'wp',
            title: `New message from ${msg.from}`,
            body: payload.text,
            icon: '/assets/icon-192x192.png',
            click_action: '/chat',
          });
          for (const row of subs || []) {
            try { await webpush.sendNotification(row.subscription, payloadWp); } catch {}
          }
        } catch {}
      });

      // WebRTC signaling passthrough (two users; broadcast to others)
      socket.on('webrtc:offer', (data) => socket.broadcast.emit('webrtc:offer', data));
      socket.on('webrtc:answer', (data) => socket.broadcast.emit('webrtc:answer', data));
      socket.on('webrtc:candidate', (data) => socket.broadcast.emit('webrtc:candidate', data));
      socket.on('webrtc:end', (data) => socket.broadcast.emit('webrtc:end', data));
    });
  }

  res.end();
}
