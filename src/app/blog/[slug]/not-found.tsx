// app/blog/[slug]/not-found.tsx
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function BlogPostNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
          <Search className="w-12 h-12 text-orange-400" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Article Not Found
        </h1>
        
        <p className="text-gray-600 mb-8 text-lg">
          The blog post you're looking for doesn't exist or may have been moved.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          
          <p className="text-gray-500 text-sm">
            Or you might want to{" "}
            <Link href="/" className="text-orange-600 hover:text-orange-700 font-medium">
              return to the homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}