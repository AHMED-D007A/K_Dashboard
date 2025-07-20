"use client";

import * as React from "react";
import { ChartAreaInteractive } from "./_components/chart-area-interactive";
import { DataTable } from "./_components/data-table";
import { SectionCards } from "./_components/section-cards";
import { vuReportSchema } from "./_components/schema";
import { LTToken } from "../api/load/route";
import { useDashboard } from "./context/DashboardContext";

export type StepReport = {
  step_name: string;
  step_count: number;
  step_failure: number;
  step_response_time: number[];
  step_bytes_in: number;
  step_bytes_out: number;
};

export type VUReport = {
  vu_id: number;
  ts_exec_count: number;
  ts_exec_failure: number;
  ts_exec_time: number[];
  steps: StepReport[];
};

export default function Page() {
  const { selectedDashboard } = useDashboard();
  // Store data for all dashboards
  const [dashboardData, setDashboardData] = React.useState<Record<string, VUReport[]>>({});
  type ChartHistory = {
    overall: Array<{ timestamp: number; avg_latency: number }>;
    perStep: Record<string, Array<{ timestamp: number; value: number }>>;
    perVU: Record<string, Array<{ timestamp: number; value: number }>>;
  };
  const [chartHistories, setChartHistories] = React.useState<Record<string, ChartHistory>>({});
  const [dashboardStopTimes, setDashboardStopTimes] = React.useState<Record<string, string>>({});

  const dashboardKey = selectedDashboard?.id || "";
  const lastGoodData = dashboardData[dashboardKey] || [];

  // --- Always up-to-date refs for saving ---
  const dashboardDataRef = React.useRef(dashboardData);
  const chartHistoriesRef = React.useRef(chartHistories);
  const dashboardStopTimesRef = React.useRef(dashboardStopTimes);

  React.useEffect(() => {
    dashboardDataRef.current = dashboardData;
  }, [dashboardData]);
  React.useEffect(() => {
    chartHistoriesRef.current = chartHistories;
  }, [chartHistories]);
  React.useEffect(() => {
    dashboardStopTimesRef.current = dashboardStopTimes;
  }, [dashboardStopTimes]);

  React.useEffect(() => {
    // Load persisted dashboard data on mount
    fetch("/api/dashboard-data")
      .then((res) => res.json())
      .then((data) => {
        setDashboardData(data.dashboardData || {});
        setChartHistories(data.chartHistories || {});
        setDashboardStopTimes(data.dashboardStopTimes || {});
      });
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;
    let failCount = 0;
    const MAX_FAILS = 3;

    const getData = async () => {
      const isStopped = dashboardStopTimes[dashboardKey] && dashboardStopTimes[dashboardKey] !== "0s";
      if (isStopped) {
        return;
      }

      try {
        const d = await fetchVUData(selectedDashboard ? selectedDashboard.url : "");
        if (isMounted && Array.isArray(d) && d.length > 0) {
          setDashboardData((prev) => ({
            ...prev,
            [dashboardKey]: d,
          }));
          failCount = 0;
        } else {
          failCount++;
        }
      } catch (e) {
        console.error(e);
        failCount++;
      }
      if (failCount >= MAX_FAILS && interval) {
        clearInterval(interval);
        if (!dashboardStopTimesRef.current[dashboardKey]) {
          // --- Calculate and store stop time ---
          let elapsed = "0s";
          if (selectedDashboard?.created_at) {
            const start = new Date(selectedDashboard.created_at).getTime();
            const now = Date.now();
            let diff = Math.max(0, Math.floor((now - start) / 1000));
            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = diff % 60;
            elapsed = h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`;
          }
          setDashboardStopTimes((prev) => ({
            ...prev,
            [dashboardKey]: elapsed,
          }));

          // --- Save all dashboard data when stopped ---
          fetch("/api/dashboard-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              dashboardData: {
                ...dashboardDataRef.current,
                [dashboardKey]: dashboardDataRef.current[dashboardKey] || [],
              },
              chartHistories: {
                ...chartHistoriesRef.current,
                [dashboardKey]: chartHistoriesRef.current[dashboardKey] || {
                  overall: [],
                  perStep: {},
                  perVU: {},
                },
              },
              dashboardStopTimes: {
                ...dashboardStopTimesRef.current,
                [dashboardKey]: elapsed,
              },
            }),
          });
        }
        console.warn(`Stopped polling for dashboard ${dashboardKey} due to repeated fetch failures.`);
      }
    };

    if (selectedDashboard?.url) {
      getData();
      interval = setInterval(getData, 1000);
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
      <SectionCards
        lttoken={selectedDashboard ?? undefined}
        stopped={!!(dashboardStopTimes[dashboardKey] && dashboardStopTimes[dashboardKey] !== "0s")}
        stopTime={dashboardStopTimes[dashboardKey]}
        currentVUCount={lastGoodData.length}
      />
      <ChartAreaInteractive vuData={lastGoodData} chartHistory={chartHistory} setChartHistory={setChartHistory} />
      <DataTable data={lastGoodData} />
    </div>
  );
}

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
    return [];
  }
}
