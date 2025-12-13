"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";

const HERO_IMAGES = [
  { src: "/TestPic.png", alt: "Gourmet Lasagna" },
  { src: "/TestPic.png", alt: "Catering Spread" },
  { src: "/TestPic.png", alt: "Elegant Event" },
] as const;

const AUTO_ROTATE_INTERVAL = 5000;

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextImage = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  const prevImage = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentImageIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  const goToImage = useCallback((index: number) => {
    if (isAnimating || index === currentImageIndex) return;
    setIsAnimating(true);
    setCurrentImageIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, currentImageIndex]);

  // Auto-rotate images
  useEffect(() => {
    if (isHovering || isAnimating) return;
    
    const interval = setInterval(nextImage, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, [isHovering, isAnimating, nextImage]);

  const currentImage = HERO_IMAGES[currentImageIndex];

  return (
    <section className="w-full py-4 md:py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Left Text Content */}
          <TextContent />

          {/* Right Image Slider */}
          <ImageSlider
            currentImage={currentImage}
            currentImageIndex={currentImageIndex}
            isHovering={isHovering}
            setIsHovering={setIsHovering}
            nextImage={nextImage}
            prevImage={prevImage}
            goToImage={goToImage}
            isAnimating={isAnimating}
          />
        </div>
      </div>

      <GlobalStyles />
    </section>
  );
}

// Extracted Components
function TextContent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`space-y-5 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <DecorativeLabel />
      
      <div className="space-y-6">
        <MainHeading />
        <Description />
      </div>

      <CtaButton />
    </div>
  );
}

function DecorativeLabel() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div className={`h-1 rounded-full bg-gradient-to-r from-[#F68A3A] to-[#FFB347] transition-all duration-1000 ${animate ? 'w-12' : 'w-0'}`} />
      <span className={`text-sm font-bold uppercase tracking-wider font-din bg-gradient-to-r from-[#F68A3A] to-[#FFB347] bg-clip-text text-transparent transition-all duration-1000 ${animate ? 'opacity-100' : 'opacity-0 translate-x-4'}`}>
        Since 1988
      </span>
    </div>
  );
}

function MainHeading() {
  const [animateText, setAnimateText] = useState(false);
  const [animateHighlight, setAnimateHighlight] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimateText(true), 500);
    const timer2 = setTimeout(() => setAnimateHighlight(true), 1000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <h1 className="text-3xl sm:text-4xl lg:text-5xl text-[#000000] tracking-[0.2em] leading-[1.0]">
      <span className={`font-romanwood tracking-[0.15em] transition-all duration-1000 ${animateText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ fontWeight: 300 }}>
        WE CATER MOMENTS
        <br />
        THAT{" "}
      </span>
      <span className="relative font-brisa text-8xl">
        <span 
          className={`text-[#F68A3A] relative z-10 tracking-[-0.001em] transition-all duration-1000 ${animateHighlight ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={{ WebkitTextStroke: '1.5px #F68A3A' }}
        >
          Matter
        </span>
        <span className={`absolute bottom-1 left-0 h-1 bg-[#F68A3A]/40 -rotate-1 -z-0 transition-all duration-1000 ${animateHighlight ? 'w-full' : 'w-0'}`} />
      </span>
    </h1>
  );
}

function Description() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <p className={`text-lg text-gray-700 max-w-lg leading-relaxed font-din transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      Celebrating <span className="font-bold text-[#F68A3A] animate-pulse-slow">30+ years</span> of creating great food and<br />
      memorable events. <span className="font-bold animate-pulse-slower">Tailored for you.</span>
    </p>
  );
}

function CtaButton() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex flex-col sm:flex-row gap-4 pt-4 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <button className="group relative bg-gradient-to-r from-[#E5792A] to-[#F48221] text-white px-20 py-3 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden font-din focus:ring-2 focus:ring-orange-300 focus:outline-none animate-shimmer">
        <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
      Get a Quote
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-[#F68A3A] to-[#F48221] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      </button>
    </div>
  );
}

// Image Slider Components
interface ImageSliderProps {
  currentImage: typeof HERO_IMAGES[number];
  currentImageIndex: number;
  isHovering: boolean;
  setIsHovering: (hovering: boolean) => void;
  nextImage: () => void;
  prevImage: () => void;
  goToImage: (index: number) => void;
  isAnimating: boolean;
}

function ImageSlider({
  currentImage,
  currentImageIndex,
  setIsHovering,
  nextImage,
  prevImage,
  goToImage,
  isAnimating,
}: ImageSliderProps) {
  return (
    <div className="relative">
      <div 
        className="relative mb-3"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <ImageContainer image={currentImage} index={currentImageIndex} isAnimating={isAnimating} />
        <NavigationButtons prevImage={prevImage} nextImage={nextImage} isAnimating={isAnimating} />
        <FloatingBadge />
      </div>

      <DotsIndicator 
        currentIndex={currentImageIndex}
        totalImages={HERO_IMAGES.length}
        onDotClick={goToImage}
        isAnimating={isAnimating}
      />
    </div>
  );
}

function ImageContainer({ image, index, isAnimating }: { 
  image: typeof HERO_IMAGES[number]; 
  index: number;
  isAnimating: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl shadow-md group">
      <div className="aspect-square md:aspect-[4/5] lg:aspect-square relative">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className={`object-cover transition-all duration-500 ${isAnimating ? 'scale-110 opacity-80' : 'scale-100 opacity-100'} group-hover:scale-105`}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
      </div>
      <ImageCounter currentIndex={index} totalImages={HERO_IMAGES.length} />
    </div>
  );
}

function ImageCounter({ currentIndex, totalImages }: { currentIndex: number; totalImages: number }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className={`absolute top-6 right-6 bg-black/10 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm font-medium font-din transition-all duration-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {currentIndex + 1} / {totalImages}
    </div>
  );
}

function NavigationButtons({ prevImage, nextImage, isAnimating }: { 
  prevImage: () => void; 
  nextImage: () => void;
  isAnimating: boolean;
}) {
  const Button = ({ onClick, icon: Icon, label, position }: { 
    onClick: () => void; 
    icon: typeof ChevronLeft; 
    label: string;
    position: 'left' | 'right';
  }) => {
    const [hover, setHover] = useState(false);

    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        disabled={isAnimating}
        className={`absolute ${position === 'left' ? 'left-[-64]' : 'right-[-64]'} top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed ${hover ? 'bg-white scale-110 shadow-2xl' : ''}`}
        aria-label={label}
      >
        <Icon className={`text-[#F68A3A] w-7 h-7 transition-all duration-300 ${hover ? 'text-[#E5792A] scale-110' : ''}`} />
      </button>
    );
  };

  return (
    <>
      <Button onClick={prevImage} icon={ChevronLeft} label="Previous image" position="left" />
      <Button onClick={nextImage} icon={ChevronRight} label="Next image" position="right" />
    </>
  );
}

function FloatingBadge() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`absolute -bottom-4 -left-4 bg-white shadow-md rounded-2xl p-4 max-w-[200px] transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="flex items-center gap-3">
        <div className="bg-[#F68A3A]/10 p-2 rounded-full animate-pulse">
          <CheckCircle className="w-6 h-6 text-[#F68A3A]" />
        </div>
        <div className="font-din">
          <p className="font-bold text-gray-900">Custom Menus</p>
          <p className="text-sm text-gray-600">Tailored to your taste</p>
        </div>
      </div>
    </div>
  );
}

function DotsIndicator({ 
  currentIndex, 
  totalImages, 
  onDotClick,
  isAnimating
}: { 
  currentIndex: number; 
  totalImages: number; 
  onDotClick: (index: number) => void;
  isAnimating: boolean;
}) {
  return (
    <div className="flex justify-center space-x-3">
      {Array.from({ length: totalImages }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          disabled={isAnimating}
          className={`h-4 w-4 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${
            index === currentIndex 
              ? "bg-gradient-to-r from-[#F68A3A] to-[#FFB347] shadow-lg animate-pulse" 
              : "bg-gray-300 hover:bg-gray-400"
          } ${index === currentIndex ? 'scale-110' : ''}`}
          aria-label={`Go to image ${index + 1}`}
        />
      ))}
    </div>
  );
}

function GlobalStyles() {
  return (
    <style jsx global>{`
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      
      @keyframes shimmer {
        0% {
          background-position: -200% center;
        }
        100% {
          background-position: 200% center;
        }
      }
      
      @keyframes pulse-slow {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.8;
        }
      }
      
      @keyframes pulse-slower {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.9;
        }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.8s ease-out;
      }
      
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
      
      .animate-shimmer {
        background-size: 200% auto;
        animation: shimmer 3s linear infinite;
      }
      
      .animate-pulse-slow {
        animation: pulse-slow 2s ease-in-out infinite;
      }
      
      .animate-pulse-slower {
        animation: pulse-slower 3s ease-in-out infinite;
      }
    `}</style>
  );
}