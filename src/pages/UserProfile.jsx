import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { initiatePayment } from "../services/paymentService";
import { useNotification } from "../contexts/NotificationContext";

const Profile = () => {

  const [authUser, setAuthUser] = useState(null);
  const [client, setClient] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus) {
      if (paymentStatus === "success") {
        addNotification({ type: "success", title: "Payment Successful", message: "Your booking is now confirmed." });
      } else if (paymentStatus === "failed") {
        addNotification({ type: "error", title: "Payment Failed", message: "There was an issue processing your payment." });
      } else if (paymentStatus === "cancelled") {
        addNotification({ type: "warning", title: "Payment Cancelled", message: "You cancelled the payment." });
      } else {
        addNotification({ type: "error", title: "Payment Error", message: "An unknown error occurred during payment." });
      }
      navigate("/profile", { replace: true });
    }
  }, [searchParams, navigate, addNotification]);

  useEffect(() => {
    loadData();
  }, []);

  //////////////////////////////////////////////////////
  // 🔥 LOAD DATA (FIXED WITH JOIN)
  //////////////////////////////////////////////////////
  const loadData = async () => {

    try {

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return;

      setAuthUser(user);

      // ✅ client
      const { data: clientData } = await supabase
        .from("clients")
        .select("*")
        .eq("id", user.id)
        .single();

      setClient(clientData);

      // ✅ bookings
      const { data: bookingData } = await supabase
        .from("bookings")
        .select("*")
        .eq("client_id", user.id)
        .order("booking_date", { ascending: true });

      // ✅ lawyers (IMPORTANT)
      const { data: lawyersData } = await supabase
        .from("lawyers")
        .select("id, consultation_fee");

      // ✅ merge bookings + fee
      let mergedBookings = (bookingData || []).map(b => {
        const lawyer = lawyersData?.find(l => l.id === b.lawyer_id);

        return {
          ...b,
          consultation_fee: lawyer?.consultation_fee || null
        };
      });

      // 🔥 FILTER OUT DUPLICATES: Hide pending if a paid/accepted one exists for the same slot
      mergedBookings = mergedBookings.filter(b => {
        if (b.status === "pending" || b.payment_status === "unpaid") {
          const hasPaid = mergedBookings.some(
            other => other.id !== b.id &&
                     other.lawyer_id === b.lawyer_id &&
                     other.booking_date === b.booking_date &&
                     other.booking_time === b.booking_time &&
                     (other.status === "accepted" || other.payment_status === "paid")
          );
          if (hasPaid) return false;
        }
        return true;
      });

      setBookings(mergedBookings);

    } catch (err) {
      console.error("Profile load error:", err);
    } finally {
      setLoading(false);
    }

  };

  //////////////////////////////////////////////////////
  // 🔥 PAY NOW FUNCTION (FIXED)
  //////////////////////////////////////////////////////
  const handlePayNow = async (booking) => {

    try {

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      const amount = booking.consultation_fee;

      if (!amount) {
        alert("Consultation fee not found");
        return;
      }

      const paymentData = await initiatePayment({
        amount: amount, // ✅ REAL FEE
        name: user.email,
        email: user.email,
        phone: "01700000000",
        booking_id: booking.id
      });

      console.log("PAYMENT RESPONSE:", paymentData);

      if (paymentData?.GatewayPageURL) {
        window.location.href = paymentData.GatewayPageURL;
      } else {
        alert("Payment failed: No Gateway URL");
      }

    } catch (err) {
      console.error("PAYMENT ERROR:", err);
      alert("Payment error");
    }

  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading profile...
      </div>
    );
  }

  const fullName = client
    ? `${client.first_name || ""} ${client.last_name || ""}`.trim()
    : "";

  return (

    <div className="max-w-6xl mx-auto p-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 rounded-lg relative mb-12">
        <div className="absolute -bottom-10 left-6 w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl font-bold shadow">
          {fullName ? fullName.charAt(0).toUpperCase() : "U"}
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          {fullName || "User"}
        </h1>

        <Link
          to="/client-messages"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          My Messages
        </Link>

      </div>

      <div className="grid md:grid-cols-2 gap-8">

        {/* PERSONAL INFO */}
        <div className="bg-white shadow rounded-lg p-6">

          <h2 className="text-xl font-bold mb-4 flex justify-between">
            Personal Information

            <Link
              to="/edit-profile"
              className="text-blue-600 text-sm hover:underline"
            >
              Edit Profile
            </Link>
          </h2>

          <p className="mb-2"><b>Full Name:</b> {fullName || "Not added"}</p>
          <p className="mb-2"><b>Email:</b> {authUser?.email}</p>
          <p className="mb-2"><b>Phone:</b> {client?.phone || "Not added"}</p>
          <p className="mb-2"><b>Location:</b> {client?.location || "Not added"}</p>

        </div>

        {/* CONSULTATIONS */}
        <div className="bg-white shadow rounded-lg p-6">

          <h2 className="text-xl font-bold mb-4">
            My Consultations
          </h2>

          {bookings.length === 0 && (
            <p className="text-gray-500">No consultations yet</p>
          )}

          {bookings.length > 0 && (

            <table className="w-full text-sm border">

              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Lawyer</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Time</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Fee</th>
                  <th className="p-2 border">Payment</th>
                </tr>
              </thead>

              <tbody>

                {bookings.map(b => (

                  <tr key={b.id}>

                    <td className="border p-2">
                      {b.lawyer_name || "Lawyer"}
                    </td>

                    <td className="border p-2">
                      {b.booking_date}
                    </td>

                    <td className="border p-2">
                      {b.booking_time}
                    </td>

                    <td className="border p-2">
                      {(() => {
                        let displayStatus = b.status;
                        let bgClass = "bg-yellow-100 text-yellow-700";

                        if (b.status === "accepted") bgClass = "bg-green-100 text-green-700";
                        if (b.status === "rejected") bgClass = "bg-red-100 text-red-700";

                        const createdStr = (b.created_at.endsWith('Z') || b.created_at.includes('+')) ? b.created_at : b.created_at + 'Z';
                        const isExpired = b.status === "pending" && b.payment_status === "unpaid" && (new Date() - new Date(createdStr)) / (1000 * 60 * 60) > 3;
                        if (isExpired) {
                          displayStatus = "expired";
                          bgClass = "bg-gray-200 text-gray-700";
                        }

                        return (
                          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${bgClass}`}>
                            {displayStatus}
                          </span>
                        );
                      })()}
                    </td>

                    {/* ✅ REAL FEE */}
                    <td className="border p-2 text-center">
                      {b.consultation_fee
                        ? `${b.consultation_fee} BDT`
                        : "N/A"}
                    </td>

                    {/* PAYMENT */}
                    <td className="border p-2 text-center">
                      {(() => {
                        if (b.status === "rejected") {
                          return <span className="text-gray-400">-</span>;
                        }

                        if (b.payment_status === "paid") {
                          return <span className="text-green-600 font-semibold">Paid</span>;
                        }

                        const createdStr2 = (b.created_at.endsWith('Z') || b.created_at.includes('+')) ? b.created_at : b.created_at + 'Z';
                        const isExpired2 = b.status === "pending" && b.payment_status === "unpaid" && (new Date() - new Date(createdStr2)) / (1000 * 60 * 60) > 3;

                        if (isExpired2) {
                          return <span className="text-gray-400 text-sm whitespace-nowrap">Time Expired</span>;
                        }

                        return (
                          <button
                            onClick={() => handlePayNow(b)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded whitespace-nowrap"
                          >
                            Pay Now
                          </button>
                        );
                      })()}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>

  );
};

export default Profile;