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
import { ScrollArea } from "./ui/scroll-area";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { AlertTriangle } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    async function fetchSchedule() {
      try {
        const classId = localStorage.getItem("selectedClass");
        if (!classId) {
            setError("Please select a class to view the schedule.");
            setIsLoading(false);
            return;
        }
        const data = await getFullWeekSchedule();
        setSchedule(data);
      } catch (err) {
        console.error("Failed to fetch week schedule:", err);
        setError("Could not load the weekly schedule. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchedule();
  }, [isMounted]);
  
  if (error) {
    return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    )
  }

  if (!isMounted || isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Tabs defaultValue="Monday" className="w-full h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
            {daysOfWeek.map(day => (
                <TabsTrigger key={day} value={day}>{day}</TabsTrigger>
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {periods.map((period, index) => (
          <TableRow key={index}>
            <TableCell>{period.time}</TableCell>
            <TableCell className="font-medium">{period.subject}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
