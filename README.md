# Constituția României - Platformă Interactivă

Platformă web interactivă și modernă pentru explorarea Constituției României prin toate versiunile sale istorice (1952, 1986, 1991, 2003).

## Funcționalități

- **Explorare articol cu articol** - Navigare ierarhică prin Titluri, Capitole, Secțiuni și Articole
- **Vizualizare graf** - Structura constituțională ca graf force-directed interactiv
- **Comparare versiuni** - Diff side-by-side între orice două versiuni cu evidențiere colorată
- **Căutare instantanee** - Command palette (Ctrl+K) cu căutare cross-versiune
- **Feedback anonim** - Voturi de acord/dezacord și comentarii moderate prin AI
- **Export PDF** - Exportarea comparațiilor în format PDF
- **Dark/Light mode** - Suport complet pentru ambele teme
- **Fully responsive** - Optimizat pentru desktop, tabletă și mobil

## Stack Tehnologic

- **Frontend**: Next.js 16 (App Router, React 19, Server Components)
- **Styling**: Tailwind CSS 4 + shadcn/ui (Vega style, Stone base, Indigo theme)
- **Database**: Neon (Serverless PostgreSQL) + Drizzle ORM
- **Rich Text**: TipTap (read-only)
- **Diff**: react-diff-viewer-continued
- **Graph**: react-force-graph-2d
- **Charts**: Recharts via shadcn/ui
- **Search**: shadcn Command (cmdk)
- **AI Moderation**: OpenRouter API
- **Security**: Arcjet (rate limiting, bot protection)
- **Linting**: Biome

## Cerințe

- Node.js 22+ LTS
- pnpm (recomandat) sau npm
- Cont Neon pentru PostgreSQL
- API key OpenRouter (pentru moderare comentarii)
- API key Arcjet (pentru rate limiting)

## Setup

1. Clonează repository-ul
2. Copiază `.env.example` în `.env.local` și completează credențialele
3. Rulează scriptul de setup:

```bash
chmod +x init.sh
./init.sh
```

Sau manual:

```bash
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

4. Deschide http://localhost:3000

## Structura Proiectului

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Route Handlers
│   │   ├── health/        # Health check
│   │   ├── versions/      # Constitution versions
│   │   ├── articles/      # Articles + search
│   │   ├── diff/          # Version comparison
│   │   └── stats/         # Aggregated statistics
│   ├── [year]/[...slug]/  # Constitution reader
│   ├── compare/           # Diff comparison page
│   ├── graph/             # Graph visualization
│   └── statistics/        # Statistics dashboard
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Header, footer, theme
│   ├── reader/            # Reader components
│   ├── diff/              # Diff viewer components
│   ├── graph/             # Graph components
│   ├── feedback/          # Comments, votes
│   ├── landing/           # Landing page sections
│   └── search/            # Command palette
├── lib/
│   ├── db/                # Drizzle schema + connection
│   └── parser/            # Markdown parser
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript types

public/
├── 1952.md               # Constituția din 1952
├── 1986.md               # Constituția din 1986
├── 1991.md               # Constituția din 1991
└── 2003.md               # Constituția din 2003
```

## Date Constituționale

| Versiune | Articole | Structură |
|----------|----------|-----------|
| 1952 | ~105 | Capitol introductiv + Capitole numerotate |
| 1986 | ~121 | Titluri numerotate |
| 1991 | ~152 | Titluri + Capitole + Secțiuni + Articole cu titlu |
| 2003 | ~157 | Titluri + Capitole + Secțiuni + Articole cu titlu (revizia 2003) |
| **Total** | **~535** | |

## Licență

Conținutul constituțional este de domeniu public. Codul sursă al platformei este licențiat sub [MIT](LICENSE).
