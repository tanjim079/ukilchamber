import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useSearchParams } from "react-router-dom";

const Chat = () => {

  const [searchParams] = useSearchParams();
  const urlConversation = searchParams.get("conversation");

  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if(user) loadConversations();
  }, [user]);

  useEffect(() => {
    if(selectedConversation) loadMessages(selectedConversation.id);
  }, [selectedConversation]);

  const loadUser = async () => {

    const { data } = await supabase.auth.getUser();
    setUser(data?.user);

  };

  const loadConversations = async () => {

    const { data } = await supabase
      .from("conversations")
      .select(`
        id,
        lawyer:lawyer_id(first_name,last_name)
      `)
      .eq("client_id", user.id);

    setConversations(data || []);

    if(urlConversation){

      const active = data.find(c => c.id === urlConversation);

      if(active){
        setSelectedConversation(active);
      }

    }

  };

  const loadMessages = async (conversationId) => {

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at");

    setMessages(data || []);

  };

  const sendMessage = async () => {

    if(!message.trim()) return;

    await supabase.from("messages").insert({
      conversation_id: selectedConversation.id,
      sender_id: user.id,
      message: message
    });

    setMessage("");

    loadMessages(selectedConversation.id);

  };

  const openConversation = (conv) => {

    setSelectedConversation(conv);

    window.history.replaceState(
      null,
      "",
      `/chat?conversation=${conv.id}`
    );

  };

  return (

    <div className="flex h-screen">

      {/* SIDEBAR */}

      <div className="w-80 border-r">

        <div className="p-4 font-bold border-b">
          Chats
        </div>

        {conversations.map(conv => {

          const lawyerName =
            conv.lawyer?.first_name + " " + conv.lawyer?.last_name;

          return (

            <div
              key={conv.id}
              onClick={()=>openConversation(conv)}
              className={`p-4 cursor-pointer border-b hover:bg-gray-100
                ${selectedConversation?.id === conv.id ? "bg-gray-200" : ""}
              `}
            >

              {lawyerName}

            </div>

          );

        })}

      </div>

      {/* CHAT AREA */}

      <div className="flex-1 flex flex-col">

        {/* HEADER */}

        <div className="p-4 border-b font-semibold">

          {selectedConversation
            ? selectedConversation.lawyer?.first_name +
              " " +
              selectedConversation.lawyer?.last_name
            : "Select a chat"}

        </div>

        {/* MESSAGES */}

        <div className="flex-1 p-4 overflow-y-auto space-y-3">

          {messages.map(msg => (

            <div
              key={msg.id}
              className={`max-w-md p-3 rounded-lg ${
                msg.sender_id === user?.id
                  ? "ml-auto bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >

              {msg.message}

            </div>

          ))}

        </div>

        {/* MESSAGE INPUT */}

        {selectedConversation && (

          <div className="p-4 border-t flex gap-2">

            <input
              value={message}
              onChange={(e)=>setMessage(e.target.value)}
              className="flex-1 border rounded px-3 py-2"
              placeholder="Type message..."
            />

            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Send
            </button>

          </div>

        )}

      </div>

    </div>

  );

};

export default Chat;