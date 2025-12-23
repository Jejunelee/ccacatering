import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/landing/Header";
import Footer from "./components/landing/Footer";
import { brisaFont, dinFont, romanWoodFont } from "@/lib/fonts";
import { AuthProvider } from '@/providers/AuthProvider'; // Add this import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cravings Catering",
  description: "Over 30 years of experience in delivering crave-worthy food and personalized service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`
      ${geistSans.variable} 
      ${geistMono.variable}
      ${brisaFont.variable}
      ${dinFont.variable}
      ${romanWoodFont.variable}
    `}>
      <body className="antialiased">
        <AuthProvider> {/* Wrap everything with AuthProvider */}
          <Header /> 
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}