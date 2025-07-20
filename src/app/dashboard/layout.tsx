"use client";

import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./_components/sidebar/theme-switcher";
import DashboardSidebarClient from "@/app/dashboard/_components/sidebar/DashboardSidebarClient";
import { DashboardProvider, useDashboard } from "./context/DashboardContext";

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const { selectedDashboard, setSelectedDashboard } = useDashboard();

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
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}
