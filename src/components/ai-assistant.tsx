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
  Mic,
  Trash2,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

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

    // For quizzes, we modify the prompt to ask for JSON
    let finalPrompt = prompt;
    if (tool === 'quiz') {
      const topicMatch = prompt.match(/(?:on|about|for)\s+(.+)/i);
      const topic = topicMatch ? topicMatch[1] : prompt;
      finalPrompt = `Generate a 5-question multiple-choice quiz on the topic "${topic}". Return it as a single JSON object with a key "quiz" which is an array of questions. Each question object should have: "question" (string), "options" (array of 4 strings), and "correctAnswerIndex" (number 0-3).`;
    }

    const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt, stream: false })
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
  const [isListening, setIsListening] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
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

    // Speech Recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        toast({
          variant: "destructive",
          title: "Voice Error",
          description: `Could not understand audio. Please try again. (Error: ${event.error})`
        });
        setIsListening(false);
      }
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
        } else {
           localStorage.removeItem("schoolzen-chat");
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

  const handleClearChat = () => {
      setMessages([]);
      localStorage.removeItem("schoolzen-chat");
      toast({
          title: "Chat Cleared",
          description: "Your conversation history has been removed."
      });
  }

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

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
            // Attempt to parse the JSON response.
            const jsonString = responseText.substring(responseText.indexOf('{'), responseText.lastIndexOf('}') + 1);
            const quizData = JSON.parse(jsonString);
            const topicMatch = input.match(/(?:on|about|for)\s+(.+)/i);
            const topic = topicMatch ? topicMatch[1] : 'the requested topic';
            responseContent = <QuizDisplay quizData={quizData.quiz} topic={topic} />;
        } catch(e) {
            console.error("Failed to parse quiz JSON:", e);
            responseContent = "I tried to create a quiz, but something went wrong with the format. Here's the raw text I received:\n\n" + responseText;
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

  if (!isMounted) {
    return (
        <Card className="h-full flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="h-full flex flex-col rounded-lg shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="font-headline text-primary flex items-center gap-2">
            <Bot /> AI Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleClearChat} disabled={messages.length === 0}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Clear Chat</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Clear Chat</p>
                </TooltipContent>
            </Tooltip>
            
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
          </div>
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
              placeholder={isListening ? "Listening..." : `Ask about math, get a quiz on history, or just chat...`}
              className="flex-grow resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
            />
            {recognitionRef.current && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" size="icon" variant="ghost" onClick={handleVoiceInput} disabled={isLoading}>
                            <Mic className={cn(isListening && 'text-primary animate-pulse')} />
                             <span className="sr-only">Use Microphone</span>
                        </Button>
                    </TooltipTrigger>
                     <TooltipContent>
                        <p>{isListening ? 'Stop Listening' : 'Start Listening'}</p>
                    </TooltipContent>
                </Tooltip>
            )}
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </TooltipProvider>
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
      <h3 className="font-bold text-lg capitalize">Quiz on {topic}</h3>
      {submitted ? (
        <div className="text-center space-y-4 p-4">
            <h4 className="text-xl font-bold">Quiz Complete!</h4>
            <p className="text-muted-foreground">You scored</p>
            <div className="relative w-32 h-32 mx-auto my-4">
                 <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        className="text-primary/20"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                    />
                    {/* Progress circle */}
                    <circle
                        className="text-primary"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 45}
                        strokeDashoffset={2 * Math.PI * 45 * (1 - score / quizData.length)}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                    />
                </svg>
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

    
