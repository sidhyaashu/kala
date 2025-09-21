"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
import { Copy, Loader2, Share2, Trash2, Wand2 } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { CardFooter } from "./ui/card";

export type Product = {
  id: string;
  createdAt: string;
  name: string;
  description: string | null;
  price: number;
  status: string;
  tags: string[];
  imageUrl: string | null;
  artisanNotes: string | null;
};

interface ProductCardActionsProps {
  product: Product;
}

export function ProductCardActions({ product }: ProductCardActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [marketingPost, setMarketingPost] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [promoImage, setPromoImage] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
      toast.success("Product deleted successfully.");
      setIsDeleteDialogOpen(false); // Close dialog on success
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'LIVE' }),
      });
      toast.success("Product published successfully!");
      router.refresh();
    } catch (error) {
      toast.error("Failed to publish product.");
    } finally {
      setIsPublishing(false);
    }
  };

  const generateMarketingPost = async () => {
    if (marketingPost) return; // Don't regenerate if already generated
    setIsGeneratingPost(true);
    try {
        const response = await fetch('/api/generate-marketing-post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: product.name, description: product.description }),
        });
        if (!response.ok) throw new Error("Failed to generate post.");
        const data = await response.json();
        setMarketingPost(data.postContent);
    } catch (error) {
        toast.error("AI failed to generate post. Please try again.");
    } finally {
        setIsGeneratingPost(false);
    }
  }

  const generatePromoImage = async () => {
    setIsGeneratingImage(true);
    setPromoImage("");
    try {
        const response = await fetch('/api/generate-promo-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: product.name, description: product.description }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to generate image.");
        }
        const data = await response.json();
        setPromoImage(data.imageBase64);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast.error(`AI Error: ${errorMessage}`);
    } finally {
        setIsGeneratingImage(false);
    }
  }

  return (
    <CardFooter className="p-0 pt-4 border-t flex justify-between items-center">
      {product.status === 'DRAFT' ? (
        <Button onClick={handlePublish} disabled={isPublishing} className="bg-blue-600 hover:bg-blue-700">
          {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Publish
        </Button>
      ) : (
        <Dialog>
            <DialogTrigger asChild>
                <Button onClick={generateMarketingPost} variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50 hover:text-purple-700">
                    <Share2 className="mr-2 h-4 w-4" />
                    Promote
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Promote "{product.name}"</DialogTitle>
                    <DialogDescription>Use these AI-generated assets for your social media.</DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-6 pt-4">
                    {/* Social Media Post Section */}
                    <div>
                        <h3 className="font-semibold mb-2">Social Media Post</h3>
                        {isGeneratingPost ? ( <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> ) : (
                            <div className="relative">
                                <Textarea value={marketingPost} readOnly rows={10} className="bg-muted pr-10" />
                                <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7" onClick={() => { navigator.clipboard.writeText(marketingPost); toast.success("Post copied!"); }}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                    {/* Promotional Image Section */}
                    <div>
                        <h3 className="font-semibold mb-2">Promotional Poster</h3>
                        <div className="relative aspect-square w-full bg-muted rounded-lg flex items-center justify-center border">
                            {isGeneratingImage ? (
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            ) : promoImage ? (
                                <Image src={`data:image/png;base64,${promoImage}`} alt="AI generated poster" fill className="object-contain rounded-lg" />
                            ) : (
                                <Button onClick={generatePromoImage}><Wand2 className="mr-2 h-4 w-4" />Generate Poster</Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <Button onClick={() => setIsDeleteDialogOpen(true)} variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the product "{product.name}". This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CardFooter>
  );
}