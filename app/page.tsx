// File: app/page.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth"; // Correct import

export default function LandingPage() {
  // This is the Server Action that will handle the form submission
  async function handleSignIn(formData: FormData) {
    "use server";
    // The signIn function from lib/auth.ts correctly handles FormData
    await signIn("credentials", formData);
  }

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-white p-4">
        <div
          className="absolute inset-0 bg-cover bg-center brightness-[.4]"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?q=80&w=2670&auto=format&fit=crop)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-orange-600/50" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            From Your Hands to the World's Hearts.
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
            Let our AI assistant handle the marketing, storytelling, and sales, so you can focus on your craft.
          </p>
          
          <Card className="max-w-md mx-auto mt-8 bg-black/40 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
                <CardTitle>Welcome, Artisan! Sign In</CardTitle>
                <CardDescription className="text-gray-300">
                    Enter your details to access your dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSignIn} className="space-y-4">
                    <div className="text-left">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            name="email" 
                            id="email" 
                            type="email" 
                            placeholder="artisan@example.com" 
                            required 
                            className="bg-white/10 border-white/20 placeholder:text-gray-400 mt-1"
                        />
                    </div>
                    <div className="text-left">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                            name="password" 
                            id="password" 
                            type="password" 
                            required 
                            className="bg-white/10 border-white/20 mt-1"
                        />
                        <p className="text-xs text-gray-400 mt-2">
                            For this demo, use any email and the password: `password`
                        </p>
                    </div>

                    <Button size="lg" className="w-full bg-amber-500 text-black hover:bg-amber-400 font-bold text-lg py-3">
                        Enter Your Workshop ✨
                    </Button>
                </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}