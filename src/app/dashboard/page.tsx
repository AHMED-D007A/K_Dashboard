"use client";

import * as React from "react";
import { ChartAreaInteractive } from "./_components/chart-area-interactive";
import { DataTable } from "./_components/data-table";
import { SectionCards } from "./_components/section-cards";
import { vuReportSchema } from "./_components/schema";

function Page() {
  const [data, setData] = React.useState<any[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;

    const getData = async () => {
      try {
        const d = await fetchVUData();
        if (isMounted) setData(d);
      } catch (e) {
        console.error(e);
      }
    };

    getData();
    interval = setInterval(getData, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <SectionCards cards={[]} />
      <ChartAreaInteractive chartData={data} chartConfig={{ /* TODO: fill chartConfig properties */ }} />
      <DataTable data={data} />
    </div>
  );
}

async function fetchVUData() {
  try {
    const res = await fetch("http://localhost:9090/metrics", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch");
    const json = await res.json();
    const parsed = Array.isArray(json)
      ? json.map((item) => {
          const result = vuReportSchema.safeParse(item);
          return result.success ? result.data : null;
        }).filter((item) => item && typeof item.vu_id === "number")
      : [];
    return parsed;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default Page;
