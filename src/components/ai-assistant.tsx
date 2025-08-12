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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";

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
  chat: { icon: Sparkles, name: "Chat", endpoint: "/api/ai/chat" },
  jarvis: { icon: BrainCircuit, name: "Jarvis", endpoint: "/api/ai/myai" },
  explain: { icon: HelpCircle, name: "Explain", endpoint: "/api/ai/explain" },
  define: { icon: BookOpen, name: "Define", endpoint: "/api/ai/define" },
  code: { icon: Code, name: "Code", endpoint: "/api/ai/code" },
  summary: { icon: FileText, name: "Summary", endpoint: "/api/ai/summary" },
  notes: { icon: FileText, name: "Notes", endpoint: "/api/ai/notes" },
  feedback: { icon: ClipboardCheck, name: "Feedback", endpoint: "/api/ai/feedback" },
  quiz: { icon: Quote, name: "Quiz", endpoint: "/api/ai/quiz" },
};

async function getAIResponse(tool: Tool, prompt: string) {
    const config = toolConfig[tool];
    const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, stream: false })
    });
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error:", errorBody);
        throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.response;
}


export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [tool, setTool] = useState<Tool>("chat");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
        const storedMessages = localStorage.getItem("schoolzen-chat");
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        }
    } catch (e) {
        console.error("Could not load messages from localStorage", e);
        localStorage.removeItem("schoolzen-chat");
    }
  }, []);

  useEffect(() => {
    if(!isMounted) return;
    try {
        const storableMessages = messages.map(msg => {
            if (typeof msg.content !== 'string') {
                return { ...msg, content: `[Interactive ${msg.tool} output]` };
            }
            return msg;
        }).filter(m => m.content); 
        
        if(storableMessages.length > 0) {
           localStorage.setItem("schoolzen-chat", JSON.stringify(storableMessages));
        }

    } catch (e) {
        console.error("Could not save messages to localStorage", e);
    }
    
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isMounted]);

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
    
    const loadingMessageId = (Date.now() + 1).toString();
    const loadingMessage: Message = {
        id: loadingMessageId,
        role: "assistant",
        content: <Loader2 className="h-5 w-5 animate-spin" />,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      let responseContent: React.ReactNode;
      const responseText = await getAIResponse(tool, input);

      if (tool === 'quiz') {
        try {
            const quizData = parseQuiz(responseText);
            const topicMatch = input.match(/on (.*)/i);
            const topic = topicMatch ? topicMatch[1] : 'the topic';
            responseContent = <QuizDisplay quizData={quizData} topic={topic} />;
        } catch(e) {
            console.error("Failed to parse quiz:", e);
            responseContent = "I tried to make a quiz, but something went wrong with the format. Here's the raw text:\n\n" + responseText;
        }
      } else {
        responseContent = responseText;
      }
      
      const assistantMessage: Message = {
        id: loadingMessageId, 
        role: "assistant",
        content: responseContent,
      };
      setMessages((prev) => prev.map(m => m.id === loadingMessageId ? assistantMessage : m));

    } catch (error) {
      console.error("AI Assistant Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem connecting to the AI assistant.",
      });
      const errorMessage: Message = {
        id: loadingMessageId,
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => prev.map(m => m.id === loadingMessageId ? errorMessage : m));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col border-0 rounded-lg shadow-none">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <CardTitle className="font-headline text-primary flex items-center gap-2">
          <Bot /> AI Assistant
        </CardTitle>
        <Select value={tool} onValueChange={(v) => setTool(v as Tool)}>
          <SelectTrigger className="w-[140px]">
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
      <CardContent className="flex-grow overflow-hidden p-4 md:p-6">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
             {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <Bot className="h-12 w-12 mb-4" />
                      <p className="text-lg font-semibold">Welcome to the AI Assistant</p>
                      <p>Ask me anything about your studies!</p>
                  </div>
              )}
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
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about math, get a quiz on history, or just chat...`}
            className="flex-grow resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

function parseQuiz(text: string): any[] {
    const questions = [];
    const questionBlocks = text.split(/\n\s*\d+\.\s/g).filter(Boolean);

    for (const block of questionBlocks) {
        const lines = block.trim().split('\n');
        if (lines.length < 2) continue;

        const question = lines[0].trim();
        const options = [];
        let correctAnswerIndex = -1;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            const optionMatch = line.match(/^[a-d]\)\s*(.*)/i);
            if (optionMatch) {
                const optionText = optionMatch[1].trim();
                if (optionText.includes("(Correct)")) {
                    correctAnswerIndex = options.length;
                    options.push(optionText.replace(/\(Correct\)/i, '').trim());
                } else {
                    options.push(optionText);
                }
            } else {
                 const answerMatch = line.match(/Answer:\s*[a-d]\)/i);
                 if (answerMatch) {
                     correctAnswerIndex = answerMatch[0].toLowerCase().charCodeAt(answerMatch[0].length - 2) - 97;
                 }
            }
        }
        
        if (question && options.length > 1 && correctAnswerIndex !== -1) {
            questions.push({ question, options, correctAnswerIndex });
        }
    }

    if (questions.length === 0) {
        throw new Error("Could not parse any questions from the text.");
    }

    return questions;
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
