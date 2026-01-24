import { createFileRoute } from '@tanstack/react-router'
import { generateText } from 'ai'

export const Route = createFileRoute('/api/ai/copilot')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const {
          apiKey: key,
          model = 'gemini-3-flash-preview',
          prompt,
          system,
        } = await request.json()

        const apiKey = key || process.env.AI_GATEWAY_API_KEY

        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: 'Missing ai gateway API key.' }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }

        try {
          const result = await generateText({
            abortSignal: request.signal,
            maxOutputTokens: 50,
            model: `openai/${model}`,
            prompt,
            system,
            temperature: 0.7,
          })

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            return new Response(null, { status: 408 })
          }

          return new Response(
            JSON.stringify({ error: 'Failed to process AI request' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
      },
    },
  },
})
