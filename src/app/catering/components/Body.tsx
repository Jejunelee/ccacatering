"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Modal from "./Modal";
import MenuAdminToggle from "../../../components/editable/MenuAdminToggle";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/providers/AuthProvider";
import { Plus, GripVertical, Trash2, Edit, Image as ImageIcon } from "lucide-react";

// Define types inline if you don't want a separate types file
interface MenuItem {
  id: string;
  title: string;
  images: string[];
  soup?: string;
  salads?: string;
  hot?: string;
  desserts?: string;
  description?: string;
  display_order?: number;
  custom_id?: string;
}

interface MenuSection {
  id: string;
  label: string;
  items: MenuItem[];
  display_order: number;
}

// Database response types
interface DBMenuSection {
  id: string;
  label: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DBMenuItem {
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

interface DBMenuItemImage {
  id: string;
  menu_item_id: string;
  image_url: string;
  display_order: number;
  alt_text: string;
  created_at: string;
}

export default function Body() {
  const { isAdmin } = useAuthContext();
  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [newSectionLabel, setNewSectionLabel] = useState("");
  

  // Fetch menu data from Supabase
  const fetchMenuData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all sections ordered by display_order with explicit type
      const { data: sections, error: sectionsError } = await supabase
        .from("menu_sections")
        .select("*")
        .order("display_order", { ascending: true });

      if (sectionsError) throw sectionsError;

      // Cast sections to DBMenuSection[]
      const dbSections: DBMenuSection[] = sections as DBMenuSection[];

      // For each section, fetch its items with images
      const sectionsWithItems: MenuSection[] = await Promise.all(
        dbSections.map(async (section) => {
          // Fetch items for this section
          const { data: items, error: itemsError } = await supabase
            .from("menu_items")
            .select("*")
            .eq("section_id", section.id)
            .order("display_order", { ascending: true });

          if (itemsError) throw itemsError;

          // Cast items to DBMenuItem[]
          const dbItems: DBMenuItem[] = items as DBMenuItem[];

          // For each item, fetch its images
          const itemsWithImages: MenuItem[] = await Promise.all(
            dbItems.map(async (item) => {
              const { data: images, error: imagesError } = await supabase
                .from("menu_item_images")
                .select("image_url")
                .eq("menu_item_id", item.id)
                .order("display_order", { ascending: true });

              if (imagesError) throw imagesError;

              // Cast images to DBMenuItemImage[]
              const dbImages: DBMenuItemImage[] = images as DBMenuItemImage[];

              return {
                id: item.id,
                title: item.title,
                custom_id: item.custom_id || undefined,
                images: dbImages.map((img) => img.image_url),
                soup: item.soup || undefined,
                salads: item.salads || undefined,
                hot: item.hot || undefined,
                desserts: item.desserts || undefined,
                description: item.description || undefined,
              };
            })
          );

          return {
            id: section.id,
            label: section.label,
            items: itemsWithImages,
            display_order: section.display_order,
          };
        })
      );

      setMenuSections(sectionsWithItems);
    } catch (err: any) {
      console.error("Error fetching menu data:", err);
      setError(err.message || "Failed to load menu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  // Function to update a single menu item in state
  const updateMenuItem = (updatedItem: MenuItem) => {
    setMenuSections(prevSections => 
      prevSections.map(section => ({
        ...section,
        items: section.items.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      }))
    );
    
    // Also update selectedItem if it's the same item
    if (selectedItem && selectedItem.id === updatedItem.id) {
      setSelectedItem(updatedItem);
    }
  };

  // lock scroll while modal is open
  useEffect(() => {
    const original = document.body.style.overflow;
    if (selectedItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original || "";
    }
    return () => {
      document.body.style.overflow = original || "";
    };
  }, [selectedItem]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedItem(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // --- ADMIN FUNCTIONS ---

  // Add new section
  const handleAddSection = async () => {
    if (!newSectionLabel.trim()) return;

    try {
      const { data, error } = await supabase
        .from("menu_sections")
        .insert({
          label: newSectionLabel,
          display_order: menuSections.length + 1,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Refresh data
      await fetchMenuData();
      setNewSectionLabel("");
    } catch (err: any) {
      console.error("Error adding section:", err);
      alert("Failed to add section: " + err.message);
    }
  };

  // Update section label
  const handleUpdateSectionLabel = async (sectionId: string, newLabel: string) => {
    try {
      // Update local state immediately
      setMenuSections(prev =>
        prev.map(section =>
          section.id === sectionId ? { ...section, label: newLabel } : section
        )
      );

      // Save to database
      const { error } = await supabase
        .from("menu_sections")
        .update({ label: newLabel } as never)
        .eq("id", sectionId);

      if (error) throw error;
      
      setEditingSectionId(null);
    } catch (err: any) {
      console.error("Error updating section:", err);
      
      // Revert on error
      await fetchMenuData();
      alert("Failed to update section: " + err.message);
    }
  };

  // Delete section
  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section? All items in it will also be deleted.")) {
      return;
    }

    try {
      // Remove from local state immediately
      setMenuSections(prev => prev.filter(section => section.id !== sectionId));

      // Delete from database
      const { error } = await supabase
        .from("menu_sections")
        .delete()
        .eq("id", sectionId);

      if (error) throw error;
    } catch (err: any) {
      console.error("Error deleting section:", err);
      
      // Revert on error
      await fetchMenuData();
      alert("Failed to delete section: " + err.message);
    }
  };

  // Add new item to section
  const handleAddItem = async (sectionId: string) => {
    const section = menuSections.find(s => s.id === sectionId);
    if (!section) return;

    const newItemTitle = `New Item ${section.items.length + 1}`;

    try {
      // Create optimistic item
      const optimisticItem: MenuItem = {
        id: `temp-${Date.now()}`,
        title: newItemTitle,
        images: [],
        display_order: section.items.length + 1,
      };

      // Add to local state immediately
      setMenuSections(prev =>
        prev.map(s =>
          s.id === sectionId
            ? { ...s, items: [...s.items, optimisticItem]}
            : s
        )
      );

      // Save to database
      const { data, error } = await supabase
        .from("menu_items")
        .insert({
          section_id: sectionId,
          title: newItemTitle,
          display_order: section.items.length,
        } as any)
        .select()
        .single();

      if (error) throw error;
      
// Type assertion for data
const insertedData = data as { id: string };

      // Replace optimistic item with real one
      setMenuSections(prev =>
        prev.map(s =>
          s.id === sectionId
            ? {
                ...s,
                items: s.items.map(item =>
                  item.id === optimisticItem.id
                    ? { ...item, id: insertedData.id} 
                    : item
                )
              }
            : s
        )
      );
    } catch (err: any) {
      console.error("Error adding item:", err);
      
      // Revert on error
      await fetchMenuData();
      alert("Failed to add item: " + err.message);
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) {
      return;
    }

    try {
      // Remove from local state immediately
      setMenuSections(prev =>
        prev.map(section => ({
          ...section,
          items: section.items.filter(item => item.id !== itemId)
        }))
      );

      // Also remove selected item if it's the same
      if (selectedItem && selectedItem.id === itemId) {
        setSelectedItem(null);
      }

      // Delete from database
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
    } catch (err: any) {
      console.error("Error deleting item:", err);
      
      // Revert on error
      await fetchMenuData();
      alert("Failed to delete item: " + err.message);
    }
  };

  if (isLoading) {
    return (
      <>
        {isAdmin && <MenuAdminToggle isEditMode={isEditMode} onToggleEditMode={setIsEditMode} />}
        <div className="px-6 py-10 max-w-6xl mx-auto font-din text-center">
          <div className="animate-pulse space-y-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-7 bg-gray-200 rounded-full mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-44 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {isAdmin && <MenuAdminToggle isEditMode={isEditMode} onToggleEditMode={setIsEditMode} />}
        <div className="px-6 py-10 max-w-6xl mx-auto font-din text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-2">Error Loading Menu</h3>
            <p className="mb-4">{error}</p>
            <button
              onClick={fetchMenuData}
              className="px-4 py-2 bg-[#F68A3A] text-white rounded-lg hover:bg-[#E5792A] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  // If no data loaded, show empty state
  if (menuSections.length === 0) {
    return (
      <>
        {isAdmin && <MenuAdminToggle isEditMode={isEditMode} onToggleEditMode={setIsEditMode} />}
        <div className="px-6 py-10 max-w-6xl mx-auto font-din text-center">
          <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl">
            <h3 className="font-bold text-lg mb-2">No Menu Data Found</h3>
            <p className="mb-4">The menu sections are empty or not configured.</p>
            {isAdmin && (
              <div className="flex items-center space-x-3 justify-center">
                <input
                  type="text"
                  value={newSectionLabel}
                  onChange={(e) => setNewSectionLabel(e.target.value)}
                  placeholder="Enter new section label"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F68A3A] focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSection();
                    }
                  }}
                />
                <button
                  onClick={handleAddSection}
                  className="px-4 py-2 bg-[#F68A3A] text-white rounded-lg hover:bg-[#E5792A] transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Section</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isAdmin && <MenuAdminToggle isEditMode={isEditMode} onToggleEditMode={setIsEditMode} />}
      
      <div className="px-6 py-10 max-w-6xl mx-auto font-din">
        {/* Add New Section Form (only in edit mode) */}
        {isEditMode && isAdmin && (
          <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={newSectionLabel}
                onChange={(e) => setNewSectionLabel(e.target.value)}
                placeholder="Enter new section label (e.g., 'Set D')"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F68A3A] focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSection();
                  }
                }}
              />
              <button
                onClick={handleAddSection}
                className="px-4 py-2 bg-[#F68A3A] text-white rounded-lg hover:bg-[#E5792A] transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Section</span>
              </button>
            </div>
          </div>
        )}

        {menuSections.map((section) => (
          <section key={section.id} className="mb-12 relative">
            {/* Section Header with Edit Controls */}
            <div className="flex items-center justify-between mb-3">
              {editingSectionId === section.id ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    defaultValue={section.label}
                    className="font-din text-2xl font-bold text-black border-2 border-[#F68A3A] rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#F68A3A]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateSectionLabel(section.id, e.currentTarget.value);
                      }
                      if (e.key === 'Escape') {
                        setEditingSectionId(null);
                      }
                    }}
                    onBlur={(e) => handleUpdateSectionLabel(section.id, e.target.value)}
                    autoFocus
                  />
                  <button
                    onClick={() => setEditingSectionId(null)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  {isEditMode && isAdmin && (
                    <button
                      className="text-gray-400 hover:text-gray-600 cursor-move"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-5 h-5" />
                    </button>
                  )}
                  <h2 className="font-din text-2xl font-bold text-black">
                    {section.label}
                  </h2>
                </div>
              )}

              {/* Section Action Buttons */}
              {isEditMode && isAdmin && editingSectionId !== section.id && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingSectionId(section.id)}
                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit section name"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="w-full h-7 bg-[#E6E6E6] rounded-full mb-4 flex items-center justify-between px-3 text-sm text-gray-700 font-din">
              <span>Lunch/Dinner Menu</span>
              {isEditMode && isAdmin && (
                <button
                  onClick={() => handleAddItem(section.id)}
                  className="text-xs bg-[#F68A3A] text-white px-3 py-1 rounded-full hover:bg-[#E5792A] transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Item</span>
                </button>
              )}
            </div>

            {/* Items Grid with Edit Controls */}
            {section.label === "Buffet Setup Menu" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.slice(0, 3).map((item) => (
                    <MenuCardWithControls
                      key={item.id}
                      item={item}
                      sectionId={section.id}
                      isEditMode={isEditMode}
                      isAdmin={isAdmin}
                      onOpen={() => {
                        setSelectedItem(item);
                        setImageIndex(0);
                      }}
                      onDelete={handleDeleteItem}
                      onUpdateTitle={updateMenuItem}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div />
                  {section.items.slice(3).map((item) => (
                    <MenuCardWithControls
                      key={item.id}
                      item={item}
                      sectionId={section.id}
                      isEditMode={isEditMode}
                      isAdmin={isAdmin}
                      onOpen={() => {
                        setSelectedItem(item);
                        setImageIndex(0);
                      }}
                      onDelete={handleDeleteItem}
                      onUpdateTitle={updateMenuItem}
                    />
                  ))}
                  <div />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((item) => (
                  <MenuCardWithControls
                    key={item.id}
                    item={item}
                    sectionId={section.id}
                    isEditMode={isEditMode}
                    isAdmin={isAdmin}
                    onOpen={() => {
                      setSelectedItem(item);
                      setImageIndex(0);
                    }}
                    onDelete={handleDeleteItem}
                    onUpdateTitle={updateMenuItem}
                  />
                ))}
              </div>
            )}
          </section>
        ))}

        <Modal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          imageIndex={imageIndex}
          setImageIndex={setImageIndex}
          isEditMode={isEditMode}
          onUpdate={updateMenuItem} // Pass the update function instead of fetchMenuData
        />
      </div>
    </>
  );
}

// Enhanced MenuCard with Edit Controls
function MenuCardWithControls({
  item,
  sectionId,
  isEditMode,
  isAdmin,
  onOpen,
  onDelete,
  onUpdateTitle,
}: {
  item: MenuItem;
  sectionId: string;
  isEditMode: boolean;
  isAdmin: boolean;
  onOpen: () => void;
  onDelete: (itemId: string) => void;
  onUpdateTitle: (updatedItem: MenuItem) => void; // Changed type
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [itemTitle, setItemTitle] = useState(item.title);

  const handleUpdateTitle = async () => {
    if (!itemTitle.trim() || itemTitle === item.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      // OPTIMISTIC UPDATE: Create updated item
      const updatedItem = { ...item, title: itemTitle };
      
      // Update parent state immediately
      onUpdateTitle(updatedItem);
      setIsEditingTitle(false);
      
      // Save to database
      const { error } = await supabase
        .from("menu_items")
        .update({ title: itemTitle } as never)
        .eq("id", item.id);

      if (error) throw error;
      
    } catch (err: any) {
      console.error("Error updating item title:", err);
      
      // ROLLBACK: Revert local state on error
      setItemTitle(item.title);
      alert("Failed to update title: " + err.message);
      
      // Notify parent to refresh data
      onUpdateTitle(item);
    }
  };

  // Default image if no images
  const imageUrl = item.images?.[0] || "/TestPic.png";

  return (
    <div className="relative group">
      {/* Edit Controls Overlay */}
      {isEditMode && isAdmin && (
        <div className="absolute -top-2 -right-2 z-30 flex space-x-1">
          <button
            onClick={() => setIsEditingTitle(true)}
            className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
            title="Edit title"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md"
            title="Delete item"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          {item.images && item.images.length > 0 && (
            <div className="p-1.5 bg-gray-600 text-white rounded-full flex items-center space-x-1">
              <ImageIcon className="w-3 h-3" />
              <span className="text-xs">{item.images.length}</span>
            </div>
          )}
        </div>
      )}

      {/* Title Editor */}
      {isEditingTitle && (
        <div className="mb-2 z-40 relative">
          <input
            type="text"
            value={itemTitle}
            onChange={(e) => setItemTitle(e.target.value)}
            className="w-full px-3 py-1 border-2 border-[#F68A3A] rounded-lg text-center font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F68A3A] bg-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUpdateTitle();
              if (e.key === 'Escape') {
                setItemTitle(item.title);
                setIsEditingTitle(false);
              }
            }}
            onBlur={handleUpdateTitle}
            autoFocus
          />
        </div>
      )}

      <button
        onClick={onOpen}
        className={`relative w-full h-44 bg-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition focus:outline-none font-din ${
          isEditMode ? 'cursor-pointer' : 'cursor-pointer'
        }`}
        aria-label={`Open ${item.title}`}
      >
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className={`absolute inset-0 transition ${
            isEditMode ? 'bg-white/40 group-hover:bg-white/20' : 'bg-white/60 group-hover:bg-white/40'
          }`} />
        </div>

        <div className="absolute top-4 left-4 right-4">
          <div className="bg-[#F5F5F5] px-3 py-1 rounded-full text-xs font-semibold text-gray-700 inline-block font-din">
            Lunch/Dinner Menu
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg text-center font-bold text-gray-800 font-din">
            {itemTitle}
          </div>
        </div>
      </button>
    </div>
  );
}