// Placeholder: recharts v3 has breaking type changes.
// Currently unused. Re-implement using recharts v3 API when needed.
import * as React from "react";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<string, { label?: React.ReactNode; color?: string; icon?: React.ComponentType }>;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { config: ChartConfig }
>(({ config, className, children, ...props }, ref) => (
  <ChartContext.Provider value={{ config }}>
    <div ref={ref} className={cn("w-full", className)} {...props}>
      {children}
    </div>
  </ChartContext.Provider>
));
ChartContainer.displayName = "Chart";

export const ChartTooltip = () => null;
export const ChartTooltipContent = () => null;
export const ChartLegend = () => null;
export const ChartLegendContent = () => null;
export const ChartStyle = () => null;
