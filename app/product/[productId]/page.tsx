// File: app/[locale]/product/[productId]/page.tsx
import prisma from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Define the correct Props type for this page
type Props = {
  params: { productId: string; locale: string }
}

// --- Dynamic Metadata Generation ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { id: params.productId },
  });

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
    const product = await prisma.product.findUnique({
        where: { id: params.productId },
    });

    // If no product is found, render the 404 page
    if (!product) {
        notFound();
    }

    const artisan = await prisma.artisanProfile.findUnique({
        where: { id: "main_artisan" },
    });

    return (
        <div className="bg-gray-50 min-h-screen">
            <header className="bg-white border-b">
                <div className="container mx-auto p-4 flex justify-between items-center">
                    <Link href={`/${params.locale}/dashboard`}>
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <Link href={`/${params.locale}/artisan/main_artisan`} className="text-purple-600 font-bold">
                        Artisan AI
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
                                <Link href={`/${params.locale}/artisan/main_artisan`} className="text-sm text-muted-foreground hover:underline">
                                    By {artisan.name}
                                </Link>
                            )}
                            <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
                            <p className="text-2xl font-semibold text-primary mt-2">
                                ₹ {product.price.toLocaleString('en-IN')}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-4 border-t">
                            {product.tags.map(tag => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                        </div>

                        <p className="text-muted-foreground leading-relaxed">
                            {product.description || "No description provided."}
                        </p>

                        <div className="pt-4">
                            <Button size="lg" className="w-full gap-2">
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