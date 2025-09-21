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
import { ArrowLeft, Check, CheckCircle2, Image as ImageIcon, Loader2, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import type { PutBlobResult } from '@vercel/blob';
import { Separator } from "@/components/ui/separator";
import { ChatCreator } from "@/components/chat-creator";

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
        body: JSON.stringify({ 
          story: formData.story, 
          minPrice: formData.minPrice,
          imageUrl: formData.imageUrl // Pass the image URL to the Vision API
        }),
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
            {step === 1 && "Create with AI Assistant"}
            {step === 2 && "Step 2: AI-Powered Generation"}
            {step === 3 && "Step 3: Review & Save"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* --- Image Upload Section (Now shared for both flows) --- */}
          <div>
            <Label htmlFor="photos">1. Upload Product Photo</Label>
            <Input id="photos" type="file" ref={inputFileRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
            {formData.imageUrl ? (
                <div className="mt-2 flex items-center gap-3 p-4 border rounded-md bg-green-500/10 border-green-500/20">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <div>
                        <p className="font-semibold text-green-700">Image Uploaded!</p>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">{formData.imageUrl.split('/').pop()}</p>
                    </div>
                     <Button type="button" size="icon" variant="ghost" className="ml-auto h-7 w-7 text-muted-foreground" onClick={() => setFormData(prev => ({...prev, imageUrl: ''}))}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <Button type="button" variant="outline" className="mt-2 w-full h-32 border-dashed flex-col" onClick={() => inputFileRef.current?.click()} disabled={isUploading}>
                    {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                    <>
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <span className="mt-2 text-sm text-muted-foreground">Click to upload photo</span>
                    </>
                    }
                </Button>
            )}
          </div>

          {/* Conditional rendering based on image upload */}
          {formData.imageUrl && (
            <>
              <div className="my-8 flex items-center">
                  <Separator className="flex-grow" />
                  <span className="mx-4 text-xs font-semibold text-muted-foreground">CHOOSE YOUR METHOD</span>
                  <Separator className="flex-grow" />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                  {/* --- Method 1: The Original Form --- */}
                  <div>
                    <h3 className="font-semibold mb-4">Method 1: Quick Form</h3>
                    {step === 1 && (
                      <form onSubmit={handleGenerate} className="grid gap-4">
                        <div>
                          <Label htmlFor="story">2. Your Story</Label>
                          <Textarea id="story" value={formData.story} onChange={(e) => setFormData(prev => ({...prev, story: e.target.value}))} required placeholder="e.g., This vase is made from the clay of my village river..."/>
                        </div>
                        <div>
                          <Label htmlFor="min-price">3. Your Minimum Price (₹)</Label>
                          <Input id="min-price" type="number" onChange={(e) => setFormData(prev => ({...prev, minPrice: Number(e.target.value)}))} required placeholder="e.g., 1800"/>
                        </div>
                        <Button type="submit" disabled={isUploading}>
                           <Wand2 className="mr-2 h-4 w-4" /> Generate with AI
                        </Button>
                      </form>
                    )}
                    
                    {/* Steps 2 and 3 for the form */}
                    {step > 1 && (
                        <div className="space-y-6">
                            {step === 2 && (
                                <>
                                  {isGenerating ? (
                                    <div className="space-y-4">
                                      <Skeleton className="h-8 w-3/4" />
                                      <Skeleton className="h-20 w-full" />
                                      <div className="flex gap-2"> <Skeleton className="h-6 w-20" /> <Skeleton className="h-6 w-24" /> <Skeleton className="h-6 w-20" /> </div>
                                      <Skeleton className="h-8 w-1/2" />
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                       <div>
                                            <Label>Generated Product Title</Label>
                                            <Input value={formData.aiData?.title} onChange={(e) => setFormData(prev => ({...prev, aiData: {...prev.aiData!, title: e.target.value}}))} />
                                       </div>
                                       <div>
                                            <Label>SEO-Friendly Description</Label>
                                            <Textarea value={formData.aiData?.description} rows={6} onChange={(e) => setFormData(prev => ({...prev, aiData: {...prev.aiData!, description: e.target.value}}))} />
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
                                    </div>
                                  )}
                                  <div className="flex gap-4">
                                     <Button variant="outline" onClick={() => setStep(1)} disabled={isGenerating}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                     </Button>
                                     <Button onClick={() => setStep(3)} disabled={isGenerating}>
                                        {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...</> : "Looks Good, Next Step"}
                                     </Button>
                                  </div>
                                </>
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
                        </div>
                    )}
                  </div>
                  
                  {/* --- Method 2: Conversational Chat --- */}
                  <div>
                    <h3 className="font-semibold mb-4">Method 2: Guided Chat</h3>
                    <ChatCreator imageUrl={formData.imageUrl} />
                  </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}