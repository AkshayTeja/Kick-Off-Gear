"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../supabaseClient";
import type { User } from "@supabase/supabase-js";

interface WishlistItem {
  id: string;
  item_id: string;
  item_name: string;
  item_price: number;
  created_at?: string;
}

interface CartItem {
  id: string;
  item_id: string;
  item_name: string;
  item_price: number;
  quantity?: number;
  created_at?: string;
}

interface Order {
  id: string;
  stripe_session_id: string;
  items: {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total_amount: number;
  status: string;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

        // Fetch wishlist
        const { data: wishlistData, error: wishlistError } = await supabase
          .from("wishlist")
          .select("id, item_id, item_name, item_price, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (wishlistError) throw wishlistError;
        setWishlist(wishlistData || []);

        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select(
            "id, stripe_session_id, items, total_amount, status, created_at"
          )
          .eq("user_id", user.id)
          .eq("status", "paid")
          .order("created_at", { ascending: false })
          .limit(5);
        if (ordersError) throw ordersError;
        setOrders(ordersData || []);

        // Fetch cart items
        const { data: cartData, error: cartError } = await supabase
          .from("cart")
          .select("id, item_id, item_name, item_price, quantity, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (cartError) throw cartError;
        setCartItems(cartData || []);

        setLoading(false);
      } catch (err: any) {
        console.error("Fetch error:", err.message);
        setError(err.message);
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
        } else {
          fetchData();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth");
    } catch (err: any) {
      console.error("Sign out error:", err.message);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center text-gray-600">
        Loading...
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
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Details */}
        <section className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Profile Details
          </h2>
          {user ? (
            <div className="space-y-3">
              <p className="text-gray-600">
                <strong className="font-semibold">Email:</strong> {user.email}
              </p>
              <p className="text-gray-600">
                <strong className="font-semibold">User ID:</strong> {user.id}
              </p>
              <button
                onClick={handleSignOut}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <p className="text-gray-600">Redirecting to login...</p>
          )}
        </section>

        {/* Wishlist Items */}
        <section className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Wishlist</h2>
          {wishlist.length > 0 ? (
            <ul className="space-y-3 mb-4">
              {wishlist.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <span className="text-gray-700">{item.item_name}</span>
                  <span className="text-gray-600 font-semibold">
                    ${item.item_price.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 mb-4">Your wishlist is empty.</p>
          )}
          <button
            onClick={() => router.push("/wishlist")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            View Wishlist
          </button>
        </section>

        {/* Recent Orders */}
        <section className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Recent Orders
          </h2>
          {orders.length > 0 ? (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">
                      Order #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2">
                    {order.items.map((item, index) => (
                      <div
                        key={`${order.id}-${index}`}
                        className="flex justify-between py-1"
                      >
                        <span className="text-gray-600">
                          {item.name} (x{item.quantity})
                        </span>
                        <span className="text-gray-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <span className="text-gray-700 font-bold">
                      Total: ${order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No recent orders.</p>
          )}
        </section>

        {/* Top Items in Cart */}
        <section className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Items in Cart
          </h2>
          {cartItems.length > 0 ? (
            <ul className="space-y-3">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <span className="text-gray-700">
                    {item.item_name} (x{item.quantity || 1})
                  </span>
                  <span className="text-gray-600 font-semibold">
                    ${(item.item_price * (item.quantity || 1)).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Your cart is empty.</p>
          )}
          {cartItems.length > 0 && (
            <button
              onClick={() => router.push("/checkout")}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Proceed to Checkout
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
