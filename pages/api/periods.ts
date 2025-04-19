import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { id } = req.query;

    if (req.method === "GET") {
        let query = supabase
            .from("periods")
            .select("*")
            .order("created_at", { ascending: false });
        if (id) {
            query = query.eq("id", id)
        }
        const { data, error } = await query;

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    if (req.method === "POST") {
        const { last_period_date, cycle_length } = req.body;
        if (!last_period_date || !cycle_length)
            return res.status(400).json({ error: "Missing fields" });

        const { data, error } = await supabase.from("periods").insert([
            {
                last_period_date,
                cycle_length,
            },
        ]);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    }

    if (req.method === "PUT") {
        const { last_period_date, cycle_length } = req.body;
        if (!id) return res.status(400).json({ error: "Missing ID" });

        const { data, error } = await supabase
            .from("periods")
            .update({ last_period_date, cycle_length })
            .eq("id", id);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }


    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}