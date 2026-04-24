import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

// All Plate.js packages that need to be pre-bundled
const platePackages = [
  'platejs',
  'platejs/react',
  '@platejs/ai',
  '@platejs/ai/react',
  '@platejs/autoformat',
  '@platejs/basic-nodes',
  '@platejs/basic-nodes/react',
  '@platejs/basic-styles',
  '@platejs/basic-styles/react',
  '@platejs/callout',
  '@platejs/callout/react',
  '@platejs/caption',
  '@platejs/caption/react',
  '@platejs/code-block',
  '@platejs/code-block/react',
  '@platejs/combobox',
  '@platejs/combobox/react',
  '@platejs/comment',
  '@platejs/comment/react',
  '@platejs/date',
  '@platejs/date/react',
  '@platejs/dnd',
  '@platejs/docx',
  '@platejs/emoji',
  '@platejs/emoji/react',
  '@platejs/excalidraw',
  '@platejs/excalidraw/react',
  '@platejs/floating',
  '@platejs/indent',
  '@platejs/indent/react',
  '@platejs/juice',
  '@platejs/layout',
  '@platejs/layout/react',
  '@platejs/link',
  '@platejs/link/react',
  '@platejs/list',
  '@platejs/list/react',
  '@platejs/markdown',
  '@platejs/math',
  '@platejs/math/react',
  '@platejs/media',
  '@platejs/media/react',
  '@platejs/mention',
  '@platejs/mention/react',
  '@platejs/resizable',
  '@platejs/selection',
  '@platejs/selection/react',
  '@platejs/slash-command',
  '@platejs/slash-command/react',
  '@platejs/suggestion',
  '@platejs/suggestion/react',
  '@platejs/table',
  '@platejs/table/react',
  '@platejs/toc',
  '@platejs/toc/react',
  '@platejs/toggle',
  '@platejs/toggle/react',
  '@udecode/cn',
]

const config = defineConfig({
  plugins: [
    devtools(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  optimizeDeps: {
    include: platePackages,
    // Force re-optimization if deps become stale
    force: false,
  },
  ssr: {
    // Ensure Plate.js packages are bundled for SSR (not externalized)
    // Also include react-tweet to handle its CSS imports during SSR
    noExternal: [/^platejs/, /^@platejs\//, /^@udecode\//, 'react-tweet'],
  },
})

export default config
