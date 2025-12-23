"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import EditableText from "@/components/editable/EditableText";
import EditableImageSlider from "@/components/editable/EditableImageSlider";

// Constants
const CATERING_IMAGES = [
  { src: "/TestPic.png", alt: "Event Catering Setup 1" },
  { src: "/TestPic.png", alt: "Event Catering Setup 2" },
  { src: "/TestPic.png", alt: "Event Catering Setup 3" },
] as const;

const AUTO_ROTATE_INTERVAL = 5000;

export default function BasketTwo() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection Observer for animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (sectionRef.current) {
            observer.unobserve(sectionRef.current);
          }
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Animation class based on isInView
  const animationClass = (delay = '') => 
    `${delay} transition-all duration-1000 ${
      isInView 
        ? "opacity-100 translate-y-0" 
        : "opacity-0 translate-y-8"
    }`;

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
    <section 
      ref={sectionRef}
      className="w-full py-12 bg-gradient-to-r from-[#fbf0e1] via-transparent to-transparent"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-18">
          {/* Right Column - Content */}
          <div className="lg:w-1/2 flex items-center">
            <div className="max-w-lg">
              {/* Heading with Roman Wood font - Animated */}
              <div className={animationClass()}>
                <EditableText
                  key="basket-two-heading"
                  componentName="basket-two-section"
                  blockKey="heading"
                  defaultText="PACKED MEALS"
                  className="text-4xl md:text-5xl text-[#F48221] mb-2 md:mb-4 font-romanwood"
                  tag="h1"
                />
              </div>

              {/* Description with DIN font - Animated with delay */}
              <div className={animationClass('delay-200')}>
                <EditableText
                  key="basket-two-description"
                  componentName="basket-two-section"
                  blockKey="description"
                  defaultText="Cravings Kitchen offers a comprehensive event catering service, transforming your special occasions into unforgettable experiences. From intimate gatherings to grand celebrations, our expert team will curate a personalized menu to suit your taste and budget."
                  className="text-gray-700 text-base md:text-lg mb-6 md:mb-8 leading-relaxed font-din"
                  tag="p"
                  as="textarea"
                  rows={4}
                />
              </div>

              {/* Divider */}
              <div className="w-full" />

              {/* Button with DIN font - Animated with longer delay */}
              <div className={animationClass('delay-400')}>
                <button 
                  className="px-10 py-3 bg-[#602C0F] hover:bg-[#E5792A] text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#602C0F] focus:ring-offset-2 cursor-pointer font-din"
                  aria-label="Check our catering services"
                  onClick={() => {
                    console.log("Check Catering button clicked");
                  }}
                >
                  <EditableText
                    key="basket-two-button"
                    componentName="basket-two-section"
                    blockKey="button_text"
                    defaultText="Download Menu PDF"
                    className="font-din"
                    tag="span"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Left Column - Image Slider */}
          <div className="lg:w-1/2">
            {/* Using EditableImageSlider */}
            <EditableImageSlider 
              componentName="basket-two-section" 
              aspectRatio="aspect-[4/3]"
              objectFit="cover"
            />
            
            {/* Original custom slider - commented out as fallback */}
            {/* <div 
              className="relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onFocus={() => setIsHovering(true)}
              onBlur={() => setIsHovering(false)}
            >
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
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />
                </div>
                
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium z-20 font-din">
                  {currentImageIndex + 1} / {CATERING_IMAGES.length}
                </div>
              </div>
            </div>

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
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}