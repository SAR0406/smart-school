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
import { getDayScheduleByDay } from "@/lib/api";
import type { Period } from "@/lib/types";
import { ScrollArea } from "./ui/scroll-area";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const LoadingSkeleton = () => (
    <div className="space-y-4">
        <div className="grid w-full grid-cols-3 md:grid-cols-7 gap-2 px-1">
            {daysOfWeek.map(day => (
                <Skeleton key={day} className="h-10 w-full" />
            ))}
        </div>
        <div className="flex items-center justify-center p-8">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    </div>
);


export function FullWeekSchedule() {
  const [schedule, setSchedule] = useState<Record<string, Period[]>>({});
  const [loadingDay, setLoadingDay] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [initialDay, setInitialDay] = useState(daysOfWeek[0]);

  useEffect(() => {
    setIsMounted(true);
    const todayIndex = new Date().getDay() - 1;
    // getDay() returns 0 for Sunday, 1 for Monday, etc.
    // We want Monday to be 0, Sunday to be 6
    const adjustedTodayIndex = todayIndex < 0 ? 6 : todayIndex;
    if (adjustedTodayIndex < daysOfWeek.length) {
      setInitialDay(daysOfWeek[adjustedTodayIndex]);
    }
  }, []);

  const fetchScheduleForDay = async (day: string) => {
    // Don't refetch if we already have the data
    if (schedule[day]) return;
    
    setLoadingDay(day);
    setError(null);
    try {
        const classId = localStorage.getItem("selectedClass");
        if (!classId) {
            setError("Please select a class to view the schedule.");
            return;
        }
      const data = await getDayScheduleByDay(day);
      setSchedule(prev => ({ ...prev, [day]: data }));
    } catch (err) {
      console.error(`Failed to fetch schedule for ${day}:`, err);
      setError(`Could not load the schedule for ${day}.`);
    } finally {
      setLoadingDay(null);
    }
  };

  useEffect(() => {
    if (isMounted) {
        fetchScheduleForDay(initialDay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, initialDay]);

  if (!isMounted) {
    return <LoadingSkeleton />;
  }
  
  return (
    <Tabs defaultValue={initialDay} className="w-full h-full flex flex-col" onValueChange={fetchScheduleForDay}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
            {daysOfWeek.map(day => (
                <TabsTrigger key={day} value={day}>{day}</TabsTrigger>
            ))}
        </TabsList>
        <ScrollArea className="flex-grow mt-4">
             <div className="pr-4">
                {daysOfWeek.map(day => (
                    <TabsContent key={day} value={day} className="mt-0">
                        {loadingDay === day && (
                             <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        )}
                        {schedule[day] && <ScheduleTable periods={schedule[day]} />}
                        {error && loadingDay === null && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </TabsContent>
                ))}
            </div>
        </ScrollArea>
    </Tabs>
  );
}

function ScheduleTable({ periods }: { periods: Period[] }) {
    if (!periods || periods.length === 0 || (periods.length === 1 && periods[0].subject === 'Holiday')) {
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
