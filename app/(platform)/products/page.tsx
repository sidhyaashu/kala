import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Brush } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ProductCardActions } from "@/components/product-card-actions";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ProductsPage() {
    const products = await prisma.product.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="space-y-6">
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
                <Card className="mt-6 text-center py-12 flex flex-col items-center justify-center min-h-[400px]">
                    <CardContent>
                        <Brush className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold">No Products Yet!</h3>
                        <p className="text-muted-foreground mt-2">Click "Add New Product" to get started with our AI assistant.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <Card key={product.id} className="flex flex-col overflow-hidden group">
                            <div className="relative w-full h-48 bg-muted">
                                {product.imageUrl ? (
                                    <Image 
                                      src={product.imageUrl} 
                                      alt={product.name} 
                                      fill
                                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                      className="object-cover transition-transform duration-300 group-hover:scale-105" 
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col flex-grow p-4 space-y-2">
                                <CardHeader className="p-0">
                                    <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                                    <CardDescription>
                                        <Badge variant={product.status === 'LIVE' ? 'default' : 'secondary'} className="capitalize">
                                            {product.status.toLowerCase()}
                                        </Badge>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 flex-grow">
                                    <p className="text-xl font-semibold">
                                        ₹{(product.price || 0).toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                        {product.description}
                                    </p>
                                </CardContent>
                                <ProductCardActions product={{
                                    ...product,
                                    createdAt: product.createdAt.toISOString(),
                                }} />
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}