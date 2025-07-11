"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoFootballSharp } from "react-icons/io5";
import supabase from "../app/supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile if already logged in
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/");
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isSignUp) {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        router.push("/home");
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/home");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6">
      <div className="w-full max-w-[90%] sm:max-w-md bg-white p-6 sm:p-8 rounded-lg shadow-lg">
        {/* Logo */}
        <div className="flex justify-center items-center mb-4 sm:mb-6">
          <IoFootballSharp className="text-3xl sm:text-4xl text-blue-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-blackish pl-2">
            KickOffGear
          </h1>
        </div>

        {/* Form Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
          {isSignUp ? "Create an Account" : "Sign In"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4 sm:mb-5">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium text-sm sm:text-base mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-gray-200 border p-2 sm:p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
              required
            />
          </div>
          <div className="mb-4 sm:mb-5">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium text-sm sm:text-base mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-gray-200 border p-2 sm:p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-xs sm:text-sm mb-4 sm:mb-5 text-center">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 sm:py-3 rounded-lg w-full hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {/* Toggle Link */}
        <p className="mt-4 sm:mt-6 text-center text-gray-600 text-sm sm:text-base">
          {isSignUp ? "Already have an account?" : "Need an account?"}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:underline ml-1 font-medium"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
