import { supabase } from "../../lib/supabase";

export async function sendMessage(
  conversationId,
  senderType,
  senderId,
  text
) {

  const { error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_type: senderType,
      sender_id: senderId,
      content: text
    });

  if (error) throw error;
}