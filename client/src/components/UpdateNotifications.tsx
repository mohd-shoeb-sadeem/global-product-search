import React, { useEffect, useState } from 'react';
import { useWebSocket, MessageType } from '../hooks/useWebSocket';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

/**
 * Update Notifications Component
 * 
 * This component listens for WebSocket updates and displays notifications
 * when new products are added or existing products are updated.
 */
export const UpdateNotifications: React.FC = () => {
  const [newProducts, setNewProducts] = useState(0);
  const [priceUpdates, setPriceUpdates] = useState(0);
  const [availabilityUpdates, setAvailabilityUpdates] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Connect to WebSocket and handle messages
  const { isConnected, connectionStatus, messages } = useWebSocket({
    reconnectOnClose: true,
    onMessage: (message) => {
      console.log('Received WebSocket message:', message);
      
      // Handle different message types
      switch (message.type) {
        case MessageType.NewProducts:
          setNewProducts((prev) => prev + message.data.count);
          toast({
            title: 'New Products Available!',
            description: `${message.data.count} new products have been added.`,
            variant: 'default',
          });
          // Invalidate queries to refresh product data
          queryClient.invalidateQueries({ queryKey: ['/api/products/featured'] });
          break;
          
        case MessageType.PriceUpdates:
          setPriceUpdates((prev) => prev + message.data.count);
          toast({
            title: 'Price Updates',
            description: `Prices updated for ${message.data.count} products.`,
            variant: 'default',
          });
          // Invalidate queries to refresh product data
          queryClient.invalidateQueries({ queryKey: ['/api/search'] });
          break;
          
        case MessageType.AvailabilityUpdates:
          setAvailabilityUpdates((prev) => prev + message.data.count);
          toast({
            title: 'Availability Updates',
            description: `Availability updated for ${message.data.count} products.`,
            variant: 'default',
          });
          // Invalidate queries to refresh product data
          queryClient.invalidateQueries({ queryKey: ['/api/search'] });
          break;
          
        case MessageType.SystemNotification:
          toast({
            title: 'System Notification',
            description: message.data.message,
            variant: 'default',
          });
          break;
      }
    },
  });

  // Handle connection status changes
  useEffect(() => {
    if (connectionStatus === 'connected') {
      console.log('Connected to update service');
    } else if (connectionStatus === 'error') {
      console.error('Error connecting to update service');
    }
  }, [connectionStatus]);

  // Only render if there are updates to show
  if (newProducts === 0 && priceUpdates === 0 && availabilityUpdates === 0) {
    return null;
  }

  // Render a notification badge
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-primary text-primary-foreground shadow-lg rounded-lg p-4 max-w-xs">
        <h3 className="font-semibold text-lg">Product Updates</h3>
        <div className="mt-2 space-y-1">
          {newProducts > 0 && (
            <p className="text-sm">
              <span className="font-medium">{newProducts}</span> new products added
            </p>
          )}
          {priceUpdates > 0 && (
            <p className="text-sm">
              <span className="font-medium">{priceUpdates}</span> price updates
            </p>
          )}
          {availabilityUpdates > 0 && (
            <p className="text-sm">
              <span className="font-medium">{availabilityUpdates}</span> availability changes
            </p>
          )}
        </div>
        <button 
          onClick={() => {
            setNewProducts(0);
            setPriceUpdates(0);
            setAvailabilityUpdates(0);
          }}
          className="mt-2 text-xs opacity-90 hover:opacity-100 underline"
        >
          Clear notifications
        </button>
      </div>
    </div>
  );
};