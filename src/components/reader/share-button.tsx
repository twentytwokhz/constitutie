"use client";

import { Check, Link2, Share2 } from "lucide-react";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** WhatsApp SVG icon (simple monochrome, designed to match Lucide style) */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

/** X (formerly Twitter) SVG icon — stylized "X" matching Lucide stroke style */
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 4l6.5 8L4 20" />
      <path d="M20 4l-6.5 8L20 20" />
    </svg>
  );
}

export interface ShareButtonProps {
  /** Article number, e.g. 15 */
  articleNumber?: number;
  /** Article title, e.g. "Universalitatea" */
  articleTitle?: string;
  /** Constitution version year, e.g. 2003 */
  year?: number;
  /**
   * Visual variant:
   * - "compact" renders a small inline button (header usage)
   * - "footer" renders a slightly more prominent button for footer area
   */
  variant?: "compact" | "footer";
}

/**
 * ShareButton — social share dropdown for articles.
 *
 * Shows a dropdown with WhatsApp, LinkedIn, X (Twitter), and Copy Link options.
 * On mobile devices that support the Web Share API, uses the native share sheet instead.
 */
export function ShareButton({
  articleNumber,
  articleTitle,
  year,
  variant = "compact",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  /** Build the share text that is pre-filled into share intents */
  const buildShareText = useCallback(() => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const parts: string[] = [];
    if (articleNumber != null) {
      parts.push(`${t("common.art")} ${articleNumber}`);
    }
    if (articleTitle) {
      parts.push(`\u2014 ${articleTitle}`);
    }
    const prefix = parts.length > 0 ? `${parts.join(" ")} | ` : "";
    const yearSuffix = year ? ` (${year})` : "";
    return `${prefix}${t("common.appName")}${yearSuffix}\n${url}`;
  }, [articleNumber, articleTitle, year, t]);

  /** Get the current page URL */
  const getUrl = useCallback(() => {
    return typeof window !== "undefined" ? window.location.href : "";
  }, []);

  /** Copy link to clipboard with feedback */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
    } catch {
      // Fallback for older browsers or non-HTTPS
      const textArea = document.createElement("textarea");
      textArea.value = getUrl();
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  }, [getUrl]);

  /** Try native share on mobile; returns true if native share was triggered */
  const tryNativeShare = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === "undefined" || !("share" in navigator)) return false;

    const titleText =
      articleNumber != null
        ? `${t("common.art")} ${articleNumber}${articleTitle ? ` \u2014 ${articleTitle}` : ""}`
        : t("common.appName");

    try {
      await navigator.share({
        title: titleText,
        text: buildShareText(),
        url: getUrl(),
      });
      return true;
    } catch {
      // User cancelled or share failed — fall through to dropdown
      return false;
    }
  }, [articleNumber, articleTitle, buildShareText, getUrl, t]);

  /** Open a share URL in a new window/tab and close the dropdown */
  const openShareUrl = useCallback((url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  }, []);

  const handleWhatsApp = useCallback(() => {
    const text = buildShareText();
    openShareUrl(`https://wa.me/?text=${encodeURIComponent(text)}`);
  }, [buildShareText, openShareUrl]);

  const handleLinkedIn = useCallback(() => {
    const url = getUrl();
    openShareUrl(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
  }, [getUrl, openShareUrl]);

  const handleX = useCallback(() => {
    const url = getUrl();
    const parts: string[] = [];
    if (articleNumber != null) {
      parts.push(`${t("common.art")} ${articleNumber}`);
    }
    if (articleTitle) {
      parts.push(`\u2014 ${articleTitle}`);
    }
    const yearSuffix = year ? ` (${year})` : "";
    const tweetText =
      parts.length > 0
        ? `${parts.join(" ")} | ${t("common.appName")}${yearSuffix}`
        : `${t("common.appName")}${yearSuffix}`;
    openShareUrl(
      `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`,
    );
  }, [articleNumber, articleTitle, year, getUrl, openShareUrl, t]);

  /** Handle the trigger click: try native share first, fall back to dropdown */
  const handleTriggerClick = useCallback(
    async (e: React.MouseEvent) => {
      // On devices with native share, intercept and use it
      if (typeof navigator !== "undefined" && "share" in navigator) {
        e.preventDefault();
        await tryNativeShare();
      }
      // Otherwise, Radix handles the dropdown open/close automatically
    },
    [tryNativeShare],
  );

  const isFooter = variant === "footer";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={handleTriggerClick}
          className={
            isFooter
              ? "inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              : "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          }
          title={t("reader.shareArticle")}
          aria-label={t("reader.shareArticle")}
        >
          <Share2 className={isFooter ? "h-4 w-4" : "h-3.5 w-3.5"} />
          <span>{t("common.share")}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          {t("reader.shareOn")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleWhatsApp} className="cursor-pointer gap-3 py-2">
          <WhatsAppIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>WhatsApp</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLinkedIn} className="cursor-pointer gap-3 py-2">
          <LinkedinIcon className="h-4 w-4 text-blue-700 dark:text-blue-400" />
          <span>LinkedIn</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleX} className="cursor-pointer gap-3 py-2">
          <XIcon className="h-4 w-4" />
          <span>X (Twitter)</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy} className="cursor-pointer gap-3 py-2">
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">{t("common.copied")}</span>
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              <span>{t("common.copyLink")}</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
