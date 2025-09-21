// File: app/(platform)/dashboard/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Lightbulb } from "lucide-react";
import prisma from "@/lib/prisma";
import { VertexAI } from "@google-cloud/vertexai";

// This Server Component now fetches data and calls AI for insights
async function getDashboardInsights() {
    const products = await prisma.product.findMany();
    
    if (products.length === 0) {
        return {
            totalSales: 0,
            liveProducts: 0,
            draftProducts: 0,
            aiSummary: "No products yet. Add your first product to start seeing insights!",
        };
    }
    
    const liveProducts = products.filter(p => p.status === 'LIVE');
    const totalSales = liveProducts.reduce((sum, p) => sum + p.price, 0);
    const draftProducts = products.length - liveProducts.length;

    // Call Vertex AI for a summary
    try {
        const vertex_ai = new VertexAI({
          project: process.env.GOOGLE_PROJECT_ID!,
          location: "us-central1",
          googleAuthOptions: {
            credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!),
          }
        });
        const model = process.env.MODEL as string;
        const generativeModel = vertex_ai.getGenerativeModel({ model });

        const productNames = products.map(p => p.name).join(', ');
        const prompt = `
            You are a business analyst for an artisan marketplace. Based on this data, provide a short, encouraging, and insightful summary (1-2 sentences) for the artisan's dashboard.
            - Total Products: ${products.length}
            - Live Products: ${liveProducts.length}
            - Draft Products: ${draftProducts}
            - Total Potential Revenue (from live products): ₹${totalSales.toLocaleString('en-IN')}
            - Product Names: ${productNames}
            
            Example: "Great start! You have ${liveProducts.length} products live. Consider promoting your '${productNames.split(',')[0]}' this week to boost sales."
        `;
        
        const resp = await generativeModel.generateContent(prompt);
        const aiSummary = resp.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "Keep up the great work! Your creations are gaining attention.";
        
        return { totalSales, liveProducts: liveProducts.length, draftProducts, aiSummary };
    } catch (error) {
        console.error("AI insight generation failed:", error);
        return { totalSales, liveProducts: liveProducts.length, draftProducts, aiSummary: "Could not load AI insights. Check your products and try again later." };
    }
}

export default async function DashboardPage() {
  const insights = await getDashboardInsights();

  return (
    <div>
       <div className="flex items-center justify-between">
         <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
         <Link href="/products/new"><Button className="gap-1"><PlusCircle className="h-4 w-4" />Add New Product</Button></Link>
       </div>
       
       <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 mt-6">
        <Card>
            <CardHeader><CardTitle>Potential Revenue</CardTitle></CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹ {insights.totalSales.toLocaleString('en-IN')}</div>
                <p className="text-xs text-muted-foreground">From all LIVE products</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Live Products</CardTitle></CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{insights.liveProducts}</div>
                <p className="text-xs text-muted-foreground">{insights.draftProducts} products in draft</p>
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
       
       <div className="mt-8">
        <Card className="bg-amber-50 border-amber-200">
            <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="text-amber-500" /> AI-Powered Insight</CardTitle></CardHeader>
            <CardContent>
                <p>{insights.aiSummary}</p>
            </CardContent>
        </Card>
       </div>
    </div>
  )
}