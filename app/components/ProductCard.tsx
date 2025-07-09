"use client";
import Image from "next/image";
import React, { useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { useCart } from "../context/CartContext";

interface propsType {
  img: string;
  title: string;
  desc: string;
  rating: number;
  price: string;
  id: number;
}

const ProductCard: React.FC<propsType> = ({
  img,
  title,
  desc,
  rating,
  price,
  id,
}) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart, removeFromCart } = useCart();

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

  const handleToggleCart = () => {
    if (addedToCart) {
      removeFromCart(id);
    } else {
      addToCart({ id, img, title, desc, rating, price });
    }
    setAddedToCart((prev) => !prev);
  };

  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 max-w-[300px] w-full mx-auto overflow-hidden group">
      <div className="relative overflow-hidden">
        <Image
          className="w-full h-[200px] object-cover transition-transform duration-300 group-hover:scale-105"
          src={img}
          width={300}
          height={200}
          alt={title}
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="p-4 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
          {title}
        </h2>
        <p className="text-sm text-gray-500 line-clamp-2">{desc}</p>
        <div>{generateRating(rating)}</div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-900">${price}</span>
          <del className="text-sm text-gray-400">
            ${(parseFloat(price) + 20).toFixed(2)}
          </del>
        </div>
        <button
          onClick={handleToggleCart}
          className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-all duration-200 transform hover:scale-105 ${
            addedToCart
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {addedToCart ? "Remove from Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
