"use client";

import Image from "next/image";

export default function Lead() {
  return (
    <section className="w-full flex justify-center items-center py-8 px-4">
      <div className="w-full max-w-6xl bg-[#FF914D] rounded-2xl p-5 md:p-7 flex flex-col md:flex-row gap-6 shadow-lg">
        
        {/* LEFT SIDE - More Compact */}
        <div className="flex-1 flex flex-col justify-center px-4 md:px-5 mb-12 md:mb-16">
          {/* Logo */}
          <div className="mb-1">
            <Image
              src="/LogoWhite.png"
              alt="Cravings Logo"
              width={130}
              height={35}
            />
          </div>

          {/* Text - Adjusted sizing */}
          <h1 className="text-white font-sans text-2xl md:text-3xl font-bold leading-snug tracking-tight">
            We're excited to make <br />
            your day{" "}
            <span className="relative font-black italic">
              special.
              <span className="absolute left-0 -bottom-0.5 w-full border-b-[5px] border-white rounded-full"></span>
            </span>
          </h1>
        </div>

        {/* RIGHT FORM CARD - Further Reduced Height */}
        <div className="flex-1 bg-white rounded-xl p-5 md:p-7 shadow-md">
          {/* Form Header - Compact */}
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-800 font-sans">Get in Touch</h2>
            <p className="text-gray-600 text-xs md:text-sm mt-0.5 font-sans">Fill out the form below and we'll get back to you soon.</p>
          </div>

          <form className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 font-sans">
                Name:
              </label>
              <input
                type="text"
                placeholder="Input your name..."
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8A3D] focus:border-transparent focus:bg-white transition-all font-sans placeholder:text-gray-400 text-gray-800"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 font-sans">
                Email Address:
              </label>
              <input
                type="email"
                placeholder="Input your email..."
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8A3D] focus:border-transparent focus:bg-white transition-all font-sans placeholder:text-gray-400 text-gray-800"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 font-sans">
                Phone Number:
              </label>
              <div className="flex gap-2">
                <div className="relative">
                  <select className="px-3 py-2.5 text-sm bg-[#FF8A3D] text-white rounded-lg outline-none font-medium cursor-pointer font-sans border border-[#FF8A3D] appearance-none pl-3 pr-7">
                    <option>+63</option>
                  </select>
                  {/* Custom chevron */}
                  <div className="absolute right-1.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="912-345-6789..."
                  className="flex-1 px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8A3D] focus:border-transparent focus:bg-white transition-all font-sans placeholder:text-gray-400 text-gray-800"
                />
              </div>
            </div>

            {/* Description - More Compact */}
            <div className="space-y-1.5">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 font-sans">
                Description
              </label>
              <textarea
                placeholder="Input details here..."
                rows={2}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8A3D] focus:border-transparent focus:bg-white transition-all resize-none font-sans placeholder:text-gray-400 text-gray-800"
              />
            </div>

            {/* SEND BUTTON - Compact */}
            <div className="pt-1">
              <button className="w-full bg-[#FF8A3D] hover:bg-[#e67a35] text-white text-sm font-bold py-3.5 rounded-lg shadow hover:shadow-md transition-all duration-200 font-sans active:scale-[0.99]">
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}