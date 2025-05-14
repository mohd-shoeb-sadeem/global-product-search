import { 
  type Product, type InsertProduct,
  type ProductRetailer, type InsertProductRetailer,
  type Review, type InsertReview,
  type VideoReview, type InsertVideoReview,
  type ProductSearch,
  type SocialMediaPost, type InsertSocialMediaPost,
  type NewsArticle, type InsertNewsArticle,
  type User, type InsertUser,
  type WishlistItem,
  type CartItem,
  type UserReview, type InsertUserReview,
  type ProductComparison,
  type Order, type InsertOrder,
  type OrderItem,
  type Session
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
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  
  // Product retailers
  getProductRetailers(productId: number): Promise<ProductRetailer[]>;
  createProductRetailer(retailer: InsertProductRetailer): Promise<ProductRetailer>;
  
  // Reviews
  getProductReviews(productId: number): Promise<Review[]>;
  createProductReview(review: InsertReview): Promise<Review>;
  
  // Video reviews
  getProductVideoReview(productId: number): Promise<VideoReview | undefined>;
  createVideoReview(videoReview: InsertVideoReview): Promise<VideoReview>;
  
  // Similar products
  getSimilarProducts(productId: number, limit?: number): Promise<Product[]>;

  // Search suggestions
  getSearchSuggestions(query: string): Promise<string[]>;
  
  // Social media posts
  getProductSocialMediaPosts(productId: number, limit?: number): Promise<SocialMediaPost[]>;
  createSocialMediaPost(post: InsertSocialMediaPost): Promise<SocialMediaPost>;
  
  // News articles
  getProductNewsArticles(productId: number, limit?: number): Promise<NewsArticle[]>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  
  // User methods
  createUser(userData: Omit<InsertUser, "passwordHash"> & { password: string }): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  validateUserCredentials(email: string, password: string): Promise<User | null>;
  
  // User wishlist
  getUserWishlist(userId: number): Promise<(WishlistItem & { product: Product })[]>;
  addToWishlist(userId: number, productId: number): Promise<WishlistItem>;
  removeFromWishlist(userId: number, productId: number): Promise<void>;
  
  // User cart
  getUserCart(userId: number): Promise<(CartItem & { product: Product })[]>;
  addToCart(userId: number, productId: number, quantity?: number): Promise<CartItem>;
  updateCartItemQuantity(cartItemId: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(cartItemId: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
  
  // User reviews
  getUserReviews(userId: number): Promise<UserReview[]>;
  getProductUserReviews(productId: number): Promise<UserReview[]>;
  createUserReview(review: InsertUserReview): Promise<UserReview>;
  
  // Product comparisons
  createComparison(userId: number | null, title?: string): Promise<ProductComparison>;
  addProductToComparison(comparisonId: number, productId: number): Promise<void>;
  removeProductFromComparison(comparisonId: number, productId: number): Promise<void>;
  getComparison(comparisonId: number): Promise<(ProductComparison & { products: Product[] }) | undefined>;
  getUserComparisons(userId: number): Promise<ProductComparison[]>;
  
  // Orders
  createOrder(orderData: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]): Promise<Order>;
  getUserOrders(userId: number): Promise<Order[]>;
  getOrderDetails(orderId: number): Promise<(Order & { items: OrderItem[] }) | undefined>;
  updateOrderStatus(orderId: number, status: string): Promise<Order | undefined>;
  
  // Sessions
  createSession(sessionId: string, userId: number, expiresAt: Date): Promise<Session>;
  getSessionById(sessionId: string): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<void>;
}