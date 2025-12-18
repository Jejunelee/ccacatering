"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle } from "lucide-react";
import EditableText from "@/components/editable/EditableText";
import EditableImageSlider from "@/components/editable/EditableImageSlider";

const AUTO_ROTATE_INTERVAL = 5000;

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextImage = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentImageIndex((prev) => (prev + 1) % 3);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  const prevImage = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentImageIndex((prev) => (prev - 1 + 3) % 3);
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

  return (
    <section className="w-full py-4 md:py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Left Text Content */}
          <TextContent />

          {/* Right Image Slider - Replaced with EditableImageSlider */}
          <div className="relative">
            <div 
              className="relative mb-3"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <EditableImageSlider 
                componentName="hero-section"
                aspectRatio="aspect-square md:aspect-[4/5] lg:aspect-square"
                objectFit="cover"
              />
            </div>

            {/* Custom dots indicator for the slider */}
            <div className="flex justify-center space-x-3 mt-4">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  disabled={isAnimating}
                  className={`h-4 w-4 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${
                    index === currentImageIndex 
                      ? "bg-gradient-to-r from-[#F68A3A] to-[#FFB347] shadow-lg animate-pulse" 
                      : "bg-gray-300 hover:bg-gray-400"
                  } ${index === currentImageIndex ? 'scale-110' : ''}`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>
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
      <EditableText
        componentName="hero-section"
        blockKey="since_label"
        defaultText="Since 1988"
        className="text-sm font-bold uppercase tracking-wider font-din bg-gradient-to-r from-[#F68A3A] to-[#FFB347] bg-clip-text text-transparent transition-all duration-1000"
        tag="span"
      />
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
    <h1 className="text-3xl sm:text-4xl lg:text-5xl text-[#000000] tracking-[0.3em] leading-[0.4]">
      <div className={`font-romanwood tracking-[0.15em] transition-all duration-1000 ${animateText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ fontWeight: 300 }}>
        <EditableText
          componentName="hero-section"
          blockKey="main_heading_line1"
          defaultText="WE CATER MOMENTS"
          className="block"
          tag="span"
        />
        <br />
        <div className="inline-flex items-baseline">
          <EditableText
            componentName="hero-section"
            blockKey="main_heading_line2"
            defaultText="THAT "
            className="inline"
            tag="span"
          />
          <span className="relative font-brisa text-8xl ml-3">
            <EditableText
              componentName="hero-section"
              blockKey="highlighted_text"
              defaultText="Matter"
              className={`text-[#F68A3A] relative z-10 tracking-[-0.001em] transition-all duration-1000 ${animateHighlight ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              tag="span"
            />
            <span className={`absolute bottom-1 left-0 h-1 bg-[#F68A3A]/40 -rotate-1 -z-0 transition-all duration-1000 ${animateHighlight ? 'w-full' : 'w-0'}`} />
          </span>
        </div>
      </div>
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
    <div className={`max-w-lg leading-relaxed font-din transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <EditableText
        componentName="hero-section"
        blockKey="description"
        defaultText="Celebrating <span class='font-bold text-[#F68A3A] animate-pulse-slow'>30+ years</span> of creating great food and<br />memorable events. <span class='font-bold animate-pulse-slower'>Tailored for you.</span>"
        className="text-lg text-gray-700"
        tag="p"
        as="textarea"
        rows={3}
      />
    </div>
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
      <button 
        className="group relative bg-gradient-to-r from-[#E5792A] to-[#F48221] text-white px-20 py-3 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden font-din focus:ring-2 focus:ring-orange-300 focus:outline-none animate-shimmer"
        onClick={() => {
          console.log("Get a Quote button clicked");
        }}
      >
        <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
          <EditableText
            componentName="hero-section"
            blockKey="cta_button_text"
            defaultText="Get a Quote"
            tag="span"
          />
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-[#F68A3A] to-[#F48221] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      </button>
    </div>
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
          <EditableText
            componentName="hero-section"
            blockKey="floating_badge_title"
            defaultText="Custom Menus"
            className="font-bold text-gray-900"
            tag="p"
          />
          <EditableText
            componentName="hero-section"
            blockKey="floating_badge_subtitle"
            defaultText="Tailored to your taste"
            className="text-sm text-gray-600"
            tag="p"
          />
        </div>
      </div>
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