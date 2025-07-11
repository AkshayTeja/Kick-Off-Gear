"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import supabase from "../supabaseClient";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string;
  rating: number;
}

interface CategoryPageProps {
  categoryName: string;
  pageTitle: string;
  description?: string;
}

const CategoryPage = ({
  categoryName,
  pageTitle,
  description,
}: CategoryPageProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch category ID
        const { data: category, error: categoryError } = await supabase
          .from("categories")
          .select("id")
          .eq("name", categoryName.toLowerCase())
          .single();
        if (categoryError) throw categoryError;
        if (!category) {
          throw new Error(`${categoryName} category not found`);
        }

        const categoryId = category.id;

        // Fetch products in the category
        const { data, error } = await supabase
          .from("products")
          .select("id, name, description, price, image_url, rating")
          .in(
            "id",
            await supabase
              .from("product_categories")
              .select("product_id")
              .eq("category_id", categoryId)
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
  }, [categoryName]);

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
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-blackish">
        {pageTitle}
      </h1>

      {description && (
        <div className="max-w-3xl mx-auto text-center mb-4">
          <p className="text-lg sm:text-xl text-gray-800 leading-relaxed">
            {description}
          </p>
        </div>
      )}

      <div>
        <div className="container pt-6">
          <div className="grid grid-cols-1 place-items-center sm:place-items-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 xl:gap-x-12 xl:gap-y-8">
            {products.length > 0 ? (
              products.map((item) => (
                <div
                  key={item.id}
                  className="w-full max-w-[300px] sm:max-w-none"
                >
                  <ProductCard
                    id={item.id}
                    img={item.image_url}
                    title={item.name}
                    desc={item.description || "No description available"}
                    rating={item.rating}
                    price={item.price.toFixed(2)}
                  />
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 col-span-full">
                No products found in the {categoryName} category.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
