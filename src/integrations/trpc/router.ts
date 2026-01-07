import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from './init'

import { db } from '@/db'
import { inngest } from '../inngest'
import { books, pages } from '@/db/schema'
import { eq, not, and, desc, asc } from 'drizzle-orm'
import { randomUUID } from 'crypto'

const todosRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(({ ctx }) => {
    console.log('Authenticated user:', ctx.auth)

    return db.query.user.findMany()
  }),
  
  getActiveBooks: protectedProcedure.query(async ({ ctx }) => {
    return db.query.books.findMany({
      where: and(
        eq(books.userId, ctx.auth.user.id),
        not(eq(books.status, 'completed')),
        not(eq(books.status, 'failed'))
      ),
      orderBy: [desc(books.createdAt)],
    })
  }),

  getLibraryBooks: protectedProcedure.query(async ({ ctx }) => {
    return db.query.books.findMany({
      where: and(
        eq(books.userId, ctx.auth.user.id),
        eq(books.status, 'completed')
      ),
      orderBy: [desc(books.createdAt)],
    })
  }),

  getBookDetails: protectedProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ input, ctx }) => {
      const book = await db.query.books.findFirst({
        where: and(eq(books.id, input.bookId), eq(books.userId, ctx.auth.user.id)),
        with: {
          pages: {
            orderBy: [asc(pages.pageNumber)],
          },
        },
      })
      return book
    }),

  generateBook: protectedProcedure
    .input(z.object({ 
      url: z.string().url(),
      type: z.enum(['video', 'playlist']).optional().default('video'),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const bookId = randomUUID()
        
        // Create initial book record
        await db.insert(books).values({
          id: bookId,
          userId: ctx.auth.user.id,
          title: 'Processing...',
          videoUrl: input.url,
          status: 'queued',
        })

        // Send the event to Inngest
        console.log('Sending Inngest event for URL:', input.url, 'Type:', input.type)
        await inngest.send({
          name: 'video/generate',
          data: { 
            url: input.url, 
            type: input.type, 
            userId: ctx.auth.user.id,
            bookId // Pass the bookId
          },
        })

        return { success: true, message: `${input.type === 'playlist' ? 'Playlist' : 'Video'} generation started`, bookId }
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
