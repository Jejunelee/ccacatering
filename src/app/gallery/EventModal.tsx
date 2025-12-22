"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { GalleryEvent, CreateEventData } from "@/types/gallery";
import { galleryService } from "@/lib/gallery";
import { supabase } from "@/lib/supabase";

interface EventModalProps {
  event: GalleryEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: GalleryEvent) => void;
}

const CATEGORIES = [
  "Weddings",
  "Corporate",
  "Outdoor",
  "Desserts",
  "Cocktails",
  "Birthdays",
  "Anniversaries",
  "Holiday Parties",
  "Charity Events",
  "Other"
];

const DEFAULT_FORM_DATA: CreateEventData = {
  event_name: "",
  category: "Weddings",
  event_date: new Date().toISOString().split('T')[0],
  location: "",
  client_name: "",
  description: "",
  tags: [],
  display_order: 0
};

export default function EventModal({ event, isOpen, onClose, onSave }: EventModalProps) {
  const [formData, setFormData] = useState<CreateEventData>(DEFAULT_FORM_DATA);
  const [isUploading, setIsUploading] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setFeaturedImage(null);
    setTagInput("");
  }, []);

  useEffect(() => {
    if (event) {
      setFormData({
        event_name: event.event_name,
        category: event.category,
        event_date: event.event_date.split('T')[0],
        location: event.location || "",
        client_name: event.client_name || "",
        description: event.description || "",
        tags: event.tags || [],
        display_order: event.display_order
      });
      setFeaturedImage(event.featured_image_url || null);
    } else {
      resetForm();
    }
  }, [event, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const eventData = {
        ...formData,
        featured_image_url: featuredImage || undefined
      } as any;

      const savedEvent = event
        ? await galleryService.updateEvent(event.id, eventData)
        : await galleryService.createEvent(eventData);
      
      onSave(savedEvent);
      onClose();
      resetForm();
    } catch (error: any) {
      console.error("Error saving event:", error);
      alert(`Failed to save event: ${error.message}`);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `temp-${Date.now()}.${fileExt}`;
      const filePath = `temp/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(filePath);

      setFeaturedImage(publicUrl);
    } catch (error: any) {
      console.error("Error uploading image:", error);
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormChange = useCallback((field: keyof CreateEventData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags?.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), trimmedTag]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {event ? "Edit Event" : "Add New Event"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <ImageUploadSection
              featuredImage={featuredImage}
              isUploading={isUploading}
              onImageUpload={handleImageUpload}
              onImageRemove={() => setFeaturedImage(null)}
            />

            <FormInput
              label="Event Name *"
              value={formData.event_name}
              onChange={(value) => handleFormChange('event_name', value)}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Category *"
                value={formData.category}
                options={CATEGORIES}
                onChange={(value) => handleFormChange('category', value)}
                required
              />

              <FormInput
                label="Event Date *"
                type="date"
                value={formData.event_date}
                onChange={(value) => handleFormChange('event_date', value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Location"
                value={formData.location || ""}
                onChange={(value) => handleFormChange('location', value)}
                placeholder="Venue name or address"
              />

              <FormInput
                label="Client Name"
                value={formData.client_name || ""}
                onChange={(value) => handleFormChange('client_name', value)}
                placeholder="Client or company name"
              />
            </div>

            <TagInput
              tags={formData.tags || []}
              tagInput={tagInput}
              onTagInputChange={setTagInput}
              onTagAdd={addTag}
              onTagRemove={removeTag}
              onTagKeyDown={handleTagKeyDown}
            />

            <FormTextarea
              label="Description"
              value={formData.description || ""}
              onChange={(value) => handleFormChange('description', value)}
              placeholder="Event details, highlights, or notes..."
              rows={3}
            />
          </div>

          <FormActions
            onCancel={onClose}
            submitLabel={event ? "Save Changes" : "Create Event"}
          />
        </form>
      </div>
    </div>
  );
}

// Extracted Components for better organization

interface ImageUploadSectionProps {
  featuredImage: string | null;
  isUploading: boolean;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
}

function ImageUploadSection({ featuredImage, isUploading, onImageUpload, onImageRemove }: ImageUploadSectionProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Featured Image
      </label>
      <div className="flex items-center gap-4">
        {featuredImage ? (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
            <img
              src={featuredImage}
              alt="Featured"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={onImageRemove}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              aria-label="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">No image</span>
          </div>
        )}
        
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageUpload(file);
            }}
            className="hidden"
            disabled={isUploading}
          />
          <div className={`
            px-4 py-2 rounded-lg flex items-center gap-2 text-white transition-colors
            ${isUploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 cursor-pointer'
            }
          `}>
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
          </div>
        </label>
      </div>
    </div>
  );
}

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function FormInput({ label, value, onChange, type = "text", placeholder, required }: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

interface FormSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
}

function FormSelect({ label, value, options, onChange, required }: FormSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
        required={required}
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

function FormTextarea({ label, value, onChange, placeholder, rows = 3 }: FormTextareaProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
        placeholder={placeholder}
      />
    </div>
  );
}

interface TagInputProps {
  tags: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onTagAdd: () => void;
  onTagRemove: (tag: string) => void;
  onTagKeyDown: (e: React.KeyboardEvent) => void;
}

function TagInput({ tags, tagInput, onTagInputChange, onTagAdd, onTagRemove, onTagKeyDown }: TagInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tags
      </label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => onTagInputChange(e.target.value)}
          onKeyDown={onTagKeyDown}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
          placeholder="Add a tag and press Enter"
        />
        <button
          type="button"
          onClick={onTagAdd}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Add
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Tag key={tag} tag={tag} onRemove={() => onTagRemove(tag)} />
        ))}
      </div>
    </div>
  );
}

interface TagProps {
  tag: string;
  onRemove: () => void;
}

function Tag({ tag, onRemove }: TagProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
      {tag}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-orange-900 transition-colors"
        aria-label={`Remove tag ${tag}`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

interface FormActionsProps {
  onCancel: () => void;
  submitLabel: string;
}

function FormActions({ onCancel, submitLabel }: FormActionsProps) {
  return (
    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        {submitLabel}
      </button>
    </div>
  );
}