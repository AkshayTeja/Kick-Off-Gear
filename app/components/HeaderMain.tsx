"use client";

import React, { useEffect, useState } from "react";
import { BiUser } from "react-icons/bi";
import { BsSearch } from "react-icons/bs";
import { FiHeart } from "react-icons/fi";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { IoFootballSharp } from "react-icons/io5";
import Link from "next/link";
import Image from "next/image";
import supabase from "../supabaseClient";

interface Product {
  id: string;
  name: string;
  image_url: string;
}

const HeaderMain = () => {
  const [user, setUser] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);

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
          setWishlistCount(0);
          setCartCount(0);
          setLoading(false);
          return;
        }

        // Fetch wishlist count
        const { data: wishlistData, error: wishlistError } = await supabase
          .from("wishlist")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);
        if (wishlistError) throw wishlistError;
        setWishlistCount(wishlistData.length);

        // Fetch cart count
        const { data: cartData, error: cartError } = await supabase
          .from("cart")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);
        if (cartError) throw cartError;
        setCartCount(cartData.length);
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
        if (session?.user) {
          fetchData();
        } else {
          setWishlistCount(0);
          setCartCount(0);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, image_url")
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .limit(5);
        if (error) throw error;
        setSearchResults(data || []);
      } catch (err: any) {
        console.error("Search error:", err.message);
        setError(err.message);
      }
    };

    const debounce = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setSearchResults([]);
    }, 200); // Delay to allow clicks on results
  };

  const handleProfileClick = () => {
    if (user) {
      window.location.href = "/profile";
    } else {
      window.location.href = "/auth";
    }
  };

  return (
    <div className="border-b border-gray-200 py-6">
      <div className="container sm:flex justify-between items-center gap-5">
        {/* Logo */}
        <Link
          href="/"
          className="flex font-bold text-center pb-4 sm:pb-0 text-blackish hover:opacity-80 transition-opacity"
        >
          <IoFootballSharp className="text-3xl text-blue-600" />
          <h1 className="pt-1 pl-1">KickOffGear</h1>
        </Link>

        <div className="w-full sm:w-[300px] md:w-[70%] relative">
          <input
            className="border-gray-200 border p-2 px-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="What are you looking for?"
            value={searchTerm}
            onChange={handleSearchChange}
            onBlur={handleSearchBlur}
          />
          <BsSearch
            className="absolute right-0 top-0 mr-3 mt-3 text-gray-400"
            size={20}
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50">
              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex items-center gap-4 p-3 hover:bg-gray-100 transition-colors"
                >
                  <Image
                    src={product.image_url || "/placeholder.jpg"}
                    width={50}
                    height={50}
                    alt={product.name}
                    className="h-[50px] w-[50px] object-cover rounded"
                  />
                  <span className="text-gray-800">{product.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:flex gap-4 text-gray-500 text-[30px]">
          <button onClick={handleProfileClick}>
            <BiUser />
          </button>

          <Link href="/wishlist">
            <div className="relative">
              <FiHeart />
              <div className="bg-blue-600 rounded-full absolute top-0 right-0 w-[18px] h-[18px] text-[12px] text-white grid place-items-center translate-x-1 -translate-y-1">
                {loading ? 0 : wishlistCount}
              </div>
            </div>
          </Link>

          <Link href="/cart">
            <div className="relative">
              <HiOutlineShoppingBag />
              <div className="bg-blue-600 rounded-full absolute top-0 right-0 w-[18px] h-[18px] text-[12px] text-white grid place-items-center translate-x-1 -translate-y-1">
                {loading ? 0 : cartCount}
              </div>
            </div>
          </Link>
        </div>
      </div>
      {error && <div className="text-center text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default HeaderMain;
