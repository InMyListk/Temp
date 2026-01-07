import { AppSidebar } from "./app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-full">
                <AppSidebar />
                {children}
            </div>
        </SidebarProvider>
    )
}
