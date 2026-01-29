import { createGoogleGenerativeAI } from '@ai-sdk/google'
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
        const apiKey = key || process.env.GEMINI_API_KEY
        console.log(apiKey)
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: 'Missing ai gateway API key.' }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
        const AiProvider = createGoogleGenerativeAI({
          apiKey,
        });
        try {
          const result = await generateText({
            
            maxOutputTokens: 50,
            model: AiProvider(model),
            prompt,
            system,
            temperature: 0.7,
          })
          
          console.log(result.text)
          
          return new Response(JSON.stringify({ text: result.text }), {
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
