/**
 * Constitution Reader Page
 *
 * Dynamic route: /[year]/[...slug]
 * Examples:
 *   /2003                           - Version 2003 reader
 *   /2003/titlul-2                  - Title 2 of 2003
 *   /2003/titlul-2/capitolul-1      - Chapter 1 of Title 2
 *   /2003/titlul-2/capitolul-1/articolul-15 - Article 15
 *
 * Layout: 3 columns (TOC sidebar | Content | Feedback panel)
 */
interface ReaderPageProps {
  params: Promise<{
    year: string;
    slug?: string[];
  }>;
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { year, slug } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Constituția din {year}</h1>
      <p className="mt-4 text-muted-foreground">Reader page - to be implemented</p>
      {slug && <p className="mt-2 text-sm text-muted-foreground">Path: {slug.join(" / ")}</p>}
    </div>
  );
}
