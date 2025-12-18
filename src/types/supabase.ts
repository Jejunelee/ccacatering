export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'user';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'admin' | 'user';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'user';
          created_at?: string;
          updated_at?: string;
        };
      };
      content_blocks: {
        Row: {
          id: string;
          component_name: string;
          block_key: string;
          content: string;
          content_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          component_name: string;
          block_key: string;
          content?: string;
          content_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          component_name?: string;
          block_key?: string;
          content?: string;
          content_type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      slider_images: {
        Row: {
          id: string;
          component_name: string;
          image_url: string;
          alt_text: string;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          component_name: string;
          image_url: string;
          alt_text?: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          component_name?: string;
          image_url?: string;
          alt_text?: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [view_name: string]: {
        Row: {}
      }
    };
    Functions: {
      [fn_name: string]: {
        Args: Record<string, unknown>
        Returns: unknown
      }
    };
  }
}