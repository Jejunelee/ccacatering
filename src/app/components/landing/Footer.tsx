"use client";

import Image from "next/image";
import {
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-orange-400 to-orange-300 text-white py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">

        {/* Left Section - Logo + Address */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <Image
            src="/LogoWhite.png"
            alt="Cravings Logo"
            width={130}
            height={40}
            className="mb-0"
          />

          <div className="text-md leading-tight">
            <p>123 Sample Street #123</p>
            <p>Maginhawa, Quezon City 123</p>
          </div>
        </div>

        {/* Right Section - Icons - Now filled and more visible */}
<div className="flex space-x-5">
  <div className="p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer">
    <Facebook 
      className="w-6 h-6"
      strokeWidth={3}
    />
  </div>
  <div className="p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer">
    <Twitter 
      className="w-6 h-6"
      strokeWidth={3}
    />
  </div>
  <div className="p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer">
    <Instagram
      className="w-6 h-6"
      strokeWidth={3}
    />
  </div>
</div>
      </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6 mt-6">
        <div className="h-px bg-white/30" />
      </div>

      {/* Bottom Row */}
      <div className="max-w-6xl mx-auto px-6 mt-4 flex flex-col md:flex-row justify-between items-center text-xs text-white/90 gap-3">
        <p>© 2025 Cravings Catering Group. All rights reserved.</p>

        <div className="flex space-x-6">
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}