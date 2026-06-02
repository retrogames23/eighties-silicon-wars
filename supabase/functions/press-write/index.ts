// Press Writer Edge Function
// Turns a structured event into an era-appropriate German newspaper article.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

function eraVoice(year: number): string {
  if (year < 1985) return "Fachzeitschrift Anfang der 80er, sachlich, leicht technokratisch, Begriffe wie 'Mikrocomputer', 'Heimcomputer', 'Kilobyte'.";
  if (year < 1995) return "Computer-Wochenzeitung Ende 80er/Anfang 90er, halb-technisch, optimistisch über PC-Boom, MS-DOS und Windows-Aufstieg.";
  if (year < 2005) return "Dot-com-Ära Online- und Print-Magazin, etwas reißerisch, Begriffe wie 'New Economy', 'World Wide Web', 'Multimedia'.";
  return "Tech-Blog der späten 2000er, knapper Stil, Online-Tonalität, Web-2.0-Vokabular.";
}

const SYSTEM_PROMPT = `Du bist ein Wirtschafts- und Technik-Journalist für eine fiktive Computer-Industrie-Welt 1975-2010.
Schreibe einen kurzen Zeitungsartikel auf Deutsch (90-160 Wörter) zu einem gegebenen Ereignis.
Anforderungen:
- Keine erfundenen Marken, die zur Era unpassend sind.
- Keine Zahlen oder Prozentwerte erfinden — wenn vorhanden, übernimm die gelieferten.
- Sachliche Schlagzeile (max. 90 Zeichen).
- Nur die Antwort als striktes JSON liefern.`;

const RESPONSE_SCHEMA = {
  name: "press_article",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      headline: { type: "string", minLength: 8, maxLength: 120 },
      body: { type: "string", minLength: 80, maxLength: 1200 },
      tone: { type: "string", enum: ["neutral", "optimistic", "skeptical", "alarmed", "celebratory"] }
    },
    required: ["headline", "body", "tone"]
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
    const event = body?.event as { category?: string; headline?: string; body?: string; magnitude?: number; affected_segments?: string[]; effect_kind?: string } | undefined;

    if (!Number.isFinite(year) || !Number.isFinite(quarter) || !event?.headline) {
      return new Response(JSON.stringify({ error: "year, quarter, event.headline required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const userPrompt = [
      `Era-Stimme: ${eraVoice(year)}`,
      `Quartal: Q${quarter} ${year}.`,
      `Kategorie: ${event.category ?? "world"}`,
      `Effekt-Art: ${event.effect_kind ?? "neutral_news"} (Magnitude ${event.magnitude ?? 1}/5)`,
      `Betroffene Segmente: ${(event.affected_segments ?? []).join(", ") || "—"}`,
      `Ursprüngliche Kurzfassung: ${event.headline}`,
      event.body ? `Hintergrund: ${event.body}` : ""
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
    let article;
    try {
      article = JSON.parse(content);
    } catch (err) {
      console.error("JSON parse failed", err, content.slice(0, 300));
      return new Response(JSON.stringify({ error: "parse_error" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ article }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("press-write crashed", err);
    return new Response(JSON.stringify({ error: "internal_error", message: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
