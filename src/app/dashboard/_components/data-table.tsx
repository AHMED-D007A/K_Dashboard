"use client";

import * as React from "react";

import { DataTable as DataTableNew } from "../../../components/data-table/data-table";
import { DataTablePagination } from "../../../components/data-table/data-table-pagination";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function getAverage(arr: number[] | undefined): string {
  if (!Array.isArray(arr) || arr.length === 0) return "-";
  // Convert nanoseconds to milliseconds after averaging
  // console.log("Raw nanoseconds array:", arr); // Remove debug log
  const avgNs = arr.reduce((a, b) => a + b, 0) / arr.length;
  const avgMs = avgNs / 1_000_000;
  return avgMs.toFixed(2);
}

export function DataTable({ data: initialData }: { data: any[] }) {
  // Keep the original VU data immutable
  const [originalData, setOriginalData] = React.useState(() => initialData ?? []);
  const [view, setView] = React.useState("virtual-users");

  // State for reordered data in each view
  const [vuData, setVuData] = React.useState(() => initialData ?? []);
  const [stepsData, setStepsData] = React.useState(() => {
    return (initialData ?? []).flatMap((vu: any) =>
      Array.isArray(vu.steps)
        ? vu.steps.map((step: any) => ({ ...step, vu_id: vu.vu_id }))
        : []
    );
  });

  // Update state when initialData changes
  React.useEffect(() => {
    setOriginalData(initialData ?? []);
    setVuData(initialData ?? []);
    setStepsData(
      (initialData ?? []).flatMap((vu: any) =>
        Array.isArray(vu.steps)
          ? vu.steps.map((step: any) => ({ ...step, vu_id: vu.vu_id }))
          : []
      )
    );
  }, [initialData]);

  // When switching views, always reset to derived data from originalData
  React.useEffect(() => {
    if (view === "virtual-users") {
      setVuData(originalData);
    } else if (view === "steps") {
      setStepsData(
        originalData.flatMap((vu: any) =>
          Array.isArray(vu.steps)
            ? vu.steps.map((step: any) => ({ ...step, vu_id: vu.vu_id }))
            : []
        )
      );
    }
  }, [view, originalData]);

  // Memoize steps aggregation
  const aggregatedSteps = React.useMemo(() => {
    const stepMap: Record<string, any> = {};
    const stepAverages: Record<string, number[]> = {};
    originalData.forEach((vu: any) => {
      if (Array.isArray(vu.steps)) {
        vu.steps.forEach((step: any) => {
          const key = step.step_name;
          if (!key) return;
          if (!stepMap[key]) {
            stepMap[key] = {
              step_name: key,
              step_count: 0,
              step_failure: 0,
              // We'll store all response times for legacy, but use averages below
              step_response_time: [],
            };
            stepAverages[key] = [];
          }
          stepMap[key].step_count += typeof step.step_count === 'number' ? step.step_count : 0;
          stepMap[key].step_failure += typeof step.step_failure === 'number' ? step.step_failure : 0;
          if (Array.isArray(step.step_response_time) && step.step_response_time.length > 0) {
            // Calculate average for this VU's step
            const avg = step.step_response_time.reduce((a: number, b: number) => a + b, 0) / step.step_response_time.length;
            stepAverages[key].push(avg);
          }
        });
      }
    });
    // Attach per-step averages array for use in cell renderer
    Object.keys(stepMap).forEach((key) => {
      stepMap[key].step_response_time_averages = stepAverages[key];
    });
    return Object.values(stepMap);
  }, [originalData]);

  // Update stepsData when switching to steps view
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
      cell: ({ row }: any) => getAverage(row.original.ts_exec_time),
    },
    {
      accessorKey: "steps",
      header: "Step Exec Count",
      cell: ({ row }: any) =>
        Array.isArray(row.original.steps)
          ? row.original.steps.reduce((sum: number, step: any) => sum + (typeof step.step_count === 'number' ? step.step_count : 0), 0)
          : "-",
    },
  ];

  // Columns for Steps
  const stepColumns = [
    { accessorKey: "step_name", header: "Step Name" },
    {
      accessorKey: "step_count",
      header: "Step Count (All VUs)",
      cell: ({ row }: any) => row.original.step_count ?? "-",
    },
    {
      accessorKey: "step_failure",
      header: "Step Failure (All VUs)",
      cell: ({ row }: any) => row.original.step_failure ?? "-",
    },
    {
      accessorKey: "step_response_time",
      header: "Avg Step Response Time (ms)",
      cell: ({ row }: any) => {
        // Average of per-VU averages
        const avgs = row.original.step_response_time_averages;
        if (!Array.isArray(avgs) || avgs.length === 0) return "-";
        const avgNs = avgs.reduce((a: number, b: number) => a + b, 0) / avgs.length;
        const avgMs = avgNs / 1_000_000;
        return avgMs.toFixed(2);
      },
    },
  ];

  const columns = view === "steps" ? stepColumns : vuColumns;
  const tableData = view === "steps" ? stepsData : vuData;
  const onReorder = view === "steps" ? setStepsData : setVuData;

  const table = useDataTableInstance({
    data: tableData,
    columns,
    getRowId: (row, index) => {
      if (row?.vu_id != null && row?.step_name != null) {
        return `${row.vu_id}-${row.step_name}`;
      } else if (row?.vu_id != null) {
        return row.vu_id.toString();
      } else if (row?.step_name != null) {
        return row.step_name + '-' + index;
      } else {
        return 'row-' + index;
      }
    },
  });

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between mb-4">
        <Tabs value={view} onValueChange={setView} className="w-fit">
          <TabsList>
            <TabsTrigger value="steps">Steps</TabsTrigger>
            <TabsTrigger value="virtual-users">Virtual Users</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto mt-4">
        <div className="overflow-hidden rounded-lg border">
          <DataTableNew dndEnabled table={table} columns={columns} onReorder={onReorder} />
        </div>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
