"use client";

import { Star, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Badjie Trinidad",
      role: "Global Data Director",
      company: "TechCorp International",
      text: "Exceptional catering service that exceeded all expectations. The attention to detail and quality of food made our corporate event unforgettable.",
      rating: 5,
      initials: "BT"
    },
    {
      name: "Pia Trinidad",
      role: "Event Director",
      company: "Luxury Events Co.",
      text: "Working with this team was seamless. They understood our vision perfectly and delivered a culinary experience that our guests are still talking about.",
      rating: 5,
      initials: "PT"
    },
    {
      name: "Bea Trinidad",
      role: "Head of Hospitality",
      company: "Grand Hotel Group",
      text: "Professional, punctual, and phenomenal food quality. Our partnership has elevated our hotel's catering services to new heights.",
      rating: 5,
      initials: "BT"
    },
    {
      name: "Michael Rodriguez",
      role: "Wedding Planner",
      company: "Elegant Moments",
      text: "They turned our wedding dreams into reality. The food was exquisite, and the service was impeccable from start to finish.",
      rating: 5,
      initials: "MR"
    },
    {
      name: "Sarah Chen",
      role: "Corporate Manager",
      company: "Global Finance Inc.",
      text: "Our annual gala was a huge success thanks to their exceptional catering. Clients were impressed with both presentation and taste.",
      rating: 5,
      initials: "SC"
    }
  ];

  // duplicate for infinite loop
  const duplicated = [...testimonials, ...testimonials];

  return (
    <section className="py-16 relative overflow-hidden font-din">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-1 w-6 bg-gradient-to-r from-[#F68A3A] to-[#f97316] rounded-full"></div>
            <span className="text-sm font-bold text-[#F68A3A] uppercase tracking-[0.2em]">
              Testimonials
            </span>
            <div className="h-1 w-6 bg-gradient-to-l from-[#F68A3A] to-[#f97316] rounded-full"></div>
          </div>
          
          <h2 className="text-[#686868] text-xl md:text-2xl font-bold tracking-[0.1em] mb-3">
            Beloved by{" "}
            <span className="text-5xl font-brisa bg-gradient-to-r from-[#F68A3A] to-[#f97316] bg-clip-text text-transparent">
              Our Clients
            </span>
          </h2>
          
          <p className="text-gray-600 text-sm md:text-base tracking-wider max-w-2xl mx-auto">
            For over 30 years, we've been honored to serve extraordinary events and receive exceptional feedback.
          </p>
        </div>

        {/* Scrolling wrapper */}
        <div className="relative w-full overflow-hidden">
          {/* subtle fades */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F8F7F2] via-[#F8F7F2] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#F8F7F2] via-[#F8F7F2] to-transparent z-10 pointer-events-none" />

          {/* scroll container */}
          <div className="flex animate-scroll-testimonials w-max">
            {duplicated.map((item, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[380px] mx-4"
              >
                {/* Card with fixed height - UPDATED WITH ORANGE BORDER ON HOVER */}
                <div className="mb-12 bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 group h-[350px] flex flex-col border border-gray-200 hover:border-[#F68A3A]/50">
                  {/* top row: avatar + name + stars */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#F68A3A]/20 to-[#f97316]/20 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <span className="text-[#F68A3A] text-xl font-bold tracking-wider">
                            {item.initials}
                          </span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#F68A3A] rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-white fill-white" />
                        </div>
                      </div>

                      <div>
                        <p className="font-bold text-gray-800 text-lg tracking-wide">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600 tracking-wider">{item.role}</p>
                        <p className="text-xs text-gray-500 font-medium tracking-widest mt-1">
                          {item.company}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quote marks */}
                  <div className="text-[#F68A3A] text-4xl opacity-10 mb-2">
                    "
                  </div>

                  {/* Testimonial text with scrollable container */}
                  <div className="flex-grow min-h-0 overflow-hidden">
                    <div className="h-full overflow-y-auto pr-2">
                      <p className="text-gray-700 leading-relaxed tracking-wide text-sm">
                        {item.text}
                      </p>
                    </div>
                  </div>

                  {/* Rating - fixed at bottom */}
                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
                    <div className="flex text-[#F68A3A]">
                      {[...Array(item.rating)].map((_, s) => (
                        <Star
                          key={s}
                          className="w-5 h-5 fill-[#F68A3A] text-[#F68A3A]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modern Gallery Button */}
        <div className="text-center">
          <Link 
            href="/gallery" 
            className="inline-flex items-center justify-center gap-3 group"
          >
            {/* Button container - simplified without glow */}
            <div className="bg-[#F8F7F2] px-4 py-3 rounded-xl border border-gray-200 group-hover:border-[#F68A3A]/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="flex items-center justify-center gap-3">
                <span className="text-gray-800 font-medium tracking-wider text-sm uppercase group-hover:text-[#F68A3A] transition-colors duration-300">
                  View Our Event Gallery
                </span>
                <div className="relative">
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-[#F68A3A] group-hover:translate-x-1 transition-all duration-300" />
                  <ArrowRight className="absolute top-0 left-0 w-4 h-4 text-[#F68A3A] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
            </div>
          </Link>
    
        </div>
      </div>

      {/* animation */}
      <style jsx>{`
        @keyframes testimonialsScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-testimonials {
          animation: testimonialsScroll 60s linear infinite;
        }
        
        /* Custom scrollbar for testimonial text */
        .overflow-y-auto::-webkit-scrollbar {
          width: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #F8F7F2;
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #F68A3A;
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #f97316;
        }
      `}</style>
    </section>
  );
}