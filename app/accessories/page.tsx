"use client";

import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import supabase from "../supabaseClient";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string;
  rating: number;
}

const AccessoriesPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch mens category ID
        const { data: category, error: categoryError } = await supabase
          .from("categories")
          .select("id")
          .eq("name", "accessories")
          .single();
        if (categoryError) throw categoryError;
        if (!category) {
          throw new Error("Accessories category not found");
        }

        const accessoriesCategoryId = category.id;

        // Fetch products in the football accessories category
        const { data, error } = await supabase
          .from("products")
          .select("id, name, description, price, image_url, rating")
          .in(
            "id",
            await supabase
              .from("product_categories")
              .select("product_id")
              .eq("category_id", accessoriesCategoryId)
              .then(({ data }) => data?.map((item) => item.product_id) || [])
          )
          .order("created_at", { ascending: false });
        if (error) throw error;
        setProducts(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-blackish">
        Football Accessories
      </h1>

      <div className="max-w-3xl mx-auto text-center mb-4">
        <p className="text-xl text-gray-800 leading-relaxed">
          Discover our curated selection of football accessories, designed for
          style and performance. From classic designs to modern fits, find the
          perfect accessories to showcase your passion for the game.
        </p>
      </div>

      <div>
        <div className="container pt-10">
          <div className="grid grid-cols-1 place-items-center sm:place-items-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 xl:gap-x-20 xl:gap-y-10">
            {products.length > 0 ? (
              products.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  img={item.image_url}
                  title={item.name}
                  desc={item.description || "No description available"}
                  rating={item.rating}
                  price={item.price.toFixed(2)}
                />
              ))
            ) : (
              <p className="text-center text-gray-600 col-span-full">
                No products found in the Accessories category.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessoriesPage;
