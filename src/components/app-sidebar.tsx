"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bot, GraduationCap, LayoutDashboard, Database, HelpCircle, BookOpen, FileText, Code } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/components/ui/sidebar";
import { ClassSelector } from "@/components/class-selector";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import React from "react";

const menuItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/ai", label: "AI Assistant", icon: Bot },
];

const googleAiTools = [
  { href: "/google-ai/quiz-generator", label: "Quiz Generator", icon: HelpCircle },
  { href: "/google-ai/notes-generator", label: "Notes Generator", icon: BookOpen },
  { href: "/google-ai/summarizer", label: "Summarizer", icon: FileText },
  { href: "/google-ai/coding-helper", label: "Coding Helper", icon: Code },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isAiMenuOpen, setIsAiMenuOpen] = React.useState(pathname.startsWith('/google-ai'));

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
                            <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                                <item.icon />
                                <span>{item.label}</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))}
                 <Collapsible open={isAiMenuOpen} onOpenChange={setIsAiMenuOpen}>
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                             <SidebarMenuButton tooltip="Google AI">
                                <Database />
                                <span>Google AI</span>
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                    </SidebarMenuItem>
                    <CollapsibleContent asChild>
                        <SidebarMenuSub>
                            {googleAiTools.map((item) => (
                                 <SidebarMenuSubItem key={item.href}>
                                     <Link href={item.href} className="w-full">
                                        <SidebarMenuSubButton isActive={pathname === item.href}>
                                            <item.icon />
                                            <span>{item.label}</span>
                                        </SidebarMenuSubButton>
                                     </Link>
                                 </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                 </Collapsible>
            </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
