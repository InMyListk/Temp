import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { requireAuth } from '@/lib/auth-utils';
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')(
  {
    component: App,
    beforeLoad: async () => {
      await requireAuth();
    }
  }
)

function App() {
  const { data } = authClient.useSession();
  return (
    <div>
      {JSON.stringify(data)}
      {data && (
        <Button onClick={() => authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              redirect({ to: '/login' });
            }
          }
        })}>
          Logout
        </Button>
      )}
    </div>
  )
}
