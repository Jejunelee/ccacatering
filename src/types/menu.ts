export interface MenuSectionDB {
    id: string;
    label: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface MenuItemDB {
    id: string;
    section_id: string;
    title: string;
    custom_id: string | null;
    display_order: number;
    soup: string | null;
    salads: string | null;
    hot: string | null;
    desserts: string | null;
    description: string | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface MenuItemImageDB {
    id: string;
    menu_item_id: string;
    image_url: string;
    display_order: number;
    alt_text: string;
    created_at: string;
  }
  
  export interface MenuItem {
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
  
  export interface MenuSection {
    id: string;
    label: string;
    items: MenuItem[];
    display_order: number;
  }