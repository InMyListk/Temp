'use client';

import { useState } from 'react';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/components/editor/plugins/editor-kit';
import { SettingsDialog } from '@/components/editor/plugins/settings-dialog';
import { Editor, EditorContainer } from '@/components/editor/ui/editor';
import { MarkdownPlugin } from '@platejs/markdown';
import { EditorHeader } from './editor-header';

interface SinglePageEditorProps {
  content: string;
  onChange: (content: string) => void;
}

function SinglePageEditor({ content, onChange }: SinglePageEditorProps) {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: (editor) => {
      // Handle undefined/null/empty content to avoid deserialize errors
      const safeContent = content || '';
      return editor.getApi(MarkdownPlugin).markdown.deserialize(safeContent);
    },
  });

  return (
    <Plate
      editor={editor}
      onChange={({ value }) => {
        const markdown = editor.getApi(MarkdownPlugin).markdown.serialize({ value });
        onChange(markdown);
      }}
    >
      <EditorContainer>
        <Editor variant="default" className="h-full min-h-[500px]" />
      </EditorContainer>

      <SettingsDialog />
    </Plate>
  );
}

type Prop = {
  initialPages: string[];
}

export function PlateEditor({ initialPages }: Prop) {
  // Ensure we always have at least one page
  const defaultPages = initialPages && initialPages.length > 0 ? initialPages : ['# New Page\n\n'];
  const [pages, setPages] = useState<string[]>(defaultPages);
  const [activePage, setActivePage] = useState(0);

  const handleAddPage = () => {
    setPages([...pages, `# Page ${pages.length + 1}\n\n`]);
    setActivePage(pages.length);
  };

  const handleRemovePage = (index: number) => {
    if (pages.length <= 1) return;
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    if (activePage >= index && activePage > 0) {
      setActivePage(activePage - 1);
    }
  };

  const handleContentChange = (content: string) => {
    const newPages = [...pages];
    newPages[activePage] = content;
    setPages(newPages);
  };

  return (
    <div className="flex flex-col h-full">
      <EditorHeader
        pages={pages}
        activePage={activePage}
        onPageChange={setActivePage}
        onAddPage={handleAddPage}
        onRemovePage={handleRemovePage}
      />
      <div className="flex-1 overflow-hidden p-4">
        <SinglePageEditor
          key={activePage}
          content={pages[activePage]}
          onChange={handleContentChange}
        />
      </div>
    </div>
  );
}
