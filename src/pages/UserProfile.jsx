import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Link } from "react-router-dom";

const Profile = () => {

const [authUser,setAuthUser] = useState(null)
const [client,setClient] = useState(null)
const [bookings,setBookings] = useState([])
const [loading,setLoading] = useState(true)

useEffect(()=>{
loadData()
},[])


const loadData = async () => {

try{

const { data:userData } = await supabase.auth.getUser()

const user = userData?.user

if(!user) return

setAuthUser(user)

const { data:clientData } = await supabase
.from("clients")
.select("*")
.eq("id",user.id)
.single()

setClient(clientData)


const { data:bookingData } = await supabase
.from("bookings")
.select("*")
.eq("client_id",user.id)
.order("booking_date",{ascending:true})

setBookings(bookingData || [])

}catch(err){

console.error("Profile load error:",err)

}finally{

setLoading(false)

}

}



if(loading){

return(
<div className="p-10 text-center">
Loading profile...
</div>
)

}


const fullName = client
? `${client.first_name || ""} ${client.last_name || ""}`.trim()
: ""


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


{/* PERSONAL INFORMATION */}

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


<p className="mb-2">
<b>Full Name:</b> {fullName || "Not added"}
</p>

<p className="mb-2">
<b>Email:</b> {authUser?.email}
</p>

<p className="mb-2">
<b>Phone:</b> {client?.phone || "Not added"}
</p>

<p className="mb-2">
<b>Location:</b> {client?.location || "Not added"}
</p>

</div>



{/* CONSULTATIONS */}

<div className="bg-white shadow rounded-lg p-6">

<h2 className="text-xl font-bold mb-4">
My Consultations
</h2>


{bookings.length === 0 && (

<p className="text-gray-500">
No consultations yet
</p>

)}


{bookings.length > 0 && (

<table className="w-full text-sm border">

<thead className="bg-gray-100">

<tr>

<th className="p-2 text-left border">
Lawyer
</th>

<th className="p-2 text-left border">
Date
</th>

<th className="p-2 text-left border">
Time
</th>

<th className="p-2 text-left border">
Status
</th>

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

<span
className={`px-2 py-1 rounded text-xs font-medium ${
b.status === "accepted"
? "bg-green-100 text-green-700"
: b.status === "rejected"
? "bg-red-100 text-red-700"
: "bg-yellow-100 text-yellow-700"
}`}
>

{b.status}

</span>

</td>

</tr>

))}

</tbody>

</table>

)}

</div>


</div>

</div>

)

}

export default Profile