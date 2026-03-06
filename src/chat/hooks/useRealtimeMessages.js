import { useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function useRealtimeMessages(conversationId, setMessages) {

  useEffect(() => {

    if (!conversationId) return;

    async function fetchMessages() {

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at");

      if (!error) {
        setMessages(data || []);
      }

    }

    const channel = supabase
      .channel("chat-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {

          // Reload messages instead of pushing payload
          fetchMessages();

        }
      )
      .subscribe();

    // initial load
    fetchMessages();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [conversationId, setMessages]);

}