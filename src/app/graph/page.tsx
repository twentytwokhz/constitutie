"use client";

import ForceGraphCanvas, { type ForceGraphHandle } from "@/components/graph/force-graph";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Maximize2, Minus, Network, Plus, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface GraphNode {
  id: string;
  type: "titlu" | "capitol" | "sectiune" | "articol";
  label: string;
  parentId: string | null;
  articleNumber?: number;
  contentSnippet?: string | null;
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  type: "hierarchy" | "reference";
}

interface GraphData {
  year: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface VersionInfo {
  id: number;
  year: number;
  name: string;
}

const NODE_LEGEND = [
  { type: "titlu", label: "Titlu", color: "bg-indigo-500", size: "h-4 w-4" },
  { type: "capitol", label: "Capitol", color: "bg-violet-500", size: "h-3 w-3" },
  { type: "sectiune", label: "Secțiune", color: "bg-purple-500", size: "h-2.5 w-2.5" },
  { type: "articol", label: "Articol", color: "bg-stone-500", size: "h-2 w-2" },
];

const EDGE_LEGEND = [
  { type: "hierarchy", label: "Ierarhie", style: "border-t-2 border-stone-400" },
  { type: "reference", label: "Referință", style: "border-t-2 border-dashed border-indigo-400" },
];

export default function GraphPage() {
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("2003");
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphHandle>(null);

  // Fetch available versions
  useEffect(() => {
    fetch("/api/versions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVersions(data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch graph data when version changes
  useEffect(() => {
    setLoading(true);
    setSelectedNode(null);
    fetch(`/api/versions/${selectedYear}/graph`)
      .then((res) => res.json())
      .then((data) => {
        if (data.nodes) {
          setGraphData(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedYear]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  const closePreview = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Build the article URL from a node
  const getNodeUrl = (node: GraphNode) => {
    if (node.type === "articol") {
      // Extract article number from label "Art. 15. Universalitatea" -> 15
      const match = node.label.match(/Art\.\s*(\d+)/);
      if (match) {
        return `/${selectedYear}?article=${match[1]}`;
      }
    }
    return `/${selectedYear}`;
  };

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-background/95 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Network className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Vizualizare Graf</h1>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selectează versiunea" />
            </SelectTrigger>
            <SelectContent>
              {versions.length > 0
                ? versions.map((v) => (
                    <SelectItem key={v.year} value={String(v.year)}>
                      {v.name}
                    </SelectItem>
                  ))
                : [1952, 1986, 1991, 2003].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      Constituția din {y}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Graph Canvas */}
      <div ref={graphContainerRef} className="relative flex-1 overflow-hidden bg-muted/30">
        <ForceGraphCanvas
          ref={graphRef}
          data={graphData}
          loading={loading}
          onNodeClick={handleNodeClick}
        />

        {/* Stats overlay */}
        {graphData && !loading && (
          <div className="absolute left-4 top-4 rounded-lg border bg-background/90 px-3 py-2 text-xs text-muted-foreground backdrop-blur-sm">
            <span className="font-medium text-foreground">{graphData.nodes.length}</span> noduri ·{" "}
            <span className="font-medium text-foreground">{graphData.edges.length}</span> conexiuni
          </div>
        )}

        {/* Zoom Controls */}
        {graphData && !loading && (
          <div className="absolute right-4 bottom-4 flex flex-col gap-1">
            <button
              type="button"
              onClick={() => graphRef.current?.zoomIn()}
              className="rounded-lg border bg-background/90 p-2 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => graphRef.current?.zoomOut()}
              className="rounded-lg border bg-background/90 p-2 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => graphRef.current?.fitToScreen()}
              className="rounded-lg border bg-background/90 p-2 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground"
              title="Încadrare în ecran"
              aria-label="Fit to screen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Legend */}
        {showLegend && (
          <div className="absolute bottom-4 left-4 rounded-lg border bg-background/90 p-3 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Legendă</span>
              <button
                type="button"
                onClick={() => setShowLegend(false)}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-1.5">
              {NODE_LEGEND.map((item) => (
                <div key={item.type} className="flex items-center gap-2">
                  <div className={`${item.color} ${item.size} rounded-full`} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
              <div className="my-1.5 border-t" />
              {EDGE_LEGEND.map((item) => (
                <div key={item.type} className="flex items-center gap-2">
                  <div className={`w-5 ${item.style}`} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show legend button when hidden */}
        {!showLegend && (
          <button
            type="button"
            onClick={() => setShowLegend(true)}
            className="absolute bottom-4 left-4 rounded-lg border bg-background/90 px-3 py-2 text-xs text-muted-foreground backdrop-blur-sm hover:bg-background"
          >
            Legendă
          </button>
        )}

        {/* Node Preview Panel */}
        {selectedNode && (
          <div className="absolute right-4 top-4 w-80 rounded-lg border bg-background/95 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-4 fade-in duration-200">
            <div className="flex items-start justify-between border-b p-3">
              <div className="flex-1">
                <span
                  className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                    selectedNode.type === "titlu"
                      ? "bg-indigo-500"
                      : selectedNode.type === "capitol"
                        ? "bg-violet-500"
                        : selectedNode.type === "sectiune"
                          ? "bg-purple-500"
                          : "bg-stone-500"
                  }`}
                >
                  {selectedNode.type === "titlu"
                    ? "Titlu"
                    : selectedNode.type === "capitol"
                      ? "Capitol"
                      : selectedNode.type === "sectiune"
                        ? "Secțiune"
                        : "Articol"}
                </span>
                <h3 className="mt-1 text-sm font-semibold leading-tight">{selectedNode.label}</h3>
              </div>
              <button
                type="button"
                onClick={closePreview}
                className="ml-2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3">
              {/* Text fragment for article nodes */}
              {selectedNode.contentSnippet && (
                <p className="mb-3 text-xs leading-relaxed text-muted-foreground line-clamp-4">
                  {selectedNode.contentSnippet}
                  {selectedNode.contentSnippet.length >= 200 && "…"}
                </p>
              )}
              {/* Fallback for non-article nodes with no snippet */}
              {!selectedNode.contentSnippet && selectedNode.type !== "articol" && (
                <p className="mb-3 text-xs text-muted-foreground">
                  {selectedNode.type === "titlu"
                    ? "Titlu principal al constituției"
                    : selectedNode.type === "capitol"
                      ? "Capitol în cadrul titlului"
                      : "Secțiune în cadrul capitolului"}
                </p>
              )}
              <Link
                href={getNodeUrl(selectedNode)}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Deschide articolul →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
