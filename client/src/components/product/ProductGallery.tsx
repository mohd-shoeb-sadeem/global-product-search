import React from "react";
import { ImageGallery } from "@/components/ui/image-gallery";

interface ProductGalleryProps {
  images: {
    src: string;
    alt: string;
  }[];
  className?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, className }) => {
  return (
    <div className={`md:w-1/2 px-4 mb-6 md:mb-0 ${className}`}>
      <ImageGallery images={images} />
    </div>
  );
};

export default ProductGallery;
