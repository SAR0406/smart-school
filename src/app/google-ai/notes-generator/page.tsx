"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateNotes } from "@/ai/flows/notes-flow";
import { VoiceInput } from "@/components/voice-input";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import ReactMarkdown from 'react-markdown';


export default function NotesGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setNotes("");

    try {
      const result = await generateNotes(topic);
      setNotes(result.notes);
       toast({
        title: "Notes Generated!",
        description: "Your notes are ready below.",
      });
    } catch (error) {
      console.error("Notes Generation Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem generating the notes.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarInset>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-lg font-semibold md:text-xl flex items-center gap-2"><BookOpen/> Notes Generator</h1>
        </div>
      </header>

      <main className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>What subject do you need notes for?</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="relative">
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., 'Cellular Respiration' or 'The History of Ancient Rome'"
                  className="pr-20"
                />
                <VoiceInput onTranscript={setTopic} />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Notes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes on {topic}</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-full">
              <ReactMarkdown>{notes}</ReactMarkdown>
            </CardContent>
          </Card>
        )}
      </main>
    </SidebarInset>
  );
}
