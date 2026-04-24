import * as React from "react"
import { authClient } from "@/lib/auth-client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscription"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"

interface SettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const auth = authClient.useSession().data
    const { hasActiveSubscription, creditsBalance } = useHasActiveSubscription()
    const [isLoading, setIsLoading] = React.useState(false)
    const { theme, setTheme } = useTheme()

    const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string

        if (!name) return

        setIsLoading(true)
        try {
            await authClient.updateUser({ name })
            toast.success("Profile updated successfully")
            // Optionally close dialog after save
            // onOpenChange(false)
        } catch (error) {
            toast.error("Failed to update profile")
        } finally {
            setIsLoading(false)
        }
    }

    const handleManageSubscription = async () => {
        setIsLoading(true)
        try {
            const { data } = await authClient.customer.portal()
            if (data?.url) {
                window.location.href = data.url
            }
        } catch (error) {
            toast.error("Failed to open billing portal")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Manage your account settings and preferences.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="profile" className="w-full mt-2">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="billing">Billing</TabsTrigger>
                        <TabsTrigger value="appearance">Theme</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-4 space-y-4">
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    defaultValue={auth?.user.email}
                                    disabled
                                />
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Your email address cannot be changed here.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={auth?.user.name}
                                    placeholder="Your name"
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? "Saving..." : "Save changes"}
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="billing" className="mt-4 space-y-4">
                        <div className="rounded-md border p-4">
                            <div className="flex flex-col gap-1 pb-4 mb-4 border-b">
                                <span className="text-sm font-medium">Current Plan</span>
                                <span className="text-sm text-foreground">
                                    {hasActiveSubscription ? "Pro Plan" : "Free Plan"}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 mb-4">
                                <span className="text-sm font-medium">Credits Balance</span>
                                <span className="text-sm text-foreground">
                                    {creditsBalance} credits
                                </span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {hasActiveSubscription ? (
                                    <Button variant="outline" onClick={handleManageSubscription} disabled={isLoading}>
                                        Manage Subscription
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={async () => await authClient.checkout({ slug: "pro" })}
                                        disabled={isLoading}
                                    >
                                        Upgrade to Pro
                                    </Button>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="appearance" className="mt-4 space-y-4">
                        <div className="flex flex-col space-y-2">
                            <Label>Theme Preference</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant={theme === "light" ? "default" : "outline"}
                                    className="flex w-full items-center gap-2"
                                    onClick={() => setTheme("light")}
                                >
                                    <Sun className="h-4 w-4" /> Light
                                </Button>
                                <Button
                                    variant={theme === "dark" ? "default" : "outline"}
                                    className="flex w-full items-center gap-2"
                                    onClick={() => setTheme("dark")}
                                >
                                    <Moon className="h-4 w-4" /> Dark
                                </Button>
                                <Button
                                    variant={theme === "system" ? "default" : "outline"}
                                    className="flex w-full items-center gap-2"
                                    onClick={() => setTheme("system")}
                                >
                                    <Monitor className="h-4 w-4" /> System
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
