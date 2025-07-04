import { NextRequest, NextResponse } from "next/server";

export type LTToken = {
  id: string;
  url: string;
  title: string;
  time: string;
  description: string;
  load_options: LoadOptions;
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

let dashboards: LTToken[] = [];

export async function GET() {
  return NextResponse.json(dashboards);
}

export async function POST(req: NextRequest) {
  const token: LTToken = await req.json();
  if (!token.title || typeof token.title !== "string") {
    return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
  }
  dashboards.push(token);
  return NextResponse.json({ success: true, id: token.id, title: token.title }, { status: 201 });
}
