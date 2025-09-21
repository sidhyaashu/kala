// File: components/ai-suggestions.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Lightbulb, Loader2, Megaphone, Package, Tag, AlertTriangle } from "lucide-react";

// Map icon names from the AI to actual Lucide components
const iconMap: { [key: string]: React.ElementType } = {
  Tag,
  Megaphone,
  Package,
  Lightbulb,
};

type Suggestion = {
  suggestion: string;
  icon: string;
};

export function AiSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        // First, get the products from our own API to pass to the suggestion API
        const productsResponse = await fetch('/api/products');
        if (!productsResponse.ok) {
          throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
        }
        const products = await productsResponse.json();

        const response = await fetch('/api/generate-suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products }),
        });
        if (!response.ok) throw new Error("Failed to fetch suggestions");
        const data = await response.json();
        setSuggestions(data.suggestions);
      } catch (err) {
        setError("Could not load AI suggestions at this time.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSuggestions();
  }, []);

  return (
    <Card className="bg-amber-50 border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-amber-500" /> AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating personalized suggestions...</span>
          </div>
        ) : error ? (
            <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
            </div>
        ) : (
          <ul className="space-y-3">
            {suggestions.map((item, index) => {
              const Icon = iconMap[item.icon] || Lightbulb;
              return (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <Icon className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
                  <span>{item.suggestion}</span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}