
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, Loader2, MessageSquare } from "lucide-react";
import { getCurrentPeriod } from "@/lib/api";
import type { Period } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CurrentPeriodCard() {
  const [period, setPeriod] = useState<Period | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPeriod() {
      try {
        const data = await getCurrentPeriod();
        setPeriod(data);
      } catch (error) {
        console.error("Failed to fetch current period:", error);
        setPeriod({
            subject: "Error",
            teacher: "-",
            time: "-",
            room: "-",
            status: "finished",
            message: "Could not load schedule"
        })
      } finally {
        setIsLoading(false);
      }
    }

    const classId = localStorage.getItem("selectedClass");
    if(classId){
        fetchPeriod();
        const interval = setInterval(fetchPeriod, 60000);
        return () => clearInterval(interval);
    } else {
        setIsLoading(false);
        setPeriod({
            subject: "No Class Selected",
            teacher: "-",
            time: "-",
            room: "-",
            status: "finished",
            message: "Please select a class first."
        });
    }

  }, []);

  const getStatusInfo = (status?: 'ongoing' | 'break' | 'finished') => {
    switch (status) {
      case 'ongoing': return { emoji: '📖', color: 'bg-green-500' };
      case 'break': return { emoji: '☕', color: 'bg-yellow-500' };
      case 'finished': return { emoji: '✅', color: 'bg-blue-500' };
      default: return { emoji: '…', color: 'bg-gray-500' };
    }
  }

  if (isLoading) {
    return (
      <Card className="transition-all hover:shadow-lg hover:shadow-primary/20">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  const { emoji, color } = getStatusInfo(period?.status);

  return (
    <Card className="transition-all hover:shadow-lg hover:shadow-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center justify-between">
          <span>Current Status</span>
           <div className="relative">
             <span className={cn("absolute -inset-1.5 rounded-full animate-ping", color)}></span>
             <span className={cn("relative inline-flex items-center justify-center h-8 w-8 rounded-full text-lg", color)}>
                {emoji}
             </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {period ? (
          <>
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">{period.subject}</span>
            </div>
             {period.time && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="h-5 w-5" />
                <span>{period.time}</span>
              </div>
            )}
            {period.message && (
               <div className="flex items-center gap-3 text-muted-foreground pt-2">
                <MessageSquare className="h-5 w-5" />
                <span className="italic">{period.message}</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Checking schedule...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
