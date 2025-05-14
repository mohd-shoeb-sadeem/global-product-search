import { useState, useEffect, useRef, useCallback } from 'react';

export enum MessageType {
  NewProducts = 'new_products',
  PriceUpdates = 'price_updates',
  AvailabilityUpdates = 'availability_updates',
  SystemNotification = 'system_notification'
}

export interface WebSocketMessage {
  type: MessageType;
  data: any;
  timestamp: number;
}

export interface UseWebSocketOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  reconnectOnClose?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

/**
 * Custom hook for WebSocket connections
 */
export const useWebSocket = (options?: UseWebSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const maxReconnectAttempts = options?.maxReconnectAttempts || 5;
  const reconnectInterval = options?.reconnectInterval || 3000;
  
  const connect = useCallback(() => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    setConnectionStatus('connecting');
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        options?.onOpen?.();
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        if (options?.reconnectOnClose && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          reconnectIntervalRef.current = setTimeout(connect, reconnectInterval);
        }
        
        options?.onClose?.();
      };
      
      ws.onerror = (error) => {
        setConnectionStatus('error');
        options?.onError?.(error);
      };
      
      ws.onmessage = (event) => {
        try {
          const parsedMessage: WebSocketMessage = JSON.parse(event.data);
          setMessages((prevMessages) => [...prevMessages, parsedMessage]);
          options?.onMessage?.(parsedMessage);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      webSocketRef.current = ws;
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setConnectionStatus('error');
    }
  }, [options, maxReconnectAttempts, reconnectInterval]);
  
  const disconnect = useCallback(() => {
    if (reconnectIntervalRef.current) {
      clearTimeout(reconnectIntervalRef.current);
      reconnectIntervalRef.current = null;
    }
    
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  return {
    isConnected,
    connectionStatus,
    messages,
    connect,
    disconnect
  };
};