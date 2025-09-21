"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, CheckCircle2, Bot, MessageSquare, Image as ImageIcon, Loader2, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import type { PutBlobResult } from '@vercel/blob';
import { ChatCreator } from "@/components/chat-creator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // --- Functions (No changes needed here) ---
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
          imageUrl: formData.imageUrl
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
       router.refresh();
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
      <div className="flex items-center justify-between">
         <h1 className="text-lg font-semibold md:text-2xl">Add New Product</h1>
      </div>

      {/* --- Step 1: Image Upload --- */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Step 1: Upload Your Masterpiece</CardTitle>
          <CardDescription>A great photo is the first step to telling your product's story.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input id="photos" type="file" ref={inputFileRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
          {formData.imageUrl ? (
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-green-500/10 border-green-500/20">
                  <CheckCircle2 className="h-10 w-10 text-green-600 shrink-0" />
                  <div className="flex-grow">
                      <p className="font-semibold text-green-800">Image Uploaded!</p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs md:max-w-md">{formData.imageUrl.split('/').pop()}</p>
                  </div>
                   <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground shrink-0" onClick={() => setFormData(prev => ({...prev, imageUrl: ''}))}>
                      <X className="h-5 w-5" />
                  </Button>
              </div>
          ) : (
              <button type="button" className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:bg-muted transition-colors disabled:opacity-50" onClick={() => inputFileRef.current?.click()} disabled={isUploading}>
                  {isUploading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : 
                  <>
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      <span className="mt-2 font-medium text-muted-foreground">Click to upload photo</span>
                  </>
                  }
              </button>
          )}
        </CardContent>
      </Card>

      {/* --- Step 2: Choose Method (Tabs UI) --- */}
      {formData.imageUrl && (
        <Tabs defaultValue="form" className="mt-6">
          <Card>
              <CardHeader>
                <CardTitle>Step 2: Describe Your Creation</CardTitle>
                <CardDescription>Choose your preferred method to provide the product details.</CardDescription>
                <TabsList className="grid w-full grid-cols-2 mt-4">
                  <TabsTrigger value="form"><Wand2 className="mr-2 h-4 w-4" />Quick Form</TabsTrigger>
                  <TabsTrigger value="chat"><Bot className="mr-2 h-4 w-4" />Guided Chat</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="form">
                    {/* --- Method 1: The Original Form --- */}
                    {step === 1 && (
                      <form onSubmit={handleGenerate} className="grid gap-4 pt-4 border-t">
                        <div>
                          <Label htmlFor="story">Your Story & Details</Label>
                          <Textarea id="story" value={formData.story} onChange={(e) => setFormData(prev => ({...prev, story: e.target.value}))} required placeholder="e.g., This vase is made from the clay of my village river..."/>
                        </div>
                        <div>
                          <Label htmlFor="min-price">Your Minimum Price (₹)</Label>
                          <Input id="min-price" type="number" onChange={(e) => setFormData(prev => ({...prev, minPrice: Number(e.target.value)}))} required placeholder="e.g., 1800"/>
                        </div>
                        <Button type="submit" disabled={isUploading}>
                           <Wand2 className="mr-2 h-4 w-4" /> Generate with AI
                        </Button>
                      </form>
                    )}
                    {step > 1 && (
                        <div className="space-y-6 pt-4 border-t">
                            <CardTitle>Step 3: Review & Save</CardTitle>
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
                                  <div className="flex gap-4 pt-4 border-t">
                                     <Button variant="outline" onClick={() => setStep(1)} disabled={isGenerating}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Form
                                     </Button>
                                     <Button onClick={() => setStep(3)} disabled={isGenerating}>
                                        {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...</> : "Looks Good, Next Step"}
                                     </Button>
                                  </div>
                                </>
                            )}
                            {step === 3 && (
                                <div>
                                  <p className="mb-4 text-sm text-muted-foreground">Your product is ready to be saved as a draft. You can publish it from the 'My Products' page.</p>
                                   <div className="flex gap-4 pt-4 border-t">
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
                </TabsContent>
                <TabsContent value="chat">
                    {/* --- Method 2: Conversational Chat --- */}
                    <div className="pt-4 border-t">
                        <ChatCreator imageUrl={formData.imageUrl} />
                    </div>
                </TabsContent>
              </CardContent>
          </Card>
        </Tabs>
      )}
    </div>
  );
}