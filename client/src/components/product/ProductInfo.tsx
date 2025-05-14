import React from "react";
import { StarRating } from "@/components/ui/star-rating";
import { type Product, type ProductRetailer } from "@shared/schema";

interface ProductInfoProps {
  product: Product;
  retailers?: ProductRetailer[];
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product, retailers = [] }) => {
  return (
    <div className="md:w-1/2 px-4">
      <div className="flex items-center mb-2">
        <span className="text-sm text-primary font-medium">{product.brand}</span>
        <span className="mx-2 text-gray-mid">•</span>
        <span className="text-sm text-success font-medium flex items-center">
          <i className="ri-check-line mr-1"></i> Verified Product
        </span>
      </div>
      
      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
      <p className="text-gray-mid mb-4">{product.description}</p>
      
      <div className="flex items-center mb-4">
        <StarRating rating={product.rating || 0} />
        <span className="text-gray-mid ml-2">
          {product.rating?.toFixed(1)} ({product.reviewCount || 0} reviews)
        </span>
      </div>
      
      <div className="mb-6">
        <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="text-success text-sm ml-2">
            Save ${(product.originalPrice - product.price).toFixed(2)}
          </span>
        )}
      </div>
      
      {/* This would dynamically render based on product data - simplified for demo */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Colors</h3>
        <div className="flex space-x-2">
          <button className="w-8 h-8 rounded-full bg-blue-500 ring-2 ring-offset-2 ring-blue-500"></button>
          <button className="w-8 h-8 rounded-full bg-gray-800"></button>
          <button className="w-8 h-8 rounded-full bg-yellow-700"></button>
          <button className="w-8 h-8 rounded-full bg-gray-300"></button>
        </div>
      </div>
      
      {/* This would dynamically render based on product data - simplified for demo */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Storage</h3>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 border border-gray-light rounded-lg hover:border-primary">128GB</button>
          <button className="px-4 py-2 border border-primary bg-primary/5 rounded-lg">256GB</button>
          <button className="px-4 py-2 border border-gray-light rounded-lg hover:border-primary">512GB</button>
          <button className="px-4 py-2 border border-gray-light rounded-lg hover:border-primary">1TB</button>
        </div>
      </div>
      
      {retailers.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Available at</h3>
          <div className="flex flex-wrap gap-2">
            {retailers.map((retailer, index) => (
              <div key={index} className="flex items-center border border-gray-light rounded-lg px-3 py-2">
                {retailer.retailerLogo && (
                  <img src={retailer.retailerLogo} alt={retailer.retailerName} className="w-6 h-6 mr-2" />
                )}
                <span>{retailer.retailerName}</span>
                <span className="ml-2 text-sm text-gray-mid">${retailer.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-lg font-medium">
          Buy Now
        </button>
        <button className="flex-1 border-2 border-primary text-primary hover:bg-primary/5 py-3 px-6 rounded-lg font-medium">
          Compare Prices
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;
