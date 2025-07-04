"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LTToken } from "@/app/api/load/route";

function useElapsedTime(startTime: string | undefined, tokenId?: string) {
  const [elapsed, setElapsed] = React.useState("0s");
  React.useEffect(() => {
    if (!startTime) return;
    const start = new Date(startTime).getTime();
    const update = () => {
      const now = Date.now();
      let diff = Math.max(0, Math.floor((now - start) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsed(
        h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime, tokenId]);
  return elapsed;
}

export function SectionCards({ lttoken }: { lttoken?: LTToken }) {
  const elapsed = useElapsedTime(lttoken?.time, lttoken?.id);
  const opts = lttoken?.load_options;
  console.log("SectionCards opts:", opts);
  const cardData = [
    { label: "Title", value: lttoken?.title ?? "—" },
    { label: "Profile", value: opts?.Profile ?? "—" },
    { label: "VUs", value: opts?.VUs ?? "—" },
    { label: "RPS", value: opts?.RPS ?? "—" },
    { label: "Duration", value: opts?.Duration ?? "—" },
    { label: "Elapsed", value: <Badge variant="outline" className="text-base px-3 py-2 h-auto">{elapsed}</Badge> },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cardData.map((item) => (
        <Card key={item.label} className="min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold truncate">{item.label}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-lg font-medium truncate break-all whitespace-nowrap overflow-hidden">
            {item.value}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
