import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from "@/components/dashboard-layout"
import { MainContent } from "@/components/main-content"

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <DashboardLayout>
      <MainContent />
    </DashboardLayout>
  )
}
