"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import supabase from "../supabaseClient";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface CartItem {
  id: string;
  item_id: string;
  item_name: string;
  item_description: string;
  item_price: number;
  quantity: number;
}

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Validate environment variable
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setError("Stripe configuration is missing. Please contact support.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError)
          throw new Error("Failed to fetch user: " + userError.message);
        setUser(user);
        console.log("Authenticated user:", user?.id);

        if (!user) {
          router.push("/auth");
          return;
        }

        // Fetch cart items
        const { data, error } = await supabase
          .from("cart")
          .select(
            "id, item_id, item_name, item_description, item_price, quantity"
          )
          .eq("user_id", user.id);
        if (error) throw new Error("Failed to fetch cart: " + error.message);
        console.log("Fetched cart items:", data);

        // Validate cart items
        const validItems =
          data?.filter(
            (item: CartItem) =>
              typeof item.item_price === "number" &&
              typeof item.quantity === "number" &&
              item.quantity > 0
          ) || [];
        setCartItems(validItems);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const items = cartItems.map((item) => ({
        product_id: item.item_id,
        name: item.item_name,
        price: item.item_price * 100, // Convert to cents for Stripe
        quantity: item.quantity,
      }));
      console.log("Sending items to API:", items);

      if (items.length === 21) {
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
        }),
      });

      const responseData = await response.json();
      console.log("API response:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData.error || `Checkout failed (HTTP ${response.status})`
        );
      }

      const { sessionId } = responseData;
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      const { error: redirectError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (redirectError) {
        throw new Error(
          "Redirect to checkout failed: " + redirectError.message
        );
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center text-gray-600">
        <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="ml-2">Processing...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        {error}
        <button
          onClick={() => setError(null)}
          className="ml-4 text-blue-600 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-blackish">
        Checkout
      </h1>
      <div className="max-w-3xl mx-auto">
        {cartItems.length > 0 ? (
          <div className="mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between py-2">
                <span>
                  {item.item_name} (x{item.quantity})
                </span>
                <span>${(item.item_price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 font-bold">
              Total: $
              {cartItems
                .reduce(
                  (total, item) => total + item.item_price * item.quantity,
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
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          title={
            cartItems.length === 0
              ? "Cart is empty"
              : loading
              ? "Processing..."
              : "Proceed to Payment"
          }
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              Processing...
            </span>
          ) : (
            "Proceed to Payment"
          )}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
