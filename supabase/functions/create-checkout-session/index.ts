import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

// Support both local and production origins
const allowedOrigins = ["http://localhost:3000", "https://yourdomain.com"]; // Replace with your production domain
const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info",
  "Access-Control-Max-Age": "86400",
});

serve(async (req) => {
  const origin = req.headers.get("Origin") || "";

  // Handle CORS preflight (OPTIONS) request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

  // Handle POST request
  if (req.method === "POST") {
    try {
      const { items, success_url, cancel_url } = await req.json();

      // Validate items against Supabase products table
      const { data: products, error: productError } = await supabase
        .from("products")
        .select("id, price")
        .in("id", items.map((item: { product_id: string }) => item.product_id));

      if (productError) throw new Error(`Product validation failed: ${productError.message}`);
      if (!products || products.length !== items.length) throw new Error("Invalid products in cart");

      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: items.map((item: { product_id: string; name: string; price: number; quantity: number }) => {
          const product = products.find((p: { id: string }) => p.id === item.product_id);
          if (!product || product.price * 100 !== item.price) throw new Error("Price mismatch");
          return {
            price_data: {
              currency: "usd",
              product_data: { name: item.name },
              unit_amount: item.price, // Price in cents
            },
            quantity: item.quantity,
          };
        }),
        mode: "payment",
        success_url,
        cancel_url,
      });

      return new Response(JSON.stringify({ sessionId: session.id }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      });
    }
  }

  // Handle unsupported methods
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
});