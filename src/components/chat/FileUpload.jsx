import { supabase } from "../../services/supabaseClient";

const FileUpload = ({conversation})=>{

const upload = async (e)=>{

const file = e.target.files[0];

const { data:userData } = await supabase.auth.getUser();

const path = `chat/${Date.now()}-${file.name}`;

await supabase.storage
.from("chat-files")
.upload(path,file);

const { data } = supabase.storage
.from("chat-files")
.getPublicUrl(path);

await supabase.from("messages").insert({

conversation_id:conversation.id,
sender_id:userData.user.id,
file_url:data.publicUrl

});

};

return(

<input
type="file"
onChange={upload}
className="border p-1"
>

</input>

);

};

export default FileUpload;