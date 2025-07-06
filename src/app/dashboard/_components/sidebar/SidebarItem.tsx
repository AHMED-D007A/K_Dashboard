import React from "react";
import { LTToken } from "@/app/api/load/route";

export function SidebarItem({
  dashboard,
  selected,
  onClick,
  isHistory = false,
}: {
  dashboard: LTToken;
  selected: boolean;
  onClick: () => void;
  isHistory?: boolean;
}) {
  return (
    <div
      className={`sidebar-item${selected ? "sidebar-item-selected" : ""}${isHistory ? "sidebar-item-history" : ""}`}
      onClick={onClick}
      style={{ cursor: "pointer", padding: "0.5rem 1rem", background: selected ? "#f0f0f0" : undefined }}
    >
      <span>{dashboard.title}</span>
      {isHistory && <span style={{ marginLeft: 8, fontSize: 10, color: "#888" }}>(history)</span>}
    </div>
  );
}
