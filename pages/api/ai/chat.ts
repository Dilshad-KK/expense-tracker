import type { NextApiRequest, NextApiResponse } from 'next';
import { getAiBaseUrl } from '@/lib/aiServer';

const AI_REQUEST_TIMEOUT_MS = 60_000;

type FailureResponse = { success: false; message: string };

const normalizeString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    const failure: FailureResponse = { success: false, message: 'Method Not Allowed' };
    return res.status(405).json(failure);
  }

  const baseUrl = getAiBaseUrl();
  const upstreamUrl = `${baseUrl.replace(/\/$/, '')}/api/chat`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  try {
    const model = normalizeString(req.body?.model) || 'gemma2:2b';
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const stream = Boolean(req.body?.stream);

    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream }),
      signal: controller.signal,
    });

    // Pass through upstream status/body to the client for easier debugging.
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    const text = await upstream.text();
    return res.send(text);
  } catch {
    const failure: FailureResponse = { success: false, message: 'AI server is not up' };
    return res.status(503).json(failure);
  } finally {
    clearTimeout(timeoutId);
  }
}

