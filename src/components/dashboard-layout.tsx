import { AppSidebar } from "./app-sidebar"
import { MainContent } from "./main-content"
import { SidebarProvider } from "@/components/ui/sidebar"

export function DashboardLayout() {
    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-full">
                <AppSidebar />
                <MainContent />
            </div>
        </SidebarProvider>
    )
}
