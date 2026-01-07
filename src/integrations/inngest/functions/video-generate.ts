import { inngest } from '../client'
import { getTranscript, extractPlaylistId, getPlaylistVideos } from '../utils/transcript';
import { generateBookContent } from '../utils/generate-book';
import { db } from '../../../db';
import { books, pages } from '../../../db/schema';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { NonRetriableError } from 'inngest';

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
  { 
    id: 'video-generate',
    concurrency: { limit: 1 },
    onFailure: async ({ event, error }) => {
        const { bookId } = event.data.event.data;
        if (bookId) {
            await db.update(books)
                .set({ 
                    status: 'failed',
                    failureReason: error.message 
                })
                .where(eq(books.id, bookId));
        }
    }
  },
  { event: 'video/generate' },
  async ({ event, step }) => {
    const { url, userId, bookId, type } = event.data

    // Step 0: Update status to processing
    await step.run('update-status-processing', async () => {
        if (bookId) {
            await db.update(books)
                .set({ status: 'processing' })
                .where(eq(books.id, bookId));
            return { status: 'processing' };
        }
        return { status: 'skipped' };
    });

    // Step 1: Validate the YouTube URL
    const validatedUrl = await step.run('validate-url', async () => {
        console.log(`Validating YouTube URL: ${url}`)
        
        if (type === 'playlist') {
            const isValid = url.includes('list=');
            if (!isValid) {
                throw new NonRetriableError('Invalid YouTube Playlist URL');
            }
            return url;
        }

        const isValid = url.includes('youtube.com') || url.includes('youtu.be')
        if (!isValid) {
            throw new NonRetriableError('Invalid YouTube URL')
        }
        return url
    })

    // Step 2: Fetch video metadata
    const metadata = await step.run('fetch-metadata', async () => {
        if (type === 'playlist') {
            return {
                title: 'Playlist Book',
                duration: '00:00',
                thumbnail: null
            };
        }

        console.log(`Fetching metadata for: ${validatedUrl}`)
        return {
            title: 'Video Title',
            duration: '10:00',
            thumbnail: null // Placeholder
        }
    })

    // Step 3: Update book title early
    await step.run('update-book-title', async () => {
            if (bookId) {
            await db.update(books).set({
                title: metadata.title,
                coverImage: metadata.thumbnail,
            }).where(eq(books.id, bookId));
            }
    });

    let videos: { url: string }[] = [];

    if (type === 'playlist') {
            // Step 3a: Get Playlist Videos
            const videoIds = await step.run('get-playlist-videos', async () => {
            const playlistId = extractPlaylistId(url);
            if (!playlistId) throw new NonRetriableError('Could not extract playlist ID');
            return await getPlaylistVideos(playlistId);
            });

            console.log(`Found ${videoIds.length} videos in playlist`);
            videos = videoIds.map(id => ({ url: `https://www.youtube.com/watch?v=${id}` }));
    } else {
        videos = [{ url: validatedUrl }];
    }
    
    let pageOffset = 0;

    for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const videoIndex = i;

        if (i > 0) {
            await step.sleep('delay-' + i, '2s');
        }

        // Process each video in the list
        const result = await step.run(`process-video-${videoIndex}`, async () => {
            try {
                console.log(`Processing video ${videoIndex + 1}/${videos.length}: ${video.url}`);
                
                // 1. Get Transcript
                const transcript = await getTranscript(video.url);
                
                // 2. Generate Content
                const bookContent = await generateBookContent(transcript);
                
                // 3. Insert Pages Incrementally
                if (bookId && userId) {
                        const pagesToInsert = bookContent.pages.map((page, index) => ({
                        id: randomUUID(),
                        bookId: bookId,
                        title: page.title,
                        content: page.content,
                        pageNumber: pageOffset + index + 1, // Increment correctly across videos
                        status: 'completed'
                    }));

                    if (pagesToInsert.length > 0) {
                        await db.insert(pages).values(pagesToInsert);
                    }
                    
                    // Update book title if it's the first video and we want to use the generated title
                    if (videoIndex === 0) {
                            await db.update(books).set({
                            title: bookContent.title,
                        }).where(eq(books.id, bookId));
                    }
                }
                
                return { 
                    pagesGenerated: bookContent.pages.length 
                };
            } catch (error) {
                throw new NonRetriableError(`Failed to process video ${videoIndex + 1}: ${(error as Error).message}`);
            }
        });
        
        pageOffset += result.pagesGenerated;
    }

    // Step 6: Update status to completed
    await step.run('update-status-completed', async () => {
        if (bookId) {
            await db.update(books)
                .set({ status: 'completed' })
                .where(eq(books.id, bookId));
            return { status: 'completed' };
        }
        return { status: 'skipped' };
    });

    return {
        success: true,
        bookId: bookId
    }
  }
)

// Export all functions as an array for the serve handler
export const functions = [scheduledTask, onboardingWorkflow, videoGenerateWorkflow]
