'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/providers/useAuth';
import { ensureAuthPersisted, saveWithAuthRetry } from '@/lib/auth/persist';

interface SliderImage {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
}

interface EditableImageSliderProps {
  componentName: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

// Track pending operations globally
declare global {
  interface Window {
    pendingImageOperations?: Set<string>;
    pendingSaves?: Set<string>;
  }
}

// Initialize global tracking
if (typeof window !== 'undefined') {
  if (!window.pendingImageOperations) {
    window.pendingImageOperations = new Set();
  }
  if (!window.pendingSaves) {
    window.pendingSaves = new Set();
  }
}

export default function EditableImageSlider({ 
  componentName, 
  aspectRatio = "aspect-[4/3]",
  objectFit = "contain"
}: EditableImageSliderProps) {
  const { isAdmin, user } = useAuthContext();
  const [images, setImages] = useState<SliderImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const operationIdRef = useRef<string | null>(null);

  const AUTO_ROTATE_INTERVAL = 5000;
  const MAX_RETRIES = 2;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up any pending operations from this component
      if (operationIdRef.current && window.pendingImageOperations) {
        window.pendingImageOperations.delete(operationIdRef.current);
      }
    };
  }, []);

  // Fetch images from Supabase with error handling
  useEffect(() => {
    fetchImages();
  }, [componentName]);

  async function fetchImages() {
    try {
      const { data, error } = await supabase
        .from('slider_images')
        .select('*')
        .eq('component_name', componentName)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching images:', error);
        if (error.message?.includes('JWT')) {
          setAuthError('Authentication error. Please refresh and log in again.');
        }
        return;
      }

      if (data) {
        setImages(data);
        if (data.length > 0) {
          setCurrentImageIndex(0);
          setIsLoaded(false);
        }
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setOperationError('Failed to load images. Please try again.');
    }
  }

  // Auto-rotate images
  useEffect(() => {
    if (isHovering || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, AUTO_ROTATE_INTERVAL);
    
    return () => clearInterval(interval);
  }, [isHovering, images.length]);

  const goToNextImage = useCallback(() => {
    if (images.length === 0) return;
    setIsAnimating(true);
    setIsLoaded(false);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [images.length]);

  const goToPrevImage = useCallback(() => {
    if (images.length === 0) return;
    setIsAnimating(true);
    setIsLoaded(false);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [images.length]);

  const goToImage = useCallback((index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsLoaded(false);
    setCurrentImageIndex(index);
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating]);

  // Handle image load
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // Reset loaded state when current image changes
  useEffect(() => {
    setIsLoaded(false);
  }, [currentImageIndex]);

  // Enhanced image upload with auth persistence
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check auth before proceeding
    try {
      const isAuthReady = await ensureAuthPersisted();
      if (!isAuthReady) {
        setAuthError('Please refresh the page and log in to upload images.');
        return;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthError('Authentication check failed. Please refresh the page.');
      return;
    }

    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setAuthError(null);
    setOperationError(null);

    // Generate unique operation ID
    const operationId = `${componentName}-upload-${Date.now()}`;
    operationIdRef.current = operationId;
    
    if (window.pendingImageOperations) {
      window.pendingImageOperations.add(operationId);
    }

    try {
      // Use auth-retry wrapper for upload operation
      await saveWithAuthRetry(async () => {
        // Upload to Supabase Storage
        const BUCKET_NAME = 'catering-images';
        const fileExt = file.name.split('.').pop();
        const fileName = `${componentName}-${Date.now()}.${fileExt}`;
        const filePath = `${componentName}/${fileName}`;
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 100);

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        clearInterval(progressInterval);
        setUploadProgress(95);

        if (uploadError) {
          if (uploadError.message?.includes('JWT')) {
            throw new Error('Authentication expired. Please stay on the page and try again.');
          }
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        // Save to slider_images table
        const { error: dbError } = await supabase
          .from('slider_images')
          .insert({
            component_name: componentName,
            image_url: publicUrl,
            alt_text: `Event Catering Setup ${images.length + 1}`,
            display_order: images.length + 1
          } as any);

        if (dbError) {
          // Try to clean up the uploaded file
          try {
            await supabase.storage.from(BUCKET_NAME).remove([filePath]);
          } catch (cleanupError) {
            console.warn('Failed to clean up uploaded file:', cleanupError);
          }
          throw dbError;
        }

        setUploadProgress(100);
        return true;
      }, MAX_RETRIES);

      // Refresh images
      await fetchImages();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error: any) {
      console.error('Error uploading image:', error);
      
      let errorMessage = 'Upload failed. Please try again.';
      
      if (error.message?.includes('Authentication expired') || error.message?.includes('JWT')) {
        errorMessage = 'Your session expired during upload. Please stay on the page and try again.';
        setAuthError(errorMessage);
      } else if (error?.message?.includes('row-level security')) {
        errorMessage = 'Upload failed due to permissions. Please make sure you are logged in as admin.';
      } else if (error?.message?.includes('bucket')) {
        errorMessage = 'Storage bucket not found. Please check Supabase Storage setup.';
      }
      
      setOperationError(errorMessage);
      alert(errorMessage);
      
    } finally {
      // Clean up operation tracking
      if (operationIdRef.current && window.pendingImageOperations) {
        window.pendingImageOperations.delete(operationIdRef.current);
      }
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        operationIdRef.current = null;
      }, 1000);
    }
  }

  // Enhanced alt text update with auth persistence
  async function updateAltText(imageId: string, newAltText: string) {
    if (!newAltText.trim()) return;
    
    const operationId = `${imageId}-alt-${Date.now()}`;
    if (window.pendingSaves) {
      window.pendingSaves.add(operationId);
    }

    try {
      await saveWithAuthRetry(async () => {
        // Check auth before saving
        const isAuthReady = await ensureAuthPersisted();
        if (!isAuthReady) {
          throw new Error('Authentication lost. Please stay on the page.');
        }

        const { error } = await supabase
          .from('slider_images')
          .update({ alt_text: newAltText } as never)
          .eq('id', imageId);

        if (error) throw error;
        
        return true;
      }, MAX_RETRIES);
      
      // Update local state
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, alt_text: newAltText } : img
      ));
      setIsEditingImage(null);
      
    } catch (error: any) {
      console.error('Error updating alt text:', error);
      
      let errorMessage = 'Failed to update description.';
      if (error.message?.includes('Authentication lost')) {
        errorMessage = 'Please refresh the page and log in again to save changes.';
        setAuthError(errorMessage);
      }
      
      alert(errorMessage);
      // Keep editing mode open so user can retry
    } finally {
      if (window.pendingSaves) {
        window.pendingSaves.delete(operationId);
      }
    }
  }

  // Enhanced delete image with auth persistence
  async function deleteImage(imageId: string) {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) return;
    
    // Check auth before proceeding
    try {
      const isAuthReady = await ensureAuthPersisted();
      if (!isAuthReady) {
        setAuthError('Please refresh the page and log in to delete images.');
        return;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthError('Authentication check failed. Please refresh the page.');
      return;
    }
    
    const operationId = `${imageId}-delete-${Date.now()}`;
    if (window.pendingImageOperations) {
      window.pendingImageOperations.add(operationId);
    }

    try {
      const imageToDelete = images.find(img => img.id === imageId);
      if (!imageToDelete) return;

      await saveWithAuthRetry(async () => {
        // 1. Delete from database
        const { error: dbError } = await supabase
          .from('slider_images')
          .delete()
          .eq('id', imageId);

        if (dbError) throw dbError;

        // 2. Delete from storage (optional)
        const url = new URL(imageToDelete.image_url);
        const filePath = url.pathname.split('/').slice(-2).join('/');
        
        if (filePath && !filePath.includes('TestPic.png')) {
          const { error: storageError } = await supabase.storage
            .from('catering-images')
            .remove([filePath]);
          
          if (storageError) {
            console.warn('Could not delete from storage:', storageError);
          }
        }

        return true;
      }, MAX_RETRIES);

      // Update local state
      setImages(prev => prev.filter(img => img.id !== imageId));
      if (currentImageIndex >= images.length - 1) {
        setCurrentImageIndex(Math.max(0, images.length - 2));
      }
      
    } catch (error: any) {
      console.error('Error deleting image:', error);
      
      let errorMessage = 'Failed to delete image.';
      if (error.message?.includes('JWT') || error.message?.includes('authentication')) {
        errorMessage = 'Authentication issue. Please refresh and log in again.';
        setAuthError(errorMessage);
      }
      
      alert(errorMessage);
    } finally {
      if (window.pendingImageOperations) {
        window.pendingImageOperations.delete(operationId);
      }
    }
  }

  if (images.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-3xl relative">
        {/* Error Display */}
        {(authError || operationError) && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <p className="text-sm text-red-700">
              {authError || operationError}
            </p>
            <button
              onClick={() => {
                setAuthError(null);
                setOperationError(null);
                window.location.reload();
              }}
              className="mt-2 text-xs px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              Refresh Page
            </button>
          </div>
        )}
        
        <p className="text-gray-500 mb-4">No images yet</p>
        {isAdmin && (
          <>
            <button
              onClick={() => {
                ensureAuthPersisted().then(isReady => {
                  if (isReady) {
                    fileInputRef.current?.click();
                  } else {
                    setAuthError('Please refresh the page to restore your session.');
                  }
                });
              }}
              className="px-4 py-2 bg-[#F68A3A] text-white rounded-lg hover:bg-[#E5792A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUploading}
            >
              {isUploading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Uploading...
                </span>
              ) : 'Add Image'}
            </button>
            {isUploading && (
              <div className="mt-2">
                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                  <div 
                    className="h-full bg-[#F68A3A] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          disabled={isUploading}
        />
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  return (
    <div className="relative">
      {/* Error Display */}
      {(authError || operationError) && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-red-800">Operation Error</p>
              <p className="text-sm text-red-700 mt-1">{authError || operationError}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => {
                    setAuthError(null);
                    setOperationError(null);
                    fetchImages();
                  }}
                  className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  Retry
                </button>
                <button
                  onClick={() => {
                    setAuthError(null);
                    setOperationError(null);
                  }}
                  className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Operations Warning */}
      {window.pendingImageOperations && window.pendingImageOperations.size > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-amber-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-amber-700">
              {window.pendingImageOperations.size} image operation{window.pendingImageOperations.size > 1 ? 's' : ''} in progress. 
              Please stay on the page.
            </p>
          </div>
        </div>
      )}

      {/* Image Container */}
      <div 
        className="relative overflow-hidden rounded-3xl shadow-lg group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className={aspectRatio + " relative"}>
          {/* Background placeholder for better UX */}
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          
          {/* Image with fade-in effect */}
          <Image
            src={currentImage.image_url}
            alt={currentImage.alt_text}
            fill
            className={`${objectFit} transition-all duration-700 group-hover:scale-105 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={currentImageIndex === 0}
            onLoad={handleImageLoad}
            onError={() => setIsLoaded(true)}
          />
          
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevImage}
            disabled={isAnimating || isUploading}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white/80 p-3 rounded-full transition-all duration-300 disabled:cursor-not-allowed z-20 font-din disabled:opacity-50"
            aria-label="Previous image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNextImage}
            disabled={isAnimating || isUploading}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/80 text-white/80 p-3 rounded-full transition-all duration-300 disabled:cursor-not-allowed z-20 font-din disabled:opacity-50"
            aria-label="Next image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />
          
          {/* Admin Edit Controls */}
          {isAdmin && (
            <div className="absolute top-4 left-4 flex space-x-2 z-30">
              <button
                onClick={() => {
                  ensureAuthPersisted().then(isReady => {
                    if (isReady) {
                      fileInputRef.current?.click();
                    } else {
                      setAuthError('Please refresh the page to restore your session.');
                    }
                  });
                }}
                className="bg-[#F68A3A] text-white p-2 rounded-full hover:bg-[#E5792A] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add image"
                disabled={isUploading || isAnimating}
              >
                {isUploading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={() => {
                  ensureAuthPersisted().then(isReady => {
                    if (isReady) {
                      setIsEditingImage(currentImage.id);
                    } else {
                      setAuthError('Please refresh the page to restore your session.');
                    }
                  });
                }}
                disabled={isAnimating || isUploading}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit description"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              
              <button
                onClick={() => {
                  if (window.pendingImageOperations && window.pendingImageOperations.size > 0) {
                    alert('Please wait for other operations to complete before deleting.');
                    return;
                  }
                  deleteImage(currentImage.id);
                }}
                disabled={isAnimating || isUploading}
                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
              <div className="bg-white p-4 rounded-lg shadow-lg text-center min-w-[200px]">
                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-[#F68A3A] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-700 mb-1">Uploading image...</p>
                <p className="text-xs text-gray-500">Please stay on this page</p>
                {authError && (
                  <p className="text-xs text-red-600 mt-1">{authError}</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium z-20 font-din">
          {currentImageIndex + 1} / {images.length}
          {window.pendingImageOperations && window.pendingImageOperations.size > 0 && (
            <span className="ml-2 animate-pulse">⚪</span>
          )}
        </div>

        {/* Alt Text Editor */}
        {isEditingImage === currentImage.id && (
          <div className="absolute bottom-4 left-4 right-4 z-30">
            <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-blue-500">
              <div className="flex items-start mb-2">
                <div className="flex-1">
                  <input
                    type="text"
                    defaultValue={currentImage.alt_text}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        updateAltText(currentImage.id, e.currentTarget.value);
                      }
                      if (e.key === 'Escape') {
                        setIsEditingImage(null);
                      }
                    }}
                    className="w-full text-black p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Image description"
                    autoFocus
                    disabled={window.pendingSaves?.has(`${currentImage.id}-alt`)}
                  />
                </div>
                <button
                  onClick={() => setIsEditingImage(null)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-xs text-gray-500 flex justify-between">
                <span>Press Enter to save, Esc to cancel</span>
                {window.pendingSaves?.has(`${currentImage.id}-alt`) && (
                  <span className="text-blue-600 flex items-center">
                    <div className="animate-spin h-3 w-3 border-b-2 border-blue-600 rounded-full mr-1"></div>
                    Saving...
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        disabled={isUploading}
      />

      {/* User Status Indicator */}
      {isAdmin && user && (
        <div className="mt-2 text-xs text-gray-500 text-right">
          <span>Logged in as: {user.email}</span>
          {(authError || window.pendingImageOperations?.size || 0 > 0) && (
            <span className="ml-2 text-amber-600">
              • {window.pendingImageOperations?.size || 0} active operation{window.pendingImageOperations?.size !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
}