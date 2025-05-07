import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const { user_id } = req.query;
        let query = supabase
            .from("habits")
            .select("*")
        if (user_id) {
            query = query.eq("user_id", user_id)
        }
        const { data, error } = await query;

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    if (req.method === "POST") {

        const { title, unit, total, user } = req.body;

        if (!title || !unit || !total || !user)

            return res.status(400).json({ error: "title, unit, total & user are required" });

        const { data: habitsData, error: habitsError } = await supabase
            .from("habits")
            .insert([{ title, unit, total, user_id : user }])
            .select();

        if (habitsError) return res.status(500).json({ error: habitsError.message });
        return res.status(201).json({ message: "habits item added", habitsData });
    }


    // if (req.method === "PUT") {
    //     const { id, checked } = req.body;

    //     if (!id || checked === undefined) {
    //         return res.status(400).json({ error: "id & checked are required" });
    //     }

    //     const { error: updateError } = await supabase
    //         .from("checklist")
    //         .update({
    //             checked: checked,
    //         })
    //         .eq("id", id);

    //     if (updateError) {
    //         return res.status(500).json({ error: updateError.message });
    //     }

    //     return res.status(200).json({ message: "Checklist updated successfully" });
    // }

    //   if (req.method === "DELETE") {
    //     const { id } = req.query;

    //     if (!id || typeof id !== "string") {
    //       return res.status(400).json({ error: "Invalid ID" });
    //     }

    //     try {

    //       const { error: DiscError } = await supabase
    //         .from("checklist")
    //         .delete()
    //         .eq("id", id);

    //       if (DiscError) {
    //         console.error("Discussion Delete Error:", DiscError.message);
    //         return res.status(500).json({ error: "Failed to delete the discussion" });
    //       }

    //       return res.status(200).json({ message: "Discussion deleted successfully" });
    //     } catch (error) {
    //       console.error("Unexpected Error:", error);
    //       return res.status(500).json({ error: "Internal Server Error" });
    //     }
    //   }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}