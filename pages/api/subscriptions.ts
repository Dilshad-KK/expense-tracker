import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

const TABLE_NAME = "subscriptions";

function toNumber(value: any) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { id, user } = req.query;
    let query = supabase
      .from(TABLE_NAME)
      .select("*")
      .order("created_at", { ascending: false });

    if (id) query = query.eq("id", Array.isArray(id) ? id[0] : id);
    if (user) query = query.eq("user", Array.isArray(user) ? user[0] : user);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const {
      name,
      amount,
      currency,
      billingCycle,
      renewalDate,
      status = "active",
      notes = "",
      user,
    } = req.body || {};

    const parsedAmount = toNumber(amount);

    if (!name || parsedAmount === null || !currency || !billingCycle) {
      return res
        .status(400)
        .json({ error: "name, amount, currency and billingCycle are required" });
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([
        {
          name,
          amount: parsedAmount,
          currency,
          billing_cycle: billingCycle,
          renewal_date: renewalDate || null,
          status,
          notes,
          user: user || null,
        },
      ])
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ message: "Subscription added", data });
  }

  if (req.method === "PUT") {
    const {
      id,
      name,
      amount,
      currency,
      billingCycle,
      renewalDate,
      status,
      notes,
      user,
    } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    const updates: Record<string, any> = {};

    if (name !== undefined) updates.name = name;
    if (currency !== undefined) updates.currency = currency;
    if (billingCycle !== undefined) updates.billing_cycle = billingCycle;
    if (renewalDate !== undefined) updates.renewal_date = renewalDate || null;
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (user !== undefined) updates.user = user || null;
    if (amount !== undefined) {
      const parsedAmount = toNumber(amount);
      if (parsedAmount === null) {
        return res.status(400).json({ error: "amount must be a valid number" });
      }
      updates.amount = parsedAmount;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    const { error, data } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: "Subscription updated successfully", data });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: "Subscription deleted successfully" });
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
