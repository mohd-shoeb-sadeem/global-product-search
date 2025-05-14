import React from "react";
import { CardHover } from "@/components/ui/card-hover";
import { StarRating } from "@/components/ui/star-rating";
import { type Product } from "@shared/schema";

interface SimilarProductCardProps {
  product: Product;
  onCompare?: (id: number) => void;
}

const SimilarProductCard: React.FC<SimilarProductCardProps> = ({ product, onCompare }) => {
  return (
    <div className="min-w-[250px] w-64 mr-4">
      <CardHover
        className="h-full flex flex-col"
        header={
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-32 object-cover"
          />
        }
        footer={
          <button 
            className="w-full bg-primary/10 text-primary py-2 rounded-lg hover:bg-primary/20 transition-colors"
            onClick={() => onCompare && onCompare(product.id)}
          >
            Compare
          </button>
        }
      >
        <div className="flex-grow">
          <h3 className="font-semibold">{product.name}</h3>
          <div className="flex items-center mt-1 mb-2">
            <StarRating rating={product.rating || 0} size="xs" />
            <span className="text-xs text-gray-mid ml-1">{product.rating?.toFixed(1)}</span>
          </div>
          <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
        </div>
      </CardHover>
    </div>
  );
};

export default SimilarProductCard;
