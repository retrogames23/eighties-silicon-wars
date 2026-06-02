import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Building2, Users, TrendingUp } from "lucide-react";
import { formatters } from "@/lib/i18n";
import { HeadquartersCanvas } from "@/components/headquarters/HeadquartersCanvas";

interface HeadquartersTabProps {
  cash: number;
  employees: number;
  revenue: number;
  quarter: number;
  year: number;
  companyName?: string;
}

function stageKey(employees: number): string {
  if (employees <= 3) return "garage";
  if (employees <= 8) return "firstFloor";
  if (employees <= 15) return "growing";
  if (employees <= 25) return "established";
  if (employees <= 40) return "corporation";
  return "empire";
}

export const HeadquartersTab = ({
  employees,
  revenue,
  quarter,
  year,
  companyName = "",
}: HeadquartersTabProps) => {
  const { t } = useTranslation(["ui"]);

  // Etagenzahl direkt aus MA-Zahl
  const floors =
    employees >= 61 ? 7 :
    employees >= 41 ? 6 :
    employees >= 26 ? 5 :
    employees >= 16 ? 4 :
    employees >= 9 ? 3 :
    employees >= 4 ? 2 : 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="retro-border bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-neon-cyan" />
            <div>
              <p className="text-sm text-muted-foreground font-mono">
                {t("ui:headquarters.buildingSize")}
              </p>
              <p className="text-2xl font-bold text-neon-green">
                {floors === 1 ? t("ui:headquarters.floor", { count: floors }) : t("ui:headquarters.floors", { count: floors })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="retro-border bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-neon-magenta" />
            <div>
              <p className="text-sm text-muted-foreground font-mono">
                {t("ui:headquarters.employees")}
              </p>
              <p className="text-2xl font-bold text-neon-green">{employees}</p>
            </div>
          </div>
        </Card>

        <Card className="retro-border bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-neon-green" />
            <div>
              <p className="text-sm text-muted-foreground font-mono">
                {t("ui:headquarters.revenue")}
              </p>
              <p className="text-2xl font-bold text-neon-cyan">
                {formatters.currency(revenue)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="retro-border bg-card/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-neon-green font-mono">
            {t("ui:headquarters.title")}
          </h2>
          <p className="text-sm text-muted-foreground font-mono">
            {t("ui:headquarters.era", { year })}
          </p>
        </div>
        <p className="text-sm text-muted-foreground mb-6 font-mono">
          {t("ui:headquarters.description")}
        </p>

        <HeadquartersCanvas
          employees={employees}
          year={year}
          quarter={quarter}
          companyName={companyName}
        />

        <div className="mt-6 p-4 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground font-mono text-center">
            {t(`ui:headquarters.stage.${stageKey(employees)}`)}
          </p>

          <div className="flex justify-center gap-4 mt-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#4a7ad4] border border-gray-700" />
              <span className="text-muted-foreground">
                {t("ui:headquarters.roles.worker")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#7a4ad4] border border-gray-700" />
              <span className="text-muted-foreground">
                {t("ui:headquarters.roles.developer")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#d44a4a] border border-gray-700" />
              <span className="text-muted-foreground">
                {t("ui:headquarters.roles.manager")}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
