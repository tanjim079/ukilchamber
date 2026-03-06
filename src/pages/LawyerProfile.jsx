import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/solid";
import { supabase } from "../lib/supabase";
import { getOrCreateConversation } from "../services/chatService";

const LawyerProfile = () => {

  const { id } = useParams(); // lawyer id
  const navigate = useNavigate();

  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchLawyer();
  }, [id]);

  const fetchLawyer = async () => {

    try {

      const { data, error } = await supabase
        .from("lawyers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setLawyer(data);

    } catch (err) {

      console.error("Failed to load lawyer:", err);

    } finally {

      setLoading(false);

    }

  };

  // ---------------------------------
  // OPEN CHAT (CLIENT → LAWYER)
  // ---------------------------------

  const openChat = async () => {

    try {

      setChatLoading(true);

      // get logged-in user
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {

        alert("Please login first");
        navigate("/login");
        return;

      }

      const clientId = user.id;
      const lawyerId = id;

      // create / get conversation
      const conversation =
        await getOrCreateConversation(clientId, lawyerId);

      // open chat page
      navigate(`/chat/${conversation.id}`);

    } catch (err) {

      console.error("Chat error:", err);
      alert("Unable to open chat");

    } finally {

      setChatLoading(false);

    }

  };

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500">
        Loading profile...
      </div>
    );

  if (!lawyer)
    return (
      <div className="text-center py-20 text-red-600">
        Lawyer not found
      </div>
    );

  const fullName =
    lawyer.first_name || lawyer.last_name
      ? `${lawyer.first_name || ""} ${lawyer.last_name || ""}`.trim()
      : "Lawyer";

  const rating = Number(lawyer.rating || 0).toFixed(1);

  return (

    <div className="container mx-auto px-4 py-8">

      {/* HEADER */}

      <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col md:flex-row gap-6">

        <img
          src={lawyer.image_url || "https://via.placeholder.com/120"}
          alt="lawyer"
          className="w-32 h-32 rounded-full object-cover"
        />

        <div className="flex-1">

          <h1 className="text-3xl font-bold">
            {fullName}
          </h1>

          <p className="text-gray-600">
            {lawyer.specialization || "Lawyer"}
          </p>

          <p className="text-gray-500">
            {lawyer.experience || 0} years experience
          </p>

          <div className="flex items-center gap-2 mt-2">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <span>{rating} rating</span>
          </div>

          <p className="mt-2 font-semibold text-lg">
            Consultation Fee: ৳{lawyer.consultation_fee || 0}
          </p>

        </div>

        {/* ACTION BUTTONS */}

        <div className="flex flex-col gap-3">

          <Link
            to={`/lawyers/${id}/book`}
            className="bg-blue-600 text-white px-6 py-3 rounded-md text-center hover:bg-blue-700 transition"
          >
            Book Consultation
          </Link>

          <button
            onClick={openChat}
            disabled={chatLoading}
            className="border px-6 py-3 rounded-md hover:bg-gray-100 transition"
          >
            {chatLoading ? "Opening..." : "Message Lawyer"}
          </button>

        </div>

      </div>

      {/* TABS */}

      <div className="bg-white rounded-lg shadow">

        <div className="flex border-b">

          {["about", "expertise", "availability"].map(tab => (

            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 capitalize ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>

          ))}

        </div>

        <div className="p-6">

          {/* ABOUT */}

          {activeTab === "about" && (

            <div>

              <h2 className="text-xl font-semibold mb-2">
                About
              </h2>

              <p className="text-gray-600">
                {lawyer.about || "No description provided"}
              </p>

            </div>

          )}

          {/* EXPERTISE */}

          {activeTab === "expertise" && (

            <div>

              <h2 className="text-xl font-semibold mb-2">
                Expertise
              </h2>

              {lawyer.expertise?.length ? (

                <div className="grid grid-cols-2 gap-3">

                  {lawyer.expertise.map((e, i) => (

                    <div
                      key={i}
                      className="bg-gray-100 px-3 py-2 rounded"
                    >
                      {e}
                    </div>

                  ))}

                </div>

              ) : (

                <p>No expertise added</p>

              )}

            </div>

          )}

          {/* AVAILABILITY */}

          {activeTab === "availability" && (

            <div>

              <h2 className="text-xl font-semibold mb-2">
                Availability
              </h2>

              {lawyer.availability
                ? Object.entries(lawyer.availability).map(([day, times]) => (

                    <div key={day} className="border-b py-3">

                      <p className="font-semibold">{day}</p>

                      {times.length ? (

                        <div className="flex flex-wrap gap-2 mt-1">

                          {times.map((t, i) => (

                            <span
                              key={i}
                              className="bg-green-100 text-green-700 px-3 py-1 rounded"
                            >
                              {t}
                            </span>

                          ))}

                        </div>

                      ) : (

                        <p className="text-gray-400 text-sm">
                          Not available
                        </p>

                      )}

                    </div>

                ))
                : <p>No availability added</p>
              }

            </div>

          )}

        </div>

      </div>

    </div>

  );

};

export default LawyerProfile;