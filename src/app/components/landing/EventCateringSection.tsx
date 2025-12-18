"use client";

import { useState, useEffect, useRef } from "react";
import EditableText from "@/components/editable/EditableText";
import EditableImageSlider from "@/components/editable/EditableImageSlider";

export default function EventCateringSection() {
  const [isInView, setIsInView] = useState(false);
  
  // Create ref for the section
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection Observer for animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Optional: unobserve after animation triggers
          if (sectionRef.current) {
            observer.unobserve(sectionRef.current);
          }
        }
      },
      {
        threshold: 0.2, // Trigger when 20% of section is visible
        rootMargin: "0px 0px -50px 0px", // Adjust as needed
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

  return (
    <section 
      ref={sectionRef}
      className="w-full py-12 bg-gradient-to-l from-[#fbf0e1] via-transparent to-transparent"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-18">
          {/* Left Column - Image Slider with specific resolution */}
          <div className="lg:w-1/2">
            <EditableImageSlider 
              componentName="event-catering-section" 
              aspectRatio="aspect-[4/3]"  // Specific aspect ratio for this section
              objectFit="cover"     // Specific object fit for this section
            />
          </div>

          {/* Right Column - Content */}
          <div className="lg:w-1/2 flex items-center">
            <div className="max-w-lg">
              {/* Heading with Roman Wood font - Animated */}
              <div className={animationClass()}>
                <EditableText
                  key="event-catering-heading"
                  componentName="event-catering-section"
                  blockKey="heading"
                  defaultText="EVENT CATERING"
                  className="text-4xl md:text-5xl text-[#F48221] mb-2 md:mb-4 font-romanwood"
                  tag="h1"
                />
              </div>

              {/* Description with DIN font - Animated with delay */}
              <div className={animationClass('delay-200')}>
                <EditableText
                  key="event-catering-description"
                  componentName="event-catering-section"
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
                    // Add your navigation logic here
                    console.log("Check Catering button clicked");
                  }}
                >
                  <EditableText
                    key="event-catering-button"
                    componentName="event-catering-section"
                    blockKey="button_text"
                    defaultText="Check Catering"
                    className="font-din"
                    tag="span"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}