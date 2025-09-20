"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

type AIGeneratedData = {
  title: string;
  description: string;
  tags: string[];
  suggestedPrice: number;
};

// This type will hold all form data
type ProductFormData = {
    story: string;
    minPrice: number;
    aiData: AIGeneratedData | null;
}

export default function NewProductPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Use a single state object for all form data
  const [formData, setFormData] = useState<ProductFormData>({
    story: '',
    minPrice: 0,
    aiData: null,
  });

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    setStep(2);

    try {
      const response = await fetch('/api/generate-product-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: formData.story, minPrice: formData.minPrice }),
      });

      if (!response.ok) {
        throw new Error(`AI generation failed: ${response.statusText}`);
      }
      
      const data: AIGeneratedData = await response.json();
      setFormData(prev => ({ ...prev, aiData: data }));

    } catch (error) {
      console.error(error);
      toast.error("Failed to generate AI content. Please try again.");
      setStep(1); // Go back to step 1 on error
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
     setIsSaving(true);
     
     try {
       const response = await fetch('/api/products', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            name: formData.aiData?.title,
            description: formData.aiData?.description,
            price: formData.aiData?.suggestedPrice,
            tags: formData.aiData?.tags,
            artisanNotes: formData.story,
         }),
       });

       if (!response.ok) {
        throw new Error("Failed to save the product.");
       }

       toast.success("Product saved as a draft successfully!");
       router.push('/products'); // Redirect to the products list

     } catch(error) {
        console.error(error);
        toast.error("Could not save your product. Please try again.");
     } finally {
        setIsSaving(false);
     }
  }

  return (
    <div>
      <h1 className="text-lg font-semibold md:text-2xl">Add New Product</h1>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Step 1: Tell Us About Your Craft"}
            {step === 2 && "Step 2: AI-Powered Generation"}
            {step === 3 && "Step 3: Review & Save"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleGenerate} className="grid gap-4">
              <div>
                <Label htmlFor="photos">Product Photos</Label>
                <Input id="photos" type="file" multiple disabled />
                <p className="text-xs text-muted-foreground mt-1">Photo uploads coming in Phase 3.</p>
              </div>
              <div>
                <Label htmlFor="story">Your Story (Voice or Text)</Label>
                <Textarea 
                    id="story" 
                    placeholder="e.g., This vase is made from the clay of my village river and painted with natural dyes derived from local flowers..." 
                    rows={5} 
                    value={formData.story}
                    onChange={(e) => setFormData(prev => ({...prev, story: e.target.value}))}
                    required
                />
              </div>
              <div>
                <Label htmlFor="min-price">Your Minimum Price (in ₹)</Label>
                <Input 
                    id="min-price" 
                    type="number" 
                    placeholder="e.g., 1800" 
                    onChange={(e) => setFormData(prev => ({...prev, minPrice: Number(e.target.value)}))}
                    required
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                <Wand2 className="mr-2 h-4 w-4" />
                Generate with AI
              </Button>
            </form>
          )}

          {step === 2 && (
            <div className="grid gap-6">
              {isGenerating ? (
                <>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                  <div className="flex gap-2"> <Skeleton className="h-6 w-20" /> <Skeleton className="h-6 w-24" /> <Skeleton className="h-6 w-20" /> </div>
                  <Skeleton className="h-8 w-1/2" />
                </>
              ) : (
                <>
                   <div>
                        <Label>Generated Product Title</Label>
                        <Input 
                            value={formData.aiData?.title} 
                            onChange={(e) => setFormData(prev => ({...prev, aiData: {...prev.aiData!, title: e.target.value}}))}
                        />
                   </div>
                   <div>
                        <Label>SEO-Friendly Description</Label>
                        <Textarea 
                            value={formData.aiData?.description} 
                            rows={6} 
                            onChange={(e) => setFormData(prev => ({...prev, aiData: {...prev.aiData!, description: e.target.value}}))}
                        />
                   </div>
                   <div>
                        <Label>Keywords / Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.aiData?.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
                        </div>
                   </div>
                    <div>
                        <Label>Pricing Suggestion</Label>
                        <p className="text-xl font-bold text-primary">₹ {formData.aiData?.suggestedPrice}</p>
                        <p className="text-xs text-muted-foreground">Your minimum was ₹{formData.minPrice}.</p>
                   </div>
                </>
              )}
              <div className="flex gap-4">
                 <Button variant="outline" onClick={() => setStep(1)} disabled={isGenerating}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                 </Button>
                 <Button onClick={() => setStep(3)} disabled={isGenerating}>
                    {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...</> : "Looks Good, Next Step"}
                 </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="mb-4">Your product is ready to be saved as a draft. You can publish it later.</p>
               <div className="flex gap-4">
                 <Button variant="outline" onClick={() => setStep(2)} disabled={isSaving}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit
                 </Button>
                 <Button onClick={handleSaveDraft} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    {isSaving ? "Saving..." : "Save as Draft"}
                 </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}