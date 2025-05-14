import { pgTable, text, serial, integer, boolean, jsonb, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
});

// Product pricing across retailers
export const productRetailers = pgTable("product_retailers", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  retailerName: text("retailer_name").notNull(),
  retailerLogo: text("retailer_logo"),
  price: real("price").notNull(),
  currency: text("currency").notNull().default("USD"),
  availability: text("availability"),
  url: text("url").notNull(),
});

// Product reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  source: text("source").notNull(),
  sourceLogo: text("source_logo"),
  rating: real("rating").notNull(),
  maxRating: real("max_rating").notNull().default(5),
  content: text("content").notNull(),
  author: text("author"),
  url: text("url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Video reviews
export const videoReviews = pgTable("video_reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  platform: text("platform").notNull(),
  videoId: text("video_id").notNull(),
  thumbnail: text("thumbnail").notNull(),
  title: text("title").notNull(),
  channelName: text("channel_name").notNull(),
  channelAvatar: text("channel_avatar"),
  viewCount: integer("view_count"),
  description: text("description"),
  url: text("url").notNull(),
});

// Insert schemas
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertProductRetailerSchema = createInsertSchema(productRetailers).omit({
  id: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertVideoReviewSchema = createInsertSchema(videoReviews).omit({
  id: true,
});

// Types
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertProductRetailer = z.infer<typeof insertProductRetailerSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertVideoReview = z.infer<typeof insertVideoReviewSchema>;

export type Product = typeof products.$inferSelect;
export type ProductRetailer = typeof productRetailers.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type VideoReview = typeof videoReviews.$inferSelect;

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
});

export type ProductSearch = z.infer<typeof productSearchSchema>;
