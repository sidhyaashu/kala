"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { IndianRupee, Loader2, Map, Milestone, Ship, Timer, AlertCircle } from 'lucide-react';

type RouteDetails = {
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  cost: string;
  summary: string;
};

export default function LogisticsPage() {
  const [destination, setDestination] = useState('');
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setIsLoading(true);
    setError(null);
    setRouteDetails(null);

    try {
      const response = await fetch('/api/optimize-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate route.');
      }

      setRouteDetails(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Logistics Optimizer</h1>
        <p className="text-muted-foreground">Calculate shipping costs and find the best route for your deliveries.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calculate Shipping</CardTitle>
          <CardDescription>Enter a destination to get an estimated cost and route from Jaipur, Rajasthan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-4">
            <div className="w-full">
              <Label htmlFor="destination">Destination Address</Label>
              <Input
                id="destination"
                placeholder="e.g., Mumbai, Maharashtra"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto shrink-0">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Map className="mr-2 h-4 w-4" />}
              {isLoading ? 'Calculating...' : 'Calculate'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {routeDetails && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle>Optimized Route Details</CardTitle>
            <CardDescription>From: {routeDetails.origin}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <InfoBox icon={Milestone} title="Distance" value={routeDetails.distance} />
            <InfoBox icon={Timer} title="Est. Duration" value={routeDetails.duration} />
            <InfoBox icon={IndianRupee} title="Est. Cost" value={routeDetails.cost} className="font-bold text-lg text-green-600" />
            <InfoBox icon={Map} title="Main Route" value={routeDetails.summary} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper component for info boxes
function InfoBox({ icon: Icon, title, value, className }: { icon: React.ElementType, title: string, value: string, className?: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
      <Icon className="h-8 w-8 text-primary shrink-0" />
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className={`font-semibold ${className}`}>{value}</p>
      </div>
    </div>
  );
}