"use client";

import Image from "next/image";

export default function Options() {
  const items = [
    "Event Catering",
    "Event Venues",
    "Others",
    "Party Trays & Packed Meals",
    "Giveaway Baskets",
  ];

  return (
    <section className="w-full py-14 overflow-visible">
      {/* WRAPPER MUST ALLOW OVERFLOW */}
      <div className="relative max-w-6xl mx-auto px-6 overflow-visible">

        {/* Orange Container */}
        <div className="relative bg-[#F48221] rounded-[10px] py-4 px-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-white overflow-visible">

          {/* --- BLOB IMAGES --- */}

          {/* TOP-LEFT BLOB */}
          <Image
            src="/images/Blob.png"
            alt="Decorative Blob"
            width={80}
            height={150}
            className="absolute -top-10 -left-10 z-0 pointer-events-none select-none"
            draggable="false"
          />

          {/* BOTTOM-RIGHT BLOB */}
          <Image
            src="/images/Blob.png"
            alt="Decorative Blob"
            width={80}
            height={100}
            className="absolute -bottom-10 -right-10 rotate-180 z-0 pointer-events-none select-none"
            draggable="false"
          />

          {/* Content (on top of blobs) */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between w-full gap-6">

            {/* Heading */}
            <h3 className="md:ml-30 text-4xl font-extrabold leading-tight drop-shadow-sm">
              What are you <br /> looking for?
            </h3>

            {/* Buttons - CHANGED: Removed md:justify-end to align left */}
            <div className="flex flex-wrap gap-3 md:w-[55%]">
              {items.map((item, i) => (
                <button
                  key={i}
                  className="bg-white text-[#F48221] px-5 py-3 rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-100 transition whitespace-nowrap"
                >
                  {item}
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}