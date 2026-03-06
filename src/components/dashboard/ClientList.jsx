import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

const ClientList = () => {

  const [clients,setClients] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    fetchClients();
  },[]);

  const fetchClients = async () => {

    const { data: userData } = await supabase.auth.getUser();
    const lawyer = userData?.user;
    if (!lawyer) return;

    // get all bookings of this lawyer
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("lawyer_id", lawyer.id);

    if (!bookings){
      setLoading(false);
      return;
    }

    // unique client emails
    const uniqueEmails = [...new Set(bookings.map(b=>b.client_name))];

    const fullClients = await Promise.all(
      uniqueEmails.map(async (email)=>{

        const { data: client } = await supabase
          .from("clients")
          .select("*")
          .eq("email", email)
          .single();

        const totalBookings = bookings.filter(b=>b.client_name===email).length;

        return {
          email,
          name: client
            ? client.first_name + " " + client.last_name
            : email,
          phone: client?.phone || "N/A",
          totalBookings
        };
      })
    );

    setClients(fullClients);
    setLoading(false);
  };

  if(loading) return <div className="p-6">Loading clients...</div>;

  return (
    <div>

      <h2 className="text-xl font-bold mb-4">My Clients</h2>

      {clients.length===0 && (
        <p className="text-gray-500">No clients yet</p>
      )}

      {clients.length>0 && (
        <div className="bg-white rounded-xl shadow overflow-hidden">

          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-4 text-left">Full Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Total Consultations</th>
              </tr>
            </thead>

            <tbody>
              {clients.map((c,i)=>(
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-semibold">{c.name}</td>
                  <td className="p-4">{c.email}</td>
                  <td className="p-4">{c.phone}</td>
                  <td className="p-4">{c.totalBookings}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}

    </div>
  );
};

export default ClientList;