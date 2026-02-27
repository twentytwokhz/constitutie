/**
 * Graph Visualization Page
 *
 * Route: /graph
 * Layout: Full-width canvas with overlay controls
 *
 * Features:
 * - Force-directed graph (react-force-graph-2d)
 * - Version selector
 * - Node types: Titlu (large, indigo), Capitol (medium), Secțiune, Articol (small, grey)
 * - Edge types: hierarchical (solid) and references (dashed)
 * - Click node → preview panel
 * - Zoom/pan controls
 * - Legend
 */
export default function GraphPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Vizualizare Graf</h1>
      <p className="mt-4 text-muted-foreground">
        Graph visualization - to be implemented
      </p>
    </div>
  );
}
