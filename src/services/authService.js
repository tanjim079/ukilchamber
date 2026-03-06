import { supabase } from "../services/supabaseClient";

export async function signInWithGoogle(role){

await supabase.auth.signInWithOAuth({

provider:"google",

options:{
redirectTo:`${window.location.origin}/auth/callback?role=${role}`
}

});

}