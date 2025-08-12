import { GraduationCap, Menu } from 'lucide-react';
import { ClassSelector } from '@/components/class-selector';
import { CurrentPeriodCard } from '@/components/current-period-card';
import { TodayScheduleCard } from '@/components/today-schedule-card';
import { SubjectSearch } from '@/components/subject-search';
import { AIAssistant } from '@/components/ai-assistant';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-primary">
            SchoolZen
          </h1>
        </div>
        <div className="ml-auto md:hidden">
            <MobileNav />
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <CurrentPeriodCard />
              <ClassSelector />
            </div>
            <div className="md:hidden space-y-6">
                <CurrentPeriodCard />
                <ClassSelector />
            </div>
            <TodayScheduleCard />
            <SubjectSearch />
          </div>

          <div className="lg:col-span-1 lg:row-start-1 lg:col-start-3">
             <div className="sticky top-24">
                <AIAssistant />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MobileNav() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open navigation</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm">
                <div className="p-4 space-y-6">
                    <CurrentPeriodCard />
                    <ClassSelector />
                    <TodayScheduleCard />
                    <SubjectSearch />
                </div>
            </SheetContent>
        </Sheet>
    )
}
