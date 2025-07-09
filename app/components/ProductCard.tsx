"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import supabase from "../supabaseClient";
import type { User } from "@supabase/supabase-js";

interface propsType {
  img: string;
  title: string;
  desc: string;
  rating: number;
  price: string;
  id: string; // Changed from number to string (UUID)
}

const ProductCard: React.FC<propsType> = ({
  img,
  title,
  desc,
  rating,
  price,
  id,
}) => {
  const [addedToCart, setAddedToCart] = useState(false);
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
          setLoading(false);
          return;
        }

        // Check if item is in cart
        const { data, error } = await supabase
          .from("cart")
          .select("id")
          .eq("user_id", user.id)
          .eq("item_id", id);
        if (error) throw error;
        setAddedToCart(data.length > 0);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

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
          item_name: title,
          item_description: desc,
          item_price: parseFloat(price),
          quantity: 1,
        });
        if (error) throw error;
        setAddedToCart(true);
      }
    } catch (err: any) {
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
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 max-w-[300px] w-full mx-auto overflow-hidden group">
      <div className="relative overflow-hidden">
        <Image
          className="w-full h-[200px] object-cover transition-transform duration-300 group-hover:scale-105"
          src={img}
          width={300}
          height={200}
          alt={title}
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="p-4 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
          {title}
        </h2>
        <p className="text-sm text-gray-500 line-clamp-2">{desc}</p>
        <div>{generateRating(rating)}</div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-900">${price}</span>
          <del className="text-sm text-gray-400">
            ${(parseFloat(price) + 20).toFixed(2)}
          </del>
        </div>
        <button
          onClick={handleToggleCart}
          className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-all duration-200 transform hover:scale-105 ${
            addedToCart
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {addedToCart ? "Remove from Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
