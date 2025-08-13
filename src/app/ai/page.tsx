
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
  type LucideIcon,
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ChatInterface, type AIPersona } from '@/components/chat-interface';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  },
  {
    tool: 'quiz',
    title: 'Quiz Generator',
    description: 'Create multiple-choice quizzes on any topic.',
    icon: HelpCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    welcome: {
      title: 'Quiz Generator',
      message: 'Enter a topic to generate a 5-question multiple-choice quiz.',
    },
    promptPlaceholder: "e.g., 'The Solar System' or 'Shakespeare's Plays'",
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
  },
];

export default function AIPage() {
  const [activePersona, setActivePersona] = useState<AIPersona>(personas[0]);

  return (
    <main className="relative flex min-h-svh flex-1 bg-background">
      <div className="hidden md:flex md:w-1/3 lg:w-1/4 flex-col border-r">
         <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
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
         <header className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold md:text-xl flex items-center gap-2">
                    <activePersona.icon /> {activePersona.title}
                </h1>
            </div>
        </header>
        <div className="flex-1 h-[calc(100vh-56px)] md:h-screen">
            <ChatInterface persona={activePersona} key={activePersona.tool} />
        </div>
      </div>
    </main>
  );
}
