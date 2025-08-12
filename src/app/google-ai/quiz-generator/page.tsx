"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateQuiz } from "@/ai/flows/quiz-flow";
import { QuizDisplay } from "@/components/quiz-display";
import { VoiceInput } from "@/components/voice-input";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function QuizGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [quiz, setQuiz] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setQuiz(null);

    try {
      const result = await generateQuiz(topic);
      setQuiz(result.quiz);
      toast({
        title: "Quiz Generated!",
        description: "Your quiz is ready below.",
      });
    } catch (error) {
      console.error("Quiz Generation Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem generating the quiz.",
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
          <h1 className="text-lg font-semibold md:text-xl flex items-center gap-2"><HelpCircle/> Quiz Generator</h1>
        </div>
      </header>

      <main className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>What topic do you want a quiz on?</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., 'The French Revolution' or 'Quantum Physics'"
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
                    Generate Quiz
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {quiz && (
          <Card>
            <CardHeader>
              <CardTitle>Quiz on {topic}</CardTitle>
            </CardHeader>
            <CardContent>
              <QuizDisplay quizData={quiz} topic={topic} />
            </CardContent>
          </Card>
        )}
      </main>
    </SidebarInset>
  );
}
