import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/lib/supabaseServer";

type SubscriptionRow = {
  id: number;
  name: string;
  renewal_date: string | null;
  status?: string | null;
};

function ymd(d: Date) {
  const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function diffDays(a: Date, b: Date) {
  const a0 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const b0 = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  const ms = a0.getTime() - b0.getTime();
  return Math.round(ms / 86400000);
}

async function alreadyCreated(marker: string) {
  const { data, error } = await supabaseServer
    .from("notifications")
    .select("id, body")
    .ilike("body", `%${marker}%`)
    .limit(1);
  if (error) return false;
  return Array.isArray(data) && data.length > 0;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cronSecret = process.env.CRON_SECRET || "";
  const authz = req.headers["authorization"] || req.headers["x-cron-secret"];
  const authorized = cronSecret
    ? typeof authz === "string" && (authz === cronSecret || authz === `Bearer ${cronSecret}`)
    : true;
  if (!authorized) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { data: subs, error: serr } = await supabaseServer
      .from("subscriptions")
      .select("id, name, renewal_date, status");

    if (serr) return res.status(500).json({ error: serr.message });
    if (!subs || subs.length === 0) return res.status(200).json({ ok: true, reason: "no subscriptions" });

    const today = new Date();
    const created: Array<{ id: number; title: string }> = [];
    const skipped: Array<{ id: number; reason: string }> = [];

    for (const sub of subs as SubscriptionRow[]) {
      if (!sub.renewal_date) {
        skipped.push({ id: sub.id, reason: "no renewal_date" });
        continue;
      }
      if ((sub.status || "").toLowerCase() === "cancelled") {
        skipped.push({ id: sub.id, reason: "cancelled" });
        continue;
      }

      const renewal = new Date(sub.renewal_date);
      if (isNaN(renewal.getTime())) {
        skipped.push({ id: sub.id, reason: "invalid date" });
        continue;
      }

      const daysLeft = diffDays(renewal, today);
      // We only notify at T-2 days and T-0 day (today).
      if (daysLeft !== 2 && daysLeft !== 0) {
        skipped.push({ id: sub.id, reason: `daysLeft=${daysLeft}` });
        continue;
      }

      const renewalStr = ymd(renewal);
      const marker = `${sub.name} renews ${daysLeft === 0 ? "today" : "in 2 days"} (${renewalStr})`;
      const dup = await alreadyCreated(marker);
      if (dup) {
        skipped.push({ id: sub.id, reason: "duplicate" });
        continue;
      }

      const title = daysLeft === 0 ? `${sub.name} renews today` : `${sub.name} renews in 2 days`;
      const body = marker;
      const icon = "/assets/icon-192x192.png";
      const link = "/subscriptions";

      const { error: nerr } = await supabaseServer
        .from("notifications")
        .insert([{ title, body, icon, link, read: false }]);
      if (nerr) {
        skipped.push({ id: sub.id, reason: nerr.message });
        continue;
      }

      created.push({ id: sub.id, title });

      // Best-effort webpush broadcast
      try {
        const proto = (req.headers["x-forwarded-proto"] as string) || "https";
        const host = req.headers.host;
        const base = process.env.NEXT_PUBLIC_BASE_URL || (host ? `${proto}://${host}` : "");
        if (base) {
          await fetch(`${base}/api/webpush/broadcast`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, body, icon, click_action: link }),
          });
        }
      } catch {
        // Ignore push errors
      }
    }

    return res.status(200).json({ ok: true, created, skipped });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Unexpected error" });
  }
}
