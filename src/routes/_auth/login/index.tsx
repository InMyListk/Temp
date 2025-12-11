import { LoginForm } from '@/features/auth/components/login-form'
import { requireUnauth } from '@/lib/auth-utils'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/login/')({
    component: RouteComponent,
    beforeLoad: async () => {
        await requireUnauth()
    }
})

function RouteComponent() {
    return <LoginForm />

}
