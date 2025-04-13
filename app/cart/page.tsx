"use client";
import React from 'react';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

const CartPage = () => {
  const { cartItems, removeFromCart } = useCart();

  return (
    <div className='container py-10'>
      <h1 className='text-3xl font-bold mb-6'>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty!</p>
      ) : (
        <div className='space-y-6'>
          {cartItems.map((item: any) => (
            <div key={item.cartItemId} className='flex justify-between items-center'>
              <div>
                <h3 className='font-medium'>{item.title}</h3>
                <p>{item.desc}</p>
                <p className='font-bold'>${item.price}</p>
              </div>
              <button
                onClick={() => removeFromCart(item.cartItemId)} // ✅ Fix is here
                className='text-red-500 hover:underline'
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      <Link href="/" className="mt-4 inline-block text-blue-500 hover:underline">Continue Shopping</Link>
    </div>
  );
};

export default CartPage;
