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
  Database,
  Server,
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { generateQuiz } from "@/ai/flows/quiz-flow";
import { generateNotes } from "@/ai/flows/notes-flow";
import { summarizeText } from "@/ai/flows/summarize-flow";
import { helpWithCode } from "@/ai/flows/code-helper-flow";
import { QuizDisplay } from "./quiz-display";

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

type ModelType = "endpoint" | "gemini";

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

async function getAIResponseFromEndpoint(tool: Tool, prompt: string) {
    const config = toolConfig[tool];
    if (!config.endpoint) {
        throw new Error(`Endpoint for tool ${tool} is not defined.`);
    }

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
  const [model, setModel] = useState<ModelType>("endpoint");
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

  }, [toast]);

  useEffect(() => {
    if(!isMounted) return;
    try {
        const storableMessages = messages.map(msg => {
            if (typeof msg.content !== 'string') {
                // Check if content is a valid React element before trying to access its type
                if (React.isValidElement(msg.content) && typeof msg.content.type !== 'string') {
                   return { ...msg, content: `[Interactive ${msg.tool} output]` };
                }
            }
            return msg;
        }).filter(m => m.content); 
        
        if(storableMessages.length > 0) {
           localStorage.setItem("schoolzen-chat", JSON.stringify(storableMessages));
        } else {
           localStorage.removeItem("schoolzen-chat");
        }

    } catch (e) => {
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
      let responseText = "";

      if (model === 'gemini') {
        const geminiToolMap = {
          quiz: { flow: generateQuiz, key: 'quiz' },
          notes: { flow: generateNotes, key: 'notes' },
          summary: { flow: summarizeText, key: 'summary' },
          code: { flow: helpWithCode, key: 'response' },
          chat: { flow: helpWithCode, key: 'response' }, // Fallback for chat-like tools
          jarvis: { flow: helpWithCode, key: 'response' },
          explain: { flow: helpWithCode, key: 'response' },
          define: { flow: helpWithCode, key: 'response' },
          feedback: { flow: helpWithCode, key: 'response' },
        };
        
        const selectedTool = geminiToolMap[tool];
        if (selectedTool) {
            const result = await selectedTool.flow(input);
            // @ts-ignore
            responseText = result[selectedTool.key];
             if (tool === 'quiz') {
                responseContent = <QuizDisplay quizData={responseText as any} topic={input} />;
            } else {
                responseContent = responseText;
            }
        } else {
            throw new Error(`Tool "${tool}" is not supported by the Gemini model.`);
        }

      } else { // endpoint model
        responseText = await getAIResponseFromEndpoint(tool, input);
        if (tool === 'quiz') {
            try {
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
      }
      
      const assistantMessage: Message = {
        id: loadingMessageId, 
        role: "assistant",
        content: responseContent,
      };
      setMessages((prev) => prev.map(m => m.id === loadingMessageId ? assistantMessage : m));

    } catch (error) {
      console.error("AI Assistant Error:", error);
      const errorMessageText = error instanceof Error ? error.message : "There was a problem connecting to the AI assistant.";
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: errorMessageText,
      });
      const errorMessage: Message = {
        id: loadingMessageId,
        role: "assistant",
        content: `I'm sorry, I encountered an error: ${errorMessageText}`,
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
                <TooltipContent>
                    <p>Clear Chat</p>
                </TooltipContent>
            </Tooltip>
            
            <Select value={model} onValueChange={(v) => setModel(v as ModelType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="endpoint">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4" /> Endpoint API
                    </div>
                  </SelectItem>
                  <SelectItem value="gemini">
                     <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" /> Gemini Direct
                    </div>
                  </SelectItem>
              </SelectContent>
            </Select>

            <Select value={tool} onValueChange={(v) => setTool(v as Tool)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select tool" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(toolConfig).map(([key, { icon: Icon, name }]) => (
                  <SelectItem key={key} value={key} disabled={model === 'gemini' && !['quiz', 'notes', 'summary', 'code', 'chat', 'jarvis', 'explain', 'define', 'feedback'].includes(key)}>
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
              placeholder={isListening ? "Listening..." : `Using ${model === 'gemini' ? 'Gemini Direct' : 'Endpoint API'}...`}
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
