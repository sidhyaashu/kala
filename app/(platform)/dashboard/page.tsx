import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Eye, IndianRupee, Package, PackageCheck } from "lucide-react";
import prisma from "@/lib/prisma";
import { AiSuggestions } from "@/components/ai-suggestions";
import { PromotionalCalendar } from "@/components/promotional-calendar";

async function getDashboardStats() {
    try {
        const products = await prisma.product.findMany();
        const liveProducts = products.filter(p => p.status === 'LIVE');
        const totalPotentialRevenue = liveProducts.reduce((sum, p) => sum + p.price, 0);
        const draftProductsCount = products.length - liveProducts.length;
        return { totalPotentialRevenue, liveProductsCount: liveProducts.length, draftProductsCount };
    } catch (error) {
        console.error("Database Error: Failed to fetch dashboard stats.", error);
        // Return default values in case of an error
        return { totalPotentialRevenue: 0, liveProductsCount: 0, draftProductsCount: 0 };
    }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6 animate-in fade-in-50">
       <div className="flex flex-wrap items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, here's a summary of your shop.</p>
         </div>
         <div className="flex items-center gap-2">
            <Link href="/artisan/main_artisan" target="_blank">
                <Button variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" /> View Public Page
                </Button>
            </Link>
            <Link href="/products/new">
                <Button className="gap-1"><PlusCircle className="h-4 w-4" /> Add New Product</Button>
            </Link>
         </div>
       </div>
       
       {/* Stat Cards */}
       <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalPotentialRevenue.toLocaleString('en-IN')}</div>
                <p className="text-xs text-muted-foreground">From all LIVE products</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Live Products</CardTitle>
                <PackageCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.liveProductsCount}</div>
                <p className="text-xs text-muted-foreground">{stats.draftProductsCount} products in draft</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lifetime Sales</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹0</div>
                <p className="text-xs text-muted-foreground">Order tracking coming soon!</p>
            </CardContent>
        </Card>
       </div>
       
       {/* AI Widgets */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PromotionalCalendar />
        <AiSuggestions />
       </div>
    </div>
  )
}