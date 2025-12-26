import { useState } from "react"
import { ArrowUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BookGrid } from "./book-grid"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useTRPC } from "@/integrations/trpc/react"
import { useMutation } from "@tanstack/react-query"

export function MainContent() {
    const [mode, setMode] = useState("Video")
    const [inputValue, setInputValue] = useState("")
    
    const trpc = useTRPC()
    const generateBook = useMutation(trpc.users.generateBook.mutationOptions())

    return (
        <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
            {/* Header with Sidebar Trigger */}
            <div className="sticky top-0 z-40 bg-background/50 backdrop-blur-xl border-b border-border/40 supports-[backdrop-filter]:bg-background/20">
                <div className="flex items-center justify-between px-6 py-3">
                    <SidebarTrigger />
                    <h1 className="text-xs font-bold text-primary/80 uppercase tracking-widest">BookCraft</h1>
                    <div className="w-6" />
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
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-500" />
                    <div className="relative rounded-xl border border-border/50 bg-background/60 backdrop-blur-xl p-1.5 shadow-xl transition-all duration-300 hover:border-primary/20">
                        {/* Textarea Area */}
                        <div className="relative">
                            <textarea
                                placeholder="Paste a YouTube link here..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none h-10 py-2 px-3 leading-relaxed rounded-lg focus:bg-accent/5 transition-colors"
                            />
                        </div>

                        {/* Footer Bar */}
                        <div className="flex items-center justify-between px-1 pb-1">
                            {/* Mode Selector Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md h-7 px-2"
                                    >
                                        <span>{mode}</span>
                                        <ChevronDown className="h-3 w-3 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-32">
                                    <DropdownMenuItem onClick={() => setMode("Video")} className="cursor-pointer text-xs">
                                        Video
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setMode("Playlist")} className="cursor-pointer text-xs">
                                        Playlist
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Submit Button */}
                            <Button
                                size="icon"
                                className="h-7 w-7 rounded-lg bg-primary text-primary-foreground shadow-md hover:shadow-primary/25 hover:scale-105 transition-all duration-200"
                                disabled={generateBook.isPending}
                                onClick={() => {
                                    console.log("Generating book for URL:", inputValue, "Mode:", mode)
                                    generateBook.mutate({ 
                                        url: inputValue,
                                        type: mode.toLowerCase() as 'video' | 'playlist',
                                    })
                                }}
                            >
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Recent Generations Section */}
                <div className="w-full max-w-7xl px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-semibold tracking-tight">Recent Library</h3>
                        <Button variant="link" className="text-primary h-auto p-0">View all</Button>
                    </div>
                    <BookGrid />
                </div>
            </div>
        </main>
    )
}
