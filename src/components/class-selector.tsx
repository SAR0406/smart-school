"use client";

import { useState, useEffect } from "react";
import { ChevronsUpDown, School, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllClasses } from "@/lib/api";
import type { Class } from "@/lib/types";

export function ClassSelector() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    async function fetchClasses() {
      try {
        const data = await getAllClasses();
        setClasses(data);
        if (data.length > 0) {
          // Check for a saved class in localStorage, otherwise default to the first one
          const savedClass = localStorage.getItem('selectedClass');
          if (savedClass && data.some(c => c.id === savedClass)) {
            setSelectedClass(savedClass);
          } else {
            setSelectedClass(data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchClasses();
  }, []);

  const handleValueChange = (value: string) => {
    setSelectedClass(value);
    localStorage.setItem('selectedClass', value);
  }
  
  if (!isMounted) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline text-lg flex items-center gap-2">
                      <School className="h-5 w-5 text-primary" />
                      My Class
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="flex items-center gap-2 text-muted-foreground h-10">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                  </div>
              </CardContent>
          </Card>
      );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <School className="h-5 w-5 text-primary" />
          My Class
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading classes...</span>
          </div>
        ) : (
          <Select value={selectedClass} onValueChange={handleValueChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a class..." />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
}
