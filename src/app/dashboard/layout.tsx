import { AppSidebar, SidebarProvider } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <div className="flex-1">{children}</div>
        </div>
      </SidebarProvider>
  );
}
