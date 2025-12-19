"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import EditableText from "@/components/editable/EditableText";

export default function Header() {
  const [isInView, setIsInView] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Intersection Observer for animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (headerRef.current) {
            observer.unobserve(headerRef.current);
          }
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current);
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
    <header 
      ref={headerRef}
      className="w-full bg-[#FAF8F6] mt-16 flex flex-col items-center text-center px-4"
    >
      {/* Top Title - Animated */}
      <div className={animationClass()}>
        <EditableText
          key="header-title"
          componentName="event-catering-header-section"
          blockKey="title"
          defaultText="EVENTS & CATERING"
          className="font-romanwood text-3xl sm:text-4xl md:text-5xl tracking-[0.001em] text-[#1A1A1A]"
          tag="h1"
        />
      </div>

      {/* Description - Animated with delay */}
      <div className={animationClass('delay-200')}>
        <EditableText
          key="header-description"
          componentName="event-catering-header-section"
          blockKey="description"
          defaultText="Whether you're hosting a corporate event, a family gathering, or a personal celebration, Cravings has you covered. Our delectable party trays and convenient packed meals are designed to satisfy every craving and make your event a memorable one."
          className="mt-6 text-gray-600 max-w-2xl leading-relaxed font-din text-base sm:text-lg"
          tag="p"
          as="textarea"
          rows={3}
        />
      </div>

      {/* Button - Animated with longer delay */}
      <div className={animationClass('delay-400')}>
        <button
          className="
            mt-8 bg-[#F68A3A] hover:bg-[#E5792A] text-white 
            px-10 py-3 rounded-2xl font-semibold text-lg 
            shadow-md hover:shadow-lg transition-all duration-300
            font-din
          "
        >
          <EditableText
            key="header-button"
            componentName="event-catering-header-section"
            blockKey="button_text"
            defaultText="Order Now"
            className="font-din"
            tag="span"
          />
        </button>
      </div>

      {/* Large Bottom CTA Banner - Keep original size and styling but with editable text */}
      <div className="mt-10 w-full max-w-6xl bg-[#F68A3A] text-white rounded-tl-4xl rounded-tr-xl rounded-br-4xl rounded-bl-xl py-4 px-4 flex flex-col items-center justify-center shadow-md">
        <EditableText
          key="cta-subtitle"
          componentName="event-catering-header-section"
          blockKey="cta_subtitle"
          defaultText="Not sure where to start? Check our"
          className="text-white/90 text-lg font-din"
          tag="p"
        />

        <EditableText
          key="cta-title"
          componentName="event-catering-header-section"
          blockKey="cta_title"
          defaultText="Ready-Made Menus"
          className="text-3xl sm:text-4xl md:text-5xl font-bold font-brisa tracking-wide"
          tag="h2"
        />
      </div>
    </header>
  );
}