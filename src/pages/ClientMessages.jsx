import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";

const ClientMessages = () => {

  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {

    try {

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return;

      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          lawyer_id,
          lawyers (
            first_name,
            last_name
          )
        `)
        .eq("client_id", user.id);

      if (error) throw error;

      setConversations(data || []);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  if (loading) {

    return (
      <div className="p-10 text-center">
        Loading messages...
      </div>
    );

  }

  return (

    <div className="max-w-4xl mx-auto p-6">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold">
          My Messages
        </h1>

      </div>

      {conversations.length === 0 && (

        <p className="text-gray-500">
          No conversations yet
        </p>

      )}

      <div className="space-y-4">

        {conversations.map((c) => {

          const lawyerName =
            c.lawyers
              ? `${c.lawyers.first_name || ""} ${c.lawyers.last_name || ""}`
              : "Lawyer";

          return (

            <div
              key={c.id}
              className="border rounded-lg p-4 flex justify-between items-center hover:shadow"
            >

              <div>

                <p className="font-semibold text-lg">
                  {lawyerName}
                </p>

                <p className="text-sm text-gray-500">
                  Conversation with lawyer
                </p>

              </div>

              <button
                onClick={() => navigate(`/chat/${c.id}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Open Chat
              </button>

            </div>

          );

        })}

      </div>

    </div>

  );

};

export default ClientMessages;