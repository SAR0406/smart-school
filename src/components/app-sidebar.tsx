"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bot, GraduationCap, LayoutDashboard, MessageSquare, ScanLine } from "lucide-react";
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ClassSelector } from "@/components/class-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/ai", label: "AI Tools", icon: Bot },
    { href: "/gemini", label: "Gemini", icon: Bot },
    { href: "/ai/scanner", label: "Scanner", icon: ScanLine },
];

function AppSidebar() {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    // Make dashboard link active for the root of dashboard routes as well
    if (href === "/dashboard") {
      return pathname === href || pathname.startsWith('/dashboard');
    }
    return pathname === href;
  };

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon" className="group glassmorphism border-r-0">
      <SidebarHeader className="flex items-center justify-between p-2 md:p-0">
        <Link href="/" className="flex h-12 items-center gap-2 px-2 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:justify-center">
          <GraduationCap className="size-6 text-primary" />
          <h1 className="text-xl font-bold text-primary group-data-[collapsible=icon]:hidden font-headline">
            SchoolZen
          </h1>
        </Link>
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2 flex flex-col justify-between">
        <div>
            <ClassSelector />
            <SidebarMenu className="mt-4">
                {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                         <Link href={item.href} className="w-full">
                            <SidebarMenuButton 
                              isActive={isLinkActive(item.href)}
                              tooltip={item.label}
                              className={cn(
                                "data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/80 data-[active=true]:to-primary"
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
        <SidebarFooter className="hidden md:flex">
            <ThemeToggle />
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}

// Exporting provider as well
export { AppSidebar, SidebarProvider };
