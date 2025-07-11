"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AiFillHeart, AiFillStar, AiOutlineStar } from "react-icons/ai";
import supabase from "../supabaseClient";
import type { User } from "@supabase/supabase-js";

interface WishlistItem {
  id: string;
  item_id: string;
  item_name: string;
  item_price: number;
  item_description: string;
  img: string;
  rating: number;
}

const WishlistPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchWishlist = async () => {
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

        // Fetch wishlist items
        const { data: wishlistData, error: wishlistError } = await supabase
          .from("wishlist")
          .select("id, item_id, item_name, item_price")
          .eq("user_id", user.id);
        if (wishlistError) throw wishlistError;

        // Fetch product details
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("id, image_url, description, rating")
          .in(
            "id",
            wishlistData.map((item) => item.item_id)
          );
        if (productsError) throw productsError;

        // Merge wishlist and product data
        const wishlistWithDetails = wishlistData.map((item) => {
          const product = productsData.find((p) => p.id === item.item_id);
          return {
            id: item.id,
            item_id: item.item_id,
            item_name: item.item_name,
            item_price: item.item_price,
            item_description:
              product?.description || "No description available",
            img: product?.image_url || "/placeholder.jpg",
            rating: product?.rating || 0,
          };
        });
        setWishlistItems(wishlistWithDetails);
      } catch (err: any) {
        console.error("Fetch error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchWishlist();
        } else {
          router.push("/auth");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleRemoveFromWishlist = async (itemId: string) => {
    if (!user) {
      router.push("/auth");
      return;
    }

    try {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("item_id", itemId)
        .eq("user_id", user.id);
      if (error) throw error;

      setWishlistItems((prev) =>
        prev.filter((item) => item.item_id !== itemId)
      );
    } catch (err: any) {
      console.error("Remove wishlist error:", err.message);
      setError(`Failed to remove item: ${err.message}`);
    }
  };

  const handleProductClick = (itemId: string) => {
    router.push(`/products/${itemId}`);
  };

  const generateRating = (rating: number) => {
    const stars = Array(5)
      .fill(0)
      .map((_, index) =>
        index < rating ? (
          <AiFillStar key={index} />
        ) : (
          <AiOutlineStar key={index} />
        )
      );
    return (
      <div className="flex gap-1 text-[18px] text-yellow-400">{stars}</div>
    );
  };

  if (loading) {
    return <div className="text-center text-gray-600 py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  if (!user) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Wishlist</h1>
      {wishlistItems.length === 0 ? (
        <p className="text-center text-gray-500">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 max-w-[300px] w-full mx-auto overflow-hidden group"
            >
              <div
                className="cursor-pointer"
                onClick={() => handleProductClick(item.item_id)}
              >
                <div className="relative overflow-hidden">
                  <Image
                    className="w-full h-[200px] object-cover transition-transform duration-300 group-hover:scale-105"
                    src={item.img}
                    width={300}
                    height={200}
                    alt={item.item_name}
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4 space-y-3">
                  <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
                    {item.item_name}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {item.item_description}
                  </p>
                  <div>{generateRating(item.rating)}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-900">
                      ${item.item_price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFromWishlist(item.item_id)}
                className="w-full py-2 px-4 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <AiFillHeart className="text-white text-xl" />
                Remove from Wishlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
