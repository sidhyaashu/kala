"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, Loader2, Wand2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast as sonnerToast } from "sonner"




// Mock AI-generated data type
type AIGeneratedData = {
  title: string;
  description: string;
  tags: string[];
  suggestedPrice: number;
};

export default function NewProductPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [aiData, setAiData] = useState<AIGeneratedData | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStep(2);

    // Simulate calling the backend API
    // In a real app, this would be: await fetch('/api/generate-product-details', { ... })
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock response from the AI
    setAiData({
      title: "Hand-carved Rosewood Elephant from Rajasthan",
      description: "This exquisite elephant figurine is hand-carved by skilled artisans from sustainably sourced Rosewood. Each piece showcases intricate details and the natural grain of the wood, making it a unique piece of traditional Indian art. Perfect for home decor or as a thoughtful gift.",
      tags: ["handmade", "traditional art", "home decor", "eco-friendly", "rajasthan"],
      suggestedPrice: 2499,
    });

    setIsLoading(false);
  };

  const handleLaunch = () => {
     // Here you would trigger the n8n webhook
     sonnerToast.success("Product launched successfully!", {
        description: "Your product is now being synced to all marketplaces.",
     });
     // Redirect or reset form after launch
  }

  return (
    <div>
        <Toaster />
        {/* <sonner.Toaster richColors /> */}
      <h1 className="text-lg font-semibold md:text-2xl">Add New Product</h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Step 1: Tell Us About Your Craft"}
            {step === 2 && "Step 2: AI-Powered Generation"}
            {step === 3 && "Step 3: Review & Launch"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleGenerate} className="grid gap-4">
              <div>
                <Label htmlFor="photos">Product Photos</Label>
                <Input id="photos" type="file" multiple />
              </div>
              <div>
                <Label htmlFor="story">Your Story (Voice or Text)</Label>
                <Textarea id="story" placeholder="Tell us about this creation. What makes it special? What is the story behind it?" rows={5} />
              </div>
              <div>
                <Label htmlFor="min-price">Your Minimum Price (in ₹)</Label>
                <Input id="min-price" type="number" placeholder="e.g., 1800" />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                <Wand2 className="mr-2 h-4 w-4" />
                Generate with AI
              </Button>
            </form>
          )}

          {step === 2 && (
            <div className="grid gap-6">
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                   <Skeleton className="h-8 w-1/2" />
                </>
              ) : (
                <>
                   <div>
                        <Label>Generated Product Title</Label>
                        <Input defaultValue={aiData?.title} />
                   </div>
                   <div>
                        <Label>SEO-Friendly Description</Label>
                        <Textarea defaultValue={aiData?.description} rows={6} />
                   </div>
                   <div>
                        <Label>Keywords / Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {aiData?.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
                        </div>
                   </div>
                    <div>
                        <Label>Pricing Suggestion</Label>
                        <p className="text-xl font-bold text-primary">₹ {aiData?.suggestedPrice}</p>
                        <p className="text-xs text-muted-foreground">Your minimum was ₹1,800.</p>
                   </div>
                </>
              )}
              <div className="flex gap-4">
                 <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                 </Button>
                 <Button onClick={() => setStep(3)} disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...</> : "Looks Good, Next Step"}
                 </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="mb-4">Your product is ready to be launched. We will automatically list it on your connected platforms.</p>
               <div className="flex gap-4">
                 <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Edit
                 </Button>
                 <Button onClick={handleLaunch} className="bg-green-600 hover:bg-green-700">
                    <Check className="mr-2 h-4 w-4" />
                    Launch Product
                 </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}