
'use client';

import { useState } from 'react';
import {
  MessageSquare,
  HelpCircle,
  ScanLine,
  BookOpen,
  FileText,
  Code,
  Quote,
  Bot,
  Shield,
  ThumbsUp,
  type LucideIcon,
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ChatInterface, type AIPersona } from '@/components/chat-interface';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

const personas: AIPersona[] = [
  {
    tool: 'chat',
    title: 'AI Chat',
    description: 'Have a conversation with an AI assistant.',
    icon: MessageSquare,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    welcome: {
      title: 'Welcome to the AI Chat',
      message: 'You can ask me anything about your studies or any general questions you might have.',
    },
    promptPlaceholder: "e.g., 'What are the main themes in Hamlet?'",
    systemPrompt: "You are a helpful AI assistant. You must start every response with a relevant emoji."
  },
  {
    tool: 'quiz',
    title: 'Quiz Generator',
    description: 'Create quizzes on any topic.',
    icon: HelpCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    welcome: {
      title: 'Quiz Generator',
      message: 'Enter a topic to generate a 5-question multiple-choice quiz.',
    },
    promptPlaceholder: "e.g., 'The Solar System' or 'Shakespeare's Plays'",
    systemPrompt: "You are a quiz generation expert. The user will provide a topic. You must generate a 5-question multiple-choice quiz on that topic. Ensure you provide the questions, options, and the correct answer for each question. You must start every response with a relevant emoji."
  },
  {
    tool: 'notes',
    title: 'Notes Generator',
    description: 'Generate structured notes for any subject.',
    icon: BookOpen,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    welcome: {
      title: 'Notes Generator',
      message: 'Enter a topic to generate detailed, well-structured study notes.',
    },
    promptPlaceholder: "e.g., 'The French Revolution' or 'The Water Cycle'",
    systemPrompt: "You are a note-taking expert. The user will provide a topic. You must generate detailed, well-structured study notes on that topic, using markdown for formatting (headings, bullet points, etc.). You must start every response with a relevant emoji."
  },
  {
    tool: 'summary',
    title: 'Summarizer',
    description: 'Summarize long texts or documents.',
    icon: FileText,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    welcome: {
      title: 'Summarizer',
      message: 'Paste in a long piece of text to get a concise summary.',
    },
    promptPlaceholder: 'Paste your text here to summarize...',
    systemPrompt: "You are a text summarization expert. The user will provide a piece of text. You must generate a concise summary of the provided text. You must start every response with a relevant emoji."
  },
  {
    tool: 'code',
    title: 'Coding Helper',
    description: 'Get help with your programming questions.',
    icon: Code,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    welcome: {
      title: 'Coding Helper',
      message: 'Paste a code snippet or ask a programming question to get help.',
    },
    promptPlaceholder: "e.g., 'How do I sort an array in JavaScript?'",
    systemPrompt: "You are a coding expert. The user will ask a programming question or provide a code snippet. You must provide helpful explanations, code examples, or debugging assistance. Use markdown for code blocks. You must start every response with a relevant emoji."
  },
  {
    tool: 'define',
    title: 'Define Terms',
    description: 'Get a clear definition for any term.',
    icon: Quote,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    welcome: {
      title: 'Define a Term',
      message: 'Enter any word or term to get a clear and concise definition.',
    },
    promptPlaceholder: "e.g., 'Photosynthesis' or 'Capitalism'",
    systemPrompt: "You are an expert lexicographer. The user will provide a term. You must provide a clear and concise definition for that term. You must start every response with a relevant emoji."
  },
  {
    tool: 'explain',
    title: 'Explain Concepts',
    description: 'Get simple explanations for complex topics.',
    icon: Bot,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    welcome: {
      title: 'Explain a Concept',
      message: "Enter a complex topic and get a simple explanation, like you're 12!",
    },
    promptPlaceholder: "e.g., 'Quantum Computing' or 'General Relativity'",
    systemPrompt: "You are an expert at explaining complex topics simply. The user will provide a concept. You must explain it in a way that a 12-year-old can understand. You must start every response with a relevant emoji."
  },
  {
    tool: 'feedback',
    title: 'Feedback Helper',
    description: 'Get constructive feedback on your work.',
    icon: ThumbsUp,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    welcome: {
      title: 'Feedback Helper',
      message: 'Paste your text, essay, or assignment here to get constructive feedback.',
    },
    promptPlaceholder: "e.g., 'Paste your essay here...'",
    systemPrompt: "You are a school teacher assistant. Give fair and encouraging feedback."
  },
  {
    tool: 'myai',
    title: 'Jarvis',
    description: 'Your personal AI assistant, like Jarvis.',
    icon: Shield,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    welcome: {
      title: 'Greetings, Boss.',
      message: 'I am Jarvis, your personal AI assistant. How may I be of service today?',
    },
    promptPlaceholder: "e.g., 'What's on my schedule?'",
    systemPrompt: "You are Jarvis, a witty, sophisticated, and incredibly helpful personal AI assistant, inspired by the character from the Iron Man movies. You must always stay in character. You must start every response with a relevant emoji."
  },
];

export default function AIPage() {
  const [activePersona, setActivePersona] = useState<AIPersona>(personas[0]);

  return (
    <main className="relative flex min-h-svh flex-1 bg-background">
      <div className="hidden md:flex md:w-1/3 lg:w-1/4 flex-col border-r">
         <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
             <h1 className="text-lg font-semibold md:text-xl flex items-center gap-2 font-headline">
                <Bot /> AI Tools
            </h1>
        </header>
        <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
                {personas.map(persona => (
                    <Card 
                        key={persona.tool}
                        onClick={() => setActivePersona(persona)}
                        className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            activePersona.tool === persona.tool ? "border-primary ring-2 ring-primary/50 shadow-lg" : "hover:border-primary/50"
                        )}
                    >
                        <CardHeader className="p-4">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-2 rounded-lg", persona.bgColor)}>
                                    <persona.icon className={cn("w-6 h-6", persona.color)} />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-semibold">{persona.title}</CardTitle>
                                    <CardDescription className="text-xs">{persona.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </ScrollArea>
      </div>
      <div className="flex-1 flex flex-col">
         <header className="md:hidden sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold md:text-xl flex items-center gap-2">
                    <activePersona.icon className="w-5 h-5" /> {activePersona.title}
                </h1>
            </div>
             <ThemeToggle />
        </header>
        <div className="flex-1 h-[calc(100svh-56px)] md:h-svh">
            <ChatInterface persona={activePersona} key={activePersona.tool} />
        </div>
      </div>
    </main>
  );
}
