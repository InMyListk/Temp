import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTRPC } from "@/integrations/trpc/react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { BookOpen, Calendar, AlertCircle, PlayCircle } from "lucide-react"

export function BookGrid() {
    const trpc = useTRPC()
    const { data: books, isLoading, error } = useQuery(trpc.users.getLibraryBooks.queryOptions())

    if (isLoading) {
        return (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-2">
                        <Skeleton className="aspect-5/4 w-full rounded-md" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-2 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground/80">
                <AlertCircle className="h-8 w-8 mb-2 text-destructive/50" />
                <p>Unable to load your library</p>
            </div>
        )
    }

    if (!books?.length) {
        return (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border border-dashed border-border/50 rounded-lg bg-muted/20">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-lg">Empty Library</h3>
                <p className="text-muted-foreground text-sm max-w-60 mt-2">
                    Generate your first book to get started
                </p>
            </div>
        )
    }

    // Show recent books (first 8)
    const recentBooks = books.slice(0, 8);

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {recentBooks.map((book) => (
                <Card
                    key={book.id}
                    className="group relative py-0 pb-2 flex flex-col overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm rounded-md transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5"
                >
                    {/* Cover Image Area */}
                    <div className="aspect-5/4 relative w-full overflow-hidden bg-muted/50">
                        {book.coverImage ? (
                            <img
                                src={book.coverImage}
                                alt={book.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-muted/50 to-muted">
                                <BookOpen className="h-8 w-8 text-muted-foreground/20" />
                            </div>
                        )}

                        {/* Video Link overlay on hover */}
                        {book.videoUrl && (
                            <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                <a
                                    href={book.videoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex h-6 w-6 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
                                    title="Watch Source Video"
                                >
                                    <PlayCircle className="h-3.5 w-3.5" />
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-2 pt-0 space-y-1.5">
                        <h4 className="font-medium text-xs leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {book.title}
                        </h4>

                        <div className="mt-auto flex items-center justify-between pt-1 text-[9px] text-muted-foreground">
                            <div className="flex items-center gap-0.5">
                                <BookOpen className="h-2.5 w-2.5" />
                                <span>{book.pages?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                                <Calendar className="h-2.5 w-2.5" />
                                <span>{new Date(book.createdAt).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Full card click area - Absolute positioned link */}
                    <Link
                        to={`/dashboard/books/${book.id}`}
                        className="absolute inset-0 z-10 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md"
                    >
                        <span className="sr-only">View {book.title}</span>
                    </Link>
                </Card>
            ))}
        </div>
    )
}
