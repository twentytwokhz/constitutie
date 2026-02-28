"use client";

import { CoatOfArms } from "@/components/national-symbols";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function Timeline() {
  const t = useTranslations();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const timelineItems = [
    {
      year: 1952,
      title: t("timeline.item1Title"),
      description: t("timeline.item1Desc"),
      articles: 105,
      highlight: t("timeline.item1Highlight"),
    },
    {
      year: 1986,
      title: t("timeline.item2Title"),
      description: t("timeline.item2Desc"),
      articles: 121,
      highlight: t("timeline.item2Highlight"),
    },
    {
      year: 1991,
      title: t("timeline.item3Title"),
      description: t("timeline.item3Desc"),
      articles: 152,
      highlight: t("timeline.item3Highlight"),
    },
    {
      year: 2003,
      title: t("timeline.item4Title"),
      description: t("timeline.item4Desc"),
      articles: 157,
      highlight: t("timeline.item4Highlight"),
    },
  ];

  return (
    <section className="border-t bg-muted/30 py-12 sm:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          {t("timeline.sectionTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground sm:text-base">
          {t("timeline.sectionDescription")}
        </p>

        {/* Desktop timeline - horizontal */}
        <div className="mx-auto mt-10 hidden max-w-4xl sm:mt-14 md:block">
          {/* Year markers row */}
          <div className="relative flex items-end justify-between">
            {/* Connector line — positioned at center of the year circles (bottom row) */}
            <div className="absolute bottom-8 right-0 left-0 h-0.5 bg-border" aria-hidden="true" />

            {timelineItems.map((item, index) => (
              <div key={item.year} className="flex flex-col items-center gap-2">
                {/* Coat of arms above year marker */}
                <CoatOfArms
                  year={item.year}
                  size={32}
                  className={`transition-all duration-200 ${
                    activeIndex === index ? "scale-110 opacity-100" : "opacity-60"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-200 ${
                    activeIndex === index
                      ? "scale-110 border-primary bg-primary text-primary-foreground shadow-lg"
                      : "border-border bg-background text-foreground hover:border-primary hover:shadow-md"
                  }`}
                >
                  {item.year}
                </button>
              </div>
            ))}
          </div>

          {/* Detail card */}
          <div className="mt-8 min-h-[140px]">
            {activeIndex !== null && (
              <div className="animate-in fade-in slide-in-from-top-2 rounded-lg border bg-card p-6 shadow-sm duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {timelineItems[activeIndex].highlight}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold">
                      {timelineItems[activeIndex].title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                      {timelineItems[activeIndex].description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {timelineItems[activeIndex].articles} {t("common.articles")}
                    </p>
                  </div>
                  <Link
                    href={`/${timelineItems[activeIndex].year}`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {t("common.explore")}
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
            {activeIndex === null && (
              <div className="flex items-center justify-center rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                {t("timeline.clickForDetails")}
              </div>
            )}
          </div>
        </div>

        {/* Mobile timeline - vertical */}
        <div className="mx-auto mt-8 max-w-md md:hidden">
          <div className="relative pl-8">
            {/* Vertical line */}
            <div
              className="absolute top-0 bottom-0 left-[0.9375rem] w-0.5 bg-border"
              aria-hidden="true"
            />

            {timelineItems.map((item, index) => (
              <div key={item.year} className="relative pb-8 last:pb-0">
                {/* Dot */}
                <button
                  type="button"
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                  className={`absolute left-[-0.5rem] z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-all ${
                    activeIndex === index
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-background text-foreground"
                  }`}
                >
                  {String(item.year).slice(2)}
                </button>

                {/* Content */}
                <div
                  className={`rounded-lg border p-4 transition-all duration-200 ${
                    activeIndex === index ? "border-primary/30 bg-card shadow-sm" : "bg-card/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CoatOfArms year={item.year} size={20} className="shrink-0" />
                    <span className="text-sm font-bold text-primary">{item.year}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {item.highlight}
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-semibold">{item.title}</h3>
                  {activeIndex === index && (
                    <div className="animate-in fade-in duration-200">
                      <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                        {item.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {item.articles} {t("common.articles")}
                        </span>
                        <Link
                          href={`/${item.year}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          {t("common.explore")}
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
