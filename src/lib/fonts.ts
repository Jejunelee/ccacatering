// src/lib/fonts.ts
import localFont from 'next/font/local';

// Brisa Font
export const brisaFont = localFont({
  src: '../fonts/Brisa/Brisa Regular.woff2',
  variable: '--font-brisa',
  display: 'swap',
});

// DIN Font Family (multiple weights)
export const dinFont = localFont({
  src: [
    {
      path: '../fonts/DIN/DIN Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/DIN/DIN Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/DIN/DIN Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/DIN/DIN BlackAlternate.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../fonts/DIN/DIN LightAlternate.woff2',
      weight: '300',
      style: 'normal',
    },
    // Add other DIN files as needed
  ],
  variable: '--font-din',
  display: 'swap',
});

// RomanWood Font
export const romanWoodFont = localFont({
  src: '../fonts/RomanWood/Roman Wood Regular.woff2',
  variable: '--font-romanwood',
  display: 'swap',
});