import { ChatInterface } from "@/components/chat-interface";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
    return (
        <SidebarInset>
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <h1 className="text-lg font-semibold md:text-xl flex items-center gap-2">
                        <MessageSquare /> AI Chat
                    </h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
                <div className="h-[calc(100vh-120px)]">
                    <ChatInterface 
                        tool="chat" 
                        welcomeMessage={{
                            title: "Welcome to the AI Chat",
                            message: "You can ask me anything about your studies or any general questions you might have."
                        }}
                    />
                </div>
            </main>
        </SidebarInset>
    )
}
