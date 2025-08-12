import { ChatInterface } from "@/components/chat-interface";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Quote } from "lucide-react";

export default function DefinePage() {
    return (
        <SidebarInset>
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <h1 className="text-lg font-semibold md:text-xl flex items-center gap-2">
                        <Quote /> Define a Term
                    </h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
                <div className="h-[calc(100vh-120px)]">
                    <ChatInterface 
                        tool="define" 
                        welcomeMessage={{
                            title: "Define a Term",
                            message: "Enter any word or term to get a clear and concise definition."
                        }}
                        promptPlaceholder="e.g., 'Photosynthesis' or 'Capitalism'"
                    />
                </div>
            </main>
        </SidebarInset>
    )
}
