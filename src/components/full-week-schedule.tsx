"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getFullWeekSchedule } from "@/lib/api";
import type { WeekSchedule, Period } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const LoadingSkeleton = () => (
    <div className="space-y-4">
        <div className="grid w-full grid-cols-3 md:grid-cols-7 gap-2 px-1">
            {daysOfWeek.map(day => (
                <Skeleton key={day} className="h-10 w-full" />
            ))}
        </div>
        <Skeleton className="h-64 w-full" />
    </div>
);


export function FullWeekSchedule() {
  const [schedule, setSchedule] = useState<WeekSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    async function fetchSchedule() {
      try {
        const data = await getFullWeekSchedule();
        setSchedule(data);
      } catch (error) {
        console.error("Failed to fetch week schedule:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchedule();
  }, [isMounted]);

  if (!isMounted || isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Tabs defaultValue="Monday" className="w-full h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
            {daysOfWeek.map(day => (
                <TabsTrigger key={day} value={day}>{day.slice(0,3)}</TabsTrigger>
            ))}
        </TabsList>
        <ScrollArea className="flex-grow mt-4">
             <div className="pr-4">
                {daysOfWeek.map(day => (
                    <TabsContent key={day} value={day} className="mt-0">
                        <ScheduleTable periods={schedule ? schedule[day.toLowerCase() as keyof WeekSchedule] : []} />
                    </TabsContent>
                ))}
            </div>
        </ScrollArea>
    </Tabs>
  );
}

function ScheduleTable({ periods }: { periods: Period[] }) {
    if (!periods || periods.length === 0) {
        return <p className="text-muted-foreground text-center p-8">No classes scheduled for this day.</p>
    }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead className="hidden md:table-cell">Teacher</TableHead>
          <TableHead className="hidden md:table-cell">Room</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {periods.map((period, index) => (
          <TableRow key={index}>
            <TableCell>{period.time}</TableCell>
            <TableCell className="font-medium">{period.subject}</TableCell>
            <TableCell className="hidden md:table-cell">{period.teacher}</TableCell>
            <TableCell className="hidden md:table-cell">{period.room}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}