import type { NextApiRequest, NextApiResponse } from 'next';
import moment from 'moment';
import { supabase } from '@/lib/supabase';
import { getAiBaseUrl } from '@/lib/aiServer';

type FailureResponse = { success: false; message: string };

const AI_REQUEST_TIMEOUT_MS = 60_000;

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

type LoanRow = {
  id: number;
  title: string | null;
  total_insts: number | string | null;
  total_amount: number | string | null;
  currency: string | null;
  date_started: string | null;
  status: string | null;
  times?: number;
};

type LoanDetailRow = {
  loan_id: number | string;
  due_date: string | null;
  amount: number | string | null;
  status: string | null;
};

const toNumber = (value: unknown): number | null => {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : null;
};

const formatAmount = (value: number) => {
  if (!Number.isFinite(value)) return '0';
  const rounded = Math.round(value * 100) / 100;
  return rounded.toLocaleString(undefined, {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    const failure: FailureResponse = { success: false, message: 'Method Not Allowed' };
    return res.status(405).json(failure);
  }

  const model = normalizeString(req.query?.model) || normalizeString(process.env.OLLAMA_MODEL) || 'gemma2:2b';

  const { data: loans, error: loansError } = await supabase
    .from('loans')
    .select('id,title,total_insts,total_amount,currency,date_started,status')
    .order('date_started', { ascending: false });

  if (loansError) {
    const failure: FailureResponse = { success: false, message: loansError.message };
    return res.status(500).json(failure);
  }

  const loanRows = (loans || []) as LoanRow[];
  const ids = loanRows.map(l => l.id).filter(Boolean);

  // Fetch all details for these loans (minimal fields) and compute:
  // - paid count
  // - next due (first non-paid)
  const { data: details, error: detailsError } = await supabase
    .from('loanDetails')
    .select('loan_id,due_date,amount,status')
    .in('loan_id', ids);

  if (detailsError) {
    const failure: FailureResponse = { success: false, message: detailsError.message };
    return res.status(500).json(failure);
  }

  const byLoan: Record<string, { paid: number; nextDue: string | null; nextAmount: number | null }> = {};
  for (const row of (details || []) as LoanDetailRow[]) {
    const key = String(row.loan_id);
    const bucket = (byLoan[key] ||= { paid: 0, nextDue: null, nextAmount: null });

    if (row.status === 'paid') bucket.paid += 1;

    // pick earliest due_date among non-paid statuses
    if (row.status !== 'paid' && row.due_date) {
      if (!bucket.nextDue || new Date(row.due_date).getTime() < new Date(bucket.nextDue).getTime()) {
        bucket.nextDue = row.due_date;
        bucket.nextAmount = toNumber(row.amount);
      }
    }
  }

  const snapshot = loanRows.map(l => {
    const key = String(l.id);
    const paid = byLoan[key]?.paid ?? (typeof l.times === 'number' ? l.times : 0);
    const totalInsts = toNumber(l.total_insts) ?? 0;
    const totalAmount = toNumber(l.total_amount) ?? null;
    const remainingInsts = Math.max(0, totalInsts - paid);
    const nextDue = byLoan[key]?.nextDue ?? null;
    const nextAmount = byLoan[key]?.nextAmount ?? null;

    return {
      id: l.id,
      title: normalizeString(l.title) || null,
      currency: normalizeString(l.currency) || null,
      totalInsts,
      paidInsts: paid,
      remainingInsts,
      totalAmount,
      dateStarted: l.date_started || null,
      status: normalizeString(l.status) || null,
      nextDue,
      nextAmount,
    };
  });

  // Deterministic totals (avoid AI hallucinations for numbers).
  const outstandingByCurrency: Record<string, number> = {};
  const perLoan = snapshot.map(loan => {
    const totalAmount = loan.totalAmount ?? null;
    const totalInsts = loan.totalInsts || 0;
    const paidInsts = loan.paidInsts || 0;
    const remainingInsts = loan.remainingInsts || 0;
    const currency = normalizeString(loan.currency) || 'UNKNOWN';

    let outstanding: number | null = null;
    if (totalAmount && totalInsts > 0) {
      outstanding = totalAmount * (remainingInsts / totalInsts);
      if (!Number.isFinite(outstanding)) outstanding = null;
    }

    // If next amount isn't available, approximate from totalAmount/totalInsts.
    let nextAmount = loan.nextAmount ?? null;
    if ((!nextAmount || !Number.isFinite(nextAmount)) && totalAmount && totalInsts > 0) {
      nextAmount = totalAmount / totalInsts;
    }

    return {
      id: loan.id,
      title: loan.title,
      status: loan.status,
      currency,
      dateStarted: loan.dateStarted,
      paidInsts,
      totalInsts,
      remainingInsts,
      totalAmount,
      outstanding,
      nextDue: loan.nextDue,
      nextAmount,
    };
  });

  for (const loan of perLoan) {
    const totalAmount = loan.totalAmount ?? null;
    if (!totalAmount || !loan.totalInsts) continue;
    if (loan.outstanding == null) continue;
    outstandingByCurrency[loan.currency] = (outstandingByCurrency[loan.currency] || 0) + loan.outstanding;
  }

  const loansWithNextDue = perLoan
    .filter(l => l.nextDue)
    .map(l => ({ ...l, nextDueTs: new Date(l.nextDue as string).getTime() }))
    .filter(l => Number.isFinite(l.nextDueTs));

  loansWithNextDue.sort((a, b) => a.nextDueTs - b.nextDueTs);
  const nextDueDate = loansWithNextDue.length ? (loansWithNextDue[0].nextDue as string) : null;
  const nextDueItems = nextDueDate
    ? loansWithNextDue
        .filter(l => l.nextDue === nextDueDate)
        .slice(0, 10)
        .map(l => ({
          id: l.id,
          title: l.title,
          currency: l.currency,
          amount: l.nextAmount,
          date: l.nextDue,
        }))
    : [];

  const overviewLines: string[] = [];
  overviewLines.push(`Loans: ${snapshot.length}`);
  if (Object.keys(outstandingByCurrency).length) {
    const parts = Object.entries(outstandingByCurrency)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([cur, amt]) => `${cur} ${formatAmount(amt)}`);
    overviewLines.push(`Approx outstanding: ${parts.join(' · ')}`);
  } else {
    overviewLines.push('Approx outstanding: (not enough data)');
  }
  if (nextDueDate) {
    overviewLines.push(
      `Next due: ${moment(nextDueDate).format('YYYY-MM-DD')}${nextDueItems.length ? ` (${nextDueItems.length} loan${nextDueItems.length > 1 ? 's' : ''})` : ''}`
    );
  } else {
    overviewLines.push('Next due: (none found)');
  }
  const overview = overviewLines.join('\n');

  // AI: qualitative insights only (no recalculating totals).
  const prompt = [
    'You are a personal finance assistant.',
    'You will be given a loan snapshot plus precomputed totals.',
    '',
    'Return STRICT JSON ONLY (no markdown), with this exact shape:',
    '{',
    '  "highlights": ["..."],',
    '  "risks": ["..."],',
    '  "actions": ["..."],',
    '  "perLoanNotes": [{ "id": 123, "note": "..." }]',
    '}',
    '',
    'Rules:',
    '- Do NOT change or restate numeric totals; focus on qualitative observations and suggestions.',
    '- Use only the provided data; do not invent interest rates.',
    '- Keep each bullet short and practical.',
    '',
    'TOTALS (do not recompute):',
    JSON.stringify(
      {
        generatedAt: moment().toISOString(),
        totalLoans: snapshot.length,
        outstandingByCurrency,
        nextDue: { date: nextDueDate, items: nextDueItems },
      },
      null,
      2
    ),
    '',
    'LOANS (per-loan computed fields):',
    JSON.stringify({ loans: perLoan.slice(0, 60) }, null, 2),
  ].join('\n');

  const baseUrl = getAiBaseUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      const failure: FailureResponse = { success: false, message: 'AI server is not up' };
      return res.status(503).json(failure);
    }

    const data = (await upstream.json()) as any;
    const rawText = typeof data?.message?.content === 'string' ? data.message.content : '';
    const parsed = rawText ? extractFirstJsonObject(rawText) : null;

    const ai =
      parsed && typeof parsed === 'object'
        ? parsed
        : {
            highlights: [],
            risks: [],
            actions: [],
            perLoanNotes: [],
          };

    return res.status(200).json({
      success: true,
      overview,
      totals: {
        totalLoans: snapshot.length,
        outstandingByCurrency,
        nextDue: { date: nextDueDate, items: nextDueItems },
      },
      loans: perLoan,
      ai,
      rawAiText: rawText && (!parsed || typeof parsed !== 'object') ? rawText : undefined,
    });
  } catch {
    const failure: FailureResponse = { success: false, message: 'AI server is not up' };
    return res.status(503).json(failure);
  } finally {
    clearTimeout(timeoutId);
  }
}
