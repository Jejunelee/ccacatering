// components/menu/MenuAdminToggle.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/providers/useAuth";
import { ensureAuthPersisted } from "@/lib/auth/persist";
import { supabase } from "@/lib/supabase";

interface MenuAdminToggleProps {
  isEditMode: boolean;
  onToggleEditMode: (mode: boolean) => void;
}

export default function MenuAdminToggle({ 
  isEditMode, 
  onToggleEditMode 
}: MenuAdminToggleProps) {
  const { isAdmin, user, isLoading } = useAuthContext();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Clear auth error when auth state changes
  useEffect(() => {
    if (user) {
      setAuthError(null);
    }
  }, [user]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#F68A3A]"></div>
          <span className="text-sm font-medium text-gray-700">Checking auth...</span>
        </div>
      </div>
    );
  }

  // Don't show toggle if not admin
  if (!isAdmin) return null;

  const handleToggleEditMode = async () => {
    const newMode = !isEditMode;
    
    // If turning edit mode ON, verify auth persistence
    if (newMode) {
      setIsCheckingAuth(true);
      setAuthError(null);
      
      try {
        // Verify auth is properly persisted before allowing edit mode
        const isAuthReady = await ensureAuthPersisted();
        
        if (!isAuthReady) {
          // Try to refresh session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error || !session) {
            setAuthError("Please refresh the page and log in again to edit.");
            setIsCheckingAuth(false);
            return;
          }
        }
        
        // Auth is good, proceed with toggle
        onToggleEditMode(newMode);
        
      } catch (error) {
        console.error("Error checking auth persistence:", error);
        setAuthError("Unable to verify authentication. Please refresh the page.");
      } finally {
        setIsCheckingAuth(false);
      }
    } else {
      // Turning edit mode OFF doesn't need auth check
      onToggleEditMode(newMode);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Auth Error Alert */}
      {authError && (
        <div className="mb-2 animate-slide-down">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{authError}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setAuthError(null)}
                    className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toggle Component */}
      <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">
            {isCheckingAuth ? "Checking..." : isEditMode ? "Catering Edit Mode" : "View Mode"}
          </span>
          {user && (
            <span className="text-xs text-gray-500 mt-1">
              {user.email?.substring(0, user.email.indexOf('@'))}
            </span>
          )}
        </div>
        
        <button
          onClick={handleToggleEditMode}
          disabled={isCheckingAuth}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#F68A3A] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            isEditMode ? "bg-[#F68A3A]" : "bg-gray-300"
          }`}
          aria-label={isEditMode ? "Disable edit mode" : "Enable edit mode"}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEditMode ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        
        {/* Status Indicator */}
        {isCheckingAuth && (
          <div className="ml-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#F68A3A]"></div>
          </div>
        )}
      </div>
      
      {/* Edit Mode Warning */}
      {isEditMode && (
        <div className="mt-2 animate-slide-down">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  Edit mode active. Please stay on the page while editing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add CSS animation
const styles = `
@keyframes slide-down {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-down {
  animation: slide-down 0.3s ease-out;
}
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}