import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

const ConsultationList = () => {

  const [accepted, setAccepted] = useState([]);
  const [rejected, setRejected] = useState([]);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {

    const { data: userData } = await supabase.auth.getUser();
    const lawyer = userData?.user;

    if (!lawyer) return;

    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("lawyer_id", lawyer.id)
      .order("booking_date",{ascending:true});

    if (!data) return;

    // attach client info
    const withClient = await Promise.all(
      data.map(async (b) => {

        const { data: client } = await supabase
          .from("clients")
          .select("first_name,last_name,phone")
          .eq("email", b.client_name)
          .single();

        return {
          ...b,
          full_name: client
            ? client.first_name + " " + client.last_name
            : b.client_name,
          phone: client?.phone || "N/A"
        };
      })
    );

    setAccepted(withClient.filter(b=>b.status==="accepted"));
    setRejected(withClient.filter(b=>b.status==="rejected"));
  };

  const Card = ({item}) => (
    <div className="border rounded-lg p-4 mb-3 bg-white shadow-sm">
      <p><b>Client:</b> {item.full_name}</p>
      <p><b>Phone:</b> {item.phone}</p>
      <p><b>Date:</b> {item.booking_date}</p>
      <p><b>Time:</b> {item.booking_time}</p>
    </div>
  );

  return (
    <div>

      {/* ACCEPTED */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-green-700 mb-3">
          Accepted Consultations
        </h2>

        {accepted.length === 0 && (
          <p className="text-gray-500">No accepted consultations</p>
        )}

        {accepted.map(a=>(
          <Card key={a.id} item={a}/>
        ))}
      </div>

      {/* REJECTED */}
      <div>
        <h2 className="text-xl font-bold text-red-700 mb-3">
          Rejected Consultations
        </h2>

        {rejected.length === 0 && (
          <p className="text-gray-500">No rejected consultations</p>
        )}

        {rejected.map(r=>(
          <Card key={r.id} item={r}/>
        ))}
      </div>

    </div>
  );
};

export default ConsultationList;