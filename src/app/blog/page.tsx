// app/blog/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Calendar, User, Clock, ArrowRight, Search, Tag, ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuthContext } from "@/providers/AuthProvider";
import { getBlogPosts, getBlogCategories, getBlogTags, deleteBlogPost, BlogPost } from "@/lib/blog";
import BlogAdminToggle from "@/components/blog/BlogAdminToggle";

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
  const { isAdmin } = useAuthContext();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<string[]>(["All Posts"]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchBlogData();
  }, []);

  const fetchBlogData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch posts
      const { data: postsData } = await getBlogPosts({});
      if (postsData) setPosts(postsData);
      
      // Fetch categories
      const { data: categoriesData } = await getBlogCategories();
      if (categoriesData) setCategories(["All Posts", ...categoriesData]);
      
      // Fetch tags
      const { data: tagsData } = await getBlogTags();
      if (tagsData) setTags(tagsData.map(tag => tag.name));
      
    } catch (error) {
      console.error("Error fetching blog data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete post
  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (!isAdmin) return;
    
    if (!confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await deleteBlogPost(postId);
      if (error) throw error;
      
      // Remove from local state
      setPosts(prev => prev.filter(post => post.id !== postId));
      alert('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  // Filter posts
  useEffect(() => {
    let filtered = [...posts];
    
    if (selectedCategory !== "All Posts") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) || 
        (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
        post.content.toLowerCase().includes(query) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    if (selectedTag) {
      filtered = filtered.filter(post => 
        post.tags?.includes(selectedTag)
      );
    }
    
    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, selectedTag, posts]);

  // Pagination
  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSelectedCategory("All Posts");
    setSearchQuery("");
    setSelectedTag(null);
  };

  // Featured posts (first 2 featured posts)
  const featuredPosts = posts.filter(post => post.is_featured).slice(0, 2);

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        {isAdmin && <BlogAdminToggle isEditMode={isEditMode} onToggleEditMode={setIsEditMode} />}
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-8">
            {/* Skeleton for hero */}
            <div className="h-32 bg-gray-200 rounded-2xl mb-8"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Skeleton sidebar */}
              <div className="space-y-8">
                <div className="h-48 bg-gray-200 rounded-2xl"></div>
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
                <div className="h-32 bg-gray-200 rounded-2xl"></div>
              </div>
              
              {/* Skeleton main content */}
              <div className="lg:col-span-3 space-y-6">
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {isAdmin && <BlogAdminToggle isEditMode={isEditMode} onToggleEditMode={setIsEditMode} />}
      
      {/* Hero Section */}
      <div className="relative py-8 md:py-12">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold mb-2">
              Catering Insights
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Fresh Perspectives on{" "}
              <span className="font-brisa text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                Catering Excellence
              </span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Search */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Articles
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topics..."
                  className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category}</span>
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                        {category === "All Posts" 
                          ? posts.length 
                          : posts.filter(p => p.category === category).length}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            {tags.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 10).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 ${
                        selectedTag === tag
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {(selectedCategory !== "All Posts" || searchQuery || selectedTag) && (
              <button
                onClick={clearFilters}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Posts */}
            {featuredPosts.length > 0 && currentPage === 1 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => (
                    <FeaturedPostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {/* All Posts Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === "All Posts" ? "Latest Articles" : selectedCategory}
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'} found
                </p>
              </div>
              
              {isAdmin && isEditMode && (
                <Link
                  href="/blog/new"
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity duration-200 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Post
                </Link>
              )}
            </div>

            {/* Posts Grid */}
            {currentPosts.length > 0 ? (
              <div className="space-y-6">
                {currentPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    isEditMode={isEditMode && isAdmin}
                    onDelete={() => handleDeletePost(post.id, post.title)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  <Search className="w-12 h-12 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {posts.length === 0 
                    ? "No blog posts have been published yet." 
                    : "Try adjusting your search or filter criteria to find what you're looking for."}
                </p>
                
                {posts.length === 0 && isAdmin && isEditMode ? (
                  <Link
                    href="/blog/new"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    Create Your First Post
                  </Link>
                ) : (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity duration-200"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                      currentPage === page
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for featured posts
function FeaturedPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
        <div className="relative h-48 overflow-hidden">
          {post.featured_image_url ? (
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-400" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-orange-700 text-sm font-semibold rounded-full">
              {post.category || "Uncategorized"}
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.published_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            {post.read_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.read_time}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-200 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
          <div className="inline-flex items-center gap-2 text-orange-600 font-semibold group-hover:gap-3 transition-all duration-200">
            Read Article
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </article>
    </Link>
  );
}

// Component for regular posts
function PostCard({ 
  post, 
  isEditMode, 
  onDelete 
}: { 
  post: BlogPost; 
  isEditMode?: boolean;
  onDelete?: () => void;
}) {
  return (
    <article className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Thumbnail */}
        <div className="md:w-48 flex-shrink-0">
          <Link href={`/blog/${post.slug}`} className="block">
            <div className="relative h-48 md:h-full rounded-xl overflow-hidden">
              {post.featured_image_url ? (
                <Image
                  src={post.featured_image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 200px"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-400" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-orange-700 text-xs font-semibold rounded-full">
                  {post.category || "Uncategorized"}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-3">
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.published_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              {post.read_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.read_time}
                </span>
              )}
            </div>
            
            {isEditMode && (
              <div className="flex gap-2">
                {/* FIXED: Changed from post.id to post.slug */}
                <Link
                  href={`/blog/${post.slug}/edit`}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit post"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={onDelete}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          <Link href={`/blog/${post.slug}`}>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-200 line-clamp-2">
              {post.title}
            </h3>
          </Link>
          
          <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  +{post.tags.length - 3} more
                </span>
              )}
            </div>
          )}
          
          <Link 
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-orange-600 font-semibold group-hover:gap-3 transition-all duration-200"
          >
            Read Full Article
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}