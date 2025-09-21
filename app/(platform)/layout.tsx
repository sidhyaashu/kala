import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Package, PlusCircle, Menu, Settings, TrendingUp, Ship, User, Brush } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import prisma from "@/lib/prisma";

type Props = {
  children: React.ReactNode;
};

// Main layout for the authenticated part of the application
export default async function AppLayout({ children }: Props) {
  // Fetch profile data to display in the header
  const profile = await prisma.artisanProfile.findUnique({
    where: { id: "main_artisan" },
  });

  const navItems = [
    { href: `/dashboard`, icon: Home, label: "Dashboard" },
    { href: `/logistics`, icon: Ship, label: "Logistics" },
    { href: `/trends`, icon: TrendingUp, label: "Market Trends" },
    { href: `/products`, icon: Package, label: "My Products" },
    { href: `/products/new`, icon: PlusCircle, label: "Add New Product" },
    { href: `/settings`, icon: Settings, label: "Settings" },
  ];

  const SidebarContent = () => (
    <div className="flex h-full max-h-screen flex-col gap-2 bg-muted/40">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href={`/dashboard`} className="flex items-center gap-2 font-bold text-lg text-purple-600">
          <Brush className="h-6 w-6"/>
          <span>Kala AI</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r md:block">
        <SidebarContent />
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0 w-full max-w-xs">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Header Actions */}
          <div className="w-full flex-1 flex items-center justify-end gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm hidden md:inline-block">
                {profile?.name || "Artisan"}
              </span>
              <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.profileImage || ''} alt={profile?.name || ''} />
                  <AvatarFallback><User/></AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}