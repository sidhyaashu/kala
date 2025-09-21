// File: app/(platform)/dashboard/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Eye } from "lucide-react";
import prisma from "@/lib/prisma";
import { AiSuggestions } from "@/components/ai-suggestions";

async function getDashboardStats() {
    const products = await prisma.product.findMany();
    const liveProducts = products.filter(p => p.status === 'LIVE');
    const totalSales = liveProducts.reduce((sum, p) => sum + p.price, 0);
    const draftProducts = products.length - liveProducts.length;
    return { totalSales, liveProducts: liveProducts.length, draftProducts };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, here's a summary of your shop.</p>
         </div>
         {/* --- UPDATED BUTTONS --- */}
         <div className="flex items-center gap-2">
            <Link href="/artisan/main_artisan" target="_blank">
                <Button variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" /> View Public Page
                </Button>
            </Link>
            <Link href="/products/new">
                <Button className="gap-1"><PlusCircle className="h-4 w-4" />Add New Product</Button>
            </Link>
         </div>
       </div>
       
       <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
            <CardHeader><CardTitle>Potential Revenue</CardTitle></CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹ {stats.totalSales.toLocaleString('en-IN')}</div>
                <p className="text-xs text-muted-foreground">From all LIVE products</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Live Products</CardTitle></CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.liveProducts}</div>
                <p className="text-xs text-muted-foreground">{stats.draftProducts} products in draft</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader><CardTitle>Lifetime Sales</CardTitle></CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹ 0</div>
                <p className="text-xs text-muted-foreground">Order tracking coming soon!</p>
            </CardContent>
        </Card>
       </div>
       
       <AiSuggestions />
    </div>
  )
}