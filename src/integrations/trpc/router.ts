import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from './init'

import { db } from '@/db'
import { inngest } from '../inngest'

const todosRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(({ ctx }) => {
    console.log('Authenticated user:', ctx.auth)

    return db.query.user.findMany()
  }),
  generateBook: protectedProcedure
    .input(z.object({ 
      url: z.string().url(),
      type: z.enum(['video', 'playlist']).optional().default('video'),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Send the event to Inngest
        console.log('Sending Inngest event for URL:', input.url, 'Type:', input.type)
        await inngest.send({
          name: 'video/generate',
          data: { url: input.url, type: input.type, userId: ctx.auth.user.id },
        })

        return { success: true, message: `${input.type === 'playlist' ? 'Playlist' : 'Video'} generation started` }
      } catch (error) {
        console.error('Error sending Inngest event:', error)
        throw new Error('Failed to start generation')
      }
    }),
})

export const trpcRouter = createTRPCRouter({
  users: todosRouter,
})
export type TRPCRouter = typeof trpcRouter
