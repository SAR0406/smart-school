"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, Loader2, MessageSquare, User } from "lucide-react";
import { getCurrentPeriod } from "@/lib/api";
import type { Period } from "@/lib/types";

export function CurrentPeriodCard() {
  const [period, setPeriod] = useState<Period | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPeriod() {
      try {
        const data = await getCurrentPeriod(); // Assumes a default class
        setPeriod(data);
      } catch (error) {
        console.error("Failed to fetch current period:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPeriod();
    // Refresh every minute
    const interval = setInterval(fetchPeriod, 60000);
    return () => clearInterval(interval);
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center justify-between">
          <span>Current Status</span>
          <span className="text-2xl">{getStatusEmoji(period?.status)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {period ? (
          <>
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">{period.subject}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span>{period.time}</span>
            </div>
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
