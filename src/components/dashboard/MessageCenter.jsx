import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router-dom";

const MessageCenter = () => {

  const navigate = useNavigate();

  const [conversations,setConversations] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    getLawyer();
    
  },[]);

  const getLawyer = async () => {

    const { data } = await supabase.auth.getUser();

    const user = data?.user;

    if(!user) return;

    loadMessages(user.id);

  }

  const loadMessages = async (id) => {

    try{

      const { data,error } = await supabase
      .from("conversations")
      .select(`
        id,
        client_id,
        clients (
          first_name,
          last_name
        )
      `)
      .eq("lawyer_id",id);

      if(error) throw error;

      setConversations(data || []);

    }catch(err){

      console.error(err);

    }finally{

      setLoading(false);

    }

  }

  if(loading){

    return <div>Loading messages...</div>

  }

  if(conversations.length === 0){

    return <div>No client messages yet.</div>

  }

  return (

    <div className="space-y-4">

      {conversations.map((c)=>{

        const clientName =
        c.clients
        ? `${c.clients.first_name || ""} ${c.clients.last_name || ""}`
        : "Client";

        return(

          <div
          key={c.id}
          className="border p-4 rounded-lg flex justify-between items-center hover:shadow transition"
          >

            <div>

              <p className="font-semibold text-lg">
                {clientName}
              </p>

              <p className="text-sm text-gray-500">
                Sent you a message
              </p>

            </div>

            <button
            onClick={()=>navigate(`/chat/${c.id}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
            See Message
            </button>

          </div>

        )

      })}

    </div>

  )

}

export default MessageCenter;