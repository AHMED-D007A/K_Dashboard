"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { type NavGroup, type NavMainItem } from "@/navigation/sidebar/sidebar-items";

interface NavMainProps {
  readonly items: readonly NavGroup[];
  onDashboardClick?: (dashboard: any) => void;
  dashboards?: any[];
  selectedDashboard?: any;
}

export function NavMain({ items, onDashboardClick, dashboards, selectedDashboard }: NavMainProps) {
  const path = usePathname();

  const isItemActive = (url: string) => path === url;

  // Only mark as active if dashboard id matches selectedDashboard.id
  const isDashboardActive = (item: any, idx: number) => {
    if (!selectedDashboard || !dashboards || !dashboards[idx]) return false;
    return dashboards[idx].id === selectedDashboard.id;
  };

  return (
    <>
      {items.map((group) => (
        <SidebarGroup key={group.id}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {group.items.map((item, idx) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={group.label === "Dashboards" ? isDashboardActive(item, idx) : false}
                    onClick={() => {
                      if (group.label === "Dashboards" && dashboards && dashboards[idx] && onDashboardClick) {
                        onDashboardClick(dashboards[idx]);
                      }
                    }}
                  >
                    <Link href={item.url} scroll={false}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
