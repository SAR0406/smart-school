
import { DocumentScanner } from "@/components/document-scanner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ScanLine } from "lucide-react";

export default function ScannerPage() {
    return (
        <main className="relative flex min-h-svh flex-1 flex-col bg-background">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <h1 className="text-lg font-semibold md:text-xl flex items-center gap-2">
                        <ScanLine /> Document Scanner
                    </h1>
                </div>
            </header>
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
                <DocumentScanner />
            </div>
        </main>
    )
}
