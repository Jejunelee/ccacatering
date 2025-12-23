"use client";

import Link from "next/link";
import { Phone, ChevronDown, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const phoneNumber = "+639958902825";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handlePhoneClick = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const navItems = [
    { href: "/catering", label: "Events & Catering" },
    { href: "/ptpm", label: "Packed Trays" },
    { href: "/gifts", label: "Gifts" },
    { href: "/venues", label: "Venues" },
    { 
      href: "/blog", 
      label: "Blog & Articles",
      hasDropdown: true 
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveDropdown(null);
  };

  const toggleDropdown = (href: string) => {
    setActiveDropdown(activeDropdown === href ? null : href);
  };

  return (
    <>
      <header className={`w-full py-2 bg-[#F8F7F2] sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "shadow-lg backdrop-blur-sm bg-[#FFFDF8]/95" 
          : ""
      }`}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Left Section - Logo + Navigation */}
            <div className="flex items-center">
              {/* Logo */}
              <Link 
                href="/" 
                className="focus:outline-none focus:ring-0"
                aria-label="Cravings Home"
              >
                <img 
                  src="LogoCater.png" 
                  alt="Cravings Logo" 
                  className="h-11 w-auto md:h-14 transition-transform duration-300 hover:scale-105"
                  width={160}
                  height={64}
                  loading="eager"
                />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center ml-4" aria-label="Main navigation">
                {navItems.map((item) => (
                  <div 
                    key={item.href} 
                    className="relative group"
                  >
                    <Link
                      href={item.href}
                      className="relative text-gray-600 hover:text-gray-900 text-base font-medium transition-colors duration-300 flex items-center gap-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-0"
                    >
                      <span>{item.label}</span>
                      <span className="absolute inset-0 rounded-lg bg-[#FF7A00]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  </div>
                ))}
              </nav>
            </div>

            {/* Right Section - Contact and Mobile Menu */}
            <div className="flex items-center space-x-3">
              {/* Desktop Contact Button - Now triggers phone call */}
              <button
                onClick={handlePhoneClick}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-[#FF7A00] to-[#FF9500] text-white px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-orange-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/50"
                aria-label={`Call us at ${phoneNumber}`}
              >
                <Phone size={16} className="transition-transform duration-300 hover:scale-110" />
                <span className="hidden md:inline whitespace-nowrap">Contact Us</span>
              </button>

              {/* Mobile Contact Icon - Now triggers phone call */}
              <button
                onClick={handlePhoneClick}
                className="sm:hidden flex items-center justify-center w-9 h-9 bg-gradient-to-r from-[#FF7A00] to-[#FF9500] text-white rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-orange-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/50"
                aria-label={`Call us at ${phoneNumber}`}
              >
                <Phone size={16} />
              </button>

              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-[#FF7A00]/10 hover:to-[#FF9500]/10 transition-all duration-300 active:scale-95 focus:outline-none focus:ring-0"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
        isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`} onClick={toggleMobileMenu} />

      {/* Mobile Menu Panel */}
      <div className={`lg:hidden fixed top-0 left-0 w-full max-w-sm h-full bg-[#F8F7F2] z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-5 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <img 
              src="Logo.png" 
              alt="Cravings Logo" 
              className="h-9 w-auto"
              width={120}
              height={40}
            />
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-[#FF7A00]/10 transition-colors duration-300 focus:outline-none focus:ring-0"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="space-y-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <div key={item.href} className="border-b border-gray-200 last:border-b-0">
                {item.hasDropdown ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.href)}
                      className="flex items-center justify-between w-full py-3 text-gray-700 hover:text-gray-900 text-base font-medium transition-colors duration-300 focus:outline-none focus:ring-0 text-left"
                      aria-expanded={activeDropdown === item.href}
                    >
                      <span>{item.label}</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block py-3 text-gray-700 hover:text-gray-900 text-base font-medium transition-colors duration-300 focus:outline-none focus:ring-0 text-left"
                    onClick={toggleMobileMenu}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Contact CTA */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handlePhoneClick}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-[#FF7A00] to-[#FF9500] text-white w-full py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-orange-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/50"
            >
              <Phone size={18} />
              <span>Contact Us Now</span>
            </button>
            
            {/* Mobile Contact Info - Updated with new phone number */}
            <div className="mt-4 space-y-2 text-left text-gray-600">
              <p className="text-xs">Need immediate assistance?</p>
              <button
                onClick={handlePhoneClick}
                className="block text-[#FF7A00] font-semibold text-base hover:text-[#FF9500] transition-colors duration-300 focus:outline-none focus:ring-0 text-left"
              >
                {phoneNumber}
              </button>
              <p className="text-xs">Call us anytime</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}