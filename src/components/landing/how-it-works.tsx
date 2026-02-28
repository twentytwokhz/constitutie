import { BookOpen, GitCompareArrows, MessageSquare } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Alege o versiune",
    description:
      "Selectează una din cele 4 versiuni istorice ale Constituției: 1952, 1986, 1991 sau 2003. Navighează articol cu articol prin table of contents interactiv.",
    icon: BookOpen,
  },
  {
    number: 2,
    title: "Compară și analizează",
    description:
      "Folosește diff viewer-ul pentru a vedea exact ce s-a schimbat între versiuni. Vizualizează structura prin graful interactiv.",
    icon: GitCompareArrows,
  },
  {
    number: 3,
    title: "Exprimă-ți opinia",
    description:
      "Votează de acord sau dezacord pe fiecare articol și lasă comentarii anonime, moderate automat de AI pentru calitate.",
    icon: MessageSquare,
  },
];

export function HowItWorks() {
  return (
    <section className="py-12 sm:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Cum funcționează
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground sm:text-base">
          Trei pași simpli pentru a explora legea fundamentală a României
        </p>

        <div className="mx-auto mt-10 max-w-4xl sm:mt-14">
          {/* Steps grid with connectors */}
          <div className="relative grid gap-8 sm:grid-cols-3 sm:gap-6">
            {/* Horizontal connector line (desktop only) */}
            <div
              className="pointer-events-none absolute top-[3.25rem] left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] hidden h-0.5 bg-border sm:block"
              aria-hidden="true"
            />

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative flex flex-col items-center text-center">
                  {/* Step number circle */}
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-background text-xl font-bold text-primary shadow-sm">
                    {step.number}
                  </div>

                  {/* Vertical connector arrow (mobile only, except after last) */}
                  {index < steps.length - 1 && (
                    <div
                      className="my-2 flex flex-col items-center text-muted-foreground sm:hidden"
                      aria-hidden="true"
                    >
                      <div className="h-4 w-0.5 bg-border" />
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        aria-label="arrow down"
                      >
                        <path
                          d="M6 0L11 6H1L6 0Z"
                          className="fill-border"
                          transform="rotate(180 6 6)"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  {/* Text */}
                  <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
