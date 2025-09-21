// File: app/[locale]/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEnter = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <main className="flex-grow relative">
      {isLoading && <Loader />}
      
      <section className="relative min-h-screen flex items-center justify-center text-white p-4">
        <div
          className="absolute inset-0 bg-cover bg-center brightness-[.5]"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?q=80&w=2670&auto=format&fit=crop)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-orange-600/50" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            From Your Hands to the World's Hearts
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
            Let our AI assistant handle the marketing, storytelling, and sales, so you can focus on your craft.
          </p>
          
          <Button 
            onClick={handleEnter}
            size="lg" 
            className="mt-12 w-full max-w-xs bg-amber-500 text-black hover:bg-amber-400 font-bold text-lg py-6 px-8 animate-bounce"
          >
            Enter Your Workshop ✨
          </Button>
        </div>
      </section>
    </main>
  );
}