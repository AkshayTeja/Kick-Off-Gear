"use client";

import Link from "next/link";
import React, { useState, useRef } from "react";

const Navbar = () => {
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [showFootballSubmenu, setShowFootballSubmenu] = useState(false);

  // Refs to store timeout IDs
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const submenuTimeout = useRef<NodeJS.Timeout | null>(null);

  const categories = [
    {
      name: "Football Jerseys",
      href: "/mens",
      subcategories: [
        { name: "Men", href: "/mens" },
        { name: "Women", href: "/womens" },
        { name: "Retro", href: "/retro" },
        { name: "Club", href: "/clubs" },
      ],
    },
    { name: "Football Shoes", href: "/football-shoes" },
    { name: "Footballs", href: "/footballs" },
    { name: "Accessories", href: "/accessories" },
  ];

  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setShowCategoriesDropdown(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setShowCategoriesDropdown(false);
      setShowFootballSubmenu(false);
    }, 200); // Adjust delay here (ms)
  };

  const handleSubmenuEnter = () => {
    if (submenuTimeout.current) clearTimeout(submenuTimeout.current);
    setShowFootballSubmenu(true);
  };

  const handleSubmenuLeave = () => {
    submenuTimeout.current = setTimeout(() => {
      setShowFootballSubmenu(false);
    }, 200); // Adjust delay here (ms)
  };

  return (
    <div className="hidden lg:block relative z-20">
      <div className="container">
        <div className="flex w-fit gap-10 mx-auto font-medium py-4 text-blackish">
          <Link className="navbar__link relative" href="/home">
            HOME
          </Link>

          {/* Categories with dropdown */}
          <div
            className="relative"
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
            <Link
              className="navbar__link relative flex items-center gap-1"
              href="#"
            >
              CATEGORIES
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Link>

            {/* Dropdown menu */}
            {showCategoriesDropdown && (
              <div className="absolute left-0 mt-2 w-56 bg-white shadow-lg rounded-md py-2 z-30 border border-gray-200">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className="relative group"
                    onMouseEnter={() =>
                      category.name === "Football Jerseys" &&
                      handleSubmenuEnter()
                    }
                    onMouseLeave={() =>
                      category.name === "Football Jerseys" &&
                      handleSubmenuLeave()
                    }
                  >
                    <Link
                      href={category.href}
                      className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors duration-150 flex justify-between items-center"
                    >
                      {category.name}
                      {category.subcategories && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </Link>

                    {/* Submenu */}
                    {category.subcategories && showFootballSubmenu && (
                      <div className="absolute top-0 left-full ml-1 w-48 bg-white shadow-lg rounded-md py-2 z-40 border border-gray-200">
                        {category.subcategories.map((sub, subIndex) => (
                          <Link
                            key={subIndex}
                            href={sub.href}
                            className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors duration-150"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link className="navbar__link relative" href="/mens">
            MEN&apos;S
          </Link>
          <Link className="navbar__link relative" href="/womens">
            WOMEN&apos;S
          </Link>
          <Link className="navbar__link relative" href="/retro">
            RETRO
          </Link>
          <Link className="navbar__link relative" href="/clubs">
            CLUBS
          </Link>
          <Link className="navbar__link relative" href="/hot-offers">
            HOT OFFERS
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
