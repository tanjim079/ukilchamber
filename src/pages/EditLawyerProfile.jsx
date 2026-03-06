import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { Link } from 'react-router-dom'

const EditLawyerProfile = () => {

const [loading,setLoading] = useState(false)

const [firstName,setFirstName] = useState('')
const [lastName,setLastName] = useState('')
const [phone,setPhone] = useState('')
const [barNumber,setBarNumber] = useState('')
const [yearsExp,setYearsExp] = useState('')

const [fee,setFee] = useState('')
const [about,setAbout] = useState('')
const [expertise,setExpertise] = useState('')
const [availability,setAvailability] = useState({})

const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

const timeSlots = [
'9:00 AM',
'10:00 AM',
'11:00 AM',
'12:00 PM',
'1:00 PM',
'2:00 PM',
'3:00 PM',
'4:00 PM'
]

const defaultAvailability = {
Sunday:[],
Monday:[],
Tuesday:[],
Wednesday:[],
Thursday:[],
Friday:[],
Saturday:[]
}


/* ================= FETCH PROFILE ================= */

useEffect(()=>{
fetchProfile()
},[])


const fetchProfile = async ()=>{

const { data:userData } = await supabase.auth.getUser()
const user = userData?.user

if(!user){
alert("Login required")
return
}

let { data } = await supabase
.from("lawyers")
.select("*")
.eq("id",user.id)
.single()

if(!data){

await supabase.from("lawyers").insert([
{
id:user.id,
availability:defaultAvailability
}
])

const res = await supabase
.from("lawyers")
.select("*")
.eq("id",user.id)
.single()

data = res.data

}

if(data){

setFirstName(data.first_name || '')
setLastName(data.last_name || '')
setPhone(data.phone || '')
setBarNumber(data.bar_number || '')
setYearsExp(data.experience || '')

setFee(data.consultation_fee || '')
setAbout(data.about || '')
setExpertise(data.expertise ? data.expertise.join(', ') : '')
setAvailability(data.availability || defaultAvailability)

}

}


/* ================= TOGGLE SLOT ================= */

const toggleSlot = (day,time)=>{

setAvailability(prev=>{

const daySlots = prev[day] || []

if(daySlots.includes(time)){

return {
...prev,
[day]:daySlots.filter(t=>t!==time)
}

}else{

return {
...prev,
[day]:[...daySlots,time]
}

}

})

}


/* ================= SAVE PROFILE ================= */

const handleSave = async ()=>{

setLoading(true)

const { data:userData } = await supabase.auth.getUser()
const user = userData?.user

if(!user){
alert("User not logged in")
setLoading(false)
return
}

const expertiseArray = expertise
.split(',')
.map(e=>e.trim())
.filter(e=>e!=='')

const { error } = await supabase
.from("lawyers")
.update({

first_name:firstName,
last_name:lastName,
phone:phone,
bar_number:barNumber,
experience:Number(yearsExp),

consultation_fee:Number(fee),
about:about,
expertise:expertiseArray,
availability:availability

})
.eq("id",user.id)

setLoading(false)

if(error){

console.log(error)
alert("Update failed")

}else{

alert("Profile updated successfully")

}

}



/* ================= UI ================= */

return (

<div className="min-h-screen bg-gray-100 p-6 md:p-10">

<div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">

<div className="flex justify-between mb-6">

<h1 className="text-2xl font-bold">
Edit Lawyer Profile
</h1>

<Link to="/dashboard">
<button className="px-4 py-2 bg-gray-600 text-white rounded">
Back Dashboard
</button>
</Link>

</div>


{/* BASIC INFORMATION */}

<h2 className="text-xl font-semibold mb-4">
Basic Information
</h2>


<div className="grid md:grid-cols-2 gap-4 mb-6">

<div>
<label className="font-semibold">First Name</label>
<input
value={firstName}
onChange={(e)=>setFirstName(e.target.value)}
className="w-full border p-2 rounded mt-2"
/>
</div>

<div>
<label className="font-semibold">Last Name</label>
<input
value={lastName}
onChange={(e)=>setLastName(e.target.value)}
className="w-full border p-2 rounded mt-2"
/>
</div>

</div>


<div className="grid md:grid-cols-2 gap-4 mb-6">

<div>
<label className="font-semibold">Phone Number</label>
<input
value={phone}
onChange={(e)=>setPhone(e.target.value)}
className="w-full border p-2 rounded mt-2"
/>
</div>

<div>
<label className="font-semibold">Bar Number</label>
<input
value={barNumber}
onChange={(e)=>setBarNumber(e.target.value)}
className="w-full border p-2 rounded mt-2"
/>
</div>

</div>


<div className="mb-6">

<label className="font-semibold">Years of Experience</label>

<input
type="number"
value={yearsExp}
onChange={(e)=>setYearsExp(e.target.value)}
className="w-full border p-2 rounded mt-2"
/>

</div>



{/* CONSULTATION FEE */}

<div className="mb-6">

<label className="font-semibold">
Consultation Fee (BDT)
</label>

<input
type="number"
value={fee}
onChange={(e)=>setFee(e.target.value)}
className="w-full border p-2 rounded mt-2"
/>

</div>



{/* ABOUT */}

<div className="mb-6">

<label className="font-semibold">
About
</label>

<textarea
value={about}
onChange={(e)=>setAbout(e.target.value)}
className="w-full border p-2 rounded mt-2 h-28"
/>

</div>



{/* EXPERTISE */}

<div className="mb-6">

<label className="font-semibold">
Expertise (comma separated)
</label>

<input
value={expertise}
onChange={(e)=>setExpertise(e.target.value)}
className="w-full border p-2 rounded mt-2"
/>

</div>



{/* AVAILABILITY */}

<div className="mb-6">

<label className="font-semibold text-lg">
Availability (9AM–4PM)
</label>

{days.map(day=>(

<div key={day} className="mt-4">

<h3 className="font-bold mb-2">{day}</h3>

<div className="flex flex-wrap gap-2">

{timeSlots.map(time=>{

const active = availability[day]?.includes(time)

return (

<button
key={time}
type="button"
onClick={()=>toggleSlot(day,time)}
className={`px-3 py-1 rounded border
${active ? 'bg-green-600 text-white':'bg-gray-200'}`}
>

{time}

</button>

)

})}

</div>

</div>

))}

</div>



<button
onClick={handleSave}
disabled={loading}
className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg hover:bg-blue-700"
>

{loading ? "Saving..." : "Save Profile"}

</button>


</div>

</div>

)

}

export default EditLawyerProfile