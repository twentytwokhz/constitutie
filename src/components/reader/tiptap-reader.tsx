"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface TipTapReaderProps {
  content: Record<string, unknown>;
}

/**
 * TipTap Read-Only Editor for rendering constitution article content.
 *
 * Renders TipTap JSON (stored in contentTiptap column) as formatted HTML
 * with proper ordered lists (alineate), paragraphs, and text styling.
 * The editor is non-interactive (read-only mode).
 */
export function TipTapReader({ content }: TipTapReaderProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure ordered list to use proper numbering
        orderedList: {
          HTMLAttributes: {
            class: "tiptap-ordered-list",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "tiptap-list-item",
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: "tiptap-paragraph",
          },
        },
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
    ],
    content: content,
    editable: false,
    immediatelyRender: false,
  });

  if (!editor) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
      </div>
    );
  }

  return (
    <div className="tiptap-content">
      <EditorContent editor={editor} />
    </div>
  );
}
