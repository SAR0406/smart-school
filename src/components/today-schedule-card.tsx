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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Loader2, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getDaySchedule } from "@/lib/api";
import type { Period } from "@/lib/types";
import { FullWeekSchedule } from "./full-week-schedule";
import { ScrollArea } from "@/components/ui/scroll-area";

const LoadingSkeleton = () => (
    <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
    </div>
);

export function TodayScheduleCard() {
  const [schedule, setSchedule] = useState<Period[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    async function fetchSchedule() {
      try {
        const data = await getDaySchedule();
        setSchedule(data);
      } catch (error) {
        console.error("Failed to fetch today's schedule:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchedule();
  }, [isMounted]);
  
  if (!isMounted) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today's Schedule
                </CardTitle>
            </CardHeader>
            <CardContent>
                <LoadingSkeleton />
            </CardContent>
            <CardFooter className="flex justify-end">
                 <Button variant="outline" disabled>
                    View Full Week
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <LoadingSkeleton />
        ) : schedule.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Time</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="hidden md:table-cell">Room</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map((period, index) => (
                <TableRow key={index}>
                  <TableCell>{period.time}</TableCell>
                  <TableCell className="font-medium">{period.subject}</TableCell>
                  <TableCell className="hidden md:table-cell">{period.room}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
            <p className="text-muted-foreground text-center py-4">No classes scheduled for today.</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
         <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    View Full Week
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl font-semibold">Full Week Schedule</DialogTitle>
                </DialogHeader>
                <div className="flex-grow min-h-0">
                    <FullWeekSchedule />
                </div>
            </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}