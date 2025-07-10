"use client";

import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slide from "./Slide";

const Hero = () => {
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
      <div className="container mx-auto px-4 py-8">
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
