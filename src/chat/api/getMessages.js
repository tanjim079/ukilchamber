import { supabase } from "../../lib/supabase";

export async function getMessages(conversationId) {

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at");

  if (error) throw error;

  return data;
}