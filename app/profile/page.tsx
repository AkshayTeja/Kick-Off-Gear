"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import supabase from "../supabaseClient";
import type { User } from "@supabase/supabase-js";

interface Item {
  id: string;
  item_id: string;
  item_name: string;
  item_price: number;
  quantity?: number;
  purchased_at?: string;
  created_at?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [wishlist, setWishlist] = useState<Item[]>([]);
  const [purchases, setPurchases] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cartItems } = useCart();
  const router = useRouter();

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

        if (!user) {
          router.push("/auth");
          return;
        }

        // Fetch wishlist
        const { data: wishlistData, error: wishlistError } = await supabase
          .from("wishlist")
          .select("id, item_id, item_name, item_price, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (wishlistError) throw wishlistError;
        setWishlist(wishlistData || []);

        // Fetch purchases
        const { data: purchasesData, error: purchasesError } = await supabase
          .from("purchases")
          .select("id, item_id, item_name, item_price, purchased_at")
          .eq("user_id", user.id)
          .order("purchased_at", { ascending: false })
          .limit(5); // Limit to recent purchases
        if (purchasesError) throw purchasesError;
        setPurchases(purchasesData || []);

        setLoading(false);
      } catch (err: any) {
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
      setError(err.message);
    }
  };

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
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Details */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Profile Details</h2>
          {user ? (
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>User ID:</strong> {user.id}
              </p>
              <button
                onClick={handleSignOut}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-4"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <p>Redirecting to login...</p>
          )}
        </section>

        {/* Wishlist Items */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Wishlist</h2>
          {wishlist.length > 0 ? (
            <ul className="space-y-2">
              {wishlist.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.item_name}</span>
                  <span>${item.item_price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Your wishlist is empty.</p>
          )}
        </section>

        {/* Recently Purchased */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Recently Purchased</h2>
          {purchases.length > 0 ? (
            <ul className="space-y-2">
              {purchases.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.item_name}</span>
                  <span>${item.item_price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No recent purchases.</p>
          )}
        </section>

        {/* Top Items in Cart */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Top Items in Cart</h2>
          {cartItems.length > 0 ? (
            <ul className="space-y-2">
              {cartItems.slice(0, 5).map((item: Item) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.item_name}</span>
                  <span>
                    ${item.item_price.toFixed(2)} x {item.quantity || 1}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Your cart is empty.</p>
          )}
        </section>
      </div>
    </div>
  );
}
