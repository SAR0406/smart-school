import { WelcomeCard } from "@/components/welcome-card";
import { CurrentPeriodCard } from "@/components/current-period-card";
import { TodayScheduleCard } from "@/components/today-schedule-card";
import { SubjectSearch } from "@/components/subject-search";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ClassSelector } from "@/components/class-selector";

export default function Home() {
  return (
    <main className="relative flex min-h-svh flex-1 flex-col bg-background">
       <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-lg font-semibold md:text-xl font-headline">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden md:block w-48">
              <ClassSelector />
            </div>
            <div className="md:hidden">
              <ThemeToggle />
            </div>
        </div>
      </header>

      <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
        <WelcomeCard />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <TodayScheduleCard />
          </div>
          <div className="space-y-4 lg:space-y-8">
            <CurrentPeriodCard />
            <SubjectSearch />
          </div>
        </div>
      </div>
    </main>
  );
}
