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

  if (req.method === "POST") {

    const { title, totalInsts, paidInsts, totalAmount, currency, dateStarted, status } = req.body;

    if (!title || !totalInsts || !paidInsts || !totalAmount || !currency || !dateStarted || !status)
      return res.status(400).json({ error: "title, totalInsts, paidInsts, totalAmount, currency, dateStarted and status are required" });

    const { data, error } = await supabase
      .from("loans")
      .insert([{ title, total_insts:totalInsts, paid_insts:paidInsts, total_amount:totalAmount, currency, date_started:dateStarted, status }])
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ message: "Loan added", data });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
  
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid ID" });
    }
  
    try {
      // First delete dependent records
      const { error: detailsError } = await supabase
        .from("loanDetails")
        .delete()
        .eq("loan_id", id);
  
      if (detailsError) {
        console.error("LoanDetails Delete Error:", detailsError.message);
        return res.status(500).json({ error: "Failed to delete loan details" });
      }
  
      // Then delete the loan itself
      const { error: loanError } = await supabase
        .from("loans")
        .delete()
        .eq("id", id);
  
      if (loanError) {
        console.error("Loan Delete Error:", loanError.message);
        return res.status(500).json({ error: "Failed to delete the loan" });
      }
  
      return res.status(200).json({ message: "Loan and details deleted successfully" });
    } catch (error) {
      console.error("Unexpected Error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}