// app/womens/page.tsx
"use client";
import React, { useState } from "react";

const categories = ["All", "Football Jerseys", "Training Kits", "Running Shoes", "Winter Gear", "Accessories"];

const products = [
  { id: 1, name: "Women's Football Jersey", category: "Football Jerseys" },
  { id: 2, name: "Women's Training Kit", category: "Training Kits" },
  { id: 3, name: "Women's Running Shoes", category: "Running Shoes" },
  { id: 4, name: "Winter Jacket - Women", category: "Winter Gear" },
  { id: 5, name: "Headband", category: "Accessories" },
];

const WomensPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Women's Collection</h1>

      {/* Filter Dropdown */}
      <div className="mb-6 max-w-xs mx-auto">
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="border p-4 rounded-md shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-gray-600 mt-1">{product.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WomensPage;
