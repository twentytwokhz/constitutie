import { getTranslations } from "next-intl/server";
import { IllustrationNotFound } from "@/components/illustrations";
import { Link } from "@/i18n/navigation";

/**
 * Custom 404 Page
 *
 * Styled 404 page with unDraw-style illustration and link to return home.
 */
export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <IllustrationNotFound className="mx-auto h-56 w-56 md:h-72 md:w-72" />
        <h1 className="mt-6 text-6xl font-bold text-primary">{t("title")}</h1>
        <h2 className="mt-4 text-2xl font-semibold">{t("heading")}</h2>
        <p className="mt-2 max-w-md text-muted-foreground">{t("description")}</p>
        <Link
          href="/"
          className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
