import { Card } from "@/components/ui/card"
import { Play, Clock, BookOpen } from "lucide-react"

const mockBooks = [
    {
        id: 1,
        title: "System Design Guide",
        thumbnail: "/system-design-architecture.jpg",
        author: "Tech Academy",
        duration: "2h 30m",
        chapters: 12,
    },
    {
        id: 2,
        title: "Web Development Essentials",
        thumbnail: "/web-development-code.png",
        author: "Code Masters",
        duration: "1h 45m",
        chapters: 8,
    },
    {
        id: 3,
        title: "React Advanced Patterns",
        thumbnail: "/react-patterns-code.jpg",
        author: "React Guru",
        duration: "3h 15m",
        chapters: 15,
    },
    {
        id: 4,
        title: "Database Optimization",
        thumbnail: "/database-optimization-data.jpg",
        author: "Data Pro",
        duration: "2h 10m",
        chapters: 10,
    },
    {
        id: 5,
        title: "Cloud Architecture",
        thumbnail: "/cloud-architecture-servers.jpg",
        author: "AWS Expert",
        duration: "4h 00m",
        chapters: 18,
    },
    {
        id: 6,
        title: "API Design Best Practices",
        thumbnail: "/api-design-integration.jpg",
        author: "Backend Dev",
        duration: "1h 55m",
        chapters: 9,
    },
]

export function BookGrid() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {mockBooks.map((book) => (
                <Card
                    key={book.id}
                    className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm rounded-lg cursor-pointer transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                    {/* Thumbnail */}

                    {/* Content */}
                    <div className="p-3 space-y-2">
                        <h4 className="font-semibold text-sm leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {book.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">{book.author}</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80">
                            <BookOpen className="h-3 w-3" />
                            <span>{book.chapters} chapters</span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}
