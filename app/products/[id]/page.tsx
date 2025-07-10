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

interface Review {
  id: string;
  user_id: string;
  item_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

const ProductPage = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRating, setNewRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchProductAndReviews = async () => {
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

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("id, user_id, item_id, rating, comment, created_at")
          .eq("item_id", id)
          .order("created_at", { ascending: false });
        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);

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

    fetchProductAndReviews();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          setAddedToCart(false);
          setAddedToWishlist(false);
        } else {
          fetchProductAndReviews();
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

  const handlePurchase = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }

    try {
      // Check if item is already in cart
      const { data: cartData, error: cartError } = await supabase
        .from("cart")
        .select("id")
        .eq("user_id", user.id)
        .eq("item_id", id);
      if (cartError) throw cartError;

      if (cartData.length === 0) {
        // Add item to cart
        const { error: insertError } = await supabase.from("cart").insert({
          user_id: user.id,
          item_id: id,
          item_name: product!.name,
          item_description: product!.description || "No description available",
          item_price: product!.price,
          quantity: 1,
        });
        if (insertError) throw insertError;
        setAddedToCart(true);
      }

      // Redirect to checkout
      router.push("/cart");
    } catch (err: any) {
      console.error("Purchase error:", err.message);
      setError(err.message);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/auth");
      return;
    }
    if (!newRating) {
      setSubmitError("Please select a rating");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          user_id: user.id,
          item_id: id,
          rating: newRating,
          comment: newComment.trim() || null,
        })
        .select()
        .single();
      if (error) throw error;
      setReviews([
        { ...data, created_at: new Date().toISOString() },
        ...reviews,
      ]);
      setNewRating(0);
      setNewComment("");
      setSubmitError(null);
    } catch (err: any) {
      console.error("Review submission error:", err.message);
      setSubmitError(err.message);
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

  const handleStarClick = (rating: number) => {
    setNewRating(rating);
  };

  const generateStarInput = () => {
    return (
      <div className="flex gap-1 text-[18px] text-yellow-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            className="focus:outline-none"
          >
            {star <= newRating ? (
              <AiFillStar className="cursor-pointer" />
            ) : (
              <AiOutlineStar className="cursor-pointer" />
            )}
          </button>
        ))}
      </div>
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
          <div className="flex flex-col gap-4">
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
            <button
              onClick={handlePurchase}
              className="w-full md:w-1/2 py-3 px-6 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
            >
              Purchase Now
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          What Customers Say About This
        </h2>
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  {generateRating(review.rating)}
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No reviews yet for this product.</p>
        )}

        {/* Add Review Form */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Write a Review
          </h3>
          {user ? (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Rating</label>
                {generateStarInput()}
              </div>
              <div>
                <label htmlFor="comment" className="block text-gray-700 mb-1">
                  Comment
                </label>
                <textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Write your review here..."
                />
              </div>
              {submitError && (
                <p className="text-red-500 text-sm">{submitError}</p>
              )}
              <button
                type="submit"
                className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                Submit Review
              </button>
            </form>
          ) : (
            <p className="text-gray-600">
              Please{" "}
              <button
                onClick={() => router.push("/auth")}
                className="text-blue-600 hover:underline"
              >
                sign in
              </button>{" "}
              to write a review.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
