// World Director Edge Function
// Generates 1-3 era-appropriate world events per quarter via Lovable AI.
// Returns strict JSON. Numeric balance lives on the client; LLM only picks magnitudes 1-5.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

// Era anchors to keep the LLM historically plausible.
function eraContext(year: number): string {
  if (year < 1980) return "Late 1970s home/hobbyist computing. 8-bit micros (Apple II, TRS-80, PET). No PC clones yet, no GUI on consumer machines, no internet for households.";
  if (year < 1985) return "Early 1980s. IBM PC (1981), Commodore 64 boom, Apple Lisa/Mac (1984). Floppy disks dominate, hard disks rare/expensive. CP/M and early MS-DOS.";
  if (year < 1990) return "Late 1980s. PC clones explode, 286/386 CPUs, EGA/VGA. Mac II line. Amiga and Atari ST. Networking is rare in homes. Modems at 1200-9600 baud.";
  if (year < 1995) return "Early 1990s. Windows 3.x then Windows 95. 486 and early Pentium. CD-ROMs go mainstream. Online services (AOL, CompuServe). Web is brand-new.";
  if (year < 2000) return "Late 1990s. Pentium II/III, dot-com boom, dial-up internet ubiquitous, broadband dawning. 3D accelerators (3dfx, NVIDIA). Linux rising on servers.";
  if (year < 2005) return "Early 2000s. Pentium 4, AMD Athlon 64. Broadband mainstream. Wi-Fi appears. Laptops gain share. iPod (2001).";
  return "Mid 2000s onward. Multi-core CPUs, mobile computing rising, smartphones imminent. Vista/XP era.";
}

const SYSTEM_PROMPT = `You are the World Director for a computer-industry tycoon game set 1975-2010.
Generate 1-3 world events for the current quarter. Events must be plausible for the era — never invent technology, products or companies that did not yet exist.
You DO NOT decide numeric balance; you only pick a magnitude 1-5 and which market segments are affected.
Tone: matter-of-fact trade-press headlines, German.
Categories: tech, market, world, competitor.
Segments: home, business, workstation, gaming, education.`;

const RESPONSE_SCHEMA = {
  name: "world_events",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      events: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            category: { type: "string", enum: ["tech", "market", "world", "competitor"] },
            headline: { type: "string", minLength: 8, maxLength: 120 },
            body: { type: "string", minLength: 40, maxLength: 400 },
            affected_segments: {
              type: "array",
              items: { type: "string", enum: ["home", "business", "workstation", "gaming", "education", "all"] },
              minItems: 1,
              maxItems: 4
            },
            magnitude: { type: "integer", minimum: 1, maximum: 5 },
            duration_quarters: { type: "integer", minimum: 1, maximum: 4 },
            effect_kind: {
              type: "string",
              enum: ["demand_up", "demand_down", "price_up", "price_down", "tech_unlock", "neutral_news"]
            },
            rationale: { type: "string", minLength: 10, maxLength: 200 }
          },
          required: ["category", "headline", "body", "affected_segments", "magnitude", "duration_quarters", "effect_kind", "rationale"]
        }
      }
    },
    required: ["events"]
  }
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
    const { data: { user }, error } = await sb.auth.getUser(authHeader.replace('Bearer ', ''));
    if (error || !user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  try {
    const body = await req.json();
    const year = Number(body?.year);
    const quarter = Number(body?.quarter);
    const recentHeadlines: string[] = Array.isArray(body?.recentHeadlines) ? body.recentHeadlines.slice(0, 8) : [];

    if (!Number.isFinite(year) || !Number.isFinite(quarter) || quarter < 1 || quarter > 4) {
      return new Response(JSON.stringify({ error: "year and quarter (1-4) required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const userPrompt = [
      `Aktuelles Quartal: Q${quarter} ${year}.`,
      `Era-Kontext: ${eraContext(year)}`,
      recentHeadlines.length
        ? `Letzte Schlagzeilen (vermeide Wiederholungen): ${recentHeadlines.join(" | ")}`
        : "",
      `Erzeuge 1–3 neue Welt-Events. Wähle Magnitude bewusst klein (1–2) für Routine-News, 3 für spürbare Marktbewegungen, 4–5 nur für historische Wendepunkte (z. B. echter Technologiesprung). Gib für jedes Event einen kurzen rationale-Text, warum die Magnitude so gewählt ist.`
    ].filter(Boolean).join("\n");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_schema", json_schema: RESPONSE_SCHEMA }
      })
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
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const data = await aiRes.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    let parsed: { events: unknown[] };
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error("JSON parse failed", err, content.slice(0, 300));
      return new Response(JSON.stringify({ error: "parse_error" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("world-director crashed", err);
    return new Response(JSON.stringify({ error: "internal_error", message: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
