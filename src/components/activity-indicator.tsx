import { useState, useEffect, useRef } from "react";
import { Activity, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function ActivityIndicator() {
  const [open, setOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const prevActiveBooksRef = useRef<Set<string>>(new Set());

  // Poll for active books every 2 seconds
  const { data: activeBooks, isLoading } = useQuery({
    ...trpc.users.getActiveBooks.queryOptions(),
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (!activeBooks) return;

    const currentIds = new Set(activeBooks.map(book => book.id));
    const prevIds = prevActiveBooksRef.current;

    // Check for new jobs to auto-open the popover
    const hasNewJobs = activeBooks.some(book => !prevIds.has(book.id));
    if (hasNewJobs && prevIds.size >= 0) {
      setOpen(true);
    }

    // Check for completed/failed jobs to invalidate caches
    const hasCompletedJobs = Array.from(prevIds).some(id => !currentIds.has(id));
    if (hasCompletedJobs) {
      queryClient.invalidateQueries(trpc.users.getLibraryBooks.queryFilter());
    }

    // Initialize state if empty, otherwise update ref
    if (prevIds.size === 0 && currentIds.size > 0 && !hasNewJobs) {
      // Just initial load, do nothing special
    } else if (hasNewJobs && prevIds.size === 0) {
      // Very first load with new item (after user clicked generate recently)
      // Optionally open popover here as well, but it might just be a page reload while active.
    }
    prevActiveBooksRef.current = currentIds;

  }, [activeBooks, queryClient, trpc]);

  const hasActiveJobs = activeBooks && activeBooks.length > 0;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Activity className={`h-5 w-5 ${hasActiveJobs ? "animate-pulse text-primary" : "text-muted-foreground"}`} />
            {hasActiveJobs && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end" >
          <div className="p-4 font-medium border-b">Activity</div>
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : !hasActiveJobs ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No active jobs
              </div>
            ) : (
              <div className="divide-y">
                {activeBooks?.map((book) => (
                  <div
                    key={book.id}
                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedBookId(book.id);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-sm line-clamp-1">
                        {book.title}
                      </span>
                      {getStatusIcon(book.status)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Progress value={book.status === 'completed' ? 100 : book.status === 'processing' ? 50 : 0} className="h-1" />
                      <span className="capitalize">{book.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <Dialog open={!!selectedBookId} onOpenChange={(open) => !open && setSelectedBookId(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedBookId && <BookStatusDetails bookId={selectedBookId} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function BookStatusDetails({ bookId }: { bookId: string }) {
  const trpc = useTRPC();
  const { data: book } = useQuery({
    ...trpc.users.getBookDetails.queryOptions({ bookId }),
    refetchInterval: (query) => {
      const data = query.state.data;
      return (data?.status === 'completed' || data?.status === 'failed' ? false : 1000);
    }
  });

  if (!book) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" /></div>;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {getStatusIcon(book.status)}
          <span className="line-clamp-1">{book.title}</span>
        </DialogTitle>
      </DialogHeader>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>Status: <span className="font-medium text-foreground capitalize">{book.status}</span></span>
          {book.failureReason && <span className="text-destructive">Error: {book.failureReason}</span>}
        </div>

        <div className="border rounded-md">
          <div className="bg-muted/50 p-3 text-sm font-medium border-b">
            Generated Content
          </div>
          <ScrollArea className="h-[300px]">
            <div className="divide-y">
              {book.pages?.map((page) => (
                <div key={page.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {page.pageNumber}
                    </span>
                    <span className="text-sm font-medium">{page.title}</span>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              ))}

              {book.status === 'processing' && (
                <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Generating next chapter...</span>
                </div>
              )}

              {(!book.pages || book.pages.length === 0) && book.status === 'processing' && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Initializing generation...
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case "queued":
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    case "processing":
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}
