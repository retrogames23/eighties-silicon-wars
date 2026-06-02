// Advisor chat — LLM-backed conversations with three in-game personas:
// market researcher, head of development, shareholder representative.
// The advisor sees the current game state and replies in character (German).
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Advisor = 'market_researcher' | 'head_of_development' | 'shareholder';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

interface Body {
  advisor: Advisor;
  messages: Msg[];
  gameContext: Record<string, unknown>;
}

const SYSTEM_PROMPTS: Record<Advisor, string> = {
  market_researcher: `Du bist Dr. Helga Brandt, leitende Marktforscherin bei der Computerfirma des Spielers in den 1980er Jahren. Du redest nüchtern, mit konkreten Zahlen, leichter rheinländischer Färbung. Du beziehst dich IMMER auf die aktuellen Marktdaten im "gameContext" (Quartal/Jahr, Marktanteil, aktive Events, Konkurrenz). Du gibst nie Garantien, sondern Wahrscheinlichkeiten. Maximal 4 Sätze pro Antwort. Sprich deutsch.`,
  head_of_development: `Du bist Klaus „K.J." Jordan, leitender Entwickler. Pragmatisch, ingenieursnah, gelegentlich sarkastisch. Du beziehst dich auf die im "gameContext" sichtbaren Modelle, Komponenten, Budget für Entwicklung & Forschung. Du erklärst technische Trade-offs (CPU vs. RAM vs. GPU) historisch korrekt für die jeweilige Ära. Maximal 4 Sätze. Sprich deutsch.`,
  shareholder: `Du bist Margarete „Greta" Vogel, Sprecherin der Großaktionäre. Du redest direkt, fordernd, mit Fokus auf Cash, Reputation, Quartalsergebnisse. Du lobst nur bei harten Zahlen, kritisierst bei Verlusten oder Reputationsabfall. Du nutzt den "gameContext" für konkrete Bezüge. Maximal 4 Sätze. Sprich deutsch.`,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as Body;
    if (!body?.advisor || !SYSTEM_PROMPTS[body.advisor]) {
      return new Response(JSON.stringify({ error: 'invalid advisor' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const system =
      SYSTEM_PROMPTS[body.advisor] +
      '\n\nAktueller Spielzustand (JSON):\n' +
      JSON.stringify(body.gameContext ?? {}, null, 2);

    const upstream = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: system },
          ...body.messages.slice(-12),
        ],
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('AI gateway error', upstream.status, errText);
      return new Response(JSON.stringify({ error: 'ai_gateway', status: upstream.status, detail: errText }), {
        status: upstream.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content ?? '';
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('advisor-chat exception', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
