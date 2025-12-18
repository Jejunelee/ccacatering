"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import EditableText from "@/components/editable/EditableText";
import EditableImageSlider from "@/components/editable/EditableImageSlider";

// Constants for better maintainability
const COMPONENT_NAME = "gifts-section" as const;
const ANIMATION_DELAYS = {
  heading: '',
  description: 'delay-200',
  button: 'delay-400'
} as const;

export default function GiftSection() {
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection Observer for animation with cleanup
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // More efficient than unobserve
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Animation helper function
  const getAnimationClass = useCallback((delay = '') => {
    return `${delay} transition-all duration-1000 ${
      isInView 
        ? "opacity-100 translate-x-0" 
        : "opacity-0 -translate-x-8"
    }`;
  }, [isInView]);

  // Navigation handler for the button
  const handleButtonClick = useCallback(() => {
    console.log("Check Gifts button clicked");
    // Add your actual navigation logic here
    // Example: router.push('/gifts');
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="w-full py-12 bg-gradient-to-r from-[#fbf0e1] via-transparent to-transparent"
      aria-label="Gifts & Giveaway Baskets Section"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-18">
          {/* Left Column - Content */}
          <div className="lg:w-1/2 flex items-center">
            <div className="max-w-lg">
              {/* Heading with animation */}
              <div className={getAnimationClass(ANIMATION_DELAYS.heading)}>
                <EditableText
                  key={`${COMPONENT_NAME}-heading`}
                  componentName={COMPONENT_NAME}
                  blockKey="heading"
                  defaultText="GIFTS & GIVEAWAY BASKETS"
                  className="text-4xl md:text-5xl text-[#F48221] mb-2 md:mb-4 font-romanwood"
                  tag="h1"
                  aria-label="Gifts & Giveaway Baskets Heading"
                />
              </div>

              {/* Description with animation */}
              <div className={getAnimationClass(ANIMATION_DELAYS.description)}>
                <EditableText
                  key={`${COMPONENT_NAME}-description`}
                  componentName={COMPONENT_NAME}
                  blockKey="description"
                  defaultText="Cravings Kitchen offers a comprehensive event catering service, transforming your special occasions into unforgettable experiences. From intimate gatherings to grand celebrations, our expert team will curate a personalized menu to suit your taste and budget."
                  className="text-gray-700 text-base md:text-lg mb-6 md:mb-8 leading-relaxed font-din"
                  tag="p"
                  as="textarea"
                  rows={4}
                  aria-label="Gifts & Giveaway Baskets Description"
                />
              </div>

              {/* Divider */}
              <div className="w-full mb-6 md:mb-8" />

              {/* Button with animation */}
              <div className={getAnimationClass(ANIMATION_DELAYS.button)}>
                <button 
                  onClick={handleButtonClick}
                  className="px-10 py-3 bg-[#602C0F] hover:bg-[#E5792A] text-white font-semibold rounded-2xl transition-colors duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#602C0F] focus:ring-offset-2 cursor-pointer font-din w-full sm:w-auto"
                  aria-label="Browse gifts and giveaway baskets"
                >
                  <EditableText
                    key={`${COMPONENT_NAME}-button-text`}
                    componentName={COMPONENT_NAME}
                    blockKey="button_text"
                    defaultText="Check Gifts"
                    className="font-din"
                    tag="span"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Image Slider */}
          <div className="lg:w-1/2">
            <EditableImageSlider 
              componentName="gifts-giveaways-section" 
              aspectRatio="aspect-[4/3]"  // Specific aspect ratio for this section
              objectFit="cover"     // Specific object fit for this section
            />
          </div>
        </div>
      </div>
    </section>
  );
}