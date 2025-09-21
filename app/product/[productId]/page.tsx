// File: app/product/[productId]/page.tsx

import prisma from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, UserCircle } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  params: { productId: string; }
}

// --- Dynamic Metadata Generation ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // --- START OF FIX ---
  // Destructure productId from params first to satisfy Next.js
  const { productId } = params;

  const product = await prisma.product.findUnique({
    // Use the new variable here
    where: { id: productId },
  });
  // --- END OF FIX ---

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    }
  }

  return {
    title: `${product.name} | Kala AI`,
    description: product.description?.substring(0, 150) + '...' || `Purchase ${product.name}, a unique handcrafted item.`,
  }
}

// --- Page Component ---
export default async function ProductPage({ params }: Props) {
    const { productId } = params;

    // Correctly using findFirst to allow multiple 'where' conditions
    const product = await prisma.product.findFirst({
        where: { id: productId, status: 'LIVE' },
    });

    if (!product) {
        notFound();
    }

    const artisan = await prisma.artisanProfile.findUnique({
        where: { id: "main_artisan" },
    });

    return (
        <div className="bg-gray-50 min-h-screen">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto p-4 flex justify-between items-center">
                    <Link href={`/dashboard`}>
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <Link href={`/artisan/main_artisan`} className="text-purple-600 font-bold">
                        Kala AI
                    </Link>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <Card className="grid md:grid-cols-2 gap-8 lg:gap-12 p-6 md:p-8 overflow-hidden shadow-lg">
                    {/* Image Section */}
                    <div className="relative aspect-square bg-muted rounded-lg">
                        {product.imageUrl ? (
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover rounded-lg"
                                priority
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                No Image Available
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col justify-center space-y-4">
                        <div>
                            {artisan?.name && (
                                <Link href={`/artisan/main_artisan`} className="flex items-center gap-2 text-sm text-muted-foreground hover:underline mb-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={artisan.profileImage || ''} />
                                        <AvatarFallback><UserCircle className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                    By {artisan.name}
                                </Link>
                            )}
                            <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
                            <p className="text-2xl font-semibold text-primary mt-2">
                                ₹{product.price.toLocaleString('en-IN')}
                            </p>
                        </div>

                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-4 border-t">
                              {product.tags.map(tag => (
                                  <Badge key={tag} variant="secondary">{tag}</Badge>
                              ))}
                          </div>
                        )}

                        <p className="text-muted-foreground leading-relaxed pt-4 border-t">
                            {product.description || "No description provided."}
                        </p>

                        <div className="pt-4">
                            <Button size="lg" className="w-full gap-2" disabled>
                                <ShoppingCart className="h-5 w-5" />
                                Add to Cart (Coming Soon)
                            </Button>
                        </div>
                    </div>
                </Card>
            </main>
        </div>
    );
}