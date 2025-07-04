"use client";

import * as React from "react";
import { ChartAreaInteractive } from "./_components/chart-area-interactive";
import { DataTable } from "./_components/data-table";
import { SectionCards } from "./_components/section-cards";
import { vuReportSchema } from "./_components/schema";
import { LTToken } from "../api/load/route";

// --- Add VUReport type ---
export type StepResult = {
  step_name: string;
  method: string;
  url: string;
  status: string;
  status_code?: number;
  response_time: number;
  failure_reason?: string;
  extracted_vars?: Record<string, string>;
  req_bytes: number;
  res_bytes: number;
};

export type StepReport = {
  step_name: string;
  step_count: number;
  step_failure: number;
  step_response_time: number[];
  step_results: StepResult[];
};

export type VUReport = {
  vu_id: number;
  ts_exec_count: number;
  ts_exec_failure: number;
  ts_exec_time: number[];
  steps: StepReport[];
};

export default function Page({ selectedDashboard }: { selectedDashboard: LTToken | null }) {
  const [lastGoodData, setLastGoodData] = React.useState<VUReport[]>([]);
  // --- Chart histories for each dashboard ---
  type ChartHistory = {
    overall: Array<{ timestamp: number; avg_latency: number }>;
    perStep: Record<string, Array<{ timestamp: number; value: number }>>;
    perVU: Record<string, Array<{ timestamp: number; value: number }>>;
  };
  const [chartHistories, setChartHistories] = React.useState<Record<string, ChartHistory>>({});

  // Helper to get the current dashboard key (url or id)
  const dashboardKey = selectedDashboard?.url || "";

  React.useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;

    setLastGoodData([]);

    const getData = async () => {
      try {
        const d = await fetchVUData(selectedDashboard ? selectedDashboard.url : "");
        if (isMounted && Array.isArray(d) && d.length > 0) {
          setLastGoodData(d);
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (selectedDashboard?.url) {
      getData();
      interval = setInterval(getData, 3000);
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedDashboard]);

  // --- Pass chart history and setter for the current dashboard ---
  const chartHistory = chartHistories[dashboardKey] || {
    overall: [],
    perStep: {},
    perVU: {},
  };
  const setChartHistory = (updater: (prev: ChartHistory) => ChartHistory) => {
    setChartHistories((prev) => ({
      ...prev,
      [dashboardKey]: updater(prev[dashboardKey] || { overall: [], perStep: {}, perVU: {} }),
    }));
  };

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <SectionCards lttoken={selectedDashboard ?? undefined} />
      <ChartAreaInteractive
        vuData={lastGoodData}
        chartHistory={chartHistory}
        setChartHistory={setChartHistory}
      />
      <DataTable data={lastGoodData} />
    </div>
  );
}

// --- Update return type to Promise<VUReport[]> ---
async function fetchVUData(url: string): Promise<VUReport[]> {
  if (!url) return [];
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch");
    const json = await res.json();
    const parsed = Array.isArray(json)
      ? json
          .map((item) => {
            const result = vuReportSchema.safeParse(item);
            return result.success ? result.data : null;
          })
          .filter((item) => item && typeof item.vu_id === "number")
      : [];
    return parsed as VUReport[];
  } catch (e) {
    console.error(e);
    return [];
  }
}
