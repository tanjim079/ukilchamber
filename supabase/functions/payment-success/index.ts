import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  try {
    const body = await req.formData();
    const status = body.get("status");
    const tran_id = body.get("tran_id");
    const booking_id = body.get("value_a");

    console.log("PAYMENT STATUS:", status);
    console.log("BOOKING ID:", booking_id);

    const baseUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:5173";
    let redirectUrl = `${baseUrl}/profile?payment=error`;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ✅ ALWAYS LOG THE TRANSACTION FOR ACCOUNTING
    const paymentData = {
      booking_id: booking_id || null,
      tran_id: tran_id || "UNKNOWN",
      amount: Number(body.get("amount") || 0),
      currency: body.get("currency") || "BDT",
      status: status || "UNKNOWN",
      payment_method: body.get("card_type") || "unknown",
      gateway_response: Object.fromEntries(body.entries()),
    };

    const { error: paymentError } = await supabase
      .from("payments")
      .insert([paymentData]);

    if (paymentError) {
      console.error("Failed to insert payment log:", paymentError);
    }

    // ✅ UPDATE BOOKING IF SUCCESSFUL
    if (status === "VALID" || status === "VALIDATED") {
      await supabase
        .from("bookings")
        .update({
          payment_status: "paid",
          status: "accepted",
        })
        .eq("id", booking_id);

      redirectUrl = `${baseUrl}/profile?payment=success&booking_id=${booking_id}`;
    } else if (status === "FAILED") {
      redirectUrl = `${baseUrl}/profile?payment=failed`;
    } else if (status === "CANCELLED") {
      redirectUrl = `${baseUrl}/profile?payment=cancelled`;
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl,
      },
    });

  } catch (err) {
    console.error("PAYMENT CALLBACK ERROR:", err);
    return new Response("Error", { status: 500 });
  }
});