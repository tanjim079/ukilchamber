import { supabase } from "../../lib/supabase";

export async function getOrCreateConversation(clientId, lawyerId) {

  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("client_id", clientId)
    .eq("lawyer_id", lawyerId)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      client_id: clientId,
      lawyer_id: lawyerId
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}