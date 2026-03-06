import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";

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

  const getDayName = (dateStr) => {
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const d = new Date(dateStr);
    return days[d.getDay()];
  };

  const isPastTimeToday = (date, time) => {

    const today = new Date();
    const selected = new Date(date);

    if (today.toDateString() !== selected.toDateString()) return false;

    const currentHour = today.getHours();

    const timeHour = parseInt(time.split(":")[0]);
    const isPM = time.includes("PM");

    let hour24 = timeHour;

    if (isPM && timeHour !== 12) hour24 += 12;
    if (!isPM && timeHour === 12) hour24 = 0;

    return hour24 <= currentHour;
  };

  const handleDateChange = async (date) => {

    setSelectedDate(date);
    setSelectedTime("");

    const dayName = getDayName(date);
    const times = availability[dayName] || [];

    setAvailableTimes(times);

    const { data } = await supabase
      .from("bookings")
      .select("booking_time,status")
      .eq("lawyer_id", id)
      .eq("booking_date", date)
      .in("status", ["pending","accepted"]);

    setBookedSlots(data || []);
  };

  const isBooked = (time) => {
    return bookedSlots.some(b => b.booking_time === time);
  };

  const handleBooking = async () => {

    if (!selectedDate || !selectedTime) {
      alert("Select valid date & time");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    if (selectedDate < today) {
      alert("Cannot book past date");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      alert("Login required");
      return;
    }

    const { error } = await supabase.from("bookings").insert([
      {
        lawyer_id: id,
        client_id: user.id,
        client_name: user.email,
        lawyer_name: lawyer?.first_name + " " + lawyer?.last_name,
        booking_date: selectedDate,
        booking_time: selectedTime,
        status: "pending"
      }
    ]);

    if (error) {
      alert("Slot already booked");
    } else {
      alert("Booking request sent");
      setSelectedTime("");
      handleDateChange(selectedDate);
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-3xl mx-auto p-6">

      {/* BACK BUTTON */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg shadow hover:bg-gray-100"
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
              <p className="text-gray-400">Lawyer not available this day</p>
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

      {/* BOOK */}
      <button
        onClick={handleBooking}
        className="mt-8 bg-blue-600 text-white px-6 py-3 rounded"
      >
        Send Booking Request
      </button>

    </div>
  );
};

export default BookConsultation;