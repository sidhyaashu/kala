// File: app/[locale]/(platform)/trends/page.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Palette, Sparkles, Lightbulb } from "lucide-react";
import { toast } from "sonner";
// Define types for the trend data structure
type TrendingColor = {
  name: string;
  hex: string;
  reason: string;
};
type TrendingStyle = {
  name: string;
  description: string;
};
type TrendData = {
  category: string;
  trendingColors: TrendingColor[];
  trendingStyles: TrendingStyle[];
  actionableTip: string;
};

const productCategories = ["Pottery", "Textiles", "Woodwork", "Jewelry"];
export default function TrendsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Pottery");
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchTrends = async (category: string) => {
    setSelectedCategory(category);
    setIsLoading(true);
    setTrendData(null); // Clear previous data
    try {
      const response = await fetch("/api/generate-trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch trends: ${response.statusText}`);
      }

      const data: TrendData = await response.json();
      setTrendData(data);
    } catch (error) {
      console.error(error);
      toast.error("Could not fetch AI trend insights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // Fetch initial data on component mount
  useState(() => {
    fetchTrends(selectedCategory);
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Market Trends</h1>
        <p className="text-muted-foreground">
          Discover what's popular to inspire your next creation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select a Category</CardTitle>
          <Tabs
            value={selectedCategory}
            onValueChange={fetchTrends}
            className="mt-2"
          >
            <TabsList>
              {productCategories.map((cat) => (
                <TabsTrigger key={cat} value={cat} disabled={isLoading}>
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-6 border-t">
          {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-lg font-medium">
                Our AI is analyzing the latest trends...
              </p>
              <p>This may take a moment.</p>
            </div>
          )}
          {trendData && !isLoading && (
            <div className="space-y-8 animate-in fade-in-50">
              {/* Trending Colors */}
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                  <Palette className="text-purple-600" /> Trending Colors
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {trendData.trendingColors.map((color) => (
                    <div
                      key={color.name}
                      className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
                    >
                      <div
                        className="h-12 w-12 rounded-full border shadow-sm shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div>
                        <p className="font-semibold">
                          {color.name}{" "}
                          <span className="text-xs text-muted-foreground">
                            {color.hex}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {color.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Styles */}
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                  <Sparkles className="text-amber-500" /> Trending Styles
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {trendData.trendingStyles.map((style) => (
                    <Card key={style.name}>
                      <CardHeader>
                        <CardTitle className="text-lg">{style.name}</CardTitle>
                        <CardDescription>{style.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Actionable Tip */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">
                        AI-Powered Tip
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {trendData.actionableTip}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
