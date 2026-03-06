import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import useRealtimeMessages from "../../chat/hooks/useRealtimeMessages";
import { Paperclip } from "lucide-react";

const ChatInterface = ({ conversationId, userId }) => {

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [senderType, setSenderType] = useState(null);

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  useRealtimeMessages(conversationId, setMessages);

  // Detect sender type automatically
  useEffect(() => {

    async function detectSenderType() {

      const { data, error } = await supabase
        .from("conversations")
        .select("client_id, lawyer_id")
        .eq("id", conversationId)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      if (data.client_id === userId) {
        setSenderType("Client");
      } else if (data.lawyer_id === userId) {
        setSenderType("Lawyer");
      }

    }

    if (conversationId && userId) {
      detectSenderType();
    }

  }, [conversationId, userId]);



  // Load messages initially
  useEffect(() => {

    async function loadMessages() {

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at");

      if (error) {
        console.error("Load message error:", error);
        return;
      }

      setMessages(data || []);

    }

    loadMessages();

  }, [conversationId]);



  // Auto scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  function openFilePicker() {
    fileInputRef.current.click();
  }



  async function sendMessage() {

    try {

      if (!text.trim() && !file) return;

      let fileUrl = null;
      let content = text;

      // Upload file
      if (file) {

        const filePath = `chat/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          alert("File upload failed");
          return;
        }

        const { data: urlData } = supabase.storage
          .from("documents")
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        content = file.name;

      }


      // Insert message
      const { error: msgError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          sender_type: senderType,
          content: content,
          file_url: fileUrl
        });

      if (msgError) {
        console.error("Message insert error:", msgError);
        return;
      }



      // Get conversation for document save
      if (fileUrl) {

        const { data: conv } = await supabase
          .from("conversations")
          .select("client_id, lawyer_id")
          .eq("id", conversationId)
          .single();

        await supabase
          .from("documents")
          .insert({
            conversation_id: conversationId,
            client_id: conv.client_id,
            lawyer_id: conv.lawyer_id,
            file_name: file.name,
            file_url: fileUrl,
            uploaded_by: senderType
          });

      }

      setText("");
      setFile("");

    } catch (err) {

      console.error("Send message error:", err);

    }

  }



  return (

    <div className="max-w-3xl mx-auto p-6">

      {/* CHAT AREA */}

      <div className="border rounded p-4 h-[420px] overflow-y-auto bg-gray-50 space-y-3">

        {messages.map(msg => (

          <div
            key={msg.id}
            className={`flex ${
              msg.sender_id === userId
                ? "justify-end"
                : "justify-start"
            }`}
          >

            <div
              className={`px-3 py-2 rounded-lg shadow max-w-[70%] ${
                msg.sender_id === userId
                  ? "bg-blue-600 text-white"
                  : "bg-white"
              }`}
            >

              {msg.file_url ? (

                <a
                  href={msg.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  📎 {msg.content}
                </a>

              ) : msg.content}

            </div>

          </div>

        ))}

        <div ref={bottomRef}></div>

      </div>



      {/* INPUT AREA */}

      <div className="flex items-center gap-2 mt-4 border rounded px-2 py-2">

        {/* ATTACH FILE */}

        <button
          type="button"
          onClick={openFilePicker}
          className="text-gray-600 hover:text-blue-600"
        >
          <Paperclip size={20} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />


        {/* TEXT INPUT */}

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 outline-none"
        />


        {/* SEND BUTTON */}

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>

      </div>



      {/* FILE PREVIEW */}

      {file && (

        <div className="text-sm text-gray-600 mt-2">
          Attached: {file.name}
        </div>

      )}

    </div>

  );

};

export default ChatInterface;