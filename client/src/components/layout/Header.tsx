import React from "react";
import { Link, useLocation } from "wouter";
import SearchBar from "@/components/search/SearchBar";
import CategoryNav from "@/components/layout/CategoryNav";

const Header: React.FC = () => {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
          <Link href="/">
            <a className="text-primary font-bold text-2xl mr-2 flex items-center">
              <i className="ri-shopping-bag-line mr-2"></i>
              <span>ProductSphere</span>
            </a>
          </Link>
        </div>
        
        <SearchBar />
        
        <div className="flex items-center mt-4 md:mt-0">
          <button className="md:ml-4 p-2 text-dark-light hover:text-primary">
            <i className="ri-heart-line text-2xl"></i>
          </button>
          <button className="ml-2 p-2 text-dark-light hover:text-primary">
            <i className="ri-shopping-cart-line text-2xl"></i>
          </button>
          <button className="ml-2 p-2 text-dark-light hover:text-primary">
            <i className="ri-user-line text-2xl"></i>
          </button>
        </div>
      </div>
      
      <CategoryNav />
    </header>
  );
};

export default Header;
