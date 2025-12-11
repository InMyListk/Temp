import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from './init'

import type { TRPCRouterRecord } from '@trpc/server'
import { db } from '@/db'

const todosRouter = {
  getUsers: protectedProcedure.query(({ ctx }) => {
    console.log('Authenticated user:', ctx.auth)

    return db.query.user.findMany()
  })
} satisfies TRPCRouterRecord

export const trpcRouter = createTRPCRouter({
  users: todosRouter,
})
export type TRPCRouter = typeof trpcRouter
