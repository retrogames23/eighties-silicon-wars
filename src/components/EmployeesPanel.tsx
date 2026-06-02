// Phase 4a — Team-Panel auf dem Management-Tab.
// Zeigt Aggregat-Stats, das aktuelle Team und einen Bewerber-Pool
// (deterministisch pro Quartal). Spielende können einstellen/entlassen.

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  StaffService,
  type StaffMember,
  type Candidate,
  type StaffAggregate,
} from "@/services/StaffService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Briefcase, Users, TrendingUp, HeartHandshake, Wrench, Megaphone, FlaskConical } from "lucide-react";

interface Props {
  year: number;
  quarter: number;
  cash: number;
  /** Wird gerufen, wenn sich Headcount oder Salary ändert. */
  onTeamChanged?: (team: StaffMember[], agg: StaffAggregate) => void;
}

const ROLE_ICON: Record<StaffMember["role"], typeof Wrench> = {
  engineer:   Wrench,
  marketer:   Megaphone,
  support:    HeartHandshake,
  researcher: FlaskConical,
};

export default function EmployeesPanel({ year, quarter, cash, onTeamChanged }: Props) {
  const { t, i18n } = useTranslation();
  const localeTag = i18n.language?.startsWith("en") ? "en-US" : "de-DE";
  const fmt = (n: number) => n.toLocaleString(localeTag);

  const [team, setTeam] = useState<StaffMember[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active || !user) return;
      setUserId(user.id);
      const tArr = await StaffService.list(user.id);
      if (!active) return;
      setTeam(tArr);
      setCandidates(StaffService.generateCandidates(year, quarter, user.id, 5));
    })();
    return () => { active = false; };
  }, [year, quarter]);

  const agg = useMemo(() => StaffService.aggregate(team), [team]);

  // Simple in-panel hiring hint: which roles are still missing?
  // (Detailed budget-aware suggestions live in the floating advisor.)
  const missingRoles = useMemo(() => {
    const order: Array<{ role: StaffMember["role"]; rationale: string }> = [
      { role: "engineer",   rationale: "design" },
      { role: "marketer",   rationale: "sales" },
      { role: "support",    rationale: "reputation" },
      { role: "researcher", rationale: "innovation" },
    ];
    return order.filter(({ role }) => (agg.byRole[role] ?? 0) === 0);
  }, [agg]);

  useEffect(() => {
    onTeamChanged?.(team, agg);
  }, [team, agg, onTeamChanged]);

  const roleLabel = (r: StaffMember["role"]) => t(`ui:employees.roles.${r}`);
  const specialtyLabel = (raw: string) => {
    const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    return t(`ui:employees.specialties.${slug}`, { defaultValue: raw });
  };

  const handleHire = async (c: Candidate, idx: number) => {
    if (!userId) return;
    if (cash < c.salary_per_quarter) {
      toast({
        title: t("ui:employees.toasts.notEnoughCash"),
        description: t("ui:employees.toasts.tooExpensiveDesc", { name: c.name, salary: fmt(c.salary_per_quarter) }),
        variant: "destructive",
      });
      return;
    }
    setBusy(`hire-${idx}`);
    const hired = await StaffService.hire(userId, c, year, quarter);
    setBusy(null);
    if (!hired) {
      toast({ title: t("ui:employees.toasts.hireFailed"), variant: "destructive" });
      return;
    }
    setTeam(prev => [...prev, hired]);
    setCandidates(prev => prev.filter((_, i) => i !== idx));
    toast({
      title: t("ui:employees.toasts.hired", { name: hired.name }),
      description: t("ui:employees.toasts.hiredDesc", {
        role: roleLabel(hired.role),
        skill: hired.skill,
        salary: fmt(hired.salary_per_quarter),
      }),
    });
  };

  const handleFire = async (s: StaffMember) => {
    if (!userId) return;
    setBusy(`fire-${s.id}`);
    const ok = await StaffService.fire(userId, s.id);
    setBusy(null);
    if (!ok) {
      toast({ title: t("ui:employees.toasts.fireFailed"), variant: "destructive" });
      return;
    }
    setTeam(prev => prev.filter(x => x.id !== s.id));
    toast({ title: t("ui:employees.toasts.fired", { name: s.name }) });
  };

  return (
    <div className="space-y-4">
      {/* Aggregat-Karte */}
      <Card className="retro-border bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-mono">
            <Users className="h-4 w-4" /> {t("ui:employees.title")} — {agg.headcount} {t("ui:employees.headcountSuffix")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <Stat label={t("ui:employees.salariesPerQ")} value={`${fmt(agg.totalSalary)} $`} />
          <Stat label={t("ui:employees.moraleAvg")} value={`${agg.averageMorale}%`} />
          <Stat label={t("ui:employees.devSpeed")} value={`+${agg.engineerBonusPct}%`} icon={<Wrench className="h-3 w-3" />} />
          <Stat label={t("ui:employees.research")} value={`+${agg.researcherBonusPct}%`} icon={<FlaskConical className="h-3 w-3" />} />
          <Stat label={t("ui:employees.sales")}    value={`+${agg.marketerBonusPct}%`}   icon={<Megaphone className="h-3 w-3" />} />
          <Stat label={t("ui:employees.reputation")} value={`+${agg.supportBonusPct}%`}  icon={<HeartHandshake className="h-3 w-3" />} />
        </CardContent>
      </Card>

      {/* Team */}
      <Card className="retro-border bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono">{t("ui:employees.currentTeam")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {team.length === 0 && (
            <p className="text-xs text-muted-foreground font-mono">{t("ui:employees.emptyTeam")}</p>
          )}
          {team.map(s => {
            const Icon = ROLE_ICON[s.role];
            return (
              <div key={s.id} className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 p-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-mono truncate">{s.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">
                      {roleLabel(s.role)} · {specialtyLabel(s.specialty)} · {t("ui:employees.since")} Q{s.hired_quarter}/{s.hired_year}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-[10px] font-mono">{t("ui:employees.skill")} {s.skill}</Badge>
                  <Badge variant="outline" className="text-[10px] font-mono">{t("ui:employees.morale")} {s.morale}</Badge>
                  <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                    {fmt(s.salary_per_quarter)} {t("ui:employees.perQ")}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy === `fire-${s.id}`}
                    onClick={() => handleFire(s)}
                  >
                    {t("ui:employees.fire")}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Hiring hint — surface roles the player hasn't covered yet */}
      {missingRoles.length > 0 && (
        <div className="rounded-md border border-amber/40 bg-amber/10 px-3 py-2 text-xs font-mono text-amber-foreground">
          <span className="font-semibold">{t("ui:employees.hiringHint", { defaultValue: "Empfohlen jetzt einstellen:" })}</span>{" "}
          {missingRoles.map((m, i) => (
            <span key={m.role}>
              {i > 0 ? ", " : ""}+1 {t(`ui:employees.roles.${m.role}`)}
            </span>
          ))}
        </div>
      )}

      {/* Bewerber-Pool */}
      <Card className="retro-border bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-mono">
            <Briefcase className="h-4 w-4" /> {t("ui:employees.applications")} Q{quarter}/{year}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {candidates.length === 0 && (
            <p className="text-xs text-muted-foreground font-mono">{t("ui:employees.noCandidates")}</p>
          )}
          {candidates.map((c, idx) => {
            const Icon = ROLE_ICON[c.role];
            const tooExpensive = cash < c.salary_per_quarter;
            return (
              <div key={`${c.name}-${idx}`} className="flex items-center justify-between rounded-md border border-border/60 bg-background/30 p-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4 w-4 text-accent shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-mono truncate">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">
                      {roleLabel(c.role)} · {specialtyLabel(c.specialty)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-[10px] font-mono">{t("ui:employees.skill")} {c.skill}</Badge>
                  <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                    {fmt(c.salary_per_quarter)} {t("ui:employees.perQ")}
                  </span>
                  <Button
                    size="sm"
                    variant={tooExpensive ? "outline" : "default"}
                    disabled={busy === `hire-${idx}` || tooExpensive}
                    onClick={() => handleHire(c, idx)}
                  >
                    {tooExpensive ? t("ui:employees.tooExpensive") : t("ui:employees.hire")}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/40 p-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}{label}
      </div>
      <div className="text-sm font-mono text-foreground mt-0.5 flex items-center gap-1">
        <TrendingUp className="h-3 w-3 text-primary/60" />{value}
      </div>
    </div>
  );
}
