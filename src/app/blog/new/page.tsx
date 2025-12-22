"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, X, Loader, Image as ImageIcon, Trash2 } from "lucide-react";
import { createBlogPost, isUserAdmin } from "@/lib/blog";
import { uploadImageToSupabase, isSupabaseImageUrl, deleteImageFromSupabase } from "@/lib/storage";
import Link from "next/link";
import { useAuthContext } from "@/providers/AuthProvider";

export default function NewBlogPostPage() {
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "",
    category: "",
    read_time: "",
    featured_image_url: "",
    is_featured: false,
    is_published: true
  });

  // Preview state for uploaded image
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAuth = async () => {
      if (authLoading) return;
      
      if (!isAdmin) {
        router.push("/blog");
        return;
      }
      
      setIsCheckingAuth(false);
    };
    
    checkAuth();
  }, [isAdmin, authLoading, router]);

  // Generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, formData.slug]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setIsSubmitting(false);
      setIsUploading(false);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // If there's an existing Supabase image, delete it first
      if (formData.featured_image_url && isSupabaseImageUrl(formData.featured_image_url)) {
        await deleteImageFromSupabase(formData.featured_image_url);
      }

      const { url, error: uploadError } = await uploadImageToSupabase(file);
      
      if (uploadError) {
        throw new Error(uploadError);
      }

      if (url) {
        setFormData(prev => ({ ...prev, featured_image_url: url }));
        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      }
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Remove image
  const handleRemoveImage = async () => {
    if (formData.featured_image_url && isSupabaseImageUrl(formData.featured_image_url)) {
      try {
        await deleteImageFromSupabase(formData.featured_image_url);
      } catch (err) {
        console.error('Error deleting image:', err);
        // Continue anyway - we'll still remove it from form
      }
    }
    
    setFormData(prev => ({ ...prev, featured_image_url: '' }));
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }
      if (!formData.content.trim()) {
        throw new Error("Content is required");
      }
      if (!formData.author.trim()) {
        throw new Error("Author is required");
      }
      if (!formData.slug.trim()) {
        throw new Error("Slug is required");
      }

      // Validate slug format
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(formData.slug)) {
        throw new Error("Slug must contain only lowercase letters, numbers, and hyphens");
      }

      const postData = {
        ...formData,
        published_date: new Date().toISOString().split('T')[0]
      };

      console.log('Creating post with data:', postData);
      
      const { error: createError, data } = await createBlogPost(postData);
      
      if (createError) {
        console.error('Server error:', createError);
        throw new Error(createError.message || 'Failed to create blog post');
      }
      
      console.log('Post created successfully:', data);
      
      // Show success message
      setSuccessMessage('Blog post created successfully! Redirecting...');
      
      // Small delay for better UX, then redirect
      setTimeout(() => {
        router.push("/blog");
      }, 1500);
      
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'Failed to create blog post');
      
      // Reset submitting state to allow retry
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Clean up any uploaded images if canceled
    if (formData.featured_image_url && isSupabaseImageUrl(formData.featured_image_url)) {
      deleteImageFromSupabase(formData.featured_image_url).catch(console.error);
    }
    
    if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
      router.push("/blog");
    }
  };

  if (authLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="w-8 h-8 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
              Admin Mode
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <p className="font-medium">Error: {error}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
              <p className="font-medium">Success: {successMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                placeholder="Enter post title"
                disabled={isSubmitting}
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL) *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                placeholder="blog-post-url"
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                title="Use lowercase letters, numbers, and hyphens only"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-sm text-gray-500">
                URL-friendly version of the title
              </p>
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author *
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                placeholder="Author name"
                disabled={isSubmitting}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., Industry Trends"
                disabled={isSubmitting}
              />
            </div>

            {/* Read Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Read Time
              </label>
              <input
                type="text"
                value={formData.read_time}
                onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., 5 min read"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Featured Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            
            {formData.featured_image_url || imagePreview ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-gray-300">
                  <img
                    src={imagePreview || formData.featured_image_url}
                    alt="Featured image preview"
                    className="w-full h-64 object-cover"
                    onLoad={() => {
                      if (imagePreview) {
                        URL.revokeObjectURL(imagePreview);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isUploading || isSubmitting}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600 flex-1 truncate">
                    {formData.featured_image_url}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isSubmitting}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Upload className="w-3 h-3" />
                    Replace Image
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-colors ${
                  isUploading ? 'bg-gray-50' : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading || isSubmitting}
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader className="w-8 h-8 text-orange-500 animate-spin mb-2" />
                    <p className="text-gray-600">Uploading image...</p>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700 font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      PNG, JPG, WebP or GIF (Max 5MB)
                    </p>
                    <button
                      type="button"
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
                      disabled={isUploading || isSubmitting}
                    >
                      <Upload className="w-4 h-4" />
                      Choose Image
                    </button>
                  </>
                )}
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Optional. Upload a featured image for your blog post.
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Brief summary of the post (displayed on blog listing)"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-sm text-gray-500">
              Optional. A short preview of your post.
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
              required
              placeholder="Write your blog post content here... (Supports HTML)"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-sm text-gray-500">
              You can use basic HTML tags like &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;, etc.
            </p>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap items-center gap-6 p-4 bg-gray-50 rounded-xl">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                disabled={isSubmitting}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Featured Post</span>
                <p className="text-xs text-gray-500">Show at the top of the blog</p>
              </div>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                disabled={isSubmitting}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Published</span>
                <p className="text-xs text-gray-500">Visible to public</p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Post
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Tips for Writing a Great Blog Post:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc pl-5">
            <li>Write a clear, descriptive title</li>
            <li>Add a compelling excerpt to grab attention</li>
            <li>Use headers to organize content</li>
            <li>Add relevant categories and tags</li>
            <li>Include images where appropriate</li>
            <li>Keep paragraphs short and readable</li>
          </ul>
        </div>
      </div>
    </div>
  );
}