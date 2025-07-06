import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";

const DASHBOARD_DATA_FILE = "./dashboard-data.json";

export async function GET() {
  try {
    const data = await fs.readFile(DASHBOARD_DATA_FILE, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({});
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  await fs.writeFile(DASHBOARD_DATA_FILE, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true });
}

// Clean dashboard-data.json on server shutdown (dev and production)
const clearDashboardDataFile = async () => {
  try {
    await fs.writeFile(
      DASHBOARD_DATA_FILE,
      JSON.stringify(
        {
          dashboardData: {},
          chartHistories: {},
          dashboardStopTimes: {},
        },
        null,
        2,
      ),
    );
    // eslint-disable-next-line no-console
    console.log("dashboard-data.json cleared on shutdown.");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to clear dashboard-data.json:", e);
  }
};

if (typeof process !== "undefined" && process?.on) {
  process.on("SIGINT", () => {
    clearDashboardDataFile().then(() => process.exit(0));
  });
  process.on("SIGTERM", () => {
    clearDashboardDataFile().then(() => process.exit(0));
  });
  process.on("exit", () => {
    // Synchronous write for exit event
    require("fs").writeFileSync(
      DASHBOARD_DATA_FILE,
      JSON.stringify(
        {
          dashboardData: {},
          chartHistories: {},
          dashboardStopTimes: {},
        },
        null,
        2,
      ),
    );
  });
}
