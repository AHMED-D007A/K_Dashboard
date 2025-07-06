"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid } from "recharts";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { VUReport, StepReport } from "../page";

export const description = "An interactive area chart";

function getAverage(arr: number[] | undefined): number {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// Accept chartHistory and setChartHistory as props
export function ChartAreaInteractive({
  vuData = [],
  chartHistory,
  setChartHistory,
}: {
  vuData: VUReport[];
  chartHistory: {
    overall: Array<{ timestamp: number; avg_latency: number }>;
    perStep: Record<string, Array<{ timestamp: number; value: number }>>;
    perVU: Record<string, Array<{ timestamp: number; value: number }>>;
  };
  setChartHistory: (
    updater: (prev: {
      overall: Array<{ timestamp: number; avg_latency: number }>;
      perStep: Record<string, Array<{ timestamp: number; value: number }>>;
      perVU: Record<string, Array<{ timestamp: number; value: number }>>;
    }) => {
      overall: Array<{ timestamp: number; avg_latency: number }>;
      perStep: Record<string, Array<{ timestamp: number; value: number }>>;
      perVU: Record<string, Array<{ timestamp: number; value: number }>>;
    },
  ) => void;
}) {
  const [view, setView] = React.useState<"overall" | "perStep" | "perVU">("overall");

  // --- Update chart history on vuData change ---
  React.useEffect(() => {
    if (!Array.isArray(vuData) || vuData.length === 0) return;
    const timestamp = Date.now();
    // Overall
    let allLatencies: number[] = [];
    vuData.forEach((vu) => {
      vu.steps?.forEach((step: StepReport) => {
        if (Array.isArray(step.step_response_time)) {
          allLatencies.push(...step.step_response_time);
        }
      });
    });
    const avg_latency = getAverage(allLatencies) / 1_000_000;
    // Per Step
    const allSteps = Array.from(new Set(vuData.flatMap((vu) => vu.steps?.map((s) => s.step_name) || [])));
    setChartHistory((prev) => {
      // Copy previous state for immutability
      const perStep: Record<string, Array<{ timestamp: number; value: number }>> = { ...prev.perStep };
      allSteps.forEach((stepName: string) => {
        let arr: number[] = [];
        vuData.forEach((vu) => {
          vu.steps?.forEach((s) => {
            if (s.step_name === stepName && Array.isArray(s.step_response_time)) {
              arr.push(...s.step_response_time);
            }
          });
        });
        const value = getAverage(arr) / 1_000_000;
        if (!perStep[stepName]) perStep[stepName] = [];
        perStep[stepName] = [...perStep[stepName], { timestamp, value }];
      });
      // Per VU
      const allVUs = Array.from(new Set(vuData.map((vu) => vu.vu_id.toString())));
      const perVU: Record<string, Array<{ timestamp: number; value: number }>> = { ...prev.perVU };
      allVUs.forEach((vuId: string) => {
        let arr: number[] = [];
        vuData.forEach((vu) => {
          if (vu.vu_id.toString() === vuId) {
            vu.steps?.forEach((step) => {
              if (Array.isArray(step.step_response_time)) {
                arr.push(...step.step_response_time);
              }
            });
          }
        });
        const value = getAverage(arr) / 1_000_000;
        if (!perVU[vuId]) perVU[vuId] = [];
        perVU[vuId] = [...perVU[vuId], { timestamp, value }];
      });
      return {
        overall: [...prev.overall, { timestamp, avg_latency }],
        perStep,
        perVU,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vuData]);

  // --- Chart data for current view from history ---
  const chartData = React.useMemo(() => {
    if (view === "overall") {
      return chartHistory.overall.map((pt) => ({
        timestamp: pt.timestamp,
        avg_latency: pt.avg_latency,
      }));
    } else if (view === "perStep") {
      const stepNames = Object.keys(chartHistory.perStep);
      const length = Math.max(...stepNames.map((k) => chartHistory.perStep[k]?.length || 0));
      return Array.from({ length }, (_, i) => {
        const row: Record<string, number | undefined> = { timestamp: undefined };
        stepNames.forEach((step) => {
          const pt = chartHistory.perStep[step]?.[i];
          if (pt) {
            row[step] = pt.value;
            if (!row.timestamp) row.timestamp = pt.timestamp;
          }
        });
        return row;
      });
    } else if (view === "perVU") {
      const vuIds = Object.keys(chartHistory.perVU);
      const length = Math.max(...vuIds.map((k) => chartHistory.perVU[k]?.length || 0));
      return Array.from({ length }, (_, i) => {
        const row: Record<string, number | undefined> = { timestamp: undefined };
        vuIds.forEach((vu) => {
          const pt = chartHistory.perVU[vu]?.[i];
          if (pt) {
            row[vu] = pt.value;
            if (!row.timestamp) row.timestamp = pt.timestamp;
          }
        });
        return row;
      });
    }
    return [];
  }, [chartHistory, view]);

  // Chart config for each view
  const chartConfig = React.useMemo(() => {
    if (view === "overall") {
      return { avg_latency: { label: "Avg Latency (ms)", color: "var(--chart-1)" } };
    } else if (view === "perStep") {
      const steps = Object.keys(chartHistory.perStep);
      const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
      return Object.fromEntries(steps.map((step, i) => [step, { label: step, color: colors[i % colors.length] }]));
    } else if (view === "perVU") {
      const vus = Object.keys(chartHistory.perVU);
      const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
      return Object.fromEntries(vus.map((vu, i) => [vu, { label: `VU ${vu}`, color: colors[i % colors.length] }]));
    }
    return {};
  }, [view, chartHistory]);

  // Mini charts for each Step or VU from history
  const miniChartsData = React.useMemo(() => {
    if (view === "perStep") {
      return Object.entries(chartHistory.perStep).map(([step, arr]) => ({
        key: step,
        label: step,
        data: arr.map((pt) => ({ date: pt.timestamp, value: pt.value })),
      }));
    } else if (view === "perVU") {
      return Object.entries(chartHistory.perVU).map(([vu, arr]) => ({
        key: vu,
        label: `VU ${vu}`,
        data: arr.map((pt) => ({ date: pt.timestamp, value: pt.value })),
      }));
    }
    return [];
  }, [view, chartHistory]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Average Latency</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Latency by {view === "overall" ? "All Steps" : view === "perStep" ? "Step" : "VU"}
          </span>
          <span className="@[540px]/card:hidden">Latency</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as "overall" | "perStep" | "perVU")}
            variant="outline"
            className="gap-2"
          >
            <ToggleGroupItem value="overall">Overall</ToggleGroupItem>
            <ToggleGroupItem value="perStep">Per Step</ToggleGroupItem>
            <ToggleGroupItem value="perVU">Per VU</ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={chartData}>
            <CartesianGrid vertical={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" hideLabel />} />
            {Object.keys(chartConfig).map((key) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={chartConfig[key].color}
                fillOpacity={0.3}
                stroke={chartConfig[key].color}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
      {/* Mini charts for each Step or VU */}
      {(view === "perStep" || view === "perVU") && miniChartsData.length > 0 && (
        <div className="mt-[-12px] grid grid-cols-1 gap-4 px-2 sm:grid-cols-2 md:grid-cols-3">
          {miniChartsData.map(({ key, label, data }) => {
            return (
              <Card key={key} className="flex h-[200px] overflow-hidden">
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-stretch overflow-hidden px-2 pt-4 sm:px-6 sm:pt-6">
                  <ChartContainer config={{ value: { label, color: "var(--chart-1)" } }} className="h-full w-full">
                    <AreaChart
                      data={data}
                      width={undefined}
                      height={undefined}
                      margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
                    >
                      <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" label={label} />} />
                      <Area
                        type="natural"
                        dataKey="value"
                        fill="var(--chart-1)"
                        fillOpacity={0.5}
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </Card>
  );
}
