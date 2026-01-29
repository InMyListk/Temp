import type {
  ChatMessage,
  ToolName,
} from '@/components/editor/plugins/use-chat';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createFileRoute } from '@tanstack/react-router';
import {
  type LanguageModel,
  type UIMessageStreamWriter,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateObject,
  streamObject,
  streamText,
  tool,
} from 'ai';
import { nanoid, type SlateEditor } from 'platejs';
import { z } from 'zod';

import { markdownJoinerTransform } from '@/lib/markdown-joiner-transform';

import {
  getChooseToolPrompt,
  getCommentPrompt,
  getEditPrompt,
  getGeneratePrompt,
} from '@/lib/ai/command/prompts';

const inputSchema = z.object({
  apiKey: z.string().optional(),
  ctx: z.object({
    children: z.any(),
    selection: z.any(),
    toolName: z.string().optional().nullable(),
  }),
  messages: z.array(z.any()).optional(),
  model: z.string().optional(),
});

async function handleAICommand(request: Request) {
  // Dynamic imports to avoid bundler issues with SSR
  const [{ createSlateEditor, nanoid }, { BaseEditorKit }] = await Promise.all([
    import('platejs'),
    import('@/components/editor/plugins/editor-base-kit'),
  ]);

  const data = await request.json();
  const validatedData = inputSchema.parse(data);
    console.log("here command.ts")
  const {
    apiKey: key,
    ctx,
    messages: messagesRaw = [],
    model,
  } = validatedData;

  const { children, selection, toolName: toolNameParam } = ctx;

  const editor = createSlateEditor({
    plugins: BaseEditorKit,
    selection,
    value: children,
  });

  const apiKey = key || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Missing Gemini API key.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const isSelecting = editor.api.isExpanded();

  const AiProvider = createGoogleGenerativeAI({
    apiKey,
  });

  try {
    const stream = createUIMessageStream<ChatMessage>({
      execute: async ({ writer }) => {
        let toolName = toolNameParam;

        if (!toolName) {
          const { object: AIToolName } = await generateObject({
            enum: isSelecting
              ? ['generate', 'edit', 'comment']
              : ['generate', 'comment'],
            model: AiProvider('gemini-3-flash-preview'),
            output: 'enum',
            prompt: getChooseToolPrompt({ messages: messagesRaw }),
          });

          writer.write({
            data: AIToolName as ToolName,
            type: 'data-toolName',
          });

          toolName = AIToolName;
        }

        const textStream = streamText({
          experimental_transform: markdownJoinerTransform(),
          model: AiProvider(model || 'gemini-3-flash-preview'),
          // Not used
          prompt: '',
          tools: {
            comment: getCommentTool(editor, {
              messagesRaw,
              model: AiProvider(model || 'gemini-3-flash-preview'),
              writer,
            }),
          },
          prepareStep: async (step) => {
            if (toolName === 'comment') {
              return {
                ...step,
                toolChoice: { toolName: 'comment', type: 'tool' },
              };
            }

            if (toolName === 'edit') {
              const editPrompt = getEditPrompt(editor, {
                isSelecting,
                messages: messagesRaw,
              });

              return {
                ...step,
                activeTools: [],
                messages: [
                  {
                    content: editPrompt,
                    role: 'user',
                  },
                ],
              };
            }

            if (toolName === 'generate') {
              const generatePrompt = getGeneratePrompt(editor, {
                messages: messagesRaw,
              });

              return {
                ...step,
                activeTools: [],
                messages: [
                  {
                    content: generatePrompt,
                    role: 'user',
                  },
                ],
                model: AiProvider(model || 'gemini-3-flash-preview'),
              };
            }
          },
        });

        writer.merge(textStream.toUIMessageStream({ sendFinish: false }));
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Failed to process AI request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


const getCommentTool = (
  editor: SlateEditor,
  {
    messagesRaw,
    model,
    writer,
  }: {
    messagesRaw: ChatMessage[];
    model: LanguageModel;
    writer: UIMessageStreamWriter<ChatMessage>;
  }
) =>
  tool({
    description: 'Comment on the content',
    inputSchema: z.object({}),
    execute: async () => {
      const { elementStream } = streamObject({
        model,
        output: 'array',
        prompt: getCommentPrompt(editor, {
          messages: messagesRaw,
        }),
        schema: z
          .object({
            blockId: z
              .string()
              .describe(
                'The id of the starting block. If the comment spans multiple blocks, use the id of the first block.'
              ),
            comment: z
              .string()
              .describe('A brief comment or explanation for this fragment.'),
            content: z
              .string()
              .describe(
                String.raw`The original document fragment to be commented on.It can be the entire block, a small part within a block, or span multiple blocks. If spanning multiple blocks, separate them with two \n\n.`
              ),
          })
          .describe('A single comment'),
      });

      for await (const comment of elementStream) {
        const commentDataId = nanoid();

        writer.write({
          id: commentDataId,
          data: {
            comment,
            status: 'streaming',
          },
          type: 'data-comment',
        });
      }

      writer.write({
        id: nanoid(),
        data: {
          comment: null,
          status: 'finished',
        },
        type: 'data-comment',
      });
    },
  });

export const Route = createFileRoute('/api/ai/command')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        return handleAICommand(request);
      },
    },
  },
});
