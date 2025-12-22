import { supabase } from './supabase';

export interface UploadResponse {
  url: string | null;
  error: string | null;
  path?: string;
}

export interface UploadProgress {
  progress: number;
  loaded: number;
  total: number;
}

export async function uploadImageToSupabase(
  file: File,
  bucket: string = 'blog-images',
  folder: string = 'featured',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> {
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        // Note: Supabase JS v2 doesn't support progress callbacks directly
        // You might need to implement XMLHttpRequest for progress tracking
      });

    if (error) {
      console.error('Error uploading image:', error);
      return { url: null, error: error.message };
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrl, error: null, path: data.path };
  } catch (error: any) {
    console.error('Error in uploadImageToSupabase:', error);
    return { url: null, error: error.message || 'Failed to upload image' };
  }
}

export async function deleteImageFromSupabase(
  urlOrPath: string,
  bucket: string = 'blog-images'
): Promise<{ error: string | null }> {
  try {
    let filePath: string;
    
    // Check if it's a URL or a path
    if (urlOrPath.includes('supabase.co/storage/v1/object/public/')) {
      // Extract path from URL
      const urlObj = new URL(urlOrPath);
      // Path format: /object/public/bucket-name/path/to/file
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.indexOf('object') + 2; // Skip 'object', 'public'
      
      if (bucketIndex < pathParts.length) {
        // Reconstruct the path without bucket name
        filePath = pathParts.slice(bucketIndex + 1).join('/');
      } else {
        return { error: 'Could not extract file path from URL' };
      }
    } else {
      // Assume it's already a path
      filePath = urlOrPath;
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error: any) {
    console.error('Error in deleteImageFromSupabase:', error);
    return { error: error.message || 'Failed to delete image' };
  }
}

export function isSupabaseImageUrl(url: string): boolean {
  return url.includes('supabase.co/storage/v1/object/public/');
}

// Helper function to simulate upload progress (for UI feedback)
export function simulateUploadProgress(
  onProgress: (progress: number) => void,
  duration: number = 2000
): NodeJS.Timeout {
  let progress = 0;
  const interval = 100;
  const steps = duration / interval;
  const increment = 100 / steps;
  
  const timer = setInterval(() => {
    progress = Math.min(progress + increment, 90); // Stop at 90%
    onProgress(progress);
  }, interval);
  
  return timer;
}