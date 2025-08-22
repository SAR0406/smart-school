
"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  Bot,
  Loader2,
  Send,
  Mic,
  Trash2,
  BrainCircuit,
  type LucideIcon,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import ReactMarkdown from 'react-markdown';
import { QuizDisplay } from "./quiz-display";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

// API and Flow Imports
import { getNvidiaAIResponse } from "@/lib/api";
import { chatWithGemini } from "@/ai/flows/gemini-chat-flow";


type Message = {
  id: string;
  role: "user" | "assistant";
  content: string | React.ReactNode;
};

type AITool = "chat" | "explain" | "define" | "code" | "summary" | "notes" | "quiz" | "myai" | "gemini-chat";
type AIModel = "nvidia" | "gemini";

export interface AIPersona {
    tool: AITool;
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    welcome: { title: string; message: string };
    promptPlaceholder?: string;
}


interface ChatInterfaceProps {
    persona: AIPersona;
}

const geminiFlows = {
    "gemini-chat": chatWithGemini,
}

export function ChatInterface({ persona }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const storageKey = `schoolzen-chat-${persona.tool}`;
  
  useEffect(() => {
    setIsMounted(true);
    // Setup Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event: any) => {
        setInput(prev => prev + event.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = (event: any) => {
        toast({ variant: "destructive", title: "Voice Error", description: `Could not understand. (Error: ${event.error})`});
        setIsListening(false);
      }
    }
  }, [toast]);

  // Load messages from localStorage when persona changes
  useEffect(() => {
    if (!isMounted) return;
    try {
        const storedMessages = localStorage.getItem(storageKey);
        if (storedMessages) {
          const parsed = JSON.parse(storedMessages);
           // A simple check to see if messages are valid
          const validMessages = parsed.filter((m: any) => m.id && m.role && typeof m.content === 'string');
          setMessages(validMessages);
        } else {
          setMessages([]);
        }
    } catch (e) {
        console.error("Could not load messages from localStorage", e);
        localStorage.removeItem(storageKey);
        setMessages([]);
    }
  }, [isMounted, storageKey]);


  // Save messages to localStorage and scroll
  useEffect(() => {
    if(!isMounted) return;
    try {
       // Only store messages with string content to avoid serialization issues
       const messagesToStore = messages.filter(m => typeof m.content === 'string');
       if (messagesToStore.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(messagesToStore));
       } else if (messages.length === 0) {
         localStorage.removeItem(storageKey);
       }
    } catch (e) {
        console.error("Could not save messages to localStorage", e);
    }
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isMounted, storageKey]);

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem(storageKey);
    toast({ title: "Chat Cleared" });
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

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
        if (persona.tool === 'gemini-chat') {
            const flow = geminiFlows["gemini-chat"];
            if (!flow) throw new Error(`Invalid tool for Gemini: ${persona.tool}`);
            
            const result = await flow(currentInput);
            const content = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
            
            setMessages((prev) =>
                prev.map((msg) =>
                msg.id === assistantId ? { ...msg, content } : msg
                )
            );
        } else { // Standard AI model
            await getNvidiaAIResponse(persona.tool, currentInput, (chunk) => {
                setMessages((prev) =>
                    prev.map((msg) =>
                    msg.id === assistantId ? { ...msg, content: (msg.content as string) + chunk } : msg
                    )
                );
            });
        }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, content: `Error: ${errorMessage}` } : msg
        )
      );
      toast({ variant: "destructive", title: "An error occurred", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (message: Message) => {
    if (typeof message.content !== 'string') {
      return message.content;
    }
     // For NVIDIA quiz, we need to parse the plain text.
     if (persona.tool === 'quiz' && message.role === 'assistant' && message.content.includes('1.')) {
        return <QuizDisplay quizText={message.content as string} topic="Quiz" />;
     }
     // For Gemini quiz, it might return a JSON string
     if ((persona.tool === 'gemini-chat' || persona.tool === 'quiz') && message.role === 'assistant' && message.content.includes('question')) {
        try {
            const quizJson = JSON.parse(message.content);
            if (quizJson.quiz) {
                 return <QuizDisplay quizData={quizJson} topic="Quiz" />;
            }
        } catch (e) {
            // Not valid JSON, fall through to markdown
        }
     }
    return <ReactMarkdown className="prose dark:prose-invert max-w-full">{message.content}</ReactMarkdown>;
  };


  if (!isMounted) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col rounded-lg">
        <header className="flex flex-row items-center justify-between gap-2 p-4 border-b">
           <div className="flex items-center gap-2">
           {/* Placeholder for potential future header content */}
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleClearChat} disabled={messages.length === 0}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Clear Chat</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Clear Chat</p></TooltipContent>
            </Tooltip>
          </div>
        </header>
        <main className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-4 p-4 md:p-6">
               {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
                        <div className={cn("p-4 rounded-full mb-4", persona.bgColor)}>
                           <persona.icon className={cn("h-12 w-12", persona.color)} />
                        </div>
                        <p className="text-lg font-semibold">{persona.welcome.title}</p>
                        <p className="text-sm">{persona.welcome.message}</p>
                    </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={cn("flex items-start gap-3 w-full")}>
                      {message.role === "assistant" && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={cn("text-white", persona.bgColor)}>
                            <persona.icon className={cn("h-5 w-5", persona.color)} />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn("max-w-[80%] rounded-lg p-3 text-sm", message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted")}>
                        {isLoading && message.content === "" ? <Loader2 className="h-5 w-5 animate-spin" /> : renderMessageContent(message)}
                      </div>
                      {message.role === "user" && (
                        <Avatar className="h-8 w-8"><AvatarFallback><User className="w-5 h-5"/></AvatarFallback></Avatar>
                      )}
                    </div>
                  ))
                )}
            </div>
          </ScrollArea>
        </main>
        <footer className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full items-center gap-2 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : persona.promptPlaceholder || 'Message your AI assistant...'}
              className="flex-grow resize-none pr-20"
              rows={1}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
              disabled={isLoading}
            />
            <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1">
                {recognitionRef.current && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button type="button" size="icon" variant="ghost" onClick={handleVoiceInput} disabled={isLoading}>
                                <Mic className={cn("h-5 w-5", isListening && 'text-primary animate-pulse')} />
                                <span className="sr-only">Use Microphone</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{isListening ? 'Stop Listening' : 'Start Listening'}</p></TooltipContent>
                    </Tooltip>
                )}
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
                  <span className="sr-only">Send message</span>
                </Button>
            </div>
          </form>
        </footer>
      </div>
    </TooltipProvider>
  );
}
