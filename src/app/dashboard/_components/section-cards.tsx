"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LTToken } from "@/app/api/load/route";

function useElapsedTime(startTime: string | undefined, tokenId?: string, stopped?: boolean) {
  const [elapsed, setElapsed] = React.useState("0s");

  React.useEffect(() => {
    if (!startTime || stopped) {
      return;
    }
    const start = new Date(startTime).getTime();
    const update = () => {
      const now = Date.now();
      let diff = Math.max(0, Math.floor((now - start) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsed(h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime, tokenId, stopped]);

  return elapsed;
}

export function SectionCards({
  lttoken,
  stopped,
  stopTime,
  currentVUCount,
}: {
  lttoken?: LTToken;
  stopped?: boolean;
  stopTime?: string;
  currentVUCount?: number;
}) {
  const elapsed = useElapsedTime(lttoken?.created_at, lttoken?.id, stopped);
  const displayElapsed = stopped && stopTime ? stopTime : elapsed;
  const opts = lttoken?.load_options;
  const cardData = [
    { label: "Title", value: lttoken?.title ?? "—" },
    { label: "Profile", value: opts?.Profile ?? "—" },
    { label: "VUs", value: opts?.VUs ?? "—" },
    { label: "Current VUs", value: currentVUCount ?? "—" },
    { label: "RPS", value: opts?.RPS ?? "—" },
    { label: "Duration", value: opts?.Duration ?? "—" },
    {
      label: "Status",
      value: (
        <Badge
          variant={stopped ? "destructive" : "outline"}
          className={`h-auto px-3 py-2 text-base ${stopped ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
        >
          {stopped ? "Stopped" : "Running"}
        </Badge>
      ),
    },
    {
      label: "Elapsed",
      value: (
        <Badge variant="outline" className="h-auto px-3 py-2 text-base">
          {displayElapsed}
        </Badge>
      ),
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cardData.map((item) => (
        <Card key={item.label} className="min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="truncate text-base font-semibold">{item.label}</CardTitle>
          </CardHeader>
          <CardContent className="truncate overflow-hidden pt-0 text-lg font-medium break-all whitespace-nowrap">
            {item.value}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
