import { ChatInterface } from "@/components/chat-interface";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { HelpCircle } from "lucide-react";

export default function QuizPage() {
    return (
        <SidebarInset>
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <h1 className="text-lg font-semibold md:text-xl flex items-center gap-2">
                        <HelpCircle /> Quiz Generator
                    </h1>
                </div>
            </header>
            <main className="flex flex-1 flex-col">
                <div className="h-[calc(100vh-56px)]">
                    <ChatInterface 
                        tool="quiz" 
                        welcomeMessage={{
                            title: "Quiz Generator",
                            message: "Enter a topic to generate a 5-question multiple-choice quiz."
                        }}
                        promptPlaceholder="e.g., 'The Solar System' or 'Shakespeare's Plays'"
                    />
                </div>
            </main>
        </SidebarInset>
    )
}
