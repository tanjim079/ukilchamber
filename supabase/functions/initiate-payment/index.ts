import { serve } from "https://deno.land/std/http/server.ts";

//////////////////////////////////////////////////////
// ✅ CORS HEADERS
//////////////////////////////////////////////////////
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {

  //////////////////////////////////////////////////////
  // ✅ HANDLE PREFLIGHT
  //////////////////////////////////////////////////////
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {

    //////////////////////////////////////////////////////
    // ✅ GET BODY
    //////////////////////////////////////////////////////
    const body = await req.json();
    console.log("REQUEST BODY:", body);

    const { amount, name, email, phone, booking_id } = body;

    //////////////////////////////////////////////////////
    // ❗ VALIDATION
    //////////////////////////////////////////////////////
    if (!amount || !booking_id) {
      return new Response(JSON.stringify({
        error: "Missing amount or booking_id",
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    //////////////////////////////////////////////////////
    // ✅ ENV VARIABLES
    //////////////////////////////////////////////////////
    const store_id = Deno.env.get("SSL_STORE_ID") || "";
    const store_passwd = Deno.env.get("SSL_STORE_PASSWORD") || "";

    // 🔥 FRONTEND URL (IMPORTANT)
    const baseUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:5173";

    console.log("FRONTEND_URL:", baseUrl);
    console.log("AMOUNT:", amount);

    //////////////////////////////////////////////////////
    // ✅ PAYMENT DATA
    //////////////////////////////////////////////////////
    const data: Record<string, string> = {
      store_id,
      store_passwd,

      total_amount: amount.toString(),
      currency: "BDT",

      tran_id: "TXN_" + booking_id + "_" + Date.now(),

      //////////////////////////////////////////////////////
      // ✅ CLEAN ROUTES (BROWSER ROUTER)
      //////////////////////////////////////////////////////
      success_url: `${Deno.env.get("SUPABASE_URL") ?? "http://127.0.0.1:54321"}/functions/v1/payment-success`,
      fail_url: `${Deno.env.get("SUPABASE_URL") ?? "http://127.0.0.1:54321"}/functions/v1/payment-success`,
      cancel_url: `${Deno.env.get("SUPABASE_URL") ?? "http://127.0.0.1:54321"}/functions/v1/payment-success`,

      //////////////////////////////////////////////////////
      // IMPORTANT
      //////////////////////////////////////////////////////
      value_a: booking_id,

      shipping_method: "NO",
      product_name: "Consultation",
      product_category: "Service",
      product_profile: "general",

      cus_name: name,
      cus_email: email,
      cus_phone: phone,
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
    };

    //////////////////////////////////////////////////////
    // ✅ CONVERT TO FORM DATA
    //////////////////////////////////////////////////////
    const formData = new URLSearchParams();

    for (const key in data) {
      formData.append(key, data[key]);
    }

    //////////////////////////////////////////////////////
    // ✅ CALL SSL
    //////////////////////////////////////////////////////
    const isLive = Deno.env.get("SSL_IS_LIVE") === "true";
    const sslUrl = isLive 
      ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
      : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

    const response = await fetch(
      sslUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      }
    );

    const result = await response.json();

    console.log("SSL RESPONSE:", result);

    //////////////////////////////////////////////////////
    // ✅ RETURN RESPONSE
    //////////////////////////////////////////////////////
    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  } catch (error) {

    console.error("ERROR:", error);

    return new Response(JSON.stringify({
      error: error.message,
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});