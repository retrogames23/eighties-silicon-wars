/**
 * CompetitorsService
 *
 * Lebende KI-Konkurrenz: 3 persistente Persona-Firmen pro Spieler.
 * Pro Quartal ein LLM-Aufruf, der für jede Persona eine Aktion aus einer geschlossenen
 * Liste wählt. Deterministische Effekte werden hier (Client) angewandt – das LLM liefert
 * nur Aktion + Tonfall + Begründung.
 */

import { supabase } from "@/integrations/supabase/client";

export type CompetitorAction =
  | "price_cut"
  | "price_hike"
  | "new_model_announce"
  | "marketing_push"
  | "layoffs"
  | "partnership"
  | "quiet_quarter";

export interface AiCompetitor {
  id: string;
  user_id: string;
  persona_key: string;
  name: string;
  archetype: string;
  description: string;
  market_share: number;
  reputation: number;
  cash_estimate: number;
  relationship_score: number;
  last_action: {
    action_kind?: CompetitorAction;
    intensity?: number;
    target_segment?: string;
    headline?: string;
    body?: string;
    rationale?: string;
    year?: number;
    quarter?: number;
  };
  last_action_year: number | null;
  last_action_quarter: number | null;
}

interface DirectorAction {
  persona_key: string;
  action_kind: CompetitorAction;
  intensity: number;
  target_segment: string;
  headline: string;
  body: string;
  rationale: string;
}

const SEED_PERSONAS = [
  {
    persona_key: "bluechip",
    name: "BlueChip Industries",
    archetype: "konservativer Bürocomputer-Riese",
    description: "Solide, langsam, gute Bilanz. Setzt auf Büro-Großkunden und Serviceverträge.",
    market_share: 18,
    reputation: 65,
    cash_estimate: 5_000_000,
  },
  {
    persona_key: "garage",
    name: "Pixel Garage",
    archetype: "risikofreudiges Startup aus dem Hobby-Markt",
    description: "Klein, frech, oft pleite. Liebling der Hacker- und Heimcomputer-Szene.",
    market_share: 4,
    reputation: 55,
    cash_estimate: 300_000,
  },
  {
    persona_key: "crimson",
    name: "Crimson Systems",
    archetype: "aggressiver Preisbrecher",
    description: "Kopiert Erfolge der Branche, drückt Preise, gibt viel für Marketing aus.",
    market_share: 9,
    reputation: 45,
    cash_estimate: 1_500_000,
  },
] as const;

/**
 * Deterministische Effekttabelle: Aktion × Intensität → Marktanteils- und Ruf-Delta des Konkurrenten.
 * Player-seitige Effekte landen über die Pressartikel in der Wahrnehmung, nicht direkt in der Sim,
 * damit die Spielbalance nicht von LLM-Tonfall abhängt.
 */
function applyActionEffects(
  c: AiCompetitor,
  action: DirectorAction,
): Pick<AiCompetitor, "market_share" | "reputation" | "cash_estimate" | "relationship_score"> {
  const i = Math.max(1, Math.min(3, action.intensity));
  let dShare = 0;
  let dRep = 0;
  let dCash = 0;
  let dRel = 0;

  switch (action.action_kind) {
    case "price_cut":
      dShare = +0.6 * i; dRep = +1 * i; dCash = -100_000 * i; dRel = -1 * i; break;
    case "price_hike":
      dShare = -0.5 * i; dRep = -1 * i; dCash = +80_000 * i; dRel = 0; break;
    case "new_model_announce":
      dShare = +0.4 * i; dRep = +3 * i; dCash = -200_000 * i; dRel = -1 * i; break;
    case "marketing_push":
      dShare = +0.3 * i; dRep = +2 * i; dCash = -150_000 * i; dRel = 0; break;
    case "layoffs":
      dShare = -0.3 * i; dRep = -3 * i; dCash = +120_000 * i; dRel = 0; break;
    case "partnership":
      dShare = +0.2 * i; dRep = +2 * i; dCash = 0; dRel = +2 * i; break;
    case "quiet_quarter":
    default:
      break;
  }

  return {
    market_share: clamp(c.market_share + dShare, 0.5, 60),
    reputation: clamp(c.reputation + dRep, 0, 100),
    cash_estimate: Math.max(0, c.cash_estimate + dCash),
    relationship_score: clamp(c.relationship_score + dRel, -50, 50),
  };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export class CompetitorsService {
  /**
   * Stellt sicher, dass die 3 Seed-Personas für den Spieler in der DB existieren.
   * Idempotent — bei Konflikten passiert nichts.
   */
  static async ensureSeeded(userId: string): Promise<AiCompetitor[]> {
    const { data: existing } = await supabase
      .from("ai_competitors")
      .select("*")
      .eq("user_id", userId);

    if (existing && existing.length >= SEED_PERSONAS.length) {
      return existing as unknown as AiCompetitor[];
    }

    const have = new Set((existing ?? []).map((c: any) => c.persona_key));
    const toInsert = SEED_PERSONAS
      .filter(p => !have.has(p.persona_key))
      .map(p => ({ user_id: userId, ...p }));

    if (toInsert.length > 0) {
      await supabase.from("ai_competitors").insert(toInsert);
    }

    const { data: all } = await supabase
      .from("ai_competitors")
      .select("*")
      .eq("user_id", userId);
    return (all ?? []) as unknown as AiCompetitor[];
  }

  static async getAll(userId: string): Promise<AiCompetitor[]> {
    const { data } = await supabase
      .from("ai_competitors")
      .select("*")
      .eq("user_id", userId)
      .order("market_share", { ascending: false });
    return (data ?? []) as unknown as AiCompetitor[];
  }

  /**
   * Hauptaufruf pro Quartal: LLM wählt Aktion je Persona, Service wendet deterministische
   * Effekte an und schreibt einen Pressartikel pro Aktion.
   */
  static async runQuarter(params: {
    userId: string;
    year: number;
    quarter: number;
    playerSnapshot: {
      cash: number;
      reputation: number;
      market_share: number;
      active_models: number;
    };
  }): Promise<DirectorAction[]> {
    const { userId, year, quarter, playerSnapshot } = params;

    const competitors = await this.ensureSeeded(userId);
    if (competitors.length === 0) return [];

    let actions: DirectorAction[] = [];
    try {
      const { data, error } = await supabase.functions.invoke("competitor-turn", {
        body: {
          year,
          quarter,
          playerSnapshot,
          competitors: competitors.map(c => ({
            persona_key: c.persona_key,
            name: c.name,
            archetype: c.archetype,
            market_share: c.market_share,
            reputation: c.reputation,
            relationship_score: c.relationship_score,
            last_action: c.last_action,
          })),
        },
      });
      if (error) {
        console.warn("[Competitors] turn call failed:", error.message);
        return [];
      }
      actions = (data as { actions?: DirectorAction[] })?.actions ?? [];
    } catch (err) {
      console.warn("[Competitors] turn invoke threw:", err);
      return [];
    }

    if (actions.length === 0) return [];

    // Update competitor state + write press article
    await Promise.all(
      actions.map(async action => {
        const competitor = competitors.find(c => c.persona_key === action.persona_key);
        if (!competitor) return;

        const next = applyActionEffects(competitor, action);

        await supabase
          .from("ai_competitors")
          .update({
            ...next,
            last_action: {
              action_kind: action.action_kind,
              intensity: action.intensity,
              target_segment: action.target_segment,
              headline: action.headline,
              body: action.body,
              rationale: action.rationale,
              year,
              quarter,
            },
            last_action_year: year,
            last_action_quarter: quarter,
            updated_at: new Date().toISOString(),
          })
          .eq("id", competitor.id);

        // Press article for the newspaper feed
        try {
          await supabase.from("ai_press_articles").insert({
            user_id: userId,
            game_quarter: quarter,
            game_year: year,
            kind: "competitor",
            category: "competitor",
            headline: action.headline,
            body: action.body,
            era: String(year),
            tone: "trade-press",
          });
        } catch (err) {
          console.warn("[Competitors] press insert failed", err);
        }
      }),
    );

    return actions;
  }
}
