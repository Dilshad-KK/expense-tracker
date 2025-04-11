import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { loanId } = req.query;
    let query = supabase
      .from("loans")
      .select("*")
      .order("created_at", { ascending: false });
    if (loanId) {
      query = query.eq("id", loanId)
    }
    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}