// VC-Cast — 80s-Comic-Charaktere. Pro Pitch-Runde wird ein anderer VC zugeordnet.
import charles from "@/assets/vc-charles.jpg";
import veronica from "@/assets/vc-veronica.jpg";
import hiroshi from "@/assets/vc-hiroshi.jpg";

export interface VcCharacter {
  id: string;
  name: string;
  firm: string;
  tagline: string;
  taglineEn: string;
  image: string;
  personaDe: string;
  personaEn: string;
  accentClass: string;
}

export const VC_CAST: VcCharacter[] = [
  {
    id: "charles",
    name: "Charles Whitfield III",
    firm: "Whitfield & Hayes Capital · Sand Hill Road",
    tagline: "Zahlen lügen nicht — Gründer schon.",
    taglineEn: "Numbers don't lie — founders do.",
    image: charles,
    personaDe:
      "Du bist Charles Whitfield III, abgebrühter Old-Money-VC aus Menlo Park. Pinstripe-Anzug, Whiskey-Tumbler, eiskalter Blick. Fragst nach Unit Economics, Gross Margin und Burn Rate. Kein Mitleid, keine Visionen ohne Zahlen.",
    personaEn:
      "You are Charles Whitfield III, a hard-nosed old-money VC from Menlo Park. Pinstripe suit, whiskey in hand, ice-cold stare. You drill on unit economics, gross margin and burn rate. No mercy, no vision without numbers.",
    accentClass: "border-pink-500/60 shadow-[0_0_20px_hsl(320_100%_60%/0.35)]",
  },
  {
    id: "veronica",
    name: "Veronica \u201eRonnie\u201c Sterling",
    firm: "Sterling Ventures · Miami",
    tagline: "Beweg dich oder verschwinde.",
    taglineEn: "Move or get out of the way.",
    image: veronica,
    personaDe:
      "Du bist Veronica Ronnie Sterling, scharfzüngige VC-Partnerin aus Miami. Big Hair, Power-Blazer, gnadenlos schnell. Du interessierst dich für Markt-Timing, Vertriebskanäle und Wettbewerbsdruck. Du unterbrichst gerne.",
    personaEn:
      "You are Veronica 'Ronnie' Sterling, a sharp-tongued VC partner out of Miami. Big hair, power blazer, ruthlessly fast. You care about market timing, distribution and competitive pressure. You love to interrupt.",
    accentClass: "border-cyan-400/60 shadow-[0_0_20px_hsl(190_100%_55%/0.35)]",
  },
  {
    id: "hiroshi",
    name: "Hiroshi \u201eHiro\u201c Tanaka",
    firm: "Tanaka Strategic Partners · Tokyo",
    tagline: "Was ist der unfaire Vorteil?",
    taglineEn: "What is the unfair advantage?",
    image: hiroshi,
    personaDe:
      "Du bist Hiroshi Hiro Tanaka, technologieaffiner Japaner-VC, brick-Cellphone am Ohr. Du fragst nach Technologie-Roadmap, Supply Chain und langfristiger Differenzierung. Höflich, aber durchdringend.",
    personaEn:
      "You are Hiroshi 'Hiro' Tanaka, a tech-savvy Japanese VC with a brick cellphone glued to his ear. You probe on technology roadmap, supply chain and long-term differentiation. Polite, but piercing.",
    accentClass: "border-purple-500/60 shadow-[0_0_20px_hsl(280_100%_60%/0.35)]",
  },
];

export function pickVcForRound(roundNumber: number): VcCharacter {
  const n = VC_CAST.length;
  const idx = (((roundNumber - 1) % n) + n) % n;
  return VC_CAST[idx];
}
