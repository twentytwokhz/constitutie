import { MobileToc } from "@/components/reader/mobile-toc";
import { TocSidebar } from "@/components/reader/toc-sidebar";

/**
 * Year-level layout for the Constitution Reader.
 *
 * Contains the TOC sidebar (desktop) and MobileToc (mobile) so they
 * persist across article navigations without re-mounting or showing
 * skeletons. Next.js layouts never unmount — only the child page
 * re-renders when the user clicks a different article.
 *
 * The sidebar WILL re-fetch its data when the year or locale changes
 * (via TocSidebar's useEffect dependency on [year, locale]).
 */
interface YearLayoutProps {
  children: React.ReactNode;
  params: Promise<{ year: string }>;
}

export default async function YearLayout({ children, params }: YearLayoutProps) {
  const { year } = await params;
  const yearNum = Number.parseInt(year, 10);

  return (
    <div className="flex flex-col min-h-[calc(100vh-67px)]">
      <div className="flex flex-1">
        {/* TOC Sidebar — desktop only, persists across article navigations */}
        <aside className="hidden lg:block w-[280px] shrink-0 border-r border-border sticky top-[67px] h-[calc(100vh-67px)] overflow-y-auto">
          <TocSidebar year={yearNum} />
        </aside>

        {/* Main content area (page.tsx + loading.tsx render here) */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>

      {/* Mobile TOC — floating button + bottom sheet (visible below lg breakpoint) */}
      <MobileToc year={yearNum} />
    </div>
  );
}
