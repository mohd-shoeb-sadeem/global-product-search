import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, ShoppingBag, Tag, Package } from 'lucide-react';

/**
 * Product Updater Controls
 * 
 * A component to manually trigger product updates.
 * This is for demonstration and testing purposes.
 */
export const ProductUpdaterControls: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(60); // seconds
  const [lastUpdateResults, setLastUpdateResults] = useState<{
    newProducts?: number;
    updatedPrices?: number;
    updatedAvailability?: number;
  }>({});

  // Handle toggling auto-updates
  const handleAutoUpdateToggle = async (enabled: boolean) => {
    setLoading(enabled ? 'auto-start' : 'auto-stop');
    try {
      const endpoint = enabled ? '/api/products/start-auto-updates' : '/api/products/stop-auto-updates';
      const body = enabled ? { interval: updateInterval * 1000 } : undefined;
      
      const response = await apiRequest('POST', endpoint, body);
      const data = await response.json();
      
      if (data.success) {
        setAutoUpdateEnabled(enabled);
        toast({
          title: enabled ? 'Auto-updates started' : 'Auto-updates stopped',
          description: data.message,
        });
      } else {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error toggling auto-updates:', error);
      toast({
        title: 'Error',
        description: `Failed to ${enabled ? 'start' : 'stop'} auto-updates.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  // Handle checking for new products
  const handleCheckNewProducts = async () => {
    setLoading('check');
    try {
      const response = await apiRequest('POST', '/api/products/update-check');
      const data = await response.json();
      
      if (data.success) {
        setLastUpdateResults({
          ...lastUpdateResults,
          newProducts: data.newProducts,
        });
        toast({
          title: 'Product Check Complete',
          description: data.message,
        });
      } else {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error checking for new products:', error);
      toast({
        title: 'Error',
        description: 'Failed to check for new products.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  // Handle updating product prices
  const handleUpdatePrices = async () => {
    setLoading('prices');
    try {
      const response = await apiRequest('POST', '/api/products/update-prices');
      const data = await response.json();
      
      if (data.success) {
        setLastUpdateResults({
          ...lastUpdateResults,
          updatedPrices: data.updatedPrices,
        });
        toast({
          title: 'Price Updates Complete',
          description: data.message,
        });
      } else {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating prices:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product prices.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  // Handle updating product availability
  const handleUpdateAvailability = async () => {
    setLoading('availability');
    try {
      const response = await apiRequest('POST', '/api/products/update-availability');
      const data = await response.json();
      
      if (data.success) {
        setLastUpdateResults({
          ...lastUpdateResults,
          updatedAvailability: data.updatedAvailability,
        });
        toast({
          title: 'Availability Updates Complete',
          description: data.message,
        });
      } else {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product availability.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  // Handle full update (all of the above)
  const handleFullUpdate = async () => {
    setLoading('full');
    try {
      const response = await apiRequest('POST', '/api/products/update-all');
      const data = await response.json();
      
      if (data.success) {
        setLastUpdateResults({
          newProducts: data.newProducts,
          updatedPrices: data.updatedPrices,
          updatedAvailability: data.updatedAvailability,
        });
        toast({
          title: 'Full Update Complete',
          description: data.message,
        });
      } else {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error running full update:', error);
      toast({
        title: 'Error',
        description: 'Failed to run full product update.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Product Updates
        </CardTitle>
        <CardDescription>
          Monitor and control product updates from external sources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="auto-update">Automatic Updates</Label>
            <span className="text-sm text-muted-foreground">
              Automatically check for product updates every {updateInterval} seconds
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {loading === 'auto-start' || loading === 'auto-stop' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            <Switch
              id="auto-update"
              checked={autoUpdateEnabled}
              onCheckedChange={handleAutoUpdateToggle}
              disabled={loading !== null}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckNewProducts}
            disabled={loading !== null}
            className="flex-1"
          >
            {loading === 'check' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ShoppingBag className="h-4 w-4 mr-2" />
            )}
            Check New Products
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpdatePrices}
            disabled={loading !== null}
            className="flex-1"
          >
            {loading === 'prices' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Tag className="h-4 w-4 mr-2" />
            )}
            Update Prices
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpdateAvailability}
            disabled={loading !== null}
            className="flex-1"
          >
            {loading === 'availability' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Package className="h-4 w-4 mr-2" />
            )}
            Update Availability
          </Button>
        </div>

        <Button
          variant="default"
          onClick={handleFullUpdate}
          disabled={loading !== null}
          className="w-full mt-2"
        >
          {loading === 'full' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Run Full Update
        </Button>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm">
          Last update results:
        </div>
        <div className="flex gap-2">
          {lastUpdateResults.newProducts !== undefined && lastUpdateResults.newProducts >= 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" />
              {lastUpdateResults.newProducts} new
            </Badge>
          )}
          {lastUpdateResults.updatedPrices !== undefined && lastUpdateResults.updatedPrices >= 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {lastUpdateResults.updatedPrices} prices
            </Badge>
          )}
          {lastUpdateResults.updatedAvailability !== undefined && lastUpdateResults.updatedAvailability >= 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {lastUpdateResults.updatedAvailability} availability
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};