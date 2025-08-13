
"use client";

import { useState, type FormEvent, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, CalendarDays } from "lucide-react";
import { searchPeriodsBySubject } from "@/lib/api";
import type { SearchResult } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "./ui/skeleton";
import { ScrollArea } from "./ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export function SubjectSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [classSelected, setClassSelected] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (localStorage.getItem("selectedClass")) {
      setClassSelected(true);
    }
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setSearched(true);
    try {
      const data = await searchPeriodsBySubject(query);
      setResults(data);
    } catch (error) {
      console.error("Failed to search subjects:", error);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isMounted) {
    return (
       <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-10" />
            </div>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Search Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="e.g., Mathematics"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!classSelected || isLoading}
          />
          <Button type="submit" disabled={!classSelected || isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="sr-only">Search</span>
          </Button>
        </form>

        <div className="flex-grow">
            {!classSelected ? (
                <Alert>
                    <AlertTitle>Select a Class</AlertTitle>
                    <AlertDescription>Please select your class from the sidebar to enable search.</AlertDescription>
                </Alert>
            ) : isLoading ? (
              <div className="text-center text-muted-foreground pt-4">Searching...</div>
            ) : searched && results && Object.keys(results).length > 0 ? (
              <ScrollArea className="h-48">
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(results).map(([day, periods]) => (
                    <AccordionItem value={day} key={day}>
                      <AccordionTrigger className="capitalize text-primary font-semibold">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            {day}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 pl-4 border-l-2 border-primary/50 ml-2">
                          {periods.map((period, index) => (
                            <li key={index} className="text-sm">
                              <span className="font-medium">{period.time}:</span> {period.subject}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            ) : searched ? (
              <div className="text-center text-muted-foreground pt-4">No results found for "{query}".</div>
            ) : (
              <div className="text-center text-muted-foreground pt-4">Search for a subject to see upcoming classes.</div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
