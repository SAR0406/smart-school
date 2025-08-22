
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bot, GraduationCap, LayoutDashboard, MessageSquare, ScanLine } from "lucide-react";
import React from "react";
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { ClassSelector } from "@/components/class-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { OnboardingTour } from "./onboarding-tour";

const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, tourId: 'dashboard' },
    { href: "/ai", label: "AI Tools", icon: Bot, tourId: 'ai-tools' },
    { href: "/gemini", label: "Gemini", icon: Bot, tourId: 'gemini' },
    { href: "/ai/scanner", label: "Scanner", icon: ScanLine, tourId: 'scanner' },
];

function AppSidebarContent() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  
  const refs = {
    dashboard: React.useRef<HTMLButtonElement>(null),
    'ai-tools': React.useRef<HTMLButtonElement>(null),
    gemini: React.useRef<HTMLButtonElement>(null),
    scanner: React.useRef<HTMLButtonElement>(null),
  };

  const isLinkActive = (href: string) => {
    // Make dashboard link active for the root of dashboard routes as well
    if (href === "/dashboard") {
      return pathname === href || pathname.startsWith('/dashboard');
    }
    return pathname === href;
  };

  return (
    <>
      <SidebarHeader className="flex items-center justify-between p-2 md:p-0">
        <Link href="/" className="flex h-12 items-center gap-2 px-2 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:justify-center">
          <GraduationCap className="size-6 text-primary" />
          <h1 className="text-xl font-bold text-primary group-data-[collapsible=icon]:hidden font-headline">
            SchoolZen
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2 flex flex-col justify-between">
        <div>
            <div className="md:hidden">
              <ClassSelector />
            </div>
            <SidebarMenu className="mt-4">
                {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                         <Link href={item.href} className="w-full">
                            <SidebarMenuButton
                              ref={refs[item.tourId as keyof typeof refs]}
                              isActive={isLinkActive(item.href)}
                              tooltip={item.label}
                              className={cn(
                                "data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/20 data-[active=true]:to-primary/50 data-[active=true]:text-primary data-[active=true]:border-primary/30 data-[active=true]:border"
                              )}
                            >
                                <item.icon />
                                <span>{item.label}</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </div>
        <SidebarFooter className={cn("hidden", !isMobile && "md:flex")}>
            <ThemeToggle />
        </SidebarFooter>
      </SidebarContent>
       <OnboardingTour refs={refs} />
    </>
  );
}


function AppSidebar() {
  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon" className="group glassmorphism border-r-0">
      <AppSidebarContent />
    </Sidebar>
  );
}

// Exporting provider as well
export { AppSidebar, SidebarProvider };
