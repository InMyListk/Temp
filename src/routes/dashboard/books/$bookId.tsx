import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from "@/components/dashboard-layout"
import { useTRPC } from "@/integrations/trpc/react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useQuery } from "@tanstack/react-query"
import { PlateEditor } from '@/components/editor/plate-editor'

export const Route = createFileRoute('/dashboard/books/$bookId')({
  component: BookDetails,
})

function BookDetails() {
  const { bookId } = Route.useParams()
  const trpc = useTRPC()
  const { data: book, isLoading } = useQuery(trpc.users.getBookDetails.queryOptions({ bookId }))

  return (
    <DashboardLayout>
       <main className="flex-1 overflow-auto bg-background">
            <div className="sticky top-0 z-40 bg-background/50 backdrop-blur-xl border-b border-border/40">
                <div className="flex items-center justify-between px-6 py-3">
                    <SidebarTrigger />
                    <h1 className="text-sm font-medium">{book?.title || 'Loading...'}</h1>
                    <div />
                </div>
            </div>
            {/* <div className="p-6 max-w-4xl mx-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-muted-foreground">Loading book details...</div>
                    </div>
                ) : book ? (
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">{book.title}</h1>
                            <p className="text-muted-foreground">
                                Generated from <a href={book.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">video source</a>
                            </p>
                        </div>
                        
                        <div className="space-y-6">
                            {book.pages?.length === 0 ? (
                                <div className="p-8 border rounded-lg bg-muted/50 text-center text-muted-foreground">
                                    No pages generated for this book yet.
                                </div>
                            ) : (
                                book.pages?.map((page: any) => (
                                    <div key={page.id} className="border rounded-lg p-6 bg-card shadow-sm">
                                        <h3 className="text-xl font-semibold mb-4">{page.title}</h3>
                                        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                                            {page.content}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-8 border rounded-lg bg-destructive/10 text-destructive text-center">
                        Book not found.
                    </div>
                )}
            </div> */}
            {!isLoading && book && (
              <div>
                <PlateEditor key={book.id} initialPages={book.pages?.map((page: any) => page.content) || []} />
              </div>
            )}
       </main>
    </DashboardLayout>
  )
}
