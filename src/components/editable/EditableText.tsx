'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/providers/AuthProvider';

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
  const [isHovering, setIsHovering] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Debug auth state
  useEffect(() => {
    console.log(`📊 EditableText [${blockKey}] Auth:`, { 
      isAdmin, 
      userEmail: user?.email,
      isLoading,
      userId: user?.id?.substring(0, 8)
    });
  }, [isAdmin, user, isLoading, blockKey]);

  // Fetch content from Supabase on mount
  useEffect(() => {
    console.log(`📥 EditableText [${blockKey}] Fetching content...`);
    fetchContent();
  }, [componentName, blockKey]);

  async function fetchContent() {
    try {
      console.log(`🔍 Fetching from Supabase: ${componentName}.${blockKey}`);
      const { data, error } = await supabase
        .from('content_blocks')
        .select('content')
        .eq('component_name', componentName)
        .eq('block_key', blockKey)
        .single<{ content: string }>();

      console.log(`📦 Fetch result [${blockKey}]:`, { 
        data, 
        error: error?.message,
        hasData: !!data?.content 
      });

      if (!error && data?.content) {
        setText(data.content);
      } else if (error) {
        console.error(`❌ Fetch error [${blockKey}]:`, error);
      }
    } catch (error) {
      console.error(`💥 Fetch exception [${blockKey}]:`, error);
    }
  }

  async function saveContent() {
    setSaveError(null);
    
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

    // Set a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Save timeout after 5 seconds')), 5000);
    });

    try {
      console.log(`🚀 [${blockKey}] Sending to Supabase...`);
      const savePromise = supabase
        .from('content_blocks')
        .upsert({
          component_name: componentName,
          block_key: blockKey,
          content: text,
          content_type: 'text',
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: 'component_name,block_key'
        });

      // Race between save and timeout
      const { data, error } = await Promise.race([savePromise, timeoutPromise]) as any;
      
      console.log(`✅ [${blockKey}] Save response:`, { 
        success: !error, 
        error: error?.message,
        data 
      });
      
      if (error) throw error;
      
      // Success
      setIsEditing(false);
      setIsSaving(false);
      console.log(`🎉 [${blockKey}] Edit completed successfully`);
      
    } catch (error: any) {
      console.error(`❌ [${blockKey}] Save error:`, error);
      setSaveError(error.message || 'Failed to save. Please try again.');
      setIsSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    console.log(`⌨️ [${blockKey}] Key press:`, e.key);
    if (e.key === 'Enter' && !e.shiftKey && as === 'input') {
      e.preventDefault();
      saveContent();
    }
    if (e.key === 'Escape') {
      console.log(`⎋ [${blockKey}] Escape pressed, cancelling edit`);
      setText(defaultText);
      setIsEditing(false);
      setSaveError(null);
    }
  }

  function handleBlur() {
    console.log(`👁️ [${blockKey}] Input blur, isSaving: ${isSaving}, hasError: ${!!saveError}`);
    if (isEditing && !isSaving && !saveError) {
      saveContent();
    }
  }

  function startEditing(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    
    console.log(`✏️ [${blockKey}] Starting edit, isAdmin: ${isAdmin}`);
    if (!isAdmin) {
      console.warn(`⛔ [${blockKey}] Edit blocked: not admin`);
      return;
    }
    setIsEditing(true);
    setSaveError(null);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
        console.log(`🎯 [${blockKey}] Input focused`);
      }
    }, 10);
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
            className={`${className} border-2 border-[#F68A3A] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#F68A3A] focus:ring-offset-2 w-full ${saveError ? 'border-red-500' : ''}`}
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
            className={`${className} border-2 border-[#F68A3A] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#F68A3A] focus:ring-offset-2 w-full ${saveError ? 'border-red-500' : ''}`}
            disabled={isSaving}
          />
        )}
        
        {isSaving && (
          <div className="absolute -right-24 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#F68A3A]"></div>
            <span className="text-sm text-[#F68A3A] font-medium whitespace-nowrap">
              Saving...
            </span>
          </div>
        )}
        
        {saveError && (
          <div className="absolute -right-36 top-1/2 transform -translate-y-1/2">
            <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-200 max-w-xs">
              <div className="font-medium">Save failed</div>
              <div className="text-xs opacity-80 mt-1">{saveError}</div>
              <button
                onClick={() => {
                  console.log(`🔄 [${blockKey}] Retrying save...`);
                  setSaveError(null);
                  saveContent();
                }}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {!isSaving && !saveError && (
          <div className="absolute -right-24 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
            Press Enter to save
          </div>
        )}
      </div>
    );
  }

  // Admin view - show text with pencil icon on hover
  console.log(`👑 [${blockKey}] Rendering admin view, isHovering: ${isHovering}`);
  return (
    <div
      className="relative group inline-block"
      onMouseEnter={() => {
        console.log(`🐭 [${blockKey}] Mouse enter`);
        setIsHovering(true);
      }}
      onMouseLeave={() => {
        console.log(`🐭 [${blockKey}] Mouse leave`);
        setIsHovering(false);
      }}
      onClick={startEditing}
    >
      <Tag className={`${className} ${isHovering ? 'cursor-pointer' : ''}`}>
        {text}
      </Tag>
      
      {isHovering && (
        <div
          className="absolute -right-8 top-1/2 transform -translate-y-1/2 bg-[#F68A3A] text-white p-1.5 rounded-full hover:bg-[#E5792A] transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
          aria-label="Edit text"
          title="Edit text"
          role="button"
          tabIndex={0}
          onClick={(e) => {
            console.log(`✏️ [${blockKey}] Pencil clicked`);
            e.stopPropagation();
            startEditing(e);
          }}
          onKeyDown={(e) => {
            console.log(`⌨️ [${blockKey}] Pencil key:`, e.key);
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              startEditing(e as any);
            }
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
      )}
    </div>
  );
}