import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from "@/components/dashboard-layout"
import { MainContent } from "@/components/main-content"
import { requireAuth } from '@/lib/auth-utils';

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
  beforeLoad: async () => {
    await requireAuth();
  }
})

function RouteComponent() {
  return (
    <DashboardLayout>
      <MainContent />
    </DashboardLayout>
  )
}
