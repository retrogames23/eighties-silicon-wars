// Competitor Turn Edge Function
// For each AI competitor persona, picks ONE action from a closed list per quarter.
// LLM only chooses category + tone; numeric effects live in client deterministic logic.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SYSTEM_PROMPT = `You are simulating AI-driven competitor companies in a computer-industry tycoon game (1975-2010).
For each given competitor persona you MUST pick exactly ONE action from a closed list and write a short German trade-press headline + 1-2 sentence body explaining the move in-character.
You DO NOT pick numbers. You only pick the action_kind, an intensity 1-3, the target segment, and the press copy.
Stay historically plausible for the given year. Never invent products that did not yet exist.`;

const ACTIONS = [
  "price_cut",
  "price_hike",
  "new_model_announce",
  "marketing_push",
  "layoffs",
  "partnership",
  "quiet_quarter",
] as const;

const SEGMENTS = ["home", "business", "workstation", "gaming", "education", "all"] as const;

const RESPONSE_SCHEMA = {
  name: "competitor_actions",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      actions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            persona_key: { type: "string" },
            action_kind: { type: "string", enum: ACTIONS as unknown as string[] },
            intensity: { type: "integer", minimum: 1, maximum: 3 },
            target_segment: { type: "string", enum: SEGMENTS as unknown as string[] },
            headline: { type: "string", minLength: 8, maxLength: 120 },
            body: { type: "string", minLength: 30, maxLength: 320 },
            rationale: { type: "string", minLength: 10, maxLength: 200 },
          },
          required: ["persona_key", "action_kind", "intensity", "target_segment", "headline", "body", "rationale"],
        },
      },
    },
    required: ["actions"],
  },
} as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  {
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data, error } = await sb.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (error || !data?.claims) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  try {
    const body = await req.json();
    const year = Number(body?.year);
    const quarter = Number(body?.quarter);
    const competitors = Array.isArray(body?.competitors) ? body.competitors : [];
    const playerSnapshot = body?.playerSnapshot ?? {};

    if (!Number.isFinite(year) || !Number.isFinite(quarter) || competitors.length === 0) {
      return new Response(JSON.stringify({ error: "year, quarter and competitors[] required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = [
      `Quartal: Q${quarter} ${year}.`,
      `Spieler-Snapshot (öffentlich sichtbar): ${JSON.stringify(playerSnapshot)}`,
      `Konkurrenten:`,
      ...competitors.map((c: any) =>
        `- ${c.persona_key} | ${c.name} | Archetyp: ${c.archetype} | Marktanteil: ${c.market_share}% | Ruf: ${c.reputation} | Beziehung zum Spieler: ${c.relationship_score} | Letzte Aktion: ${c.last_action?.action_kind ?? "—"}`
      ),
      `Wähle pro Konkurrent genau eine Aktion, passend zu Archetyp und Marktlage. Reagiere auf den Spieler. Vermeide identische Aktionen zweier Konkurrenten.`,
    ].join("\n");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_schema", json_schema: RESPONSE_SCHEMA },
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: "credits_exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!aiRes.ok) {
      const text = await aiRes.text();
      console.error("AI gateway error", aiRes.status, text);
      return new Response(JSON.stringify({ error: "ai_error", detail: text.slice(0, 400) }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    let parsed: { actions: unknown[] };
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error("JSON parse failed", err, content.slice(0, 300));
      return new Response(JSON.stringify({ error: "parse_error" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("competitor-turn crashed", err);
    return new Response(JSON.stringify({ error: "internal_error", message: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
