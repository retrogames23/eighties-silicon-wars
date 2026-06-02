// Phase 4a — Mitarbeiter-System.
// Verwaltet das angestellte Team (Tabelle `staff`), erzeugt Bewerber-Pools
// und liefert Aggregat-Boni + Payroll.

import { supabase } from "@/integrations/supabase/client";

export type StaffRole = "engineer" | "marketer" | "support" | "researcher";

export interface StaffMember {
  id: string;
  user_id: string;
  name: string;
  role: StaffRole;
  specialty: string;
  skill: number;            // 1..100
  salary_per_quarter: number;
  morale: number;           // 0..100
  hired_year: number;
  hired_quarter: number;
}

export interface Candidate {
  name: string;
  role: StaffRole;
  specialty: string;
  skill: number;
  salary_per_quarter: number;
}

export interface StaffAggregate {
  totalSalary: number;
  headcount: number;
  byRole: Record<StaffRole, number>;
  engineerBonusPct: number;   // Dev-Speed bonus
  marketerBonusPct: number;   // Sales bonus
  supportBonusPct: number;    // Reputation upkeep
  researcherBonusPct: number; // Research speed
  averageMorale: number;
}

// ------- Seeded RNG (deterministisch pro Quartal) -------
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------- Daten-Pools -------
const FIRST_NAMES = [
  "Anna","Karl","Sabine","Heinz","Petra","Wolfgang","Uli","Birgit","Klaus","Renate",
  "Jürgen","Monika","Helga","Dieter","Ingrid","Bernd","Gisela","Hartmut","Christa","Rainer",
];
const LAST_NAMES = [
  "Schneider","Wagner","Becker","Hoffmann","Krüger","Bauer","Lehmann","Fuchs","Vogel","Richter",
  "Neumann","Schwarz","Zimmermann","Braun","Hartmann","Werner","Lange","Weiß","Frank","Köhler",
];

const SPECIALTIES: Record<StaffRole, string[]> = {
  engineer:   ["Hardware-Logik","BIOS / Firmware","Mainboard-Layout","Treiber","Storage-I/O"],
  marketer:   ["Werbekampagnen","Händler-Netzwerk","Messepräsenz","Print-Anzeigen","Direktvertrieb"],
  support:    ["Telefon-Hotline","Reparaturservice","Schulungen","Dokumentation","Reklamation"],
  researcher: ["CPU-Architektur","Grafik-Forschung","Sound-Synthese","Speichertechnik","Vernetzung"],
};

// Era-skalierte Gehälter — 1983er Geld ist günstiger als 1995er Geld.
function eraSalaryFactor(year: number): number {
  // 1983 ≈ 1.0, 1990 ≈ 1.5, 1995 ≈ 1.9
  return 1 + Math.max(0, year - 1983) * 0.07;
}

function baseSalaryForRole(role: StaffRole): number {
  switch (role) {
    case "engineer":   return 12000;
    case "researcher": return 14000;
    case "marketer":   return 9000;
    case "support":    return 6500;
  }
}

// ------- Public API -------
export const StaffService = {
  async list(userId: string): Promise<StaffMember[]> {
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) {
      console.warn("[StaffService.list]", error);
      return [];
    }
    return (data ?? []) as StaffMember[];
  },

  generateCandidates(year: number, quarter: number, userId: string, count = 5): Candidate[] {
    const rng = mulberry32(hashSeed(`${userId}-${year}-${quarter}`));
    const factor = eraSalaryFactor(year);
    const roles: StaffRole[] = ["engineer","engineer","marketer","support","researcher"];
    return Array.from({ length: count }).map((_, i) => {
      const role = roles[Math.floor(rng() * roles.length)] ?? "engineer";
      const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
      const last  = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
      const skill = Math.round(30 + rng() * 65); // 30..95
      const specs = SPECIALTIES[role];
      const specialty = specs[Math.floor(rng() * specs.length)];
      // Gehalt skaliert mit Skill und Ära, plus ±10% Rauschen.
      const base = baseSalaryForRole(role) * factor;
      const skillMul = 0.6 + (skill / 100) * 0.9;       // 0.6..1.5
      const noise = 0.9 + rng() * 0.2;
      const salary = Math.round((base * skillMul * noise) / 100) * 100;
      return { name: `${first} ${last}`, role, specialty, skill, salary_per_quarter: salary };
    });
  },

  async hire(userId: string, c: Candidate, year: number, quarter: number): Promise<StaffMember | null> {
    const { data, error } = await supabase
      .from("staff")
      .insert({
        user_id: userId,
        name: c.name,
        role: c.role,
        specialty: c.specialty,
        skill: c.skill,
        salary_per_quarter: c.salary_per_quarter,
        morale: 75,
        hired_year: year,
        hired_quarter: quarter,
      })
      .select()
      .single();
    if (error) {
      console.warn("[StaffService.hire]", error);
      return null;
    }
    return data as StaffMember;
  },

  async fire(userId: string, id: string): Promise<boolean> {
    const { error } = await supabase
      .from("staff")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) {
      console.warn("[StaffService.fire]", error);
      return false;
    }
    return true;
  },

  aggregate(staff: StaffMember[]): StaffAggregate {
    const byRole: Record<StaffRole, number> = { engineer:0, marketer:0, support:0, researcher:0 };
    let totalSalary = 0;
    let sumSkillEng = 0, sumSkillMkt = 0, sumSkillSup = 0, sumSkillRes = 0;
    let moraleSum = 0;
    for (const s of staff) {
      byRole[s.role]++;
      totalSalary += s.salary_per_quarter;
      moraleSum += s.morale;
      if (s.role === "engineer")   sumSkillEng += s.skill;
      if (s.role === "marketer")   sumSkillMkt += s.skill;
      if (s.role === "support")    sumSkillSup += s.skill;
      if (s.role === "researcher") sumSkillRes += s.skill;
    }
    // Boni: jede 100 Skill-Punkte ≈ 4 % Bonus, gedeckelt bei 40 %.
    const cap = (x: number) => Math.min(40, Math.round((x / 100) * 4));
    return {
      headcount: staff.length,
      totalSalary,
      byRole,
      engineerBonusPct:   cap(sumSkillEng),
      marketerBonusPct:   cap(sumSkillMkt),
      supportBonusPct:    cap(sumSkillSup),
      researcherBonusPct: cap(sumSkillRes),
      averageMorale: staff.length ? Math.round(moraleSum / staff.length) : 0,
    };
  },

  /**
   * Bezahlt das Team aus dem übergebenen Cash-Stand. Bei zu wenig Geld
   * werden Moral und (langfristig) Loyalität leiden.
   */
  async runPayroll(userId: string, cash: number): Promise<{
    paid: number;
    newCash: number;
    underpaid: boolean;
    moraleDelta: number;
  }> {
    const team = await this.list(userId);
    const agg = this.aggregate(team);
    if (agg.totalSalary <= 0) {
      return { paid: 0, newCash: cash, underpaid: false, moraleDelta: 0 };
    }
    if (cash >= agg.totalSalary) {
      // alles bezahlt → Moral leicht +
      const moraleDelta = 2;
      await this.adjustMorale(team, moraleDelta);
      return { paid: agg.totalSalary, newCash: cash - agg.totalSalary, underpaid: false, moraleDelta };
    }
    // Nicht alles bezahlt — wir ziehen, was geht, Moral fällt hart.
    const moraleDelta = -15;
    await this.adjustMorale(team, moraleDelta);
    return { paid: Math.max(0, cash), newCash: Math.max(0, cash - agg.totalSalary), underpaid: true, moraleDelta };
  },

  async adjustMorale(team: StaffMember[], delta: number): Promise<void> {
    if (team.length === 0 || delta === 0) return;
    await Promise.all(team.map(s => {
      const next = Math.max(0, Math.min(100, s.morale + delta));
      if (next === s.morale) return Promise.resolve();
      return supabase.from("staff").update({ morale: next, updated_at: new Date().toISOString() })
        .eq("id", s.id);
    }));
  },
};
