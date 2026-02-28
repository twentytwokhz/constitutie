import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Ce versiuni ale Constituției sunt disponibile?",
    answer:
      "Platforma include toate cele 4 versiuni istorice ale Constituției României: 1952, 1986, 1991 și 2003. Fiecare versiune poate fi explorată articol cu articol, cu navigare ierarhică prin titluri, capitole și secțiuni.",
  },
  {
    question: "Cum pot compara două versiuni ale Constituției?",
    answer:
      'Navighează la secțiunea „Compară Versiuni" din meniul principal. Selectează versiunea A (stânga) și versiunea B (dreapta), iar diff viewer-ul îți va arăta exact ce articole au fost adăugate, eliminate sau modificate, cu culori distincte pentru fiecare tip de schimbare.',
  },
  {
    question: "Comentariile sunt anonime?",
    answer:
      "Da, toate comentariile sunt complet anonime. Nu este necesar un cont de utilizator. Comentariile trec printr-un sistem de moderare automată bazat pe AI care verifică calitatea și respectarea normelor de exprimare civilizată.",
  },
  {
    question: "Cum funcționează căutarea cross-versiune?",
    answer:
      "Apasă Ctrl+K (sau ⌘K pe Mac) pentru a deschide paleta de căutare. Poți căuta după numărul articolului, titlu sau conținut. Rezultatele sunt grupate pe versiuni, astfel încât poți vedea cum apare un subiect în fiecare versiune a Constituției.",
  },
  {
    question: "Ce reprezintă vizualizarea graf?",
    answer:
      "Graful interactiv arată structura ierarhică a Constituției (titluri → capitole → secțiuni → articole) și referințele între articole. Nodurile sunt colorate diferit în funcție de tip, iar poți da click pe orice nod pentru a vedea detalii sau a naviga la articolul respectiv.",
  },
  {
    question: "Pot exporta comparațiile în format PDF?",
    answer:
      "Da, în pagina de comparare există un buton de export PDF care generează un document stilizat cu diferențele între cele două versiuni selectate, incluzând coduri de culoare pentru adăugări, eliminări și modificări.",
  },
];

export function FaqSection() {
  return (
    <section className="py-12 sm:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Întrebări frecvente
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground sm:text-base">
          Răspunsuri la cele mai comune întrebări despre platformă
        </p>

        <div className="mx-auto mt-8 max-w-2xl sm:mt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger className="text-left text-sm sm:text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
