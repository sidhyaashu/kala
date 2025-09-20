// File: app/(platform)/products/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {

    // Mock data for products
    const products = [
        { name: "Hand-carved Wooden Elephant", status: "Live", price: "₹ 2,499" },
        { name: "Jaipuri Blue Pottery Vase", status: "Live", price: "₹ 1,899" },
        { name: "Pashmina Shawl", status: "Draft", price: "₹ 7,500" },
    ];

    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">My Products</h1>
                {/* CORRECTED THE HREF PATH HERE */}
                <Link href="/products/new">
                    <Button className="gap-1">
                        <PlusCircle className="h-4 w-4" />
                        Add New Product
                    </Button>
                </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
                {products.map((product) => (
                    <Card key={product.name}>
                        <CardHeader>
                            <CardTitle>{product.name}</CardTitle>
                            <CardDescription>
                                Status: <span className={product.status === 'Live' ? 'text-green-600' : 'text-gray-500'}>{product.status}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-semibold">{product.price}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline">Edit</Button>
                            <Button variant="ghost" className="text-red-500 hover:text-red-600">Delete</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}