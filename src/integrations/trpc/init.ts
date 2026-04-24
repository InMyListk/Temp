import { session } from '@/db/auth-schema';
import { auth, polarClient } from '@/lib/auth';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'

const t = initTRPC.create({
  transformer: superjson,
})
export const getSession = createServerFn()
  .handler(async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    return session;
  });

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const session = await getSession();

  if (!session) {
    throw new TRPCError(
      {
        code: 'UNAUTHORIZED', message: "Unauthorized"
      }
    );
  }

  return next({ ctx: { ...ctx, auth: session }, })
})
export const premiumProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const customers = await polarClient.customers.list({
    email: ctx.auth.user.email,
  })

  const customer = customers.result.items[0];

  if (!customer) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: "Premium subscription required",
    });
  }

  const userSubscriptionActive = await polarClient.subscriptions.list({
    customerId: customer.id,
    active: true,
  });

  if (!userSubscriptionActive.result.items.length) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: "Premium subscription required",
    });
  }

  return next({ ctx: { ...ctx, auth: ctx.auth, userSubscriptionActive }, })
})
