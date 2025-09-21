"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle, CalendarDays, Gift, Loader2 } from "lucide-react";
import { format } from 'date-fns';

type Suggestion = {
  holiday: string;
  date: string;
  suggestion: string;
  product_name: string | null;
};

export function PromotionalCalendar() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const response = await fetch('/api/seasonal-suggestions', { method: 'POST' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch suggestions");
        }
        const data = await response.json();
        setSuggestions(data.suggestions);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSuggestions();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="text-blue-500" /> Promotional Calendar
        </CardTitle>
        <CardDescription>AI-powered suggestions for the next 90 days, based on your live products.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analyzing holidays and your products...</span>
          </div>
        ) : error ? (
            <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
            </div>
        ) : (
          <div className="space-y-4">
            {suggestions.length > 0 ? suggestions.map((item, index) => (
                <div key={index} className="flex gap-4 items-start p-3 bg-muted/50 rounded-lg">
                    <div className="flex flex-col items-center justify-center bg-background p-2 rounded-md border text-center w-20 shrink-0">
                       <span className="font-bold text-primary text-lg">{format(new Date(item.date), 'dd')}</span>
                       <span className="text-xs uppercase text-muted-foreground">{format(new Date(item.date), 'MMM')}</span>
                    </div>
                    <div>
                        <h4 className="font-semibold">{item.holiday}</h4>
                        <p className="text-sm text-muted-foreground">{item.suggestion}</p>
                        {item.product_name && (
                            <p className="text-xs mt-1 font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full w-fit flex items-center gap-1">
                                <Gift className="h-3 w-3" />
                                Promote: {item.product_name}
                            </p>
                        )}
                    </div>
                </div>
            )) : <p className="text-sm text-muted-foreground">No upcoming holidays or events found in the next 90 days.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}