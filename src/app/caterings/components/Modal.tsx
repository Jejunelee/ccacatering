"use client";

import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { MenuItem } from "./Body";

interface ModalProps {
  item: MenuItem | null;
  onClose: () => void;
  imageIndex: number;
  setImageIndex: Dispatch<SetStateAction<number>>;
}

export default function Modal({ item, onClose, imageIndex, setImageIndex }: ModalProps) {
  if (!item) return null;

  const nextImage = () => {
    setImageIndex((prev) => (prev + 1) % item.images.length);
  };

  const prevImage = () => {
    setImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 p-2 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header Bar */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-[#7A3E0C] to-[#C47A3A] text-white text-lg font-bold py-2 px-8 rounded-full shadow-sm">
            {item.title}
          </div>
        </div>

        {/* Description line */}
        <p className="text-center text-gray-600 text-sm max-w-md mx-auto mb-6">
          “Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
          labore et dolore magna aliqua.”
        </p>

        {/* IMAGE SLIDER */}
        <div className="w-full flex justify-center relative mb-6">

          {/* Left arrow */}
          <button
            onClick={prevImage}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 transition"
          >
            <ChevronLeft className="text-gray-700" />
          </button>

          {/* Image */}
          <div className="w-48 h-32 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden shadow">
            <Image
              src={item.images[imageIndex]}
              alt={`${item.title} image`}
              width={300}
              height={300}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Right arrow */}
          <button
            onClick={nextImage}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 transition"
          >
            <ChevronRight className="text-gray-700" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {item.images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setImageIndex(idx)}
              className={`h-3 w-3 rounded-full transition ${
                idx === imageIndex ? "bg-orange-400 scale-110" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* CATEGORY SECTIONS */}
        <ModalCategory title="SOUP" text={item.soup} />
        <ModalCategory title="SALADS" text={item.salads} />
        <ModalCategory title="HOT SELECTIONS" text={item.hot} />
        <ModalCategory title="DESSERTS" text={item.desserts} />

      </div>
    </div>
  );
}

function ModalCategory({ title, text }: { title: string; text?: string }) {
  if (!text) return null;

  return (
    <div className="mb-8 text-center">
      <div className="bg-gradient-to-r from-[#F08A32] to-amber-500 text-white font-bold py-2 px-5 rounded-full w-fit mx-auto mb-3 shadow-sm">
        {title}
      </div>

      <p className="text-sm text-gray-600 max-w-lg mx-auto">
        “{text}”
      </p>
    </div>
  );
}

