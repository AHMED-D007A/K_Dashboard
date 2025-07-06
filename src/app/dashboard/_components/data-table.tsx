"use client";

import * as React from "react";

import { DataTable as DataTableNew } from "../../../components/data-table/data-table";
import { DataTablePagination } from "../../../components/data-table/data-table-pagination";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VUReport, StepReport } from "../page";

type AggregatedStepReport = StepReport & {
  vu_id?: number;
  step_response_time_averages?: number[];
};

function getAverageMS(arr: number[] | undefined): string {
  if (!Array.isArray(arr) || arr.length === 0) return "-";
  const avgNs = arr.reduce((a, b) => a + b, 0) / arr.length;
  const avgMs = avgNs / 1_000_000;
  return avgMs.toFixed(2);
}

// Helper for P95
function getP95(arr: number[] | undefined): string {
  if (!Array.isArray(arr) || arr.length === 0) return "-";
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.floor(0.95 * (sorted.length - 1));
  const p95Ns = sorted[idx];
  const p95Ms = p95Ns / 1_000_000;
  return p95Ms.toFixed(2);
}

function formatMB(bytes: number | undefined): string {
  if (typeof bytes !== "number" || isNaN(bytes)) return "-";
  return (bytes / (1024 * 1024)).toFixed(2);
}

export function DataTable({ data: initialData }: { data: VUReport[] }) {
  const [originalData, setOriginalData] = React.useState<VUReport[]>(() => initialData ?? []);
  const [view, setView] = React.useState<"virtual-users" | "steps">("virtual-users");

  // State for reordered data in each view
  const [vuData, setVuData] = React.useState<VUReport[]>(() => initialData ?? []);
  const [stepsData, setStepsData] = React.useState<AggregatedStepReport[]>(() => {
    return (initialData ?? []).flatMap((vu) =>
      Array.isArray(vu.steps) ? vu.steps.map((step) => ({ ...step, vu_id: vu.vu_id })) : [],
    );
  });

  React.useEffect(() => {
    setOriginalData(initialData ?? []);
    setVuData(initialData ?? []);
    setStepsData(
      (initialData ?? []).flatMap((vu) =>
        Array.isArray(vu.steps) ? vu.steps.map((step) => ({ ...step, vu_id: vu.vu_id })) : [],
      ),
    );
  }, [initialData]);

  React.useEffect(() => {
    if (view === "virtual-users") {
      setVuData(originalData);
    } else if (view === "steps") {
      setStepsData(
        originalData.flatMap((vu) =>
          Array.isArray(vu.steps) ? vu.steps.map((step) => ({ ...step, vu_id: vu.vu_id })) : [],
        ),
      );
    }
  }, [view, originalData]);

  // Memoize steps aggregation
  const aggregatedSteps = React.useMemo<AggregatedStepReport[]>(() => {
    const stepMap: Record<string, AggregatedStepReport> = {};
    const stepAverages: Record<string, number[]> = {};
    originalData.forEach((vu) => {
      if (Array.isArray(vu.steps)) {
        vu.steps.forEach((step) => {
          const key = step.step_name;
          if (!key) return;
          if (!stepMap[key]) {
            stepMap[key] = {
              step_name: key,
              step_count: 0,
              step_failure: 0,
              step_response_time: [],
              step_bytes_in: 0,
              step_bytes_out: 0,
              step_response_time_averages: [],
            };
            stepAverages[key] = [];
          }
          stepMap[key].step_count += typeof step.step_count === "number" ? step.step_count : 0;
          stepMap[key].step_failure += typeof step.step_failure === "number" ? step.step_failure : 0;
          stepMap[key].step_bytes_in += typeof step.step_bytes_in === "number" ? step.step_bytes_in : 0;
          stepMap[key].step_bytes_out += typeof step.step_bytes_out === "number" ? step.step_bytes_out : 0;
          if (Array.isArray(step.step_response_time) && step.step_response_time.length > 0) {
            stepMap[key].step_response_time.push(...step.step_response_time);
            const avg = step.step_response_time.reduce((a, b) => a + b, 0) / step.step_response_time.length;
            stepAverages[key].push(avg);
          }
        });
      }
    });
    Object.keys(stepMap).forEach((key) => {
      stepMap[key].step_response_time_averages = stepAverages[key];
    });
    return Object.values(stepMap);
  }, [originalData]);

  React.useEffect(() => {
    if (view === "steps") {
      setStepsData(aggregatedSteps);
    }
  }, [view, aggregatedSteps]);

  // Columns for Virtual Users
  const vuColumns = [
    { accessorKey: "vu_id", header: "VU ID" },
    { accessorKey: "ts_exec_count", header: "TS Exec Count" },
    { accessorKey: "ts_exec_failure", header: "TS Exec Failure" },
    {
      accessorKey: "ts_exec_time",
      header: "Avg TS Exec Time (ms)",
      cell: ({ row }: { row: { original: VUReport } }) => getAverageMS(row.original.ts_exec_time),
    },
    {
      accessorKey: "steps",
      header: "Step Exec Count",
      cell: ({ row }: { row: { original: VUReport } }) =>
        Array.isArray(row.original.steps)
          ? row.original.steps.reduce(
              (sum: number, step: StepReport) => sum + (typeof step.step_count === "number" ? step.step_count : 0),
              0,
            )
          : "-",
    },
  ];

  // Columns for Steps
  const stepColumns = [
    { accessorKey: "step_name", header: "Step Name" },
    {
      accessorKey: "step_count",
      header: "Step Count (All VUs)",
      cell: ({ row }: { row: { original: AggregatedStepReport } }) => row.original.step_count ?? "-",
    },
    {
      accessorKey: "step_failure",
      header: "Step Failure (All VUs)",
      cell: ({ row }: { row: { original: AggregatedStepReport } }) => row.original.step_failure ?? "-",
    },
    {
      accessorKey: "step_bytes_in",
      header: "Bytes In (MB)",
      cell: ({ row }: { row: { original: AggregatedStepReport } }) =>
        formatMB(row.original.step_bytes_in),
    },
    {
      accessorKey: "step_bytes_out",
      header: "Bytes Out (MB)",
      cell: ({ row }: { row: { original: AggregatedStepReport } }) =>
        formatMB(row.original.step_bytes_out),
    },
    {
      accessorKey: "step_response_time",
      header: "Avg Step Response Time (ms)",
      cell: ({ row }: { row: { original: AggregatedStepReport } }) => {
        const avgs = row.original.step_response_time_averages;
        if (!Array.isArray(avgs) || avgs.length === 0) return "-";
        const avgNs = avgs.reduce((a: number, b: number) => a + b, 0) / avgs.length;
        const avgMs = avgNs / 1_000_000;
        return avgMs.toFixed(2);
      },
    },
    {
      accessorKey: "p95",
      header: "P95 (ms)",
      cell: ({ row }: { row: { original: AggregatedStepReport } }) => getP95(row.original.step_response_time),
    },
  ];

  // Table instances for each view
  const vuTable = useDataTableInstance<VUReport, unknown>({
    data: vuData,
    columns: vuColumns,
    getRowId: (row, index) => (row.vu_id != null ? row.vu_id.toString() : `row-${index}`),
  });

  const stepTable = useDataTableInstance<AggregatedStepReport, unknown>({
    data: stepsData,
    columns: stepColumns,
    getRowId: (row, index) =>
      row.vu_id != null && row.step_name != null
        ? `${row.vu_id}-${row.step_name}`
        : row.step_name
          ? row.step_name + "-" + index
          : "row-" + index,
  });

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="mb-4 flex items-center justify-between">
        <Tabs value={view} onValueChange={(v) => setView(v as "virtual-users" | "steps")} className="w-fit">
          <TabsList>
            <TabsTrigger value="steps">Steps</TabsTrigger>
            <TabsTrigger value="virtual-users">Virtual Users</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="relative mt-4 flex flex-col gap-4 overflow-auto">
        <div className="overflow-hidden rounded-lg border">
          {view === "virtual-users" ? (
            <DataTableNew dndEnabled table={vuTable} columns={vuColumns} onReorder={setVuData} />
          ) : (
            <DataTableNew dndEnabled table={stepTable} columns={stepColumns} onReorder={setStepsData} />
          )}
        </div>
        {view === "virtual-users" ? <DataTablePagination table={vuTable} /> : <DataTablePagination table={stepTable} />}
      </div>
    </div>
  );
}
