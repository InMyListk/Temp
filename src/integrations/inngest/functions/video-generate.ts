import { inngest } from '../client'
import { getTranscript, extractPlaylistId, getPlaylistVideos, extractVideoId } from '../utils/transcript';
import { generateBookContent } from '../utils/generate-book';
import { db } from '../../../db';
import { books, pages } from '../../../db/schema';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { NonRetriableError } from 'inngest';
import { polarClient } from '@/lib/auth';

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
        const { url, userId, bookId, type, language } = event.data

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
                    thumbnail: null // Playlist thumbnail will be set below
                };
            }

            console.log(`Fetching metadata for: ${validatedUrl}`)
            const videoId = extractVideoId(validatedUrl);
            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

            return {
                title: 'Video Title',
                duration: '10:00',
                thumbnail: thumbnailUrl
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

            // Set the playlist thumbnail using the first video
            if (videoIds.length > 0 && bookId) {
                await step.run('update-playlist-thumbnail', async () => {
                    await db.update(books).set({
                        coverImage: `https://img.youtube.com/vi/${videoIds[0]}/hqdefault.jpg`
                    }).where(eq(books.id, bookId));
                });
            }

            videos = videoIds.map(id => ({ url: `https://www.youtube.com/watch?v=${id}` }));
        } else {
            videos = [{ url: validatedUrl }];
        }

        let pageOffset = 0;

        for (let i = 0; i < videos.length; i++) {
            const video = videos[i];
            const videoIndex = i;

            if (i > 0) {
                await step.sleep('delay-' + i, '20s'); // 20-second delay between videos to prevent rating limiting
            }

            // Process each video in the list
            const result = await step.run(`process-video-${videoIndex}`, async () => {
                try {
                    console.log(`Processing video ${videoIndex + 1}/${videos.length}: ${video.url}`);

                    // 1. Get Transcript
                    const transcript = await getTranscript(video.url);

                    // 2. Generate Content
                    const { book, creditsUsed } = await generateBookContent(transcript, language);

                    // 3. Insert Pages Incrementally
                    if (bookId && userId) {
                        const pagesToInsert = book.pages.map((page, index) => ({
                            id: randomUUID(),
                            bookId: bookId,
                            title: page.title,
                            content: page.content,
                            pageNumber: pageOffset + index + 1, // Increment correctly across videos
                            status: 'completed'
                        }));

                        await polarClient.events.ingest({
                            events: [
                                {
                                    externalCustomerId: userId,
                                    name: "premium_credit_used",
                                    metadata: {
                                        // pageCount: book.pages.length,
                                        // totalTokens: usageMetadata?.totalTokenCount!,
                                        // creditsUsed: creditsUsed,
                                        // videoId: video.url
                                        credits: creditsUsed
                                    }
                                }
                            ]
                        })

                        if (pagesToInsert.length > 0) {
                            await db.insert(pages).values(pagesToInsert);
                        }

                        // Update book title if it's the first video and we want to use the generated title
                        if (videoIndex === 0) {
                            await db.update(books).set({
                                title: book.title,
                            }).where(eq(books.id, bookId));
                        }
                    }

                    return {
                        pagesGenerated: book.pages.length
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
export const functions = [videoGenerateWorkflow]
