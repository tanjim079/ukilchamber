import { supabase } from "../lib/supabase";

export const getLawyers = async () => {
  try {
    const { data, error } = await supabase
      .from("lawyers")
      .select("*");   // 🔥 REMOVE profiles JOIN

    if (error) {
      console.error("Supabase error:", error);
      return [];
    }

    console.log("Lawyers from DB:", data);
    return data;

  } catch (err) {
    console.error(err);
    return [];
  }
};