import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import { UserCircle, Brush } from "lucide-react";

type Props = {
  params: { profileId: string }
}

// --- Dynamic Metadata Generation ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await prisma.artisanProfile.findUnique({
    where: { id: params.profileId },
  });
 
  if (!profile || !profile.name) {
    return {
      title: "Artisan Not Found",
      description: "The requested artisan profile could not be found.",
    }
  }
 
  return {
    title: `${profile.name} | Artisan Showcase`,
    description: profile.bio?.substring(0, 150) + '...' || `Discover the handcrafted creations by ${profile.name}.`,
  }
}

// --- Page Component ---
export default async function ArtisanPage({ params }: Props) {
    const profile = await prisma.artisanProfile.findUnique({
        where: { id: params.profileId },
    });

    if (!profile || !profile.name) {
        notFound();
    }

    const liveProducts = await prisma.product.findMany({
        where: { status: 'LIVE' },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="bg-gray-50 min-h-screen">
            <main className="container mx-auto p-4 md:p-8">
                {/* --- Header Section --- */}
                <Card className="overflow-hidden shadow-lg">
                    <div className="relative h-48 md:h-64 bg-gradient-to-r from-purple-50 to-orange-50">
                        <Image 
                            src="https://images.unsplash.com/photo-1528629291221-c39c35544d66?q=80&w=2670&auto-format&fit=crop" 
                            alt="Artisan cover" 
                            fill 
                            className="object-cover opacity-50"
                            priority
                        />
                    </div>
                    <CardContent className="p-6 text-center -mt-16 z-10 relative">
                        <div className="relative h-32 w-32 rounded-full mx-auto border-4 border-white shadow-md bg-muted flex items-center justify-center">
                            {profile.profileImage ? (
                                <Image src={profile.profileImage} alt={profile.name || 'Artisan'} fill className="rounded-full object-cover" />
                            ) : (
                                <UserCircle className="h-20 w-20 text-muted-foreground" />
                            )}
                        </div>
                        <h1 className="text-3xl font-bold mt-4">{profile.name}</h1>
                        <p className="text-muted-foreground mt-1">Local Artisan</p>
                    </CardContent>
                </Card>

                {/* --- About & Products Grid --- */}
                <div className="grid lg:grid-cols-3 gap-8 mt-8">
                    {/* About Section */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <Card className="shadow-lg h-fit">
                                <CardHeader><CardTitle>About the Artisan</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{profile.bio || "Story coming soon. The artisan can add this from their settings page."}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-6">Creations</h2>
                        {liveProducts.length > 0 ? (
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {liveProducts.map(product => (
                                    <Link key={product.id} href={`/product/${product.id}`} className="block">
                                        <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group h-full flex flex-col">
                                            <div className="relative w-full aspect-square bg-muted">
                                                {product.imageUrl ? (
                                                    <Image 
                                                        src={product.imageUrl} 
                                                        alt={product.name} 
                                                        fill 
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-muted-foreground"><Brush /></div>
                                                )}
                                            </div>
                                            <CardContent className="p-4 flex-grow">
                                                <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                                                <p className="text-lg font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <Card className="flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
                                <Brush size={48} className="text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold">Creations Coming Soon!</h3>
                                <p className="text-muted-foreground mt-2 max-w-sm">This artisan is busy crafting their next masterpiece. Check back soon to see their collection.</p>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}