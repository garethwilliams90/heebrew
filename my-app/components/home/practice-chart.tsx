"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { practiceDate, type PracticeDay } from "@/lib/flashcards/daily-practice";

const ranges = ["90d", "30d", "7d"] as const;
type Range = (typeof ranges)[number];

const span: Record<Range, number> = {
  "90d": 90,
  "30d": 30,
  "7d": 7,
};

const cardClassName =
  "border border-emerald-950/10 bg-white/90 text-emerald-950 shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)] ring-0 @container/card";

function seriesFor(days: PracticeDay[], range: Range) {
  const counts = new Map(days.map((day) => [day.date, day.cards]));
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const points: PracticeDay[] = [];

  for (let offset = span[range] - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = practiceDate(date);
    points.push({ date: key, cards: counts.get(key) ?? 0 });
  }

  return points;
}

function formatDay(value: string, locale: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return value;
  }

  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
  });
}

function isRange(value: string): value is Range {
  return value === "90d" || value === "30d" || value === "7d";
}

export function PracticeChart({ days }: { days: PracticeDay[] }) {
  const t = useTranslations("Home");
  const locale = useLocale();
  const [range, setRange] = useState<Range>("90d");
  const data = useMemo(() => seriesFor(days, range), [days, range]);
  const total = data.reduce((sum, point) => sum + point.cards, 0);
  const chartConfig = {
    cards: {
      label: t("cards"),
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;
  const summary =
    range === "7d" ? "summary7" : range === "30d" ? "summary30" : "summary90";

  return (
    <Card className={cardClassName}>
      <CardHeader>
        <CardTitle className="text-emerald-950">{t("chartTitle")}</CardTitle>
        <CardDescription className="text-emerald-800">
          {t(summary, { count: total })}
        </CardDescription>
        <CardAction>
          <Select
            value={range}
            onValueChange={(value) => {
              if (isRange(value)) {
                setRange(value);
              }
            }}
          >
            <SelectTrigger className="w-44 border-emerald-950/10 bg-white" size="sm" aria-label={t("rangeLabel")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {ranges.map((item) => (
                <SelectItem key={item} value={item} className="rounded-lg">
                  {t(item === "7d" ? "range7" : item === "30d" ? "range30" : "range90")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={data} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="fillCards" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-cards)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-cards)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => formatDay(String(value), locale)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) => formatDay(String(value), locale)}
                />
              }
            />
            <Area dataKey="cards" type="monotone" fill="url(#fillCards)" stroke="var(--color-cards)" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
