import { Link } from "@tanstack/react-router"
import { BookOpen, Home, Library } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight, ChevronDown } from "lucide-react"

export function AppSidebar() {
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
                                    <SidebarMenuSub>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton asChild>
                                                <Link to="/dashboard">System Design Guide</Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton asChild>
                                                <Link to="/dashboard">Web Development 101</Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton asChild>
                                                <Link to="/dashboard">React Patterns</Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
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
                            <p className="font-medium">John Doe</p>
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
