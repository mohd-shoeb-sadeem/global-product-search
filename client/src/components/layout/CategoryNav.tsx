import React from "react";
import { Link, useLocation } from "wouter";

interface Category {
  name: string;
  path: string;
}

const categories: Category[] = [
  { name: "All", path: "/" },
  { name: "Electronics", path: "/search?category=electronics" },
  { name: "Home & Kitchen", path: "/search?category=home_kitchen" },
  { name: "Fashion", path: "/search?category=fashion" },
  { name: "Beauty", path: "/search?category=beauty" },
  { name: "Sports", path: "/search?category=sports" },
  { name: "Books", path: "/search?category=books" },
  { name: "Toys & Games", path: "/search?category=toys" },
  { name: "Health", path: "/search?category=health" },
  { name: "Automotive", path: "/search?category=automotive" },
];

const CategoryNav: React.FC = () => {
  const [location] = useLocation();

  return (
    <nav className="border-t border-gray-light overflow-x-auto">
      <div className="container mx-auto px-4">
        <ul className="flex space-x-6 py-2 whitespace-nowrap">
          {categories.map((category, index) => {
            const isActive = 
              (category.path === "/" && location === "/") ||
              (category.path !== "/" && location.startsWith(category.path));
            
            return (
              <li 
                key={index} 
                className={`
                  ${isActive 
                    ? "text-primary border-b-2 border-primary font-medium" 
                    : "text-dark-light hover:text-primary"
                  }
                `}
              >
                <Link href={category.path}>
                  <a className="px-1 py-2 inline-block">{category.name}</a>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default CategoryNav;
