import type { NextApiRequest, NextApiResponse } from 'next';
import { getAiBaseUrl } from '@/lib/aiServer';

type HealthResponse =
  | { success: true; message: string }
  | { success: false; message: string };

const AI_REQUEST_TIMEOUT_MS = 10_000;

export default async function handler(req: NextApiRequest, res: NextApiResponse<HealthResponse>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const baseUrl = getAiBaseUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  try {
    // Validate via `/api/chat` since that's what this app uses.
    const upstream = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma2:2b',
        messages: [{ role: 'user', content: 'Reply only with: AI server is working' }],
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!upstream.ok) return res.status(503).json({ success: false, message: 'AI server is not up' });

    return res.status(200).json({ success: true, message: 'AI server is working' });
  } catch {
    return res.status(503).json({ success: false, message: 'AI server is not up' });
  } finally {
    clearTimeout(timeoutId);
  }
}
