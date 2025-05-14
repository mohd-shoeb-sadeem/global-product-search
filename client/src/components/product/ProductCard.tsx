import React from "react";
import { Link } from "wouter";
import { CardHover } from "@/components/ui/card-hover";
import { StarRating } from "@/components/ui/star-rating";
import { type Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  return (
    <div className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-4 mb-8 ${className}`}>
      <CardHover
        header={
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-48 object-cover"
          />
        }
        footer={
          <button 
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
            onClick={() => {
              // Don't use Link component here to prevent event propagation conflicts
              window.location.href = `/product/${product.id}`;
            }}
          >
            View Details
          </button>
        }
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-sm text-gray-mid">{product.category}</p>
          </div>
          <div className="bg-success text-white text-xs font-bold px-2 py-1 rounded">
            {product.rating?.toFixed(1)} ★
          </div>
        </div>
        
        <div className="mt-2">
          <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-mid line-through ml-2">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <div className="text-xs">
            <span className={`${product.inStock ? 'text-success' : 'text-warning'} font-medium`}>
              {product.inStock ? 'In Stock' : 'Low Stock'}
            </span>
            <span className="text-gray-mid"> • {product.freeShipping ? 'Free Shipping' : 'Shipping Available'}</span>
          </div>
          <button className="text-primary">
            <i className="ri-heart-line"></i>
          </button>
        </div>
      </CardHover>
    </div>
  );
};

export default ProductCard;
