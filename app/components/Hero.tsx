"use client";

import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slide from "./Slide";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();

  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: false,
    adaptiveHeight: false,
    arrows: false,
    appendDots: (dots: React.ReactNode) => (
      <div style={{ paddingBottom: "10px" }}>
        <ul className="flex justify-center space-x-2">{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-3 h-3 bg-gray-400 rounded-full hover:bg-blue-600 transition-colors" />
    ),
  };

  const slideData = [
    {
      id: 0,
      img: "/Retro Jerseys.jpg",
      title: "CLASSIC KITS",
      mainTitle: "IN WITH THE OLD!",
      price: "$50.00",
      link: "/retro",
    },
    {
      id: 1,
      img: "/Clubs.png",
      title: "CLUB JERSEYS",
      mainTitle: "SUPPORT!",
      price: "$50.00",
      link: "/clubs",
    },
    {
      id: 2,
      img: "/Boots.jpg",
      title: "QUALITY SHOES",
      mainTitle: "GEAR UP!",
      price: "$30.00",
      link: "/football-shoes",
    },
  ];

  return (
    <div className="bg-white">
      {/* Mobile Layout */}
      <div className="block md:hidden container mx-auto px-4 py-8">
        <div className="space-y-6">
          {slideData.map((item) => (
            <div
              key={item.id}
              className="relative rounded-xl overflow-hidden shadow-lg"
            >
              <Image
                src={item.img}
                alt={item.title}
                width={800}
                height={400}
                className="w-full h-[200px] object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-center p-4">
                <h2 className="text-white text-[20px] font-bold mb-3">
                  {item.title}
                </h2>
                <button
                  className="bg-blue-600 text-white text-[14px] font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => router.push(item.link)}
                >
                  Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Carousel */}
      <div className="hidden md:block container mx-auto px-4 py-8">
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl">
          <Slider {...settings}>
            {slideData.map((item) => (
              <Slide
                key={item.id}
                img={item.img}
                title={item.title}
                mainTitle={item.mainTitle}
                price={item.price}
                link={item.link}
              />
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Hero;
