import { supabase } from "../lib/supabase";

export async function getOrCreateConversation(clientId, lawyerId) {

  // check existing conversation
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("client_id", clientId)
    .eq("lawyer_id", lawyerId)
    .single();

  if (existing) {
    return existing;
  }

  // create new conversation
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      client_id: clientId,
      lawyer_id: lawyerId
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}