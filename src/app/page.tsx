import {
  BookCopy,
  Bot,
  GraduationCap,
  LayoutGrid,
  Search,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ClassSelector } from "@/components/class-selector";
import { WelcomeCard } from "@/components/welcome-card";
import { CurrentPeriodCard } from "@/components/current-period-card";
import { TodayScheduleCard } from "@/components/today-schedule-card";
import { SubjectSearch } from "@/components/subject-search";
import { AIAssistant } from "@/components/ai-assistant";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="group">
        <SidebarHeader>
          <div className="flex h-12 items-center gap-2 px-2 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:justify-center">
            <GraduationCap className="size-6 text-primary" />
            <h1 className="text-xl font-bold text-primary group-data-[collapsible=icon]:hidden">
              SchoolZen
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <ClassSelector />
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <AIAssistant />
          </div>
        </header>

        <main className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
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
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
