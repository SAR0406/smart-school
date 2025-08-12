import { ArrowRight, BookOpen, Code, FileText, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

const tools = [
  {
    title: "Quiz Generator",
    description: "Create multiple-choice quizzes on any topic.",
    icon: HelpCircle,
    href: "/google-ai/quiz-generator",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Notes Generator",
    description: "Generate structured notes for any subject.",
    icon: BookOpen,
    href: "/google-ai/notes-generator",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Summarizer",
    description: "Summarize long texts or documents.",
    icon: FileText,
    href: "/google-ai/summarizer",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    title: "Coding Helper",
    description: "Get help with your programming questions.",
    icon: Code,
    href: "/google-ai/coding-helper",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
];

export default function GoogleAIPage() {
  return (
    <SidebarInset>
       <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-lg font-semibold md:text-xl">Google AI Tools</h1>
        </div>
      </header>
       <main className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-primary">Explore the Power of AI</h2>
            <p className="text-muted-foreground mt-2">Choose a tool below to get started with your AI-powered assistant.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {tools.map((tool) => (
                <Link href={tool.href} key={tool.href} className="group">
                    <Card className="h-full transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className={`p-2 rounded-lg ${tool.bgColor}`}>
                                <tool.icon className={`w-6 h-6 ${tool.color}`} />
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <CardTitle className="text-lg font-semibold">{tool.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-2">{tool.description}</p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
      </main>
    </SidebarInset>
  );
}
