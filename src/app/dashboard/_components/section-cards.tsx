import { TrendingUp, TrendingDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export interface SectionCardData {
  description: string;
  value: string;
  trend: "up" | "down";
  trendValue: string;
  footerMain: string;
  footerSub: string;
}

export function SectionCards({ cards }: { cards: SectionCardData[] }) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card, idx) => (
        <Card className="@container/card" key={idx}>
          <CardHeader>
            <CardDescription>{card.description}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{card.value}</CardTitle>
            <CardAction>
              <Badge variant="outline">
                {card.trend === "up" ? <TrendingUp /> : <TrendingDown />}
                {card.trendValue}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {card.footerMain} {card.trend === "up" ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
            </div>
            <div className="text-muted-foreground">{card.footerSub}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
