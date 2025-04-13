"use client";
import React from "react";
import ProductCard from "../components/ProductCard";

const productsData = [
  {
    img: "/England.webp",
    title: "England Euro 24",
    desc: "Home Kit",
    rating: 5,
    price: "50.00",
  },
  {
    img: "/France.jpg",
    title: "France Euro 24",
    desc: "Home Kit",
    rating: 4,
    price: "50.00",
  },
  {
    img: "/Belgium.webp",
    title: "Belgium Euro 24",
    desc: "Home Kit",
    rating: 5,
    price: "50.00",
  },
  {
    img: "/Portugal.webp",
    title: "Portugal Euro 24",
    desc: "Home Kit",
    rating: 4,
    price: "50.00",
  },
  {
    img: "/Germany.webp",
    title: "Germany Euro 24",
    desc: "Home Kit",
    rating: 5,
    price: "50.00",
  },
  {
    img: "/Germany Retro.webp",
    title: "Germany 1996 Retro ",
    desc: "Home Kit",
    rating: 5,
    price: "50.00",
  },
  {
    img: "/Predator.avif",
    title: "Adidas Predator Boots",
    desc: "Home Kit",
    rating: 5,
    price: "30.00",
  },
  {
    img: "/Grey Adidas.avif",
    title: "Adidas Strung Boots",
    desc: "Home Kit",
    rating: 4,
    price: "30.00",
  },
];

const MensPage = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-blackish">Club&apos;s</h1>

      {/* Engaging Introduction Text */}
      <div className="max-w-3xl mx-auto text-center mb-4">
        <p className="text-xl text-gray-800 leading-relaxed">
        Explore our extensive collection of club football jerseys, each piece designed with authenticity and passion. From iconic national teams to legendary club sides, we&apos;sve got the perfect jersey to show your support. Find your perfect fit and wear it with pride.
        </p>
      </div>

      <div>
        <div className="container pt-10">

          <div className="grid grid-cols-1 place-items-center sm:place-items-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 xl:gap-x-20 xl:gap-y-10">
            {productsData.map((item, index) => (
              <ProductCard
                    key={index}
                    img={item.img}
                    title={item.title}
                    desc={item.desc}
                    rating={item.rating}
                    price={item.price} id={0}              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MensPage;
