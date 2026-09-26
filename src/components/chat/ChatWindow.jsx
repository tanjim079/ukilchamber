import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const ChatWindow = ({ conversation }) => {

  const [messages,setMessages] = useState([]);
  const [text,setText] = useState("");
  const [user,setUser] = useState(null);

  useEffect(()=>{
    init();
  },[conversation]);

  const init = async ()=>{

    const { data:userData } = await supabase.auth.getUser();
    setUser(userData.user);

    if(!conversation?.id) return;

    loadMessages();

  };

  const loadMessages = async ()=>{

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id",conversation.id)
      .order("created_at",{ascending:true});

    setMessages(data || []);

  };

  const sendMessage = async ()=>{

    if(!text.trim()) return;

    await supabase.from("messages").insert({

      conversation_id:conversation.id,
      sender_id:user.id,
      content:text

    });

    await supabase
      .from("conversations")
      .update({
        last_message:text,
        updated_at:new Date()
      })
      .eq("id",conversation.id);

    setText("");

    loadMessages();

  };

  useEffect(()=>{

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event:"INSERT",
          schema:"public",
          table:"messages"
        },
        payload => {

          if(payload.new.conversation_id === conversation?.id){

            setMessages(prev=>[...prev,payload.new]);

          }

        }
      )
      .subscribe();

    return ()=> supabase.removeChannel(channel);

  },[conversation]);

  if(!conversation)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a chat
      </div>
    );

  return(

    <div className="flex flex-col flex-1">

      <div className="p-4 border-b bg-white font-semibold">
        Chat
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">

        {messages.map(m=>{

          const mine = m.sender_id === user?.id;

          return(

            <div
              key={m.id}
              className={`mb-3 flex ${mine ? "justify-end":"justify-start"}`}
            >

              <div
                className={`px-4 py-2 rounded-xl max-w-xs ${
                  mine
                  ? "bg-blue-600 text-white"
                  : "bg-white border"
                }`}
              >
                {m.content}
              </div>

            </div>

          );

        })}

      </div>

      <div className="border-t p-3 flex gap-2 bg-white">

        <input
          value={text}
          onChange={(e)=>setText(e.target.value)}
          placeholder="Type message..."
          className="flex-1 border rounded-lg p-2"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded-lg"
        >
          Send
        </button>

      </div>

    </div>

  );

};

export default ChatWindow;