import { RegisterForm } from '@/features/auth/components/register-form'
import { requireUnauth } from '@/lib/auth-utils'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/signup/')({
  component: RouteComponent,
  beforeLoad: async () => {
    await requireUnauth()
  }
})

function RouteComponent() {
  return <RegisterForm />
}
