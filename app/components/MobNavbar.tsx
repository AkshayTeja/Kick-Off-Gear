import React, { useState } from "react";
import { AiOutlineAppstore, AiOutlineHome } from "react-icons/ai";
import { FiHeart } from "react-icons/fi";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { IoMenuOutline, IoCloseOutline } from "react-icons/io5";
import Link from "next/link";

const MobNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="lg:hidden fixed top-0 w-full bg-white left-[50%] -translate-x-[50%] max-w-[500px] z-50 px-8 shadow-md">
      <div className="flex justify-between text-[28px] py-2">
        <button onClick={toggleMenu} aria-label="Toggle Menu">
          {isMenuOpen ? <IoCloseOutline /> : <IoMenuOutline />}
        </button>
        <Link href="/cart" aria-label="Cart">
          <div className="relative">
            <HiOutlineShoppingBag />
            <div className="bg-red-600 rounded-full absolute top-0 right-0 w-[18px] h-[18px] text-[12px] text-white grid place-items-center translate-x-1 -translate-y-1">
              0
            </div>
          </div>
        </Link>
        <Link href="/" aria-label="Home">
          <AiOutlineHome />
        </Link>
        <Link href="/wishlist" aria-label="Wishlist">
          <div className="relative">
            <FiHeart />
            <div className="bg-red-600 rounded-full absolute top-0 right-0 w-[18px] h-[18px] text-[12px] text-white grid place-items-center translate-x-1 -translate-y-1">
              0
            </div>
          </div>
        </Link>
        <Link href="/categories" aria-label="Categories">
          <AiOutlineAppstore />
        </Link>
      </div>
      {isMenuOpen && (
        <div className="bg-white w-full max-w-[500px] absolute top-full left-[50%] -translate-x-[50%] border-t border-gray-200 shadow-lg">
          <ul className="flex flex-col items-center py-4">
            <li className="py-2">
              <Link
                href="/"
                className="text-gray-800 hover:text-blue-600"
                onClick={toggleMenu}
              >
                Home
              </Link>
            </li>
            <li className="py-2">
              <Link
                href="/wishlist"
                className="text-gray-800 hover:text-blue-600"
                onClick={toggleMenu}
              >
                Wishlist
              </Link>
            </li>
            <li className="py-2">
              <Link
                href="/cart"
                className="text-gray-800 hover:text-blue-600"
                onClick={toggleMenu}
              >
                Cart
              </Link>
            </li>
            <li className="py-2">
              <Link
                href="/profile"
                className="text-gray-800 hover:text-blue-600"
                onClick={toggleMenu}
              >
                Profile
              </Link>
            </li>
            <li className="py-2">
              <Link
                href="/categories"
                className="text-gray-800 hover:text-blue-600"
                onClick={toggleMenu}
              >
                Categories
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MobNavbar;
