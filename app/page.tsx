// File: app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { signIn } from "next-auth/react";
import { use } from "react";


export default function LandingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {

  const { error } = use(searchParams);
  const hasError = error === "CredentialsSignin";

async function handleSignIn(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  await signIn("credentials", {
    email,
    password,
    redirect: true,
    callbackUrl: "/dashboard",
  });
}


  return (
    <main className="flex-grow">
      {error && (
        <p className="text-red-500 mb-4">Invalid email or password</p>
      )}
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
                {/* The form calls the server action directly. */}
                <form action={handleSignIn} className="space-y-4">
                    
                    {/* START: Improved Error Message Display */}
                    {error && (
                        <div className="bg-red-500/30 border border-red-500/50 text-red-200 text-sm p-3 rounded-md flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Sign-in failed. Please check your password.</span>
                        </div>
                    )}
                    {/* END: Error Message Display */}

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

                    <Button type="submit" size="lg" className="w-full bg-amber-500 text-black hover:bg-amber-400 font-bold text-lg py-3">
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