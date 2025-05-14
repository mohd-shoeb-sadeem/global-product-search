import React from "react";
import { VideoPlayer } from "@/components/ui/video-player";
import { type Product } from "@shared/schema";

interface ProductDetailsProps {
  product: Product;
  videoUrl?: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, videoUrl }) => {
  const specifications = product.specifications as Record<string, any>;
  
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">Product Description</h3>
          <div className="text-dark-light space-y-4">
            {product.description.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          {specifications?.keyFeatures && (
            <>
              <h4 className="font-semibold mt-6 mb-2">Key Features</h4>
              <ul className="list-disc pl-5 text-dark-light space-y-1">
                {(specifications.keyFeatures as string[]).map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </>
          )}
        </div>
        
        <div>
          {videoUrl ? (
            <div className="rounded-lg overflow-hidden shadow-lg">
              <VideoPlayer 
                url={videoUrl} 
                title={`${product.name} Product Video`}
              />
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-500 flex items-center justify-center h-[240px]">
              <p>No product video available</p>
            </div>
          )}
          
          {specifications?.inBox && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">What's in the box</h4>
              <ul className="text-dark-light space-y-2">
                {Object.entries(specifications.inBox as Record<string, boolean>).map(([item, included], index) => (
                  <li key={index} className="flex items-center">
                    {included ? (
                      <i className="ri-checkbox-circle-line text-success mr-2"></i>
                    ) : (
                      <i className="ri-close-circle-line text-error mr-2"></i>
                    )}
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
