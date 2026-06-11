/**
 * LivingWorldService
 *
 * Brückenschicht zwischen deterministischer Spielsimulation und KI-Welt-Director.
 *
 * Aufgabe:
 *  - Pro Quartal max. einen LLM-Aufruf für 1–3 neue Welt-Events anstoßen.
 *  - Magnitude (1–5) deterministisch in numerische Effekte (Preis-/Nachfrage-Multiplikatoren) übersetzen.
 *  - Events + Effekte in Supabase persistieren (für Determinismus, Replays, "Warum-Panel").
 *  - Pressartikel asynchron im Hintergrund erzeugen lassen.
 *  - Falls KI nicht verfügbar (Rate-Limit, Fehler) → keine Crashes, das Spiel läuft normal weiter.
 */

import { supabase } from "@/integrations/supabase/client";

export type EffectKind =
  | "demand_up"
  | "demand_down"
  | "price_up"
  | "price_down"
  | "tech_unlock"
  | "neutral_news";

export type EventCategory = "tech" | "market" | "world" | "competitor";
export type Segment = "home" | "business" | "workstation" | "gaming" | "education" | "all";

export interface AiWorldEvent {
  id: string;
  game_quarter: number;
  game_year: number;
  category: EventCategory;
  headline: string;
  body: string;
  affected_segments: Segment[];
  magnitude: number;
  duration_quarters: number;
  remaining_quarters: number;
  applied_effects: AppliedEffect;
  created_at: string;
}

export interface AppliedEffect {
  effect_kind: EffectKind;
  price_multiplier: number; // 1.0 = neutral
  demand_delta: number;     // -0.3 .. +0.3
  segments: Segment[];
  rationale: string;
}

interface DirectorEvent {
  category: EventCategory;
  headline: string;
  body: string;
  affected_segments: Segment[];
  magnitude: number;
  duration_quarters: number;
  effect_kind: EffectKind;
  rationale: string;
}

/**
 * Magnitude-Tabelle. Bewusst klein gehalten, damit KI-Welt nie das Balance-Korsett sprengt.
 * Magnitude 1 = Hintergrundrauschen, 5 = historischer Wendepunkt.
 */
const PRICE_DELTA_BY_MAGNITUDE: Record<number, number> = {
  1: 0.02,
  2: 0.05,
  3: 0.08,
  4: 0.12,
  5: 0.18,
};

const DEMAND_DELTA_BY_MAGNITUDE: Record<number, number> = {
  1: 0.01,
  2: 0.03,
  3: 0.06,
  4: 0.10,
  5: 0.15,
};

function magnitudeToEffect(ev: DirectorEvent): AppliedEffect {
  const m = Math.max(1, Math.min(5, Math.round(ev.magnitude)));
  const priceMag = PRICE_DELTA_BY_MAGNITUDE[m] ?? 0;
  const demandMag = DEMAND_DELTA_BY_MAGNITUDE[m] ?? 0;

  let price_multiplier = 1.0;
  let demand_delta = 0;

  switch (ev.effect_kind) {
    case "price_up":
      price_multiplier = 1 + priceMag;
      break;
    case "price_down":
      price_multiplier = 1 - priceMag;
      break;
    case "demand_up":
      demand_delta = +demandMag;
      break;
    case "demand_down":
      demand_delta = -demandMag;
      break;
    case "tech_unlock":
      demand_delta = +demandMag * 0.5;
      price_multiplier = 1 + priceMag * 0.3;
      break;
    case "neutral_news":
    default:
      break;
  }

  // Hartes Korsett: B1-Caps werden im Code erzwungen, nicht im LLM-Prompt.
  // Verhindert, dass Halluzinationen die Balance sprengen.
  return clampLlmEffect({
    effect_kind: ev.effect_kind,
    price_multiplier,
    demand_delta,
    segments: ev.affected_segments,
    rationale: ev.rationale,
  });
}

/**
 * Effekt-Budget pro Quartal:
 * Verhindert, dass mehrere Events zusammen die Wirtschaft sprengen.
 * Wenn die Summe der Magnitudes > 8, werden die Effekte runter-skaliert.
 */
function applyBudget(events: DirectorEvent[]): DirectorEvent[] {
  const total = events.reduce((s, e) => s + (e.magnitude || 0), 0);
  if (total <= 8) return events;
  const scale = 8 / total;
  return events.map(e => ({ ...e, magnitude: Math.max(1, Math.round(e.magnitude * scale)) }));
}

export class LivingWorldService {
  /**
   * Hauptmethode: Wird pro Quartalswechsel aufgerufen.
   * Gibt die neu erzeugten Events zurück; Persistenz und Presse laufen nebenbei.
   */
  static async generateQuarterEvents(params: {
    userId: string;
    year: number;
    quarter: number;
  }): Promise<AiWorldEvent[]> {
    const { userId, year, quarter } = params;

    // Letzte 2 Quartale Schlagzeilen mitschicken, damit Welt nicht repetitiv wird
    const { data: recent } = await supabase
      .from("ai_world_events")
      .select("headline")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8);
    const recentHeadlines = (recent ?? []).map(r => r.headline);

    let directorEvents: DirectorEvent[] = [];
    try {
      const { data, error } = await supabase.functions.invoke("world-director", {
        body: { year, quarter, recentHeadlines },
      });
      if (error) {
        console.warn("[LivingWorld] director call failed:", error.message);
        return [];
      }
      const raw = (data as { events?: DirectorEvent[] })?.events ?? [];
      directorEvents = applyBudget(raw);
    } catch (err) {
      console.warn("[LivingWorld] director invoke threw:", err);
      return [];
    }

    if (directorEvents.length === 0) return [];

    // Persistieren
    const inserts = directorEvents.map(ev => {
      const effect = magnitudeToEffect(ev);
      return {
        user_id: userId,
        game_quarter: quarter,
        game_year: year,
        category: ev.category,
        headline: ev.headline,
        body: ev.body,
        affected_segments: ev.affected_segments,
        magnitude: ev.magnitude,
        duration_quarters: ev.duration_quarters,
        remaining_quarters: ev.duration_quarters,
        applied_effects: effect as unknown as never,
      };
    });

    const { data: inserted, error: insertErr } = await supabase
      .from("ai_world_events")
      .insert(inserts)
      .select("*");

    if (insertErr) {
      console.error("[LivingWorld] persist failed:", insertErr);
      return [];
    }

    const events = (inserted ?? []) as unknown as AiWorldEvent[];

    // Pressartikel im Hintergrund — nicht awaiten, blockiert den Quartalsfluss nicht
    void this.generatePressArticles(userId, year, quarter, events);

    return events;
  }

  /**
   * Tickt am Quartalsende die remaining_quarters aktiver Events runter.
   */
  static async tickActiveEvents(userId: string): Promise<void> {
    const { data: active } = await supabase
      .from("ai_world_events")
      .select("id, remaining_quarters")
      .eq("user_id", userId)
      .gt("remaining_quarters", 0);

    if (!active?.length) return;

    await Promise.all(
      active.map(a =>
        supabase
          .from("ai_world_events")
          .update({ remaining_quarters: Math.max(0, (a.remaining_quarters ?? 0) - 1) })
          .eq("id", a.id),
      ),
    );
  }

  /**
   * Liefert die aktiven Events des Spielers (für UI / Warum-Panel).
   */
  static async getActive(userId: string): Promise<AiWorldEvent[]> {
    const { data } = await supabase
      .from("ai_world_events")
      .select("*")
      .eq("user_id", userId)
      .gt("remaining_quarters", 0)
      .order("created_at", { ascending: false });
    return (data ?? []) as unknown as AiWorldEvent[];
  }

  /**
   * Aggregierte Multiplikatoren pro Segment, die der Sim-Core auf Verkäufe / Preise anwenden kann.
   */
  static aggregateEffects(events: AiWorldEvent[]): Record<Segment, { price: number; demand: number }> {
    const base: Segment[] = ["home", "business", "workstation", "gaming", "education", "all"];
    const out: Record<Segment, { price: number; demand: number }> = Object.fromEntries(
      base.map(s => [s, { price: 1.0, demand: 0 }]),
    ) as Record<Segment, { price: number; demand: number }>;

    for (const ev of events) {
      const fx = ev.applied_effects;
      if (!fx) continue;
      const segs = (fx.segments?.length ? fx.segments : ["all"]) as Segment[];
      for (const s of segs) {
        if (!out[s]) continue;
        out[s].price *= fx.price_multiplier ?? 1;
        out[s].demand += fx.demand_delta ?? 0;
      }
    }
    return out;
  }

  /**
   * Erzeugt Pressartikel zu den frisch generierten Events. Best-effort.
   */
  private static async generatePressArticles(
    userId: string,
    year: number,
    quarter: number,
    events: AiWorldEvent[],
  ): Promise<void> {
    await Promise.all(
      events.map(async ev => {
        try {
          const { data, error } = await supabase.functions.invoke("press-write", {
            body: {
              year,
              quarter,
              event: {
                category: ev.category,
                headline: ev.headline,
                body: ev.body,
                magnitude: ev.magnitude,
                affected_segments: ev.affected_segments,
                effect_kind: ev.applied_effects?.effect_kind ?? "neutral_news",
              },
            },
          });
          if (error || !data?.article) return;
          const a = data.article as { headline: string; body: string; tone: string };
          await supabase.from("ai_press_articles").insert({
            user_id: userId,
            game_quarter: quarter,
            game_year: year,
            kind: "event",
            category: ev.category,
            headline: a.headline,
            body: a.body,
            source_event_id: ev.id,
            era: String(year),
            tone: a.tone,
          });
        } catch (err) {
          console.warn("[LivingWorld] press-write failed for event", ev.id, err);
        }
      }),
    );
  }

  /**
   * Liest die Pressartikel eines Quartals (für die Newspaper-Komponente).
   */
  static async getPressForQuarter(userId: string, year: number, quarter: number) {
    const { data } = await supabase
      .from("ai_press_articles")
      .select("*")
      .eq("user_id", userId)
      .eq("game_year", year)
      .eq("game_quarter", quarter)
      .order("created_at", { ascending: false });
    return data ?? [];
  }
}
