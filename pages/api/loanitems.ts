import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { loanId } = req.query;
    const { data, error } = await supabase
    .from("loanDetails")
    .select("*")
    .eq("loan_id", loanId)
    .order("due_date", { ascending: true })

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    const { id, status, due_date } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Installment ID is required" });
    }

    const { data, error } = await supabase
      .from("loanDetails")
      .update({ status, due_date })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: "Installment updated successfully", data });
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}