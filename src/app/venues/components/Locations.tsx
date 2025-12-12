"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

// ----------------------
// LOCATION DATA
// ----------------------
const LOCATIONS = [
  {
    title: "MAGINHAWA, QUEZON CITY",
    description:
      "Nestled in the heart of Quezon City's vibrant Maginhawa district, our events venue offers the perfect setting for your intimate celebrations. Whether it's a birthday, anniversary, or family gathering, our cozy space can comfortably accommodate up to 60 guests, ensuring a warm and memorable experience.",
    images: [
      { src: "/TestPic.png", alt: "Maginhawa Setup 1" },
      { src: "/TestPic.png", alt: "Maginhawa Setup 2" },
      { src: "/TestPic.png", alt: "Maginhawa Setup 3" },
    ],
  },
  {
    title: "KATIPUNAN, QUEZON CITY",
    description:
      "Located within the prestigious Insular Life Corporate Centre in Alabang, our events venue offers a sophisticated and convenient setting for your corporate events. Perfect for those in the southern Metro Manila area, our space is designed to impress and accommodate your professional needs.",
    images: [
      { src: "/TestPic.png", alt: "Katipunan Setup 1" },
      { src: "/TestPic.png", alt: "Katipunan Setup 2" },
    ],
  },
];

const AUTO_ROTATE_INTERVAL = 5000;

// ----------------------
// REUSABLE SLIDER COMPONENT
// ----------------------
function ImageSlider({ images }: { images: readonly { src: string; alt: string }[] }) {
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(goNext, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, [isHovering, goNext]);

  return (
    <div
      className="relative max-w-4xl mx-auto"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative overflow-hidden rounded-3xl shadow-lg group">
        <div className="aspect-[4/3] relative">
          <Image
            src={images[current].src}
            alt={images[current].alt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={current === 0}
          />

          {/* Prev */}
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full z-20 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next */}
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full z-20 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />

          {/* Counter */}
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm z-20 font-din">
            {current + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center space-x-3 mt-6">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-3 w-3 rounded-full transition-all ${
              index === current ? "bg-[#F68A3A] scale-110" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ----------------------
// MAIN LOCATIONS COMPONENT
// ----------------------
export default function Locations() {
  return (
    <section className="w-full py-16 space-y-24">
      {LOCATIONS.map((loc, i) => (
        <div key={i} className="max-w-5xl mx-auto px-4 text-center">
          {/* Heading */}
          <h1 className="text-4xl md:text-5xl text-[#F48221] font-romanwood tracking-wide mb-6">
            {loc.title}
          </h1>

          {/* Slider */}
          <ImageSlider images={loc.images} />

          {/* Description */}
          <p className="mt-6 text-gray-700 text-lg max-w-3xl mx-auto leading-relaxed font-din">
            {loc.description}
          </p>

          {/* Button */}
          <button className="mt-8 px-10 py-3 bg-[#602C0F] hover:bg-[#E5792A] text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-xl font-din">
            Download Menu PDF
          </button>
        </div>
      ))}
    </section>
  );
}
