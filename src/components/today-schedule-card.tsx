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
import { Calendar, ArrowRight } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const LoadingSkeleton = () => (
    <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
        ))}
    </div>
);

export function TodayScheduleCard() {
  const [schedule, setSchedule] = useState<Period[]>([]);
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
        const data = await getDaySchedule();
        setSchedule(data);
      } catch (err) {
        console.error("Failed to fetch today's schedule:", err);
        setError("Could not load today's schedule.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchedule();
  }, [isMounted]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {isLoading || !isMounted ? (
            <LoadingSkeleton />
        ) : error ? (
            <Alert>
                <AlertTitle>No Class Selected</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        ) : schedule.length > 0 ? (
          <ScrollArea className="h-full max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Time</TableHead>
                  <TableHead>Subject</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.map((period, index) => (
                  <TableRow key={index} className="transition-colors hover:bg-muted/50">
                    <TableCell>{period.time}</TableCell>
                    <TableCell className="font-medium">{period.subject}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-center py-4">No classes scheduled for today.</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-4 mt-auto">
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
