import hqMidriseAsset from "@/assets/hq-building-5floor.jpg.asset.json";
import hqGarage from "@/assets/hq-garage.jpg";
import hqSmallOffice from "@/assets/hq-smalloffice.jpg";
import hqHighrise from "@/assets/hq-highrise.jpg";
import hqSkyscraper from "@/assets/hq-skyscraper.jpg";

// ============================================================================
// Headquarters illustration
// ============================================================================
// Hand-painted 80s cross-section. Building type scales with employee count:
//   1–3      garage
//   4–9      small 2-story office
//   10–30    5-floor mid-rise (existing painting)
//   31–80    10-floor high-rise
//   81+      20-floor skyscraper
// Within a building tier we reveal more floors from the BOTTOM up as the team
// grows, so the ground floor / entrance always anchors the bottom.
// ============================================================================

interface Props {
  employees: number;
  year: number;
  quarter: number;
  companyName: string;
}

type Tier = {
  src: string;
  totalFloors: number; // floors painted in the source image
  minEmployees: number;
  maxEmployees: number; // employees needed to reveal ALL floors of this tier
};

const TIERS: Tier[] = [
  { src: hqGarage,                   totalFloors: 1,  minEmployees: 0,  maxEmployees: 3 },
  { src: hqSmallOffice,              totalFloors: 2,  minEmployees: 4,  maxEmployees: 9 },
  { src: hqMidriseAsset.url,         totalFloors: 5,  minEmployees: 10, maxEmployees: 30 },
  { src: hqHighrise,                 totalFloors: 10, minEmployees: 31, maxEmployees: 80 },
  { src: hqSkyscraper,               totalFloors: 20, minEmployees: 81, maxEmployees: 250 },
];

function pickTier(employees: number): Tier {
  for (const t of TIERS) if (employees <= t.maxEmployees) return t;
  return TIERS[TIERS.length - 1];
}

function visibleFloors(tier: Tier, employees: number): number {
  if (tier.totalFloors === 1) return 1;
  const span = tier.maxEmployees - tier.minEmployees;
  const clamped = Math.max(0, Math.min(span, employees - tier.minEmployees));
  // Always show at least 1 floor; scale linearly to totalFloors.
  const floors = 1 + Math.round((clamped / Math.max(1, span)) * (tier.totalFloors - 1));
  return Math.max(1, Math.min(tier.totalFloors, floors));
}

export const HeadquartersCanvas = ({ employees, quarter, companyName }: Props) => {
  const tier = pickTier(employees);
  const floors = visibleFloors(tier, employees);
  const ratio = floors / tier.totalFloors;

  // Day/night tint over the building
  const tint =
    quarter === 4 ? "rgba(20,20,60,0.35)" :
    quarter === 3 ? "rgba(255,140,60,0.10)" :
    "rgba(0,0,0,0)";

  // Preserve image's intrinsic aspect ratio. We use a square-ish wrapper for
  // the garage and let taller buildings be taller naturally.
  const baseAspect =
    tier === TIERS[0] ? 5 / 4 :         // garage: landscape-ish square
    tier === TIERS[1] ? 1 :              // small office: square
    tier === TIERS[2] ? 9 / 16 :         // mid-rise
    tier === TIERS[3] ? 3 / 4 :          // high-rise source
    9 / 16;                              // skyscraper source

  return (
    <div
      className="relative w-full overflow-hidden rounded-md bg-[#1a1410]"
      style={{ aspectRatio: `${1} / ${baseAspect * ratio}` }}
      aria-label={companyName ? `${companyName} headquarters` : "Headquarters"}
    >
      {/* Image anchored at the bottom; reveals more floors from the bottom up. */}
      <img
        src={tier.src}
        alt=""
        className="absolute left-0 w-full select-none pointer-events-none"
        style={{
          bottom: 0,
          height: `${(tier.totalFloors / floors) * 100}%`,
        }}
        draggable={false}
        loading="lazy"
      />
      {tint !== "rgba(0,0,0,0)" && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: tint }} />
      )}
      {floors < tier.totalFloors && (
        <div
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{
            height: "12%",
            background: "linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 100%)",
          }}
        />
      )}
      {companyName && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[2%] px-3 py-1 bg-black/70 border border-amber-400/60 rounded-sm">
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-amber-300">
            {companyName.slice(0, 20)}
          </span>
        </div>
      )}
    </div>
  );
};
