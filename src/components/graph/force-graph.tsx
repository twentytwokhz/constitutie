"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type ForceGraph2DType from "react-force-graph-2d";

// Types for graph data from the API
interface GraphNode {
  id: string;
  type: "titlu" | "capitol" | "sectiune" | "articol";
  label: string;
  parentId: string | null;
  // Force-graph adds these at runtime
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

// Node styling configuration by type
const NODE_CONFIG = {
  titlu: { size: 14, color: "#6366f1", darkColor: "#818cf8", label: "Titlu" },
  capitol: { size: 10, color: "#8b5cf6", darkColor: "#a78bfa", label: "Capitol" },
  sectiune: { size: 7, color: "#a855f7", darkColor: "#c084fc", label: "Secțiune" },
  articol: { size: 4, color: "#78716c", darkColor: "#a8a29e", label: "Articol" },
} as const;

interface ForceGraphProps {
  data: GraphData | null;
  loading: boolean;
  onNodeClick?: (node: GraphNode) => void;
}

export interface ForceGraphHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
}

const ForceGraphCanvas = forwardRef<ForceGraphHandle, ForceGraphProps>(function ForceGraphCanvas(
  { data, loading, onNodeClick },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  // biome-ignore lint/suspicious/noExplicitAny: react-force-graph-2d doesn't export proper ref type
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDark, setIsDark] = useState(false);
  const [ForceGraph2D, setForceGraph2D] = useState<typeof ForceGraph2DType | null>(null);
  const engineStoppedRef = useRef(false);

  // Expose zoom methods to parent via ref
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (graphRef.current) {
        // biome-ignore lint/suspicious/noExplicitAny: react-force-graph typing
        const fg = graphRef.current as any;
        const currentZoom = fg.zoom?.() ?? 1;
        fg.zoom?.(currentZoom * 1.5, 300);
      }
    },
    zoomOut: () => {
      if (graphRef.current) {
        // biome-ignore lint/suspicious/noExplicitAny: react-force-graph typing
        const fg = graphRef.current as any;
        const currentZoom = fg.zoom?.() ?? 1;
        fg.zoom?.(currentZoom / 1.5, 300);
      }
    },
    fitToScreen: () => {
      if (graphRef.current) {
        // biome-ignore lint/suspicious/noExplicitAny: react-force-graph typing
        (graphRef.current as any).zoomToFit?.(400, 60);
      }
    },
  }));

  // Dynamically import react-force-graph-2d (it requires window)
  useEffect(() => {
    import("react-force-graph-2d").then((mod) => {
      setForceGraph2D(() => mod.default);
    });
  }, []);

  // Detect dark mode
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Resize handler using ResizeObserver for accurate container size tracking
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    // Use ResizeObserver to detect container size changes (including initial layout)
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    // Also measure immediately in case the container already has its size
    updateSize();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Prepare graph data for the force-graph library
  const graphData = useMemo(() => {
    if (!data) return { nodes: [], links: [] };
    return {
      nodes: data.nodes.map((n) => ({ ...n })),
      links: data.edges.map((e) => ({
        source: typeof e.source === "string" ? e.source : e.source.id,
        target: typeof e.target === "string" ? e.target : e.target.id,
        type: e.type,
      })),
    };
  }, [data]);

  // Custom node rendering on canvas
  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const config = NODE_CONFIG[node.type] || NODE_CONFIG.articol;
      const size = config.size;
      const color = isDark ? config.darkColor : config.color;

      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x || 0, node.y || 0, size, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Add border
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw label only when zoomed in enough
      if (
        globalScale > 1.2 ||
        node.type === "titlu" ||
        (globalScale > 0.8 && node.type === "capitol")
      ) {
        const fontSize = Math.min(12 / globalScale, 5);
        ctx.font = `${node.type === "titlu" ? "bold " : ""}${fontSize}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isDark ? "#e7e5e4" : "#1c1917";

        // Truncate label if too long
        const maxLen = node.type === "articol" ? 12 : 30;
        const displayLabel =
          node.label.length > maxLen ? `${node.label.slice(0, maxLen)}…` : node.label;
        ctx.fillText(displayLabel, node.x || 0, (node.y || 0) + size + fontSize);
      }
    },
    [isDark],
  );

  // Custom link rendering
  const paintLink = useCallback(
    (
      link: { source: GraphNode; target: GraphNode; type: string },
      ctx: CanvasRenderingContext2D,
    ) => {
      const sx = link.source.x || 0;
      const sy = link.source.y || 0;
      const tx = link.target.x || 0;
      const ty = link.target.y || 0;

      ctx.beginPath();
      if (link.type === "reference") {
        // Dashed line for references
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = isDark ? "rgba(129, 140, 248, 0.4)" : "rgba(99, 102, 241, 0.3)";
        ctx.lineWidth = 1.5;
      } else {
        // Solid line for hierarchy
        ctx.setLineDash([]);
        ctx.strokeStyle = isDark ? "rgba(168, 162, 158, 0.25)" : "rgba(120, 113, 108, 0.2)";
        ctx.lineWidth = 1;
      }
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    [isDark],
  );

  // Handle node click
  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      onNodeClick?.(node);
    },
    [onNodeClick],
  );

  // Fit to screen on data load
  const handleEngineStop = useCallback(() => {
    engineStoppedRef.current = true;
    if (graphRef.current) {
      // biome-ignore lint/suspicious/noExplicitAny: react-force-graph typing
      (graphRef.current as any).zoomToFit?.(400, 60);
    }
  }, []);

  // Re-fit when dimensions change after engine has stopped (fixes stale initial sizing)
  useEffect(() => {
    if (
      engineStoppedRef.current &&
      graphRef.current &&
      dimensions.width > 0 &&
      dimensions.height > 0
    ) {
      // Small delay to let the canvas update its internal dimensions first
      const timer = setTimeout(() => {
        // biome-ignore lint/suspicious/noExplicitAny: react-force-graph typing
        (graphRef.current as any)?.zoomToFit?.(300, 60);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [dimensions.width, dimensions.height]);

  // Reset engine stopped flag when data changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: data is intentionally tracked to reset on new graph load
  useEffect(() => {
    engineStoppedRef.current = false;
  }, [data]);

  // Determine what to render inside the persistent container
  const showGraph =
    !loading &&
    ForceGraph2D &&
    data &&
    data.nodes.length > 0 &&
    dimensions.width > 0 &&
    dimensions.height > 0;
  const showEmpty = !loading && data && data.nodes.length === 0;

  return (
    <div ref={containerRef} className="h-full w-full">
      {showGraph ? (
        <ForceGraph2D
          ref={graphRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeCanvasObject={paintNode as never}
          linkCanvasObject={paintLink as never}
          nodeRelSize={6}
          onNodeClick={handleNodeClick as never}
          onEngineStop={handleEngineStop}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          backgroundColor="rgba(0,0,0,0)"
        />
      ) : showEmpty ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Nu există date pentru această versiune.</p>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Se încarcă graful…</p>
          </div>
        </div>
      )}
    </div>
  );
});

export default ForceGraphCanvas;
