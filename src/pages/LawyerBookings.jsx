import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";   // ✅ ADDED

const LawyerBookings = () => {

  const navigate = useNavigate();   // ✅ ADDED

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {

    const { data: userData } = await supabase.auth.getUser();
    const lawyer = userData?.user;

    if (!lawyer) return;

    const { data: bookingData } = await supabase
      .from("bookings")
      .select("*")
      .eq("lawyer_id", lawyer.id)
      .order("booking_date", { ascending: true });

    if (!bookingData) {
      setLoading(false);
      return;
    }

    const updated = await Promise.all(
      bookingData.map(async (b) => {

        const { data: client } = await supabase
          .from("clients")
          .select("first_name,last_name,phone")
          .eq("email", b.client_name)
          .single();

        return {
          ...b,
          client_full_name: client
            ? client.first_name + " " + client.last_name
            : b.client_name,
          client_phone: client?.phone || "N/A"
        };

      })
    );

    setBookings(updated);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    fetchBookings();
  };

  const getStatusStyle = (status) => {
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    if (status === "accepted") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-gray-100";
  };

  if (loading)
    return (
      <div className="p-10 text-center">
        Loading bookings...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto">

        {/* 🔙 BACK BUTTON (ADDED) */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg shadow hover:bg-gray-100"
          >
            ← Back
          </button>
        </div>

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Booking Requests</h1>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Total Bookings</p>
            <h2 className="text-3xl font-bold">{bookings.length}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Pending</p>
            <h2 className="text-3xl font-bold text-yellow-600">
              {bookings.filter(b=>b.status==="pending").length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Accepted</p>
            <h2 className="text-3xl font-bold text-green-600">
              {bookings.filter(b=>b.status==="accepted").length}
            </h2>
          </div>

        </div>

        {/* TABLE CARD */}
        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4 text-left">Client</th>
                  <th className="p-4 text-left">Phone</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Time</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((b)=>(

                  <tr key={b.id} className="border-t hover:bg-gray-50">

                    <td className="p-4 font-semibold">
                      {b.client_full_name}
                    </td>

                    <td className="p-4">
                      {b.client_phone}
                    </td>

                    <td className="p-4">
                      {b.booking_date}
                    </td>

                    <td className="p-4">
                      {b.booking_time}
                    </td>

                    <td className="p-4">
                      {(() => {
                        let displayStatus = b.status;
                        let style = getStatusStyle(b.status);

                        if (b.status === "pending" && b.payment_status === "unpaid") {
                          const createdStr = (b.created_at.endsWith('Z') || b.created_at.includes('+')) ? b.created_at : b.created_at + 'Z';
                          const isExpired = (new Date() - new Date(createdStr)) / (1000 * 60 * 60) > 3;
                          if (isExpired) {
                            displayStatus = "Expired (Unpaid)";
                            style = "bg-gray-200 text-gray-700";
                          }
                        }

                        if (b.status === "accepted" && b.payment_status === "paid") {
                           displayStatus = "Auto-Accepted (Paid)";
                        }

                        return (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${style}`}>
                            {displayStatus}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="p-4">
                      {(() => {
                        const createdStr2 = (b.created_at.endsWith('Z') || b.created_at.includes('+')) ? b.created_at : b.created_at + 'Z';
                        const isExpired = b.status === "pending" && b.payment_status === "unpaid" && (new Date() - new Date(createdStr2)) / (1000 * 60 * 60) > 3;
                        
                        if (b.status === "pending" && !isExpired) {
                          return (
                            <div className="flex gap-2">
                              <button
                                onClick={()=>updateStatus(b.id,"accepted")}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md text-sm"
                              >
                                Accept
                              </button>

                              <button
                                onClick={()=>updateStatus(b.id,"rejected")}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md text-sm"
                              >
                                Reject
                              </button>
                            </div>
                          );
                        }
                        
                        return (
                          <span className="text-gray-400 text-sm whitespace-nowrap">
                            {isExpired ? "Time Expired" : "No action"}
                          </span>
                        );
                      })()}
                    </td>

                  </tr>

                ))}
              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
};

export default LawyerBookings;