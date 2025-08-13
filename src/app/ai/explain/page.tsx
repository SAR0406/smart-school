import { ChatInterface } from "@/components/chat-interface";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Bot } from "lucide-react";

export default function ExplainPage() {
    return (
        <SidebarInset>
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <h1 className="text-lg font-semibold md:text-xl flex items-center gap-2">
                        <Bot /> Explain a Concept
                    </h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col">
                <div className="h-[calc(100vh-56px)]">
                    <ChatInterface 
                        tool="explain" 
                        welcomeMessage={{
                            title: "Explain a Concept",
                            message: "Enter a complex topic and get a simple explanation, like you're 12!"
                        }}
                        promptPlaceholder="e.g., 'Quantum Computing' or 'General Relativity'"
                    />
                </div>
            </main>
        </SidebarInset>
    )
}
