import { db } from "./db";
import { 
  products, 
  productRetailers, 
  reviews, 
  videoReviews,
  type InsertProduct,
  type InsertProductRetailer,
  type InsertReview, 
  type InsertVideoReview
} from "../shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Check if products already exist
  const existingProducts = await db.select({ count: { count: products.id } }).from(products);
  const count = Number(existingProducts[0]?.count?.count || 0);
  
  if (count > 0) {
    console.log(`Database already has ${count} products. Skipping seeding.`);
    return;
  }

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
      name: "LG C1 OLED 4K TV 65\"",
      description: "Experience breathtaking color, perfect blacks, and infinite contrast with the LG C1 OLED TV. Equipped with Dolby Vision IQ and Dolby Atmos for cinema-quality picture and sound at home.",
      brand: "LG",
      category: "electronics",
      price: 1799.99,
      originalPrice: 2499.99,
      currency: "USD",
      rating: 4.8,
      reviewCount: 1245,
      inStock: true,
      freeShipping: false,
      images: [
        "https://images.unsplash.com/photo-1593784991095-a205069470b6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
      ],
      specifications: {
        keyFeatures: [
          "65-inch 4K OLED display",
          "α9 Gen 4 AI Processor 4K",
          "Dolby Vision IQ and Dolby Atmos",
          "NVIDIA G-SYNC and FreeSync Premium",
          "webOS Smart TV",
          "4 HDMI 2.1 ports"
        ],
        inBox: {
          "65-inch LG C1 OLED TV": true,
          "Magic Remote": true,
          "Power Cable": true,
          "User Manual": true
        },
        display: "65-inch 4K OLED",
        processor: "α9 Gen 4 AI Processor 4K",
        resolution: "3840 x 2160",
        refresh_rate: "120Hz",
        connectivity: "Wi-Fi, Bluetooth, 4 HDMI, 3 USB"
      }
    },
    {
      name: "Dyson V11 Absolute",
      description: "The Dyson V11 Absolute cordless vacuum cleaner automatically optimizes suction and run time. With 60 minutes of fade-free power and an LCD screen that shows remaining run time.",
      brand: "Dyson",
      category: "home_kitchen",
      price: 599.99,
      originalPrice: 699.99,
      currency: "USD",
      rating: 4.6,
      reviewCount: 876,
      inStock: true,
      freeShipping: true,
      images: [
        "https://images.unsplash.com/photo-1558317374-067fb5f30001?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
      ],
      specifications: {
        keyFeatures: [
          "Dyson Hyperdymium motor",
          "Up to 60 minutes of run time",
          "LCD screen displays mode and remaining run time",
          "High-torque cleaner head with Dynamic Load Sensor",
          "Whole-machine filtration",
          "Transforms to handheld"
        ],
        inBox: {
          "Dyson V11 Absolute vacuum": true,
          "High Torque cleaner head": true,
          "Mini motorized tool": true,
          "Combination tool": true,
          "Crevice tool": true,
          "Wand storage clip": true,
          "Docking station": true,
          "Charger": true
        },
        weight: "6.68 lbs",
        bin_volume: "0.2 gallons",
        dimensions: "50.6 x 9.8 x 10.3 inches",
        battery: "Lithium-ion, 60 min run time"
      }
    },
    {
      name: "Nike Air Zoom Pegasus 38",
      description: "The road running workhorse with a responsive foam that gives back as much energy as you put in. Perfect for long training runs and daily wear.",
      brand: "Nike",
      category: "fashion",
      price: 120.00,
      originalPrice: null,
      currency: "USD",
      rating: 4.5,
      reviewCount: 1876,
      inStock: true,
      freeShipping: true,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
      ],
      specifications: {
        keyFeatures: [
          "Wider forefoot for more toe room",
          "Nike React foam for responsive cushioning",
          "Zoom Air unit for additional responsiveness",
          "Mesh upper enhances breathability",
          "Midfoot webbing system for a snug fit",
          "Durable rubber outsole"
        ],
        fit: "True to size",
        material: "Mesh upper, rubber outsole",
        terrain: "Road, track",
        cushioning: "Responsive",
        weight: "Approx. 10 oz (male, size 10)"
      }
    }
  ];

  // Insert products
  const productResults = await db.insert(products).values(sampleProducts).returning({ id: products.id });
  console.log(`✅ Added ${productResults.length} products`);

  // Retailers for iPhone 13 Pro Max
  const iPhone13RetailerData: InsertProductRetailer[] = [
    {
      productId: productResults[0].id,
      retailerName: "Apple Store",
      retailerLogo: "https://www.apple.com/favicon.ico",
      price: 1099.00,
      currency: "USD",
      availability: "In Stock",
      url: "https://www.apple.com/shop/buy-iphone/iphone-13-pro"
    },
    {
      productId: productResults[0].id,
      retailerName: "Amazon",
      retailerLogo: "https://www.amazon.com/favicon.ico",
      price: 1049.99,
      currency: "USD",
      availability: "In Stock",
      url: "https://www.amazon.com/dp/B09G9HD6PD"
    },
    {
      productId: productResults[0].id,
      retailerName: "Best Buy",
      retailerLogo: "https://www.bestbuy.com/favicon.ico",
      price: 1099.99,
      currency: "USD",
      availability: "In Stock",
      url: "https://www.bestbuy.com/site/apple-iphone-13-pro-max"
    }
  ];

  // Reviews for iPhone 13 Pro Max
  const iPhone13ReviewData: InsertReview[] = [
    {
      productId: productResults[0].id,
      source: "CNET",
      sourceLogo: "https://www.cnet.com/favicon.ico",
      rating: 9,
      maxRating: 10,
      content: "The iPhone 13 Pro Max is a content creation machine, from its triple-camera system with macro photography to its long battery life and ProMotion display.",
      author: "Patrick Holland",
      url: "https://www.cnet.com/reviews/apple-iphone-13-pro-max-review/"
    },
    {
      productId: productResults[0].id,
      source: "TechRadar",
      sourceLogo: "https://www.techradar.com/favicon.ico",
      rating: 4.5,
      maxRating: 5,
      content: "The iPhone 13 Pro Max isn't just the most powerful but also the longest-lasting iPhone out there. With a superb camera setup and a fantastic screen, you're only held back by the high price.",
      author: "James Peckham",
      url: "https://www.techradar.com/reviews/iphone-13-pro-max-review"
    },
    {
      productId: productResults[0].id,
      source: "The Verge",
      sourceLogo: "https://www.theverge.com/favicon.ico",
      rating: 9,
      maxRating: 10,
      content: "The iPhone 13 Pro Max might have the best smartphone camera system available today. The improvements to the display are great, and quite noticeable over previous iPhones.",
      author: "Nilay Patel",
      url: "https://www.theverge.com/22704962/apple-iphone-13-pro-max-review"
    }
  ];

  // Video review data for iPhone 13 Pro Max
  const iPhone13VideoReviewData: InsertVideoReview = {
    productId: productResults[0].id,
    platform: "YouTube",
    videoId: "XKfgdkcIUxw",
    thumbnail: "https://img.youtube.com/vi/XKfgdkcIUxw/maxresdefault.jpg",
    title: "iPhone 13 Pro Max Review: The BEST iPhone!",
    channelName: "Marques Brownlee",
    channelAvatar: "https://yt3.googleusercontent.com/ytc/AOPolaSysgBxc1ALU2hyZYSX8gZdK3e-uw-3FzjaEYJ-2g=s176-c-k-c0x00ffffff-no-rj",
    viewCount: 7800000,
    description: "The iPhone 13 Pro Max is peak iPhone. It has the best camera system, the best battery life, and the best display of any iPhone.",
    url: "https://www.youtube.com/watch?v=XKfgdkcIUxw"
  };

  // Insert retailers
  const retailerResults = await db.insert(productRetailers).values(iPhone13RetailerData).returning();
  console.log(`✅ Added ${retailerResults.length} retailers`);

  // Insert reviews
  const reviewResults = await db.insert(reviews).values(iPhone13ReviewData).returning();
  console.log(`✅ Added ${reviewResults.length} reviews`);

  // Insert video review
  const videoReviewResult = await db.insert(videoReviews).values(iPhone13VideoReviewData).returning();
  console.log(`✅ Added ${videoReviewResult.length} video reviews`);

  console.log("✅ Database seeding complete");
}

seed().catch(error => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});