import { ChatInterface } from "@/components/chat-interface";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Code } from "lucide-react";

export default function CodePage() {
    return (
        <main className="relative flex min-h-svh flex-1 flex-col bg-background">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <h1 className="text-lg font-semibold md:text-xl flex items-center gap-2">
                        <Code /> Coding Helper
                    </h1>
                </div>
            </header>
            <div className="flex flex-1 flex-col">
                <div className="h-[calc(100vh-56px)]">
                    <ChatInterface 
                        tool="code" 
                        welcomeMessage={{
                            title: "Coding Helper",
                            message: "Paste a code snippet or ask a programming question to get help."
                        }}
                        promptPlaceholder="e.g., 'How do I sort an array in JavaScript?' or paste a code snippet."
                    />
                </div>
            </div>
        </main>
    )
}
