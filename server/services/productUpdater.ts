import { db } from '../db';
import { products, productRetailers, type InsertProduct, type InsertProductRetailer } from '../../shared/schema';
import { eq, and, not, inArray } from 'drizzle-orm';

/**
 * ProductUpdater service
 * 
 * This service is responsible for updating product information from external sources
 * It can be scheduled to run at regular intervals or triggered manually
 */
export class ProductUpdater {
  // List of supported retailers
  private retailers = [
    'Apple Store',
    'Amazon',
    'Best Buy',
    'Walmart',
    'Target',
    'Newegg',
    'B&H Photo',
    'Adorama'
  ];

  // Maps retailer to their API endpoints or scraping methods
  private retailerApiMap: Record<string, string> = {
    'Apple Store': 'https://api.apple.com/products',
    'Amazon': 'https://api.amazon.com/products', 
    'Best Buy': 'https://api.bestbuy.com/products',
    'Walmart': 'https://api.walmart.com/products',
    'Target': 'https://api.target.com/products',
    'Newegg': 'https://api.newegg.com/products',
    'B&H Photo': 'https://api.bhphotovideo.com/products',
    'Adorama': 'https://api.adorama.com/products'
  };

  /**
   * Mock method to fetch the latest products from external APIs or websites
   * In a real implementation, this would connect to actual retailer APIs or use web scraping
   */
  private async fetchLatestProductsFromRetailer(retailer: string): Promise<{
    products: InsertProduct[];
    retailers: InsertProductRetailer[];
  }> {
    // In a real implementation, this would fetch real data from APIs
    // Here we just create some mock new products based on the retailer
    
    // This is just a simulation of new data being available
    const getRandomInt = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const getRandomPrice = (min: number, max: number) => {
      return parseFloat((Math.random() * (max - min) + min).toFixed(2));
    };

    const categories = ['electronics', 'home_kitchen', 'fashion', 'sports'];
    const brands = ['Apple', 'Samsung', 'Sony', 'LG', 'Nike', 'Dyson', 'Bose', 'Google'];

    // Generate random products based on retailer
    const mockProducts: InsertProduct[] = [];
    const mockRetailers: InsertProductRetailer[] = [];

    // Generate 1-3 new products
    const numProducts = getRandomInt(1, 3);
    
    for (let i = 0; i < numProducts; i++) {
      const brand = brands[getRandomInt(0, brands.length - 1)];
      const category = categories[getRandomInt(0, categories.length - 1)];
      const productNum = getRandomInt(1000, 9999);
      const price = getRandomPrice(100, 2000);
      
      // Create new product
      const newProduct: InsertProduct = {
        name: `${brand} ${category.charAt(0).toUpperCase() + category.slice(1)} Pro ${productNum}`,
        description: `The latest ${brand} product with cutting-edge features and technologies. Newly arrived at ${retailer}.`,
        brand,
        category,
        price,
        originalPrice: price * 1.2,
        currency: 'USD',
        rating: getRandomInt(35, 50) / 10, // Rating between 3.5 and 5.0
        reviewCount: getRandomInt(10, 2000),
        inStock: Math.random() > 0.1, // 90% chance of being in stock
        freeShipping: Math.random() > 0.3, // 70% chance of free shipping
        images: [
          `https://source.unsplash.com/random/800x600?${brand.toLowerCase()},${category}`,
        ],
        specifications: {
          keyFeatures: [
            'Latest generation processor',
            'Enhanced display',
            'Improved battery life',
            'Premium design and materials'
          ],
          dimensions: '5.7 x 2.8 x 0.3 inches',
          weight: '6.1 ounces',
          manufacturer: brand
        }
      };
      
      mockProducts.push(newProduct);
    }

    return {
      products: mockProducts,
      retailers: mockRetailers
    };
  }

  /**
   * Checks and retrieves new product arrivals
   * Returns an array of new products
   */
  public async checkForNewArrivals(): Promise<{
    newProducts: (InsertProduct & { id: number })[];
    retailerUpdates: InsertProductRetailer[];
  }> {
    console.log('🔍 Checking for new product arrivals...');
    
    // Get all retailer APIs we want to check
    const retailersToCheck = this.retailers.slice(0, 3); // Limit to 3 retailers for demo
    const newProductsData = await Promise.all(
      retailersToCheck.map(retailer => this.fetchLatestProductsFromRetailer(retailer))
    );
    
    // Flatten results
    const fetchedProducts = newProductsData.flatMap(data => data.products);
    const fetchedRetailers = newProductsData.flatMap(data => data.retailers);
    
    // Get existing product names to avoid duplicates
    const existingProducts = await db.select({
      name: products.name
    }).from(products);
    
    const existingNames = new Set(existingProducts.map(p => p.name));
    
    // Filter out products that already exist
    const uniqueNewProducts = fetchedProducts.filter(p => !existingNames.has(p.name));
    
    if (uniqueNewProducts.length === 0) {
      console.log('No new products found');
      return { newProducts: [], retailerUpdates: [] };
    }
    
    // Insert new products into the database
    console.log(`Found ${uniqueNewProducts.length} new products`);
    const insertedProducts = await db.insert(products)
      .values(uniqueNewProducts)
      .returning();
    
    // Create retailer entries for new products
    const retailerUpdates: InsertProductRetailer[] = [];
    
    for (const product of insertedProducts) {
      for (const retailer of this.retailers.slice(0, 3)) { // Choose 1-3 random retailers
        if (Math.random() > 0.3) { // 70% chance for a retailer to have this product
          retailerUpdates.push({
            productId: product.id,
            retailerName: retailer,
            retailerLogo: `https://www.${retailer.toLowerCase().replace(/\s+/g, '')}.com/favicon.ico`,
            price: product.price * (0.9 + Math.random() * 0.2), // Price varies 90-110% of base price
            currency: 'USD',
            availability: Math.random() > 0.2 ? 'In Stock' : 'Out of Stock',
            url: `https://www.${retailer.toLowerCase().replace(/\s+/g, '')}.com/product/${product.id}`
          });
        }
      }
    }
    
    // Insert retailer data
    if (retailerUpdates.length > 0) {
      await db.insert(productRetailers).values(retailerUpdates);
    }
    
    console.log(`✅ Added ${insertedProducts.length} new products with ${retailerUpdates.length} retailer entries`);
    
    return {
      newProducts: insertedProducts,
      retailerUpdates
    };
  }

  /**
   * Updates prices for existing products
   * In a real system, this would fetch the latest prices from retailers
   */
  public async updateProductPrices(): Promise<number> {
    console.log('💰 Updating product prices...');
    
    // Get all product retailers
    const allRetailers = await db.select().from(productRetailers);
    
    // Randomly update prices for some retailers (30% chance)
    const retailersToUpdate = allRetailers.filter(() => Math.random() > 0.7);
    
    if (retailersToUpdate.length === 0) {
      console.log('No price updates needed');
      return 0;
    }
    
    // Apply price updates
    let updateCount = 0;
    
    for (const retailer of retailersToUpdate) {
      // Random price adjustment (-10% to +10%)
      const priceAdjustment = 0.9 + Math.random() * 0.2;
      const newPrice = retailer.price * priceAdjustment;
      
      await db.update(productRetailers)
        .set({ 
          price: newPrice,
          updatedAt: new Date()
        })
        .where(eq(productRetailers.id, retailer.id));
      
      updateCount++;
    }
    
    console.log(`✅ Updated prices for ${updateCount} retailers`);
    return updateCount;
  }

  /**
   * Updates product availability
   * In a real system, this would check stock status from retailers
   */
  public async updateProductAvailability(): Promise<number> {
    console.log('📦 Updating product availability...');
    
    // Get all product retailers
    const allRetailers = await db.select().from(productRetailers);
    
    // Randomly update availability for some retailers (20% chance)
    const retailersToUpdate = allRetailers.filter(() => Math.random() > 0.8);
    
    if (retailersToUpdate.length === 0) {
      console.log('No availability updates needed');
      return 0;
    }
    
    // Apply availability updates
    let updateCount = 0;
    
    for (const retailer of retailersToUpdate) {
      // Toggle between "In Stock" and "Out of Stock"
      const newAvailability = retailer.availability === 'In Stock' ? 'Out of Stock' : 'In Stock';
      
      await db.update(productRetailers)
        .set({ 
          availability: newAvailability,
          updatedAt: new Date()
        })
        .where(eq(productRetailers.id, retailer.id));
      
      updateCount++;
    }
    
    console.log(`✅ Updated availability for ${updateCount} retailers`);
    return updateCount;
  }

  /**
   * Runs a full update cycle, checking for new products and updating existing ones
   */
  public async runFullUpdate(): Promise<{
    newProducts: number;
    priceUpdates: number;
    availabilityUpdates: number;
  }> {
    // Check for new arrivals
    const { newProducts } = await this.checkForNewArrivals();
    
    // Update prices
    const priceUpdates = await this.updateProductPrices();
    
    // Update availability
    const availabilityUpdates = await this.updateProductAvailability();
    
    return {
      newProducts: newProducts.length,
      priceUpdates,
      availabilityUpdates
    };
  }
}