import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, BotMessageSquare, Globe } from "lucide-react";
import { signIn } from "@/lib/auth";

export default function LandingPage() {
  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/hero-background.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/80 to-orange-500/80" />
        <div className="relative z-10 text-center p-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            From Your Hands to the World's Hearts.
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
            Let our AI assistant handle the marketing, storytelling, and sales, so you can focus on your craft.
          </p>
          <form
             action={async () => {
              "use server";
              // A simple sign-in for the MVP.
              // Use any email and the password 'password'
              await signIn("credentials", { email: 'artisan@test.com', password: 'password', redirectTo: '/dashboard' });
            }}
          >
            <Button size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6 px-8">
              Start Selling for Free ✨
            </Button>
          </form>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4">1. Upload Your Craft</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Simply upload a photo of your product and tell us its story in your own language.</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                  <BotMessageSquare className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4">2. AI Creates Magic</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Our AI generates beautiful descriptions, compelling stories, and sets the perfect price.</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4">3. Reach Global Buyers</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We automatically list your creation on Etsy, Amazon, and social media.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Loved by Artisans</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="https://i.pravatar.cc/150?img=1" alt="Artisan Priya" />
                    <AvatarFallback>P</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Priya Sharma</p>
                    <p className="text-sm text-muted-foreground">Pottery Artist</p>
                  </div>
                </div>
                <blockquote className="mt-4 italic text-gray-700">
                  "I never thought selling online could be this easy. The AI writer captured the soul of my work perfectly."
                </blockquote>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                 <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="https://i.pravatar.cc/150?img=2" alt="Artisan Raj" />
                    <AvatarFallback>R</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Raj Kumar</p>
                    <p className="text-sm text-muted-foreground">Wood Carver</p>
                  </div>
                </div>
                <blockquote className="mt-4 italic text-gray-700">
                  "The automatic listing to multiple sites saves me hours every week. It's a game-changer!"
                </blockquote>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}