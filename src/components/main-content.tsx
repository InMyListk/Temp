import { BookGrid } from "./book-grid"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ActivityIndicator } from "./activity-indicator"
import { GenerateInput } from "./generate-input"

export function MainContent() {

    return (
        <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background">
            {/* Header with Sidebar Trigger */}
            <div className="sticky top-0 z-40 bg-background/50 backdrop-blur-xl border-b border-border/40 supports-backdrop-filter:bg-background/20">
                <div className="flex items-center justify-between px-6 py-3">
                    <SidebarTrigger />
                    <h1 className="text-xs font-bold text-primary/80 uppercase tracking-widest">BookCraft</h1>
                    <ActivityIndicator />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col items-center justify-start px-4 sm:px-6 py-8 sm:py-10">
                {/* Headline */}
                <div className="text-center mb-8 space-y-2 max-w-2xl">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
                        Turn <span className="text-primary">Videos</span> into <span className="text-primary">Books</span>
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                        Transform your favorite YouTube content into structured, readable books.
                        Start your learning journey today.
                    </p>
                </div>

                <div className="w-full max-w-xl mb-10 relative group">
                    <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-secondary/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-500" />
                    <GenerateInput />
                </div>

                {/* Recent Generations Section */}
                <div className="w-full max-w-7xl px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-semibold tracking-tight">Recent Library</h3>
                        {/* <Button variant="link" className="text-primary h-auto p-0">View all</Button> */}
                    </div>
                    <BookGrid />
                </div>
            </div>
        </main>
    )
}
