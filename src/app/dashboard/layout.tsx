"use client";

import { ReactNode, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./_components/sidebar/theme-switcher";
import DashboardSidebarClient from "@/app/dashboard/_components/sidebar/DashboardSidebarClient";
import Page from "@/app/dashboard/page";
import { LTToken } from "../api/load/route";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  // Client state for selected dashboard
  const [selectedDashboard, setSelectedDashboard] = useState<LTToken | null>(null);

  return (
    <SidebarProvider>
      <DashboardSidebarClient onSelectDashboard={setSelectedDashboard} selectedDashboard={selectedDashboard} />
      <SidebarInset
        className={cn(
          "!mx-auto max-w-screen-2xl",
          "max-[113rem]:peer-data-[variant=inset]:!mr-2 min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:!mr-auto",
        )}
      >
        <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-1 lg:gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
            </div>
          </div>
        </header>
        <div className="p-4 md:p-6">
          <Page selectedDashboard={selectedDashboard} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
