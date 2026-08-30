import type { PixelMatrix } from './sprites';

interface PixelSpriteProps {
  matrix: PixelMatrix;
  colors: Record<string, string>;
  x: number;
  y: number;
  opacity?: number;
  /** Integer upscale factor (nearest-neighbour, keeps the pixel grid crisp). */
  scale?: number;
}

/**
 * Renders a pixel matrix as run-length merged rects on the cell grid.
 * One matrix cell == `scale` SVG user units (the stage scales the whole grid).
 */
export const PixelSprite = ({ matrix, colors, x, y, opacity = 1, scale = 1 }: PixelSpriteProps) => {
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
        <rect
          key={`${r}-${c}`}
          x={x + c * scale}
          y={y + r * scale}
          width={len * scale}
          height={scale}
          fill={fill}
        />
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

interface PanelProps {
  x: number;
  y: number;
  w: number;
  h: number;
  shades: { bright: string; light: string; bases: string; dark: string; deep: string };
  opacity?: number;
  /** Chamfer the corners by 1px for a moulded plastic look. */
  chamfer?: boolean;
}

/**
 * Beveled plastic panel: outline, top/left highlight, bottom/right shadow.
 * This is what makes the surfaces read as shaded bitmap art instead of flat vectors.
 */
export const Panel = ({ x, y, w, h, shades, opacity = 1, chamfer = true }: PanelProps) => (
  <g opacity={opacity}>
    <Px x={x} y={y} w={w} h={h} fill={shades.deep} />
    <Px x={x + 1} y={y + 1} w={w - 2} h={h - 2} fill={shades.bases} />
    {/* top + left highlight */}
    <Px x={x + 1} y={y + 1} w={w - 2} h={1} fill={shades.bright} />
    <Px x={x + 1} y={y + 2} w={1} h={h - 4} fill={shades.light} />
    {/* bottom + right shade */}
    <Px x={x + 1} y={y + h - 2} w={w - 2} h={1} fill={shades.dark} />
    <Px x={x + w - 2} y={y + 2} w={1} h={h - 4} fill={shades.dark} />
    {chamfer && (
      <>
        <Px x={x} y={y} w={1} h={1} fill={shades.bases} />
        <Px x={x + w - 1} y={y} w={1} h={1} fill={shades.bases} />
        <Px x={x} y={y + h - 1} w={1} h={1} fill={shades.bases} />
        <Px x={x + w - 1} y={y + h - 1} w={1} h={1} fill={shades.bases} />
      </>
    )}
  </g>
);

interface DitherProps {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  opacity?: number;
  /** 2 = 50% checker, 3 = sparse, 4 = very sparse. */
  density?: number;
}

/** Ordered-dither fill — classic 16-bit shading between two tones. */
export const Dither = ({ x, y, w, h, fill, opacity = 1, density = 2 }: DitherProps) => {
  const dots: JSX.Element[] = [];
  for (let r = 0; r < h; r += 1) {
    for (let c = 0; c < w; c += 1) {
      if ((r + c) % density === 0) {
        dots.push(<rect key={`${r}-${c}`} x={x + c} y={y + r} width={1} height={1} fill={fill} />);
      }
    }
  }
  return <g opacity={opacity}>{dots}</g>;
};

interface DepthProps {
  x: number;
  y: number;
  h: number;
  depth: number;
  rise?: number;
  fill: string;
  edge?: string;
  opacity?: number;
}

/**
 * Stepped right-hand side face that fakes the 3/4 perspective of the reference art:
 * each depth column is drawn one step higher than the previous one.
 */
export const SideDepth = ({ x, y, h, depth, rise = 0.5, fill, edge, opacity = 1 }: DepthProps) => (
  <g opacity={opacity}>
    {Array.from({ length: depth }).map((_, k) => {
      const dy = Math.round(k * rise);
      return (
        <g key={k}>
          <rect x={x + k} y={y - dy} width={1} height={h} fill={fill} />
          {edge && <rect x={x + k} y={y - dy} width={1} height={1} fill={edge} />}
        </g>
      );
    })}
  </g>
);
