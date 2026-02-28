import { DiffPdfDocument, type PdfDiffArticle } from "@/components/diff/diff-pdf-document";
import { renderToBuffer } from "@react-pdf/renderer";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/diff/export-pdf
 *
 * Generates a styled PDF comparing two constitutional versions.
 *
 * Request body:
 * {
 *   yearA: number,
 *   yearB: number,
 *   summary: { added, removed, modified, unchanged },
 *   articles: PdfDiffArticle[]
 * }
 *
 * Returns: application/pdf binary stream
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { yearA, yearB, summary, articles } = body;

    if (!yearA || !yearB || !summary || !Array.isArray(articles)) {
      return NextResponse.json(
        { error: "Missing required fields: yearA, yearB, summary, articles" },
        { status: 400 },
      );
    }

    if (
      typeof yearA !== "number" ||
      typeof yearB !== "number" ||
      typeof summary.added !== "number" ||
      typeof summary.removed !== "number" ||
      typeof summary.modified !== "number" ||
      typeof summary.unchanged !== "number"
    ) {
      return NextResponse.json({ error: "Invalid data types in request body" }, { status: 400 });
    }

    // Type-validate articles array
    const validatedArticles: PdfDiffArticle[] = articles.map((a: Record<string, unknown>) => ({
      articleNumber: Number(a.articleNumber),
      status: a.status as PdfDiffArticle["status"],
      a: a.a as PdfDiffArticle["a"],
      b: a.b as PdfDiffArticle["b"],
    }));

    // Generate PDF buffer using @react-pdf/renderer
    const pdfBuffer = await renderToBuffer(
      DiffPdfDocument({
        yearA,
        yearB,
        summary,
        articles: validatedArticles,
      }),
    );

    // Return as downloadable PDF
    const filename = `constitutia-comparatie-${yearA}-vs-${yearB}.pdf`;

    // Convert Buffer → Uint8Array for NextResponse BodyInit compatibility
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate PDF";
    console.error("[PDF Export Error]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
