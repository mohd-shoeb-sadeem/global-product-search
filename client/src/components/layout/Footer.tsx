import React from "react";
import { Link } from "wouter";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-light">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-primary font-bold text-xl mb-4 flex items-center">
              <i className="ri-shopping-bag-line mr-2"></i>
              <span>ProductSphere</span>
            </div>
            <p className="text-gray-mid mb-4">
              Your complete guide to products from around the world. Search, compare, and make informed decisions.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-mid hover:text-primary">
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a href="#" className="text-gray-mid hover:text-primary">
                <i className="ri-twitter-fill text-xl"></i>
              </a>
              <a href="#" className="text-gray-mid hover:text-primary">
                <i className="ri-instagram-fill text-xl"></i>
              </a>
              <a href="#" className="text-gray-mid hover:text-primary">
                <i className="ri-youtube-fill text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><Link href="/search?category=electronics"><a className="text-gray-mid hover:text-primary">Electronics</a></Link></li>
              <li><Link href="/search?category=fashion"><a className="text-gray-mid hover:text-primary">Fashion</a></Link></li>
              <li><Link href="/search?category=home_kitchen"><a className="text-gray-mid hover:text-primary">Home & Kitchen</a></Link></li>
              <li><Link href="/search?category=beauty"><a className="text-gray-mid hover:text-primary">Beauty & Personal Care</a></Link></li>
              <li><Link href="/search?category=sports"><a className="text-gray-mid hover:text-primary">Sports & Outdoors</a></Link></li>
              <li><Link href="/search?category=toys"><a className="text-gray-mid hover:text-primary">Toys & Games</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-mid hover:text-primary">About Us</a></li>
              <li><a href="#" className="text-gray-mid hover:text-primary">Contact</a></li>
              <li><a href="#" className="text-gray-mid hover:text-primary">Careers</a></li>
              <li><a href="#" className="text-gray-mid hover:text-primary">Blog</a></li>
              <li><a href="#" className="text-gray-mid hover:text-primary">Press</a></li>
              <li><a href="#" className="text-gray-mid hover:text-primary">Affiliates</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-mid hover:text-primary">Terms of Service</a></li>
              <li><a href="#" className="text-gray-mid hover:text-primary">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-mid hover:text-primary">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-mid hover:text-primary">Data Processing</a></li>
              <li><a href="#" className="text-gray-mid hover:text-primary">GDPR Compliance</a></li>
              <li><a href="#" className="text-gray-mid hover:text-primary">Accessibility</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-light mt-8 pt-8 text-center text-gray-mid">
          <p>© {new Date().getFullYear()} ProductSphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
