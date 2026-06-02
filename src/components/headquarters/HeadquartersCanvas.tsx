import hqImage from "@/assets/hq-building-5floor.jpg";

// ============================================================================
// Headquarters illustration
// ============================================================================
// Hand-painted 5-floor cross-section (City of Crime × 80s). The number of
// visible floors grows with employee count by cropping from the TOP — the
// ground floor (reception) is always anchored at the bottom.
// ============================================================================

interface Props {
  employees: number;
  year: number;
  quarter: number;
  companyName: string;
}

const IMAGE_FLOORS = 5;

function floorCount(employees: number): number {
  if (employees >= 41) return 5;
  if (employees >= 26) return 5;
  if (employees >= 16) return 4;
  if (employees >= 9) return 3;
  if (employees >= 4) return 2;
  return 1;
}

export const HeadquartersCanvas = ({ employees, quarter, companyName }: Props) => {
  const floors = floorCount(employees);
  // Show bottom `floors / IMAGE_FLOORS` of the image
  const visiblePct = (floors / IMAGE_FLOORS) * 100;

  // Day/night tint over the building
  const tint =
    quarter === 4 ? "rgba(20,20,60,0.35)" :
    quarter === 3 ? "rgba(255,140,60,0.10)" :
    "rgba(0,0,0,0)";

  return (
    <div
      className="relative w-full overflow-hidden rounded-md bg-[#1a1410]"
      style={{ aspectRatio: `1 / ${floors / IMAGE_FLOORS}` }}
      aria-label={companyName ? `${companyName} headquarters` : "Headquarters"}
    >
      {/* Image positioned to anchor the GROUND floor at the bottom */}
      <img
        src={hqImage}
        alt=""
        className="absolute left-0 w-full select-none pointer-events-none"
        style={{
          bottom: 0,
          height: `${(IMAGE_FLOORS / floors) * 100}%`,
        }}
        draggable={false}
      />
      {/* Day/night/sunset tint overlay */}
      {tint !== "rgba(0,0,0,0)" && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: tint }} />
      )}
      {/* Top fade so the cut is soft, not a hard slice */}
      {floors < IMAGE_FLOORS && (
        <div
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{
            height: "12%",
            background: "linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 100%)",
          }}
        />
      )}
      {/* Company sign */}
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
