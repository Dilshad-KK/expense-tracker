import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const { id } = req.query;
        let query = supabase
            .from("checklist")
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

        const { title, priority, user, checked } = req.body;

        if (!title || !priority || !user || checked === undefined)

            return res.status(400).json({ error: "title, priority , checked and user are required" });

        const { data: checklistData, error: checklistError } = await supabase
            .from("checklist")
            .insert([{ title, priority, user, checked }])
            .select();

        if (checklistError) return res.status(500).json({ error: checklistError.message });
        return res.status(201).json({ message: "Checklist item added", checklistData });
    }


    if (req.method === "PUT") {
        const { id, checked } = req.body;

        if (!id || checked === undefined) {
            return res.status(400).json({ error: "id & checked are required" });
        }

        const { error: updateError } = await supabase
            .from("checklist")
            .update({
                checked: checked,
            })
            .eq("id", id);

        if (updateError) {
            return res.status(500).json({ error: updateError.message });
        }

        return res.status(200).json({ message: "Checklist updated successfully" });
    }

    //   if (req.method === "DELETE") {
    //     const { id } = req.query;

    //     if (!id || typeof id !== "string") {
    //       return res.status(400).json({ error: "Invalid ID" });
    //     }

    //     try {

    //       const { error: DiscError } = await supabase
    //         .from("discussions")
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