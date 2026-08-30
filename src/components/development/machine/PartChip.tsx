import { PixelSprite } from './PixelSprite';
import type { PixelMatrix } from './sprites';
import { partShades, spriteColors } from './pixelPalette';
import type { SlotType } from '../partTokens';

interface PartChipProps {
  slot: SlotType;
  matrix: PixelMatrix;
  /** Rendered width as a fraction of the stage width. */
  widthPct: number;
  /** Center position as a fraction of the stage size. */
  left: number;
  top: number;
  /** Fly-in progress 0..1 (1 = snapped in place). */
  progress: number;
  ghost?: boolean;
  label: string;
  onClick?: () => void;
}

/**
 * A single installed component drawn as a crisp pixel sprite on top of the
 * chassis artwork. Purely presentational.
 */
export const PartChip = ({
  slot,
  matrix,
  widthPct,
  left,
  top,
  progress,
  ghost = false,
  label,
  onClick,
}: PartChipProps) => {
  const cols = Math.max(...matrix.map((r) => r.length));
  const rows = matrix.length;
  const s = partShades(slot);
  const colors = spriteColors(s, { W: s.bright });
  const snapped = progress >= 1;
  const offset = (1 - progress) * -18;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={!onClick}
      className="absolute -translate-x-1/2 -translate-y-1/2 p-0 bg-transparent border-0 disabled:cursor-default"
      style={{
        left: `${left * 100}%`,
        top: `${top * 100}%`,
        width: `${widthPct * 100}%`,
        transform: `translate(calc(-50% + ${offset}%), -50%)`,
        opacity: ghost ? 0.45 : 0.35 + progress * 0.65,
        filter: snapped
          ? 'drop-shadow(0 1px 2px hsl(var(--background) / 0.9))'
          : 'drop-shadow(0 0 4px hsl(var(--neon-cyan) / 0.6))',
        transition: 'opacity 90ms linear',
      }}
    >
      <svg
        viewBox={`0 0 ${cols} ${rows}`}
        className="w-full h-auto"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <PixelSprite matrix={matrix} colors={colors} x={0} y={0} />
      </svg>
    </button>
  );
};
