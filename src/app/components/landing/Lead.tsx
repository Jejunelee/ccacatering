"use client";

import Image from "next/image";

export default function Lead() {
  return (
    <section className="w-full flex justify-center items-center py-8 px-4">
      <div className="w-full max-w-6xl bg-gradient-to-r from-[#FF914D] to-[#FF8A3D] rounded-2xl p-5 md:p-7 flex flex-col md:flex-row gap-6 shadow-xl">
        
        {/* LEFT SIDE */}
        <div className="flex-1 flex flex-col justify-center px-4 md:px-5 mb-12 md:mb-16">
          {/* Logo */}
          <div className="mb-2">
            <Image
              src="/LogoWhite.png"
              alt="Cravings Logo"
              width={130}
              height={35}
              className="drop-shadow-sm"
            />
          </div>

          {/* Text */}
          <h1 className="text-white font-sans text-2xl md:text-3xl font-bold leading-none tracking-tight">
  We're excited to make <br />
  <span className="relative tracking-[2]">
    your day{" "}
    <span className="absolute -top-2 md:-top-4 left-32 md:left-38 font-black font-brisa text-5xl md:text-7xl leading-none">
      special
      <span className="absolute left-0 -bottom-0.5 w-full border-b-[3px] md:border-b-[5px] border-white/90 rounded-full shadow-sm"></span>
    </span>
  </span>
</h1>
        </div>

        {/* RIGHT FORM CARD */}
        <div className="flex-1 bg-white rounded-xl p-5 md:p-7 shadow-lg border border-gray-100">
          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 font-sans">Get in Touch</h2>
            <p className="text-gray-500 text-xs md:text-sm mt-1 font-sans">
              Fill out the form below and we'll get back to you soon.
            </p>
          </div>

          <form className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 font-sans">
                Name
              </label>
              <input
                type="text"
                placeholder="Input your name..."
                className="w-full px-4 py-3 text-sm bg-gray-50/70 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 focus:border-[#FF8A3D] focus:bg-white transition-all duration-200 font-sans placeholder:text-gray-400 text-gray-900 shadow-sm"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 font-sans">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Input your email..."
                className="w-full px-4 py-3 text-sm bg-gray-50/70 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 focus:border-[#FF8A3D] focus:bg-white transition-all duration-200 font-sans placeholder:text-gray-400 text-gray-900 shadow-sm"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 font-sans">
                Phone Number
              </label>
              <div className="flex gap-3">
                <div className="relative">
                  <select className="px-4 py-3 text-sm bg-gradient-to-b from-[#FF914D] to-[#FF8A3D] text-white rounded-lg outline-none font-semibold cursor-pointer font-sans border border-[#FF8A3D] shadow-sm appearance-none pl-4 pr-8">
                    <option>+63</option>
                  </select>
                  {/* Custom chevron */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="912-345-6789..."
                  className="flex-1 px-4 py-3 text-sm bg-gray-50/70 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 focus:border-[#FF8A3D] focus:bg-white transition-all duration-200 font-sans placeholder:text-gray-400 text-gray-900 shadow-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 font-sans">
                Description
              </label>
              <textarea
                placeholder="Input details here..."
                rows={2}
                className="w-full px-4 py-3 text-sm bg-gray-50/70 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 focus:border-[#FF8A3D] focus:bg-white transition-all duration-200 resize-none font-sans placeholder:text-gray-400 text-gray-900 shadow-sm"
              />
            </div>

            {/* SEND BUTTON */}
            <div className="pt-2">
              <button className="w-full bg-gradient-to-r from-[#FF914D] to-[#FF8A3D] hover:from-[#e67a35] hover:to-[#d66a25] text-white text-sm font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-sans active:scale-[0.99] transform">
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}