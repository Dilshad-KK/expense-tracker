import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Fetch expenses
    const { data, error } = await supabase
    .from("ibuexpenses")
    .select("*")
    .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    // Insert a new expense
    const { amount, note , type, balance } = req.body;

    if (!amount || !note || !type)
      return res.status(400).json({ error: "Amount, note, and type are required" });

    const { data, error } = await supabase
      .from("ibuexpenses")
      .insert([{ amount, note, type, balance }])
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ message: "Expense added", data });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid ID" });
    }

    try {
      const { error } = await supabase.from("ibuexpenses").delete().eq("id", id);

      if (error) {
        console.error("Delete Error:", error.message);
        return res.status(500).json({ error: "Failed to delete the expense" });
      }

      return res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
      console.error("Unexpected Error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}