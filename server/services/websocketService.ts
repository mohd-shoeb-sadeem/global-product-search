import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

// WebSocket message types
export enum MessageType {
  NewProducts = 'new_products',
  PriceUpdates = 'price_updates',
  AvailabilityUpdates = 'availability_updates',
  TrendingSocialMedia = 'trending_social_media',
  TrendingVideos = 'trending_videos',
  HighEngagementContent = 'high_engagement_content',
  SystemNotification = 'system_notification'
}

// Message interface
export interface WebSocketMessage {
  type: MessageType;
  data: any;
  timestamp: number;
}

/**
 * WebSocket service for real-time updates
 */
export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();
  
  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    
    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection established');
      this.clients.add(ws);
      
      // Send welcome message
      this.sendToClient(ws, {
        type: MessageType.SystemNotification,
        data: { message: 'Connected to Product Search Engine updates' },
        timestamp: Date.now()
      });
      
      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.clients.delete(ws);
      });
      
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
    
    console.log('WebSocket server initialized');
  }
  
  /**
   * Broadcast a message to all connected clients
   */
  public broadcast(message: WebSocketMessage): void {
    const messageStr = JSON.stringify(message);
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
    
    console.log(`Broadcasted ${message.type} to ${this.clients.size} clients`);
  }
  
  /**
   * Send a message to a specific client
   */
  private sendToClient(client: WebSocket, message: WebSocketMessage): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
  
  /**
   * Broadcast new product arrivals
   */
  public broadcastNewProducts(products: any[]): void {
    this.broadcast({
      type: MessageType.NewProducts,
      data: { products, count: products.length },
      timestamp: Date.now()
    });
  }
  
  /**
   * Broadcast price updates
   */
  public broadcastPriceUpdates(count: number): void {
    this.broadcast({
      type: MessageType.PriceUpdates,
      data: { count, message: `${count} products have updated prices` },
      timestamp: Date.now()
    });
  }
  
  /**
   * Broadcast availability updates
   */
  public broadcastAvailabilityUpdates(count: number): void {
    this.broadcast({
      type: MessageType.AvailabilityUpdates,
      data: { count, message: `${count} products have updated availability` },
      timestamp: Date.now()
    });
  }

  /**
   * Broadcast trending social media posts
   */
  public broadcastTrendingSocialMedia(posts: any[]): void {
    this.broadcast({
      type: MessageType.TrendingSocialMedia,
      data: {
        count: posts.length,
        posts: posts.map(post => ({
          id: post.id,
          productId: post.productId,
          platform: post.platform,
          author: post.author,
          content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
          likes: post.likes ?? 0,
          comments: post.comments ?? 0,
          shares: post.shares ?? 0,
          views: post.views ?? 0
        })),
        message: `${posts.length} trending social media posts`
      },
      timestamp: Date.now()
    });
  }

  /**
   * Broadcast trending video reviews
   */
  public broadcastTrendingVideos(videos: any[]): void {
    this.broadcast({
      type: MessageType.TrendingVideos,
      data: {
        count: videos.length,
        videos: videos.map(video => ({
          id: video.id,
          productId: video.productId,
          platform: video.platform,
          title: video.title,
          channelName: video.channelName,
          viewCount: video.viewCount ?? 0,
          likeCount: video.likeCount ?? 0,
          thumbnail: video.thumbnail,
          url: video.url
        })),
        message: `${videos.length} trending video reviews`
      },
      timestamp: Date.now()
    });
  }

  /**
   * Broadcast high engagement content
   */
  public broadcastHighEngagementContent(content: { 
    socialMedia?: any[], 
    videos?: any[] 
  }): void {
    const videoCount = content.videos?.length ?? 0;
    const socialCount = content.socialMedia?.length ?? 0;
    const totalCount = videoCount + socialCount;

    this.broadcast({
      type: MessageType.HighEngagementContent,
      data: {
        totalCount,
        videoCount,
        socialCount,
        content: {
          socialMedia: content.socialMedia?.map(post => ({
            id: post.id,
            productId: post.productId,
            platform: post.platform,
            author: post.author,
            content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
            engagement: {
              likes: post.likes ?? 0,
              comments: post.comments ?? 0,
              shares: post.shares ?? 0,
              views: post.views ?? 0
            }
          })) ?? [],
          videos: content.videos?.map(video => ({
            id: video.id,
            productId: video.productId,
            platform: video.platform,
            title: video.title,
            channelName: video.channelName,
            engagement: {
              viewCount: video.viewCount ?? 0,
              likeCount: video.likeCount ?? 0,
              commentCount: video.commentCount ?? 0,
              shareCount: video.shareCount ?? 0
            },
            thumbnail: video.thumbnail
          })) ?? []
        },
        message: `${totalCount} high-engagement content items updated`
      },
      timestamp: Date.now()
    });
  }
}