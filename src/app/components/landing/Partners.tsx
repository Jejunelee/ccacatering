"use client";

import Image from 'next/image';

export default function Partners() {
  const logos = [
    { name: 'Center for Culinary Arts Manila', src: '/partners/1.png', width: 100, height: 75 },
    { name: 'Asian School of Hospitality Arts', src: '/partners/4.png', width: 100, height: 75 },
  ];

  return (
    <div className="py-2 relative w-full mb-6 font-din">
      
      {/* Header Section */}
      <div className="mb-5 text-center">
        <h2 className="text-[#686868] text-xl md:text-2xl font-bold tracking-wider">
          Powered by {' '}
          <span className="text-5xl font-brisa bg-gradient-to-r from-[#F68A3A] to-[#f97316] bg-clip-text text-transparent">
            Industry Leaders
          </span>
        </h2>
      </div>

      {/* Static centered logos */}
      <div className="relative">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16 px-4">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-2 py-1 flex items-center justify-center group"
            >
              <div className="relative opacity-70 group-hover:opacity-100 transition-all duration-300">
                {/* Subtle shine effect on hover */}
                <div className="absolute -inset-2 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-[#F68A3A]/20 to-[#f97316]/20 blur-sm rounded-lg transition-opacity duration-300"></div>
                
                {/* Logo */}
                <div className="relative grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={logo.width}
                    height={logo.height}
                    className="object-contain"
                    draggable="false"
                  />
                </div>
                
                {/* Label */}
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

      {/* DIN font specific styling */}
      <style jsx>{`
        .font-din {
          font-family: 'DIN', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  );
}