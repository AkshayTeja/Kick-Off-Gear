"use client";
import Image from 'next/image';
import React, { useState } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { useCart } from '../context/CartContext';  // Import CartContext

interface propsType {
  img: string;
  title: string;
  desc: string;
  rating: number;
  price: string;
  id: number; // Add a unique ID for each product
}

const ProductCard: React.FC<propsType> = ({ img, title, desc, rating, price, id }) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart, removeFromCart } = useCart(); // Use the cart context

  const generateRating = (rating: number) => {
    switch (rating) {
      case 1:
        return (
          <div className='flex gap-1 text-[20px] text-accent'>
            <AiFillStar />
            <AiOutlineStar />
            <AiOutlineStar />
            <AiOutlineStar />
            <AiOutlineStar />
          </div>
        );
      case 2:
        return (
          <div className='flex gap-1 text-[20px] text-accent'>
            <AiFillStar />
            <AiFillStar />
            <AiOutlineStar />
            <AiOutlineStar />
            <AiOutlineStar />
          </div>
        );
      case 3:
        return (
          <div className='flex gap-1 text-[20px] text-accent'>
            <AiFillStar />
            <AiFillStar />
            <AiFillStar />
            <AiOutlineStar />
            <AiOutlineStar />
          </div>
        );
      case 4:
        return (
          <div className='flex gap-1 text-[20px] text-accent'>
            <AiFillStar />
            <AiFillStar />
            <AiFillStar />
            <AiFillStar />
            <AiOutlineStar />
          </div>
        );
      case 5:
        return (
          <div className='flex gap-1 text-[20px] text-accent'>
            <AiFillStar />
            <AiFillStar />
            <AiFillStar />
            <AiFillStar />
            <AiFillStar />
          </div>
        );
      default:
        return null;
    }
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
    <div className='px-4 border border-blackish rounded-xl max-w-[400px]'>
      <div>
        <Image className='w-full h-auto pt-3' src={img} width={200} height={300} alt={title} />
      </div>

      <div className='space-y-2 py-2'>
        <h2 className='text-blackish font-medium uppercase'>{title}</h2>

        <p className='text-gray-600 max-w-[150px]'>{desc}</p>

        <div>{generateRating(rating)}</div>

        <div className='font-bold flex gap-4'>
          ${price}
          <del className='text-gray-500 font-normal'>${parseInt(price) + 20}.00</del>
        </div>

        {/* Add to Cart/Remove from Cart Button */}
        <button
          onClick={handleToggleCart}
          className={`mt-4 w-full py-2 px-4 rounded-md text-black ${addedToCart ? 'bg-gray-500' : 'bg-accent hover:bg-accent-dark'} transition duration-200`}
        >
          {addedToCart ? 'Remove from Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
