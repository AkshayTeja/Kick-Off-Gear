"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import supabase from "../supabaseClient";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        setUser(user);
        console.log("Authenticated user:", user?.id);

        if (!user) {
          window.location.href = "/auth";
          return;
        }

        // Fetch cart items
        const { data, error } = await supabase
          .from("cart")
          .select(
            "id, item_id, item_name, item_description, item_price, quantity"
          )
          .eq("user_id", user.id);
        if (error) throw error;
        console.log("Fetched cart items:", data);
        setCartItems(data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const items = cartItems.map((item) => ({
        product_id: item.item_id,
        name: item.item_name,
        price: item.item_price * 100,
        quantity: item.quantity || 1,
      }));
      console.log("Sending items to API:", items);

      if (items.length === 0) {
        throw new Error("Cart is empty");
      }

      const response = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/cart`,
          user_id: user.id, // Add user_id for webhook or order tracking
        }),
      });

      const responseData = await response.json();
      console.log("API response:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData.error || "Failed to create checkout session"
        );
      }

      const { sessionId } = responseData;
      const stripe = await stripePromise;
      const { error: redirectError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (redirectError) throw redirectError;
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center text-gray-600">
        Processing...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-blackish">
        Checkout
      </h1>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {cartItems.length > 0 ? (
          <div className="mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between py-2">
                <span>
                  {item.item_name} (x{item.quantity || 1})
                </span>
                <span>
                  ${(item.item_price * (item.quantity || 1)).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 font-bold">
              Total: $
              {cartItems
                .reduce(
                  (total, item) =>
                    total + item.item_price * (item.quantity || 1),
                  0
                )
                .toFixed(2)}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">Your cart is empty.</p>
        )}
        <button
          onClick={handleCheckout}
          disabled={loading || cartItems.length === 0}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
