import type { PixelMatrix } from './sprites';

interface PixelSpriteProps {
  matrix: PixelMatrix;
  colors: Record<string, string>;
  x: number;
  y: number;
  opacity?: number;
}

/**
 * Renders a pixel matrix as run-length merged rects on the cell grid.
 * One matrix cell == one SVG user unit (the stage scales the whole grid).
 */
export const PixelSprite = ({ matrix, colors, x, y, opacity = 1 }: PixelSpriteProps) => {
  const rects: JSX.Element[] = [];

  matrix.forEach((row, r) => {
    let c = 0;
    while (c < row.length) {
      const ch = row[c];
      const fill = colors[ch];
      if (!fill) {
        c += 1;
        continue;
      }
      let len = 1;
      while (c + len < row.length && row[c + len] === ch) len += 1;
      rects.push(
        <rect key={`${r}-${c}`} x={x + c} y={y + r} width={len} height={1} fill={fill} />
      );
      c += len;
    }
  });

  return <g opacity={opacity}>{rects}</g>;
};

interface PxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  opacity?: number;
}

/** Axis-aligned pixel block helper for larger structures (case, monitor, keyboard). */
export const Px = ({ x, y, w, h, fill, opacity }: PxProps) => (
  <rect x={x} y={y} width={w} height={h} fill={fill} opacity={opacity} />
);
