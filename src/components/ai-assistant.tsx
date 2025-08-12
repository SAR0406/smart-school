"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  Bot,
  BrainCircuit,
  ClipboardCheck,
  Code,
  FileText,
  HelpCircle,
  Loader2,
  Quote,
  Send,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

// AI Flow Imports
import { studentAiAssistant } from "@/ai/flows/student-ai-assistant";
import { generateQuiz } from "@/ai/flows/generate-quiz";
import { summarizeContent } from "@/ai/flows/summarize-content";
import { provideConstructiveFeedback } from "@/ai/flows/provide-constructive-feedback";
import { generateDetailedStudyNotes } from "@/ai/flows/generate-detailed-study-notes";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: React.ReactNode;
  tool?: Tool;
};

type Tool =
  | "chat"
  | "jarvis"
  | "explain"
  | "define"
  | "code"
  | "summary"
  | "notes"
  | "feedback"
  | "quiz";

const toolConfig = {
  chat: { icon: Sparkles, name: "Chat" },
  jarvis: { icon: BrainCircuit, name: "Jarvis" },
  explain: { icon: HelpCircle, name: "Explain" },
  define: { icon: BookOpen, name: "Define" },
  code: { icon: Code, name: "Code" },
  summary: { icon: FileText, name: "Summary" },
  notes: { icon: FileText, name: "Notes" },
  feedback: { icon: ClipboardCheck, name: "Feedback" },
  quiz: { icon: Quote, name: "Quiz" },
};

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [tool, setTool] = useState<Tool>("chat");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedMessages = localStorage.getItem("schoolzen-chat");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("schoolzen-chat", JSON.stringify(messages));
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      tool: tool,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let response: React.ReactNode;

      switch (tool) {
        case "chat":
        case "jarvis":
        case "explain":
        case "define":
        case "code":
          const assistantResponse = await studentAiAssistant({
            mode: tool,
            inputText: input,
          });
          response = assistantResponse.response;
          break;
        case "summary":
          const summaryResponse = await summarizeContent({ content: input });
          response = summaryResponse.summary;
          break;

        case "notes":
          const [subject, topic] = input.split(/ for | on /i).slice(-2);
          if (!subject || !topic) {
            response = "Please provide both a subject and a topic (e.g., 'History for The Cold War').";
          } else {
             const notesResponse = await generateDetailedStudyNotes({ subject, topic, desiredLength: 'detailed' });
             response = notesResponse.studyNotes;
          }
          break;

        case "feedback":
          const feedbackResponse = await provideConstructiveFeedback({ text: input });
          response = feedbackResponse.feedback;
          break;
        case "quiz":
          const [numQuestionsStr, ...topicParts] = input.split(' ');
          const numQuestions = parseInt(numQuestionsStr, 10) || 5;
          const quizTopic = topicParts.join(' ').replace(/^questions? on/i, '').trim() || 'general knowledge';
          const quizResponse = await generateQuiz({ topic: quizTopic, numQuestions });
          const quizData = JSON.parse(quizResponse.quiz);
          response = <QuizDisplay quizData={quizData.quiz} topic={quizTopic} />;
          break;
        default:
            response = "Sorry, I can't do that yet.";
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with the AI assistant.",
      });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[calc(100vh-8rem)] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-primary flex items-center gap-2">
          <Bot /> AI Assistant
        </CardTitle>
        <Select value={tool} onValueChange={(v) => setTool(v as Tool)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select tool" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(toolConfig).map(([key, { icon: Icon, name }]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" /> {name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl p-3 text-sm whitespace-pre-wrap",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {typeof message.content === 'string' ? <p>{message.content}</p> : message.content}
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot />
                    </AvatarFallback>
                  </Avatar>
                   <div className="bg-muted rounded-xl p-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                   </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message your AI assistant...`}
            className="flex-grow resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}


function QuizDisplay({ quizData, topic }: { quizData: any[], topic: string }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    let correctCount = 0;
    quizData.forEach((q, index) => {
      if (answers[index] === q.correctAnswerIndex) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  const handleRestart = () => {
      setAnswers({});
      setSubmitted(false);
      setScore(0);
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-bold text-lg">Quiz on {topic}</h3>
      {submitted ? (
        <div className="text-center space-y-4">
            <h4 className="text-xl font-bold">Quiz Complete!</h4>
            <p className="text-2xl">You scored</p>
            <div className="relative w-32 h-32 mx-auto">
                <Progress value={(score/quizData.length) * 100} className="w-32 h-32 rounded-full absolute" style={{clipPath: 'circle(50% at 50% 50%)'}}/>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{score}/{quizData.length}</span>
                </div>
            </div>
            <Button onClick={handleRestart}>Try Again</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {quizData.map((q, qIndex) => (
            <div key={qIndex}>
              <p className="font-semibold mb-2">{qIndex + 1}. {q.question}</p>
              <RadioGroup
                onValueChange={(value) =>
                  setAnswers((prev) => ({ ...prev, [qIndex]: parseInt(value) }))
                }
              >
                {q.options.map((option: string, oIndex: number) => (
                  <div key={oIndex} className="flex items-center space-x-2">
                    <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}o${oIndex}`} />
                    <Label htmlFor={`q${qIndex}o${oIndex}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
          <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== quizData.length}>
            Submit Quiz
          </Button>
        </div>
      )}
    </div>
  );
}
