import { useState, useEffect } from "react";
import ConsultationList from "../components/dashboard/ConsultationList";
import DocumentList from "../components/dashboard/DocumentList";
import ClientList from "../components/dashboard/ClientList";
import DashboardStats from "../components/dashboard/DashboardStats";
import MessageCenter from "../components/dashboard/MessageCenter";
import { Calendar, FileText, Users, Briefcase, MessageCircle, Menu, PanelBottom, User, ClipboardList } from 'lucide-react';
import { Link } from "react-router-dom";
import { AiOutlineHome } from "react-icons/ai";
import { useTranslation } from "../hooks/useTranslation";
import { supabase } from "../services/supabaseClient";
import logo from '../../public/logo drk.png';

const Dashboard = () => {

  const { t } = useTranslation();

  const [activeView,setActiveView] = useState("overview");
  const [isMenuOpen,setIsMenuOpen] = useState(false);
  const [lawyer,setLawyer] = useState(null);

  /* ---------------- LOAD LAWYER ---------------- */

  useEffect(()=>{
    loadLawyer()
  },[])

  async function loadLawyer(){

    const { data:userData } = await supabase.auth.getUser()

    const user = userData?.user

    if(!user) return

    const { data } = await supabase
    .from("lawyers")
    .select("*")
    .eq("id",user.id)
    .single()

    setLawyer(data)

  }


  /* ---------------- NAVIGATION ---------------- */

  const navigationItems = [
    { view:"overview", label:"Overview", icon:Briefcase },
    { view:"consultations", label:"Consultations", icon:Calendar },
    { view:"documents", label:"Documents", icon:FileText },
    { view:"clients", label:"Clients", icon:Users },
    { view:"messages", label:"Messages", icon:MessageCircle },
  ];


  /* ---------------- CONTENT SWITCH ---------------- */

  const renderContent = () => {

    switch(activeView){

      case "overview":
        return <DashboardStats />

      case "consultations":
        return <ConsultationList />

      case "documents":
        return <DocumentList />

      case "clients":
        return <ClientList />

      case "messages":
        return <MessageCenter />

      default:
        return <DashboardStats />

    }

  }


  const lawyerName =
  lawyer
  ? `${lawyer.first_name || ""} ${lawyer.last_name || ""}`
  : "Loading..."


  return (

<div className="min-h-screen bg-gray-100 px-20">

{/* TOP BAR */}

<div className="flex justify-between items-center p-4 md:px-4">

<Link to="/">
<button className="flex items-center gap-2 text-blue-600 hover:text-blue-500 font-medium bg-gray-100 px-3 py-2 rounded-lg shadow hover:bg-gray-200 transition">
<AiOutlineHome className="text-xl"/>
<span className="hidden sm:inline">{t('home')}</span>
</button>
</Link>

<Link to="/">
<img src={logo} className="h-16 md:h-24" alt="Logo"/>
</Link>

</div>


<div className="container mx-auto px-4 py-4 md:py-8">

{/* HEADER */}

<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">

<div>

<h1 className="text-2xl md:text-3xl font-bold text-gray-800">
Lawyer Dashboard
</h1>

<p className="text-gray-500 mt-1">
Welcome, {lawyerName}
</p>

</div>


{/* RIGHT BUTTONS */}

<div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">


<Link to="/lawyer/bookings">

<button className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition flex items-center justify-center">

<ClipboardList className="w-5 h-5 mr-2"/>
Booking Requests

</button>

</Link>


<Link to="/lawyer/edit-profile">

<button className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center justify-center">

<User className="w-5 h-5 mr-2"/>
Edit Profile

</button>

</Link>


<Link to="https://saas.ukilchamber.com/" target="_blank">

<button className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center">

<PanelBottom className="w-5 h-5 mr-2"/>
SAAS Panel

</button>

</Link>

</div>

</div>


{/* MOBILE MENU */}

<div className="md:hidden mb-4">

<button
onClick={()=>setIsMenuOpen(!isMenuOpen)}
className="w-full px-4 py-2 bg-white rounded-md shadow-md flex items-center justify-between"
>

<span className="font-medium">
{navigationItems.find(item => item.view === activeView)?.label}
</span>

<Menu className="w-5 h-5"/>

</button>

</div>


{/* NAVIGATION */}

<div className={`md:flex md:space-x-4 mb-6 ${isMenuOpen ? 'block':'hidden md:block'}`}>

<div className="flex flex-col md:flex-row gap-2 md:gap-4">

{navigationItems.map(({view,label,icon:Icon})=>(
<button
key={view}
className={`px-4 py-2 rounded-md transition flex items-center justify-center md:justify-start
${activeView === view ? "bg-blue-600 text-white":"text-gray-600 hover:bg-gray-200"}`}
onClick={()=>{
setActiveView(view)
setIsMenuOpen(false)
}}
>

<Icon className="w-5 h-5 mr-2"/>

{label}

</button>
))}

</div>

</div>


{/* CONTENT */}

<div className="bg-white rounded-lg shadow-md p-4 md:p-6 overflow-x-auto">

{renderContent()}

</div>


</div>

</div>

)

}

export default Dashboard