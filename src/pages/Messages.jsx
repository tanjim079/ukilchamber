import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChatBubbleLeftRightIcon, CalendarIcon, PaperClipIcon } from '@heroicons/react/24/solid';
import { supabase } from "../lib/supabase";

const Messages = () => {
  const { id } = useParams(); // lawyer id

  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);

  // 🔵 Fetch lawyer from Supabase
  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("lawyers")
          .select("*, profiles(*)")
          .eq("id", id)
          .single();

        if (error) throw error;

        setSelectedLawyer(data);

        // temporary starter message
        setMessages([
          {
            id: 1,
            sender: "lawyer",
            text: "Hello! How can I help you?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

      } catch (err) {
        console.error("Fetch lawyer error:", err);
        setSelectedLawyer(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLawyer();
  }, [id]);

  // auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // send message (temporary local)
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() && !file) return;

    const newMsg = {
      id: Date.now(),
      sender: "me",
      text: message,
      file: file ? { name: file.name, url: URL.createObjectURL(file) } : null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setMessage('');
    setFile(null);

    console.log("Message sent:", newMsg);

    // later → insert into supabase messages table
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        Loading chat...
      </div>
    );
  }

  if (!selectedLawyer) {
    return (
      <div className="text-center py-20 text-red-600">
        Lawyer not found
      </div>
    );
  }

  const lawyerName =
    selectedLawyer?.profiles?.first_name + " " +
    selectedLawyer?.profiles?.last_name || "Lawyer";

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow flex flex-col h-[600px]">

        {/* header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <img
              src={selectedLawyer.image_url || "https://via.placeholder.com/50"}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h2 className="font-semibold">{lawyerName}</h2>
              <p className="text-sm text-gray-500">{selectedLawyer.specialization}</p>
            </div>
          </div>

          <Link
            to={`/lawyers/${id}/book`}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <CalendarIcon className="h-5 w-5" />
            Book
          </Link>
        </div>

        {/* messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[70%] ${
                  msg.sender === "me"
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
              >
                {msg.text && <p>{msg.text}</p>}

                {msg.file && (
                  <a href={msg.file.url} download className="underline block mt-1">
                    📎 {msg.file.name}
                  </a>
                )}

                <p className="text-xs mt-1 opacity-70">{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-3 items-center">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type message..."
            className="flex-1 border px-4 py-2 rounded"
          />

          <label className="cursor-pointer">
            <PaperClipIcon className="h-6 w-6 text-gray-600" />
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button className="bg-blue-600 text-white px-5 py-2 rounded flex gap-2">
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            Send
          </button>
        </form>

        {file && (
          <div className="px-4 pb-3 text-sm">
            Attached: {file.name}
            <button onClick={() => setFile(null)} className="text-red-500 ml-2">
              remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;