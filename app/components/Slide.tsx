import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";

interface propsType {
  img: string;
  title: string;
  mainTitle: string;
  price: string;
  link: string;
}

const Slide: React.FC<propsType> = ({ img, title, mainTitle, price, link }) => {
  const router = useRouter();

  return (
    <div className="outline-none border-none relative">
      <div className="absolute left-[30px] md:left-[70px] max-w-[250px] sm:max-w-[350px] top-[50%] -translate-y-[50%] space-y-2 lg:space-y-4 bg-[#ffffffa2] sm:bg-transparent p-4 sm:p-0 rounded-lg sm:rounded-none">
        <h2
          className="text-[24px] lg:text-[28px] bg-blackish text-white md:text-[16px] p-5 rounded-lg cursor-pointer hover:bg-blue-600 text-center font-bold"
          onClick={() => router.push(link)}
        >
          {title}
        </h2>

        <h2 className="text-white p-4 hover:bg-blue-600 bg-blackish text-[26px] md:text-[30px] lg:text-[44px] font-bold leading-[1.2] rounded-lg text-center">
          {mainTitle}
        </h2>

        <div
          className="bg-blackish text-blue-600 text-[14px] md:text-[16px] p-3 rounded-lg inline-block cursor-pointer hover:bg-blue-600 hover:text-white me-5"
          onClick={() => router.push(link)}
        >
          Starting at{" "}
          <b className="text-[16px] md:text-[18px] lg:text-[20px]">{price}</b>
        </div>

        <div
          className="bg-blackish text-blue-600 text-[14px] md:text-[16px] p-3 rounded-lg inline-block cursor-pointer hover:bg-blue-600 hover:text-white font-bold"
          onClick={() => router.push(link)}
        >
          Shop Now
        </div>
      </div>

      <Image
        className="w-[100%] h-[300px] md:h-auto rounded-xl object-contain"
        src={img}
        alt={title}
        width={2000}
        height={2000}
      />
    </div>
  );
};

export default Slide;
