// File: app/api/optimize-route/route.ts
import { NextResponse } from 'next/server';
// 1. CORRECTED IMPORT: Import 'DirectionsRoute' instead of 'Route'
import { Client, DirectionsRoute, TravelMode } from '@googlemaps/google-maps-services-js';

// Initialize the Google Maps client
const mapsClient = new Client({});

// Predefined origin address for the artisan
const ARTISAN_ORIGIN_ADDRESS = "Jaipur, Rajasthan, India";

// Simple cost calculation logic (in a real app, this would be more complex)
// Cost per kilometer in INR
const COST_PER_KM = 5; 
// Base fee in INR
const BASE_FEE = 50; 

export async function POST(request: Request) {
  const { destination } = await request.json();

  if (!destination) {
    return NextResponse.json({ error: 'Destination address is required.' }, { status: 400 });
  }

  try {
    const response = await mapsClient.directions({
      params: {
        origin: ARTISAN_ORIGIN_ADDRESS,
        destination: destination,
        mode: TravelMode.driving,
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    });

    if (response.data.status !== 'OK' || response.data.routes.length === 0) {
      console.error("Google Maps API Error:", response.data.error_message || response.data.status);
      throw new Error(response.data.error_message || `Could not find a route to the destination. Status: ${response.data.status}`);
    }

    // 2. CORRECTED TYPE ANNOTATION: Use the imported 'DirectionsRoute' type
    const route: DirectionsRoute = response.data.routes[0];
    const leg = route.legs[0];

    // Extract distance in kilometers
    const distanceKm = leg.distance.value / 1000;
    
    // Calculate estimated cost
    const estimatedCost = BASE_FEE + (distanceKm * COST_PER_KM);

    const result = {
      origin: leg.start_address,
      destination: leg.end_address,
      distance: leg.distance.text, // e.g., "520 km"
      duration: leg.duration.text, // e.g., "8 hours 45 mins"
      cost: `₹${estimatedCost.toFixed(2)}`,
      summary: route.summary, // e.g., "NH48"
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching directions:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while optimizing the route.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}