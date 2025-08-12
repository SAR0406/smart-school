"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { helpWithCode } from "@/ai/flows/code-helper-flow";
import { VoiceInput } from "@/components/voice-input";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import ReactMarkdown from 'react-markdown';
import { CameraCapture } from "@/components/camera-capture";

export default function CodeHelperPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResponse("");

    try {
      const result = await helpWithCode(prompt);
      setResponse(result.response);
      toast({
        title: "Response Received!",
        description: "The AI has responded to your coding question.",
      });
    } catch (error) {
      console.error("Code Helper Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem getting a response.",
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
          <h1 className="text-lg font-semibold md:text-xl flex items-center gap-2"><Code /> Coding Helper</h1>
        </div>
      </header>

      <main className="flex-1 grid md:grid-cols-2 gap-8 p-4 sm:p-6 lg:p-8">
        <div className="space-y-4">
            <Card>
                <CardHeader>
                <CardTitle>Ask a coding question</CardTitle>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'How do I sort an array in JavaScript?' or paste a code snippet for analysis."
                            rows={10}
                            className="pr-20"
                        />
                        <VoiceInput onTranscript={setPrompt} />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Thinking...
                        </>
                    ) : (
                        <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Get Help
                        </>
                    )}
                    </Button>
                </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Camera Input</CardTitle>
                </CardHeader>
                <CardContent>
                    <CameraCapture />
                </CardContent>
            </Card>
        </div>
        <div className="space-y-4">
            <Card className="h-full">
                <CardHeader>
                <CardTitle>AI Response</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                    {response && <div className="prose dark:prose-invert max-w-full"><ReactMarkdown>{response}</ReactMarkdown></div>}
                    {!response && !isLoading && <div className="text-muted-foreground text-center h-full flex items-center justify-center">The AI's response will appear here.</div>}
                </CardContent>
            </Card>
        </div>
      </main>
    </SidebarInset>
  );
}
