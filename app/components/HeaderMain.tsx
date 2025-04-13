"use client";
import React from 'react';
import { BiUser } from 'react-icons/bi';
import { BsSearch } from "react-icons/bs";
import { FiHeart } from 'react-icons/fi';
import { HiOutlineShoppingBag } from 'react-icons/hi';
import { IoFootballSharp } from "react-icons/io5";
import Link from 'next/link';
import { useCart } from '../context/CartContext';

const HeaderMain = () => {
  const { cartItems } = useCart(); // 👈 Get cart items

  return (
    <div className='border-b border-gray-200 py-6'>
      <div className='container sm:flex justify-between items-center gap-5'>

        {/* Logo */}
        <Link href="/" className='flex font-bold text-center pb-4 sm:pb-0 text-blackish hover:opacity-80 transition-opacity'>
          <IoFootballSharp className='text-3xl text-accent' />
          <h1 className='pt-1 pl-1'>KickOffGear</h1>
        </Link>

        <div className='w-full sm:w-[300px] md:w-[70%] relative'>
          <input className='border-gray-200 border p-2 px-4 rounded-lg w-full' type="text" placeholder='What are you looking for?' />
          <BsSearch className='absolute right-0 top-0 mr-3 mt-3 text-gray-400' size={20} />
        </div>

        <div className='hidden lg:flex gap-4 text-gray-500 text-[30px]'>
          <BiUser />

          <div className='relative'>
            <FiHeart />
            <div className='bg-accent rounded-full absolute top-0 right-0 w-[18px] h-[18px] text-[12px] text-white grid place-items-center translate-x-1 -translate-y-1'>
              0
            </div>
          </div>

          <Link href="/cart">
            <div className='relative'>
              <HiOutlineShoppingBag />
              <div className='bg-accent rounded-full absolute top-0 right-0 w-[18px] h-[18px] text-[12px] text-white grid place-items-center translate-x-1 -translate-y-1'>
                {cartItems.length} {/* 👈 Dynamic cart count */}
              </div>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default HeaderMain;
