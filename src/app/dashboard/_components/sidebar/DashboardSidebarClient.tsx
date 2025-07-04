"use client";

import { useEffect, useState } from "react";
import { ChartArea } from "lucide-react";
import { AppSidebar } from "@/app/dashboard/_components/sidebar/app-sidebar";
import { LTToken } from "@/app/api/load/route";

export default function DashboardSidebarClient({
  onSelectDashboard,
  selectedDashboard,
}: {
  onSelectDashboard: (dashboard: LTToken) => void;
  selectedDashboard?: LTToken | null;
}) {
  const [sidebarItems, setSidebarItems] = useState([
    {
      id: 1,
      label: "Dashboards",
      items: [],
    },
    {
      id: 2,
      label: "History",
      items: [],
    },
  ]);
  const [dashboards, setDashboards] = useState<LTToken[]>([]);

  const refreshDashboards = async () => {
    try {
      const res = await fetch("/api/load");
      const dashboards = await res.json();
      setDashboards(dashboards);
      setSidebarItems([
        {
          id: 1,
          label: "Dashboards",
          items: dashboards.map((d: LTToken) => ({
            title: d.title + d.id,
            url: `/dashboard`,
            icon: ChartArea,
            dashboard: d,
          })),
        },
        {
          id: 2,
          label: "History",
          items: [],
        },
      ]);
    } catch (e) {
      // handle error
    }
  };

  useEffect(() => {
    refreshDashboards();
  }, []);

  // Handler for dashboard click
  const handleDashboardClick = (dashboard: LTToken) => {
    onSelectDashboard(dashboard);
  };

  return (
    <AppSidebar
      sidebarItems={sidebarItems}
      onRefreshDashboards={refreshDashboards}
      onDashboardClick={handleDashboardClick}
      dashboards={dashboards}
      selectedDashboard={selectedDashboard}
    />
  );
}
