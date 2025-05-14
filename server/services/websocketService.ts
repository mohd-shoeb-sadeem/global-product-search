import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

// WebSocket message types
export enum MessageType {
  NewProducts = 'new_products',
  PriceUpdates = 'price_updates',
  AvailabilityUpdates = 'availability_updates',
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
}