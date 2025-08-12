"use client";

import { useState, useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function WelcomeCard() {
  const [isMounted, setIsMounted] = useState(false);
  const [greeting, setGreeting] = useState("Welcome back!");

  useEffect(() => {
    setIsMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning!");
    } else if (hour < 18) {
      setGreeting("Good afternoon!");
    } else {
      setGreeting("Good evening!");
    }
  }, []);

  if (!isMounted) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{greeting}</CardTitle>
        <CardDescription>Here's what's happening with your schedule today.</CardDescription>
      </CardHeader>
    </Card>
  );
}
