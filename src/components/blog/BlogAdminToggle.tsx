// components/blog/BlogAdminToggle.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/providers/useAuth";
import { ensureAuthPersisted } from "@/lib/auth/persist";
import { supabase } from "@/lib/supabase";

interface BlogAdminToggleProps {
  isEditMode: boolean;
  onToggleEditMode: (mode: boolean) => void;
}

export default function BlogAdminToggle({ 
  isEditMode, 
  onToggleEditMode 
}: BlogAdminToggleProps) {
  const { isAdmin, user, isLoading } = useAuthContext();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  // Clear auth error when auth state changes
  useEffect(() => {
    if (user) {
      setAuthError(null);
    }
  }, [user]);

  // Periodically check session when in edit mode
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isEditMode && user) {
      // Check session health every 30 seconds while in edit mode
      intervalId = setInterval(async () => {
        try {
          const isAuthReady = await ensureAuthPersisted();
          if (!isAuthReady) {
            setShowSessionWarning(true);
            console.warn("Blog edit mode: Session health check failed");
          } else {
            setShowSessionWarning(false);
          }
        } catch (error) {
          console.error("Session health check error:", error);
        }
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isEditMode, user]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          <span className="text-sm font-medium text-gray-700">Loading...</span>
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
      setShowSessionWarning(false);
      
      try {
        console.log("BlogAdminToggle: Checking auth persistence before edit mode...");
        
        // Enhanced auth persistence check with timeout
        const authCheckPromise = ensureAuthPersisted();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Auth check timeout")), 5000)
        );
        
        const isAuthReady = await Promise.race([authCheckPromise, timeoutPromise]) as boolean;
        
        if (!isAuthReady) {
          // Try to refresh session with explicit error handling
          console.log("Auth not ready, attempting to refresh session...");
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error("Session refresh error:", sessionError);
            setAuthError("Session error. Please refresh the page and log in again.");
          } else if (!session) {
            console.error("No session found after refresh");
            setAuthError("Please log in to enable blog edit mode.");
          } else {
            // Session found, check if still valid
            const now = Math.floor(Date.now() / 1000);
            if (session.expires_at && session.expires_at < now) {
              setAuthError("Your session has expired. Please refresh and log in again.");
            } else {
              // Auth is good now, proceed with toggle
              console.log("Session refreshed successfully, enabling edit mode");
              onToggleEditMode(newMode);
            }
          }
        } else {
          // Auth is good, proceed with toggle
          console.log("Auth persistence confirmed, enabling edit mode");
          onToggleEditMode(newMode);
        }
        
      } catch (error: any) {
        console.error("Error checking auth persistence:", error);
        
        let errorMessage = "Unable to verify authentication.";
        if (error.message === "Auth check timeout") {
          errorMessage = "Authentication check is taking too long. Please try again.";
        } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
          errorMessage = "Network error. Please check your connection.";
        }
        
        setAuthError(errorMessage);
      } finally {
        setIsCheckingAuth(false);
      }
    } else {
      // Turning edit mode OFF - save any pending changes first
      console.log("Disabling blog edit mode");
      
      // Check if there are any pending saves
      if (window.pendingSaves && window.pendingSaves.size > 0) {
        const pendingCount = window.pendingSaves.size;
        if (confirm(`You have ${pendingCount} unsaved change${pendingCount > 1 ? 's' : ''}. Are you sure you want to exit edit mode?`)) {
          onToggleEditMode(newMode);
        }
      } else {
        onToggleEditMode(newMode);
      }
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Auth Error Alert */}
      {authError && (
        <div className="mb-2 animate-slide-down">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-md max-w-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-red-800">Authentication Required</p>
                <p className="mt-1 text-sm text-red-700">{authError}</p>
                <div className="mt-3 flex space-x-3">
                  <button
                    onClick={() => {
                      setAuthError(null);
                      window.location.reload();
                    }}
                    className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-medium transition-colors"
                  >
                    Refresh Page
                  </button>
                  <button
                    onClick={() => setAuthError(null)}
                    className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Session Health Warning */}
      {showSessionWarning && (
        <div className="mb-2 animate-slide-down">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-md max-w-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-amber-800">Session Warning</p>
                <p className="mt-1 text-sm text-amber-700">
                  Your session may expire soon. Save your work frequently.
                </p>
                <button
                  onClick={() => setShowSessionWarning(false)}
                  className="mt-2 text-xs px-3 py-1 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 font-medium transition-colors"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toggle Component */}
      <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
        <div className="flex flex-col min-w-[120px]">
          <span className="text-sm font-medium text-gray-700">
            {isCheckingAuth ? "Checking..." : isEditMode ? "Blog Edit Mode" : "View Mode"}
          </span>
          {user && (
            <span className="text-xs text-gray-500 truncate mt-1 max-w-[120px]">
              {user.email}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Pending Saves Indicator */}
          {window.pendingSaves && window.pendingSaves.size > 0 && (
            <div className="relative">
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {window.pendingSaves.size}
              </div>
            </div>
          )}
          
          <button
            onClick={handleToggleEditMode}
            disabled={isCheckingAuth}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isEditMode ? "bg-orange-500" : "bg-gray-300"
            }`}
            aria-label={isEditMode ? "Disable blog edit mode" : "Enable blog edit mode"}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEditMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          
          {/* Status Indicator */}
          {isCheckingAuth && (
            <div className="ml-1">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Mode Information */}
      {isEditMode && (
        <div className="mt-2 animate-slide-down">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg shadow-sm max-w-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">Blog Edit Mode Active</p>
                <ul className="mt-1 text-sm text-blue-700 space-y-1">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Click on blog content to edit
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Changes save automatically
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 mr-1 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.282 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Stay on page while saving
                  </li>
                </ul>
                {window.pendingSaves && window.pendingSaves.size > 0 && (
                  <div className="mt-2 p-2 bg-blue-100 rounded-md">
                    <p className="text-xs font-medium text-blue-800">
                      {window.pendingSaves.size} pending save{window.pendingSaves.size > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add CSS animation if not already added
if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('style[data-blog-admin-toggle]');
  if (!existingStyle) {
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-blog-admin-toggle', 'true');
    styleElement.textContent = `
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
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    `;
    document.head.appendChild(styleElement);
  }
}