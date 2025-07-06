import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { existsSync } from "fs";

export type LTToken = {
  id: string;
  url: string;
  title: string;
  created_at: string;
  description: string;
  load_options: LoadOptions;
  end_at?: string;
};

export type LoadStage = {
  Target: number;
  Duration: string;
};

export type Threshold = {
  Metric: string;
  Condition: string;
  Severity: string;
  Value: number;
};

export type LoadOptions = {
  Profile: string;
  VUs: number;
  Duration: string;
  RPS: number;
  Stages?: LoadStage[];
  Thresholds?: Threshold[];
};

const DASHBOARDS_FILE = "./dashboards.json";
const DASHBOARD_DATA_FILE = "./dashboard-data.json";

let dashboards: LTToken[] = [];

async function loadDashboards() {
  try {
    const data = await fs.readFile(DASHBOARDS_FILE, "utf-8");
    dashboards = JSON.parse(data);
  } catch {
    dashboards = [];
  }
}

async function saveDashboards() {
  await fs.writeFile(DASHBOARDS_FILE, JSON.stringify(dashboards, null, 2));
}

export async function GET() {
  await loadDashboards();
  return NextResponse.json(dashboards);
}

export async function POST(req: NextRequest) {
  await loadDashboards();
  const token: LTToken = await req.json();
  if (!token.title || typeof token.title !== "string") {
    return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
  }
  // --- Prevent duplicate IDs ---
  if (dashboards.some((d) => d.id === token.id)) {
    return NextResponse.json({ success: false, error: "Dashboard with this ID already exists" }, { status: 409 });
  }
  token.end_at = "0s";
  dashboards.push(token);
  await saveDashboards();
  return NextResponse.json({ success: true, id: token.id, title: token.title }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  await loadDashboards();
  const { id } = await req.json();
  if (!id || typeof id !== "string") {
    return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
  }
  const initialLength = dashboards.length;
  dashboards = dashboards.filter((d) => d.id !== id);
  if (dashboards.length === initialLength) {
    return NextResponse.json({ success: false, error: "Dashboard not found" }, { status: 404 });
  }
  await saveDashboards();
  return NextResponse.json({ success: true, id }, { status: 200 });
}

// Clear dashboards.json on server shutdown (dev and production)
const clearDashboardsFile = async () => {
  try {
    await fs.writeFile(DASHBOARDS_FILE, "[]");
    // eslint-disable-next-line no-console
    console.log("dashboards.json cleared on shutdown.");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to clear dashboards.json:", e);
  }
};

process.on("SIGINT", () => {
  clearDashboardsFile().then(() => process.exit(0));
});
process.on("SIGTERM", () => {
  clearDashboardsFile().then(() => process.exit(0));
});
process.on("exit", () => {
  // Synchronous write for exit event
  require("fs").writeFileSync(DASHBOARDS_FILE, "[]");
});
