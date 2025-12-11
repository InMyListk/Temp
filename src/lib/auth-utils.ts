import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from './auth';

export const getSession = createServerFn()
    .handler(async () => {
        const headers = getRequestHeaders();
        const session = await auth.api.getSession({ headers });
        return session;
    });

export const requireAuth = createServerFn()
    .handler(async () => {
        const headers = getRequestHeaders();
        const session = await auth.api.getSession({ headers });

        if (!session) {
            // TanStack Start automatically handles redirects thrown from server functions.
            throw redirect({ to: '/login' });
        }

        return session;
    });

export const requireUnauth = createServerFn()
    .handler(async () => {
        const headers = getRequestHeaders();
        const session = await auth.api.getSession({ headers });

        if (session) {
            throw redirect({ to: '/login' });
        }

        return session;
    });