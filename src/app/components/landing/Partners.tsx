"use client";

import Image from 'next/image';

export default function Partners() {
  const logos = [
    { name: 'Marriott Hotels', src: 'partners/docker.svg', width: 60, height: 24 },
    { name: 'Hyatt Hotels', src: 'partners/docker.svg', width: 60, height: 26 },
    { name: 'Hilton Worldwide', src: 'partners/docker.svg', width: 50, height: 24 },
    { name: 'Four Seasons', src: 'partners/docker.svg', width: 120, height: 20 },
    { name: 'Mandarin Oriental', src: 'partners/docker.svg', width: 120, height: 24 },
    { name: 'InterContinental', src: 'partners/docker.svg', width: 60, height: 24 },
    { name: 'Accor Hotels', src: 'partners/docker.svg', width: 90, height: 28 },
    { name: 'Rosewood Hotels', src: 'partners/docker.svg', width: 50, height: 24 },
    { name: 'St. Regis', src: 'partners/docker.svg', width: 170, height: 24 },
    { name: 'Ritz-Carlton', src: 'partners/docker.svg', width: 50, height: 24 },
    { name: 'W Hotels', src: 'partners/docker.svg', width: 110, height: 24 },
    { name: 'Shangri-La', src: 'partners/docker.svg', width: 50, height: 24 }
  ];

  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [...logos, ...logos];

  return (
    <div className="py-2 relative w-full mb-6 overflow-hidden border-gray-800/30 font-din">
      
      {/* Header Section */}
      <div className="mb-6 text-center">
        <h2 className="text-[#686868] text-xl md:text-2xl font-bold tracking-wider">
          Partnered with {' '}
          <span className="text-5xl font-brisa bg-gradient-to-r from-[#F68A3A] to-[#f97316] bg-clip-text text-transparent">
            Industry Leaders
          </span>
        </h2>
      </div>

      {/* Scrolling Section */}
      <div className="relative">
        {/* Gradient fade edges - more subtle */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background via-background/70 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background via-background/70 to-transparent z-10 pointer-events-none" />
        
        {/* Scrolling container */}
        <div className="flex animate-scroll-slow">
          {duplicatedLogos.map((logo, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-8 px-2 py-1 flex items-center justify-center group"
            >
              <div className="relative opacity-60 group-hover:opacity-100 transition-all duration-300">
                {/* Subtle shine effect on hover */}
                <div className="absolute -inset-1 opacity-0 group-hover:opacity-15 bg-gradient-to-r from-[#F68A3A] to-[#f97316] blur-sm rounded-lg transition-opacity duration-300"></div>
                
                {/* Logo */}
                <div className="relative grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-105">
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={logo.width}
                    height={logo.height}
                    className="object-contain"
                    draggable="false"
                  />
                </div>
                
                {/* Label - appears on hover */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <span className="text-xs text-gray-600 font-din font-semibold whitespace-nowrap tracking-wider">
                    {logo.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 4rem));
          }
        }
        .animate-scroll-slow {
          animation: scroll 100s linear infinite;
          display: flex;
          width: max-content;
        }
        .animate-scroll-slow:hover {
        }
        
        /* DIN font specific styling */
        .font-din {
          font-family: 'DIN', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  );
}