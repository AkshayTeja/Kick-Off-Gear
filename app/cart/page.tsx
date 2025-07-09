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
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-gray-600">Your cart is empty!</p>
      ) : (
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{item.item_name}</h3>
                {item.item_description && (
                  <p className="text-gray-600 text-sm">
                    {item.item_description}
                  </p>
                )}
                <p className="font-bold">
                  ${item.item_price.toFixed(2)}{" "}
                  {item.quantity > 1 && `x ${item.quantity}`}
                </p>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:underline text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      <Link
        href="/"
        className="mt-6 inline-block text-blue-500 hover:underline"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
