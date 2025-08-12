import { ArrowRight, BookOpen, Bot, Code, FileText, HelpCircle, MessageSquare, Quote } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

const tools = [
  {
    title: "AI Chat",
    description: "Have a conversation with an AI assistant.",
    icon: MessageSquare,
    href: "/ai/chat",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Quiz Generator",
    description: "Create multiple-choice quizzes on any topic.",
    icon: HelpCircle,
    href: "/ai/quiz",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Notes Generator",
    description: "Generate structured notes for any subject.",
    icon: BookOpen,
    href: "/ai/notes",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Summarizer",
    description: "Summarize long texts or documents.",
    icon: FileText,
    href: "/ai/summary",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    title: "Coding Helper",
    description: "Get help with your programming questions.",
    icon: Code,
    href: "/ai/code",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    title: "Define Terms",
    description: "Get a clear definition for any term.",
    icon: Quote,
    href: "/ai/define",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Explain Concepts",
    description: "Get simple explanations for complex topics.",
    icon: Bot,
    href: "/ai/explain",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
];

export default function AIPage() {
  return (
    <SidebarInset>
       <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-lg font-semibold md:text-xl">AI Tools</h1>
        </div>
      </header>
       <main className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-primary font-headline">Explore the Power of AI</h2>
            <p className="text-muted-foreground mt-2">Choose a tool below to get started with your AI-powered assistant.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {tools.map((tool) => (
                <Link href={tool.href} key={tool.href} className="group">
                    <Card className="h-full transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className={`p-3 rounded-lg ${tool.bgColor}`}>
                                <tool.icon className={`w-6 h-6 ${tool.color}`} />
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <CardTitle className="text-lg font-semibold">{tool.title}</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground mt-2">{tool.description}</CardDescription>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
      </main>
    </SidebarInset>
  );
}
