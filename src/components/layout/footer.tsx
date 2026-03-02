import { Link } from "@/i18n/navigation";
import { BookOpen, GitCompareArrows, Github, Network, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";

const GITHUB_URL = "https://github.com/twentytwokhz/constitutie";

export async function Footer() {
  const t = await getTranslations();

  const navLinks = [
    {
      label: t("footer.explore"),
      href: "/2003",
      icon: BookOpen,
    },
    {
      label: t("footer.compare"),
      href: "/compare",
      icon: GitCompareArrows,
    },
    {
      label: t("footer.graph"),
      href: "/graph",
      icon: Network,
    },
    {
      label: t("footer.search"),
      href: "/#",
      icon: Search,
      isSearch: true,
    },
  ];

  const versionLinks = [
    { label: t("footer.constitution1866"), href: "/1866" },
    { label: t("footer.constitution1923"), href: "/1923" },
    { label: t("footer.constitution1938"), href: "/1938" },
    { label: t("footer.constitution1948"), href: "/1948" },
    { label: t("footer.constitution1952"), href: "/1952" },
    { label: t("footer.constitution1965"), href: "/1965" },
    { label: t("footer.constitution1986"), href: "/1986" },
    { label: t("footer.constitution1991"), href: "/1991" },
    { label: t("footer.constitution2003"), href: "/2003" },
  ];

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-10 sm:py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="text-lg font-bold tracking-tight">
              {t("common.appName")}
            </Link>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">{t("footer.description")}</p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold">{t("footer.navigation")}</h3>
            <ul className="mt-3 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <link.icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Versions */}
          <div>
            <h3 className="text-sm font-semibold">{t("footer.versions")}</h3>
            <ul className="mt-3 space-y-2">
              {versionLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold">{t("footer.about")}</h3>
            <p className="mt-3 text-sm text-muted-foreground">{t("footer.aboutText")}</p>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              {t("footer.sourceCode")}
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-muted-foreground">{t("footer.builtWith")}</p>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label={t("footer.github")}
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
