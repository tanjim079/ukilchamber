import { useEffect, useState } from "react";
import {
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

const LawyerDashboard = () => {

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalClients: 0,
    activeConsultations: 0,
    pendingRequests: 0,
    totalEarnings: 0,
  });

  const [recentMessages, setRecentMessages] = useState([]);
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {

    const { data: userData } = await supabase.auth.getUser();
    const lawyer = userData?.user;

    if (!lawyer) return;

    // BOOKINGS
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("lawyer_id", lawyer.id);

    if (bookings) {

      setConsultations(bookings.slice(0,5));

      setStats({
        totalClients: new Set(bookings.map(b => b.client_id)).size,
        activeConsultations: bookings.filter(b => b.status === "accepted").length,
        pendingRequests: bookings.filter(b => b.status === "pending").length,
        totalEarnings: bookings.filter(b => b.status === "accepted")
          .reduce((sum,b)=> sum + (b.fee || 0),0),
      });

    }

    // RECENT MESSAGES
    const { data: conversations } = await supabase
      .from("conversations")
      .select(`
        id,
        client_id,
        clients(first_name,last_name)
      `)
      .eq("lawyer_id", lawyer.id);

    if(conversations){

      setRecentMessages(conversations.slice(0,5));

    }

  };

  const openMessages = () => {

    navigate("/chat");

  };

  const openConversation = (conversationId) => {

    navigate(`/chat?conversation=${conversationId}`);

  };

  return (

    <div className="container mx-auto px-4 py-8">

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <div className="bg-white p-6 rounded-lg shadow-sm border">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-gray-500">Total Clients</p>
              <h3 className="text-2xl font-bold">{stats.totalClients}</h3>
            </div>

            <UserGroupIcon className="h-10 w-10 text-blue-600" />

          </div>

        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-gray-500">Active Consultations</p>
              <h3 className="text-2xl font-bold">{stats.activeConsultations}</h3>
            </div>

            <CalendarIcon className="h-10 w-10 text-green-600" />

          </div>

        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-gray-500">Pending Requests</p>
              <h3 className="text-2xl font-bold">{stats.pendingRequests}</h3>
            </div>

            <ChatBubbleLeftRightIcon className="h-10 w-10 text-yellow-600" />

          </div>

        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-gray-500">Total Earnings</p>
              <h3 className="text-2xl font-bold">${stats.totalEarnings}</h3>
            </div>

            <ChartBarIcon className="h-10 w-10 text-purple-600" />

          </div>

        </div>

      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* CONSULTATIONS */}

        <div className="lg:col-span-2">

          <div className="bg-white rounded-lg shadow-sm border p-6">

            <h2 className="text-xl font-semibold mb-4">
              Upcoming Consultations
            </h2>

            <div className="space-y-4">

              {consultations.map((c) => (

                <div
                  key={c.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >

                  <div>

                    <h3 className="font-medium">
                      {c.client_name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {c.booking_date} at {c.booking_time}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

        {/* RECENT MESSAGES */}

        <div className="bg-white rounded-lg shadow-sm border p-6">

          <h2 className="text-xl font-semibold mb-4">
            Recent Messages
          </h2>

          <div className="space-y-4">

            {recentMessages.map((m) => (

              <div
                key={m.id}
                onClick={() => openConversation(m.id)}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
              >

                <h3 className="font-medium">

                  {m.clients?.first_name} {m.clients?.last_name}

                </h3>

                <p className="text-sm text-gray-500">
                  Click to open conversation
                </p>

              </div>

            ))}

          </div>

          <button
            onClick={openMessages}
            className="w-full mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            View All Messages
          </button>

        </div>

      </div>

      {/* DOCUMENT SECTION */}

      <div className="mt-8">

        <div className="bg-white rounded-lg shadow-sm border p-6">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-xl font-semibold">
              Recent Documents
            </h2>

            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">

              <DocumentTextIcon className="h-5 w-5" />

              Upload Document

            </button>

          </div>

        </div>

      </div>

    </div>

  );

};

export default LawyerDashboard;