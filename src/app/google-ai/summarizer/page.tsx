"use client";

import { useState, type FormEvent, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { summarizeText } from "@/ai/flows/summarize-flow";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useDropzone } from 'react-dropzone';

export default function SummarizerPage() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        setText(fileContent);
        toast({ title: "File loaded successfully!" });
      };
      reader.onerror = () => {
         toast({ variant: "destructive", title: "Error reading file." });
      };
      reader.readAsText(file);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/*': ['.txt', '.md'] },
    maxFiles: 1,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setSummary("");

    try {
      const result = await summarizeText(text);
      setSummary(result.summary);
      toast({
        title: "Summary Generated!",
        description: "Your summary is ready below.",
      });
    } catch (error) {
      console.error("Summarization Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem generating the summary.",
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
          <h1 className="text-lg font-semibold md:text-xl flex items-center gap-2"><FileText /> Summarizer</h1>
        </div>
      </header>

      <main className="flex-1 grid md:grid-cols-2 gap-8 p-4 sm:p-6 lg:p-8">
        <div className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle>Input Text</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste your text here to summarize..."
                        rows={15}
                        />
                        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}`}>
                            <input {...getInputProps()} />
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                            {
                                isDragActive ?
                                <p>Drop the files here ...</p> :
                                <p>Drag 'n' drop a .txt or .md file here, or click to select</p>
                            }
                        </div>
                        <Button type="submit" disabled={isLoading || !text.trim()}>
                            {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Summarizing...
                            </>
                            ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Summarize
                            </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-4">
            <Card className="h-full">
                <CardHeader>
                <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                    {summary && <div className="prose dark:prose-invert max-w-full">{summary}</div>}
                    {!summary && !isLoading && <div className="text-muted-foreground text-center h-full flex items-center justify-center">Your summary will appear here.</div>}
                </CardContent>
            </Card>
        </div>
      </main>
    </SidebarInset>
  );
}
