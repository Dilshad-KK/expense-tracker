import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/lib/supabaseServer";
import admin from "firebase-admin";

// Initialize Firebase Admin once
if (!admin.apps.length) {
  try {
    const serviceAccountJson = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!, "base64").toString("utf-8")
    );
    admin.initializeApp({ credential: admin.credential.cert(serviceAccountJson) });
  } catch {}
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    const { count: countMode, user, limit } = req.query;

    // Unread count mode: ?count=1&user=Dilshad
    if (countMode === "1" && typeof user === "string" && user) {
      const { count, error } = await supabaseServer
        .from("messages")
        .select("*", { count: "exact", head: true })
        .neq("sender", user)
        .not("read_by", "cs", `{${user}}`);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ count: count ?? 0 });
    }

    // Normal fetch: last N messages ordered ascending
    const msgLimit = Math.min(Number(limit) || 80, 200);
    const { data, error } = await supabaseServer
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(msgLimit);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data ?? []);
  }

  // ── POST ─────────────────────────────────────────────────────────────────
  if (req.method === "POST") {
    const { sender, body } = req.body ?? {};
    if (!sender || !body) {
      return res.status(400).json({ error: "sender and body are required" });
    }

    // Insert message
    const { data, error } = await supabaseServer
      .from("messages")
      .insert([{ sender, body: body.trim() }])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });

    // Broadcast push notification to all registered FCM tokens
    try {
      const { data: tokenRows } = await supabaseServer
        .from("fcm_tokens")
        .select("token");
      const tokens = (tokenRows ?? []).map((r: any) => r.token).filter(Boolean);
      if (tokens.length) {
        const preview = String(body).slice(0, 100);
        await admin.messaging().sendEachForMulticast({
          tokens,
          data: {
            title: sender,
            body: preview,
            icon: "/assets/icon-192x192.png",
            click_action: "/chat",
          },
          webpush: {
            headers: { TTL: "86400" },
            fcmOptions: { link: "/chat" },
            notification: {
              title: sender,
              body: preview,
              icon: "/assets/icon-192x192.png",
            },
          },
        });
      }
    } catch {
      // Non-fatal: message was saved; push notification failure is acceptable
    }

    return res.status(201).json(data);
  }

  // ── PATCH ─────────────────────────────────────────────────────────────────
  if (req.method === "PATCH") {
    const { user } = req.body ?? {};
    if (!user) return res.status(400).json({ error: "user is required" });

    // Fetch messages from others that this user hasn't read yet
    const { data: unread, error: fetchErr } = await supabaseServer
      .from("messages")
      .select("id, read_by")
      .neq("sender", user)
      .not("read_by", "cs", `{${user}}`);

    if (fetchErr) return res.status(500).json({ error: fetchErr.message });

    if (unread && unread.length > 0) {
      // Update each with the user appended to read_by
      for (const msg of unread) {
        const newReadBy = [...(msg.read_by ?? []), user];
        await supabaseServer
          .from("messages")
          .update({ read_by: newReadBy })
          .eq("id", msg.id);
      }
    }

    return res.status(200).json({ success: true, marked: unread?.length ?? 0 });
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
