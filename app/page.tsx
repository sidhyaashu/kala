"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import { Sparkles } from "lucide-react";

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEnter = () => {
    setIsLoading(true);
    // Simulate a loading process
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <main className="flex-grow relative">
      {isLoading && <Loader />}
      
      <section className="relative min-h-screen flex items-center justify-center text-white p-4 text-center">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center brightness-[.4]"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?q=80&w=2670&auto=format&fit=crop)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-orange-600/50" />
        
        {/* Content */}
        <div className="relative z-10 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">
            From Your Hands to the World's Hearts
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-gray-200 drop-shadow-md">
            Let our AI assistant handle the marketing, storytelling, and sales, so you can focus on your craft.
          </p>
          
          <Button 
            onClick={handleEnter}
            size="lg" 
            className="mt-12 w-full max-w-xs bg-amber-500 text-black hover:bg-amber-400 font-bold text-lg py-6 px-8 rounded-full shadow-lg transform transition-transform hover:scale-105"
          >
            Enter Your Workshop <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </main>
  );
}