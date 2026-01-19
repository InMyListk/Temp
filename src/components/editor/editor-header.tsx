import { Plus, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorHeaderProps {
  pages: string[];
  activePage: number;
  onPageChange: (index: number) => void;
  onAddPage: () => void;
  onRemovePage: (index: number) => void;
}

export function EditorHeader({
  pages,
  activePage,
  onPageChange,
  onAddPage,
  onRemovePage,
}: EditorHeaderProps) {
  return (
    <div className="flex items-center gap-2 border-b bg-background p-2 overflow-x-auto">
      {pages.map((_, index) => (
        <div
          key={index}
          className={cn(
            "group flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer select-none",
            activePage === index && "bg-accent text-accent-foreground border-primary/50"
          )}
          onClick={() => onPageChange(index)}
        >
          <FileText className="h-4 w-4" />
          <span>Page {index + 1}</span>
          {pages.length > 1 && (
            <button
              className="ml-1 rounded-full p-0.5 opacity-0 hover:bg-background group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onRemovePage(index);
              }}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={onAddPage}
        className="flex items-center gap-2 rounded-md border border-dashed px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Page
      </button>
    </div>
  );
}
