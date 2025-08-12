"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, Loader2, MapPin, User } from "lucide-react";
import { getCurrentPeriod } from "@/lib/api";
import type { Period } from "@/lib/types";

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
      } finally {
        setIsLoading(false);
      }
    }
    fetchPeriod();
  }, []);

  const getStatusEmoji = (status?: 'ongoing' | 'break' | 'finished') => {
    switch (status) {
      case 'ongoing': return '📖';
      case 'break': return '☕';
      case 'finished': return '✅';
      default: return '…';
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center justify-between">
          <span>Current Period</span>
          <span className="text-2xl">{getStatusEmoji(period?.status)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {period && period.status !== 'finished' ? (
          <>
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">{period.subject}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <User className="h-5 w-5" />
              <span>{period.teacher}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span>{period.time}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span>{period.room}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-5 w-5" />
            <span>{period?.status === 'finished' ? "School day is over. Time to relax!" : "No current period. Enjoy your break!"}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
