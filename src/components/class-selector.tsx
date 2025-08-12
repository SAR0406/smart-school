"use client";

import { useState, useEffect } from "react";
import { ChevronsUpDown, School, Loader2 } from "lucide-react";
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
  const { state: sidebarState } = useSidebar();

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
            setSelectedClass(data[0].id);
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
    // Optional: Reload or notify other components if needed
    window.location.reload();
  };

  if (!isMounted || isLoading) {
    return (
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor="class-selector"
        className={cn("text-sm font-medium text-sidebar-foreground/70", sidebarState === 'collapsed' && 'hidden')}
      >
        My Class
      </label>
      <Select value={selectedClass} onValueChange={handleValueChange}>
        <SelectTrigger
          id="class-selector"
          className={cn("w-full bg-sidebar-accent border-sidebar-border focus:ring-sidebar-ring", sidebarState === 'collapsed' && 'w-10 h-10 p-2 justify-center')}
        >
            <div className={cn("flex items-center gap-2", sidebarState === 'collapsed' && 'hidden')}>
              <School className="h-4 w-4" />
              <SelectValue placeholder="Select..." />
            </div>
            {sidebarState === 'collapsed' && <School className="h-5 w-5" />}

        </SelectTrigger>
        <SelectContent>
          {classes.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
