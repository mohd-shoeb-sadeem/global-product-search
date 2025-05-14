import { 
  products, type Product, type InsertProduct,
  productRetailers, type ProductRetailer, type InsertProductRetailer,
  reviews, type Review, type InsertReview,
  videoReviews, type VideoReview, type InsertVideoReview,
  type ProductSearch
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // Product methods
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(ids: number[]): Promise<Product[]>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  searchProducts(params: ProductSearch): Promise<{
    products: Product[];
    total: number;
    brands: string[];
    priceRange: { min: number; max: number };
  }>;
  
  // Product retailers
  getProductRetailers(productId: number): Promise<ProductRetailer[]>;
  
  // Reviews
  getProductReviews(productId: number): Promise<Review[]>;
  
  // Video reviews
  getProductVideoReview(productId: number): Promise<VideoReview | undefined>;
  
  // Similar products
  getSimilarProducts(productId: number, limit?: number): Promise<Product[]>;

  // Search suggestions
  getSearchSuggestions(query: string): Promise<string[]>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private productRetailers: Map<number, ProductRetailer[]>;
  private reviews: Map<number, Review[]>;
  private videoReviews: Map<number, VideoReview>;
  private productIdCounter: number;
  private retailerIdCounter: number;
  private reviewIdCounter: number;
  private videoReviewIdCounter: number;

  constructor() {
    this.products = new Map();
    this.productRetailers = new Map();
    this.reviews = new Map();
    this.videoReviews = new Map();
    this.productIdCounter = 1;
    this.retailerIdCounter = 1;
    this.reviewIdCounter = 1;
    this.videoReviewIdCounter = 1;

    // Initialize with demo products
    this.initializeData();
  }

  // Products
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(ids: number[]): Promise<Product[]> {
    return ids
      .map(id => this.products.get(id))
      .filter((product): product is Product => !!product);
  }

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    // Return the most recent products as featured
    const allProducts = Array.from(this.products.values());
    
    // Sort by rating (highest first)
    allProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    return allProducts.slice(0, limit);
  }

  async searchProducts(params: ProductSearch): Promise<{
    products: Product[];
    total: number;
    brands: string[];
    priceRange: { min: number; max: number };
  }> {
    const allProducts = Array.from(this.products.values());
    
    // Apply filters
    let filteredProducts = allProducts.filter(product => {
      // Full-text search on name, description, and brand
      if (params.query) {
        const query = params.query.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDescription = product.description.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        
        if (!matchesName && !matchesDescription && !matchesBrand) {
          return false;
        }
      }
      
      // Category filter
      if (params.category && product.category !== params.category) {
        return false;
      }
      
      // Price range filter
      if (params.minPrice !== undefined && product.price < params.minPrice) {
        return false;
      }
      
      if (params.maxPrice !== undefined && product.price > params.maxPrice) {
        return false;
      }
      
      // Brand filter
      if (params.brand && product.brand !== params.brand) {
        return false;
      }
      
      // Rating filter
      if (params.rating !== undefined && (product.rating || 0) < params.rating) {
        return false;
      }
      
      // In stock filter
      if (params.inStock !== undefined && product.inStock !== params.inStock) {
        return false;
      }
      
      return true;
    });
    
    // Calculate total before pagination
    const total = filteredProducts.length;
    
    // Extract unique brands
    const brands = [...new Set(allProducts.map(product => product.brand))];
    
    // Calculate price range
    const prices = allProducts.map(product => product.price);
    const priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
    
    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;
    
    filteredProducts = filteredProducts.slice(offset, offset + limit);
    
    return {
      products: filteredProducts,
      total,
      brands,
      priceRange
    };
  }
  
  // Product retailers
  async getProductRetailers(productId: number): Promise<ProductRetailer[]> {
    return this.productRetailers.get(productId) || [];
  }
  
  // Reviews
  async getProductReviews(productId: number): Promise<Review[]> {
    return this.reviews.get(productId) || [];
  }
  
  // Video reviews
  async getProductVideoReview(productId: number): Promise<VideoReview | undefined> {
    return this.videoReviews.get(productId);
  }
  
  // Similar products
  async getSimilarProducts(productId: number, limit = 5): Promise<Product[]> {
    const product = await this.getProduct(productId);
    if (!product) {
      return [];
    }
    
    // Find products in the same category
    const allProducts = Array.from(this.products.values())
      .filter(p => p.id !== productId && p.category === product.category);
    
    // Sort by similarity (same brand first, then by price)
    allProducts.sort((a, b) => {
      // Same brand gets priority
      if (a.brand === product.brand && b.brand !== product.brand) {
        return -1;
      }
      if (a.brand !== product.brand && b.brand === product.brand) {
        return 1;
      }
      
      // Then sort by price similarity
      const aPriceDiff = Math.abs(a.price - product.price);
      const bPriceDiff = Math.abs(b.price - product.price);
      return aPriceDiff - bPriceDiff;
    });
    
    return allProducts.slice(0, limit);
  }

  // Search suggestions
  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const lowercaseQuery = query.toLowerCase();
    const matchingProducts = Array.from(this.products.values())
      .filter(product => 
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.brand.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery)
      );
    
    // Generate suggestions based on product names, brands, and categories
    const suggestions = new Set<string>();
    
    matchingProducts.forEach(product => {
      // Add product name suggestions
      if (product.name.toLowerCase().includes(lowercaseQuery)) {
        suggestions.add(product.name);
      }
      
      // Add brand + category suggestions
      if (product.brand.toLowerCase().includes(lowercaseQuery) || 
          product.category.toLowerCase().includes(lowercaseQuery)) {
        suggestions.add(`${product.brand} ${product.category}`);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  }

  // Helper method to initialize storage with sample data
  private initializeData() {
    // Sample products
    const sampleProducts: InsertProduct[] = [
      {
        name: "iPhone 13 Pro Max",
        description: "The iPhone 13 Pro Max features a 6.7-inch Super Retina XDR display with ProMotion technology for a faster, more responsive feel. It's powered by the A15 Bionic chip, the world's fastest smartphone chip.",
        brand: "Apple",
        category: "electronics",
        price: 1099.00,
        originalPrice: 1299.00,
        currency: "USD",
        rating: 4.8,
        reviewCount: 2345,
        inStock: true,
        freeShipping: true,
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1591815302525-756a9bcc3425?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
        ],
        specifications: {
          keyFeatures: [
            "6.7-inch Super Retina XDR display with ProMotion",
            "A15 Bionic chip with 5-core GPU",
            "Pro camera system with 12MP Telephoto, Wide, and Ultra Wide",
            "Up to 28 hours of video playback",
            "Ceramic Shield, tougher than any smartphone glass",
            "IP68 water resistance",
            "5G capable for faster downloads and streaming"
          ],
          inBox: {
            "iPhone with iOS 15": true,
            "USB-C to Lightning Cable": true,
            "Power Adapter": false,
            "EarPods": false
          },
          display: "6.7-inch Super Retina XDR",
          processor: "A15 Bionic",
          storage: "128GB/256GB/512GB/1TB",
          camera: "12MP Pro camera system",
          battery: "Up to 28 hours video playback"
        }
      },
      {
        name: "Samsung Galaxy S21 Ultra",
        description: "The Samsung Galaxy S21 Ultra features a Dynamic AMOLED 2X display with adaptive 120Hz refresh rate and a pro-grade camera system with 100x Space Zoom.",
        brand: "Samsung",
        category: "electronics",
        price: 999.99,
        originalPrice: 1199.99,
        currency: "USD",
        rating: 4.7,
        reviewCount: 1867,
        inStock: true,
        freeShipping: true,
        images: [
          "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1618478594486-c65b899c4936?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
        ],
        specifications: {
          keyFeatures: [
            "6.8-inch Dynamic AMOLED 2X display with 120Hz refresh rate",
            "Exynos 2100 / Snapdragon 888 processor",
            "108MP quad camera with 100x Space Zoom",
            "5000mAh battery with 25W fast charging",
            "IP68 water and dust resistance",
            "S Pen support"
          ],
          inBox: {
            "Galaxy S21 Ultra": true,
            "USB-C Cable": true,
            "Power Adapter": false,
            "Galaxy Buds": false
          },
          display: "6.8-inch Dynamic AMOLED 2X",
          processor: "Exynos 2100 / Snapdragon 888",
          storage: "128GB/256GB/512GB",
          camera: "108MP quad camera system",
          battery: "5000mAh"
        }
      },
      {
        name: "Sony WH-1000XM4",
        description: "Industry-leading noise cancellation with dual noise sensor technology. Next-level music with Edge-AI and DSEE Extreme upscaling. Up to 30-hour battery life with quick charging.",
        brand: "Sony",
        category: "electronics",
        price: 348.00,
        originalPrice: 399.99,
        currency: "USD",
        rating: 4.8,
        reviewCount: 1523,
        inStock: true,
        freeShipping: true,
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
        ],
        specifications: {
          keyFeatures: [
            "Industry-leading noise cancellation",
            "DSEE Extreme audio upscaling",
            "30-hour battery life",
            "Speak-to-chat technology",
            "Touch sensor controls",
            "Wearing detection"
          ],
          inBox: {
            "WH-1000XM4 Headphones": true,
            "Carrying Case": true,
            "USB-C Cable": true,
            "Audio Cable": true
          },
          driver: "40mm, dome type",
          frequency: "4Hz-40,000Hz",
          battery: "30 hours (NC ON), 38 hours (NC OFF)",
          weight: "254g"
        }
      },
      {
        name: "Apple Watch Series 7",
        description: "The largest, most advanced Always-on Retina display with crack-resistant front crystal. Measure your blood oxygen with a powerful sensor and app. Take an ECG anytime, anywhere.",
        brand: "Apple",
        category: "electronics",
        price: 499.00,
        originalPrice: null,
        currency: "USD",
        rating: 4.9,
        reviewCount: 987,
        inStock: true,
        freeShipping: true,
        images: [
          "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
        ],
        specifications: {
          keyFeatures: [
            "Always-On Retina LTPO OLED display",
            "Blood oxygen and ECG sensors",
            "Water resistant 50 meters",
            "Up to 18 hours of battery life",
            "S7 SiP with 64-bit dual-core processor",
            "GPS + Cellular models available"
          ],
          inBox: {
            "Apple Watch Series 7": true,
            "Magnetic Charging Cable": true,
            "Sport Band": true,
            "Power Adapter": false
          },
          display: "41mm or 45mm Retina LTPO OLED",
          processor: "S7 SiP",
          storage: "32GB",
          connectivity: "Wi-Fi, Bluetooth 5.0, NFC, LTE (optional)",
          battery: "Up to 18 hours"
        }
      },
      {
        name: "MacBook Pro 14\"",
        description: "The new MacBook Pro delivers game-changing performance with M1 Pro or M1 Max, the first Apple silicon designed for pros. Choose the 14-inch model for portable power.",
        brand: "Apple",
        category: "electronics",
        price: 1999.00,
        originalPrice: null,
        currency: "USD",
        rating: 4.7,
        reviewCount: 734,
        inStock: true,
        freeShipping: true,
        images: [
          "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
        ],
        specifications: {
          keyFeatures: [
            "14.2-inch Liquid Retina XDR display",
            "Apple M1 Pro or M1 Max chip",
            "Up to 64GB unified memory",
            "Up to 8TB SSD storage",
            "Up to 17 hours of battery life",
            "1080p FaceTime HD camera"
          ],
          inBox: {
            "14-inch MacBook Pro": true,
            "USB-C to MagSafe 3 Cable": true,
            "140W USB-C Power Adapter": true
          },
          display: "14.2-inch Liquid Retina XDR",
          processor: "M1 Pro or M1 Max",
          memory: "16GB/32GB/64GB unified memory",
          storage: "512GB/1TB/2TB/4TB/8TB SSD",
          battery: "Up to 17 hours TV app movie playback"
        }
      },
      {
        name: "DJI Mavic Air 2",
        description: "A powerful camera drone with 48MP photos, 4K/60fps video, 8K Hyperlapse, and a maximum flight time of 34 minutes. Perfect for aerial photography and videography.",
        brand: "DJI",
        category: "electronics",
        price: 799.00,
        originalPrice: 988.00,
        currency: "USD",
        rating: 4.6,
        reviewCount: 526,
        inStock: false,
        freeShipping: true,
        images: [
          "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1600262606369-50c865406f7f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
        ],
        specifications: {
          keyFeatures: [
            "1/2\" CMOS sensor, 48MP photos",
            "4K/60fps video, 8K Hyperlapse",
            "OcuSync 2.0 transmission up to 10km",
            "34-minute maximum flight time",
            "Advanced pilot assistance systems (APAS) 3.0",
            "FocusTrack subject tracking modes"
          ],
          inBox: {
            "Mavic Air 2 Aircraft": true,
            "Remote Controller": true,
            "Battery": true,
            "Battery Charger": true,
            "Propellers (pair)": true,
            "Control Sticks (pair)": true
          },
          camera: "1/2\" CMOS, 48MP",
          video: "4K/60fps, 1080p/240fps",
          range: "10km OcuSync 2.0",
          battery: "3500mAh, 34-minute flight time",
          weight: "570g"
        }
      },
      {
        name: "Google Pixel 6 Pro",
        description: "Google's flagship smartphone with a custom-built Google Tensor processor, an advanced camera system with a 50MP main camera, and a 6.7-inch LTPO display with a 120Hz refresh rate.",
        brand: "Google",
        category: "electronics",
        price: 899.00,
        originalPrice: null,
        currency: "USD",
        rating: 4.2,
        reviewCount: 453,
        inStock: true,
        freeShipping: true,
        images: [
          "https://images.unsplash.com/photo-1634148540042-89688d4559a8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1635869137793-bffcc14b833f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
        ],
        specifications: {
          keyFeatures: [
            "6.7-inch LTPO OLED display with 120Hz",
            "Google Tensor processor",
            "50MP wide, 12MP ultrawide, 48MP telephoto cameras",
            "11MP front camera",
            "5003mAh battery with fast wireless charging",
            "Android 12 with 3 years of OS updates"
          ],
          inBox: {
            "Pixel 6 Pro": true,
            "1m USB-C to USB-C Cable": true,
            "Quick Start Guide": true,
            "Power Adapter": false,
            "SIM Tool": true
          },
          display: "6.7-inch LTPO OLED, 120Hz",
          processor: "Google Tensor",
          storage: "128GB/256GB/512GB",
          camera: "50MP main, 12MP ultrawide, 48MP telephoto",
          battery: "5003mAh"
        }
      },
      {
        name: "Nintendo Switch OLED Model",
        description: "The Nintendo Switch OLED Model features a vibrant 7-inch OLED screen, a wide adjustable stand, enhanced audio, and 64GB of internal storage.",
        brand: "Nintendo",
        category: "electronics",
        price: 349.99,
        originalPrice: null,
        currency: "USD",
        rating: 4.5,
        reviewCount: 312,
        inStock: true,
        freeShipping: true,
        images: [
          "https://images.unsplash.com/photo-1627856013862-3635008b1b77?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
        ],
        specifications: {
          keyFeatures: [
            "7-inch OLED screen",
            "Wide adjustable stand",
            "Wired LAN port in dock",
            "64GB internal storage",
            "Enhanced audio",
            "3 play modes: TV, tabletop, handheld"
          ],
          inBox: {
            "Nintendo Switch OLED console": true,
            "Nintendo Switch dock": true,
            "Joy-Con (L) and Joy-Con (R)": true,
            "Joy-Con wrist straps": true,
            "Joy-Con grip": true,
            "HDMI cable": true,
            "AC adapter": true
          },
          display: "7-inch OLED",
          storage: "64GB (expandable)",
          battery: "4.5-9 hours",
          connectivity: "Wi-Fi, Bluetooth, Wired LAN (dock)"
        }
      }
    ];

    // Add products to storage
    sampleProducts.forEach((productData) => {
      const product: Product = {
        ...productData,
        id: this.productIdCounter++,
        createdAt: new Date()
      };
      
      this.products.set(product.id, product);
    });

    // Add retailers for first product (iPhone 13 Pro Max)
    const iPhone13RetailerData: InsertProductRetailer[] = [
      {
        productId: 1,
        retailerName: "Apple",
        retailerLogo: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32",
        price: 1099.00,
        currency: "USD",
        availability: "In Stock",
        url: "https://www.apple.com/shop/buy-iphone/iphone-13-pro"
      },
      {
        productId: 1,
        retailerName: "Amazon",
        retailerLogo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32",
        price: 1079.00,
        currency: "USD",
        availability: "In Stock",
        url: "https://www.amazon.com/iPhone-13-Pro-Max"
      },
      {
        productId: 1,
        retailerName: "Best Buy",
        retailerLogo: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32",
        price: 1099.00,
        currency: "USD",
        availability: "In Stock",
        url: "https://www.bestbuy.com/site/iphone-13-pro-max"
      }
    ];

    // Add reviews for first product (iPhone 13 Pro Max)
    const iPhone13ReviewData: InsertReview[] = [
      {
        productId: 1,
        source: "The Verge",
        sourceLogo: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32",
        rating: 9,
        maxRating: 10,
        content: "The iPhone 13 Pro Max's battery life is the best we've seen in a flagship phone. If that's your priority, look no further.",
        author: "Nilay Patel",
        url: "https://www.theverge.com/iPhone-13-Pro-Max-review"
      },
      {
        productId: 1,
        source: "TechRadar",
        sourceLogo: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32",
        rating: 4.5,
        maxRating: 5,
        content: "The camera improvements make this a must-have for mobile photographers and videographers.",
        author: "Lance Ulanoff",
        url: "https://www.techradar.com/iPhone-13-Pro-Max-review"
      },
      {
        productId: 1,
        source: "CNET",
        sourceLogo: "https://images.unsplash.com/photo-1581905764498-f1b60bae941a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32",
        rating: 8.7,
        maxRating: 10,
        content: "ProMotion, enhanced cameras, and incredible battery life make this the best iPhone ever.",
        author: "Patrick Holland",
        url: "https://www.cnet.com/iPhone-13-Pro-Max-review"
      }
    ];

    // Add video review for first product (iPhone 13 Pro Max)
    const iPhone13VideoReviewData: InsertVideoReview = {
      productId: 1,
      platform: "YouTube",
      videoId: "XKfgdkcIUxw",
      thumbnail: "https://images.unsplash.com/photo-1606041011872-596597976b25?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=450",
      title: "iPhone 13 Pro Max Review: The Perfect Phone!",
      channelName: "MKBHD",
      channelAvatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48",
      viewCount: 8200000,
      description: "The iPhone 13 Pro Max is a serious step up. The cameras are significantly better, the display is gorgeous with ProMotion, and battery life is simply incredible. Is it worth the price?",
      url: "https://www.youtube.com/watch?v=XKfgdkcIUxw"
    };

    // Add retailers for iPhone
    const retailersArray: ProductRetailer[] = iPhone13RetailerData.map(retailerData => ({
      ...retailerData,
      id: this.retailerIdCounter++
    }));
    this.productRetailers.set(1, retailersArray);

    // Add reviews for iPhone
    const reviewsArray: Review[] = iPhone13ReviewData.map(reviewData => ({
      ...reviewData,
      id: this.reviewIdCounter++,
      createdAt: new Date()
    }));
    this.reviews.set(1, reviewsArray);

    // Add video review for iPhone
    const videoReview: VideoReview = {
      ...iPhone13VideoReviewData,
      id: this.videoReviewIdCounter++
    };
    this.videoReviews.set(1, videoReview);

    // Repeat for a few more products
    // Add some retailers for Samsung Galaxy S21 Ultra
    const samsungRetailerData: InsertProductRetailer[] = [
      {
        productId: 2,
        retailerName: "Samsung",
        retailerLogo: "https://images.unsplash.com/photo-1535615615570-3b839f4359be?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32",
        price: 999.99,
        currency: "USD",
        availability: "In Stock",
        url: "https://www.samsung.com/us/mobile/galaxy-s21-ultra-5g"
      },
      {
        productId: 2,
        retailerName: "Amazon",
        retailerLogo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32",
        price: 979.99,
        currency: "USD",
        availability: "In Stock",
        url: "https://www.amazon.com/Samsung-Galaxy-S21-Ultra-5G"
      }
    ];

    // Add the Samsung retailers
    const samsungRetailersArray: ProductRetailer[] = samsungRetailerData.map(retailerData => ({
      ...retailerData,
      id: this.retailerIdCounter++
    }));
    this.productRetailers.set(2, samsungRetailersArray);

    // Add some reviews for Sony headphones
    const sonyReviewData: InsertReview[] = [
      {
        productId: 3,
        source: "RTings",
        sourceLogo: "https://images.unsplash.com/photo-1585184394271-4c0a47dc59c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32",
        rating: 4.4,
        maxRating: 5,
        content: "The Sony WH-1000XM4 are better headphones than the Sony WH-1000XM3 but the difference isn't night and day.",
        author: "RTings Team",
        url: "https://www.rtings.com/headphones/reviews/sony/wh-1000xm4-wireless"
      },
      {
        productId: 3,
        source: "TechRadar",
        sourceLogo: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32",
        rating: 5,
        maxRating: 5,
        content: "The Sony WH-1000XM4 deliver excellent noise-cancellation and surprising sound quality all in a lightweight, comfortable design.",
        author: "Nick Pino",
        url: "https://www.techradar.com/reviews/sony-wh-1000xm4"
      }
    ];

    // Add the Sony reviews
    const sonyReviewsArray: Review[] = sonyReviewData.map(reviewData => ({
      ...reviewData,
      id: this.reviewIdCounter++,
      createdAt: new Date()
    }));
    this.reviews.set(3, sonyReviewsArray);
  }
}

export const storage = new MemStorage();
