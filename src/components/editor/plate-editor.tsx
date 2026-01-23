'use client';

import { useEffect, useState } from 'react';
import { Plate, usePlateEditor } from 'platejs/react';

import { Spinner } from '@/components/ui/spinner';
import { EditorKit } from '@/components/editor/plugins/editor-kit';
import { SettingsDialog } from '@/components/editor/plugins/settings-dialog';
import { Editor, EditorContainer } from '@/components/editor/ui/editor';
import { MarkdownPlugin } from '@platejs/markdown';
import { EditorHeader } from './editor-header';
import { useEditorStore } from './store';

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
  const { 
    pages, 
    activePage, 
    setPages, 
    setActivePage, 
    addPage, 
    removePage, 
    updatePage 
  } = useEditorStore();

  const [isSynced, setIsSynced] = useState(false);

  // Initialize store with props
  useEffect(() => {
    if (initialPages && initialPages.length > 0) {
      setPages(initialPages);
    } else {
      setPages(['# New Page\n\n']);
    }
    setActivePage(0);
    setIsSynced(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPages]); // Only run when initialPages changes (e.g. data loaded)

  // Ensure we have valid active page
  const safeActivePage = Math.min(activePage, pages.length - 1);
  const safeContent = pages[safeActivePage] || '';

  const handleContentChange = (content: string) => {
    updatePage(safeActivePage, content);
  };

  if (!isSynced) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <EditorHeader
        pages={pages}
        activePage={safeActivePage}
        onPageChange={setActivePage}
        onAddPage={addPage}
        onRemovePage={removePage}
      />
      <div className="flex-1 overflow-hidden p-4">
        <SinglePageEditor
          key={safeActivePage}
          content={safeContent}
          onChange={handleContentChange}
        />
      </div>
    </div>
  );
}
