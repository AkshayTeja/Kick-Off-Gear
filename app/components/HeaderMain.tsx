"use client";

import React, { useEffect, useState, useRef } from "react";
import { BiUser } from "react-icons/bi";
import { BsSearch } from "react-icons/bs";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import {
  IoFootballSharp,
  IoMenuOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { TiHomeOutline } from "react-icons/ti";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import supabase from "../supabaseClient";
import AudioSearch from "./AudioSearch";

interface Product {
  id: string;
  name: string;
  image_url: string;
  description?: string;
  category_names?: string[];
}

const HeaderMain = () => {
  const [user, setUser] = useState<User | null>(null);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [showFootballSubmenu, setShowFootballSubmenu] = useState(false);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const submenuTimeout = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const categories = [
    {
      name: "Football Jerseys",
      href: "/mens",
      subcategories: [
        { name: "Men", href: "/mens" },
        { name: "Women", href: "/womens" },
        { name: "Retro", href: "/retro" },
        { name: "Club", href: "/clubs" },
      ],
    },
    { name: "Football Shoes", href: "/football-shoes" },
    { name: "Footballs", href: "/footballs" },
    { name: "Accessories", href: "/accessories" },
  ];

  // Simple synonym dictionary for NLP
  const synonymMap: { [key: string]: string[] } = {
    jersey: ["shirt", "kit", "uniform"],
    shoe: ["boots", "cleats", "footwear"],
    ball: ["football", "soccer ball"],
    men: ["mens", "male"],
    women: ["womens", "female"],
    retro: ["vintage", "classic"],
  };

  useEffect(() => {
    // Validate environment variables
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setError("Supabase configuration is missing. Please contact support.");
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
        if (userError) {
          if (userError.message === "Auth session missing") {
            setUser(null);
            setWishlistCount(0);
            setCartCount(0);
            setLoading(false);
            return;
          }
          console.error("Fetch user error:", userError.message);
          setError(`Failed to fetch user: ${userError.message}`);
          setLoading(false);
          return;
        }
        setUser(user);

        if (!user) {
          setWishlistCount(0);
          setCartCount(0);
          setLoading(false);
          return;
        }

        // Fetch wishlist count
        const { count: wishlistCount, error: wishlistError } = await supabase
          .from("wishlist")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);
        if (wishlistError) {
          console.error("Fetch wishlist error:", wishlistError.message);
          setError(`Failed to fetch wishlist: ${wishlistError.message}`);
          setLoading(false);
          return;
        }
        setWishlistCount(wishlistCount || 0);

        // Fetch cart count
        const { count: cartCount, error: cartError } = await supabase
          .from("cart")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);
        if (cartError) {
          console.error("Fetch cart error:", cartError.message);
          setError(`Failed to fetch cart: ${cartError.message}`);
          setLoading(false);
          return;
        }
        setCartCount(cartCount || 0);
      } catch (err: any) {
        console.error("Unexpected fetch error:", err.message);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        try {
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchData();
          } else {
            setWishlistCount(0);
            setCartCount(0);
          }
        } catch (err: any) {
          console.error("Auth state change error:", err.message);
          setError(err.message || "An error occurred during authentication.");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  // NLP Search Logic
  const processSearchQuery = (query: string): string[] => {
    // Tokenize the query
    const tokens = query.toLowerCase().split(/\s+/);

    // Expand tokens with synonyms
    const expandedTerms = tokens.flatMap((token) =>
      synonymMap[token] ? [token, ...synonymMap[token]] : [token]
    );

    return Array.from(new Set(expandedTerms)); // Remove duplicates
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const searchTerms = processSearchQuery(searchTerm);

        // Build the query with joins to include category names
        let query = supabase
          .from("products")
          .select(
            `
            id,
            name,
            image_url,
            description,
            product_categories (
              categories (name)
            )
          `
          )
          .limit(5);

        // Build OR conditions for each term across name and description
        const orConditions = searchTerms
          .map((term) => `name.ilike.%${term}%,description.ilike.%${term}%`)
          .join(",");

        query = query.or(orConditions);

        const { data, error } = await query;

        if (error) throw new Error("Search failed: " + error.message);

        // Process data to include category names and filter by category matches
        const processedData: Product[] = (data || [])
          .map((product) => ({
            id: product.id,
            name: product.name,
            image_url: product.image_url,
            description: product.description,
            category_names: product.product_categories.map(
              (pc: any) => pc.categories.name
            ),
          }))
          .filter(
            (product) =>
              searchTerms.some((term) =>
                product.category_names?.some((cat) =>
                  cat.toLowerCase().includes(term)
                )
              ) ||
              searchTerms.some(
                (term) =>
                  product.name.toLowerCase().includes(term) ||
                  product.description?.toLowerCase().includes(term)
              )
          );

        // Simple relevance ranking: prioritize matches in name, then description, then category
        const rankedResults = processedData.sort((a, b) => {
          const aScore = calculateRelevance(a, searchTerms);
          const bScore = calculateRelevance(b, searchTerms);
          return bScore - aScore;
        });

        setSearchResults(rankedResults);
      } catch (err: any) {
        console.error("Search error:", err.message);
        setError(err.message || "Failed to fetch search results.");
      }
    };

    const debounce = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  // Calculate relevance score for ranking
  const calculateRelevance = (
    product: Product,
    searchTerms: string[]
  ): number => {
    let score = 0;
    const name = product.name?.toLowerCase() || "";
    const description = product.description?.toLowerCase() || "";
    const categoryNames = product.category_names || [];

    searchTerms.forEach((term) => {
      if (name.includes(term)) score += 3; // Higher weight for name matches
      if (description.includes(term)) score += 2; // Medium weight for description
      if (categoryNames.some((cat) => cat.toLowerCase().includes(term)))
        score += 1; // Lower weight for category
    });

    return score;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setSearchResults([]);
    }, 300);
  };

  const handleProfileClick = () => {
    router.push(user ? "/profile" : "/auth");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setShowCategoriesDropdown(false);
    setShowFootballSubmenu(false);
  };

  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setShowCategoriesDropdown(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setShowCategoriesDropdown(false);
      setShowFootballSubmenu(false);
    }, 150);
  };

  const handleSubmenuEnter = () => {
    if (submenuTimeout.current) clearTimeout(submenuTimeout.current);
    setShowFootballSubmenu(true);
  };

  const handleSubmenuLeave = () => {
    submenuTimeout.current = setTimeout(() => {
      setShowFootballSubmenu(false);
    }, 150);
  };

  const toggleFootballSubmenu = () => {
    setShowFootballSubmenu(!showFootballSubmenu);
  };

  const handleAudioSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleProductClick = () => {
    setSearchResults([]); // Clear search results
    setSearchTerm(""); // Optionally clear the search input
  };

  if (error) {
    return (
      <div className="bg-red-500 text-white p-4 text-center">
        {error}
        <button
          onClick={() => setError(null)}
          className="ml-4 text-white underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 py-5">
      <div className="container mx-auto px-4">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Logo and Hamburger Icon */}
          <div className="flex justify-between items-center mb-4">
            <Link
              href="/home"
              className="flex font-bold text-center text-blackish hover:opacity-80 transition-opacity"
            >
              <IoFootballSharp className="text-3xl text-blue-600" />
              <h1 className="pt-1 pl-1">KickOffGear</h1>
            </Link>
            <button
              className="text-gray-500 text-[30px]"
              onClick={toggleMenu}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <IoCloseOutline /> : <IoMenuOutline />}
            </button>
          </div>

          {/* Search Bar and Audio Button */}
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <input
                className="border-gray-200 border p-2 px-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="Search for products"
                value={searchTerm}
                onChange={handleSearchChange}
                onBlur={handleSearchBlur}
              />
              <BsSearch
                className="absolute right-0 top-0 mr-3 mt-3 text-gray-400"
                size={20}
              />
              {searchTerm.trim() && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-40">
                  {searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="flex items-center gap-4 p-3 hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleProductClick()} // Add click handler
                      >
                        <Image
                          src={product.image_url || "/placeholder.jpg"}
                          width={50}
                          height={50}
                          alt={product.name}
                          className="h-[50px] w-[50px] object-cover rounded"
                        />
                        <div>
                          <span className="text-gray-800">{product.name}</span>
                          {product.category_names &&
                            product.category_names.length > 0 && (
                              <span className="block text-sm text-gray-500">
                                {product.category_names.join(", ")}
                              </span>
                            )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <AudioSearch onSearch={handleAudioSearch} />
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between gap-8">
          {/* Logo */}
          <Link
            href="/home"
            className="flex font-bold text-center text-blackish hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <IoFootballSharp className="text-3xl text-blue-600" />
            <h1 className="pt-1 pl-1">KickOffGear</h1>
          </Link>

          {/* Search Bar and Audio Button Container */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <input
                className="border-gray-200 border p-2 px-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="Search for products"
                value={searchTerm}
                onChange={handleSearchChange}
                onBlur={handleSearchBlur}
              />
              <BsSearch
                className="absolute right-0 top-0 mr-3 mt-3 text-gray-400"
                size={20}
              />
              {searchTerm.trim() && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-40">
                  {searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="flex items-center gap-4 p-3 hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleProductClick()} // Add click handler
                      >
                        <Image
                          src={product.image_url || "/placeholder.jpg"}
                          width={50}
                          height={50}
                          alt={product.name}
                          className="h-[50px] w-[50px] object-cover rounded"
                        />
                        <div>
                          <span className="text-gray-800">{product.name}</span>
                          {product.category_names &&
                            product.category_names.length > 0 && (
                              <span className="block text-sm text-gray-500">
                                {product.category_names.join(", ")}
                              </span>
                            )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <AudioSearch onSearch={handleAudioSearch} />
            </div>
          </div>

          {/* Desktop Icons */}
          <div className="flex gap-4 text-gray-500 text-[30px] flex-shrink-0">
            <button onClick={handleProfileClick} aria-label="Profile">
              <BiUser />
            </button>
            <Link href="/wishlist" aria-label="Wishlist">
              <div className="relative">
                <FiHeart />
                {wishlistCount > 0 && (
                  <div className="bg-blue-600 rounded-full absolute -top-2 -right-2 w-[18px] h-[18px] text-[12px] text-white flex items-center justify-center">
                    {loading ? (
                      <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <span className="font-semibold">{wishlistCount}</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
            <Link href="/cart" aria-label="Cart">
              <div className="relative">
                <FiShoppingCart />
                {cartCount > 0 && (
                  <div className="bg-blue-600 rounded-full absolute -top-2 -right-2 w-[18px] h-[18px] text-[12px] text-white flex items-center justify-center">
                    {loading ? (
                      <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <span className="font-semibold">{cartCount}</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`lg:hidden fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col items-start py-6 px-4">
            <button
              className="self-end text-gray-500 text-[30px] mb-4"
              onClick={toggleMenu}
              aria-label="Close Menu"
            >
              <IoCloseOutline />
            </button>

            {/* Home */}
            <Link
              href="/home"
              className="py-2 text-gray-800 hover:text-blue-600 text-lg flex items-center gap-2"
              onClick={toggleMenu}
            >
              <TiHomeOutline size={24} />
              HOME
            </Link>

            {/* Profile */}
            <button
              className="py-2 text-gray-800 hover:text-blue-600 text-lg flex items-center gap-2"
              onClick={handleProfileClick}
            >
              <BiUser size={24} />
              PROFILE
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="py-2 text-gray-800 hover:text-blue-600 text-lg flex items-center gap-2"
              onClick={toggleMenu}
            >
              <div className="relative">
                <FiHeart size={24} />
                {wishlistCount > 0 && (
                  <div className="bg-blue-600 rounded-full absolute -top-2 -right-2 w-[18px] h-[18px] text-[12px] text-white flex items-center justify-center">
                    {loading ? (
                      <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <span className="font-semibold">{wishlistCount}</span>
                    )}
                  </div>
                )}
              </div>
              WISHLIST
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="py-2 text-gray-800 hover:text-blue-600 text-lg flex items-center gap-2"
              onClick={toggleMenu}
            >
              <div className="relative">
                <FiShoppingCart size={24} />
                {cartCount > 0 && (
                  <div className="bg-blue-600 rounded-full absolute -top-2 -right-2 w-[18px] h-[18px] text-[12px] text-white flex items-center justify-center">
                    {loading ? (
                      <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <span className="font-semibold">{cartCount}</span>
                    )}
                  </div>
                )}
              </div>
              CART
            </Link>

            {/* Categories */}
            <div className="relative py-2 w-full">
              <div
                className="flex items-center gap-1 text-gray-800 hover:text-blue-600 cursor-pointer text-lg"
                onClick={() =>
                  setShowCategoriesDropdown(!showCategoriesDropdown)
                }
              >
                CATEGORIES
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showCategoriesDropdown
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="mt-2 w-full bg-white rounded-md py-2">
                  {categories.map((category, index) => (
                    <div key={index} className="relative">
                      <div
                        className="flex items-center justify-between px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                        onClick={
                          category.name === "Football Jerseys"
                            ? toggleFootballSubmenu
                            : toggleMenu
                        }
                      >
                        <Link
                          href={category.href}
                          className="flex-grow"
                          onClick={(e) => {
                            if (category.name === "Football Jerseys") {
                              e.preventDefault();
                            }
                          }}
                        >
                          {category.name}
                        </Link>
                        {category.subcategories && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l-7 7 7 7"
                            />
                          </svg>
                        )}
                      </div>
                      {category.subcategories && (
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out pl-4 ${
                            showFootballSubmenu &&
                            category.name === "Football Jerseys"
                              ? "max-h-96 opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          {category.subcategories.map((sub, subIndex) => (
                            <Link
                              key={subIndex}
                              href={sub.href}
                              className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                              onClick={toggleMenu}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Individual category links */}
            <Link
              href="/mens"
              className="py-2 text-gray-800 hover:text-blue-600 text-lg"
              onClick={toggleMenu}
            >
              MEN&apos;S
            </Link>
            <Link
              href="/womens"
              className="py-2 text-gray-800 hover:text-blue-600 text-lg"
              onClick={toggleMenu}
            >
              WOMEN&apos;S
            </Link>
            <Link
              href="/retro"
              className="py-2 text-gray-800 hover:text-blue-600 text-lg"
              onClick={toggleMenu}
            >
              RETRO
            </Link>
            <Link
              href="/clubs"
              className="py-2 text-gray-800 hover:text-blue-600 text-lg"
              onClick={toggleMenu}
            >
              CLUBS
            </Link>
            <Link
              href="/hot-offers"
              className="py-2 text-gray-800 hover:text-blue-600 text-lg"
              onClick={toggleMenu}
            >
              HOT OFFERS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderMain;
