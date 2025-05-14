import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage/index";
import { z } from "zod";
import { productSearchSchema } from "@shared/schema";
import { ProductUpdater } from "./services/productUpdater";
import { WebSocketService, MessageType } from "./services/websocketService";

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

  // Product update routes
  apiRouter.post('/products/update-check', async (req, res) => {
    try {
      const productUpdater = new ProductUpdater();
      const updateResults = await productUpdater.checkForNewArrivals();
      
      res.json({
        success: true,
        newProducts: updateResults.newProducts.length,
        newRetailers: updateResults.retailerUpdates.length,
        message: `Found ${updateResults.newProducts.length} new products with ${updateResults.retailerUpdates.length} retailer entries`
      });
    } catch (error) {
      console.error('Error checking for product updates:', error);
      res.status(500).json({ message: 'Failed to check for product updates' });
    }
  });

  apiRouter.post('/products/update-prices', async (req, res) => {
    try {
      const productUpdater = new ProductUpdater();
      const updatedCount = await productUpdater.updateProductPrices();
      
      res.json({
        success: true,
        updatedPrices: updatedCount,
        message: `Updated prices for ${updatedCount} retailers`
      });
    } catch (error) {
      console.error('Error updating product prices:', error);
      res.status(500).json({ message: 'Failed to update product prices' });
    }
  });

  apiRouter.post('/products/update-availability', async (req, res) => {
    try {
      const productUpdater = new ProductUpdater();
      const updatedCount = await productUpdater.updateProductAvailability();
      
      res.json({
        success: true,
        updatedAvailability: updatedCount,
        message: `Updated availability for ${updatedCount} retailers`
      });
    } catch (error) {
      console.error('Error updating product availability:', error);
      res.status(500).json({ message: 'Failed to update product availability' });
    }
  });

  apiRouter.post('/products/update-all', async (req, res) => {
    try {
      const productUpdater = new ProductUpdater();
      const results = await productUpdater.runFullUpdate();
      
      res.json({
        success: true,
        newProducts: results.newProducts,
        updatedPrices: results.priceUpdates,
        updatedAvailability: results.availabilityUpdates,
        message: `Added ${results.newProducts} new products, updated ${results.priceUpdates} prices and ${results.availabilityUpdates} availability statuses`
      });
    } catch (error) {
      console.error('Error running full product update:', error);
      res.status(500).json({ message: 'Failed to run full product update' });
    }
  });

  // Schedule a regular update (every 60 seconds)
  // Note: In a production environment, you would use a more robust scheduling system
  apiRouter.post('/products/start-auto-updates', (req, res) => {
    // Check if updates are already running
    if (global.updateInterval) {
      clearInterval(global.updateInterval);
    }
    
    // Schedule updates (default every 60 seconds)
    const interval = req.body.interval || 60000;
    const productUpdater = new ProductUpdater();
    
    global.updateInterval = setInterval(async () => {
      try {
        console.log('Running scheduled product update...');
        const results = await productUpdater.runFullUpdate();
        console.log('Scheduled update completed:', results);
      } catch (error) {
        console.error('Error in scheduled update:', error);
      }
    }, interval);
    
    res.json({
      success: true,
      message: `Auto-updates started with interval of ${interval / 1000} seconds`
    });
  });

  apiRouter.post('/products/stop-auto-updates', (req, res) => {
    if (global.updateInterval) {
      clearInterval(global.updateInterval);
      global.updateInterval = null;
      res.json({
        success: true,
        message: 'Auto-updates stopped'
      });
    } else {
      res.json({
        success: false,
        message: 'No auto-updates were running'
      });
    }
  });

  // Mount API router
  app.use('/api', apiRouter);

  // Create HTTP server and WebSocket server
  const httpServer = createServer(app);
  
  // Initialize WebSocket service for real-time updates
  const wsService = new WebSocketService(httpServer);
  
  // Store the WebSocket service globally for use in other parts of the application
  global.wsService = wsService;
  
  return httpServer;
}
