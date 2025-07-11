"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import supabase from "../supabaseClient";
import type { User } from "@supabase/supabase-js";

interface CartItem {
  id: string;
  item_id: string;
  item_name: string;
  item_description: string | null;
  item_price: number;
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError && userError.message !== "Auth session missing") {
          throw new Error("Failed to fetch user: " + userError.message);
        }
        if (!user) {
          router.push("/auth");
          return;
        }
        setUser(user);

        // Fetch cart items
        const { data, error } = await supabase
          .from("cart")
          .select(
            "id, item_id, item_name, item_description, item_price, quantity"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setCartItems(data || []);
      } catch (err: any) {
        console.error("Fetch error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          router.push("/auth");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      const { error } = await supabase
        .from("cart")
        .update({ quantity: newQuantity })
        .eq("id", cartItemId)
        .eq("user_id", user?.id);
      if (error) throw error;

      // Update local state
      setCartItems(
        cartItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from("cart")
        .delete()
        .eq("id", cartItemId)
        .eq("user_id", user?.id);
      if (error) throw error;

      // Update local state
      setCartItems(cartItems.filter((item) => item.id !== cartItemId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for coupon code logic
    setCouponError("Coupon codes are not supported yet.");
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.item_price * item.quantity,
    0
  );
  const taxRate = 0.08; // 8% tax rate
  const tax = subtotal * taxRate;
  const shipping = 0; // Free shipping
  const total = subtotal + tax + shipping;

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Your Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">Your cart is empty!</p>
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="hidden sm:grid sm:grid-cols-5 gap-2 bg-gray-100 p-3 font-semibold text-gray-700 text-sm">
                <div className="col-span-2">Product</div>
                <div>Price</div>
                <div>Quantity</div>
                <div>Total</div>
              </div>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-gray-200 p-3 sm:p-4 flex flex-col sm:grid sm:grid-cols-5 gap-2 sm:gap-4 items-start sm:items-center"
                >
                  <div className="col-span-2">
                    <h3 className="font-medium text-base sm:text-lg">
                      {item.item_name}
                    </h3>
                    {item.item_description && (
                      <p className="text-gray-600 text-xs sm:text-sm">
                        {item.item_description}
                      </p>
                    )}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:underline text-xs sm:text-sm mt-2"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-sm sm:text-base">
                    ${item.item_price.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="text-sm sm:text-base">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm sm:text-base">
                    ${(item.item_price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/"
              className="mt-4 inline-block text-blue-600 hover:underline font-medium text-sm sm:text-base"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                Order Summary
              </h2>
              <div className="space-y-2 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-base sm:text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <form onSubmit={applyCoupon} className="mt-4">
                <label
                  htmlFor="coupon"
                  className="block text-gray-700 mb-1 text-sm sm:text-base"
                >
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Enter coupon code"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-red-500 text-xs sm:text-sm mt-2">
                    {couponError}
                  </p>
                )}
              </form>
              <button
                onClick={() => router.push("/checkout")}
                className="w-full mt-4 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm sm:text-base"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
