import { useEffect, useState } from 'react'
import { ArrowUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTRPC } from '@/integrations/trpc/react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import languageData from "../data/languages.json";

export function GenerateInput() {
    const trpc = useTRPC()
    const [mode, setMode] = useState("Video")
    const [language, setLanguage] = useState("English")
    const [inputValue, setInputValue] = useState("")

    const generateBook = useMutation(trpc.users.generateBook.mutationOptions())

    useEffect(() => {
        if (generateBook.isError && generateBook.error.message.includes("Premium subscription required")) {
            toast.error("Failed to generate book. Please upgrade to a premium subscription.")
        }
    }, [generateBook.isError])

    return (
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
                <div className='flex gap-x-2 align-middle'>
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

                    {/* Language Selector */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md h-7 px-2"
                            >
                                <span>{language}</span>
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-32 max-h-48 overflow-y-auto">
                            {languageData.major_languages.map((lang) => (
                                <DropdownMenuItem
                                    key={lang.iso_639_1}
                                    onClick={() => setLanguage(lang.native_name)}
                                    className="cursor-pointer text-xs"
                                >
                                    {lang.native_name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Submit Button */}
                <Button
                    size="icon"
                    className="h-7 w-7 rounded-lg bg-primary text-primary-foreground shadow-md hover:shadow-primary/25 hover:scale-105 transition-all duration-200"
                    disabled={generateBook.isPending}
                    onClick={() => {
                        console.log("Generating book for URL:", inputValue, "Mode:", mode, "Language:", language)
                        generateBook.mutate({
                            url: inputValue,
                            language: language,
                            type: mode.toLowerCase() as 'video' | 'playlist',
                        })
                    }}
                >
                    <ArrowUp className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
