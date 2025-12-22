import { supabase } from './supabase';

// Database Types (based on your schema)
export interface DBBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author: string;
  published_date: string;
  read_time: string | null;
  category: string | null;
  featured_image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBBlogTag {
  id: string;
  name: string;
  created_at: string;
}

export interface DBBlogPostTag {
  post_id: string;
  tag_id: string;
}

// App Types (with tags array)
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author: string;
  published_date: string;
  read_time: string | null;
  category: string | null;
  featured_image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface BlogTag extends DBBlogTag {}

// Types for query results
interface BlogPostWithTagsQueryResult extends Omit<DBBlogPost, 'blog_post_tags'> {
  blog_post_tags: Array<{
    blog_tags: { name: string }
  }>
}

// Helper: Transform database response to include tags array
function transformPostWithTags(post: BlogPostWithTagsQueryResult): BlogPost {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    author: post.author,
    published_date: post.published_date,
    read_time: post.read_time,
    category: post.category,
    featured_image_url: post.featured_image_url,
    is_featured: post.is_featured,
    is_published: post.is_published,
    created_at: post.created_at,
    updated_at: post.updated_at,
    tags: post.blog_post_tags?.map((pt) => pt.blog_tags?.name).filter(Boolean) || []
  };
}

// ========== PUBLIC FUNCTIONS (No auth required) ==========

// Fetch all published blog posts with their tags
export async function getBlogPosts({
  category,
  tag,
  search,
  featuredOnly = false,
  limit = 10,
  offset = 0
}: {
  category?: string;
  tag?: string;
  search?: string;
  featuredOnly?: boolean;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        blog_post_tags (
          blog_tags (
            name
          )
        )
      `)
      .eq('is_published', true)
      .order('published_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching blog posts:', error);
      return { data: null, error };
    }

    // Transform the data to include tags as an array
    const postsWithTags = data?.map(transformPostWithTags) || [];

    return { data: postsWithTags, error: null };
  } catch (error: any) {
    console.error('Error in getBlogPosts:', error);
    return { data: null, error };
  }
}

// Fetch a single blog post by slug
export async function getBlogPostBySlug(slug: string) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_post_tags (
            blog_tags (
              name
            )
          )
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
  
      if (error) {
        console.error('Error fetching blog post:', {
          message: error.message || 'Unknown error',
          code: error.code || 'no-code',
          details: error.details || 'No details',
          hint: error.hint || 'No hint'
        });
        return { data: null, error: new Error(error.message || 'Failed to fetch blog post') };
      }
  
      if (!data) {
        console.error('No blog post found for slug:', slug);
        return { data: null, error: new Error('Blog post not found') };
      }
  
      return { data: transformPostWithTags(data as BlogPostWithTagsQueryResult), error: null };
    } catch (error: any) {
      console.error('Unexpected error in getBlogPostBySlug:', error);
      return { 
        data: null, 
        error: new Error(error?.message || 'An unexpected error occurred while fetching the blog post') 
      };
    }
  }

// Fetch a single blog post by slug (Admin version - shows all posts)
export async function getBlogPostBySlugAdmin(slug: string) {
  try {
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return { data: null, error: new Error('Unauthorized: Admin access required') };
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_post_tags (
          blog_tags (
            name
          )
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Admin fetch error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Return a proper Error object
      return { 
        data: null, 
        error: new Error(error.message || 'Failed to fetch blog post') 
      };
    }

    if (!data) {
      return { data: null, error: new Error('Blog post not found') };
    }

    return { data: transformPostWithTags(data as BlogPostWithTagsQueryResult), error: null };
  } catch (error: any) {
    console.error('Error in getBlogPostBySlugAdmin:', error);
    return { 
      data: null, 
      error: new Error(error.message || 'An unexpected error occurred') 
    };
  }
}

// Fetch all categories from published posts
export async function getBlogCategories() {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('category')
      .eq('is_published', true)
      .not('category', 'is', null);

    if (error) {
      console.error('Error fetching categories:', error);
      return { data: [], error };
    }

    // Get unique categories
    const categories = Array.from(
      new Set(data.map((item: any) => item.category).filter(Boolean))
    ) as string[];
    
    return { data: categories, error: null };
  } catch (error: any) {
    console.error('Error in getBlogCategories:', error);
    return { data: [], error };
  }
}

// Fetch all tags
export async function getBlogTags() {
  try {
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching tags:', error);
      return { data: [], error };
    }

    return { data: data as BlogTag[], error: null };
  } catch (error: any) {
    console.error('Error in getBlogTags:', error);
    return { data: [], error };
  }
}

// ========== ADMIN FUNCTIONS (Requires authentication) ==========

// Check if user is admin
export async function isUserAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return false;
    }

    return (profile as any)?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Create a new blog post (admin only)
export async function createBlogPost(post: Omit<DBBlogPost, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return { data: null, error: new Error('Unauthorized: Admin access required') };
    }

    // Add created_at and updated_at
    const now = new Date().toISOString();
    const postWithTimestamps = {
      ...post,
      created_at: now,
      updated_at: now
    };

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([postWithTimestamps] as any)
      .select()
      .single();

    return { data, error };
  } catch (error: any) {
    console.error('Error in createBlogPost:', error);
    return { data: null, error };
  }
}

// Update a blog post by ID (admin only)
export async function updateBlogPost(id: string, updates: Partial<DBBlogPost>) {
  try {
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return { data: null, error: new Error('Unauthorized: Admin access required') };
    }

    // Remove id from updates if it exists
    const { id: _, ...updateData } = updates as any;
    const supabaseClient = supabase as any;

    const { data, error } = await supabaseClient
      .from('blog_posts')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  } catch (error: any) {
    console.error('Error in updateBlogPost:', error);
    return { data: null, error };
  }
}

export async function updateBlogPostBySlug(slug: string, updates: Partial<DBBlogPost>) {
    try {
      const isUserActuallyAdmin = await isUserAdmin();
      if (!isUserActuallyAdmin) {
        return { data: null, error: new Error('Unauthorized: Admin access required') };
      }
  
      if (!slug) {
        return { data: null, error: new Error('Slug is required') };
      }
  
      // First get the post ID from the slug
      const { data: post, error: fetchError } = await supabase
        .from('blog_posts')
        .select('id, slug')
        .eq('slug', slug)
        .maybeSingle(); // Use maybeSingle instead of single for better error handling
  
      if (fetchError) {
        console.error('Error fetching post:', fetchError);
        return { data: null, error: new Error('Failed to fetch post') };
      }
  
      if (!post) {
        return { data: null, error: new Error('Post not found') };
      }
  
      // Remove id from updates if it exists
      const { id: _, ...updateData } = updates as any;
      
      // Update timestamp
      const updatedData = {
        ...updateData,
        updated_at: new Date().toISOString()
      };
  
      const supabaseClient = supabase as any;

      // Then update by ID
      const { data, error } = await supabaseClient
        .from('blog_posts')
        .update(updatedData as any)
        .eq('id', (post as any).id)
        .select()
        .single();
  
      if (error) {
        console.error('Update error:', error);
        return { data: null, error: new Error(error.message || 'Failed to update post') };
      }
  
      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected error in updateBlogPostBySlug:', error);
      return { 
        data: null, 
        error: new Error(error.message || 'An unexpected error occurred') 
      };
    }
  }

// Delete a blog post (admin only)
export async function deleteBlogPost(id: string) {
  try {
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return { error: new Error('Unauthorized: Admin access required') };
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    return { error };
  } catch (error: any) {
    console.error('Error in deleteBlogPost:', error);
    return { error };
  }
}