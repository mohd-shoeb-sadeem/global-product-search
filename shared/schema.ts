import { pgTable, text, serial, integer, boolean, jsonb, real, timestamp, varchar, date, uniqueIndex, primaryKey, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  wishlist: many(wishlistItems),
  cart: many(cartItems),
  orders: many(orders),
  reviews: many(userReviews),
  comparisons: many(productComparisons),
}));

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  brand: text("brand").notNull(),
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  currency: text("currency").notNull().default("USD"),
  rating: real("rating"),
  reviewCount: integer("review_count"),
  inStock: boolean("in_stock").notNull().default(true),
  freeShipping: boolean("free_shipping").notNull().default(false),
  images: text("images").array().notNull(),
  specifications: jsonb("specifications").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Product relations
export const productsRelations = relations(products, ({ many, one }) => ({
  retailers: many(productRetailers),
  reviews: many(reviews),
  videoReviews: many(videoReviews),
  socialMediaPosts: many(socialMediaPosts),
  newsArticles: many(newsArticles),
  wishlistedBy: many(wishlistItems),
  inCartOf: many(cartItems),
  comparisons: many(productComparisons),
}));

// Product pricing across retailers
export const productRetailers = pgTable("product_retailers", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  retailerName: text("retailer_name").notNull(),
  retailerLogo: text("retailer_logo"),
  price: real("price").notNull(),
  currency: text("currency").notNull().default("USD"),
  availability: text("availability"),
  url: text("url").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Product retailer relations
export const productRetailersRelations = relations(productRetailers, ({ one }) => ({
  product: one(products, {
    fields: [productRetailers.productId],
    references: [products.id],
  }),
}));

// Expert product reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  source: text("source").notNull(),
  sourceLogo: text("source_logo"),
  rating: real("rating").notNull(),
  maxRating: real("max_rating").notNull().default(5),
  content: text("content").notNull(),
  author: text("author"),
  url: text("url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Review relations
export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

// Video reviews
export const videoReviews = pgTable("video_reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  platform: text("platform").notNull(),
  videoId: text("video_id").notNull(),
  thumbnail: text("thumbnail").notNull(),
  title: text("title").notNull(),
  channelName: text("channel_name").notNull(),
  channelAvatar: text("channel_avatar"),
  viewCount: integer("view_count"),
  likeCount: integer("like_count"),
  commentCount: integer("comment_count"),
  shareCount: integer("share_count"),
  channelSubscriberCount: integer("channel_subscriber_count"),
  duration: integer("duration"), // in seconds
  videoQuality: real("video_quality"), // score from 1-5
  publishedAt: timestamp("published_at"),
  description: text("description"),
  url: text("url").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Video review relations
export const videoReviewsRelations = relations(videoReviews, ({ one }) => ({
  product: one(products, {
    fields: [videoReviews.productId],
    references: [products.id],
  }),
}));

// Social media posts related to products
export const socialMediaPosts = pgTable("social_media_posts", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  platform: text("platform").notNull(), // e.g., Twitter, Instagram, TikTok
  postId: text("post_id").notNull(),
  author: text("author").notNull(),
  authorUsername: text("author_username").notNull(),
  authorAvatar: text("author_avatar"),
  content: text("content").notNull(),
  sentiment: text("sentiment"), // positive, negative, neutral
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  views: integer("views").default(0),
  saves: integer("saves").default(0),
  authorFollowerCount: integer("author_follower_count"),
  verified: boolean("verified").default(false),
  postedAt: timestamp("posted_at").notNull(),
  images: text("images").array(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  retrievedAt: timestamp("retrieved_at").notNull().defaultNow(),
});

// Social media post relations
export const socialMediaPostsRelations = relations(socialMediaPosts, ({ one }) => ({
  product: one(products, {
    fields: [socialMediaPosts.productId],
    references: [products.id],
  }),
}));

// News articles about products
export const newsArticles = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  source: text("source").notNull(),
  sourceLogo: text("source_logo"),
  author: text("author"),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  url: text("url").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  retrievedAt: timestamp("retrieved_at").notNull().defaultNow(),
});

// News article relations
export const newsArticlesRelations = relations(newsArticles, ({ one }) => ({
  product: one(products, {
    fields: [newsArticles.productId],
    references: [products.id],
  }),
}));

// User wishlist items
export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

// Wishlist item relations
export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  user: one(users, {
    fields: [wishlistItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
}));

// User cart items
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer("quantity").notNull().default(1),
  addedAt: timestamp("added_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Cart item relations
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// User reviews
export const userReviews = pgTable("user_reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  rating: integer("rating").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  images: text("images").array(),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User review relations
export const userReviewsRelations = relations(userReviews, ({ one }) => ({
  user: one(users, {
    fields: [userReviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [userReviews.productId],
    references: [products.id],
  }),
}));

// Product comparisons
export const productComparisons = pgTable("product_comparisons", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  title: text("title"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Product comparison items (join table)
export const productComparisonItems = pgTable("product_comparison_items", {
  comparisonId: integer("comparison_id").notNull().references(() => productComparisons.id, { onDelete: 'cascade' }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  addedAt: timestamp("added_at").notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.comparisonId, table.productId] }),
  };
});

// Product comparison relations
export const productComparisonsRelations = relations(productComparisons, ({ one, many }) => ({
  user: one(users, {
    fields: [productComparisons.userId],
    references: [users.id],
  }),
  items: many(productComparisonItems),
}));

// Product comparison items relations
export const productComparisonItemsRelations = relations(productComparisonItems, ({ one }) => ({
  comparison: one(productComparisons, {
    fields: [productComparisonItems.comparisonId],
    references: [productComparisons.id],
  }),
  product: one(products, {
    fields: [productComparisonItems.productId],
    references: [products.id],
  }),
}));

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered, cancelled
  total: real("total").notNull(),
  currency: text("currency").notNull().default("USD"),
  shippingAddress: jsonb("shipping_address").notNull(),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer("product_id").notNull().references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
  currency: text("currency").notNull().default("USD"),
  retailerName: text("retailer_name").notNull(),
  retailerUrl: text("retailer_url").notNull(),
});

// Order relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

// Order item relations
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// Sessions table for authentication
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp("expires_at").notNull(),
});

// Session relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductRetailerSchema = createInsertSchema(productRetailers).omit({
  id: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertVideoReviewSchema = createInsertSchema(videoReviews).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialMediaPostSchema = createInsertSchema(socialMediaPosts).omit({
  id: true,
  retrievedAt: true,
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({
  id: true,
  retrievedAt: true,
});

export const insertWishlistItemSchema = createInsertSchema(wishlistItems).omit({
  id: true,
  addedAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  addedAt: true,
  updatedAt: true,
});

export const insertUserReviewSchema = createInsertSchema(userReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductComparisonSchema = createInsertSchema(productComparisons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertSessionSchema = createInsertSchema(sessions);

// Types
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertProductRetailer = z.infer<typeof insertProductRetailerSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertVideoReview = z.infer<typeof insertVideoReviewSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSocialMediaPost = z.infer<typeof insertSocialMediaPostSchema>;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type InsertUserReview = z.infer<typeof insertUserReviewSchema>;
export type InsertProductComparison = z.infer<typeof insertProductComparisonSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type Product = typeof products.$inferSelect;
export type ProductRetailer = typeof productRetailers.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type VideoReview = typeof videoReviews.$inferSelect;
export type User = typeof users.$inferSelect;
export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;
export type NewsArticle = typeof newsArticles.$inferSelect;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type UserReview = typeof userReviews.$inferSelect;
export type ProductComparison = typeof productComparisons.$inferSelect;
export type ProductComparisonItem = typeof productComparisonItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Session = typeof sessions.$inferSelect;

// Product search schema
export const productSearchSchema = z.object({
  query: z.string().min(1),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  rating: z.number().optional(),
  brand: z.string().optional(),
  inStock: z.boolean().optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(20),
  sortBy: z.enum(['relevance', 'price_low', 'price_high', 'rating', 'newest']).optional().default('relevance'),
});

export type ProductSearch = z.infer<typeof productSearchSchema>;

// User login schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type Login = z.infer<typeof loginSchema>;

// User registration schema
export const registerSchema = loginSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export type Register = z.infer<typeof registerSchema>;
