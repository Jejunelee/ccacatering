"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full bg-[#FAF8F6] py-16 flex flex-col items-center text-center px-4">
      
      {/* Top Title */}
      <h1 className="font-romanwood text-3xl sm:text-4xl md:text-5xl tracking-[0.15em] text-[#1A1A1A]">
        GIFTS, & GIVEAWAY BASKETS
      </h1>

      {/* Description */}
      <p className="mt-6 text-gray-600 max-w-2xl leading-relaxed font-din text-base sm:text-lg">
        Whether you're hosting a corporate event, a family gathering, or a personal celebration, 
        Cravings has you covered. Our delectable party trays and convenient packed meals are designed 
        to satisfy every craving and make your event a memorable one.
      </p>

      {/* Button */}
      <button
        className="
          mt-8 bg-[#F68A3A] hover:bg-[#E5792A] text-white 
          px-10 py-3 rounded-2xl font-semibold text-lg 
          shadow-md hover:shadow-lg transition-all duration-300
        "
      >
        Order Now
      </button>

{/* Large Bottom CTA Banner */}
<div
  className="
    mt-10 w-full max-w-6xl bg-[#F68A3A]
    text-white 
    rounded-tl-4xl rounded-tr-xl
    rounded-br-4xl rounded-bl-xl
    py-4 px-4 
    flex flex-col items-center justify-center shadow-md
  "
>
        <p className="text-white/90 text-lg font-din">
          Make someone feel special
        </p>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-brisa tracking-wide">
          Get a Cravings Basket
        </h2>
      </div>
    </header>
  );
}
