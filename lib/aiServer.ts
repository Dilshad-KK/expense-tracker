const normalizeString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

/**
 * Base URL for the AI server (Ollama-compatible `/api/generate`).
 *
 * Prefer `AI_URL` (e.g. Cloudflare Tunnel / cloudflared public URL),
 * fall back to legacy `OLLAMA_BASE_URL`, then localhost.
 */
export const getAiBaseUrl = (): string =>
  normalizeString(process.env.AI_URL) ||
  normalizeString(process.env.OLLAMA_BASE_URL) ||
  'http://localhost:11434';

