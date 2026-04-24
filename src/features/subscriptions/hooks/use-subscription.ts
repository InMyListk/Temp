import { authClient } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"

export const useSubscription = () => {
    return useQuery({
        queryKey: ["customer-state"],
        queryFn: async () => {
            const { data } = await authClient.customer.state()
            return data
        },
    })
}


export const useHasActiveSubscription = () => {
    const { data: customerState, isLoading, ...rest } = useSubscription()
    const hasActiveSubscription =
        customerState?.activeSubscriptions &&
        customerState.activeSubscriptions.length > 0

    const creditsBalance = customerState?.activeMeters?.reduce((sum: number, meter: any) => sum + meter.balance, 0) ?? 0

    return {
        creditsBalance,
        hasActiveSubscription,
        subscription: customerState?.activeSubscriptions?.[0],
        isLoading,
        ...rest
    }
}

