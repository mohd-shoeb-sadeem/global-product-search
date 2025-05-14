import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: {
    src: string;
    alt: string;
  }[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images.length) {
    return (
      <div className={cn("bg-gray-100 rounded-lg flex items-center justify-center", className)}>
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        <img
          src={images[selectedIndex].src}
          alt={images[selectedIndex].alt}
          className="w-full h-auto rounded-lg"
        />
        <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md">
          <button className="text-primary hover:text-secondary transition-colors">
            <i className="ri-heart-line text-xl"></i>
          </button>
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <img
              key={index}
              src={image.src}
              alt={image.alt}
              className={cn(
                "w-full h-16 object-cover rounded-md cursor-pointer border-2",
                selectedIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-primary"
              )}
              onClick={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
