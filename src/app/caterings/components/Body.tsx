"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Modal from "./Modal";

export interface MenuItem {
  id: string;
  title: string;
  images: string[];
  soup?: string;
  salads?: string;
  hot?: string;
  desserts?: string;
}

const MENU_SECTIONS: {
  label: string;
  items: MenuItem[];
}[] = [
  {
    label: "Set A",
    items: [
      {
        id: "A-1",
        title: "A-1",
        images: ["/TestPic.png", "/TestPic.png", "/TestPic.png"],
        soup:
          "A comforting clear soup with seasonal vegetables and a hint of herbs.",
        salads:
          "Fresh mixed greens, cherry tomatoes, and a light citrus vinaigrette.",
        hot: "Garlic-buttered chicken, roasted vegetables, and house rice.",
        desserts: "Mini cheesecake with caramel drizzle.",
      },
      { id: "A-2", title: "A-2", images: ["/TestPic.png", "/TestPic.png", "/TestPic.png"] },
      { id: "A-3", title: "A-3", images: ["/TestPic.png", "/TestPic.png", "/TestPic.png"] },
    ],
  },
  {
    label: "Set B",
    items: [
      { id: "B-1", title: "B-1", images: ["/TestPic.png", "/TestPic.png", "/TestPic.png"] },
      { id: "B-2", title: "B-2", images: ["/TestPic.png", "/TestPic.png", "/TestPic.png"] },
      { id: "B-3", title: "B-3", images: ["/TestPic.png", "/TestPic.png", "/TestPic.png"] },
    ],
  },
  {
    label: "Set C",
    items: [
      { id: "C-1", title: "C-1", images: ["/TestPic.png", "/TestPic.png", "/TestPic.png"] },
      { id: "C-2", title: "C-2", images: ["/TestPic.png", "/TestPic.png", "/TestPic.png"] },
      { id: "C-3", title: "C-3", images: ["/TestPic.png", "/TestPic.png", "/TestPic.png"] },
    ],
  },
  {
    label: "Buffet Setup Menu",
    items: [
      { id: "Buffet-1", title: "Buffet A", images: ["/TestPic.png", "/TestPic.png", "/TestPic.png"] },
      { id: "Buffet-2", title: "Buffet B", images: ["/TestPic.png", "/TestPic.png", "/TestPic.png"] },
      { id: "Buffet-3", title: "Buffet C", images: ["/TestPic.png", "/TestPic.png", "/TestPic.png"] },
      { id: "Buffet-4", title: "Buffet D", images: ["/TestPic.png", "/TestPic.png", "/TestPic.png"] },
      { id: "Buffet-5", title: "Buffet E", images: ["/TestPic.png", "/TestPic.png", "/TestPic.png"] },
    ],
  },
  {
    label: "List of Addons",
    items: [
      { id: "Addon-1", title: "Addon 1", images: ["/TestPic.png", "/TestPic.png", "/TestPic.png"] },
      { id: "Addon-2", title: "Addon 2", images: ["/TestPic.png", "/TestPic.png", "/TestPic.png"] },
      { id: "Addon-3", title: "Addon 3", images: ["/TestPic.png", "/TestPic.png", "/TestPic.png"] },
    ],
  },
];

export default function Body() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [imageIndex, setImageIndex] = useState<number>(0);

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

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto font-din">
      {MENU_SECTIONS.map((section) => (
        <section key={section.label} className="mb-12">
          <h2 className="font-din text-2xl font-bold mb-3 text-black">
            {section.label}
          </h2>

          <div className="w-full h-7 bg-[#E6E6E6] rounded-full mb-4 flex items-center px-3 text-sm text-gray-700 font-din">
            Lunch/Dinner Menu
          </div>

          {section.label === "Buffet Setup Menu" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.slice(0, 3).map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    onOpen={() => {
                      setSelectedItem(item);
                      setImageIndex(0);
                    }}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div />
                {section.items.slice(3).map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    onOpen={() => {
                      setSelectedItem(item);
                      setImageIndex(0);
                    }}
                  />
                ))}
                <div />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onOpen={() => {
                    setSelectedItem(item);
                    setImageIndex(0);
                  }}
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
      />
    </div>
  );
}

function MenuCard({
  item,
  onOpen,
}: {
  item: MenuItem;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="group relative w-full h-44 bg-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition focus:outline-none font-din"
      aria-label={`Open ${item.title}`}
    >
      <div className="absolute inset-0">
        <Image
          src={item.images[0]}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-white/60 group-hover:bg-white/40 transition" />
      </div>

      <div className="absolute top-4 left-4 right-4">
        <div className="bg-[#F5F5F5] px-3 py-1 rounded-full text-xs font-semibold text-gray-700 inline-block font-din">
          Lunch/Dinner Menu
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg text-center font-bold text-gray-800 font-din">
          {item.title}
        </div>
      </div>
    </button>
  );
}
