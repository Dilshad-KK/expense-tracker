import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";
import moment from "moment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const { user_id , date} = req.query;
        let query = supabase
            .from("habit_logs")
            .select("*")
            .eq("log_date", date);
        if (user_id) {
            query = query.eq("user_id", user_id)
        }
        const { data, error } = await query;

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    if (req.method === "POST") {
        const { habit_id, value, user_id ,date} = req.body;

        if (!habit_id || value < 0 || !user_id || !date) {
            return res.status(400).json({ error: "habit_id, value & user_id are required" });
        }

        // Check if the habit log already exists for this habit_id and user_id
        const { data: existingHabitLog, error: fetchError } = await supabase
            .from("habit_logs")
            .select("*")
            .eq("habit_id", habit_id)
            .eq("user_id", user_id)
            .eq("log_date",date)
            .single(); // `.single()` ensures only one record is returned

        if (existingHabitLog) {
            // If the log exists, update the record
            const { data: updatedHabitLogsData, error: updateError } = await supabase
                .from("habit_logs")
                .update({ value, log_date: date })  // Update with new value and log date
                .eq("habit_id", habit_id)
                .eq("user_id", user_id)
                .select("*");

            if (updateError) {
                return res.status(500).json({ error: updateError.message+"here" });
            }

            return res.status(200).json({ message: "habitLogs log item updated", data:updatedHabitLogsData });
        } else {
            // If the log doesn't exist, insert a new record
            const { data: habitLogsData, error: insertError } = await supabase
                .from("habit_logs")
                .insert([{ habit_id, log_date: date , value, user_id }])
                .select("*");

            if (insertError) {
                return res.status(500).json({ error: insertError.message+"tesy"});
            }

            return res.status(201).json({ message: "habitLogs log item added", data:habitLogsData });
        }
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