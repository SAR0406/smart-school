
'use client';

import { useState } from 'react';
import { Bot } from 'lucide-react';

import { ChatInterface, type AIPersona } from '@/components/chat-interface';
import { AdvancedQuizGenerator } from '@/components/advanced-quiz-generator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

const geminiChatPersona: AIPersona = {
  tool: 'gemini-chat',
  title: 'Gemini Chat',
  description: 'Chat with Gemini',
  icon: Bot,
  color: 'text-purple-500',
  bgColor: 'bg-purple-500/10',
  welcome: {
    title: 'Welcome to Gemini Chat',
    message: 'You can ask me anything you want!',
  },
  promptPlaceholder: "e.g., 'Explain the theory of relativity in simple terms.'",
};

export default function GeminiPage() {
  return (
    <main className="relative flex min-h-svh flex-1 flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <h1 className="flex items-center gap-2 text-lg font-semibold md:text-xl font-headline">
            <Bot />
            Gemini AI
          </h1>
        </div>
        <div className="md:hidden">
            <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
        <Tabs defaultValue="chat" className="flex-grow">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="quiz">Advanced Quiz Generator</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="mt-4 h-[calc(100vh-180px)]">
             <ChatInterface persona={geminiChatPersona} />
          </TabsContent>
          <TabsContent value="quiz" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Advanced Quiz Generator</CardTitle>
                    <CardDescription>Use Gemini to generate a custom quiz on any topic.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AdvancedQuizGenerator />
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
