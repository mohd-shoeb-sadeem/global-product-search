import React, { useState } from "react";
import ProductDetails from "@/components/product/ProductDetails";
import { type Product } from "@shared/schema";

interface DetailsTabsProps {
  product: Product;
  videoUrl?: string;
}

type TabType = "overview" | "specifications" | "reviews" | "videos" | "compare" | "qa";

const DetailsTabs: React.FC<DetailsTabsProps> = ({ product, videoUrl }) => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <ProductDetails product={product} videoUrl={videoUrl} />;
      case "specifications":
        return (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications as Record<string, any>)
                .filter(([key]) => !["keyFeatures", "inBox"].includes(key))
                .map(([key, value], index) => (
                  <div key={index} className="border-b pb-2">
                    <span className="font-medium">{key}: </span>
                    <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                  </div>
                ))
              }
            </div>
          </div>
        );
      case "reviews":
      case "videos":
      case "compare":
      case "qa":
        return (
          <div className="p-6 text-center">
            <p className="text-gray-500">This tab is coming soon.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border-t border-gray-light">
      <div className="flex overflow-x-auto">
        <button 
          className={`px-6 py-4 font-medium whitespace-nowrap ${
            activeTab === "overview" 
              ? "text-primary border-b-2 border-primary" 
              : "text-gray-mid hover:text-primary"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button 
          className={`px-6 py-4 font-medium whitespace-nowrap ${
            activeTab === "specifications" 
              ? "text-primary border-b-2 border-primary" 
              : "text-gray-mid hover:text-primary"
          }`}
          onClick={() => setActiveTab("specifications")}
        >
          Specifications
        </button>
        <button 
          className={`px-6 py-4 font-medium whitespace-nowrap ${
            activeTab === "reviews" 
              ? "text-primary border-b-2 border-primary" 
              : "text-gray-mid hover:text-primary"
          }`}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
        </button>
        <button 
          className={`px-6 py-4 font-medium whitespace-nowrap ${
            activeTab === "videos" 
              ? "text-primary border-b-2 border-primary" 
              : "text-gray-mid hover:text-primary"
          }`}
          onClick={() => setActiveTab("videos")}
        >
          Videos
        </button>
        <button 
          className={`px-6 py-4 font-medium whitespace-nowrap ${
            activeTab === "compare" 
              ? "text-primary border-b-2 border-primary" 
              : "text-gray-mid hover:text-primary"
          }`}
          onClick={() => setActiveTab("compare")}
        >
          Compare
        </button>
        <button 
          className={`px-6 py-4 font-medium whitespace-nowrap ${
            activeTab === "qa" 
              ? "text-primary border-b-2 border-primary" 
              : "text-gray-mid hover:text-primary"
          }`}
          onClick={() => setActiveTab("qa")}
        >
          Q&A
        </button>
      </div>
      
      {renderTabContent()}
    </div>
  );
};

export default DetailsTabs;
