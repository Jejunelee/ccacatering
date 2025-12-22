"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Search, X, Grid, List, ChevronLeft, ChevronRight, 
  Plus, Upload, Edit, Trash2, GripVertical 
} from "lucide-react";
import Image from "next/image";
import { useAuthContext } from "@/providers/AuthProvider";
import { galleryService } from "@/lib/gallery";
import { GalleryEvent } from "@/types/gallery";
import GalleryAdminToggle from "@/components/gallery/GalleryAdminToggle";
import EventModal from "../gallery/EventModal";

const DEFAULT_CATEGORIES = ["All", "Weddings", "Corporate", "Outdoor", "Desserts", "Cocktails"];

export default function GalleryPage() {
  const { isAdmin } = useAuthContext();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [galleryEvents, setGalleryEvents] = useState<GalleryEvent[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GalleryEvent | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  // Add to your existing useState declarations
const [editingImageId, setEditingImageId] = useState<string | null>(null);
const [imageTitleInput, setImageTitleInput] = useState("");
  
  
  const sliderRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fetch gallery data
  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [events, fetchedCategories] = await Promise.all([
        galleryService.getGalleryEvents(),
        galleryService.getCategories()
      ]);

      setGalleryEvents(events);
      const allCategories = ["All", ...new Set([...DEFAULT_CATEGORIES.slice(1), ...fetchedCategories.slice(1)])];
      setCategories(allCategories);
    } catch (err: any) {
      console.error("Error fetching gallery data:", err);
      setError(err.message || "Failed to load gallery");
    } finally {
      setIsLoading(false);
    }
  };

// Add this function with your other CRUD operations
const handleUpdateImageTitle = async (imageId: string, newTitle: string) => {
  try {
    await galleryService.updateImage(imageId, { title: newTitle });
    await fetchGalleryData(); // Refresh data
  } catch (err: any) {
    console.error("Error updating image title:", err);
    alert("Failed to update image title: " + err.message);
  }
};

  // Filter events
  const filteredEvents = galleryEvents.filter((event) => {
    if (selectedCategory !== "All" && event.category !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return event.event_name.toLowerCase().includes(query) ||
             event.description?.toLowerCase().includes(query) ||
             event.client_name?.toLowerCase().includes(query) ||
             event.tags?.some(tag => tag.toLowerCase().includes(query));
    }
    return true;
  });

  const clearFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
  };

  // Scroll functions for horizontal sliders
  const scrollLeft = (eventId: string) => {
    const slider = sliderRefs.current[eventId];
    if (slider) {
      slider.scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  const scrollRight = (eventId: string) => {
    const slider = sliderRefs.current[eventId];
    if (slider) {
      slider.scrollBy({ left: 350, behavior: "smooth" });
    }
  };

  // Event CRUD Operations
  const handleAddEvent = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: GalleryEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? All images will also be deleted.")) {
      return;
    }

    try {
      await galleryService.deleteEvent(eventId);
      await fetchGalleryData(); // Refresh data
    } catch (err: any) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event: " + err.message);
    }
  };

  const handleEventSave = (savedEvent: GalleryEvent) => {
    // Update local state
    setGalleryEvents(prev => {
      if (selectedEvent) {
        // Update existing event
        return prev.map(event => 
          event.id === savedEvent.id ? savedEvent : event
        );
      } else {
        // Add new event
        return [...prev, savedEvent];
      }
    });
  };

  // Image operations
  const handleUploadImage = async (eventId: string, file: File) => {
    try {
      await galleryService.uploadEventImage(eventId, file, "New Image");
      await fetchGalleryData(); // Refresh data
    } catch (err: any) {
      console.error("Error uploading image:", err);
      alert("Failed to upload image: " + err.message);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    try {
      await galleryService.deleteEventImage(imageId);
      await fetchGalleryData(); // Refresh data
    } catch (err: any) {
      console.error("Error deleting image:", err);
      alert("Failed to delete image: " + err.message);
    }
  };

  // Drag & Drop for reordering
  const handleDragStart = (index: number) => {
    setIsDragging(true);
    // You can implement drag and drop logic here
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Add to your GalleryPage return statement, after the existing controls:

  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin && <GalleryAdminToggle isEditMode={isEditMode} onToggleEditMode={setIsEditMode} />}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Add Event Button */}
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Event Galleries</h1>
            <p className="text-gray-600">Browse pictures from each event</p>
          </div>
          
          {isEditMode && isAdmin && (
            <button
              onClick={handleAddEvent}
              className="ml-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Add Event</span>
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl p-4 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, clients, or tags..."
                  className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 mr-2 hidden sm:block">View:</span>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-sm ${
                    selectedCategory === category
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(selectedCategory !== "All" || searchQuery) && (
            <button
              onClick={clearFilters}
              className="mt-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}
        </div>

        {/* Admin Controls Bar */}
        {isEditMode && isAdmin && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium text-orange-800">Admin Mode Active</span>
                <span className="text-sm text-orange-600">
                  Drag to reorder events • Click to edit • Hover for options
                </span>
              </div>
              <button
                onClick={() => setIsEditMode(false)}
                className="px-3 py-1 bg-white text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 text-sm"
              >
                Exit Edit Mode
              </button>
            </div>
          </div>
        )}

        {/* Gallery Status */}
        <div className="mb-8 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"}
          </p>
          
          {isEditMode && isAdmin && (
            <div className="text-sm text-gray-500">
              Total: {galleryEvents.length} events
            </div>
          )}
        </div>

        {/* Event Galleries */}
        {filteredEvents.length > 0 ? (
          viewMode === "list" ? (
            // Horizontal Slider Layout with Admin Controls
            <div className="space-y-12">
              {filteredEvents.map((event, index) => (
                <div 
                  key={event.id} 
                  className={`bg-white rounded-xl p-6 shadow-sm relative group ${
                    isDragging ? 'opacity-50' : ''
                  }`}
                  draggable={isEditMode && isAdmin}
                  onDragStart={() => handleDragStart(index)}
                  onDragEnd={handleDragEnd}
                >
                  {/* Drag Handle */}
                  {isEditMode && isAdmin && (
                    <div className="absolute -left-4 top-6 cursor-move text-gray-400 hover:text-gray-600">
                      <GripVertical className="w-5 h-5" />
                    </div>
                  )}

                  {/* Event Header with Admin Controls */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        {isEditMode && isAdmin && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit event"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <h2 className="text-2xl font-bold text-gray-900">
                          {event.event_name}
                        </h2>
                      </div>
                      
                      <div className="flex items-center gap-4 text-gray-600">
                        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                          {event.category}
                        </span>
                        <span className="text-sm">{new Date(event.event_date).toLocaleDateString()}</span>
                        <span className="text-sm">{event.images?.length || 0} photos</span>
                        {event.client_name && (
                          <span className="text-sm text-gray-500">Client: {event.client_name}</span>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Upload Button */}
                    {isEditMode && isAdmin && (
                      <label className="cursor-pointer ml-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadImage(event.id, file);
                          }}
                          className="hidden"
                        />
                        <div className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          <span>Add Image</span>
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {event.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Horizontal Slider */}
                  <div className="relative group">
                    {/* Navigation Buttons */}
                    {event.images && event.images.length > 0 && (
                      <>
                        <button
                          onClick={() => scrollLeft(event.id)}
                          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50"
                        >
                          <ChevronLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <button
                          onClick={() => scrollRight(event.id)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50"
                        >
                          <ChevronRight className="w-6 h-6 text-gray-700" />
                        </button>
                      </>
                    )}

                    {/* Image Slider */}
                    <div
                      ref={(el) => {
                        sliderRefs.current[event.id] = el;
                      }}
                      className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {event.images && event.images.length > 0 ? (
                        event.images.map((image) => (
                          <div
                            key={image.id}
                            className="flex-shrink-0 w-80 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 relative group/image"
                          >
                            {/* Image */}
                            <div className="relative h-64">
                              <Image
                                src={image.image_url}
                                alt={image.alt_text || image.title}
                                fill
                                className="object-cover"
                                sizes="320px"
                              />
                              
                              {/* Admin Delete Button */}
                              {isEditMode && isAdmin && (
                                <button
                                  onClick={() => handleDeleteImage(image.id)}
                                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            
{/* Image Info */}
<div className="p-4">
  {isEditMode && isAdmin && editingImageId === image.id ? (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={imageTitleInput}
        onChange={(e) => setImageTitleInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleUpdateImageTitle(image.id, imageTitleInput);
            setEditingImageId(null);
          } else if (e.key === 'Escape') {
            setEditingImageId(null);
          }
        }}
        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
        autoFocus
      />
      <button
        onClick={() => {
          handleUpdateImageTitle(image.id, imageTitleInput);
          setEditingImageId(null);
        }}
        className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
      >
        Save
      </button>
      <button
        onClick={() => setEditingImageId(null)}
        className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
      >
        Cancel
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2 group">
      <p className="font-medium text-gray-900 truncate flex-1">{image.title}</p>
      {isEditMode && isAdmin && (
        <button
          onClick={() => {
            setEditingImageId(image.id);
            setImageTitleInput(image.title);
          }}
          className="p-1 text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Edit title"
        >
          <Edit className="w-3 h-3" />
        </button>
      )}
    </div>
  )}
</div>
                          </div>
                        ))
                      ) : (
                        <div className="w-full h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                          <p className="text-gray-500">No images yet. {isEditMode && "Click 'Add Image' to upload."}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Grid View Fallback
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group">
                  {/* Admin Overlay Controls */}
                  {isEditMode && isAdmin && (
                    <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                        title="Edit event"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Featured Image or Placeholder */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {event.featured_image_url ? (
                      <Image
                        src={event.featured_image_url}
                        alt={event.event_name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : event.images && event.images.length > 0 ? (
                      <Image
                        src={event.images[0].image_url}
                        alt={event.images[0].title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-400">No images</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                        {event.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(event.event_date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{event.event_name}</h3>
                    <p className="text-gray-600 mb-4">{event.images?.length || 0} photos</p>
                    
                    {/* Tags in grid view */}
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {event.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {event.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{event.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Mini Image Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {event.images && event.images.length > 0 ? (
                        event.images.slice(0, 3).map((image, idx) => (
                          <div key={image.id} className="relative aspect-square">
                            <Image
                              src={image.image_url}
                              alt={image.alt_text || image.title}
                              fill
                              className="object-cover rounded"
                              sizes="(max-width: 768px) 33vw, 150px"
                            />
                            {idx === 2 && event.images && event.images.length > 3 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded">
                                <span className="text-white text-sm font-medium">
                                  +{event.images.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="col-span-3 aspect-square bg-gray-100 rounded flex items-center justify-center">
                          <p className="text-gray-500 text-sm">No images</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // No Events Found
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Clear filters
              </button>
              {isEditMode && isAdmin && (
                <button
                  onClick={handleAddEvent}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
                >
                  Create First Event
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        onSave={handleEventSave}
      />

      {/* Custom scrollbar hide style */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}