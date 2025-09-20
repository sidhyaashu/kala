import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
       <div className="flex items-center justify-between">
         <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
         <Link href="/dashboard/products/new">
            <Button className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Add New Product
            </Button>
         </Link>
       </div>

       <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 mt-6">
        <Card>
            <CardHeader>
                <CardTitle>Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹ 1,25,304</div>
                <p className="text-xs text-muted-foreground">+15.2% from last month</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Active Products</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">2 products pending approval</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>New Orders</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+5</div>
                <p className="text-xs text-muted-foreground">In the last 24 hours</p>
            </CardContent>
        </Card>
       </div>
       <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Your "Hand-carved Wooden Elephant" was viewed 58 times today.</p>
                <p className="mt-2 text-sm text-muted-foreground">AI Suggestion: Consider running a promotion for the upcoming festival season.</p>
            </CardContent>
        </Card>
       </div>
    </div>
  )
}