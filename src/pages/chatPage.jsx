import { useParams, useNavigate } from "react-router-dom";
import ChatInterface from "../components/chat/ChatInterface";
import { supabase } from "../services/supabaseClient";
import { useEffect, useState } from "react";

const ChatPage = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [user,setUser] = useState(null);
  const [chatName,setChatName] = useState("");

  useEffect(()=>{

    loadUser();
    loadConversation();

  },[id]);

  const loadUser = async () => {

    const { data } = await supabase.auth.getUser();
    setUser(data.user);

  };

  const loadConversation = async () => {

    const { data } = await supabase
      .from("conversations")
      .select(`
        client_id,
        lawyer_id,
        clients(first_name,last_name),
        lawyers(first_name,last_name)
      `)
      .eq("id",id)
      .single();

    if(!data) return;

    const { data:userData } = await supabase.auth.getUser();
    const currentUser = userData.user;

    if(currentUser.id === data.client_id){

      const lawyer = data.lawyers;

      setChatName(
        `${lawyer?.first_name || ""} ${lawyer?.last_name || ""}`
      );

    }else{

      const client = data.clients;

      setChatName(
        `${client?.first_name || ""} ${client?.last_name || ""}`
      );

    }

  };

  if(!user){

    return(
      <div className="p-10 text-center">
        Loading chat...
      </div>
    );

  }

  return(

    <div className="max-w-4xl mx-auto p-4">

      {/* TOP BAR */}

      <div className="flex items-center justify-between mb-4">

        <button
          onClick={()=>navigate(-1)}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          ← Back
        </button>

      </div>

      {/* CHAT CARD */}

      <div className="bg-white border rounded-lg shadow">

        {/* CHAT HEADER */}

        <div className="flex justify-between items-center border-b px-4 py-3">

          <h2 className="font-semibold text-lg">
            Chat
          </h2>

          {/* NAME HERE */}

          <div className="font-medium text-gray-700">
            {chatName}
          </div>

        </div>

        {/* CHAT BODY */}

        <div className="p-4">

          <ChatInterface
            conversationId={id}
            userId={user.id}
          />

        </div>

      </div>

    </div>

  );

};

export default ChatPage;