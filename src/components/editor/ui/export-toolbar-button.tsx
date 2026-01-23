'use client';

import * as React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { MarkdownPlugin } from '@platejs/markdown';
import { ArrowDownToLineIcon } from 'lucide-react';
import { createSlateEditor } from 'platejs';
import { useEditorRef } from 'platejs/react';
import { serializeHtml } from 'platejs/static';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/editor/ui/dropdown-menu';
import { BaseEditorKit } from '@/components/editor/plugins/editor-base-kit';
import { useEditorStore } from '../store';

import { EditorStatic } from './editor-static';
import { ToolbarButton } from './toolbar';

const siteUrl = 'https://platejs.org';

export function ExportToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);
  const { pages } = useEditorStore();

  const getCanvas = async () => {
    const { default: html2canvas } = await import('html2canvas-pro');

    const style = document.createElement('style');
    document.head.append(style);

    const canvas = await html2canvas(editor.api.toDOMNode(editor)!, {
      onclone: (document: Document) => {
        const editorElement = document.querySelector(
          '[contenteditable="true"]'
        );
        if (editorElement) {
          Array.from(editorElement.querySelectorAll('*')).forEach((element) => {
            const existingStyle = element.getAttribute('style') || '';
            element.setAttribute(
              'style',
              `${existingStyle}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important`
            );
          });
        }
      },
    });
    style.remove();

    return canvas;
  };

  const downloadFile = async (url: string, filename: string) => {
    const response = await fetch(url);

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();

    // Clean up the blob URL
    window.URL.revokeObjectURL(blobUrl);
  };

  const exportToPdf = async () => {
    const { default: html2canvas } = await import('html2canvas-pro');
    const PDFLib = await import('pdf-lib');
    const pdfDoc = await PDFLib.PDFDocument.create();

    const editorStatic = createSlateEditor({
        plugins: BaseEditorKit,
    });
    const markdownApi = editorStatic.getApi(MarkdownPlugin);

    // Create a hidden container slightly larger than standard A4 width (approx 800px)
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '794px'; // A4 width at 96 DPI
    container.style.background = 'white';
    container.style.color = 'black'; // Ensure text is visible
    document.body.appendChild(container);

    // Apply basic styles to the container to match editor appearance
    // We assume global styles are present, but might need to enforce font
    container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

    try {
        for (let i = 0; i < pages.length; i++) {
            const pageContent = pages[i];
            const nodes = markdownApi.markdown.deserialize(pageContent);
            const pageEditor = createSlateEditor({
                plugins: BaseEditorKit,
                value: nodes,
            });

            // Serialize specific page content
            const pageHtml = await serializeHtml(pageEditor, {
                editorComponent: EditorStatic,
                props: { style: { padding: '40px' } }, // Add padding for PDF page look
            });

            container.innerHTML = pageHtml;

            // Wait a moment for rendering (especially useful if there were images, though they are likely base64 or urls)
            await new Promise(r => setTimeout(r, 50));

            const canvas = await html2canvas(container, {
                scale: 2, // 2x scale for better quality
                useCORS: true,
                logging: false,
                windowWidth: 794,
            });

            const page = pdfDoc.addPage([canvas.width, canvas.height]);
            const imageEmbed = await pdfDoc.embedPng(canvas.toDataURL('PNG'));
            
            page.drawImage(imageEmbed, {
                x: 0,
                y: 0,
                width: canvas.width,
                height: canvas.height,
            });
        }

        const pdfBase64 = await pdfDoc.saveAsBase64({ dataUri: true });
        await downloadFile(pdfBase64, 'book.pdf');
    } catch (e) {
        console.error("PDF Export failed", e);
    } finally {
        document.body.removeChild(container);
    }
  };

  const exportToImage = async () => {
    // Keeps functionality to export ONLY the current active view in editor
    const canvas = await getCanvas();
    await downloadFile(canvas.toDataURL('image/png'), 'plate.png');
  };

  const exportToHtml = async () => {
    const editorStatic = createSlateEditor({
      plugins: BaseEditorKit,
    });
    const markdownApi = editorStatic.getApi(MarkdownPlugin);
    
    let allPagesHtml = '';

    for (const pageContent of pages) {
         const nodes = markdownApi.markdown.deserialize(pageContent);
         const pageEditor = createSlateEditor({
            plugins: BaseEditorKit,
            value: nodes,
         });

         const pageHtml = await serializeHtml(pageEditor, {
            editorComponent: EditorStatic,
            props: { style: { padding: '20px', maxWidth: '800px', margin: '0 auto' } },
         });
         
         allPagesHtml += `<div style="page-break-after: always; margin-bottom: 50px; border-bottom: 1px dashed #ccc; padding-bottom: 20px;">${pageHtml}</div>`;
    }

    const tailwindCss = `<link rel="stylesheet" href="${siteUrl}/tailwind.css">`;
    const katexCss = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.18/dist/katex.css" integrity="sha384-9PvLvaiSKCPkFKB1ZsEoTjgnJn+O3KvEwtsz37/XrkYft3DTk2gHdYvd9oWgW3tV" crossorigin="anonymous">`;

    const html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=JetBrains+Mono:wght@400..700&display=swap"
          rel="stylesheet"
        />
        ${tailwindCss}
        ${katexCss}
        <style>
          :root {
            --font-sans: 'Inter', 'Inter Fallback';
            --font-mono: 'JetBrains Mono', 'JetBrains Mono Fallback';
          }
          body {
            background-color: #fff; /* Ensure white background for export */
          }
        </style>
      </head>
      <body>
        ${allPagesHtml}
      </body>
    </html>`;

    const url = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;

    await downloadFile(url, 'book.html');
  };

  const exportToMarkdown = async () => {
    // Join all pages
    const md = pages.join('\n\n---\n\n');
    const url = `data:text/markdown;charset=utf-8,${encodeURIComponent(md)}`;
    await downloadFile(url, 'book.md');
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Export" isDropdown>
          <ArrowDownToLineIcon className="size-4" />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={exportToHtml}>
            Export All as HTML
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={exportToPdf}>
            Export All as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={exportToImage}>
            Export Current Page as Image
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={exportToMarkdown}>
            Export All as Markdown
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
