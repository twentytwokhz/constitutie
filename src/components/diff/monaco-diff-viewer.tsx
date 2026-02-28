"use client";

import { DiffEditor, type DiffOnMount } from "@monaco-editor/react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

interface MonacoDiffViewerProps {
  /** Original (left) text content */
  original: string;
  /** Modified (right) text content */
  modified: string;
  /** Height of the diff editor - defaults to auto-calculated */
  height?: string | number;
  /** Whether to render side-by-side (true) or inline/unified (false) */
  sideBySide?: boolean;
}

/**
 * Monaco-based diff viewer component.
 *
 * Uses VS Code's diff engine to show line-by-line differences
 * with red/green highlighting, gutter decorations, and
 * synchronized scrolling between original and modified panels.
 */
export function MonacoDiffViewer({
  original,
  modified,
  height,
  sideBySide = true,
}: MonacoDiffViewerProps) {
  const { resolvedTheme } = useTheme();
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<Parameters<DiffOnMount>[0] | null>(null);

  // Avoid SSR mismatch - only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Dispose the diff editor BEFORE @monaco-editor/react's passive (useEffect) cleanup.
  // useLayoutEffect cleanup runs synchronously during commitDeletionEffects,
  // which happens before useEffect cleanups in commitPassiveUnmountEffects.
  // This ensures DiffEditorWidget releases its model references before
  // the TextModels are disposed — preventing the
  // "TextModel got disposed before DiffEditorWidget model got reset" error.
  useLayoutEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []);

  // Calculate a reasonable height based on content line count
  const calculatedHeight = useCallback(() => {
    if (height) return height;
    const lineCount = Math.max(original.split("\n").length, modified.split("\n").length);
    // Each line is ~19px, add some padding. Min 200px, max 600px
    const computed = Math.min(Math.max(lineCount * 19 + 40, 200), 600);
    return `${computed}px`;
  }, [height, original, modified]);

  const handleEditorMount: DiffOnMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center bg-muted/30 rounded-md border animate-pulse"
        style={{ height: typeof height === "number" ? `${height}px` : height || "300px" }}
      >
        <span className="text-sm text-muted-foreground">{t("compare.loadingDiffEditor")}</span>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <DiffEditor
        height={calculatedHeight()}
        original={original}
        modified={modified}
        language="plaintext"
        theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
        onMount={handleEditorMount}
        options={{
          readOnly: true,
          renderSideBySide: sideBySide,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "off",
          wordWrap: "on",
          wrappingStrategy: "advanced",
          fontSize: 13,
          lineHeight: 20,
          padding: { top: 8, bottom: 8 },
          renderOverviewRuler: false,
          scrollbar: {
            vertical: "auto",
            horizontal: "hidden",
            verticalScrollbarSize: 8,
          },
          enableSplitViewResizing: true,
          renderIndicators: true,
          renderMarginRevertIcon: false,
          originalEditable: false,
          domReadOnly: true,
          contextmenu: false,
          glyphMargin: false,
          folding: false,
          renderLineHighlight: "none",
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-muted/30">
            <span className="text-sm text-muted-foreground">{t("common.loading")}</span>
          </div>
        }
      />
    </div>
  );
}
