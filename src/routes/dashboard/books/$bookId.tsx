import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from "@/components/dashboard-layout"
import { useTRPC } from "@/integrations/trpc/react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useMutation, useQuery } from "@tanstack/react-query"
import { PlateEditor } from '@/components/editor/plate-editor'
import { requireAuth } from '@/lib/auth-utils'
import { PencilIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/books/$bookId')({
    component: BookDetails,
    beforeLoad: async () => {
        await requireAuth();
    }
})

function BookTitleEditor({ book, updateBookInfo, isPending }: { book: any, updateBookInfo: any, isPending: boolean }) {
    const [bookTitle, setBookTitle] = useState('');
    return (
        <div className='flex items-center gap-2 hover:bg-gray-100 py-1 px-3 rounded cursor-text'>
            <input
                type="text"
                value={bookTitle || book.title}
                onChange={(e) => setBookTitle(e.target.value)}
                className='field-sizing-content border-0 outline-0 bg-transparent'
            />
            {bookTitle && bookTitle !== book.title && (
                <Button variant={"ghost"} onClick={() => {
                    updateBookInfo({ bookId: book.id, context: { title: bookTitle } })
                }} disabled={isPending}>
                    {isPending ? 'Saving...' : 'SAVE'}
                </Button>
            )}
        </div>
    )
}

function BookDetails() {
    const { bookId } = Route.useParams()
    const trpc = useTRPC()
    const { data: book, isLoading } = useQuery(trpc.users.getBookDetails.queryOptions({ bookId }))
    const { mutateAsync: updateBookInfo, isPending } = useMutation(trpc.users.updateBookInfo.mutationOptions());

    return (
        <DashboardLayout>
            <main className="flex-1 overflow-auto bg-background">
                <div className="sticky z-[999] top-0 bg-background/50 backdrop-blur-xl border-b border-border/40">
                    <div className="flex items-center justify-between px-6 py-3">
                        <SidebarTrigger />
                        {book ? (
                            <BookTitleEditor book={book} updateBookInfo={updateBookInfo} isPending={isPending} />
                        ) : (
                            <div className='flex items-center gap-2 hover:bg-gray-100 py-1 px-3 rounded cursor-text'>
                                <h1 className="text-sm font-medium">Loading...</h1>
                            </div>
                        )}
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
                        <PlateEditor
                            key={book.id}
                            bookId={book.id}
                            initialPages={book.pages?.map((page: any) => page.content) || []}
                        />
                    </div>
                )}
            </main>
        </DashboardLayout>
    )
}
