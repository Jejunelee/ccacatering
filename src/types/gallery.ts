export interface GalleryEvent {
    id: string;
    event_name: string;
    category: string;
    event_date: string;
    location?: string;
    client_name?: string;
    description?: string;
    featured_image_url?: string;
    tags?: string[];
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
    images?: EventImage[];
  }
  
  export interface EventImage {
    id: string;
    event_id: string;
    title: string;
    image_url: string;
    display_order: number;
    alt_text?: string;
    created_at: string;
  }
  
  export interface GalleryFilters {
    category: string;
    search: string;
    sortBy: 'date' | 'name';
    sortOrder: 'asc' | 'desc';
  }

  export interface CreateEventData {
    event_name: string;
    category: string;
    event_date: string;
    location?: string;
    client_name?: string;
    description?: string;
    tags?: string[];
    display_order?: number;
  }