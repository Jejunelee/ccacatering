import { supabase } from '@/lib/supabase';
import { GalleryEvent, EventImage } from '@/types/gallery';


export const galleryService = {
  // Get all gallery events with their images
  async getGalleryEvents(): Promise<GalleryEvent[]> {
    const { data: events, error } = await supabase
      .from('gallery_events')
      .select(`
        *,
        images:event_images(
          id,
          title,
          image_url,
          display_order,
          alt_text,
          created_at
        )
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('event_date', { ascending: false });

    if (error) {
      console.error('Error fetching gallery events:', error);
      throw error;
    }

    return events || [];
  },


  
  // Get single event by ID
  async getEventById(id: string): Promise<GalleryEvent | null> {
    const { data: event, error } = await supabase
      .from('gallery_events')
      .select(`
        *,
        images:event_images(
          id,
          title,
          image_url,
          display_order,
          alt_text,
          created_at
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return null;
    }

    return event;
  },

  async updateImage(
    imageId: string,
    updates: Partial<EventImage>
  ): Promise<EventImage> {
    // Create a clean object with only the properties we want to update
    const cleanUpdates = JSON.parse(JSON.stringify(updates));
    
    const { data: image, error } = await supabase
      .from('event_images')
      // @ts-ignore - Supabase type issue
      .update(cleanUpdates)
      .eq('id', imageId)
      .select()
      .single();
  
    if (error) {
      console.error('Error updating image:', error);
      throw error;
    }
    
    return image;
  },

  // Upload image for an event
  async uploadEventImage(
    eventId: string,
    file: File,
    title: string,
    altText?: string
  ): Promise<EventImage> {
    // Upload to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${eventId}-${Date.now()}.${fileExt}`;
    const filePath = `events/${eventId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(filePath);
    const supabaseClient = supabase as any;
    // Create image record
    const { data: image, error: dbError } = await supabaseClient
      .from('event_images')
      .insert({
        event_id: eventId,
        title,
        image_url: publicUrl,
        alt_text: altText || title,
        display_order: 0 // You might want to calculate this based on existing images
      })
      .select()
      .single();

    if (dbError) {
      // Clean up storage if DB insert fails
      await supabase.storage
        .from('gallery-images')
        .remove([filePath]);
      throw dbError;
    }

    return image;
  },

// Delete event image
async deleteEventImage(imageId: string): Promise<void> {
    // First get the image to know the storage path
    const { data: image, error: fetchError } = await supabase
      .from('event_images')
      .select('image_url')
      .eq('id', imageId)
      .single() as { data: { image_url: string } | null, error: any };
  
    if (fetchError) throw fetchError;
    if (!image) throw new Error('Image not found');
  
    // Extract file path from URL
    const url = new URL(image.image_url);
    const path = url.pathname.split('/storage/v1/object/public/gallery-images/')[1];
  
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('gallery-images')
      .remove([path]);
  
    if (storageError) throw storageError;
  
    // Delete from database
    const { error: dbError } = await supabase
      .from('event_images')
      .delete()
      .eq('id', imageId);
  
    if (dbError) throw dbError;
  },

  // Get unique categories
// Get unique categories
async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('gallery_events')
      .select('category')
      .eq('is_active', true);
  
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  
    // Type guard to ensure data exists and has category property
    if (!data || !Array.isArray(data)) {
      return ['All'];
    }
  
    // Filter out null/undefined categories and cast to string[]
    const categories = data
      .map(item => (item as { category?: string })?.category)
      .filter((category): category is string => 
        typeof category === 'string' && category.trim() !== ''
      );
  
    const uniqueCategories = [...new Set(categories)];
    return ['All', ...uniqueCategories];
  },

  // Create new event (admin only)
  async createEvent(
    eventData: Omit<GalleryEvent, 'id' | 'created_at' | 'updated_at' | 'images'>
  ): Promise<GalleryEvent> {
    const supabaseClient = supabase as any;
    const { data: event, error } = await supabaseClient
      .from('gallery_events')
      .insert(eventData)
      .select()
      .single();

    if (error) throw error;
    return event;
  },

  
  // Update event (admin only)
  async updateEvent(
    id: string,
    updates: Partial<GalleryEvent>
  ): Promise<GalleryEvent> {
    const supabaseClient = supabase as any;
    const { data: event, error } = await supabaseClient
      .from('gallery_events')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return event;
  },

  // Delete event (admin only)
  async deleteEvent(id: string): Promise<void> {
    // Images will be cascade deleted due to foreign key constraint
    const { error } = await supabase
      .from('gallery_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};