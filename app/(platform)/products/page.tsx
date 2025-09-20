// File: app/(platform)/products/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

// This is now a Server Component that fetches data directly
export default async function ProductsPage() {

    const products = await prisma.product.findMany({
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
                    {products.map((product) => (
                        <Card key={product.id}>
                            <CardHeader>
                                <CardTitle>{product.name}</CardTitle>
                                <CardDescription>
                                    <Badge variant={product.status === 'LIVE' ? 'default' : 'secondary'}>
                                        {product.status}
                                    </Badge>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xl font-semibold">
                                    ₹ {(product.price).toLocaleString('en-IN')}
                                </p>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                    {product.description}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline">Edit</Button>
                                <Button variant="ghost" className="text-red-500 hover:text-red-600">Delete</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}