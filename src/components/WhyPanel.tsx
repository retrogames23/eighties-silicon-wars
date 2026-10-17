/**
 * "Warum ist das passiert?"-Panel
 *
 * Zeigt am Quartalsende die aktiven KI-Welt-Events und ihre konkreten
 * Auswirkungen auf Preis und Nachfrage. Macht die KI-Welt nachvollziehbar.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AiWorldEvent } from "@/services/LivingWorldService";

interface WhyPanelProps {
  events: AiWorldEvent[];
}

const categoryColor: Record<string, string> = {
  tech: "bg-blue-500/10 text-blue-300 border-blue-500/40",
  market: "bg-green-500/10 text-green-300 border-green-500/40",
  world: "bg-yellow-500/10 text-yellow-200 border-yellow-500/40",
  competitor: "bg-red-500/10 text-red-300 border-red-500/40",
};

function effectIcon(kind: string) {
  if (kind === "demand_up" || kind === "price_up" || kind === "tech_unlock") return TrendingUp;
  if (kind === "demand_down" || kind === "price_down") return TrendingDown;
  return Minus;
}

function pct(n: number) {
  const v = Math.round(n * 100);
  return v >= 0 ? `+${v}%` : `${v}%`;
}

export const WhyPanel = ({ events }: WhyPanelProps) => {
  const { t } = useTranslation("reports");
  if (!events.length) return null;

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          {t("whyPanel.title")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {t("whyPanel.subtitle")}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map(ev => {
          const fx = ev.applied_effects;
          const Icon = effectIcon(fx?.effect_kind ?? "neutral_news");
          const priceDelta = (fx?.price_multiplier ?? 1) - 1;
          const demandDelta = fx?.demand_delta ?? 0;
          return (
            <div key={ev.id} className="border rounded-md p-3 bg-card/50">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={categoryColor[ev.category] ?? ""}>
                      {ev.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {t("whyPanel.meta", { magnitude: ev.magnitude, remaining: ev.remaining_quarters })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm leading-tight">{ev.headline}</h4>
                </div>
                <Icon className="w-5 h-5 text-primary shrink-0" />
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {priceDelta !== 0 && (
                  <Badge variant="secondary">{t("whyPanel.price", { value: pct(priceDelta) })}</Badge>
                )}
                {demandDelta !== 0 && (
                  <Badge variant="secondary">{t("whyPanel.demand", { value: pct(demandDelta) })}</Badge>
                )}
                {(ev.affected_segments ?? []).map(s => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
              {fx?.rationale && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  {fx.rationale}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
