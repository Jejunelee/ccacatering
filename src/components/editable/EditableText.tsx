'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/providers/AuthProvider';
import type { Database } from '@/types/supabase'; // Adjust path as needed

type ContentBlock = Database['public']['Tables']['content_blocks']['Row'];

interface EditableTextProps {
  componentName: string;
  blockKey: string;
  defaultText: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p' | 'span' | 'div';
  as?: 'input' | 'textarea';
  rows?: number;
  placeholder?: string;
}

export default function EditableText({
  componentName,
  blockKey,
  defaultText,
  className = '',
  tag = 'div',
  as = 'input',
  rows = 3,
  placeholder = 'Enter text...'
}: EditableTextProps) {
  const { isAdmin, user, isLoading } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(defaultText);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_RETRIES = 2;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (isSaving) {
        console.log(`🧹 [${blockKey}] Component unmounting during save`);
      }
    };
  }, [isSaving, blockKey]);

  // Combined auth and fetch effect to avoid race conditions
  useEffect(() => {
    console.log(`📊 EditableText [${blockKey}] Auth:`, { 
      isAdmin, 
      userEmail: user?.email,
      isLoading,
      userId: user?.id?.substring(0, 8)
    });
    
    if (!isLoading) {
      console.log(`📥 EditableText [${blockKey}] Fetching content...`);
      fetchContent();
    }
  }, [componentName, blockKey, isAdmin, user, isLoading]);

  const fetchContent = useCallback(async () => {
    try {
      console.log(`🔍 Fetching from Supabase: ${componentName}.${blockKey}`);
      const { data, error } = await supabase
        .from('content_blocks')
        .select('content')
        .eq('component_name', componentName)
        .eq('block_key', blockKey)
        .single();
  
      console.log(`📦 Fetch result [${blockKey}]:`, { 
        data, 
        error: error?.message,
        hasData: !!data 
      });
  
      // Type assertion for data
      const contentData = data as { content: string } | null;
      
      if (!error && contentData?.content) {
        setText(contentData.content);
      } else if (error && error.code !== 'PGRST116') {
        console.warn(`⚠️ [${blockKey}] Fetch error:`, error.message);
      }
      
    } catch (error) {
      console.error(`💥 Fetch exception [${blockKey}]:`, error);
    }
  }, [componentName, blockKey]);

  async function saveContent() {
    // Cancel any pending save timeouts
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    // Prevent multiple saves
    if (isSaving) {
      console.log(`🚫 [${blockKey}] Save already in progress`);
      return;
    }
    
    setSaveError(null);
    
    // Check retry limit
    if (retryCount >= MAX_RETRIES) {
      setSaveError('Maximum retry attempts reached. Please refresh the page.');
      setIsSaving(false);
      return;
    }
    
    if (!text.trim()) {
      console.log(`📝 [${blockKey}] Empty text, skipping save`);
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    console.log(`💾 [${blockKey}] Saving: "${text.substring(0, 50)}..."`);
    
    // Check auth before saving
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    console.log(`👤 [${blockKey}] Current user on save:`, currentUser?.email);
    
    if (!currentUser) {
      console.error(`❌ [${blockKey}] No user authenticated!`);
      setSaveError('Not authenticated. Please log in again.');
      setIsSaving(false);
      return;
    }

    try {
      console.log(`🚀 [${blockKey}] Sending to Supabase...`);
      
      // FIXED: Properly typed upsert
      const { data, error } = await supabase
      .from('content_blocks')
      .upsert({
        component_name: componentName,
        block_key: blockKey,
        content: text,
        content_type: 'text',
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      } as any, {  // Type assertion
        onConflict: 'component_name,block_key'
      });
      
      console.log(`✅ [${blockKey}] Save response:`, { 
        success: !error, 
        error: error?.message,
        data 
      });
      
      if (error) throw error;
      
      // Success - reset retry count
      setRetryCount(0);
      setIsEditing(false);
      console.log(`🎉 [${blockKey}] Edit completed successfully`);
      
    } catch (error: any) {
      console.error(`❌ [${blockKey}] Save error:`, error);
      setSaveError(error.message || 'Failed to save. Please try again.');
      setRetryCount(prev => prev + 1);
      
      // Keep editing mode open on error so user can retry
    } finally {
      setIsSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    console.log(`⌨️ [${blockKey}] Key press:`, e.key);
    
    // Prevent handling keys while saving
    if (isSaving) return;
    
    if (e.key === 'Enter' && !e.shiftKey && as === 'input') {
      e.preventDefault();
      saveContent();
    }
    if (e.key === 'Escape') {
      console.log(`⎋ [${blockKey}] Escape pressed, cancelling edit`);
      setText(defaultText);
      setIsEditing(false);
      setSaveError(null);
      setRetryCount(0);
    }
  }

  function handleBlur() {
    console.log(`👁️ [${blockKey}] Input blur, isSaving: ${isSaving}, hasError: ${!!saveError}`);
    
    // Prevent blur from triggering save if already saving
    if (isSaving) {
      console.log(`⏳ [${blockKey}] Save in progress, ignoring blur`);
      return;
    }
    
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Add a small delay to allow Enter key to trigger first
    saveTimeoutRef.current = setTimeout(() => {
      if (isEditing && !saveError) {
        saveContent();
      }
    }, 150);
  }

  function startEditing(e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation();
    e.preventDefault();
    
    console.log(`✏️ [${blockKey}] Starting edit, isAdmin: ${isAdmin}, isSaving: ${isSaving}`);
    
    // Prevent starting edit while saving
    if (isSaving) {
      console.log(`⏳ [${blockKey}] Cannot edit while saving`);
      return;
    }
    
    if (!isAdmin) {
      console.warn(`⛔ [${blockKey}] Edit blocked: not admin`);
      return;
    }
  
    setIsEditing(true);
    setSaveError(null);
    setRetryCount(0); // Reset retry count when starting new edit
    
    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
        console.log(`🎯 [${blockKey}] Input focused`);
      }
    });
  }

  // Render the appropriate HTML tag
  const Tag = tag;

  if (!isAdmin && !isEditing) {
    // Non-admin view - just display text
    console.log(`👀 [${blockKey}] Rendering non-admin view`);
    return <Tag className={className}>{text}</Tag>;
  }

  if (isEditing) {
    // Editing mode
    console.log(`✍️ [${blockKey}] Rendering edit mode`);
    return (
      <div className="relative">
        {as === 'textarea' ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            rows={rows}
            placeholder={placeholder}
            className={`${className} border-2 border-[#F68A3A] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#F68A3A] focus:ring-offset-2 w-full ${
              saveError ? 'border-red-500' : ''
            } ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isSaving}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`${className} border-2 border-[#F68A3A] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#F68A3A] focus:ring-offset-2 w-full ${
              saveError ? 'border-red-500' : ''
            } ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isSaving}
          />
        )}
        
        {/* Save status and action buttons */}
        <div className="absolute -right-48 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
          {isSaving ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#F68A3A]"></div>
              <span className="text-sm text-[#F68A3A] font-medium whitespace-nowrap">
                Saving...
              </span>
            </div>
          ) : saveError ? (
            <div className="flex flex-col items-end space-y-2">
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200 max-w-xs">
                <div className="font-medium">Save failed</div>
                <div className="text-xs opacity-80 mt-1">{saveError}</div>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => {
                      console.log(`🔄 [${blockKey}] Retrying save...`);
                      setSaveError(null);
                      saveContent();
                    }}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => {
                      setText(defaultText);
                      setIsEditing(false);
                      setSaveError(null);
                      setRetryCount(0);
                    }}
                    className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={saveContent}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors font-medium"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setText(defaultText);
                  setIsEditing(false);
                  setSaveError(null);
                  setRetryCount(0);
                }}
                className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
              <div className="text-xs text-gray-500 whitespace-nowrap">
                Enter to save
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Admin view - show text with always-visible pencil icon
  console.log(`👑 [${blockKey}] Rendering admin view`);
  return (
    <div className="relative group inline-flex items-center gap-2">
      <Tag className={`${className} cursor-pointer hover:bg-orange-50 transition-colors duration-200 rounded px-1 py-0.5 ${
        isSaving ? 'opacity-50 cursor-not-allowed' : ''
      }`}>
        {text}
      </Tag>
      
      {/* Always visible edit icon for admin users */}
      <div
        className={`bg-[#F68A3A] text-white p-1.5 rounded-full hover:bg-[#E5792A] transition-all duration-200 shadow-md cursor-pointer flex-shrink-0 ${
          isSaving ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label="Edit text"
        title="Edit text"
        role="button"
        tabIndex={0}
        onClick={startEditing}
        onKeyDown={(e) => {
          console.log(`⌨️ [${blockKey}] Pencil key:`, e.key);
          if ((e.key === 'Enter' || e.key === ' ') && !isSaving) {
            e.preventDefault();
            startEditing(e);
          }
        }}
        aria-disabled={isSaving}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
    </div>
  );
}