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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import ReactMarkdown from 'react-markdown';
import { QuizDisplay } from "./quiz-display";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string | React.ReactNode;
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

async function getAIResponse(tool: Tool, prompt: string, streamCallback: (chunk: string) => void) {
  const config = toolConfig[tool];
  if (!config.endpoint) {
    throw new Error(`Endpoint for tool ${tool} is not defined.`);
  }

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, stream: true })
  });
  
  if (!response.ok || !response.body) {
    const errorBody = await response.text();
    console.error("API Error:", errorBody);
    throw new Error(`API request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    streamCallback(chunk);
  }
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
          const parsed = JSON.parse(storedMessages);
          // Make sure content is not an object before setting
          const validMessages = parsed.filter((m: Message) => typeof m.content === 'string');
          setMessages(validMessages);
        }
    } catch (e) {
        console.error("Could not load messages from localStorage", e);
        localStorage.removeItem("schoolzen-chat");
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event: any) => {
        setInput(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = (event: any) => {
        toast({ variant: "destructive", title: "Voice Error", description: `Could not understand. (Error: ${event.error})`});
        setIsListening(false);
      }
    }
  }, [toast]);

  useEffect(() => {
    if(!isMounted) return;
    try {
       localStorage.setItem("schoolzen-chat", JSON.stringify(messages));
    } catch (e) {
        console.error("Could not save messages to localStorage", e);
    }
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isMounted]);

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem("schoolzen-chat");
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

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input, tool: tool };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      await getAIResponse(tool, input, (chunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: (msg.content as string) + chunk } : msg
          )
        );
      });
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

  if (!isMounted) {
    return (
        <Card className="h-full flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Card>
    );
  }

  const renderMessageContent = (message: Message) => {
    if (typeof message.content !== 'string') {
      return message.content;
    }
    // For quiz tool, try to parse JSON and render QuizDisplay
    if (message.tool === 'quiz' && message.content.includes('{')) {
      try {
        const jsonString = message.content.substring(message.content.indexOf('{'), message.content.lastIndexOf('}') + 1);
        const quizData = JSON.parse(jsonString);
        return <QuizDisplay quizData={quizData.quiz} topic="Quiz" />;
      } catch (e) {
        // Not valid JSON, fall back to markdown
      }
    }
    return <ReactMarkdown>{message.content}</ReactMarkdown>;
  };

  return (
    <TooltipProvider>
      <Card className="h-full flex flex-col rounded-lg shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between border-b gap-2">
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
                <TooltipContent><p>Clear Chat</p></TooltipContent>
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
                <div key={message.id} className={cn("flex items-start gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback></Avatar>
                  )}
                  <div className={cn("max-w-[80%] rounded-xl p-3 text-sm prose dark:prose-invert max-w-full", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    {isLoading && message.content === "" ? <Loader2 className="h-5 w-5 animate-spin" /> : renderMessageContent(message)}
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8"><AvatarFallback>U</AvatarFallback></Avatar>
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
              placeholder={isListening ? "Listening..." : `Message your AI assistant...`}
              className="flex-grow resize-none"
              rows={1}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { handleSubmit(e); } }}
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
                    <TooltipContent><p>{isListening ? 'Stop Listening' : 'Start Listening'}</p></TooltipContent>
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
