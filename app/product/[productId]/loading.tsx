// File: app/product/[productId]/loading.tsx
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto p-4 md:p-8">
        <Card className="grid md:grid-cols-2 gap-8 lg:gap-12 p-6 md:p-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="flex flex-col justify-center space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <div className="pt-4">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}