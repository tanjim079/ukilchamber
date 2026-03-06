import { useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {

const navigate = useNavigate();

useEffect(() => {
handleLogin();
}, []);

async function handleLogin() {

/* wait for session */

const { data: sessionData } = await supabase.auth.getSession();

const user = sessionData?.session?.user;

if (!user) {
navigate("/");
return;
}

/* read role from URL */

const params = new URLSearchParams(window.location.search);
const role = params.get("role");


/* CLIENT LOGIN */

if (role === "client") {

await supabase
.from("clients")
.upsert({
id: user.id,
email: user.email
});

navigate("/profile", { replace: true });
return;

}


/* LAWYER LOGIN */

if (role === "lawyer") {

await supabase
.from("lawyers")
.upsert({
id: user.id,
email: user.email
});

navigate("/dashboard", { replace: true });
return;

}

navigate("/");

}

return (

<div className="flex justify-center items-center h-screen">
<p className="text-lg">Signing you in...</p>
</div>

);

}