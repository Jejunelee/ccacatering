'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/providers/AuthProvider';

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

export default function EditableImageSlider({ 
  componentName, 
  aspectRatio = "aspect-[4/3]",
  objectFit = "cover"
}: EditableImageSliderProps) {
  const { isAdmin } = useAuthContext();
  const [images, setImages] = useState<SliderImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // New state for image load tracking
  const fileInputRef = useRef<HTMLInputElement>(null);

  const AUTO_ROTATE_INTERVAL = 5000;

  // Fetch images from Supabase
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

      if (!error && data) {
        setImages(data);
        if (data.length > 0) {
          setCurrentImageIndex(0);
          setIsLoaded(false); // Reset loaded state when images change
        }
      }
    } catch (error) {
      console.error('Error fetching images:', error);
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
    setIsLoaded(false); // Reset loaded state when changing image
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [images.length]);

  const goToPrevImage = useCallback(() => {
    if (images.length === 0) return;
    setIsAnimating(true);
    setIsLoaded(false); // Reset loaded state when changing image
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [images.length]);

  const goToImage = useCallback((index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsLoaded(false); // Reset loaded state when changing image
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload to Supabase Storage
      const BUCKET_NAME = 'catering-images';
      const fileExt = file.name.split('.').pop();
      const fileName = `${componentName}-${Date.now()}.${fileExt}`;
      const filePath = `${componentName}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

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

      if (dbError) throw dbError;

      // Refresh images
      await fetchImages();
      setUploadProgress(100);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error: any) {
      console.error('Error uploading image:', error);
      
      if (error?.message?.includes('row-level security')) {
        alert(`Upload failed due to RLS policy. Make sure:\n1. You're logged in\n2. Your profile has 'admin' role\n3. RLS policies are properly configured`);
      } else if (error?.message?.includes('bucket')) {
        alert(`Upload failed: Storage bucket issue. Please create bucket "catering-images" in Supabase Storage.`);
      } else {
        alert(`Upload failed: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  }

  async function updateAltText(imageId: string, newAltText: string) {
    try {
      const { error } = await supabase
        .from('slider_images')
        .update({ alt_text: newAltText } as never)
        .eq('id', imageId);

      if (error) throw error;
      
      // Update local state
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, alt_text: newAltText } : img
      ));
      setIsEditingImage(null);
    } catch (error) {
      console.error('Error updating alt text:', error);
      alert('Failed to update description');
    }
  }

  async function deleteImage(imageId: string) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      const imageToDelete = images.find(img => img.id === imageId);
      if (!imageToDelete) return;

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

      // 3. Update local state
      setImages(prev => prev.filter(img => img.id !== imageId));
      if (currentImageIndex >= images.length - 1) {
        setCurrentImageIndex(Math.max(0, images.length - 2));
      }
      
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  }

  if (images.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-3xl">
        <p className="text-gray-500 mb-4">No images yet</p>
        {isAdmin && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-[#F68A3A] text-white rounded-lg hover:bg-[#E5792A] transition-colors"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Add Image'}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  return (
    <div className="relative">
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
            onError={() => setIsLoaded(true)} // Still show image even if there's an error
          />
          
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevImage}
            disabled={isAnimating}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 disabled:cursor-not-allowed z-20 font-din disabled:opacity-50"
            aria-label="Previous image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNextImage}
            disabled={isAnimating}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 disabled:cursor-not-allowed z-20 font-din disabled:opacity-50"
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
                onClick={() => fileInputRef.current?.click()}
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
                onClick={() => setIsEditingImage(currentImage.id)}
                disabled={isAnimating}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit description"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              
              <button
                onClick={() => deleteImage(currentImage.id)}
                disabled={isAnimating}
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
              <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-[#F68A3A] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-700">Uploading image...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium z-20 font-din">
          {currentImageIndex + 1} / {images.length}
        </div>

        {/* Alt Text Editor */}
        {isEditingImage === currentImage.id && (
          <div className="absolute bottom-4 left-4 right-4 z-30">
            <div className="bg-white p-3 rounded-lg shadow-lg">
              <input
                type="text"
                defaultValue={currentImage.alt_text}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateAltText(currentImage.id, e.currentTarget.value);
                  }
                  if (e.key === 'Escape') {
                    setIsEditingImage(null);
                  }
                }}
                onBlur={(e) => updateAltText(currentImage.id, e.target.value)}
                className="w-full text-black p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#F68A3A]"
                placeholder="Image description"
                autoFocus
              />
              <div className="text-xs text-gray-500 mt-1">
                Press Enter to save, Esc to cancel
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
      />
    </div>
  );
}