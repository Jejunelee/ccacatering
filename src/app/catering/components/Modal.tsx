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
  X as XIcon,
  Bold,
  Italic,
  List,
  Type,
  Heading,
  AlignLeft
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useAuthContext } from "@/providers/useAuth";
import { supabase } from "@/lib/supabase";

interface MenuItem {
  id: string;
  title: string;
  images: string[];
  content_text?: string;
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
  
  // Refs for the textarea and toolbar
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const ignoreBlurRef = useRef(false);

  const saveField = useCallback(async (field: string) => {
    if (isSaving) return;
    
    const newValue = editedValues[field as keyof MenuItem];
    const currentValue = localItem?.[field as keyof MenuItem];
    
    if (!localItem || newValue === currentValue || newValue === undefined) {
      setEditingField(null);
      setEditedValues({});
      return;
    }

    setIsSaving(field);
    setSaveError(null);

    try {
      const updatedItem = {
        ...localItem,
        [field]: newValue === "" ? null : newValue
      };
      setLocalItem(updatedItem);
      
      const { error } = await supabase
        .from("menu_items")
        .update({ [field]: newValue === "" ? null : newValue } as never)
        .eq("id", localItem.id);

      if (error) throw error;

      if (onUpdate) {
        onUpdate(updatedItem);
      }
      
      setEditingField(null);
      setEditedValues({});
      
    } catch (err: any) {
      console.error(`Error updating ${field}:`, err);
      setLocalItem(item);
      setSaveError(`Failed to save: ${err.message || 'Unknown error'}`);
      
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

  // Auto-resize textarea based on content
  useEffect(() => {
    if (editingField === "content_text" && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`;
    }
  }, [editingField, editedValues.content_text]);

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
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = textareaRef.current.value.length;
      }
    }, 10);
  };

  const handleBlur = (field: string) => {
    // Don't save if we're clicking on toolbar
    if (ignoreBlurRef.current) {
      ignoreBlurRef.current = false;
      return;
    }
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    if (isSaving || saveError) {
      return;
    }
    
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

  // WYSIWYG toolbar functions
  const formatText = (command: string, value?: string) => {
    if (!textareaRef.current || editingField !== "content_text") return;
    
    // Set flag to ignore blur event
    ignoreBlurRef.current = true;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    
    let newText = "";
    
    switch (command) {
      case "bold":
        newText = `**${selectedText}**`;
        break;
      case "italic":
        newText = `*${selectedText}*`;
        break;
      case "heading1":
        newText = `# ${selectedText}`;
        break;
      case "heading2":
        newText = `## ${selectedText}`;
        break;
      case "bullet":
        if (selectedText) {
          // Add bullet points to each line
          newText = selectedText.split('\n').map(line => `• ${line}`).join('\n');
        } else {
          newText = "• ";
        }
        break;
      case "newline":
        newText = "\n\n";
        break;
      default:
        newText = selectedText;
    }
    
    const updatedValue = before + newText + after;
    setEditedValues(prev => ({ ...prev, content_text: updatedValue }));
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newText.length;
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      
      // Auto-resize
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`;
    }, 10);
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
      
      setTimeout(() => {
        setUploadProgress(0);
      }, 500);
      
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setSaveError(`Upload failed: ${error?.message || 'Unknown error'}`);
      
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

  const renderRichTextField = () => {
    const field = "content_text";
    const displayValue = localItem.content_text || "";
    const isEditing = editingField === field && isEditMode && isAdmin;
    const isFieldSaving = isSaving === field;

    // Simple markdown parser for display
    const renderFormattedText = (text: string) => {
      return text
        .split('\n')
        .map((line, index) => {
          // Headings
          if (line.startsWith('# ')) {
            return `<h3 class="font-bold text-lg text-gray-800 mb-2">${line.substring(2)}</h3>`;
          }
          if (line.startsWith('## ')) {
            return `<h4 class="font-bold text-base text-gray-700 mb-1">${line.substring(3)}</h4>`;
          }
          // Bold
          let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
          // Italic
          processedLine = processedLine.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
          // Bullet points
          if (line.startsWith('• ')) {
            return `<div class="flex items-start mb-1"><span class="mr-2">•</span><span>${processedLine.substring(2)}</span></div>`;
          }
          // Empty lines
          if (line.trim() === '') {
            return '<div class="h-4"></div>';
          }
          return `<p class="mb-2">${processedLine}</p>`;
        })
        .join('');
    };

    return (
      <div className="mb-6">
        {isEditing ? (
          <div className="relative">
            {/* WYSIWYG Toolbar */}
            <div 
              ref={toolbarRef}
              className="text-black flex flex-wrap gap-1 mb-2 p-2 bg-gray-50 border border-gray-300 rounded-lg"
              onMouseDown={(e) => {
                // Prevent textarea blur when clicking toolbar
                e.preventDefault();
              }}
              onClick={(e) => {
                // Keep focus on textarea after toolbar click
                if (textareaRef.current) {
                  setTimeout(() => {
                    textareaRef.current?.focus();
                  }, 0);
                }
              }}
            >
              <button
                type="button"
                onClick={() => formatText("bold")}
                className="p-2 rounded hover:bg-gray-200 transition-colors"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => formatText("italic")}
                className="p-2 rounded hover:bg-gray-200 transition-colors"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => formatText("heading1")}
                className="p-2 rounded hover:bg-gray-200 transition-colors"
                title="Heading 1"
              >
                <Heading className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => formatText("heading2")}
                className="p-2 rounded hover:bg-gray-200 transition-colors"
                title="Heading 2"
              >
                <Type className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => formatText("bullet")}
                className="p-2 rounded hover:bg-gray-200 transition-colors"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => formatText("newline")}
                className="p-2 rounded hover:bg-gray-200 transition-colors"
                title="New Line"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <div className="flex-1"></div>
              <div className="text-xs text-gray-500 px-2 py-1">
                Use **bold**, *italic*, # Heading
              </div>
            </div>
            
            <textarea
              ref={textareaRef}
              value={editedValues.content_text ?? displayValue}
              onChange={(e) => {
                setEditedValues(prev => ({ ...prev, content_text: e.target.value }));
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 400)}px`;
              }}
              onBlur={() => handleBlur(field)}
              className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-700 resize-none min-h-[200px] break-words leading-relaxed ${
                saveError ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-[#F68A3A] bg-gray-50'
              }`}
              rows={6}
              placeholder="Enter content... You can use the toolbar above or type:
# Heading
## Subheading
**Bold text**
*Italic text*
• Bullet points"
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
            
            {saveError && isEditing && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                {saveError}
              </div>
            )}
            
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
            <div className={`prose prose-sm max-w-none text-gray-700 break-words overflow-wrap-anywhere whitespace-pre-wrap ${
              !displayValue && isEditMode && isAdmin ? 'text-gray-400 italic py-8 text-center border-2 border-dashed border-gray-300 rounded-lg' : 'py-2'
            }`}>
              {displayValue ? (
                <div dangerouslySetInnerHTML={{ 
                  __html: renderFormattedText(displayValue)
                }} />
              ) : (
                isEditMode && isAdmin ? "Click to add content..." : ""
              )}
            </div>
            {isEditMode && isAdmin && !isSaving && (
              <button 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-md"
                title="Edit content"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(field, displayValue);
                }}
              >
                <Edit className="w-4 h-4 text-gray-600" />
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
        <div className="text-center mb-6">
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
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {localItem.images.length > 1 && (
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      {imageIndex + 1} / {localItem.images.length}
                    </div>
                  )}
                  
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

        {/* CONTENT SECTION */}
        <div className="px-2">
          {renderRichTextField()}
        </div>
      </div>
    </div>
  );
}