// File: app/(platform)/products/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Product, ProductCardActions } from "@/components/product-card-actions";

export const revalidate = 60;


export default async function ProductsPage() {
    // SOLUTION: Explicitly type the result from Prisma
    const products: Product[] = await prisma.product.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">My Products</h1>
                <Link href="/products/new">
                    <Button className="gap-1">
                        <PlusCircle className="h-4 w-4" />
                        Add New Product
                    </Button>
                </Link>
            </div>

            {products.length === 0 ? (
                <Card className="mt-6 text-center py-12">
                    <CardContent>
                        <h3 className="text-xl font-semibold">No Products Yet!</h3>
                        <p className="text-muted-foreground mt-2">Click "Add New Product" to get started with our AI assistant.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
                    {/* The 'product' parameter below is now correctly typed */}
                    {products.map((product) => (
                        <Card key={product.id} className="flex flex-col overflow-hidden">
                            <div className="relative w-full h-48 bg-muted">
                                {product.imageUrl ? (
                                    <Image 
                                      src={product.imageUrl} 
                                      alt={product.name} 
                                      fill
                                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                      className="object-cover" 
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col flex-grow">
                                <CardHeader>
                                    <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                                    <CardDescription>
                                        <Badge variant={product.status === 'LIVE' ? 'default' : 'secondary'}>
                                            {product.status}
                                        </Badge>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-xl font-semibold">
                                        ₹ {(product.price || 0).toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                        {product.description}
                                    </p>
                                </CardContent>
                                {/* 
                                  Now passing a server 'product' object to the client component.
                                  Next.js will serialize it (e.g., product.createdAt: Date -> string).
                                  Our client component correctly expects this.
                                */}
                                <ProductCardActions product={{
                                    ...product,
                                    createdAt: product.createdAt.toString(),
                                }} />
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}