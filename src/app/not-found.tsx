import Link from "next/link";

/**
 * Custom 404 Page
 *
 * Styled 404 page with link to return home.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">Pagină negăsită</h2>
        <p className="mt-2 text-muted-foreground">
          Pagina pe care o cauți nu există sau a fost mutată.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Înapoi la pagina principală
        </Link>
      </div>
    </div>
  );
}
