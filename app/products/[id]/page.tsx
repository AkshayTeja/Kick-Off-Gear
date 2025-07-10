"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  AiFillStar,
  AiOutlineStar,
  AiFillHeart,
  AiOutlineHeart,
} from "react-icons/ai";
import supabase from "../../supabaseClient";
import type { User } from "@supabase/supabase-js";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string;
  rating: number;
}

const ProductPage = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Fetch user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        setUser(user);

        // Fetch product
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("id, name, description, price, image_url, rating")
          .eq("id", id)
          .single();
        if (productError) throw productError;
        if (!productData) throw new Error("Product not found");
        setProduct(productData);

        if (user) {
          // Check if item is in cart
          const { data: cartData, error: cartError } = await supabase
            .from("cart")
            .select("id")
            .eq("user_id", user.id)
            .eq("item_id", id);
          if (cartError) throw cartError;
          setAddedToCart(cartData.length > 0);

          // Check if item is in wishlist
          const { data: wishlistData, error: wishlistError } = await supabase
            .from("wishlist")
            .select("id")
            .eq("user_id", user.id)
            .eq("item_id", id);
          if (wishlistError) throw wishlistError;
          setAddedToWishlist(wishlistData.length > 0);
        }
      } catch (err: any) {
        console.error("Fetch error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          setAddedToCart(false);
          setAddedToWishlist(false);
        } else {
          fetchProduct();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [id]);

  const handleToggleCart = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }

    try {
      if (addedToCart) {
        // Remove from cart
        const { error } = await supabase
          .from("cart")
          .delete()
          .eq("item_id", id)
          .eq("user_id", user.id);
        if (error) throw error;
        setAddedToCart(false);
      } else {
        // Add to cart
        const { error } = await supabase.from("cart").insert({
          user_id: user.id,
          item_id: id,
          item_name: product!.name,
          item_description: product!.description || "No description available",
          item_price: product!.price,
          quantity: 1,
        });
        if (error) throw error;
        setAddedToCart(true);
      }
    } catch (err: any) {
      console.error("Cart error:", err.message);
      setError(err.message);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }

    try {
      if (addedToWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("item_id", id)
          .eq("user_id", user.id);
        if (error) throw error;
        setAddedToWishlist(false);
      } else {
        // Add to wishlist
        const { error } = await supabase.from("wishlist").insert({
          user_id: user.id,
          item_id: id,
          item_name: product!.name,
          item_price: product!.price,
        });
        if (error) throw error;
        setAddedToWishlist(true);
      }
    } catch (err: any) {
      console.error("Wishlist error:", err.message);
      setError(err.message);
    }
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

  if (!product) {
    return (
      <div className="text-center text-red-500 py-10">Product not found</div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Image Section */}
        <div className="relative w-full md:w-1/2 max-w-[500px] mx-auto">
          <Image
            className="w-full h-[400px] object-cover rounded-2xl shadow-sm"
            src={product.image_url}
            width={500}
            height={400}
            alt={product.name}
          />
          <button
            onClick={handleToggleWishlist}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-all duration-200 cursor-pointer z-10"
            aria-label={
              addedToWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            {addedToWishlist ? (
              <AiFillHeart className="text-blue-500 text-2xl" />
            ) : (
              <AiOutlineHeart className="text-gray-600 text-2xl" />
            )}
          </button>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          <div>{generateRating(product.rating)}</div>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            <del className="text-lg text-gray-400">
              ${(product.price + 20).toFixed(2)}
            </del>
          </div>
          <p className="text-gray-600">
            {product.description || "No description available"}
          </p>
          <button
            onClick={handleToggleCart}
            className={`w-full md:w-1/2 py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 transform hover:scale-105 ${
              addedToCart
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {addedToCart ? "Remove from Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
