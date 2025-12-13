import { EventSchemas, Inngest } from 'inngest'
import type { Events } from './events'

// Create a client to send and receive events
export const inngest = new Inngest({
  id: 'temp-app',
  schemas: new EventSchemas().fromRecord<Events>(),
  // Uncomment and add your event key for production
  eventKey: process.env.VITE_INNGEST_EVENT_KEY,
})
