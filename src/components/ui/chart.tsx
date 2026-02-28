"use client";

import { useFormatter } from "next-intl";
import type * as React from "react";
import * as RechartsPrimitive from "recharts";

// Format: { SERIES_KEY: { label: string; color: string } }
export type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
    icon?: React.ComponentType;
  }
>;

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactElement;
}

export function ChartContainer({ config, children, className, ...props }: ChartContainerProps) {
  // Inject CSS variables for chart colors
  const colorVars = Object.entries(config).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[`--color-${key}`] = value.color;
    return acc;
  }, {});

  return (
    <div className={className} style={colorVars as React.CSSProperties} {...props}>
      <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
        {children}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  );
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
    payload: Record<string, unknown>;
  }>;
  label?: string;
  labelKey?: string;
  nameKey?: string;
  formatter?: (value: number, name: string) => React.ReactNode;
  hideLabel?: boolean;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelKey,
  formatter,
  hideLabel,
}: ChartTooltipContentProps) {
  const format = useFormatter();
  if (!active || !payload?.length) return null;

  const displayLabel = labelKey ? (payload[0]?.payload?.[labelKey] as string) : label;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      {!hideLabel && displayLabel && (
        <p className="mb-1 text-xs font-medium text-foreground">{displayLabel}</p>
      )}
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold tabular-nums">
            {formatter ? formatter(entry.value, entry.name) : format.number(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export const ChartTooltip = RechartsPrimitive.Tooltip;
