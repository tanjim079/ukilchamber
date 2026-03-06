import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { Calendar, Users, FileText, Briefcase } from "lucide-react";

const DashboardStats = () => {

  const [stats, setStats] = useState({
    totalConsultations: 0,
    pendingConsultations: 0,
    totalClients: 0,
    totalDocuments: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) return;

    // BOOKINGS
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("lawyer_id", user.id);

    // PENDING
    const { data: pending } = await supabase
      .from("bookings")
      .select("*")
      .eq("lawyer_id", user.id)
      .eq("status","pending");

    // UNIQUE CLIENTS
    let uniqueClients = new Set();
    bookings?.forEach(b => uniqueClients.add(b.client_id));

    // DOCUMENTS (if exists)
    const { data: docs } = await supabase
      .from("documents")
      .select("*")
      .eq("lawyer_id", user.id);

    setStats({
      totalConsultations: bookings?.length || 0,
      pendingConsultations: pending?.length || 0,
      totalClients: uniqueClients.size || 0,
      totalDocuments: docs?.length || 0,
    });
  };

  const cards = [
    {
      title: "Total Consultations",
      value: stats.totalConsultations,
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      title: "Pending Consultations",
      value: stats.pendingConsultations,
      icon: Briefcase,
      color: "bg-yellow-500",
    },
    {
      title: "Total Clients",
      value: stats.totalClients,
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Total Documents",
      value: stats.totalDocuments,
      icon: FileText,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow p-6 flex justify-between items-center">
            <div>
              <p className="text-gray-500">{card.title}</p>
              <h2 className="text-3xl font-bold">{card.value}</h2>
            </div>

            <div className={`${card.color} p-3 rounded-full text-white`}>
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;