import { BookOpen, GitCompareArrows, Network, Search } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

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
              <GithubIcon className="h-4 w-4" />
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
              <GithubIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
