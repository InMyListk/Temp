import { inngest } from './client'

// Example: A simple function that runs when an event is sent
export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    // Use step.run to create reliable, retryable steps
    const greeting = await step.run('create-greeting', async () => {
      return `Hello, ${event.data.name || 'World'}!`
    })

    return { message: greeting, timestamp: new Date().toISOString() }
  }
)

// Example: A scheduled function that runs every hour
export const scheduledTask = inngest.createFunction(
  { id: 'scheduled-cleanup' },
  { cron: '0 * * * *' }, // Runs every hour at minute 0
  async ({ step }) => {
    await step.run('cleanup-task', async () => {
      // Add your scheduled task logic here
      console.log('Running scheduled cleanup task...')
      return { cleaned: true }
    })

    return { success: true }
  }
)

// Example: A function with multiple steps and delays
export const onboardingWorkflow = inngest.createFunction(
  { id: 'user-onboarding' },
  { event: 'user/signed.up' },
  async ({ event, step }) => {
    // Step 1: Send welcome email
    await step.run('send-welcome-email', async () => {
      console.log(`Sending welcome email to ${event.data.email}`)
      // Add your email sending logic here
      return { emailSent: true }
    })

    // Step 2: Wait 1 day before sending tips email
    await step.sleep('wait-for-tips-email', '1d')

    // Step 3: Send tips email
    await step.run('send-tips-email', async () => {
      console.log(`Sending tips email to ${event.data.email}`)
      return { tipsEmailSent: true }
    })

    // Step 4: Wait 3 more days
    await step.sleep('wait-for-follow-up', '3d')

    // Step 5: Check if user is engaged and send follow-up
    const isEngaged = await step.run('check-engagement', async () => {
      // Add logic to check if user has been active
      return false // placeholder
    })

    if (!isEngaged) {
      await step.run('send-re-engagement-email', async () => {
        console.log(`Sending re-engagement email to ${event.data.email}`)
        return { reEngagementSent: true }
      })
    }

    return { completed: true, userId: event.data.userId }
  }
)

// Video generation workflow
export const videoGenerateWorkflow = inngest.createFunction(
  { id: 'video-generate' },
  { event: 'video/generate' },
  async ({ event, step }) => {
    const { url } = event.data

    // Step 1: Validate the YouTube URL
    const validatedUrl = await step.run('validate-url', async () => {
      console.log(`Validating YouTube URL: ${url}`)
      // Add URL validation logic here
      const isValid = url.includes('youtube.com') || url.includes('youtu.be')
      if (!isValid) {
        throw new Error('Invalid YouTube URL')
      }
      return url
    })

    // Step 2: Fetch video metadata
    const metadata = await step.run('fetch-metadata', async () => {
      console.log(`Fetching metadata for: ${validatedUrl}`)
      // Add logic to fetch video title, description, etc.
      return {
        title: 'Video Title',
        duration: '10:00',
      }
    })

    // Step 3: Extract transcript
    const transcript = await step.run('extract-transcript', async () => {
      console.log(`Extracting transcript for: ${metadata.title}`)
      // Add transcript extraction logic here
      return 'Sample transcript content...'
    })

    // Step 4: Generate book content
    const bookContent = await step.run('generate-book', async () => {
      console.log(`Generating book from transcript...`)
      // Add AI generation logic here
      return {
        chapters: [],
        content: 'Generated book content...',
      }
    })

    return {
      success: true,
      url: validatedUrl,
      metadata,
      bookContent,
    }
  }
)

// Export all functions as an array for the serve handler
export const functions = [helloWorld, scheduledTask, onboardingWorkflow, videoGenerateWorkflow]
