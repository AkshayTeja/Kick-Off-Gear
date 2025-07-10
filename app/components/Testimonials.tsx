import Image from "next/image";
import React from "react";

const Testimonials = () => {
  return (
    <div className="bg-gray-50 py-16 mt-10">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Testimonial 1 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center gap-4">
              <Image
                className="rounded-full"
                src="/Profile1.png"
                width={80}
                height={80}
                alt="Fernandes B."
              />
              <h3 className="text-xl font-semibold text-gray-800">
                Fernandes B.
              </h3>
              <p className="text-gray-500">Football Fan, India</p>
              <Image
                className="inline-block"
                src="/Quotes.png"
                width={40}
                height={40}
                alt="Quotes"
              />
              <p className="text-gray-600 max-w-[250px]">
                &quot;The quality of the jerseys is outstanding! Fast shipping
                and excellent customer service made my shopping experience a
                breeze.&quot;
              </p>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center gap-4">
              <Image
                className="rounded-full"
                src="/Profile2.png"
                width={80}
                height={80}
                alt="Sophie M."
              />
              <h3 className="text-xl font-semibold text-gray-800">Sophie M.</h3>
              <p className="text-gray-500">Sports Enthusiast, USA</p>
              <Image
                className="inline-block"
                src="/Quotes.png"
                width={40}
                height={40}
                alt="Quotes"
              />
              <p className="text-gray-600 max-w-[250px]">
                &quot;Loved the variety of products! The website is easy to
                navigate, and my order arrived right on time.&quot;
              </p>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center gap-4">
              <Image
                className="rounded-full"
                src="/Profile3.png"
                width={80}
                height={80}
                alt="Liam T."
              />
              <h3 className="text-xl font-semibold text-gray-800">Liam T.</h3>
              <p className="text-gray-500">Collector, UK</p>
              <Image
                className="inline-block"
                src="/Quotes.png"
                width={40}
                height={40}
                alt="Quotes"
              />
              <p className="text-gray-600 max-w-[250px]">
                &quot;Amazing deals and authentic merchandise. The special
                collection is a must-have for any fan!&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Special Collection Section */}
        <div className="bg-[url('/Stadium.jpg')] bg-cover bg-center h-[400px] rounded-2xl flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl py-8 px-6 md:px-12 text-center max-w-[500px] space-y-4 transform hover:scale-105 transition-transform duration-300">
            <button className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
              25% DISCOUNT
            </button>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">
              Special Collection
            </h2>
            <p className="text-gray-600 text-lg md:text-xl">
              Starting at <span className="font-bold">$50</span> -{" "}
              <a
                href="/hot-offers"
                className="text-blue-600 hover:underline font-bold"
              >
                Shop Now!
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
