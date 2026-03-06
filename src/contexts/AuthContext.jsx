import { useState, useEffect, useContext, createContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

// create context
export const AuthContext = createContext(null);

// provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // =========================
  // Listen for auth session
  // =========================
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // =========================
  // Role based redirect
  // =========================
    const handleRoleBasedRedirect = (userData) => {
    const role = userData?.user_metadata?.role;
      
    console.log("Logged in role:", role); // debug
    
      if (role === "lawyer") {
        navigate("/dashboard", { replace: true });
      } else if (role === "client") {
        navigate("/lawyers", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    };

  // =========================
  // LOGIN
  // =========================
  const login = async (email, password, expectedRole) => {
  try {
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const actualRole = data.user?.user_metadata?.role;

    // 🚨 ROLE CHECK
    if (expectedRole && actualRole !== expectedRole) {
      await supabase.auth.signOut();
      throw new Error(`Please login from ${actualRole} login page`);
    }

    handleRoleBasedRedirect(data.user);
    return data.user;
  } catch (err) {
    setError(err.message);
    throw err;
  }
};

  // =========================
  // REGISTER
  // =========================
  const register = async ({
  email,
  password,
  role,
  firstName,
  lastName,
  phone,
  specialization,
  barNumber,
  experience,
}) => {
  try {
    setError(null);

    // 1️⃣ Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role } },
    });

    if (error) throw error;

    // 2️⃣ Get correct user (important)
    let userId = data?.user?.id;

    // If user null, get from session
    if (!userId) {
      const { data: sessionData } = await supabase.auth.getSession();
      userId = sessionData?.session?.user?.id;
    }

    if (!userId) throw new Error("User ID not found");

    // 3️⃣ Insert into lawyer table
    if (role === "lawyer") {
      const { error: insertError } = await supabase.from("lawyers").insert([
        {
          id: userId,
          email,
          first_name: firstName || "",
          last_name: lastName || "",
          phone: phone || "",
          specialization: specialization || "",
          bar_number: barNumber || "",
          experience: experience || "",
        },
      ]);

      if (insertError) {
        console.error("LAWYER INSERT ERROR:", insertError);
        throw insertError;
      }
    }

    // 4️⃣ Insert into client table
    if (role === "client") {
      const { error: insertError } = await supabase.from("clients").insert([
        {
          id: userId,
          email,
          first_name: firstName || "",
          last_name: lastName || "",
          phone: phone || "",
        },
      ]);

      if (insertError) throw insertError;
    }

    return true;
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    setError(err.message);
    throw err;
  }
};

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLawyer: user?.user_metadata?.role === "lawyer",
    isClient: user?.user_metadata?.role === "client",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// =========================
// useAuth hook (IMPORTANT)
// =========================
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;