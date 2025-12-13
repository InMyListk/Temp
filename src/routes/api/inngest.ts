import { createFileRoute } from '@tanstack/react-router'
import { InngestCommHandler, type ServeHandlerOptions } from 'inngest'
import { inngest, functions } from '@/integrations/inngest'

// Custom serve handler for TanStack Start (Web Request/Response API)
const serve = (options: ServeHandlerOptions) => {
  const handler = new InngestCommHandler({
    frameworkName: 'tanstack-start',
    ...options,
    handler: (req: Request) => ({
      body: () => req.json(),
      headers: (key) => req.headers.get(key),
      method: () => req.method,
      url: () => new URL(req.url, `http://${req.headers.get('host') || 'localhost'}`),
      transformResponse: ({ body, status, headers }) => {
        return new Response(body, { status, headers })
      },
    }),
  })
  return handler.createHandler()
}

const handler = serve({
  client: inngest,
  functions,
})

export const Route = createFileRoute('/api/inngest')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return handler(request)
      },
      POST: async ({ request }: { request: Request }) => {
        return handler(request)
      },
      PUT: async ({ request }: { request: Request }) => {
        return handler(request)
      },
    },
  },
})
