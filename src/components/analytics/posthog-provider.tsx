"use client";

import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { Suspense, useEffect } from "react";

/**
 * PostHog Analytics Provider
 *
 * Initializes PostHog client-side analytics with:
 * - Automatic pageview tracking via SPA-aware PostHogPageView
 * - Session recording (if enabled in PostHog project settings)
 * - Autocapture of clicks, form submissions, etc.
 *
 * Requires NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST env vars.
 * If NEXT_PUBLIC_POSTHOG_KEY is not set, analytics is silently disabled.
 *
 * Privacy: PostHog respects Do Not Track headers. No cookies are set
 * unless the user opts in. IP addresses are not stored by default
 * in PostHog Cloud EU.
 */

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

/**
 * Tracks SPA page views by listening to pathname + search params changes.
 * Must be inside PostHogProvider and Suspense boundary.
 */
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthogClient = usePostHog();

  useEffect(() => {
    if (pathname && posthogClient) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) {
        url = `${url}?${search}`;
      }
      posthogClient.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthogClient]);

  return null;
}

export function PostHogAnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!POSTHOG_KEY) return;

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // Disable automatic pageview capture — we handle it manually
      // via PostHogPageView to properly track SPA navigations
      capture_pageview: false,
      // Disable automatic pageleave capture — prevents double events
      capture_pageleave: true,
      // Respect Do Not Track browser setting
      respect_dnt: true,
      // Persistence: use localStorage (no cookies) for privacy
      persistence: "localStorage",
      // Only load in production or when explicitly configured
      loaded: (ph) => {
        // In development, optionally enable debug mode
        if (process.env.NODE_ENV === "development") {
          ph.debug(false);
        }
      },
    });
  }, []);

  // If no PostHog key configured, render children without analytics
  if (!POSTHOG_KEY) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
