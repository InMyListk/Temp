import { Link } from "@tanstack/react-router"
import { BookOpen, Home, Library, Book, Loader } from "lucide-react"
import { useTRPC } from "@/integrations/trpc/react"
import { useQuery } from "@tanstack/react-query"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarGroup,
    SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight, ChevronDown } from "lucide-react"
import { authClient } from "@/lib/auth-client"

export function AppSidebar() {
    const trpc = useTRPC()
    const auth = authClient.useSession().data;
    const { data: books, isLoading } = useQuery(trpc.users.getLibraryBooks.queryOptions())

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-border/50">
                <div className="flex items-center gap-2 px-2 py-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <BookOpen className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                        <span className="font-semibold text-sm">BookCraft</span>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Beta</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                {/* Main Navigation */}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive>
                            <Link to="/dashboard" className="flex items-center gap-2">
                                <Home className="h-4 w-4" />
                                <span>My Library</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                <SidebarGroup className="mt-6">
                    <SidebarGroupLabel>Library</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Collapsible defaultOpen className="group/collapsible">
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton className="flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <Library className="h-4 w-4" />
                                            <span>My Books</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:hidden" />
                                        <ChevronDown className="h-4 w-4 transition-transform hidden group-data-[state=open]/collapsible:block" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub className="">
                                        {!isLoading ? books?.map((book: any) => (
                                            <SidebarMenuSubItem key={book.id}>
                                                <SidebarMenuSubButton asChild>
                                                    <Link
                                                        to="/dashboard/books/$bookId"
                                                        params={{ bookId: book.id }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Book className="h-3.5 w-3.5 min-w-3.5 opacity-70" />
                                                        <span className="truncate" title={book.title}>{book.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        )) : <div className="flex w-full max-w-sm flex-col gap-2">
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <div className="flex gap-4" key={index}>
                                                    <Skeleton className="h-5 flex-1" />
                                                </div>
                                            ))}
                                        </div>}
                                        {books?.length === 0 && (
                                            <SidebarMenuSubItem>
                                                <span className="px-2 py-1 text-xs text-muted-foreground">No books yet</span>
                                            </SidebarMenuSubItem>
                                        )}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </Collapsible>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t">
                <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                            <p className="font-medium">{auth?.user.name}</p>
                            <p className="text-xs text-muted-foreground">Free Plan</p>
                        </div>
                    </div>
                </div>
                <Button className="w-full mt-2" size="sm">
                    Upgrade
                </Button>
            </SidebarFooter>
        </Sidebar>
    )
}
