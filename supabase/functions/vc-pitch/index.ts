// VC-Pitch Edge Function — zwei Phasen:
//   action=questions  → LLM erzeugt 3 kritische Nachfragen zum Pitch
//   action=evaluate   → LLM bewertet Antworten, gibt accepted + Multiplikator
//
// LLM-Aufrufe gehen über das Lovable AI Gateway. Strukturierte Outputs via
// response_format: json_schema, damit der Client zuverlässig parsen kann.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface PitchSetup {
  offeredEquityPct: number;
  proposedValuation: number;
  useOfFunds: string;
  vcPersona?: string;
}

interface CompanySnapshot {
  companyName: string;
  cash: number;
  reputation: number;
  marketShare: number;
  brandAwareness: number;
  outstandingDebt: number;
  equityGivenAwayPct: number;
  year: number;
  quarter: number;
  activeModels: Array<{ name: string; price: number; cpu: string; releaseYear: number }>;
  quarterlyRevenue: number;
  quarterlyProfit: number;
}

interface QnA {
  question: string;
  answer: string;
}

interface Body {
  action: 'questions' | 'evaluate';
  setup: PitchSetup;
  company: CompanySnapshot;
  roundNumber: number; // 1..3
  qna?: QnA[]; // nur bei evaluate
  language?: 'de' | 'en';
}

function vcPersona(lang: 'de' | 'en', custom?: string) {
  if (custom && custom.length > 30 && custom.length < 2000) return custom;
  return lang === 'en'
    ? `You are Charles Whitfield III, a hardened 1980s venture capitalist from Sand Hill Road. You back computer companies but only when the numbers make sense. You are skeptical, blunt, ask sharp questions, and you know the era's tech (CPUs, RAM, market segments). You judge pitches against the company's actual KPIs.`
    : `Du bist Charles Whitfield III, ein abgebrühter VC der 80er aus dem Sand Hill Road Umfeld. Du investierst in Computerfirmen, aber nur wenn die Zahlen stimmen. Du bist skeptisch, direkt, stellst harte Fragen und kennst die Tech der Ära (CPUs, RAM, Marktsegmente). Du bewertest Pitches anhand der echten KPIs.`;
}

async function callGateway(apiKey: string, system: string, userPrompt: string, schema: object) {
  const upstream = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_schema', json_schema: { name: 'vc_response', schema, strict: true } },
    }),
  });
  if (!upstream.ok) {
    const errText = await upstream.text();
    throw new Error(`AI gateway ${upstream.status}: ${errText}`);
  }
  const data = await upstream.json();
  const content = data?.choices?.[0]?.message?.content ?? '{}';
  return JSON.parse(content);
}

const QUESTIONS_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: { type: 'string' },
      minItems: 3,
      maxItems: 3,
    },
  },
  required: ['questions'],
  additionalProperties: false,
};

const EVAL_SCHEMA = {
  type: 'object',
  properties: {
    accepted: { type: 'boolean' },
    negotiated_valuation_multiplier: { type: 'number' },
    feedback: { type: 'string' },
    weaknesses: { type: 'array', items: { type: 'string' } },
  },
  required: ['accepted', 'negotiated_valuation_multiplier', 'feedback', 'weaknesses'],
  additionalProperties: false,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  // Auth-Validierung
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
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as Body;
    const lang: 'de' | 'en' = body?.language === 'en' ? 'en' : 'de';

    if (!body?.action || (body.action !== 'questions' && body.action !== 'evaluate')) {
      return new Response(JSON.stringify({ error: 'invalid action' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!body.setup || !body.company) {
      return new Response(JSON.stringify({ error: 'setup and company required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Input-Sanity
    const equity = Number(body.setup.offeredEquityPct);
    const valuation = Number(body.setup.proposedValuation);
    if (!(equity > 0 && equity <= 40) || !(valuation > 0 && valuation < 1e10)) {
      return new Response(JSON.stringify({ error: 'invalid pitch terms' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const system = vcPersona(lang) + (lang === 'en'
      ? `\n\nReturn ONLY valid JSON matching the provided schema. Do not include prose outside the JSON.`
      : `\n\nGib NUR gültiges JSON nach Schema zurück. Keine Prosa außerhalb des JSON.`);

    const companyJson = JSON.stringify(body.company, null, 2);
    const setupJson = JSON.stringify(body.setup, null, 2);

    if (body.action === 'questions') {
      const userPrompt = (lang === 'en'
        ? `Pitch round #${body.roundNumber} (max 3 rounds total).\n\nCompany snapshot:\n${companyJson}\n\nFounder pitch terms:\n${setupJson}\n\nGenerate exactly 3 critical questions a skeptical VC would ask. Each must reference a specific number, model, or claim — no generic questions. Keep each under 200 chars.`
        : `Pitch-Runde Nr. ${body.roundNumber} (max. 3 insgesamt).\n\nFirmen-Snapshot:\n${companyJson}\n\nGründer-Pitch-Konditionen:\n${setupJson}\n\nGeneriere exakt 3 kritische Fragen eines skeptischen VC. Jede muss sich auf eine konkrete Zahl, ein Modell oder eine Aussage beziehen — keine Allgemeinplätze. Maximal 200 Zeichen pro Frage.`);

      const result = await callGateway(apiKey, system, userPrompt, QUESTIONS_SCHEMA);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // action === 'evaluate'
    if (!Array.isArray(body.qna) || body.qna.length !== 3) {
      return new Response(JSON.stringify({ error: 'qna must have 3 items' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Antwortlängen begrenzen (Prompt-Injection-Schutz)
    for (const q of body.qna) {
      if (typeof q.answer !== 'string' || q.answer.length > 1500) {
        return new Response(JSON.stringify({ error: 'answer too long' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const qnaJson = body.qna.map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}`).join('\n\n');

    const userPrompt = (lang === 'en'
      ? `Evaluate the founder's answers. Pitch round #${body.roundNumber}.

Company snapshot:
${companyJson}

Pitch terms:
${setupJson}

Founder Q&A:
${qnaJson}

Decide:
1. "accepted": only true if answers are concrete, consistent with the snapshot, and reasonable for 1980s home-computer market. Higher round numbers should require stronger answers (VCs get more skeptical).
2. "negotiated_valuation_multiplier": 0.4 (lowball) … 1.3 (above-asking). Anchor 1.0 = founder's proposal accepted. Penalize hand-waving, reward specifics.
3. "feedback": 2-3 sentences in English, in character (Charles Whitfield III).
4. "weaknesses": up to 3 short bullet phrases naming specific weak points.

Return JSON only.`
      : `Bewerte die Gründer-Antworten. Pitch-Runde Nr. ${body.roundNumber}.

Firmen-Snapshot:
${companyJson}

Pitch-Konditionen:
${setupJson}

Gründer-Q&A:
${qnaJson}

Entscheide:
1. "accepted": nur true, wenn Antworten konkret, konsistent mit Snapshot und realistisch für 80er-Heimcomputer-Markt sind. Höhere Runden-Nummer = strengere Bewertung.
2. "negotiated_valuation_multiplier": 0.4 (Lowball) … 1.3 (über Wunsch). 1.0 = Gründer-Bewertung akzeptiert. Schwätzen bestrafen, Konkretes belohnen.
3. "feedback": 2–3 Sätze auf Deutsch, in der Rolle (Charles Whitfield III).
4. "weaknesses": bis zu 3 kurze Stichpunkte mit konkreten Schwächen.

Antworte nur mit JSON.`);

    const result = await callGateway(apiKey, system, userPrompt, EVAL_SCHEMA);
    // Multiplier hart clampen
    const mult = Math.max(0.4, Math.min(1.3, Number(result.negotiated_valuation_multiplier) || 1.0));
    result.negotiated_valuation_multiplier = mult;
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('vc-pitch exception', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
