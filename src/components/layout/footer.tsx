import { BookOpen, GitCompareArrows, Network, Search } from "lucide-react";
import Link from "next/link";

const navLinks = [
  {
    label: "Explorează",
    href: "/2003",
    icon: BookOpen,
  },
  {
    label: "Compară",
    href: "/compare",
    icon: GitCompareArrows,
  },
  {
    label: "Graf",
    href: "/graph",
    icon: Network,
  },
  {
    label: "Căutare",
    href: "/#",
    icon: Search,
    isSearch: true,
  },
];

const versionLinks = [
  { label: "Constituția 1952", href: "/1952" },
  { label: "Constituția 1986", href: "/1986" },
  { label: "Constituția 1991", href: "/1991" },
  { label: "Constituția 2003", href: "/2003" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-10 sm:py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Constituția României
            </Link>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Platformă interactivă pentru explorarea tuturor versiunilor Constituției României.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold">Navigare</h3>
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
            <h3 className="text-sm font-semibold">Versiuni</h3>
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
            <h3 className="text-sm font-semibold">Despre proiect</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Proiect open-source pentru accesibilizarea Constituției României. Datele provin din
              textele oficiale ale constituțiilor din 1952, 1986, 1991 și 2003.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Constituția României. Proiect open-source.
          </p>
          <p className="text-xs text-muted-foreground">
            Realizat cu Next.js, Tailwind CSS și shadcn/ui
          </p>
        </div>
      </div>
    </footer>
  );
}
