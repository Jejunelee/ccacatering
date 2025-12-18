"use client";

import Image from "next/image";
import { useState } from "react";

export default function Lead() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+63",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // Combine country code and phone number
      const fullPhone = `${formData.countryCode} ${formData.phone}`;
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: fullPhone,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          text: "🎉 Message sent successfully! We'll get back to you within 24 hours.", 
          type: "success" 
        });
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          countryCode: "+63",
          description: "",
        });
        
        // Auto-clear success message after 5 seconds
        setTimeout(() => {
          setMessage({ text: "", type: "" });
        }, 5000);
        
      } else {
        setMessage({ 
          text: data.error || "❌ Failed to send message. Please try again.", 
          type: "error" 
        });
      }
    } catch (error) {
      setMessage({ 
        text: "⚠️ An error occurred. Please check your connection and try again.", 
        type: "error" 
      });
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full flex justify-center items-center py-6 px-4" id="contact">
      <div className="w-full max-w-6xl bg-gradient-to-r from-[#FF914D] to-[#FF8A3D] rounded-2xl p-4 md:p-5 flex flex-col md:flex-row gap-4 shadow-xl">
        
        {/* LEFT SIDE - Text unchanged as requested */}
        <div className="flex-1 flex flex-col justify-center px-3 md:px-4 mb-8 md:mb-10">
          <div className="mb-2">
            <Image
              src="/LogoWhite.png"
              alt="Cravings Logo"
              width={130}
              height={35}
              className="drop-shadow-sm"
              priority
            />
          </div>

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

        {/* RIGHT FORM CARD - Made 20% shorter */}
        <div className="flex-1 bg-white rounded-xl p-4 md:p-5 shadow-lg border border-gray-100">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-900 font-sans">Get in Touch</h2>
            <p className="text-gray-500 text-xs md:text-sm mt-0.5 font-sans">
              Fill out the form below and we'll get back to you soon.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-800 font-sans">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Input your name..."
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-sm bg-gray-50/70 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 focus:border-[#FF8A3D] focus:bg-white transition-all duration-200 font-sans placeholder:text-gray-400 text-gray-900 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 font-sans">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Input your email..."
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-sm bg-gray-50/70 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 focus:border-[#FF8A3D] focus:bg-white transition-all duration-200 font-sans placeholder:text-gray-400 text-gray-900 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 font-sans">
                Phone Number *
              </label>
              <div className="flex gap-3">
                <div className="relative">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="px-4 py-2.5 text-sm bg-gradient-to-b from-[#FF914D] to-[#FF8A3D] text-white rounded-lg outline-none font-semibold cursor-pointer font-sans border border-[#FF8A3D] shadow-sm appearance-none pl-4 pr-8 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
                  >
                    <option value="+63">+63 (PH)</option>
                    <option value="+1">+1 (US/CA)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+65">+65 (SG)</option>
                    <option value="+60">+60 (MY)</option>
                    <option value="+971">+971 (UAE)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="912-345-6789"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  pattern="[0-9\-]+"
                  className="flex-1 px-4 py-2.5 text-sm bg-gray-50/70 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 focus:border-[#FF8A3D] focus:bg-white transition-all duration-200 font-sans placeholder:text-gray-400 text-gray-900 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-800 font-sans">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Tell us about your event, special requests, or any questions..."
                rows={3}
                value={formData.description}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-sm bg-gray-50/70 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 focus:border-[#FF8A3D] focus:bg-white transition-all duration-200 resize-none font-sans placeholder:text-gray-400 text-gray-900 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Status Message */}
            {message.text && (
              <div className={`p-3 rounded-lg text-sm font-medium ${
                message.type === "success" 
                  ? "bg-green-50 text-green-800 border border-green-200" 
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                <div className="flex items-start gap-2">
                  {message.type === "success" ? (
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{message.text}</span>
                </div>
              </div>
            )}

            {/* SEND BUTTON */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#FF914D] to-[#FF8A3D] hover:from-[#e67a35] hover:to-[#d66a25] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-sans active:scale-[0.99] transform flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending Message...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Message
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-1">
                * Required fields
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}