import { AuthLayout } from '@/features/auth/components/auth-layout'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <AuthLayout>
            <Outlet />
        </AuthLayout>
    )


}
