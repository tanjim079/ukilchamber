import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useLanguage } from "../../contexts/LanguageContext"
import { useTranslation } from "../../hooks/useTranslation"
import { ProfileButton } from "./navbar-profile"
import { useAuth } from "../../contexts/AuthContext"
import { supabase } from "../../services/supabaseClient"
import logo from "../../../public/logo drk.png"

const Navbar = () => {

  const [isOpen,setIsOpen] = useState(false)
  const [role,setRole] = useState(null)

  const { isAuthenticated,user,logout } = useAuth()

  const { language,changeLanguage } = useLanguage()
  const { t } = useTranslation()

  const location = useLocation()

  const navLinks = [
    { name:t("home"),path:"/" },
    { name:t("lawyers"),path:"/lawyers" },
    { name:t("resources"),path:"/legal-resources" },
    { name:t("blog"),path:"/blog" }
  ]


/* ---------------- ROLE DETECTION ---------------- */

useEffect(()=>{

async function detectRole(){

if(!user) return

const userId = user.id

// check client table
const { data:client } = await supabase
.from("clients")
.select("id")
.eq("id",userId)
.single()

if(client){

setRole("client")
return

}

// check lawyer table
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



/* ---------------- AUTH LINKS ---------------- */

const getAuthLinks = () => {

if(!isAuthenticated || !role) return []

if(role === "lawyer"){

return [
{ name:t("dashboard"),path:"/dashboard" }
]

}

if(role === "client"){

return [
{ name:t("profile"),path:"/profile" }
]

}

return []

}



/* ---------------- ACTIVE LINK ---------------- */

const isActive = (path)=> location.pathname === path



return (

<nav className="bg-white shadow-sm fixed w-full z-10">

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

<div className="flex justify-between h-16 items-center">

<Link to="/" className="flex items-center">
<img className="h-20 w-auto" src={logo} alt="Logo" />
</Link>


{/* DESKTOP NAVIGATION */}

<div className="hidden md:flex space-x-4">

{navLinks.map((link)=>(
<Link
key={link.path}
to={link.path}
className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
isActive(link.path)
? "text-blue-600 bg-blue-50"
: "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
}`}
>
{link.name}
</Link>
))}

</div>



{/* RIGHT SIDE */}

<div className="hidden md:flex items-center space-x-4">

<button
onClick={()=>changeLanguage("en")}
className={`px-3 py-1 text-sm rounded-md transition-all ${
language === "en"
? "bg-blue-100 text-blue-600"
: "text-gray-700 hover:bg-gray-100"
}`}
>
{t("english")}
</button>

<button
onClick={()=>changeLanguage("bn")}
className={`px-3 py-1 text-sm rounded-md transition-all ${
language === "bn"
? "bg-blue-100 text-blue-600"
: "text-gray-700 hover:bg-gray-100"
}`}
>
{t("bangla")}
</button>


{isAuthenticated ? (

<>

{getAuthLinks().map((link)=>(
<Link
key={link.path}
to={link.path}
className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
isActive(link.path)
? "text-blue-600 bg-blue-50"
: "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
}`}
>
{link.name}
</Link>
))}

<ProfileButton user={user} logout={logout} />

</>

) : (

<>

<Link
to="/client-login"
className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-all"
>
{t("login")}
</Link>

<Link
to="/client-signup"
className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-all"
>
{t("signup")}
</Link>

</>

)}

</div>



{/* MOBILE MENU BUTTON */}

<button
onClick={()=>setIsOpen(!isOpen)}
className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50"
>

<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">

{isOpen ? (
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
) : (
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
)}

</svg>

</button>

</div>

</div>



{/* MOBILE NAVIGATION */}

<div className={`${isOpen ? "block":"hidden"} md:hidden bg-white shadow-md px-4 pb-4 space-y-2`}>

{navLinks.map((link)=>(
<Link
key={link.path}
to={link.path}
className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
onClick={()=>setIsOpen(false)}
>
{link.name}
</Link>
))}


{isAuthenticated ? (

<>

{getAuthLinks().map((link)=>(
<Link
key={link.path}
to={link.path}
className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
onClick={()=>setIsOpen(false)}
>
{link.name}
</Link>
))}

<button
onClick={()=>{
logout()
setIsOpen(false)
}}
className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100"
>
{t("logout")}
</button>

</>

) : (

<>

<Link
to="/client-login"
className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
onClick={()=>setIsOpen(false)}
>
{t("login")}
</Link>

<Link
to="/client-signup"
className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
onClick={()=>setIsOpen(false)}
>
{t("signup")}
</Link>

</>

)}



<div className="flex justify-center space-x-2">

<button
onClick={()=>changeLanguage("en")}
className={`px-3 py-1 text-sm rounded-md ${
language === "en"
? "bg-blue-100 text-blue-600"
: "text-gray-700 hover:bg-gray-100"
}`}
>
{t("english")}
</button>

<button
onClick={()=>changeLanguage("bn")}
className={`px-3 py-1 text-sm rounded-md ${
language === "bn"
? "bg-blue-100 text-blue-600"
: "text-gray-700 hover:bg-gray-100"
}`}
>
{t("bangla")}
</button>

</div>

</div>

</nav>

)

}

export default Navbar