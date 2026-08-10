import { getAiBaseUrl } from '@/lib/aiServer';
import { categoryIcons } from '@/utils/categoryMapper';

const AI_REQUEST_TIMEOUT_MS = 15_000;

const normalizeString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const safeJsonParse = (text: string): unknown | null => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const extractFirstJsonObject = (text: string): unknown | null => {
  const trimmed = text.trim();
  const direct = safeJsonParse(trimmed);
  if (direct) return direct;

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  return safeJsonParse(trimmed.slice(firstBrace, lastBrace + 1));
};

export type ExpenseSuggestInput = {
  amount?: number | string | null;
  note: string;
  type?: string | null;
};

export type ExpenseSuggestOutput = {
  normalizedNote: string;
  categoryKey: string;
  confidence: number; // 0..1
};

const allowedCategoryKeys = new Set<string>([
  ...Object.keys(categoryIcons),
  'other',
]);

export async function suggestExpenseWithAi(
  input: ExpenseSuggestInput
): Promise<ExpenseSuggestOutput | null> {
  const note = normalizeString(input.note);
  if (!note) return null;

  const baseUrl = getAiBaseUrl();
  if (!baseUrl) return null;

  const amount =
    input.amount == null
      ? ''
      : typeof input.amount === 'number'
        ? String(input.amount)
        : String(input.amount);

  const type = normalizeString(input.type) || '';
  const categories = Array.from(allowedCategoryKeys);

  const prompt = [
    'You are an assistant for an expense tracker.',
    'Given an expense NOTE (merchant/description), return a cleaned, normalized description and a best-fit category key.',
    '',
    'Return STRICT JSON ONLY with this exact shape:',
    '{ "normalizedNote": "", "categoryKey": "other", "confidence": 0.0 }',
    '',
    'Rules:',
    '- normalizedNote should be short (<= 60 chars), title-cased, no emojis.',
    '- Remove repeated IDs, timestamps, and extra punctuation.',
    '- Keep important identifiers (e.g. "Nesto", "Talabat", "Amazon").',
    '- categoryKey MUST be one of the allowed keys provided.',
    '- confidence must be between 0 and 1.',
    '',
    `Allowed category keys: ${categories.join(', ')}`,
    '',
    `AMOUNT: ${amount}`,
    `TYPE: ${type}`,
    `NOTE: ${note}`,
  ].join('\n');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: normalizeString(process.env.OLLAMA_MODEL) || 'gemma2:2b',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!upstream.ok) return null;

    const data = (await upstream.json()) as any;
    const rawText = typeof data?.message?.content === 'string' ? data.message.content : '';
    const parsed = rawText ? extractFirstJsonObject(rawText) : null;
    if (!parsed || typeof parsed !== 'object') return null;

    const obj = parsed as Record<string, unknown>;
    const normalizedNote = normalizeString(obj.normalizedNote);
    const categoryKey = normalizeString(obj.categoryKey) || 'other';
    const confidenceNum = typeof obj.confidence === 'number' ? obj.confidence : Number(obj.confidence);
    const confidence = Number.isFinite(confidenceNum)
      ? Math.max(0, Math.min(1, confidenceNum))
      : 0;

    if (!normalizedNote) return null;
    if (!allowedCategoryKeys.has(categoryKey)) return null;

    // Keep it compact
    const clipped = normalizedNote.length > 60 ? normalizedNote.slice(0, 60).trim() : normalizedNote;

    return { normalizedNote: clipped, categoryKey, confidence };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
