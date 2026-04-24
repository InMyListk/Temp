import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EditorState {
  pages: string[];
  activePage: number;
  bookId: string | null;
  setPages: (pages: string[]) => void;
  setActivePage: (index: number) => void;
  setBookId: (id: string | null) => void;
  addPage: () => void;
  removePage: (index: number) => void;
  updatePage: (index: number, content: string) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      pages: ['# New Page\n\n'],
      activePage: 0,
      bookId: null,
      setPages: (pages) => set({ pages }),
      setActivePage: (activePage) => set({ activePage }),
      setBookId: (bookId) => set({ bookId }),
      addPage: () =>
        set((state) => {
          const newPages = [...state.pages, `# Page ${state.pages.length + 1}\n\n`];
          return { pages: newPages, activePage: newPages.length - 1 };
        }),
      removePage: (index) =>
        set((state) => {
          if (state.pages.length <= 1) return state;
          const newPages = state.pages.filter((_, i) => i !== index);
          const newActivePage =
            state.activePage >= index && state.activePage > 0
              ? state.activePage - 1
              : state.activePage;
          // Adjust active page if it's out of bounds (e.g. we deleted the last page)
          const finalActivePage = Math.min(newActivePage, newPages.length - 1);
          return { pages: newPages, activePage: finalActivePage };
        }),
      updatePage: (index, content) =>
        set((state) => {
          const newPages = [...state.pages];
          newPages[index] = content;
          return { pages: newPages };
        }),
      reset: () => set({ pages: ['# New Page\n\n'], activePage: 0 }),
    }),
    {
      name: 'editor-storage',
      partialize: (state) => ({ pages: state.pages, activePage: state.activePage, bookId: state.bookId }),
    }
  )
);
