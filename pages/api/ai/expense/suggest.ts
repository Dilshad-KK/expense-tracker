import type { NextApiRequest, NextApiResponse } from 'next';
import { suggestExpenseWithAi } from '@/lib/aiExpenseSuggest';

type ResponseBody =
  | { success: true; suggestion: { normalizedNote: string; categoryKey: string; confidence: number } }
  | { success: false; message: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseBody>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const note = typeof req.body?.note === 'string' ? req.body.note : '';
  if (!note.trim()) {
    return res.status(400).json({ success: false, message: 'Missing note' });
  }

  const suggestion = await suggestExpenseWithAi({
    note,
    amount: req.body?.amount,
    type: req.body?.type,
  });

  if (!suggestion) {
    return res.status(503).json({ success: false, message: 'AI server is not up' });
  }

  return res.status(200).json({ success: true, suggestion });
}

