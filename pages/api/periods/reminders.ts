import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';

// Helper: floor a date to YYYY-MM-DD in local time
function ymd(d: Date) {
  const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Helper: difference in whole days between two dates (a - b)
function diffDays(a: Date, b: Date) {
  const a0 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const b0 = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  const ms = a0.getTime() - b0.getTime();
  return Math.round(ms / 86400000);
}

async function alreadyCreated(bodyContains: string) {
  const { data, error } = await supabaseServer
    .from('notifications')
    .select('id, body')
    .ilike('body', `%${bodyContains}%`)
    .limit(1);
  if (error) return false;
  return Array.isArray(data) && data.length > 0;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Secure with a simple shared secret for cron invocations
  const cronSecret = process.env.CRON_SECRET || '';
  const authz = req.headers['authorization'] || req.headers['x-cron-secret'];
  const authorized = cronSecret
    ? (typeof authz === 'string' && (authz === cronSecret || authz === `Bearer ${cronSecret}`))
    : true; // allow local/manual calls if no secret configured

  if (!authorized) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Get the most recent period config
    const { data: periods, error: perr } = await supabaseServer
      .from('periods')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    if (perr) return res.status(500).json({ error: perr.message });
    if (!periods || periods.length === 0) return res.status(200).json({ ok: true, reason: 'no period config' });

    const { last_period_date, cycle_length } = periods[0] as { last_period_date: string; cycle_length: number };
    if (!last_period_date || !cycle_length) return res.status(200).json({ ok: true, reason: 'incomplete period config' });

    const lastDate = new Date(last_period_date);
    if (isNaN(lastDate.getTime())) return res.status(200).json({ ok: true, reason: 'invalid last_period_date' });

    // Compute the next expected period from last_period_date + cycle_length (in days)
    const next = new Date(lastDate);
    next.setDate(next.getDate() + Number(cycle_length));

    const today = new Date();
    const daysLeft = diffDays(next, today);

    // Only act for T-3 and T-1 notifications
    if (daysLeft !== 3 && daysLeft !== 1) {
      return res.status(200).json({ ok: true, skipped: true, daysLeft });
    }

    const nextStr = ymd(next);
    const marker = `Period ${daysLeft === 1 ? 'tomorrow' : 'in 3 days'} (${nextStr})`;

    // Prevent duplicates by checking body contains the marker
    const dup = await alreadyCreated(marker);
    if (dup) {
      return res.status(200).json({ ok: true, duplicate: true, marker });
    }

    // Create a notification row
    const title = daysLeft === 1 ? 'Period Expected Tomorrow' : 'Period In 3 Days';
    const body = `${marker}`;
    const icon = '/assets/icon-192x192.png';
    const link = '/periods';

    const { error: nerr } = await supabaseServer
      .from('notifications')
      .insert([{ title, body, icon, link, read: false }]);
    if (nerr) return res.status(500).json({ error: nerr.message });

    // Fire web push broadcast (best-effort)
    try {
      const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
      const host = req.headers.host;
      const base = process.env.NEXT_PUBLIC_BASE_URL || (host ? `${proto}://${host}` : '');
      if (base) {
        await fetch(`${base}/api/webpush/broadcast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, body, icon, click_action: link }),
        });
      }
    } catch {
      // Ignore network issues in cron execution
    }

    return res.status(200).json({ ok: true, created: true, title, body, next: nextStr, daysLeft });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' });
  }
}
