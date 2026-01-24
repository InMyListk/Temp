import { createFileRoute } from '@tanstack/react-router';
import { createRouteHandler } from 'uploadthing/server';

import { ourFileRouter } from '@/lib/uploadthing';

const handler = createRouteHandler({ router: ourFileRouter });

export const Route = createFileRoute('/api/uploadthing')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return handler(request);
      },
      POST: async ({ request }: { request: Request }) => {
        return handler(request);
      },
    },
  },
});
