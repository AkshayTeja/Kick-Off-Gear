"use client";

import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

const SuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const saveOrder = async () => {
      try {
        // Fetch authenticated user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("User not authenticated");

        // Get session_id from URL
        const sessionId = new URLSearchParams(window.location.search).get(
          "session_id"
        );
        if (!sessionId) throw new Error("No session ID found in URL");

        // Fetch cart items
        const { data: cartItems, error: cartError } = await supabase
          .from("cart")
          .select("item_id, item_name, item_price, quantity")
          .eq("user_id", user.id);
        if (cartError) throw cartError;
        if (!cartItems || cartItems.length === 0)
          throw new Error("Cart is empty");

        // Calculate total amount
        const totalAmount = cartItems.reduce(
          (total, item) => total + item.item_price * (item.quantity || 1),
          0
        );

        // Save order to Supabase
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            stripe_session_id: sessionId,
            items: cartItems.map((item) => ({
              product_id: item.item_id,
              name: item.item_name,
              price: item.item_price,
              quantity: item.quantity || 1,
            })),
            total_amount: totalAmount,
            status: "paid",
            updated_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (orderError) throw orderError;

        // Store order ID for display
        setOrderId(orderData.id);

        // Clear cart
        const { error: deleteError } = await supabase
          .from("cart")
          .delete()
          .eq("user_id", user.id);
        if (deleteError) throw deleteError;

        console.log("Order saved and cart cleared:", orderData.id);
      } catch (err) {
        console.error("Success page error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    saveOrder();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center text-gray-600">
        Processing your order...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-600">
        Payment Successful!
      </h1>
      <p className="text-lg mb-4">Thank you for your purchase.</p>
      {orderId && (
        <p className="text-gray-600">
          Your order ID is: <span className="font-semibold">{orderId}</span>
        </p>
      )}
      <a
        href="/"
        className="mt-6 inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
      >
        Return to Home
      </a>
    </div>
  );
};

export default SuccessPage;
