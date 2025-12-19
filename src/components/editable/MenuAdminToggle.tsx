// components/menu/MenuAdminToggle.tsx
"use client";

import { useState } from "react";
import { useAuthContext } from "@/providers/AuthProvider";

interface MenuAdminToggleProps {
  isEditMode: boolean;
  onToggleEditMode: (mode: boolean) => void;
}

export default function MenuAdminToggle({ 
  isEditMode, 
  onToggleEditMode 
}: MenuAdminToggleProps) {
  const { isAdmin } = useAuthContext();

  if (!isAdmin) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
        <span className="text-sm font-medium text-gray-700">
          {isEditMode ? "Catering Edit Mode" : "View Mode"}
        </span>
        <button
          onClick={() => onToggleEditMode(!isEditMode)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#F68A3A] focus:ring-offset-2 ${
            isEditMode ? "bg-[#F68A3A]" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEditMode ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}