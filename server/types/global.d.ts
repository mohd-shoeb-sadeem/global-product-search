import { WebSocketService } from '../services/websocketService';

declare global {
  var wsService: WebSocketService;
  var updateInterval: NodeJS.Timeout | null;
}

export {};