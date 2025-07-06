"use client";

import { RefreshCw } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";

import { NavMain } from "./nav-main";

export function AppSidebar({
  sidebarItems,
  onRefreshDashboards,
  onDashboardClick,
  dashboards,
  selectedDashboard,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  sidebarItems: any;
  onRefreshDashboards: () => void;
  onDashboardClick: (dashboard: any) => void;
  dashboards: any[];
  selectedDashboard?: any;
}) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <button className="cursor-pointer" onClick={onRefreshDashboards} title="Refresh Dashboards">
                <RefreshCw size={14} />
                <span className="text-base font-semibold">{APP_CONFIG.name}</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={sidebarItems}
          onDashboardClick={onDashboardClick}
          dashboards={dashboards}
          selectedDashboard={selectedDashboard}
        />
      </SidebarContent>
    </Sidebar>
  );
}
