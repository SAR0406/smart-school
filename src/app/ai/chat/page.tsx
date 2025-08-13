import { ChatInterface } from "@/components/chat-interface";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
    return (
        <main className="relative flex min-h-svh flex-1 flex-col bg-background">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <h1 className="text-lg font-semibold md:text-xl flex items-center gap-2">
                        <MessageSquare /> AI Chat
                    </h1>
                </div>
            </header>
            <div className="flex flex-1 flex-col">
                <div className="h-[calc(100vh-56px)]">
                    <ChatInterface 
                        tool="chat" 
                        welcomeMessage={{
                            title: "Welcome to the AI Chat",
                            message: "You can ask me anything about your studies or any general questions you might have."
                        }}
                    />
                </div>
            </div>
        </main>
    )
}
