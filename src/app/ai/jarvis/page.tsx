import { ChatInterface } from "@/components/chat-interface";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Shield } from "lucide-react";

export default function JarvisPage() {
    return (
        <main className="relative flex min-h-svh flex-1 flex-col bg-background">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <h1 className="text-lg font-semibold md:text-xl flex items-center gap-2">
                        <Shield /> Jarvis
                    </h1>
                </div>
            </header>
            <div className="flex flex-1 flex-col">
                <div className="h-[calc(100vh-56px)]">
                    <ChatInterface 
                        tool="myai" 
                        welcomeMessage={{
                            title: "Greetings, Boss.",
                            message: "I am Jarvis, your personal AI assistant. How may I be of service today?"
                        }}
                        promptPlaceholder="e.g., 'What's on my schedule?' or 'Give me a summary of today's news.'"
                    />
                </div>
            </div>
        </main>
    )
}
