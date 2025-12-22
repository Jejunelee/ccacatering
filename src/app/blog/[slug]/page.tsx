// app/blog/[slug]/page.tsx
import { getBlogPostBySlug } from "@/lib/blog";
import { Calendar, User, Clock, ArrowLeft, Tag, Share2, Bookmark, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

interface BlogPostPageProps {
  params: Promise<{ // params is a Promise
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Await the params Promise first
  const { slug } = await params;
  
  // Now use the slug
  const { data: post, error } = await getBlogPostBySlug(slug);

  if (error || !post) {
    notFound();
  }

  // Format date
  const formattedDate = new Date(post.published_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors duration-200 mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Articles
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-full">
              {post.category || "Uncategorized"}
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="font-medium">{post.author}</span>
            </div>
            {post.read_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{post.read_time}</span>
              </div>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {post.featured_image_url ? (
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-lg">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>
        ) : (
          <div className="relative h-48 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl overflow-hidden mb-8 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Eye className="w-4 h-4" />
            <span>Reading time: {post.read_time || '5 min'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
              title="Bookmark"
              aria-label="Bookmark article"
            >
              <Bookmark className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
              title="Share"
              aria-label="Share article"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Tag className="w-5 h-5 text-gray-400" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors duration-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 p-6 rounded-r-xl mb-8">
            <p className="text-lg font-medium text-gray-800 italic">{post.excerpt}</p>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Author Bio */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {post.author.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg mb-1">{post.author}</h3>
              <p className="text-gray-600 text-sm mb-3">Author</p>
              <p className="text-gray-700">
                {post.author} writes about catering trends, recipes, and industry insights. 
                With years of experience in the catering industry, they share practical advice 
                and innovative ideas for creating memorable dining experiences.
              </p>
            </div>
          </div>
        </div>

        {/* Suggested Posts (Optional - You can implement this later) */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Continue Reading</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* You can add suggested posts here later */}
            <Link 
              href="/blog"
              className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 hover:border-orange-300 transition-colors duration-200 group"
            >
              <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                More Catering Insights
              </h4>
              <p className="text-gray-600 text-sm">
                Discover more articles about catering trends, recipes, and industry tips.
              </p>
            </Link>
            <Link 
              href="/"
              className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors duration-200 group"
            >
              <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                Visit Our Main Site
              </h4>
              <p className="text-gray-600 text-sm">
                Explore our catering services, menus, and event planning resources.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}