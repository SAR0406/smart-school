import { Button } from "@/components/ui/button";
import { HeroIllustration } from "@/components/hero-illustration";
import { GraduationCap, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
         <HeroIllustration />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 lg:p-8 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold font-headline">SchoolZen</span>
            </Link>
            <nav className="flex items-center gap-4">
                <Button className="shadow-[0_0_20px] shadow-primary/50" asChild>
                    <Link href="/dashboard">Get Started</Link>
                </Button>
            </nav>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="inline-flex items-center rounded-full bg-secondary text-sm font-medium px-4 py-2 mb-6 text-center">
                <Sparkles className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                <span>Powered by the latest in Generative AI</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-headline max-w-4xl tracking-tighter">
                The Future of Learning, <span className="text-glow bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Personalized.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base md:text-lg text-muted-foreground">
                SchoolZen is an intelligent learning platform that adapts to you. Get personalized study plans, instant help, and engaging content to achieve your academic goals faster.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
                 <Button size="lg" className="shadow-[0_0_20px] shadow-primary/50" asChild>
                    <Link href="/dashboard">
                        Start Learning Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </main>
      </div>
    </div>
  );
}
