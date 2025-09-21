// File: app/[locale]/(platform)/dashboard/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Eye } from "lucide-react";
import prisma from "@/lib/prisma";
import { AiSuggestions } from "@/components/ai-suggestions";
import { getTranslations } from "next-intl/server";
// IMPORT THE NEW COMPONENT
import { PromotionalCalendar } from "@/components/promotional-calendar";

async function getDashboardStats() {
    const products = await prisma.product.findMany();
    const liveProducts = products.filter(p => p.status === 'LIVE');
    const totalSales = liveProducts.reduce((sum, p) => sum + p.price, 0);
    const draftProducts = products.length - liveProducts.length;
    return { totalSales, liveProducts: liveProducts.length, draftProducts };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const t = await getTranslations('Dashboard');

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('welcome')}</p>
         </div>
         <div className="flex items-center gap-2">
            <Link href="/artisan/main_artisan" target="_blank">
                <Button variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" /> {t('viewPublicPage')}
                </Button>
            </Link>
            <Link href="/products/new">
                <Button className="gap-1"><PlusCircle className="h-4 w-4" />{t('addNewProduct')}</Button>
            </Link>
         </div>
       </div>
       
       <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {/* ... existing stat cards ... */}
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
       
       {/* WRAP THE TWO AI WIDGETS IN A GRID */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PromotionalCalendar />
        <AiSuggestions />
       </div>
    </div>
  )
}