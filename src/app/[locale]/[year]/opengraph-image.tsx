import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { asc, eq } from "drizzle-orm";
import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { articles, constitutionVersions } from "@/lib/db/schema";

export const alt = "Constituția României";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic Open Graph image for each version page.
 * Generates a 1200×630 branded card with article info and Romanian tricolor accent.
 *
 * Placed at [year] level (not inside [[...slug]]) because Turbopack does not
 * allow static convention files inside optional catch-all segments.
 */
export default async function OgImage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const yearNum = Number.parseInt(year, 10);

  // Load Inter font for the image
  const interBold = await readFile(join(process.cwd(), "public/fonts/Inter-Bold.woff"));
  const interRegular = await readFile(join(process.cwd(), "public/fonts/Inter-Regular.woff"));

  // Default fallback if we can't resolve the article
  let articleNumber = 0;
  let articleTitle = "";
  let contentPreview = "";
  let versionYear = year;

  if (!Number.isNaN(yearNum)) {
    const [version] = await db
      .select()
      .from(constitutionVersions)
      .where(eq(constitutionVersions.year, yearNum))
      .limit(1);

    if (version) {
      versionYear = String(version.year);

      // Get the first article for this version as preview
      const [firstArticle] = await db
        .select({
          number: articles.number,
          title: articles.title,
          content: articles.content,
        })
        .from(articles)
        .where(eq(articles.versionId, version.id))
        .orderBy(asc(articles.orderIndex))
        .limit(1);

      if (firstArticle) {
        articleNumber = firstArticle.number;
        articleTitle = firstArticle.title ?? "";
        // Get first 2-3 lines of content for preview
        contentPreview = firstArticle.content
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .slice(0, 3)
          .join(" ")
          .substring(0, 180)
          .trim();
        if (firstArticle.content.length > 180) {
          contentPreview += "...";
        }
      }
    }
  }

  // Romanian tricolor: Blue (#002B7F), Yellow (#FCD116), Red (#CE1126)
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1c1917", // stone-900
        fontFamily: "Inter",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Romanian tricolor accent bar at top */}
      <div style={{ display: "flex", width: "100%", height: "6px" }}>
        <div style={{ flex: 1, backgroundColor: "#002B7F" }} />
        <div style={{ flex: 1, backgroundColor: "#FCD116" }} />
        <div style={{ flex: 1, backgroundColor: "#CE1126" }} />
      </div>

      {/* Decorative indigo gradient circle */}
      <div
        style={{
          position: "absolute",
          right: "-80px",
          top: "-80px",
          width: "400px",
          height: "400px",
          borderRadius: "200px",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "48px 60px 40px 60px",
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        {/* Top section: Branding + version */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                backgroundColor: "#6366f1", // indigo-500
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              C
            </div>
            <span
              style={{
                color: "#e7e5e4", // stone-200
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Constitutia Romaniei
            </span>
          </div>
          <div
            style={{
              backgroundColor: "rgba(99,102,241,0.15)",
              color: "#a5b4fc", // indigo-300
              fontSize: "18px",
              fontWeight: 700,
              padding: "6px 16px",
              borderRadius: "8px",
            }}
          >
            {versionYear}
          </div>
        </div>

        {/* Middle section: Article info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "32px" }}>
          <div
            style={{
              color: "#818cf8", // indigo-400
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Articolul {articleNumber}
          </div>
          {articleTitle && (
            <div
              style={{
                color: "#fafaf9", // stone-50
                fontSize: "42px",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                maxWidth: "900px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {articleTitle.length > 60 ? `${articleTitle.substring(0, 57)}...` : articleTitle}
            </div>
          )}
          {contentPreview && (
            <div
              style={{
                color: "#a8a29e", // stone-400
                fontSize: "22px",
                lineHeight: 1.5,
                maxWidth: "900px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {contentPreview}
            </div>
          )}
        </div>

        {/* Bottom section: footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(168,162,158,0.2)",
            paddingTop: "20px",
            marginTop: "auto",
          }}
        >
          <span
            style={{
              color: "#78716c", // stone-500
              fontSize: "16px",
            }}
          >
            Platforma interactiva pentru Constitutia Romaniei
          </span>
          <span
            style={{
              color: "#78716c",
              fontSize: "16px",
            }}
          >
            constitutia-romaniei.ro
          </span>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: interRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "Inter",
          data: interBold,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
