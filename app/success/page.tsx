"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import supabase from "../supabaseClient";

const SuccessPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Validate environment variables
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setError("Supabase configuration is missing. Please contact support.");
      setLoading(false);
      return;
    }

    const saveOrder = async () => {
      try {
        // Fetch authenticated user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError)
          throw new Error("Failed to fetch user: " + userError.message);
        if (!user) {
          router.push("/auth");
          return;
        }

        // Get session_id from URL
        const sessionId = new URLSearchParams(window.location.search).get(
          "session_id"
        );
        if (!sessionId)
          throw new Error(
            "No session ID found in URL. Please complete the checkout process."
          );

        // Fetch cart items
        const { data: cartItems, error: cartError } = await supabase
          .from("cart")
          .select("item_id, item_name, item_price, quantity")
          .eq("user_id", user.id);
        if (cartError)
          throw new Error("Failed to fetch cart: " + cartError.message);
        if (!cartItems || cartItems.length === 0) {
          throw new Error("Your cart is empty. Please add items to proceed.");
        }

        // Validate cart items
        const validItems = cartItems.filter(
          (item) =>
            typeof item.item_price === "number" &&
            typeof item.quantity === "number" &&
            item.quantity > 0
        );
        if (validItems.length === 0) throw new Error("Invalid cart items.");

        // Calculate total amount
        const totalAmount = validItems.reduce(
          (total, item) => total + item.item_price * item.quantity,
          0
        );

        // Save order to Supabase
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            stripe_session_id: sessionId,
            items: validItems.map((item) => ({
              product_id: item.item_id,
              name: item.item_name,
              price: item.item_price,
              quantity: item.quantity,
            })),
            total_amount: totalAmount,
            status: "paid",
            updated_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (orderError)
          throw new Error("Failed to save order: " + orderError.message);

        // Store order ID for display
        setOrderId(orderData.id);

        // Clear cart
        const { error: deleteError } = await supabase
          .from("cart")
          .delete()
          .eq("user_id", user.id);
        if (deleteError)
          throw new Error("Failed to clear cart: " + deleteError.message);

        console.log("Order saved and cart cleared:", orderData.id);
      } catch (err: any) {
        console.error("Success page error:", err);
        setError(
          err.message || "An unexpected error occurred during order processing."
        );
      } finally {
        setLoading(false);
      }
    };

    saveOrder();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center text-gray-600">
        <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="ml-2">Processing your order...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        <p>Error: {error}</p>
        <button
          onClick={() => router.push("/cart")}
          className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Return to Cart
        </button>
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
      <button
        onClick={() => router.push("/")}
        className="mt-6 inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
      >
        Return to Home
      </button>
    </div>
  );
};

export default SuccessPage;
