import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin":
          process.env.NODE_ENV === "production"
            ? "https://yourdomain.com"
            : "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, x-client-info",
        "Access-Control-Max-Age": "86400",
      },
    }
  );
}

export async function POST(request) {
  try {
    // Log environment variables for debugging
    console.log("Environment variables:", {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY?.slice(0, 10),
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY?.slice(0, 10),
    });

    const { items, success_url, cancel_url } = await request.json();
    console.log("Request body:", { items, success_url, cancel_url });

    // Validate request body
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Invalid or empty items array");
    }
    if (!success_url || !cancel_url) {
      throw new Error("Missing success_url or cancel_url");
    }

    // Validate product IDs
    const productIds = items.map((item) => item.product_id).filter(Boolean);
    console.log("Product IDs:", productIds);
    if (productIds.length !== items.length) {
      throw new Error("Missing product_id in some items");
    }

    // Fetch products from Supabase
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, price")
      .in("id", productIds);

    if (productError) {
      console.error("Supabase error:", productError);
      throw new Error(`Product validation failed: ${productError.message}`);
    }

    console.log("Fetched products:", products);

    // Check if products match items
    if (!products || products.length !== items.length) {
      console.error("Product validation failed:", {
        itemsCount: items.length,
        productsCount: products ? products.length : 0,
        productIds,
        products,
      });
      throw new Error(
        `Invalid products in cart: ${
          products ? "Mismatch in product count" : "No products found"
        }`
      );
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => {
        const product = products.find((p) => p.id === item.product_id);
        if (!product || product.price * 100 !== item.price) {
          console.error("Price mismatch:", {
            itemPrice: item.price,
            productPrice: product ? product.price * 100 : null,
            item,
            product,
          });
          throw new Error("Price mismatch");
        }
        return {
          price_data: {
            currency: "usd",
            product_data: { name: item.name },
            unit_amount: item.price,
          },
          quantity: item.quantity,
        };
      }),
      mode: "payment",
      success_url,
      cancel_url,
    });

    console.log("Stripe session created:", session.id);
    return NextResponse.json(
      { sessionId: session.id },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin":
            process.env.NODE_ENV === "production"
              ? "https://yourdomain.com"
              : "http://localhost:3000",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, x-client-info",
        },
      }
    );
  } catch (error) {
    console.error("Checkout error:", error.message, error.stack);
    return NextResponse.json(
      { error: error.message },
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin":
            process.env.NODE_ENV === "production"
              ? "https://yourdomain.com"
              : "http://localhost:3000",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, x-client-info",
        },
      }
    );
  }
}
