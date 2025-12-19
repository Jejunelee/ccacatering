"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  Upload, 
  Trash2, 
  Check, 
  X as XIcon 
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

interface MenuItem {
  id: string;
  title: string;
  images: string[];
  soup?: string;
  salads?: string;
  hot?: string;
  desserts?: string;
  description?: string;
  custom_id?: string;
}

interface ModalProps {
  item: MenuItem | null;
  onClose: () => void;
  imageIndex: number;
  setImageIndex: Dispatch<SetStateAction<number>>;
  isEditMode?: boolean;
  onUpdate?: (updatedItem: MenuItem) => void;
}

export default function Modal({ 
  item, 
  onClose, 
  imageIndex, 
  setImageIndex,
  isEditMode = false,
  onUpdate
}: ModalProps) {
  const { isAdmin } = useAuthContext();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<MenuItem>>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localItem, setLocalItem] = useState<MenuItem | null>(item);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Refs for auto-resizing textareas
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // MOVE useCallback HERE - BEFORE any conditional returns
  const saveField = useCallback(async (field: string) => {
    if (isSaving) return; // Prevent multiple saves
    
    const newValue = editedValues[field as keyof MenuItem];
    const currentValue = localItem?.[field as keyof MenuItem];
    
    // If value hasn't changed or no localItem, just cancel editing
    if (!localItem || newValue === currentValue || newValue === undefined) {
      setEditingField(null);
      setEditedValues({});
      return;
    }

    setIsSaving(field);
    setSaveError(null);

    try {
      // Optimistic update
      const updatedItem = {
        ...localItem,
        [field]: newValue === "" ? null : newValue
      };
      setLocalItem(updatedItem);
      
      // Actual database update
      const { error } = await supabase
        .from("menu_items")
        .update({ [field]: newValue === "" ? null : newValue } as never)
        .eq("id", localItem.id);

      if (error) throw error;

      // Notify parent component
      if (onUpdate) {
        onUpdate(updatedItem);
      }
      
      // Success - clear editing state
      setEditingField(null);
      setEditedValues({});
      
    } catch (err: any) {
      console.error(`Error updating ${field}:`, err);
      
      // Revert optimistic update on error
      setLocalItem(item);
      setSaveError(`Failed to save: ${err.message || 'Unknown error'}`);
      
      // Keep editing mode open on error
      setTimeout(() => {
        setSaveError(null);
      }, 3000);
      
    } finally {
      setIsSaving(null);
    }
  }, [localItem, editedValues, isSaving, onUpdate, item]);

  // Update localItem when item prop changes
  useEffect(() => {
    setLocalItem(item);
  }, [item]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Auto-resize textareas based on content
  useEffect(() => {
    if (editingField && textareaRefs.current[editingField]) {
      const textarea = textareaRefs.current[editingField];
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      }
    }
  }, [editingField, editedValues]);

  if (!localItem) return null;

  const nextImage = () => {
    if (!localItem.images || localItem.images.length === 0) return;
    setImageIndex((prev) => (prev + 1) % localItem.images.length);
  };

  const prevImage = () => {
    if (!localItem.images || localItem.images.length === 0) return;
    setImageIndex((prev) => (prev - 1 + localItem.images.length) % localItem.images.length);
  };

  const startEditing = (field: string, value: string) => {
    setEditingField(field);
    setEditedValues(prev => ({ ...prev, [field]: value }));
    setSaveError(null);
    
    // Focus and select text
    setTimeout(() => {
      const textarea = textareaRefs.current[field];
      if (textarea) {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      }
    }, 10);
  };

  const handleBlur = (field: string) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Don't save if we're already saving or if there's an error
    if (isSaving || saveError) {
      return;
    }
    
    // Add a small delay to allow Enter key to trigger first
    saveTimeoutRef.current = setTimeout(() => {
      if (editingField === field) {
        saveField(field);
      }
    }, 150);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditedValues({});
    setSaveError(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    setUploadProgress(0);
    setSaveError(null);

    try {
      const BUCKET_NAME = 'catering-images';
      const fileExt = file.name.split('.').pop();
      const fileName = `menu-item-${localItem!.id}-${Date.now()}.${fileExt}`;
      const filePath = `menu-items/${localItem!.id}/${fileName}`;
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("menu_item_images")
        .insert({
          menu_item_id: localItem!.id,
          image_url: publicUrl,
          display_order: (localItem!.images?.length || 0) + 1,
          alt_text: `${localItem!.title} image`
        } as any);

      if (dbError) throw dbError;

      const updatedImages = [...(localItem!.images || []), publicUrl];
      const updatedItem = {
        ...localItem!,
        images: updatedImages
      };
      setLocalItem(updatedItem);
      
      if (e.target) {
        e.target.value = '';
      }
      
      if (onUpdate) {
        onUpdate(updatedItem);
      }
      
      setUploadProgress(100);
      
      // Reset progress after success
      setTimeout(() => {
        setUploadProgress(0);
      }, 500);
      
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setSaveError(`Upload failed: ${error?.message || 'Unknown error'}`);
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setSaveError(null);
      }, 3000);
      
    } finally {
      setIsUploadingImage(false);
    }
  };

  const deleteImage = async (imageIndexToDelete: number) => {
    if (!localItem.images || localItem.images.length === 0 || !confirm("Are you sure you want to delete this image?")) return;
    alert("To fully delete images, we need to implement storage cleanup. For now, contact support.");
  };

  const renderEditableField = (field: string, label: string, value?: string, multiline = false) => {
    const shouldRender = value || (isEditMode && isAdmin) || editingField === field;
    if (!shouldRender) return null;

    const displayValue = value || "";
    const isEditing = editingField === field && isEditMode && isAdmin;
    const isFieldSaving = isSaving === field;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-center mb-3">
          <div className="bg-gradient-to-r from-[#F08A32] to-amber-500 text-white font-semibold py-1.5 px-6 rounded-full text-sm">
            {label}
          </div>
        </div>
        
        {isEditing ? (
          <div className="relative">
            {multiline ? (
              <textarea
                ref={(el) => {
                  textareaRefs.current[field] = el;
                }}
                value={editedValues[field as keyof MenuItem] ?? displayValue}
                onChange={(e) => {
                  setEditedValues(prev => ({ ...prev, [field]: e.target.value }));
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
                }}
                onBlur={() => handleBlur(field)}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm text-gray-700 resize-none min-h-[60px] break-words ${
                  saveError ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-[#F68A3A] bg-gray-50'
                }`}
                rows={1}
                placeholder={`Enter ${label.toLowerCase()}...`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    saveField(field);
                  }
                  if (e.key === 'Escape') {
                    cancelEditing();
                  }
                }}
                disabled={isFieldSaving}
              />
            ) : (
              <input
                type="text"
                value={editedValues[field as keyof MenuItem] ?? displayValue}
                onChange={(e) => setEditedValues(prev => ({ ...prev, [field]: e.target.value }))}
                onBlur={() => handleBlur(field)}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm text-gray-700 ${
                  saveError ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-[#F68A3A] bg-gray-50'
                }`}
                placeholder={`Enter ${label.toLowerCase()}...`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveField(field);
                  }
                  if (e.key === 'Escape') {
                    cancelEditing();
                  }
                }}
                disabled={isFieldSaving}
              />
            )}
            
            {/* Error message */}
            {saveError && isEditing && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                {saveError}
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-end mt-2 space-x-2">
              <button
                onClick={cancelEditing}
                disabled={isFieldSaving}
                className="px-3 py-1.5 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors flex items-center disabled:opacity-50"
              >
                <XIcon className="w-3.5 h-3.5 mr-1" />
                Cancel
              </button>
              <button
                onClick={() => saveField(field)}
                disabled={isFieldSaving}
                className="px-3 py-1.5 bg-gradient-to-r from-[#F68A3A] to-orange-500 text-white text-sm rounded-lg hover:opacity-90 transition-opacity flex items-center disabled:opacity-50"
              >
                {isFieldSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent mr-1"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="relative group cursor-pointer min-h-[24px]"
            onClick={() => isEditMode && isAdmin && !isSaving && startEditing(field, displayValue)}
          >
            <p className={`text-sm text-gray-700 break-words overflow-wrap-anywhere whitespace-pre-wrap leading-relaxed ${
              !displayValue && isEditMode && isAdmin ? 'text-gray-400 italic py-2' : 'py-1'
            }`}>
              {displayValue || (isEditMode && isAdmin ? `Click to add ${label.toLowerCase()}...` : '')}
            </p>
            {isEditMode && isAdmin && !isSaving && (
              <button 
                className="absolute -right-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                title="Edit"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(field, displayValue);
                }}
              >
                <Edit className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDescriptionField = () => {
    const shouldRender = localItem.description || (isEditMode && isAdmin) || editingField === "description";
    if (!shouldRender) return null;

    const displayValue = localItem.description || "";
    const isEditing = editingField === "description" && isEditMode && isAdmin;
    const isFieldSaving = isSaving === "description";

    return (
      <div className="mb-6 text-center">
        {isEditing ? (
          <div>
            <textarea
              ref={(el) => {
                textareaRefs.current.description = el;
              }}
              value={editedValues.description ?? displayValue}
              onChange={(e) => {
                setEditedValues(prev => ({ ...prev, description: e.target.value }));
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onBlur={() => handleBlur("description")}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm text-gray-700 resize-none min-h-[60px] break-words text-center ${
                saveError ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-[#F68A3A] bg-gray-50'
              }`}
              rows={1}
              placeholder="Add a description..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  saveField("description");
                }
                if (e.key === 'Escape') {
                  cancelEditing();
                }
              }}
              disabled={isFieldSaving}
            />
            
            {/* Error message */}
            {saveError && isEditing && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                {saveError}
              </div>
            )}
            
            <div className="flex justify-center mt-2 space-x-2">
              <button
                onClick={cancelEditing}
                disabled={isFieldSaving}
                className="px-3 py-1.5 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors flex items-center disabled:opacity-50"
              >
                <XIcon className="w-3.5 h-3.5 mr-1" />
                Cancel
              </button>
              <button
                onClick={() => saveField("description")}
                disabled={isFieldSaving}
                className="px-3 py-1.5 bg-gradient-to-r from-[#F68A3A] to-orange-500 text-white text-sm rounded-lg hover:opacity-90 transition-opacity flex items-center disabled:opacity-50"
              >
                {isFieldSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent mr-1"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="relative group cursor-pointer min-h-[24px]"
            onClick={() => isEditMode && isAdmin && !isSaving && startEditing("description", displayValue)}
          >
            <p className={`text-sm text-gray-600 break-words overflow-wrap-anywhere whitespace-pre-wrap italic ${
              !displayValue && isEditMode && isAdmin ? 'text-gray-400 py-2' : 'py-1'
            }`}>
              {displayValue || (isEditMode && isAdmin ? "Click to add description..." : '')}
            </p>
            {isEditMode && isAdmin && !isSaving && (
              <button 
                className="absolute -right-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                title="Edit description"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing("description", displayValue);
                }}
              >
                <Edit className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 bg-white/90 hover:bg-white p-2 rounded-full transition-all hover:scale-105 shadow-lg z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Title */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{localItem.title}</h2>
        </div>

        {/* IMAGE SECTION */}
        <div className="mb-6">
          <div className="relative">
            {localItem.images && localItem.images.length > 0 ? (
              <>
                {/* Main Image */}
                <div className="relative w-full h-64 md:h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={localItem.images[imageIndex]}
                    alt={`${localItem.title} image ${imageIndex + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 768px"
                    priority
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Image counter */}
                  {localItem.images.length > 1 && (
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      {imageIndex + 1} / {localItem.images.length}
                    </div>
                  )}
                  
                  {/* Navigation arrows */}
                  {localItem.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        disabled={isSaving !== null || isUploadingImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={nextImage}
                        disabled={isSaving !== null || isUploadingImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                      </button>
                    </>
                  )}
                  
                  {/* Delete button */}
                  {isEditMode && isAdmin && localItem.images.length > 0 && (
                    <button
                      onClick={() => deleteImage(imageIndex)}
                      disabled={isSaving !== null || isUploadingImage}
                      className="absolute top-3 left-3 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Dots indicator */}
                {localItem.images.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-4">
                    {localItem.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setImageIndex(idx)}
                        disabled={isSaving !== null || isUploadingImage}
                        className={`h-2 w-2 rounded-full transition-all ${
                          idx === imageIndex 
                            ? "bg-orange-500 scale-125" 
                            : "bg-gray-300 hover:bg-gray-400"
                        } disabled:opacity-50`}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-gray-400 mb-2">
                  <Upload className="w-12 h-12" />
                </div>
                <p className="text-gray-500 text-sm">No images available</p>
              </div>
            )}

            {/* Upload button */}
            {isEditMode && isAdmin && (
              <div className="mt-4 flex justify-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploadingImage || isSaving !== null}
                  />
                  <div className={`px-5 py-2.5 rounded-full flex items-center space-x-2 shadow-md transition-all ${
                    isUploadingImage || isSaving !== null
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#F68A3A] to-orange-500 hover:opacity-90 cursor-pointer'
                  } text-white`}>
                    {isUploadingImage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span className="text-sm">
                          {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Uploading...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">Add Image</span>
                      </>
                    )}
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="px-2">
          {/* Description */}
          {renderDescriptionField()}

          {/* Category Sections */}
          <div className="space-y-6">
            {renderEditableField("soup", "Soup", localItem.soup, true)}
            {renderEditableField("salads", "Salads", localItem.salads, true)}
            {renderEditableField("hot", "Hot Selections", localItem.hot, true)}
            {renderEditableField("desserts", "Desserts", localItem.desserts, true)}
          </div>
        </div>
      </div>
    </div>
  );
}