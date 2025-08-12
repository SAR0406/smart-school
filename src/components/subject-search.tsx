"use client";

import { useState, type FormEvent, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, CalendarDays } from "lucide-react";
import { searchPeriodsBySubject } from "@/lib/api";
import type { Period, SearchResult } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "./ui/skeleton";

export function SubjectSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isMounted) {
    return (
       <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-10" />
            </div>
          </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Search Subjects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="e.g., Mathematics"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="sr-only">Search</span>
          </Button>
        </form>

        <div className="mt-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">Searching...</div>
          ) : searched && results && Object.keys(results).length > 0 ? (
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
          ) : searched ? (
            <div className="text-center text-muted-foreground pt-4">No results found for "{query}".</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
