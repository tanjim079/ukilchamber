import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';

const EditProfile = () => {

const navigate = useNavigate();

const [user,setUser] = useState(null)

const [form,setForm] = useState({
first_name:"",
last_name:"",
phone:"",
location:""
})

const [loading,setLoading] = useState(false)

useEffect(()=>{

loadProfile()

},[])


async function loadProfile(){

const { data:userData } = await supabase.auth.getUser()

const user = userData.user

setUser(user)

const { data } = await supabase
.from("clients")
.select("*")
.eq("id",user.id)
.single()

if(data){

setForm({
first_name:data.first_name || "",
last_name:data.last_name || "",
phone:data.phone || "",
location:data.location || ""
})

}

}



function handleChange(e){

setForm({
...form,
[e.target.name]:e.target.value
})

}



async function handleSubmit(e){

e.preventDefault()

try{

setLoading(true)

await supabase
.from("clients")
.update({

first_name:form.first_name,
last_name:form.last_name,
phone:form.phone,
location:form.location

})
.eq("id",user.id)

navigate("/profile")

}catch(err){

console.error(err)

}finally{

setLoading(false)

}

}



return(

<div className="max-w-xl mx-auto p-6">

<div className="flex items-center gap-4 mb-6">
<button
onClick={() => navigate("/profile")}
className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-700"
title="Go Back"
>
<ArrowLeft className="w-5 h-5"/>
</button>

<h1 className="text-2xl font-bold">
Edit Profile
</h1>
</div>

<form onSubmit={handleSubmit} className="space-y-4">

<div>

<label className="block text-sm font-medium">
First Name
</label>

<input
name="first_name"
value={form.first_name}
onChange={handleChange}
className="w-full border px-3 py-2 rounded"
/>

</div>


<div>

<label className="block text-sm font-medium">
Last Name
</label>

<input
name="last_name"
value={form.last_name}
onChange={handleChange}
className="w-full border px-3 py-2 rounded"
/>

</div>


<div>

<label className="block text-sm font-medium">
Phone
</label>

<input
name="phone"
value={form.phone}
onChange={handleChange}
className="w-full border px-3 py-2 rounded"
/>

</div>


<div>

<label className="block text-sm font-medium">
Location
</label>

<input
name="location"
value={form.location}
onChange={handleChange}
className="w-full border px-3 py-2 rounded"
/>

</div>


<button
type="submit"
disabled={loading}
className="bg-blue-600 text-white px-6 py-2 rounded"
>

{loading ? "Saving..." : "Save Changes"}

</button>

</form>

</div>

)

}

export default EditProfile