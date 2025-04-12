import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";
import moment from "moment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { loanId } = req.query;
    let query = supabase
      .from("loans")
      .select("*")
      .order("date_started", { ascending: false });
    if (loanId) {
      query = query.eq("id", loanId)
    }
    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {

    const { title, totalInsts, totalAmount, currency, dateStarted, status } = req.body;

    if (!title || !totalInsts || !totalAmount || !currency || !dateStarted || !status)

      return res.status(400).json({ error: "title, totalInsts, totalAmount, currency, dateStarted and status are required" });

    const { data: loanData, error: loanError } = await supabase
      .from("loans")
      .insert([{ title, total_insts: totalInsts, total_amount: totalAmount, currency, date_started: dateStarted, status }])
      .select();


      if (loanData?.length) {
        const loan = loanData[0];
      
        for (let i = 0; i < loan.total_insts; i++) {
          const dueDate = moment(loan.date_started).add(i * 31, "days").toISOString();
          const { error: detailsError } = await supabase.from("loanDetails").insert([
            {
              loan_id: loan.id,
              amount: Number((loan.total_amount / loan.total_insts).toFixed(2)),
              due_date: dueDate,
              status: loan.status,
            }
          ]);
      
          if (detailsError) {
            console.error(`Error inserting detail for installment ${i + 1}:`, detailsError.message);
            await supabase.from("loans").delete().eq("id", loan.id);
            return res.status(500).json({ error: detailsError.message });
          }
        }
      }

    if (loanError) return res.status(500).json({ error: loanError.message });
    return res.status(201).json({ message: "Loan added", loanData });
  }


  if (req.method === "PUT") {
    const { id, title, totalInsts, totalAmount, currency, dateStarted, status } = req.body;

    if (!id || !title || !totalInsts || !totalAmount || !currency || !dateStarted || !status) {
      return res.status(400).json({ error: "id, title, totalInsts, totalAmount, currency, dateStarted and status are required" });
    }

    const { error: updateError } = await supabase
      .from("loans")
      .update({
        title,
        total_insts: totalInsts,
        total_amount: totalAmount,
        currency,
        date_started: dateStarted,
        status
      })
      .eq("id", id);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    // Optional: Delete and re-insert all related loanDetails
    await supabase.from("loanDetails").delete().eq("loan_id", id);

    for (let i = 0; i < totalInsts; i++) {
      const dueDate = moment(dateStarted).add(i * 30, "days").toISOString();

      const { error: detailsError } = await supabase.from("loanDetails").insert([
        {
          loan_id: id,
          amount: totalAmount / totalInsts,
          due_date: dueDate,
          status: status,
        }
      ]);

      if (detailsError) {
        return res.status(500).json({ error: `Loan updated but failed to update installment: ${detailsError.message}` });
      }
    }

    return res.status(200).json({ message: "Loan updated successfully" });
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