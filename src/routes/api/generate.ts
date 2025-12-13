import { createFileRoute } from '@tanstack/react-router'
import { inngest } from '@/integrations/inngest'

export const Route = createFileRoute('/api/generate')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json()
          const { url } = body as { url: string }

          if (!url) {
            return new Response(
              JSON.stringify({ error: 'URL is required' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
          }

          // Send the event to Inngest
          await inngest.send({
            name: 'video/generate',
            data: { url },
          })

          return new Response(
            JSON.stringify({ success: true, message: 'Video generation started' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error('Error sending Inngest event:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to start generation' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
      },
    },
  },
})
