// Advisor chat — LLM-backed conversations with three in-game personas:
// market researcher, head of development, shareholder representative.
// The advisor sees the current game state and replies in character (German).
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Advisor = 'market_researcher' | 'head_of_development' | 'shareholder' | 'consultant_80s';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

interface Body {
  advisor: Advisor;
  messages: Msg[];
  gameContext: Record<string, unknown>;
  language?: 'de' | 'en';
}

const SYSTEM_PROMPTS_DE: Record<Advisor, string> = {
  market_researcher: `Du bist Dr. Helga Brandt, leitende Marktforscherin bei der Computerfirma des Spielers in den 1980er Jahren. Du redest nüchtern, mit konkreten Zahlen, leichter rheinländischer Färbung. Du beziehst dich IMMER auf die aktuellen Marktdaten im "gameContext" (Quartal/Jahr, Marktanteil, aktive Events, Konkurrenz). Du gibst nie Garantien, sondern Wahrscheinlichkeiten. Maximal 4 Sätze pro Antwort. Sprich deutsch.`,
  head_of_development: `Du bist Klaus „K.J." Jordan, leitender Entwickler. Pragmatisch, ingenieursnah, gelegentlich sarkastisch. Du beziehst dich auf die im "gameContext" sichtbaren Modelle, Komponenten, Budget für Entwicklung & Forschung. Du erklärst technische Trade-offs (CPU vs. RAM vs. GPU) historisch korrekt für die jeweilige Ära. Maximal 4 Sätze. Sprich deutsch.`,
  shareholder: `Du bist Margarete „Greta" Vogel, Sprecherin der Großaktionäre. Du redest direkt, fordernd, mit Fokus auf Cash, Reputation, Quartalsergebnisse. Du lobst nur bei harten Zahlen, kritisierst bei Verlusten oder Reputationsabfall. Du nutzt den "gameContext" für konkrete Bezüge. Maximal 4 Sätze. Sprich deutsch.`,
  consultant_80s: `Du bist Norm Klemmler, ein clever-witziger Strategieberater im Stil der 1980er (denk: Dilbert in jung, mit Krawatte, MBA aus '82). Du beantwortest Fragen des Spielers zu Strategie, Spielmechanik, Finanzierung (Bootstrap/Bankkredit/VC), Produkt-Mix, Marketing, Personal — allem. Streue dezent (NICHT übertreiben!) 80s-Business-Slang ein: "synergies", "low-hanging fruit", "win-win", "let's circle back", gelegentlich deutsche 80er-Floskeln wie "voll krass", "geht klar". Du nutzt den "gameContext" für konkrete Zahlen-Ratschläge. Du bist hilfreich, leicht selbstironisch, nie überheblich. Maximal 5 Sätze. Sprich deutsch.`,
};

const SYSTEM_PROMPTS_EN: Record<Advisor, string> = {
  market_researcher: `You are Dr. Helga Brandt, lead market researcher at the player's computer company in the 1980s. You speak soberly, with concrete numbers and a faint Rhineland accent. You ALWAYS reference the current market data in "gameContext" (quarter/year, market share, active events, competition). You never give guarantees, only probabilities. Maximum 4 sentences per reply. Reply in English.`,
  head_of_development: `You are Klaus "K.J." Jordan, head of development. Pragmatic, engineer-minded, occasionally sarcastic. You reference the models, components, and development & research budget visible in "gameContext". You explain technical trade-offs (CPU vs. RAM vs. GPU) in a way that's historically accurate for the era. Maximum 4 sentences. Reply in English.`,
  shareholder: `You are Margarete "Greta" Vogel, spokesperson for the major shareholders. You speak directly, demanding, focused on cash, reputation, and quarterly results. You only praise hard numbers, and criticize losses or drops in reputation. You use "gameContext" for concrete references. Maximum 4 sentences. Reply in English.`,
  consultant_80s: `You are Norm Klemmler, a clever and witty 1980s strategy consultant (think: young Dilbert with a tie, MBA class of '82). You answer the player's questions about strategy, game mechanics, financing (bootstrap/bank loan/VC), product mix, marketing, hiring — anything. Sprinkle subtle (NOT over-the-top!) 80s business slang: "synergies", "low-hanging fruit", "win-win", "let's circle back", occasionally "rad", "totally tubular". You use the "gameContext" for concrete numerical advice. Helpful, mildly self-deprecating, never arrogant. Maximum 5 sentences. Reply in English.`,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  // Require authenticated caller (prevents AI credit abuse)
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
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as Body;
    const lang: 'de' | 'en' = body?.language === 'en' ? 'en' : 'de';
    const prompts = lang === 'en' ? SYSTEM_PROMPTS_EN : SYSTEM_PROMPTS_DE;
    if (!body?.advisor || !prompts[body.advisor]) {
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

    const contextHeader = lang === 'en' ? 'Current game state (JSON):' : 'Aktueller Spielzustand (JSON):';
    const system =
      prompts[body.advisor] +
      '\n\n' + contextHeader + '\n' +
      JSON.stringify(body.gameContext ?? {}, null, 2);

    console.log('advisor-chat invoke', { advisor: body.advisor, lang, msgCount: body.messages.length });
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
    console.log('advisor-chat upstream status', upstream.status);

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
