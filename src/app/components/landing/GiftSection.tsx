"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

// Constants
const CATERING_IMAGES = [
  { src: "/TestPic.png", alt: "Event Catering Setup 1" },
  { src: "/TestPic.png", alt: "Event Catering Setup 2" },
  { src: "/TestPic.png", alt: "Event Catering Setup 3" },
] as const;

const AUTO_ROTATE_INTERVAL = 5000;

export default function GiftSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Navigation handlers
  const goToNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % CATERING_IMAGES.length);
  }, []);

  const goToPrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => 
      (prev - 1 + CATERING_IMAGES.length) % CATERING_IMAGES.length
    );
  }, []);

  const goToImage = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  // Auto-rotate images
  useEffect(() => {
    if (isHovering) return;

    const interval = setInterval(goToNextImage, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, [isHovering, goToNextImage]);

  const currentImage = CATERING_IMAGES[currentImageIndex];

  return (
    <section className="w-full py-12 bg-gradient-to-r from-[#fbf0e1] via-transparent to-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-18">
          {/* Right Column - Content */}
          <div className="lg:w-1/2 flex items-center">
            <div className="max-w-lg">
              {/* Heading with Roman Wood font */}
              <h1 className="text-4xl md:text-5xl text-[#F48221] mb-2 md:mb-4 font-romanwood">
                GIFTS & GIVEAWAY BASKETS
              </h1>

              {/* Description with DIN font */}
              <p className="text-gray-700 text-base md:text-lg mb-6 md:mb-8 leading-relaxed font-din">
                Cravings Kitchen offers a comprehensive event catering service, 
                transforming your special occasions into unforgettable experiences. 
                From intimate gatherings to grand celebrations, our expert team 
                will curate a personalized menu to suit your taste and budget.
              </p>

              {/* Divider */}
              <div className="w-full" />

              {/* Button with DIN font */}
              <button 
                className="px-10 py-3 bg-[#602C0F] hover:bg-[#E5792A] text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#602C0F] focus:ring-offset-2 cursor-pointer font-din"
                aria-label="Check our catering services"
                onClick={() => {
                  // Add your navigation logic here
                  console.log("Check Catering button clicked");
                }}
              >
                Check Catering
              </button>
            </div>
          </div>

          {/* Left Column - Image Slider */}
          <div className="lg:w-1/2">
            <div 
              className="relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onFocus={() => setIsHovering(true)}
              onBlur={() => setIsHovering(false)}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-3xl shadow-lg group">
                <div className="aspect-[4/3] relative">
                  <Image
                    src={currentImage.src}
                    alt={currentImage.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
                    priority={currentImageIndex === 0}
                  />
                  
                  {/* Navigation Arrows - Fixed z-index and positioning */}
                  <button
                    onClick={goToPrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 cursor-pointer z-20 font-din"
                    aria-label="Previous image"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={goToNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 cursor-pointer z-20 font-din"
                    aria-label="Next image"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Overlay Gradient - Lower z-index so arrows stay on top */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />
                </div>
                
                {/* Image Counter */}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium z-20 font-din">
                  {currentImageIndex + 1} / {CATERING_IMAGES.length}
                </div>
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-3 mt-6" role="tablist" aria-label="Image navigation">
              {CATERING_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`h-3 w-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F68A3A] focus:ring-offset-2 cursor-pointer ${
                    index === currentImageIndex 
                      ? "bg-[#F68A3A] scale-110" 
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                  aria-selected={index === currentImageIndex}
                  role="tab"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}