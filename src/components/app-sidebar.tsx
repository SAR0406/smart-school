
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bot, GraduationCap, LayoutDashboard, MessageSquare } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ClassSelector } from "@/components/class-selector";

const menuItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/ai", label: "AI Tools", icon: Bot },
    { href: "/gemini", label: "Gemini", icon: Bot },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon" className="group">
      <SidebarHeader>
        <div className="flex h-12 items-center gap-2 px-2 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:justify-center">
          <GraduationCap className="size-6 text-primary" />
          <h1 className="text-xl font-bold text-primary group-data-[collapsible=icon]:hidden">
            SchoolZen
          </h1>
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
                              isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')} 
                              tooltip={item.label}
                            >
                                <item.icon />
                                <span>{item.label}</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
