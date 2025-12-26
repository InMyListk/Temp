import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const books = pgTable("books", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id).notNull(),
  title: text("title").notNull(),
  videoUrl: text("video_url").notNull(),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const pages = pgTable("pages", {
  id: text("id").primaryKey(),
  bookId: text("book_id").references(() => books.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  pageNumber: integer("page_number").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const booksRelations = relations(books, ({ one, many }) => ({
  user: one(user, {
    fields: [books.userId],
    references: [user.id],
  }),
  pages: many(pages),
}));

export const pagesRelations = relations(pages, ({ one }) => ({
  book: one(books, {
    fields: [pages.bookId],
    references: [books.id],
  }),
}));
