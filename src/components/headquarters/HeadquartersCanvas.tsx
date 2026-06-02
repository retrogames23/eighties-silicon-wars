import hqMidriseAsset from "@/assets/hq-building-5floor.jpg.asset.json";
import hqGarage from "@/assets/hq-garage.jpg";
import hqSmallOffice from "@/assets/hq-smalloffice.jpg";
import hq3Floor from "@/assets/hq-3floor.jpg";
import hq7Floor from "@/assets/hq-7floor.jpg";
import hqHighrise from "@/assets/hq-highrise.jpg";
import hq15Floor from "@/assets/hq-15floor.jpg";
import hqSkyscraper from "@/assets/hq-skyscraper.jpg";
import hqMegatower from "@/assets/hq-megatower.jpg";

// ============================================================================
// Headquarters illustration
// ============================================================================
// Hand-painted 80s cross-section. Nine building tiers scale with employee
// count. Within each tier we reveal more floors from the BOTTOM up as the team
// grows, so the entrance always anchors the bottom edge.
// ============================================================================

interface Props {
  employees: number;
  year: number;
  quarter: number;
  companyName: string;
}

type Tier = {
  src: string;
  totalFloors: number;     // floors painted in the source image
  minEmployees: number;
  maxEmployees: number;    // employees needed to reveal ALL floors
  aspect: number;          // full-image height / width
};

const TIERS: Tier[] = [
  { src: hqGarage,           totalFloors: 1,  minEmployees: 0,   maxEmployees: 3,   aspect: 0.80 },
  { src: hqSmallOffice,      totalFloors: 2,  minEmployees: 4,   maxEmployees: 8,   aspect: 1.00 },
  { src: hq3Floor,           totalFloors: 3,  minEmployees: 9,   maxEmployees: 15,  aspect: 1.00 },
  { src: hqMidriseAsset.url, totalFloors: 5,  minEmployees: 16,  maxEmployees: 28,  aspect: 1.00 },
  { src: hq7Floor,           totalFloors: 7,  minEmployees: 29,  maxEmployees: 45,  aspect: 1.36 },
  { src: hqHighrise,         totalFloors: 10, minEmployees: 46,  maxEmployees: 70,  aspect: 1.83 },
  { src: hq15Floor,          totalFloors: 15, minEmployees: 71,  maxEmployees: 110, aspect: 2.18 },
  { src: hqSkyscraper,       totalFloors: 20, minEmployees: 111, maxEmployees: 170, aspect: 2.60 },
  { src: hqMegatower,        totalFloors: 30, minEmployees: 171, maxEmployees: 350, aspect: 3.33 },
];

function pickTier(employees: number): Tier {
  for (const t of TIERS) if (employees <= t.maxEmployees) return t;
  return TIERS[TIERS.length - 1];
}

function visibleFloors(tier: Tier, employees: number): number {
  if (tier.totalFloors === 1) return 1;
  const span = tier.maxEmployees - tier.minEmployees;
  const clamped = Math.max(0, Math.min(span, employees - tier.minEmployees));
  const floors = 1 + Math.round((clamped / Math.max(1, span)) * (tier.totalFloors - 1));
  return Math.max(1, Math.min(tier.totalFloors, floors));
}

export const HeadquartersCanvas = ({ employees, quarter, companyName }: Props) => {
  const tier = pickTier(employees);
  const floors = visibleFloors(tier, employees);
  const ratio = floors / tier.totalFloors;

  const tint =
    quarter === 4 ? "rgba(20,20,60,0.35)" :
    quarter === 3 ? "rgba(255,140,60,0.10)" :
    "rgba(0,0,0,0)";

  return (
    <div
      className="relative w-full overflow-hidden rounded-md bg-[#1a1410]"
      style={{ aspectRatio: `${1} / ${tier.aspect * ratio}` }}
      aria-label={companyName ? `${companyName} headquarters` : "Headquarters"}
    >
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
