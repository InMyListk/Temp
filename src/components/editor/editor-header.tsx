import { Plus, FileText, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center border-b bg-background p-2 gap-2 w-full overflow-hidden">
      <div 
        className={cn(
          "flex items-center gap-2 overflow-x-auto flex-1 -mr-2 pr-2 pb-1", 
          isMobile 
            ? "[&::-webkit-scrollbar]:hidden" 
            : "[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-accent/50 hover:[&::-webkit-scrollbar-thumb]:bg-accent"
        )}
      >
        {pages.map((_, index) => (
          <div
            key={index}
            className={cn(
              "group flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors cursor-pointer select-none shrink-0 touch-none",
              activePage === index 
                ? "bg-accent text-accent-foreground border-primary/50 shadow-sm" 
                : "hover:bg-accent/50 text-muted-foreground hover:text-foreground border-transparent hover:border-border"
            )}
            onClick={() => onPageChange(index)}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Page {index + 1}</span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "ml-0.5 -mr-1 rounded-full p-0.5 transition-opacity outline-none focus:opacity-100",
                    isMobile || activePage === index ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  <span className="sr-only">Menu</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePage(index);
                  }}
                  disabled={pages.length <= 1}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Page
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      <div className="flex items-center pl-2 border-l bg-background z-10">
        <Button
          onClick={onAddPage}
          variant="outline"
          size={isMobile ? "icon" : "sm"}
          className={cn(
            "shrink-0 transition-all", 
            !isMobile && "gap-2 border-dashed"
          )}
        >
          <Plus className="h-4 w-4" />
          {!isMobile && "Add Page"}
        </Button>
      </div>
    </div>
  );
}
