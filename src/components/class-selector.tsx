
"use client";

import { useState, useEffect } from "react";
import { School } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllClasses } from "@/lib/api";
import type { Class } from "@/lib/types";
import { useSidebar } from "./ui/sidebar";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

export function ClassSelector() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  // useSidebar can be called conditionally
  const sidebar = useSidebar();
  const sidebarState = sidebar?.state ?? 'expanded';


  useEffect(() => {
    setIsMounted(true);
    async function fetchClasses() {
      try {
        const data = await getAllClasses();
        setClasses(data);
        if (data.length > 0) {
          const savedClass = localStorage.getItem("selectedClass");
          if (savedClass && data.some((c) => c.id === savedClass)) {
            setSelectedClass(savedClass);
          } else {
            const defaultClass = data[0].id;
            setSelectedClass(defaultClass);
            localStorage.setItem("selectedClass", defaultClass);
          }
        }
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchClasses();
  }, []);

  const handleValueChange = (value: string) => {
    setSelectedClass(value);
    localStorage.setItem("selectedClass", value);
    window.dispatchEvent(new Event('storage')); // Notify other components of the change
  };

  if (!isMounted || isLoading) {
    return (
        <div className="space-y-2 p-2 md:p-0">
            <Skeleton className={cn("h-4 w-1/3", sidebarState === 'collapsed' ? 'hidden' : 'block')} />
            <Skeleton className="h-10 w-full" />
        </div>
    );
  }

  // This check is to determine if the component is being rendered inside the sidebar context
  const isinSidebar = !!sidebar;

  return (
    <div className={cn("space-y-2", isinSidebar && 'p-2')}>
       {isinSidebar && (
         <label
          htmlFor="class-selector"
          className={cn("text-sm font-medium text-sidebar-foreground/70", sidebarState === 'collapsed' && 'hidden')}
        >
          My Class
        </label>
       )}
      <Select value={selectedClass} onValueChange={handleValueChange} disabled={classes.length === 0}>
        <SelectTrigger
          id="class-selector"
          className={cn(
              isinSidebar ? "bg-sidebar-accent border-sidebar-border focus:ring-sidebar-ring" : "",
              isinSidebar && sidebarState === 'collapsed' && 'w-10 h-10 p-2 justify-center'
            )}
        >
            <div className={cn("flex items-center gap-2", isinSidebar && sidebarState === 'collapsed' && 'hidden')}>
              <School className="h-4 w-4" />
              <SelectValue placeholder="Select..." />
            </div>
             {isinSidebar && sidebarState === 'collapsed' && <School className="h-5 w-5" />}

        </SelectTrigger>
        <SelectContent>
          {classes.length === 0 ? (
             <SelectItem value="loading" disabled>No classes found</SelectItem>
          ) : (
            classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
