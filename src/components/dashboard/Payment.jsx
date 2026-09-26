import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

const Payments = () => {

  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  //////////////////////////////////////////////////////
  // LOAD PAYMENTS
  //////////////////////////////////////////////////////
  const loadPayments = async () => {

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) return;

    //////////////////////////////////////////////////////
    // GET LAWYER CONSULTATION FEE
    //////////////////////////////////////////////////////
    const { data: lawyer } = await supabase
      .from("lawyers")
      .select("consultation_fee")
      .eq("id", user.id)
      .single();

    const fee = lawyer?.consultation_fee || 0;

    //////////////////////////////////////////////////////
    // GET PAID BOOKINGS
    //////////////////////////////////////////////////////
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("lawyer_id", user.id)
      .eq("payment_status", "paid")
      .order("booking_date", { ascending: false });

    const list = (bookings || []).map(b => ({
      ...b,
      amount: fee
    }));

    setPayments(list);

    //////////////////////////////////////////////////////
    // TOTAL EARNINGS
    //////////////////////////////////////////////////////
    const totalAmount = list.reduce((sum, p) => sum + p.amount, 0);
    setTotal(totalAmount);

    setLoading(false);
  };

  if (loading) {
    return <div className="p-6">Loading payments...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border">

      <h2 className="text-2xl font-bold mb-4">
        💰 Payment History
      </h2>

      {/* TOTAL */}
      <div className="bg-green-100 p-4 rounded mb-6">
        <h3 className="text-green-700 font-semibold text-lg">
          Total Earnings: {total} BDT
        </h3>
      </div>

      {payments.length === 0 ? (
        <p className="text-gray-500">No payments yet</p>
      ) : (

        <table className="w-full border text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Client</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Time</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>

          <tbody>

            {payments.map(p => (

              <tr key={p.id}>

                <td className="border p-2">
                  {p.client_name}
                </td>

                <td className="border p-2">
                  {p.booking_date}
                </td>

                <td className="border p-2">
                  {p.booking_time}
                </td>

                <td className="border p-2 text-green-600 font-semibold">
                  {p.amount} BDT
                </td>

                <td className="border p-2">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                    Paid
                  </span>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>
  );
};

export default Payments;