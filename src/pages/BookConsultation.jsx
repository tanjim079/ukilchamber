import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { initiatePayment } from "../services/paymentService";

const BookConsultation = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [lawyer, setLawyer] = useState(null);
  const [availability, setAvailability] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  //////////////////////////////////////////////////////
  // FETCH LAWYER
  //////////////////////////////////////////////////////
  useEffect(() => {
    fetchLawyer();
  }, []);

  const fetchLawyer = async () => {

    const { data } = await supabase
      .from("lawyers")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setLawyer(data);
      setAvailability(data.availability || {});
    }

    setLoading(false);
  };

  //////////////////////////////////////////////////////
  // UTIL FUNCTIONS
  //////////////////////////////////////////////////////
  const getDayName = (dateStr) => {
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    return days[new Date(dateStr).getDay()];
  };

  const isPastTimeToday = (date, time) => {
    const now = new Date();
    const selected = new Date(date);

    if (now.toDateString() !== selected.toDateString()) return false;

    let hour = parseInt(time.split(":")[0]);
    const isPM = time.includes("PM");

    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;

    return hour <= now.getHours();
  };

  //////////////////////////////////////////////////////
  // DATE CHANGE
  //////////////////////////////////////////////////////
  const handleDateChange = async (date) => {

    setSelectedDate(date);
    setSelectedTime("");

    const day = getDayName(date);
    setAvailableTimes(availability[day] || []);

    const { data } = await supabase
      .from("bookings")
      .select("booking_time,status,payment_status,created_at")
      .eq("lawyer_id", id)
      .eq("booking_date", date)
      .in("status", ["pending","accepted"]);

    // Filter out bookings that are pending, unpaid, and older than 3 hours
    const validBookings = (data || []).filter(b => {
      if (b.status === "pending" && b.payment_status === "unpaid") {
        const createdStr = (b.created_at.endsWith('Z') || b.created_at.includes('+')) ? b.created_at : b.created_at + 'Z';
        const created = new Date(createdStr);
        const now = new Date();
        const diffHours = (now - created) / (1000 * 60 * 60);
        return diffHours <= 3; // Keep if under 3 hours
      }
      return true; // Keep accepted or paid bookings
    });

    setBookedSlots(validBookings);
  };

  const isBooked = (time) => {
    return bookedSlots.some(b => b.booking_time === time);
  };

  //////////////////////////////////////////////////////
  // 🔥 MAIN BOOKING FUNCTION (FIXED)
  //////////////////////////////////////////////////////
  const handleBooking = async (paymentType) => {

    if (submitting) return;

    if (!selectedDate || !selectedTime) {
      alert("Select valid date & time");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    if (selectedDate < today) {
      alert("Cannot book past date");
      return;
    }
    
    setSubmitting(true);

    // 🔥 DOUBLE CHECK SLOT (IMPORTANT FIX)
    const { data: existing } = await supabase
      .from("bookings")
      .select("id, status, payment_status, created_at")
      .eq("lawyer_id", id)
      .eq("booking_date", selectedDate)
      .eq("booking_time", selectedTime)
      .in("status", ["pending","accepted"]);

    const activeExisting = (existing || []).filter(b => {
      if (b.status === "pending" && b.payment_status === "unpaid") {
        const createdStr = (b.created_at.endsWith('Z') || b.created_at.includes('+')) ? b.created_at : b.created_at + 'Z';
        const diffHours = (new Date() - new Date(createdStr)) / (1000 * 60 * 60);
        return diffHours <= 3;
      }
      return true;
    });

    if (activeExisting.length > 0) {
      alert("Slot already booked");
      setSubmitting(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      alert("Login required");
      setSubmitting(false);
      return;
    }

    // ✅ FETCH REAL CLIENT PHONE
    const { data: clientData } = await supabase
      .from("clients")
      .select("phone, first_name, last_name")
      .eq("id", user.id)
      .single();

    const clientPhone = clientData?.phone || "01700000000";
    const clientName = clientData?.first_name
      ? `${clientData.first_name} ${clientData.last_name}`
      : user.email;

    // ✅ INSERT BOOKING FIRST
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          lawyer_id: id,
          client_id: user.id,
          client_name: user.email,
          lawyer_name: lawyer?.first_name + " " + lawyer?.last_name,
          booking_date: selectedDate,
          booking_time: selectedTime,
          status: "pending",
          payment_status: "unpaid"
        }
      ])
      .select();

    if (error) {
      console.error(error);
      alert("Booking failed");
      setSubmitting(false);
      return;
    }

    const booking = data[0];

    //////////////////////////////////////////////////////
    // 🔵 PAY NOW
    //////////////////////////////////////////////////////
    if (paymentType === "now") {

      try {

        const fee = lawyer?.consultation_fee;

        if (!fee) {
          alert("Consultation fee not set for this lawyer");
          setSubmitting(false);
          return;
        }

        const paymentData = await initiatePayment({
          amount: fee,
          name: clientName,
          email: user.email,
          phone: clientPhone,  // ✅ REAL PHONE
          booking_id: booking.id
        });

        if (paymentData?.GatewayPageURL) {
          window.location.href = paymentData.GatewayPageURL;
        } else {
          alert("Payment initialization failed");
          setSubmitting(false);
        }

      } catch (err) {
        console.error(err);
        alert("Payment error");
        setSubmitting(false);
      }

    }
    //////////////////////////////////////////////////////
    // ⚪ PAY LATER
    //////////////////////////////////////////////////////
    else {
      alert("Booking request sent");
      setSubmitting(false);
    }

    setSelectedTime("");
    handleDateChange(selectedDate);
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  if (loading) return <div className="p-10">Loading...</div>;

  const today = new Date().toISOString().split("T")[0];

  return (

    <div className="max-w-3xl mx-auto p-6">

      {/* BACK */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-white border px-4 py-2 rounded"
        >
          ← Back
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6">Book Consultation</h1>

      {/* DATE */}
      <label className="font-semibold">Select Date</label>
      <input
        type="date"
        min={today}
        className="border p-2 rounded w-full mt-2"
        onChange={(e)=>handleDateChange(e.target.value)}
      />

      {/* TIME */}
      {selectedDate && (
        <div className="mt-6">

          <h3 className="font-bold mb-2">Available Time</h3>

          <div className="flex flex-wrap gap-2">

            {availableTimes.length === 0 && (
              <p className="text-gray-400">Lawyer not available</p>
            )}

            {availableTimes.map((t,i)=>{

              const booked = isBooked(t);
              const pastTime = isPastTimeToday(selectedDate, t);
              const disabled = booked || pastTime;
              const selected = selectedTime === t;

              return (
                <button
                  key={i}
                  disabled={disabled}
                  onClick={()=>setSelectedTime(t)}
                  className={`px-4 py-2 rounded border
                  ${selected ? "bg-green-600 text-white" : ""}
                  ${!disabled && !selected ? "bg-blue-100" : ""}
                  ${disabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : ""}
                  `}
                >
                  {t} {booked && "(Booked)"} {pastTime && "(Passed)"}
                </button>
              );
            })}

          </div>

        </div>
      )}

      {/* 🔥 SHOW FEE */}
      {lawyer?.consultation_fee && (
        <div className="mt-6 text-lg font-semibold text-blue-600">
          Consultation Fee: {lawyer.consultation_fee} BDT
        </div>
      )}

      {/* 🔥 PAYMENT BUTTONS */}
      <div className="mt-8 flex gap-4">

        <button
          onClick={() => handleBooking("later")}
          disabled={submitting}
          className={`px-6 py-3 rounded text-white ${submitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600'}`}
        >
          {submitting ? "Processing..." : "Pay Later"}
        </button>

        <button
          onClick={() => handleBooking("now")}
          disabled={submitting}
          className={`px-6 py-3 rounded text-white ${submitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {submitting ? "Redirecting..." : "Pay Now"}
        </button>

      </div>

    </div>

  );
};

export default BookConsultation;