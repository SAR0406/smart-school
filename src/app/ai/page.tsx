
import { AIAssistant } from "@/components/ai-assistant";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function AIPage() {
  return (
    <SidebarInset>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-lg font-semibold md:text-xl">AI Assistant</h1>
        </div>
      </header>

      <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
        <div className="h-[calc(100vh-120px)]">
          <AIAssistant />
        </div>
      </main>
    </SidebarInset>
  );
}
