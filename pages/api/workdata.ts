import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

function toInt(value: unknown, fallback = 0) {
  const num = typeof value === "string" && value.trim() === "" ? NaN : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.trunc(num);
}

function toFloat(value: unknown, fallback = 0) {
  const num = typeof value === "string" && value.trim() === "" ? NaN : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return num;
}

function normalizeMonth(month: unknown) {
  if (typeof month !== "string") return "";
  const m = month.trim();
  if (!m) return "";
  // Accept YYYY-MM or YYYY-MM-DD
  if (/^\d{4}-\d{2}$/.test(m)) return `${m}-01`;
  return m;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { id, user } = req.query;

    let query = supabase.from("workdata").select("*").order("month", { ascending: false });

    const idValue = Array.isArray(id) ? id[0] : id;
    const userValue = Array.isArray(user) ? user[0] : user;

    if (idValue) query = query.eq("id", idValue);
    if (userValue) query = query.eq("user", userValue);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const {
      month,
      daysWorked,
      leaveTaken,
      annualLeaveTotal,
      annualLeaveRemaining,
      sickLeaveTaken,
      unpaidLeaveTaken,
      wfhDays,
      overtimeHours,
      notes,
      user,
    } = req.body ?? {};

    const monthDate = normalizeMonth(month);
    if (!monthDate || !user) {
      return res.status(400).json({ error: "month and user are required" });
    }

    const row = {
      month: monthDate,
      days_worked: toInt(daysWorked),
      leave_taken: toInt(leaveTaken),
      annual_leave_total: toInt(annualLeaveTotal),
      annual_leave_remaining: toInt(annualLeaveRemaining),
      sick_leave_taken: toInt(sickLeaveTaken),
      unpaid_leave_taken: toInt(unpaidLeaveTaken),
      wfh_days: toInt(wfhDays),
      overtime_hours: toFloat(overtimeHours),
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
      user,
    };

    const { data, error } = await supabase.from("workdata").insert([row]).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ message: "Work data added", data });
  }

  if (req.method === "PUT") {
    const {
      id,
      month,
      daysWorked,
      leaveTaken,
      annualLeaveTotal,
      annualLeaveRemaining,
      sickLeaveTaken,
      unpaidLeaveTaken,
      wfhDays,
      overtimeHours,
      notes,
      user,
    } = req.body ?? {};

    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    const monthDate = normalizeMonth(month);
    if (!monthDate) {
      return res.status(400).json({ error: "month is required" });
    }

    if (user !== undefined && user !== null && typeof user !== "string") {
      return res.status(400).json({ error: "user must be a string" });
    }

    const { error: updateError } = await supabase
      .from("workdata")
      .update({
        month: monthDate,
        days_worked: toInt(daysWorked),
        leave_taken: toInt(leaveTaken),
        annual_leave_total: toInt(annualLeaveTotal),
        annual_leave_remaining: toInt(annualLeaveRemaining),
        sick_leave_taken: toInt(sickLeaveTaken),
        unpaid_leave_taken: toInt(unpaidLeaveTaken),
        wfh_days: toInt(wfhDays),
        overtime_hours: toFloat(overtimeHours),
        notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
        ...(typeof user === "string" && user.trim() ? { user: user.trim() } : {}),
      })
      .eq("id", id);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({ message: "Work data updated successfully" });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const { error } = await supabase.from("workdata").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: "Work data deleted successfully" });
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
