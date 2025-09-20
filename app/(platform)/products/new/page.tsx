// File: app/(platform)/products/new/page.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, Image as ImageIcon, Loader2, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import type { PutBlobResult } from '@vercel/blob';

// --- Type Definitions ---
type AIGeneratedData = {
  title: string;
  description: string;
  tags: string[];
  suggestedPrice: number;
};

type ProductFormData = {
    story: string;
    minPrice: number;
    imageUrl: string;
    aiData: AIGeneratedData | null;
}

// --- Component ---
export default function NewProductPage() {
  const router = useRouter();
  const inputFileRef = useRef<HTMLInputElement>(null);
  
  // --- State Management ---
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    story: '',
    minPrice: 0,
    imageUrl: '',
    aiData: null,
  });

  // --- Functions ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) throw new Error('Upload failed.');

      const newBlob = (await response.json()) as PutBlobResult;
      setFormData(prev => ({ ...prev, imageUrl: newBlob.url }));
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.imageUrl) {
        toast.error("Please upload a product photo first.");
        return;
    }
    setIsGenerating(true);
    setStep(2);

    try {
      const response = await fetch('/api/generate-product-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: formData.story, minPrice: formData.minPrice }),
      });

      if (!response.ok) throw new Error(`AI generation failed: ${response.statusText}`);
      const data: AIGeneratedData = await response.json();
      setFormData(prev => ({ ...prev, aiData: data }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate AI content. Please try again.");
      setStep(1);
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
            imageUrl: formData.imageUrl,
         }),
       });

       if (!response.ok) throw new Error("Failed to save the product.");

       toast.success("Product saved as a draft successfully!");
       router.push('/products');
       router.refresh(); // Important: This tells Next.js to re-fetch the data on the products page
     } catch(error) {
        console.error(error);
        toast.error("Could not save your product. Please try again.");
     } finally {
        setIsSaving(false);
     }
  }

  // --- Render ---
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
            <form onSubmit={handleGenerate} className="grid gap-6">
              <div>
                <Label htmlFor="photos">Product Photo</Label>
                <Input id="photos" type="file" ref={inputFileRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                {formData.imageUrl ? (
                    <div className="mt-2 relative w-fit">
                        <Image src={formData.imageUrl} alt="Uploaded product" width={150} height={150} className="rounded-md border object-cover aspect-square" />
                        <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setFormData(prev => ({...prev, imageUrl: ''}))}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <Button type="button" variant="outline" className="mt-2 w-full h-32 border-dashed flex flex-col" onClick={() => inputFileRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <><ImageIcon className="h-8 w-8 text-muted-foreground" /><span className="mt-2 text-sm text-muted-foreground">Click to upload</span></>}
                    </Button>
                )}
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
              <Button type="submit" className="w-full md:w-auto" disabled={isUploading}>
                {isUploading ? 'Uploading...' : <><Wand2 className="mr-2 h-4 w-4" /> Generate with AI</>}
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
                            value={formData.aiData?.title || ''} 
                            onChange={(e) => setFormData(prev => ({...prev, aiData: {...prev.aiData!, title: e.target.value}}))}
                        />
                   </div>
                   <div>
                        <Label>SEO-Friendly Description</Label>
                        <Textarea 
                            value={formData.aiData?.description || ''} 
                            rows={6} 
                            onChange={(e) => setFormData(prev => ({...prev, aiData: {...prev.aiData!, description: e.target.value}}))}
                        />
                   </div>
                   <div>
                        <Label>Keywords / Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.aiData?.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
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
              <p className="mb-4">Your product is ready to be saved as a draft. You can publish it from the 'My Products' page.</p>
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