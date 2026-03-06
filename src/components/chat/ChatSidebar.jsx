import { useEffect,useState } from "react";
import { supabase } from "../../lib/supabase";

const ChatSidebar = ({setSelectedConversation}) => {

const [conversations,setConversations] = useState([]);

useEffect(()=>{
loadChats();
},[]);

const loadChats = async ()=>{

const { data:userData } = await supabase.auth.getUser();
const user = userData.user;

const { data } = await supabase
.from("conversations")
.select("*")
.or(`client_id.eq.${user.id},lawyer_id.eq.${user.id}`)
.order("updated_at",{ascending:false});

setConversations(data || []);

};

return(

<div className="w-80 border-r bg-white">

<h2 className="p-4 font-bold text-lg border-b">
Chats
</h2>

{conversations.map(c=>(

<div
key={c.id}
onClick={()=>setSelectedConversation(c)}
className="p-4 hover:bg-gray-100 cursor-pointer"
>

Conversation {c.id.slice(0,6)}

</div>

))}

</div>

);

};

export default ChatSidebar;