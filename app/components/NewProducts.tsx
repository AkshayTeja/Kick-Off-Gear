"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import supabase from "../supabaseClient";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  rating: number;
}

const NewProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, description, price, image_url, rating");
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
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto pt-8 px-4">
        <h2 className="font-semibold text-2xl mb-4">Latest Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-10 xl:gap-x-20 xl:gap-y-10 place-items-center sm:place-items-start">
          {products.map((item) => (
            <div key={item.id} className="w-full max-w-[300px] sm:max-w-none">
              <ProductCard
                id={item.id}
                img={item.image_url}
                title={item.name}
                desc={item.description}
                rating={item.rating}
                price={item.price.toString()}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewProducts;
