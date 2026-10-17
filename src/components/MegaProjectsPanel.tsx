import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Factory, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatters } from "@/lib/i18n";
import {
  MEGA_PROJECTS, canStartProject, computeMarketThreats,
  type MegaProjects, type MegaProjectId, type PriceWar,
} from "@/lib/game/LateGame";

interface Props {
  year: number;
  quarter: number;
  cash: number;
  researchStaff: number;
  projects: MegaProjects;
  priceWars: PriceWar[];
  aiAggression: number;
  onStart: (id: MegaProjectId) => void;
}

const FIRM_NAMES: Record<string, string> = { commodore: "Commodore", ibm: "IBM", apple: "Apple", atari: "Atari" };

export function MarketThreatsCard({ year, quarter, priceWars, aiAggression }: Pick<Props, "year" | "quarter" | "priceWars" | "aiAggression">) {
  const { t } = useTranslation("lategame");
  const threats = computeMarketThreats(year, quarter, aiAggression, priceWars, 1);
  const items = [
    ...threats.activeDisruptions.map(id => t(`threats.disruption.${id}`)),
    ...threats.activePriceWars.map(w => t("threats.priceWar", { firm: FIRM_NAMES[w.firmId] ?? w.firmId })),
  ];
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{t("threats.title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {items.length === 0
          ? <span className="text-sm text-muted-foreground">{t("threats.none")}</span>
          : items.map(s => <Badge key={s} variant="destructive" className="whitespace-normal">{s}</Badge>)}
      </CardContent>
    </Card>
  );
}

export function MegaProjectsPanel({ year, cash, researchStaff, projects, onStart }: Props) {
  const { t } = useTranslation("lategame");
  const money = (n: number) => formatters.currency(n);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><Factory className="w-4 h-4" />{t("title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {MEGA_PROJECTS.map(def => {
          const st = projects[def.id];
          const check = canStartProject(def, year, cash, researchStaff, projects);
          return (
            <div key={def.id} className="border rounded-md p-3 space-y-2 bg-muted/20 min-w-0">
              <div className="font-semibold text-sm">{t(`projects.${def.id}.name`)}</div>
              <div className="text-xs text-primary">{t(`projects.${def.id}.effect`)}</div>
              <div className="text-xs text-muted-foreground">
                {t("cost")}: {money(def.cost)} · {t("buildTime", { q: def.buildQuarters })} · {t("upkeep", { amount: money(def.upkeep) })}
              </div>
              {st?.status === "done" && <Badge>{t("done")}</Badge>}
              {st?.status === "building" && (
                <div className="space-y-1">
                  <Progress value={(st.quartersDone / def.buildQuarters) * 100} />
                  <div className="text-xs">{t("building", { done: st.quartersDone, total: def.buildQuarters })}</div>
                </div>
              )}
              {!st && (
                <Button size="sm" className="w-full" disabled={!check.ok} onClick={() => onStart(def.id)}>
                  {check.ok ? t("start")
                    : check.reason === "year" ? t("locked.year", { year: def.minYear })
                    : check.reason === "staff" ? t("locked.staff", { n: def.minResearchStaff })
                    : t("locked.cash")}
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
