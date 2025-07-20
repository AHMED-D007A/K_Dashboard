"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { LTToken } from "@/app/api/load/route";

interface DashboardContextType {
  selectedDashboard: LTToken | null;
  setSelectedDashboard: (dashboard: LTToken | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedDashboard, setSelectedDashboard] = useState<LTToken | null>(null);

  return (
    <DashboardContext.Provider value={{ selectedDashboard, setSelectedDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
