"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface VersionData {
  year: number;
  name: string | null;
  totalArticles: number | null;
}

interface VersionBarChartProps {
  data: VersionData[];
}

const chartConfig: ChartConfig = {
  totalArticles: {
    label: "Articole",
    color: "hsl(var(--primary))",
  },
};

export function VersionBarChart({ data }: VersionBarChartProps) {
  const chartData = data.map((v) => ({
    year: String(v.year),
    name: v.name ?? `Constituția din ${v.year}`,
    totalArticles: v.totalArticles ?? 0,
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          tick={{
            fill: "hsl(var(--muted-foreground))",
            fontSize: 13,
            fontWeight: 600,
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{
            fill: "hsl(var(--muted-foreground))",
            fontSize: 12,
          }}
          width={40}
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
          content={<ChartTooltipContent labelKey="name" />}
        />
        <Bar
          dataKey="totalArticles"
          name="Articole"
          fill="var(--color-totalArticles)"
          radius={[6, 6, 0, 0]}
          maxBarSize={80}
        />
      </BarChart>
    </ChartContainer>
  );
}
