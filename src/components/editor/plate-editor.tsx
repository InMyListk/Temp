'use client';

import { useEffect, useState } from 'react';
import { Plate, usePlateEditor } from 'platejs/react';
import { useMutation } from '@tanstack/react-query';

import { useTRPC } from '@/integrations/trpc/react';
import { Spinner } from '@/components/ui/spinner';
import { EditorKit } from '@/components/editor/plugins/editor-kit';
import { SettingsDialog } from '@/components/editor/plugins/settings-dialog';
import { Editor, EditorContainer } from '@/components/editor/ui/editor';
import { MarkdownPlugin } from '@platejs/markdown';
import { EditorHeader } from './editor-header';
import { useEditorStore } from './store';
import { toast } from 'sonner';

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
  bookId: string;
}

export function PlateEditor({ initialPages, bookId }: Prop) {
  const { 
    pages, 
    activePage, 
    bookId: storedBookId,
    setPages, 
    setActivePage, 
    setBookId,
    addPage, 
    removePage, 
    updatePage 
  } = useEditorStore();

  const trpc = useTRPC();
  const updatePagesMutation = useMutation(trpc.users.updateBookPages.mutationOptions());

  const [isSynced, setIsSynced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize store with props
  useEffect(() => {
    // Only update store if we're opening a different book than what's in local storage
    if (storedBookId !== bookId) {
      if (initialPages && initialPages.length > 0) {
        setPages(initialPages);
      } else {
        setPages(['# New Page\n\n']);
      }
      setActivePage(0);
      setBookId(bookId);
    }
    
    setIsSynced(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]); // Depend primarily on bookId to switch contexts

  // Ensure we have valid active page
  const safeActivePage = Math.min(activePage, pages.length - 1);
  const safeContent = pages[safeActivePage] || '';

  const handleContentChange = (content: string) => {
    updatePage(safeActivePage, content);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePagesMutation.mutateAsync({
        bookId,
        pages
      });
      
      toast.success("Changes saved to cloud successfully");
    } catch (error) {
      toast.error("Failed to save changes");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
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
        onSave={handleSave}
        isSaving={isSaving}
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
