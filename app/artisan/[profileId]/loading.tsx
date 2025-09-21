// File: app/artisan/[profileId]/loading.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArtisanLoading() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="container mx-auto p-4 md:p-8">
        <Card className="overflow-hidden">
          <Skeleton className="h-48 md:h-64 w-full" />
          <CardContent className="p-6 text-center -mt-16 z-10 relative">
            <Skeleton className="h-32 w-32 rounded-full mx-auto border-4 border-white" />
            <Skeleton className="h-9 w-48 mt-4 mx-auto" />
            <Skeleton className="h-5 w-32 mt-2 mx-auto" />
          </CardContent>
        </Card>
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-1">
             <div className="sticky top-8">
                <Card>
                  <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
            </div>
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-8 w-1/3 mb-6" />
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full aspect-square" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}