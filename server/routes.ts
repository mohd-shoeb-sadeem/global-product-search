import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage/index";
import { z } from "zod";
import { productSearchSchema } from "@shared/schema";

// API routes
import { searchProducts, getSearchSuggestions } from "./api/search";
import { 
  getProduct, 
  getFeaturedProducts, 
  getSimilarProducts,
  getProductRetailers,
  getProductReviews,
  getProductVideoReview
} from "./api/products";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const apiRouter = express.Router();
  
  // Search routes
  apiRouter.get('/search', async (req, res) => {
    try {
      const queryParams = req.query;
      const parsedParams = productSearchSchema.parse({
        query: queryParams.query || "",
        category: queryParams.category,
        minPrice: queryParams.minPrice ? Number(queryParams.minPrice) : undefined,
        maxPrice: queryParams.maxPrice ? Number(queryParams.maxPrice) : undefined,
        rating: queryParams.rating ? Number(queryParams.rating) : undefined,
        brand: queryParams.brand,
        inStock: queryParams.inStock === "true" ? true : undefined,
        page: queryParams.page ? Number(queryParams.page) : 1,
        limit: queryParams.limit ? Number(queryParams.limit) : 20,
      });
      
      const results = await searchProducts(parsedParams);
      res.json(results);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid search parameters", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to search products" });
      }
    }
  });

  apiRouter.get('/search/suggestions', async (req, res) => {
    try {
      const query = req.query.q as string || "";
      if (query.length < 2) {
        return res.json([]);
      }
      
      const suggestions = await getSearchSuggestions(query);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get search suggestions" });
    }
  });

  // Product routes
  apiRouter.get('/products/featured', async (req, res) => {
    try {
      const products = await getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get featured products" });
    }
  });

  apiRouter.get('/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to get product" });
    }
  });

  apiRouter.get('/products/:id/retailers', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const retailers = await getProductRetailers(id);
      res.json(retailers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get product retailers" });
    }
  });

  apiRouter.get('/products/:id/reviews', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const reviews = await getProductReviews(id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to get product reviews" });
    }
  });

  apiRouter.get('/products/:id/video-review', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const videoReview = await getProductVideoReview(id);
      if (!videoReview) {
        return res.status(404).json({ message: "No video review found" });
      }
      
      res.json(videoReview);
    } catch (error) {
      res.status(500).json({ message: "Failed to get product video review" });
    }
  });

  apiRouter.get('/products/:id/similar', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const similarProducts = await getSimilarProducts(id);
      res.json(similarProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get similar products" });
    }
  });

  // Mount API router
  app.use('/api', apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
