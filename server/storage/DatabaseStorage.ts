import { 
  products, type Product, type InsertProduct,
  productRetailers, type ProductRetailer, type InsertProductRetailer,
  reviews, type Review, type InsertReview,
  videoReviews, type VideoReview, type InsertVideoReview,
  type ProductSearch,
  socialMediaPosts, type SocialMediaPost, type InsertSocialMediaPost,
  newsArticles, type NewsArticle, type InsertNewsArticle,
  users, type User, type InsertUser,
  wishlistItems, type WishlistItem, type InsertWishlistItem,
  cartItems, type CartItem, type InsertCartItem,
  userReviews, type UserReview, type InsertUserReview,
  productComparisons, type ProductComparison, type InsertProductComparison,
  productComparisonItems, type ProductComparisonItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  sessions, type Session, type InsertSession,
} from "@shared/schema";
import { db } from "../db";
import { eq, and, or, like, gte, lte, desc, asc, count, sql, inArray, isNull, not } from "drizzle-orm";
import { hash, compare } from "bcrypt";
import { IStorage } from "./IStorage";

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // Products
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProducts(ids: number[]): Promise<Product[]> {
    return db.select().from(products).where(inArray(products.id, ids));
  }

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    // Get highest rated products with review count > 10
    return db.select()
      .from(products)
      .where(
        and(
          not(isNull(products.rating)),
          gte(products.reviewCount || 0, 10)
        )
      )
      .orderBy(desc(products.rating))
      .limit(limit);
  }

  async searchProducts(params: ProductSearch): Promise<{
    products: Product[];
    total: number;
    brands: string[];
    priceRange: { min: number; max: number };
  }> {
    // Build query conditions
    const conditions = [];
    
    // Full-text search
    if (params.query) {
      const searchQuery = `%${params.query.toLowerCase()}%`;
      conditions.push(
        or(
          like(sql`LOWER(${products.name})`, searchQuery),
          like(sql`LOWER(${products.description})`, searchQuery),
          like(sql`LOWER(${products.brand})`, searchQuery),
          like(sql`LOWER(${products.category})`, searchQuery)
        )
      );
    }
    
    // Category filter
    if (params.category) {
      conditions.push(eq(products.category, params.category));
    }
    
    // Price range filter
    if (params.minPrice !== undefined) {
      conditions.push(gte(products.price, params.minPrice));
    }
    
    if (params.maxPrice !== undefined) {
      conditions.push(lte(products.price, params.maxPrice));
    }
    
    // Brand filter
    if (params.brand) {
      conditions.push(eq(products.brand, params.brand));
    }
    
    // Rating filter
    if (params.rating !== undefined) {
      conditions.push(gte(products.rating || 0, params.rating));
    }
    
    // In stock filter
    if (params.inStock !== undefined) {
      conditions.push(eq(products.inStock, params.inStock));
    }
    
    // Build query for counting total results
    const condition = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(products)
      .where(condition);
    
    const total = Number(totalResult?.count || 0);
    
    // Get all unique brands
    const brandsResult = await db
      .select({ brand: products.brand })
      .from(products)
      .groupBy(products.brand);
    
    const brands = brandsResult.map(row => row.brand);
    
    // Get price range
    const [priceRangeResult] = await db
      .select({
        min: sql<number>`MIN(${products.price})`,
        max: sql<number>`MAX(${products.price})`
      })
      .from(products);
    
    const priceRange = {
      min: priceRangeResult?.min || 0,
      max: priceRangeResult?.max || 1000
    };
    
    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;
    
    // Apply sorting
    let orderByClause;
    
    switch (params.sortBy) {
      case 'price_low':
        orderByClause = asc(products.price);
        break;
      case 'price_high':
        orderByClause = desc(products.price);
        break;
      case 'rating':
        orderByClause = desc(products.rating);
        break;
      case 'newest':
        orderByClause = desc(products.createdAt);
        break;
      case 'relevance':
      default:
        // For relevance, use a combination of factors
        if (params.query) {
          // If there's a search query, we'd prioritize exact matches in name, then brand
          // This is a simple approximation - real relevance is more complex
          orderByClause = [desc(products.rating), desc(products.reviewCount)];
        } else {
          // Without a search query, just use rating and popularity
          orderByClause = [desc(products.rating), desc(products.reviewCount)];
        }
    }
    
    // Get filtered products
    const filteredProducts = await db
      .select()
      .from(products)
      .where(condition)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);
    
    return {
      products: filteredProducts,
      total,
      brands,
      priceRange
    };
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    
    return updatedProduct;
  }
  
  // Product retailers
  async getProductRetailers(productId: number): Promise<ProductRetailer[]> {
    return db
      .select()
      .from(productRetailers)
      .where(eq(productRetailers.productId, productId));
  }

  async createProductRetailer(retailer: InsertProductRetailer): Promise<ProductRetailer> {
    const [newRetailer] = await db.insert(productRetailers).values(retailer).returning();
    return newRetailer;
  }
  
  // Reviews
  async getProductReviews(productId: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId));
  }

  async createProductReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }
  
  // Video reviews
  async getProductVideoReview(productId: number): Promise<VideoReview | undefined> {
    const [videoReview] = await db
      .select()
      .from(videoReviews)
      .where(eq(videoReviews.productId, productId));
    
    return videoReview;
  }

  async createVideoReview(videoReview: InsertVideoReview): Promise<VideoReview> {
    const [newVideoReview] = await db.insert(videoReviews).values(videoReview).returning();
    return newVideoReview;
  }
  
  // Similar products
  async getSimilarProducts(productId: number, limit = 5): Promise<Product[]> {
    const product = await this.getProduct(productId);
    if (!product) return [];
    
    // Get products in the same category
    const similarProducts = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.category, product.category),
          not(eq(products.id, productId))
        )
      )
      .limit(limit);
    
    return similarProducts;
  }

  // Search suggestions
  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const searchQuery = `%${query.toLowerCase()}%`;
    
    // Get products matching the query
    const matchingProducts = await db
      .select()
      .from(products)
      .where(
        or(
          like(sql`LOWER(${products.name})`, searchQuery),
          like(sql`LOWER(${products.brand})`, searchQuery),
          like(sql`LOWER(${products.category})`, searchQuery)
        )
      )
      .limit(10);
    
    // Generate suggestions
    const suggestions = new Set<string>();
    
    matchingProducts.forEach(product => {
      // Add product names that match
      if (product.name.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(product.name);
      }
      
      // Add brand + category combinations
      if (product.brand.toLowerCase().includes(query.toLowerCase()) || 
          product.category.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(`${product.brand} ${product.category}`);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  }
  
  // Social media posts
  async getProductSocialMediaPosts(productId: number, limit = 10): Promise<SocialMediaPost[]> {
    return db
      .select()
      .from(socialMediaPosts)
      .where(eq(socialMediaPosts.productId, productId))
      .orderBy(desc(socialMediaPosts.createdAt))
      .limit(limit);
  }

  async createSocialMediaPost(post: InsertSocialMediaPost): Promise<SocialMediaPost> {
    const [newPost] = await db.insert(socialMediaPosts).values(post).returning();
    return newPost;
  }
  
  // News articles
  async getProductNewsArticles(productId: number, limit = 10): Promise<NewsArticle[]> {
    return db
      .select()
      .from(newsArticles)
      .where(eq(newsArticles.productId, productId))
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit);
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const [newArticle] = await db.insert(newsArticles).values(article).returning();
    return newArticle;
  }
  
  // User methods
  async createUser(userData: Omit<InsertUser, "passwordHash"> & { password: string }): Promise<User> {
    const { password, ...rest } = userData;
    const passwordHash = await hash(password, 10);
    
    const [newUser] = await db
      .insert(users)
      .values({ ...rest, passwordHash })
      .returning();
    
    return newUser;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async validateUserCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const passwordMatch = await compare(password, user.passwordHash);
    return passwordMatch ? user : null;
  }
  
  // User wishlist
  async getUserWishlist(userId: number): Promise<(WishlistItem & { product: Product })[]> {
    const result = await db
      .select({
        wishlistItem: wishlistItems,
        product: products
      })
      .from(wishlistItems)
      .innerJoin(products, eq(wishlistItems.productId, products.id))
      .where(eq(wishlistItems.userId, userId));
    
    return result.map(row => ({
      ...row.wishlistItem,
      product: row.product
    }));
  }

  async addToWishlist(userId: number, productId: number): Promise<WishlistItem> {
    // Check if item already exists
    const [existingItem] = await db
      .select()
      .from(wishlistItems)
      .where(
        and(
          eq(wishlistItems.userId, userId),
          eq(wishlistItems.productId, productId)
        )
      );
    
    if (existingItem) {
      return existingItem;
    }
    
    // Add new item
    const [newItem] = await db
      .insert(wishlistItems)
      .values({ userId, productId })
      .returning();
    
    return newItem;
  }

  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    await db
      .delete(wishlistItems)
      .where(
        and(
          eq(wishlistItems.userId, userId),
          eq(wishlistItems.productId, productId)
        )
      );
  }
  
  // User cart
  async getUserCart(userId: number): Promise<(CartItem & { product: Product })[]> {
    const result = await db
      .select({
        cartItem: cartItems,
        product: products
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));
    
    return result.map(row => ({
      ...row.cartItem,
      product: row.product
    }));
  }

  async addToCart(userId: number, productId: number, quantity = 1): Promise<CartItem> {
    // Check if item already exists
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      );
    
    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({
          quantity: existingItem.quantity + quantity,
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      
      return updatedItem;
    }
    
    // Add new item
    const [newItem] = await db
      .insert(cartItems)
      .values({ userId, productId, quantity })
      .returning();
    
    return newItem;
  }

  async updateCartItemQuantity(cartItemId: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, cartItemId))
      .returning();
    
    return updatedItem;
  }

  async removeFromCart(cartItemId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }
  
  // User reviews
  async getUserReviews(userId: number): Promise<UserReview[]> {
    return db.select().from(userReviews).where(eq(userReviews.userId, userId));
  }

  async getProductUserReviews(productId: number): Promise<UserReview[]> {
    return db.select().from(userReviews).where(eq(userReviews.productId, productId));
  }

  async createUserReview(review: InsertUserReview): Promise<UserReview> {
    const [newReview] = await db.insert(userReviews).values(review).returning();
    return newReview;
  }
  
  // Product comparisons
  async createComparison(userId: number | null, title?: string): Promise<ProductComparison> {
    const [newComparison] = await db
      .insert(productComparisons)
      .values({ userId, title })
      .returning();
    
    return newComparison;
  }

  async addProductToComparison(comparisonId: number, productId: number): Promise<void> {
    // Check if product already exists in comparison
    const [existingItem] = await db
      .select()
      .from(productComparisonItems)
      .where(
        and(
          eq(productComparisonItems.comparisonId, comparisonId),
          eq(productComparisonItems.productId, productId)
        )
      );
    
    if (existingItem) return;
    
    // Add product to comparison
    await db
      .insert(productComparisonItems)
      .values({ comparisonId, productId });
  }

  async removeProductFromComparison(comparisonId: number, productId: number): Promise<void> {
    await db
      .delete(productComparisonItems)
      .where(
        and(
          eq(productComparisonItems.comparisonId, comparisonId),
          eq(productComparisonItems.productId, productId)
        )
      );
  }

  async getComparison(comparisonId: number): Promise<(ProductComparison & { products: Product[] }) | undefined> {
    // Get comparison
    const [comparison] = await db
      .select()
      .from(productComparisons)
      .where(eq(productComparisons.id, comparisonId));
    
    if (!comparison) return undefined;
    
    // Get comparison items and products
    const result = await db
      .select({
        comparisonItem: productComparisonItems,
        product: products
      })
      .from(productComparisonItems)
      .innerJoin(products, eq(productComparisonItems.productId, products.id))
      .where(eq(productComparisonItems.comparisonId, comparisonId));
    
    const comparisonProducts = result.map(row => row.product);
    
    return {
      ...comparison,
      products: comparisonProducts
    };
  }

  async getUserComparisons(userId: number): Promise<ProductComparison[]> {
    return db
      .select()
      .from(productComparisons)
      .where(eq(productComparisons.userId, userId));
  }
  
  // Orders
  async createOrder(orderData: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]): Promise<Order> {
    // Create order
    const [newOrder] = await db.insert(orders).values(orderData).returning();
    
    // Add order items
    if (items.length > 0) {
      const orderItems = items.map(item => ({
        ...item,
        orderId: newOrder.id
      }));
      
      await db.insert(orderItems).values(orderItems);
    }
    
    return newOrder;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrderDetails(orderId: number): Promise<(Order & { items: OrderItem[] }) | undefined> {
    // Get order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));
    
    if (!order) return undefined;
    
    // Get order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
    
    return {
      ...order,
      items
    };
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    
    return updatedOrder;
  }
  
  // Sessions
  async createSession(sessionId: string, userId: number, expiresAt: Date): Promise<Session> {
    const [newSession] = await db
      .insert(sessions)
      .values({ id: sessionId, userId, expiresAt })
      .returning();
    
    return newSession;
  }

  async getSessionById(sessionId: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId));
    
    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }
}