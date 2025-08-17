import { WelcomeCard } from "@/components/welcome-card";
import { CurrentPeriodCard } from "@/components/current-period-card";
import { TodayScheduleCard } from "@/components/today-schedule-card";
import { SubjectSearch } from "@/components/subject-search";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { GraduationCap } from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="relative flex min-h-svh flex-1 flex-col bg-background">
       <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-2">
                 <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold md:text-xl flex items-center gap-2 font-headline">
                    <GraduationCap className="h-5 w-5" /> Dashboard
                </h1>
            </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-3">
                    <WelcomeCard />
                </div>
                <div className="lg:col-span-1">
                    <CurrentPeriodCard />
                </div>
                <div className="lg:col-span-2">
                    <TodayScheduleCard />
                </div>
                 <div className="lg:col-span-3">
                    <SubjectSearch />
                </div>
            </div>
        </div>
    </main>
  );
}
