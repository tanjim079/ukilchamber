import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../../services/supabaseClient"

export const ProfileButton = ({ user, logout }) => {

const [open,setOpen] = useState(false)
const [role,setRole] = useState(null)

useEffect(()=>{

async function detectRole(){

if(!user) return

const userId = user.id

const { data:client } = await supabase
.from("clients")
.select("id")
.eq("id",userId)
.single()

if(client){
setRole("client")
return
}

const { data:lawyer } = await supabase
.from("lawyers")
.select("id")
.eq("id",userId)
.single()

if(lawyer){
setRole("lawyer")
}

}

detectRole()

},[user])


const profileLink = role === "lawyer" ? "/dashboard" : "/profile"


return (

<div className="relative">

<button
onClick={()=>setOpen(!open)}
className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white font-bold"
>

{user?.email?.charAt(0).toUpperCase()}

</button>


{open && (

<div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border">

<div className="px-4 py-2 text-sm text-gray-700 border-b">

{user?.email}

</div>


<Link
to={profileLink}
className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
>

Profile

</Link>


<button
onClick={logout}
className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
>

Logout

</button>

</div>

)}

</div>

)

}