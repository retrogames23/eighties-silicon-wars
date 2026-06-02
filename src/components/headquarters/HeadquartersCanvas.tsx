import { useEffect, useRef } from "react";

// ============================================================================
// Pixel-Art Headquarters Canvas (Sim Tower × City of Crime, 80s palette)
// ============================================================================
// Logical resolution is fixed; CSS scales it up with image-rendering: pixelated
// so the result stays crisp on retina displays. Detail-density is high:
// wood wainscoting, wallpaper, ceiling lamps with light cones, hanging plants,
// wall-art clusters (clocks, maps, frames, certificates), bookshelves,
// water coolers, baseboards, varied room contents.
// ============================================================================

const S = 4;                     // resolution multiplier
const TILE = 8;
const FLOOR_TILES_W = 40;        // wider building → more room for clutter
const FLOOR_TILES_H = 9;         // TALLER floors → more wall surface for decor
const FLOOR_H = FLOOR_TILES_H * TILE; // 72 px
const BUILDING_W = FLOOR_TILES_W * TILE; // 320 px
const GROUND_H = 18;
const SKY_H = 44;
const STAIR_W = 26;
const MAX_FLOORS = 7;
const MAX_VISIBLE_SPRITES = 30;

// ---------------------------------------------------------------------------
// Palettes (era-driven: 1980 → 2000+)
// ---------------------------------------------------------------------------
interface Palette {
  skyTop: string; skyBot: string;
  ground: string; grass: string;
  facade: string; facadeDark: string; facadeLight: string;
  wall: string; wallShade: string; wallPattern: string;
  wainscot: string; wainscotTrim: string;
  ceiling: string; ceilingBeam: string;
  floor: string; floorShade: string; carpet: string; carpetAlt: string;
  windowGlass: string; windowFrame: string;
  door: string; doorTrim: string;
  desk: string; deskShade: string;
  signBg: string; signFg: string;
  metal: string; metalDark: string;
  accentNeon: string;
}

function getPalette(year: number, quarter: number): Palette {
  let skyTop = "#7ec0ee", skyBot = "#c9e6f7";
  if (quarter === 3) { skyTop = "#f78c4a"; skyBot = "#ffd28a"; }
  if (quarter === 4) { skyTop = "#0b1a3a"; skyBot = "#2b1d4a"; }

  if (year < 1985) {
    return {
      skyTop, skyBot,
      ground: "#6b4f2a", grass: "#4a7a3a",
      facade: "#b58a5a", facadeDark: "#7c5a35", facadeLight: "#d4ad7a",
      wall: "#e8d0a8", wallShade: "#c9b088", wallPattern: "#d4b890",
      wainscot: "#6a3f22", wainscotTrim: "#4a2a18",
      ceiling: "#f0e0c0", ceilingBeam: "#7a5a3a",
      floor: "#7a5a3a", floorShade: "#5a4028", carpet: "#a83a3a", carpetAlt: "#7a2828",
      windowGlass: "#9ed1ff", windowFrame: "#3a2a1a",
      door: "#5a3a1f", doorTrim: "#3a2410",
      desk: "#8a5a2a", deskShade: "#5a3a18",
      signBg: "#2a1a0a", signFg: "#ffcf3a",
      metal: "#b8b8b0", metalDark: "#6a6a60",
      accentNeon: "#ff6ad5",
    };
  }
  if (year < 1992) {
    return {
      skyTop, skyBot,
      ground: "#5a5a5a", grass: "#5a8a4a",
      facade: "#9aa5b5", facadeDark: "#5a6878", facadeLight: "#c5cdd8",
      wall: "#dce4d8", wallShade: "#a8b0a4", wallPattern: "#c8d0c4",
      wainscot: "#4a5560", wainscotTrim: "#2a3038",
      ceiling: "#e8eef0", ceilingBeam: "#3a4450",
      floor: "#5a5a6a", floorShade: "#3a3a48", carpet: "#3a6ab0", carpetAlt: "#2a4a80",
      windowGlass: "#a8d8ff", windowFrame: "#2a2a3a",
      door: "#3a4a5a", doorTrim: "#1a2230",
      desk: "#8a6a3a", deskShade: "#5a4020",
      signBg: "#1a1a2a", signFg: "#39ff88",
      metal: "#b0b8c0", metalDark: "#5a6068",
      accentNeon: "#39ff88",
    };
  }
  return {
    skyTop, skyBot,
    ground: "#4a4a4a", grass: "#3a6a3a",
    facade: "#3a4a5a", facadeDark: "#1f2a38", facadeLight: "#6a7a8a",
    wall: "#f4f4f4", wallShade: "#c8ccd2", wallPattern: "#e0e0e6",
    wainscot: "#2a2f38", wainscotTrim: "#15181e",
    ceiling: "#f8f8f8", ceilingBeam: "#2a2f38",
    floor: "#2a2f38", floorShade: "#15181e", carpet: "#1a2230", carpetAlt: "#0e131c",
    windowGlass: "#5dd5ff", windowFrame: "#1a1f28",
    door: "#1a1a1a", doorTrim: "#000000",
    desk: "#5a4a3a", deskShade: "#3a2a1f",
    signBg: "#000000", signFg: "#00d9ff",
    metal: "#a0a8b0", metalDark: "#4a5058",
    accentNeon: "#00d9ff",
  };
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
type RoomKind =
  | "reception"
  | "office"
  | "openSpace"
  | "meeting"
  | "kitchen"
  | "dev"
  | "kicker"
  | "arcade"
  | "executive";

interface Room {
  kind: RoomKind;
  startTile: number;
  widthTiles: number;
}
interface Floor {
  rooms: Room[];
  capacity: number;
}

function buildLayout(employees: number): Floor[] {
  const thresholds: { min: number; rooms: RoomKind[]; capacity: number }[] = [
    { min: 0,  rooms: ["reception", "office"],            capacity: 3 },
    { min: 4,  rooms: ["openSpace", "openSpace"],         capacity: 6 },
    { min: 9,  rooms: ["meeting", "kitchen"],             capacity: 4 },
    { min: 16, rooms: ["dev", "dev"],                     capacity: 6 },
    { min: 26, rooms: ["kicker", "openSpace"],            capacity: 5 },
    { min: 41, rooms: ["arcade", "openSpace"],            capacity: 5 },
    { min: 61, rooms: ["executive", "openSpace"],         capacity: 4 },
  ];
  const floors: Floor[] = [];
  for (const t of thresholds) {
    if (employees >= t.min) {
      const rooms: Room[] = [];
      const each = Math.floor(FLOOR_TILES_W / t.rooms.length);
      t.rooms.forEach((kind, i) => {
        rooms.push({
          kind,
          startTile: i * each,
          widthTiles: i === t.rooms.length - 1 ? FLOOR_TILES_W - i * each : each,
        });
      });
      floors.push({ rooms, capacity: t.capacity });
    }
    if (floors.length >= MAX_FLOORS) break;
  }
  return floors;
}

// ---------------------------------------------------------------------------
// Sprites
// ---------------------------------------------------------------------------
type Role = "worker" | "developer" | "manager";
interface Sprite {
  id: number;
  role: Role;
  floor: number;
  x: number;
  y: number;
  targetX: number;
  targetFloor: number;
  state: "walking" | "idle";
  stateUntil: number;
  frame: 0 | 1;
  frameAt: number;
  dir: -1 | 1;
}
function roleColor(role: Role): { shirt: string; pants: string; accent: string } {
  if (role === "developer") return { shirt: "#7a4ad4", pants: "#22264a", accent: "#39ff88" };
  if (role === "manager")   return { shirt: "#d44a4a", pants: "#3a1a1a", accent: "#ffcf3a" };
  return { shirt: "#4a7ad4", pants: "#22324a", accent: "#ffffff" };
}

// ---------------------------------------------------------------------------
// RNG
// ---------------------------------------------------------------------------
function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 1000) / 1000;
  };
}

// ---------------------------------------------------------------------------
// Drawing primitives
// ---------------------------------------------------------------------------
function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x * S, y * S, w * S, h * S);
}

function parseHex(h: string): [number, number, number] {
  const v = h.replace("#", "");
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}
function lerpColor(a: string, b: string, t: number): string {
  const pa = parseHex(a), pb = parseHex(b);
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return `rgb(${r},${g},${bl})`;
}
function lighten(hex: string, t: number): string {
  let r: number, g: number, b: number;
  if (hex.startsWith("#")) { [r, g, b] = parseHex(hex); }
  else {
    const m = hex.match(/\d+/g); if (!m) return hex;
    [r, g, b] = [parseInt(m[0]), parseInt(m[1]), parseInt(m[2])];
  }
  r = Math.round(r + (255 - r) * t);
  g = Math.round(g + (255 - g) * t);
  b = Math.round(b + (255 - b) * t);
  return `rgb(${r},${g},${b})`;
}

function drawBackground(ctx: CanvasRenderingContext2D, W: number, groundY: number, p: Palette, quarter: number) {
  const bands = 12;
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    const c = lerpColor(p.skyTop, p.skyBot, t);
    px(ctx, 0, (groundY * i) / bands, W, groundY / bands + 1, c);
  }
  if (quarter === 4) {
    const r = rng(42);
    for (let i = 0; i < 60; i++) {
      px(ctx, Math.floor(r() * W), Math.floor(r() * Math.min(SKY_H, groundY)), 1, 1, "#ffffff");
    }
  }
  // distant city silhouette
  const skylineY = groundY - 24;
  const r2 = rng(99);
  let x = 0;
  while (x < W) {
    const w = 8 + Math.floor(r2() * 16);
    const h = 8 + Math.floor(r2() * 18);
    const color = quarter === 4 ? "#1a1a2e" : quarter === 3 ? "#6a4a5a" : "#5a7a9a";
    px(ctx, x, skylineY - h, w, h + 4, color);
    // windows lit at night
    if (quarter === 4) {
      for (let wy = 2; wy < h - 2; wy += 3) {
        for (let wx = 1; wx < w - 1; wx += 3) {
          if (r2() > 0.55) px(ctx, x + wx, skylineY - h + wy, 1, 1, "#ffcf3a");
        }
      }
    }
    x += w + 1;
  }
  if (quarter === 3) px(ctx, W - 40, 10, 10, 10, "#ffe49a");
  else if (quarter === 4) {
    px(ctx, W - 36, 8, 8, 8, "#e8e8f0");
    px(ctx, W - 34, 10, 4, 4, p.skyTop);
  }
}

function drawGround(ctx: CanvasRenderingContext2D, W: number, groundY: number, p: Palette) {
  px(ctx, 0, groundY, W, GROUND_H, p.ground);
  px(ctx, 0, groundY, W, 2, p.grass);
  const r = rng(7);
  for (let i = 0; i < 32; i++) {
    px(ctx, Math.floor(r() * W), groundY + 2 + Math.floor(r() * 5), 1, 1, "#2f5a2a");
  }
  // sidewalk slabs
  for (let i = 0; i < W; i += 12) {
    px(ctx, i, groundY + 6, 1, 4, "#3a3a3a");
  }
}

function drawSign(ctx: CanvasRenderingContext2D, x: number, y: number, name: string, p: Palette) {
  const text = name.slice(0, 18).toUpperCase();
  const fontPx = 11;
  ctx.font = `bold ${fontPx * S}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const measured = ctx.measureText(text).width;
  const padX = 8;
  const wLogical = Math.max(40, measured / S + padX * 2);
  const hLogical = 14;
  px(ctx, x - wLogical / 2, y, wLogical, hLogical, p.signBg);
  px(ctx, x - wLogical / 2, y, wLogical, 1, p.signFg);
  px(ctx, x - wLogical / 2, y + hLogical - 1, wLogical, 1, p.signFg);
  px(ctx, x - wLogical / 2, y, 1, hLogical, p.signFg);
  px(ctx, x + wLogical / 2 - 1, y, 1, hLogical, p.signFg);
  ctx.fillStyle = p.signFg;
  ctx.fillText(text, x * S, (y + hLogical / 2) * S);
}

function drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number, p: Palette, lit: boolean) {
  const W = 20, H = 22;
  // outer molding
  px(ctx, x - 2, y - 2, W + 4, 2, p.wainscot);
  px(ctx, x - 2, y + H, W + 4, 2, p.wainscot);
  px(ctx, x - 1, y + H + 1, W + 2, 1, p.facadeDark);
  // frame
  px(ctx, x, y, W, H, p.windowFrame);
  // glass
  const glass = lit ? "#ffe49a" : p.windowGlass;
  px(ctx, x + 1, y + 1, W - 2, H - 2, glass);
  px(ctx, x + 1, y + 1, W - 2, (H - 2) * 0.42, lit ? "#fff1b8" : lighten(glass, 0.3));
  // mullions
  px(ctx, x + W / 2 - 0.5, y + 1, 1, H - 2, p.windowFrame);
  px(ctx, x + 1, y + H / 2 - 0.5, W - 2, 1, p.windowFrame);
  // curtain top tie
  px(ctx, x - 1, y - 3, 3, 3, p.carpet);
  px(ctx, x + W - 2, y - 3, 3, 3, p.carpet);
}

// --- decor primitives ---------------------------------------------------------

function drawWallpaper(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, p: Palette, seed: number) {
  const r = rng(seed);
  // base wall
  px(ctx, x, y, w, h, p.wall);
  // vertical stripes OR dots, alternating by seed
  const mode = Math.floor(r() * 3);
  if (mode === 0) {
    for (let sx = x + 3; sx < x + w; sx += 6) {
      px(ctx, sx, y, 1, h, p.wallPattern);
    }
  } else if (mode === 1) {
    for (let sy = y + 4; sy < y + h; sy += 6) {
      for (let sx = x + 3; sx < x + w; sx += 6) {
        px(ctx, sx, sy, 1, 1, p.wallPattern);
      }
    }
  } else {
    // diamond
    for (let sy = y + 4; sy < y + h; sy += 8) {
      for (let sx = x + 4 + ((sy / 4) % 2) * 4; sx < x + w; sx += 8) {
        px(ctx, sx, sy, 1, 1, p.wallPattern);
        px(ctx, sx - 1, sy + 1, 1, 1, p.wallPattern);
        px(ctx, sx + 1, sy + 1, 1, 1, p.wallPattern);
        px(ctx, sx, sy + 2, 1, 1, p.wallPattern);
      }
    }
  }
}

function drawWainscot(ctx: CanvasRenderingContext2D, x: number, baseY: number, w: number, p: Palette) {
  // lower 18px wood paneling
  const h = 18;
  px(ctx, x, baseY - h, w, h, p.wainscot);
  // vertical panel grooves
  for (let sx = x + 6; sx < x + w; sx += 6) {
    px(ctx, sx, baseY - h + 1, 1, h - 2, p.wainscotTrim);
  }
  // top rail (chair rail)
  px(ctx, x, baseY - h - 1, w, 1, p.wainscotTrim);
  px(ctx, x, baseY - h, w, 1, lighten(p.wainscot, 0.15));
  // baseboard
  px(ctx, x, baseY - 2, w, 2, p.wainscotTrim);
}

function drawCeilingBeam(ctx: CanvasRenderingContext2D, x: number, topY: number, w: number, p: Palette) {
  px(ctx, x, topY, w, 3, p.ceilingBeam);
  px(ctx, x, topY + 3, w, 1, lighten(p.ceilingBeam, 0.2));
}

function drawCeilingLamp(ctx: CanvasRenderingContext2D, x: number, topY: number, p: Palette, lit: boolean) {
  // cord
  px(ctx, x, topY + 3, 1, 4, "#1a1a1a");
  // shade (cone)
  px(ctx, x - 3, topY + 7, 7, 1, p.metalDark);
  px(ctx, x - 2, topY + 8, 5, 1, p.metal);
  px(ctx, x - 1, topY + 9, 3, 1, p.metal);
  // bulb
  if (lit) {
    px(ctx, x, topY + 10, 1, 1, "#fff7c4");
    // light cone (semi-transparent)
    ctx.fillStyle = "rgba(255,228,154,0.10)";
    ctx.beginPath();
    ctx.moveTo((x + 0.5) * S, (topY + 10) * S);
    ctx.lineTo((x - 7) * S, (topY + 24) * S);
    ctx.lineTo((x + 8) * S, (topY + 24) * S);
    ctx.closePath();
    ctx.fill();
  }
}

function drawHangingPlant(ctx: CanvasRenderingContext2D, x: number, topY: number) {
  // rope
  px(ctx, x, topY + 3, 1, 3, "#3a2a1a");
  px(ctx, x + 5, topY + 3, 1, 3, "#3a2a1a");
  // pot
  px(ctx, x - 1, topY + 6, 8, 3, "#8a4a2a");
  px(ctx, x - 1, topY + 6, 8, 1, "#6a3520");
  // hanging leaves
  px(ctx, x - 2, topY + 9, 10, 2, "#2f7a3a");
  px(ctx, x - 1, topY + 11, 3, 4, "#2f7a3a");
  px(ctx, x + 2, topY + 11, 2, 3, "#3fa04a");
  px(ctx, x + 5, topY + 11, 3, 5, "#2f7a3a");
  px(ctx, x + 1, topY + 14, 1, 2, "#3fa04a");
  px(ctx, x + 6, topY + 15, 1, 2, "#3fa04a");
}

function drawFrame(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, art: number) {
  px(ctx, x, y, w, h, "#2a1810");
  px(ctx, x + 1, y + 1, w - 2, h - 2, "#5a3a20");
  px(ctx, x + 2, y + 2, w - 4, h - 4, "#000");
  // mini art
  if (art === 0) {
    // sunset/landscape
    px(ctx, x + 2, y + 2, w - 4, Math.floor((h - 4) * 0.5), "#ff8a4a");
    px(ctx, x + 2, y + 2 + Math.floor((h - 4) * 0.5), w - 4, Math.ceil((h - 4) * 0.5), "#2a4a7a");
    px(ctx, x + Math.floor(w / 2), y + 2 + Math.floor((h - 4) * 0.3), 2, 2, "#ffe49a");
  } else if (art === 1) {
    // abstract grid
    for (let i = 0; i < w - 4; i += 2)
      for (let j = 0; j < h - 4; j += 2)
        if ((i + j) % 4 === 0) px(ctx, x + 2 + i, y + 2 + j, 1, 1, "#39ff88");
  } else if (art === 2) {
    // portrait
    px(ctx, x + 2, y + 2, w - 4, h - 4, "#3a4a6a");
    px(ctx, x + Math.floor(w / 2) - 1, y + 3, 2, 3, "#f4c79a");
    px(ctx, x + Math.floor(w / 2) - 2, y + 6, 4, 3, "#1a1a1a");
  } else {
    // mountains
    px(ctx, x + 2, y + 2, w - 4, h - 4, "#8ac8e8");
    px(ctx, x + 2, y + h - 6, 3, 4, "#3a3a3a");
    px(ctx, x + 5, y + h - 8, 4, 6, "#5a5a5a");
    px(ctx, x + 8, y + h - 7, 3, 5, "#3a3a3a");
  }
}

function drawClock(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // round wall clock
  px(ctx, x, y, 9, 1, "#1a1a1a");
  px(ctx, x, y + 8, 9, 1, "#1a1a1a");
  px(ctx, x, y, 1, 9, "#1a1a1a");
  px(ctx, x + 8, y, 1, 9, "#1a1a1a");
  px(ctx, x + 1, y + 1, 7, 7, "#f8f4e8");
  // marks
  px(ctx, x + 4, y + 1, 1, 1, "#1a1a1a");
  px(ctx, x + 4, y + 7, 1, 1, "#1a1a1a");
  px(ctx, x + 1, y + 4, 1, 1, "#1a1a1a");
  px(ctx, x + 7, y + 4, 1, 1, "#1a1a1a");
  // hands
  px(ctx, x + 4, y + 2, 1, 2, "#1a1a1a");
  px(ctx, x + 4, y + 4, 2, 1, "#1a1a1a");
}

function drawWorldMap(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x, y, 22, 14, "#5a4028");
  px(ctx, x + 1, y + 1, 20, 12, "#cde6f0");
  // continents (abstract blobs)
  px(ctx, x + 2, y + 3, 5, 3, "#7a9a5a");
  px(ctx, x + 8, y + 2, 4, 5, "#7a9a5a");
  px(ctx, x + 13, y + 4, 3, 2, "#7a9a5a");
  px(ctx, x + 14, y + 7, 5, 4, "#7a9a5a");
  px(ctx, x + 3, y + 8, 3, 3, "#7a9a5a");
  // pins
  px(ctx, x + 10, y + 5, 1, 1, "#ff3a3a");
  px(ctx, x + 16, y + 8, 1, 1, "#ff3a3a");
}

function drawCorkBoard(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x, y, 16, 12, "#5a3a20");
  px(ctx, x + 1, y + 1, 14, 10, "#b88a5a");
  // pinned notes
  px(ctx, x + 2, y + 2, 4, 3, "#fff8c4");
  px(ctx, x + 7, y + 2, 4, 4, "#c4e4ff");
  px(ctx, x + 11, y + 4, 3, 3, "#ffc4c4");
  px(ctx, x + 2, y + 6, 5, 4, "#fff8c4");
  px(ctx, x + 8, y + 7, 6, 3, "#d4ffc4");
  // pins
  px(ctx, x + 3, y + 2, 1, 1, "#ff3a3a");
  px(ctx, x + 8, y + 2, 1, 1, "#ff3a3a");
  px(ctx, x + 9, y + 7, 1, 1, "#3a3aff");
}

function drawCertificate(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x, y, 12, 10, "#3a2a18");
  px(ctx, x + 1, y + 1, 10, 8, "#f8f0d8");
  // text lines
  px(ctx, x + 2, y + 3, 8, 1, "#3a3a3a");
  px(ctx, x + 3, y + 5, 6, 1, "#3a3a3a");
  // seal
  px(ctx, x + 9, y + 7, 2, 2, "#c4842a");
}

function drawWantedPoster(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x, y, 10, 14, "#d4ad7a");
  px(ctx, x + 1, y + 1, 8, 2, "#1a1a1a"); // WANTED bar
  px(ctx, x + 1, y + 4, 8, 6, "#3a3a3a"); // face area
  px(ctx, x + 3, y + 5, 4, 4, "#7a5a3a");
  px(ctx, x + 1, y + 11, 8, 2, "#1a1a1a"); // $ bar
  px(ctx, x + 4, y + 12, 2, 1, "#ffcf3a");
}

function drawSynthwavePoster(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x, y, 12, 14, "#1a1a1a");
  px(ctx, x + 1, y + 1, 10, 6, "#1a1a3a");
  // sun
  px(ctx, x + 4, y + 2, 4, 4, "#ff3a8a");
  px(ctx, x + 5, y + 3, 2, 2, "#ffcf3a");
  // horizon lines
  for (let i = 0; i < 5; i++) {
    px(ctx, x + 1, y + 7 + i, 10, 1, i % 2 === 0 ? "#ff3a8a" : "#1a1a3a");
  }
  // grid lines (perspective)
  px(ctx, x + 1, y + 8, 10, 1, "#5dd5ff");
  px(ctx, x + 1, y + 11, 10, 1, "#5dd5ff");
}

function drawWallDecorCluster(ctx: CanvasRenderingContext2D, x0: number, topY: number, w: number, seed: number, p: Palette) {
  // ~3-5 decor items on the upper wall band, seeded by floor+room
  const r = rng(seed);
  const decorY = topY + 6;
  const slots = 4;
  const slotW = w / slots;
  const variants = 7;
  for (let i = 0; i < slots; i++) {
    const cx = x0 + slotW * (i + 0.5);
    const v = Math.floor(r() * variants);
    const skip = r() < 0.18;
    if (skip) continue;
    if (v === 0) drawFrame(ctx, cx - 6, decorY, 13, 10, Math.floor(r() * 4));
    else if (v === 1) drawClock(ctx, cx - 4, decorY);
    else if (v === 2) drawWorldMap(ctx, cx - 11, decorY - 2);
    else if (v === 3) drawCorkBoard(ctx, cx - 8, decorY - 1);
    else if (v === 4) drawCertificate(ctx, cx - 6, decorY);
    else if (v === 5) drawWantedPoster(ctx, cx - 5, decorY - 2);
    else drawSynthwavePoster(ctx, cx - 6, decorY - 2);
  }
}

// --- furniture ---------------------------------------------------------------

function drawDesk(ctx: CanvasRenderingContext2D, x: number, baseY: number, p: Palette, era: number) {
  px(ctx, x, baseY - 8, 16, 5, p.desk);
  px(ctx, x, baseY - 3, 16, 1, p.deskShade);
  px(ctx, x + 1, baseY - 3, 1, 5, p.deskShade);
  px(ctx, x + 14, baseY - 3, 1, 5, p.deskShade);
  // drawer detail
  px(ctx, x + 2, baseY - 7, 4, 3, lighten(p.desk, 0.1));
  px(ctx, x + 3, baseY - 6, 1, 1, p.metalDark);
  // Monitor
  if (era === 0) {
    px(ctx, x + 3, baseY - 16, 10, 8, "#d8c89a");
    px(ctx, x + 4, baseY - 15, 8, 6, "#5dd5ff");
    px(ctx, x + 5, baseY - 8, 6, 1, "#9a8a6a");
  } else if (era === 1) {
    px(ctx, x + 3, baseY - 16, 10, 8, "#9aa5b0");
    px(ctx, x + 4, baseY - 15, 8, 6, "#39ff88");
    px(ctx, x + 5, baseY - 8, 6, 1, "#5a6878");
  } else {
    px(ctx, x + 3, baseY - 14, 10, 7, "#1a1a1a");
    px(ctx, x + 4, baseY - 13, 8, 5, "#5dd5ff");
    px(ctx, x + 7, baseY - 8, 2, 2, "#2a2a2a");
  }
  // Keyboard + mouse + papers
  px(ctx, x + 2, baseY - 9, 9, 1, "#e0e0e0");
  px(ctx, x + 12, baseY - 9, 2, 1, "#c0c0c0");
  px(ctx, x, baseY - 9, 2, 1, "#fff8c4"); // paper
  px(ctx, x, baseY - 8, 2, 1, "#fff8c4");
  // coffee mug
  px(ctx, x + 14, baseY - 11, 2, 3, "#d44a4a");
  px(ctx, x + 13, baseY - 10, 1, 1, "#d44a4a");
}

function drawOfficeChair(ctx: CanvasRenderingContext2D, x: number, baseY: number) {
  // backrest
  px(ctx, x, baseY - 10, 5, 7, "#2a2a2a");
  px(ctx, x + 1, baseY - 9, 3, 5, "#3a3a3a");
  // seat
  px(ctx, x - 1, baseY - 4, 7, 2, "#2a2a2a");
  // stem
  px(ctx, x + 2, baseY - 2, 1, 2, "#1a1a1a");
  // base
  px(ctx, x, baseY, 5, 1, "#1a1a1a");
  px(ctx, x - 1, baseY - 1, 7, 1, "#1a1a1a");
}

function drawPlant(ctx: CanvasRenderingContext2D, x: number, baseY: number) {
  px(ctx, x, baseY - 5, 8, 5, "#8a4a2a");
  px(ctx, x, baseY - 4, 8, 1, "#6a3a20");
  px(ctx, x - 2, baseY - 12, 12, 7, "#2f7a3a");
  px(ctx, x, baseY - 15, 8, 4, "#3fa04a");
  px(ctx, x + 2, baseY - 17, 4, 3, "#56b85a");
}

function drawBigPlant(ctx: CanvasRenderingContext2D, x: number, baseY: number) {
  // tall floor plant
  px(ctx, x, baseY - 6, 10, 6, "#7a3a20");
  px(ctx, x, baseY - 5, 10, 1, "#5a2a18");
  // leaves fanning out
  px(ctx, x - 3, baseY - 14, 16, 8, "#2f7a3a");
  px(ctx, x - 1, baseY - 20, 12, 6, "#3fa04a");
  px(ctx, x + 2, baseY - 24, 6, 4, "#56b85a");
  px(ctx, x - 4, baseY - 10, 3, 4, "#2f7a3a");
  px(ctx, x + 11, baseY - 10, 3, 4, "#2f7a3a");
}

function drawWhiteboard(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x, y, 22, 12, "#dddddd");
  px(ctx, x, y, 22, 1, "#7a7a7a");
  px(ctx, x, y + 11, 22, 1, "#9a9a9a");
  // diagrams
  px(ctx, x + 2, y + 3, 5, 1, "#1a1a1a");
  px(ctx, x + 2, y + 5, 8, 1, "#ff3a3a");
  px(ctx, x + 2, y + 7, 6, 1, "#3a3aff");
  px(ctx, x + 11, y + 3, 9, 6, "#1a1a1a");
  px(ctx, x + 12, y + 4, 7, 4, "#dddddd");
  // arrow
  px(ctx, x + 13, y + 5, 5, 1, "#ff3a3a");
  px(ctx, x + 17, y + 4, 1, 3, "#ff3a3a");
}

function drawBookshelf(ctx: CanvasRenderingContext2D, x: number, baseY: number, h: number) {
  // tall shelf
  px(ctx, x, baseY - h, 14, h, "#5a3a20");
  px(ctx, x + 1, baseY - h + 1, 12, h - 2, "#3a2010");
  // shelves
  const shelves = Math.floor(h / 8);
  const colors = ["#d44a4a", "#3a8ad4", "#3fa04a", "#ffcf3a", "#7a4ad4", "#ff8a3a", "#1a1a1a"];
  const r = rng(x * 7 + h);
  for (let i = 0; i < shelves; i++) {
    const sy = baseY - h + 2 + i * 8;
    // shelf board
    px(ctx, x + 1, sy + 5, 12, 1, "#5a3a20");
    // books
    let bx = x + 2;
    while (bx < x + 13) {
      const bw = 1 + Math.floor(r() * 2);
      const bh = 4 + Math.floor(r() * 2);
      px(ctx, bx, sy + 6 - bh, bw, bh, colors[Math.floor(r() * colors.length)]);
      bx += bw + 1;
    }
  }
}

function drawCoffee(ctx: CanvasRenderingContext2D, x: number, baseY: number) {
  px(ctx, x, baseY - 9, 10, 9, "#3a3a3a");
  px(ctx, x + 1, baseY - 8, 8, 2, "#1a1a1a");
  px(ctx, x + 2, baseY - 5, 6, 4, "#5a3a20");
  px(ctx, x + 3, baseY - 4, 4, 2, "#1a1a1a");
  px(ctx, x + 7, baseY - 7, 1, 1, "#ff3a3a");
  px(ctx, x + 1, baseY - 11, 1, 2, "#fff");
  px(ctx, x + 8, baseY - 11, 1, 2, "#fff");
}

function drawServerRack(ctx: CanvasRenderingContext2D, x: number, baseY: number, t: number) {
  const h = 28;
  px(ctx, x, baseY - h, 12, h, "#1a1a1a");
  px(ctx, x, baseY - h, 12, 1, "#3a3a3a");
  for (let i = 0; i < 8; i++) {
    const y = baseY - h + 1 + i * 3;
    px(ctx, x + 1, y, 10, 2, "#2a2a2a");
    const blink = Math.floor((t / 200 + i) % 3);
    px(ctx, x + 2, y, 1, 1, blink === 0 ? "#ff3a3a" : "#39ff88");
    px(ctx, x + 4, y, 1, 1, blink === 1 ? "#ffcf3a" : "#2a2a2a");
    px(ctx, x + 9, y, 1, 1, blink === 2 ? "#39ff88" : "#2a2a2a");
  }
}

function drawCouch(ctx: CanvasRenderingContext2D, x: number, baseY: number) {
  px(ctx, x, baseY - 8, 22, 8, "#7a3a3a");
  px(ctx, x, baseY - 12, 22, 4, "#9a4a4a");
  px(ctx, x, baseY - 12, 3, 12, "#5a2a2a");
  px(ctx, x + 19, baseY - 12, 3, 12, "#5a2a2a");
  // cushions seam
  px(ctx, x + 7, baseY - 11, 1, 4, "#5a2a2a");
  px(ctx, x + 14, baseY - 11, 1, 4, "#5a2a2a");
  // legs
  px(ctx, x + 1, baseY - 1, 2, 1, "#1a1a1a");
  px(ctx, x + 19, baseY - 1, 2, 1, "#1a1a1a");
}

function drawCoffeeTable(ctx: CanvasRenderingContext2D, x: number, baseY: number) {
  px(ctx, x, baseY - 4, 14, 2, "#3a2a18");
  px(ctx, x + 1, baseY - 2, 1, 2, "#3a2a18");
  px(ctx, x + 12, baseY - 2, 1, 2, "#3a2a18");
  // magazine
  px(ctx, x + 3, baseY - 5, 6, 1, "#d44a4a");
}

function drawKicker(ctx: CanvasRenderingContext2D, x: number, baseY: number, t: number) {
  px(ctx, x, baseY - 12, 32, 10, "#2a4a8a");
  px(ctx, x + 1, baseY - 11, 30, 8, "#3fa04a");
  // field lines
  px(ctx, x + 16, baseY - 11, 1, 8, "#fff");
  for (let i = 0; i < 4; i++) {
    px(ctx, x + 3 + i * 7, baseY - 13, 1, 11, "#cccccc");
  }
  const phase = Math.floor(t / 200) % 2;
  for (let i = 0; i < 4; i++) {
    px(ctx, x + 2 + i * 7, baseY - 10 + phase, 4, 2, i % 2 ? "#ff3a3a" : "#3a3aff");
  }
  px(ctx, x + 2, baseY - 2, 2, 2, "#1a1a1a");
  px(ctx, x + 28, baseY - 2, 2, 2, "#1a1a1a");
}

function drawArcade(ctx: CanvasRenderingContext2D, x: number, baseY: number, t: number, variant: number) {
  const body = variant === 0 ? "#d44a4a" : variant === 1 ? "#3a3ad4" : "#ffcf3a";
  px(ctx, x, baseY - 28, 14, 28, body);
  px(ctx, x + 1, baseY - 27, 12, 2, "#ffffff");
  // marquee text bar
  px(ctx, x + 1, baseY - 25, 12, 1, "#1a1a1a");
  // screen
  px(ctx, x + 2, baseY - 24, 10, 9, "#000000");
  const blink = Math.floor(t / 250) % 4;
  if (variant === 0) {
    px(ctx, x + 4, baseY - 21, 2, 2, "#ffcf3a");
    px(ctx, x + 8, baseY - 21, 1, 1, blink % 2 ? "#39ff88" : "#ff3a8a");
    px(ctx, x + 10, baseY - 19, 1, 1, "#ff3a8a");
  } else if (variant === 1) {
    px(ctx, x + 6, baseY - 18, 3, 1, "#39ff88");
    px(ctx, x + 7, baseY - 21 + blink, 1, 1, "#ffffff");
    px(ctx, x + 4, baseY - 22, 1, 1, "#ff3a3a");
    px(ctx, x + 10, baseY - 22, 1, 1, "#ff3a3a");
  } else {
    // racing
    px(ctx, x + 3, baseY - 17, 8, 2, "#3a3a3a");
    px(ctx, x + 6, baseY - 20, 2, 3, "#ff3a3a");
  }
  // controls
  px(ctx, x + 2, baseY - 14, 10, 5, "#1a1a1a");
  px(ctx, x + 4, baseY - 13, 1, 3, "#ff3a3a");
  px(ctx, x + 8, baseY - 12, 1, 1, "#ffffff");
  px(ctx, x + 10, baseY - 12, 1, 1, "#39ff88");
  // coin slot
  px(ctx, x + 6, baseY - 9, 2, 1, "#3a3a3a");
}

function drawFilingCabinet(ctx: CanvasRenderingContext2D, x: number, baseY: number) {
  const h = 18;
  px(ctx, x, baseY - h, 10, h, "#9aa5b0");
  px(ctx, x, baseY - h, 10, 1, "#c4ccd2");
  for (let i = 0; i < 3; i++) {
    px(ctx, x + 1, baseY - h + 1 + i * 6, 8, 5, "#7a858f");
    px(ctx, x + 4, baseY - h + 3 + i * 6, 3, 1, "#3a3a3a");
  }
  // top decor: stacked papers
  px(ctx, x + 1, baseY - h - 2, 7, 2, "#fff8c4");
  px(ctx, x + 2, baseY - h - 3, 5, 1, "#e8d8a0");
}

function drawWaterCooler(ctx: CanvasRenderingContext2D, x: number, baseY: number) {
  // bottle
  px(ctx, x + 1, baseY - 22, 7, 8, "#9ed4ff");
  px(ctx, x + 2, baseY - 22, 5, 1, "#3a3a3a");
  // body
  px(ctx, x, baseY - 14, 9, 14, "#e8e8e8");
  px(ctx, x, baseY - 14, 9, 1, "#a8a8a8");
  px(ctx, x + 3, baseY - 10, 3, 2, "#3a3a3a");
  // hot/cold taps
  px(ctx, x + 1, baseY - 12, 1, 1, "#ff3a3a");
  px(ctx, x + 7, baseY - 12, 1, 1, "#3a3aff");
}

function drawAquarium(ctx: CanvasRenderingContext2D, x: number, baseY: number, t: number) {
  // stand
  px(ctx, x - 1, baseY - 4, 22, 4, "#3a2a18");
  px(ctx, x, baseY - 16, 20, 12, "#1a3a5a");
  px(ctx, x + 1, baseY - 15, 18, 10, "#3aa8d4");
  // fish
  const fx = (Math.floor(t / 80) % 16) + 1;
  px(ctx, x + fx, baseY - 10, 3, 1, "#ffcf3a");
  px(ctx, x + 2, baseY - 6, 1, 1, "#39ff88");
  px(ctx, x + 14, baseY - 8, 2, 1, "#ff3a3a");
  // bubbles
  const by = (Math.floor(t / 120) % 8);
  px(ctx, x + 5, baseY - 6 - by, 1, 1, "#fff");
  // sand
  px(ctx, x + 1, baseY - 6, 18, 1, "#d4c89a");
  // plants
  px(ctx, x + 3, baseY - 9, 1, 3, "#3fa04a");
  px(ctx, x + 16, baseY - 10, 1, 4, "#3fa04a");
}

function drawCarpet(ctx: CanvasRenderingContext2D, x: number, baseY: number, w: number, p: Palette) {
  // ornamental rug
  px(ctx, x, baseY - 4, w, 3, p.carpet);
  px(ctx, x, baseY - 4, w, 1, p.carpetAlt);
  px(ctx, x, baseY - 2, w, 1, p.carpetAlt);
  // pattern dots
  for (let i = 4; i < w - 4; i += 6) {
    px(ctx, x + i, baseY - 3, 1, 1, "#ffcf3a");
  }
}

function drawFireExtinguisher(ctx: CanvasRenderingContext2D, x: number, baseY: number) {
  px(ctx, x, baseY - 9, 3, 8, "#c4302a");
  px(ctx, x, baseY - 11, 3, 2, "#1a1a1a");
  px(ctx, x + 1, baseY - 12, 1, 1, "#1a1a1a");
}

// ---------------------------------------------------------------------------
// Room renderer
// ---------------------------------------------------------------------------
function drawRoom(
  ctx: CanvasRenderingContext2D,
  room: Room,
  floorIdx: number,
  baseY: number,
  p: Palette,
  era: number,
  t: number,
  buildingX: number,
) {
  const x0 = buildingX + room.startTile * TILE;
  const w = room.widthTiles * TILE;
  const topY = baseY - FLOOR_H;
  const seed = floorIdx * 31 + room.startTile;

  // CEILING strip
  px(ctx, x0, topY, w, 4, p.ceiling);
  drawCeilingBeam(ctx, x0, topY + 3, w, p);

  // WALLPAPER (upper portion above wainscot)
  drawWallpaper(ctx, x0, topY + 4, w, FLOOR_H - 4 - 18, p, seed);

  // WAINSCOT (lower wood paneling, includes baseboard)
  drawWainscot(ctx, x0, baseY, w, p);

  // FLOOR strip line
  px(ctx, x0, baseY - 1, w, 1, p.floorShade);

  // WINDOWS — at chair-rail level (mid wall), 1-3 per room
  const winH = 22;
  const winY = topY + 14;
  const winCount = Math.max(1, Math.min(3, Math.floor(w / (12 * TILE))));
  const winSpacing = w / (winCount + 1);
  for (let i = 0; i < winCount; i++) {
    drawWindow(ctx, x0 + winSpacing * (i + 1) - 10, winY, p, false);
  }

  // CEILING LAMPS (3 per room, lit when dark)
  const lampCount = Math.max(2, Math.min(4, Math.floor(w / 24)));
  const lampSpacing = w / (lampCount + 1);
  for (let i = 0; i < lampCount; i++) {
    drawCeilingLamp(ctx, x0 + lampSpacing * (i + 1), topY + 4, p, true);
  }

  // HANGING PLANTS between lamps
  const r = rng(seed);
  for (let i = 0; i < lampCount - 1; i++) {
    if (r() > 0.4) {
      drawHangingPlant(ctx, x0 + lampSpacing * (i + 1.5) - 3, topY + 4);
    }
  }

  // WALL DECOR (clocks, frames, maps, posters) — placed in the band BETWEEN windows
  // Use the strip just below ceiling
  drawWallDecorCluster(ctx, x0, topY, w, seed, p);

  // Fire extinguisher in corner
  if (r() > 0.5) drawFireExtinguisher(ctx, x0 + 2, baseY);

  // Room-specific furniture
  const cx = x0 + 6;
  switch (room.kind) {
    case "reception": {
      // long counter, plant, couch, coffee table, water cooler
      px(ctx, cx, baseY - 10, 30, 10, p.desk);
      px(ctx, cx, baseY - 2, 30, 2, p.deskShade);
      px(ctx, cx + 2, baseY - 9, 26, 6, lighten(p.desk, 0.1));
      // computer on counter
      px(ctx, cx + 4, baseY - 16, 8, 6, "#d8c89a");
      px(ctx, cx + 5, baseY - 15, 6, 4, "#5dd5ff");
      // bell
      px(ctx, cx + 22, baseY - 12, 2, 2, "#ffcf3a");
      drawCouch(ctx, x0 + w - 28, baseY);
      drawCoffeeTable(ctx, x0 + w - 24, baseY);
      drawBigPlant(ctx, cx + 36, baseY);
      drawWaterCooler(ctx, x0 + w - 12, baseY);
      drawCarpet(ctx, x0 + 8, baseY, w - 16, p);
      break;
    }
    case "office": {
      drawCarpet(ctx, x0 + 8, baseY, w - 16, p);
      drawDesk(ctx, cx + 4, baseY, p, era);
      drawOfficeChair(ctx, cx + 14, baseY);
      drawFilingCabinet(ctx, x0 + w - 14, baseY);
      drawBookshelf(ctx, x0 + w - 28, baseY, 32);
      drawBigPlant(ctx, cx + 28, baseY);
      break;
    }
    case "openSpace": {
      drawCarpet(ctx, x0 + 6, baseY, w - 12, p);
      const slots = Math.min(3, Math.max(2, Math.floor((w - 16) / 32)));
      const gap = Math.floor((w - 12 - slots * 16) / Math.max(1, slots));
      for (let i = 0; i < slots; i++) {
        const dx = cx + i * (16 + gap);
        drawDesk(ctx, dx, baseY, p, era);
        drawOfficeChair(ctx, dx + 14, baseY);
      }
      drawFilingCabinet(ctx, x0 + w - 12, baseY);
      drawPlant(ctx, x0 + 4, baseY);
      break;
    }
    case "meeting": {
      drawCarpet(ctx, x0 + 8, baseY, w - 16, p);
      // long conference table
      px(ctx, cx, baseY - 7, w - 12, 5, p.desk);
      px(ctx, cx, baseY - 2, w - 12, 2, p.deskShade);
      // chairs around it
      for (let i = 0; i < 4; i++) {
        drawOfficeChair(ctx, cx + 2 + i * 10, baseY);
      }
      drawWhiteboard(ctx, x0 + 4, topY + 8);
      drawBigPlant(ctx, x0 + w - 14, baseY);
      // coffee carafe on table
      px(ctx, cx + Math.floor(w / 2) - 8, baseY - 11, 3, 4, "#3a3a3a");
      px(ctx, cx + Math.floor(w / 2) - 7, baseY - 12, 1, 1, "#1a1a1a");
      break;
    }
    case "kitchen": {
      // tiled floor
      for (let tx = 0; tx < w; tx += 4) {
        px(ctx, x0 + tx, baseY - 2, 4, 2, ((tx / 4) % 2 === 0) ? "#e8e8e8" : "#c8c8c8");
      }
      // counter
      px(ctx, cx, baseY - 10, w - 12, 10, "#bababa");
      px(ctx, cx, baseY - 11, w - 12, 1, "#7a7a7a");
      px(ctx, cx, baseY - 2, w - 12, 2, "#7a7a7a");
      drawCoffee(ctx, cx + 4, baseY);
      drawCoffee(ctx, cx + 18, baseY);
      // microwave
      px(ctx, cx + 32, baseY - 10, 10, 6, "#2a2a2a");
      px(ctx, cx + 33, baseY - 9, 6, 4, "#1a1a1a");
      px(ctx, cx + 33, baseY - 9, 6, 1, "#39ff88");
      px(ctx, cx + 40, baseY - 7, 1, 1, "#ff3a3a");
      // fridge
      px(ctx, x0 + w - 14, baseY - 24, 12, 24, "#e8e8e8");
      px(ctx, x0 + w - 14, baseY - 12, 12, 1, "#a8a8a8");
      px(ctx, x0 + w - 5, baseY - 20, 1, 3, "#1a1a1a");
      px(ctx, x0 + w - 5, baseY - 8, 1, 3, "#1a1a1a");
      // magnet
      px(ctx, x0 + w - 10, baseY - 22, 2, 2, "#ff3a3a");
      break;
    }
    case "dev": {
      drawCarpet(ctx, x0 + 6, baseY, w - 12, p);
      drawDesk(ctx, cx + 2, baseY, p, era);
      drawOfficeChair(ctx, cx + 12, baseY);
      // dual monitor station
      drawDesk(ctx, cx + 24, baseY, p, era);
      px(ctx, cx + 38, baseY - 15, 9, 7, "#1a1a1a");
      px(ctx, cx + 39, baseY - 14, 7, 5, "#39ff88");
      drawOfficeChair(ctx, cx + 34, baseY);
      drawServerRack(ctx, x0 + w - 16, baseY, t);
      drawBookshelf(ctx, x0 + w - 32, baseY, 28);
      // pizza box on floor
      px(ctx, cx + 18, baseY - 2, 6, 2, "#d44a4a");
      px(ctx, cx + 18, baseY - 3, 6, 1, "#a83a3a");
      break;
    }
    case "kicker": {
      drawCarpet(ctx, x0 + 6, baseY, w - 12, p);
      drawCouch(ctx, cx, baseY);
      drawCoffeeTable(ctx, cx + 4, baseY);
      drawKicker(ctx, cx + 26, baseY, t);
      drawBigPlant(ctx, x0 + w - 14, baseY);
      // beer crate
      px(ctx, x0 + w - 22, baseY - 5, 6, 5, "#5a3a20");
      px(ctx, x0 + w - 21, baseY - 6, 1, 1, "#ffcf3a");
      px(ctx, x0 + w - 19, baseY - 6, 1, 1, "#ffcf3a");
      break;
    }
    case "arcade": {
      // dark floor (neon bar)
      px(ctx, x0, baseY - 2, w, 2, "#1a0a2a");
      px(ctx, x0, baseY - 2, w, 1, "#ff3a8a");
      drawArcade(ctx, cx + 2, baseY, t, 0);
      drawArcade(ctx, cx + 20, baseY, t, 1);
      drawArcade(ctx, cx + 38, baseY, t, 2);
      drawCouch(ctx, x0 + w - 26, baseY);
      drawCoffeeTable(ctx, x0 + w - 22, baseY);
      // pinball
      px(ctx, x0 + w - 50, baseY - 16, 14, 16, "#3a1a3a");
      px(ctx, x0 + w - 49, baseY - 15, 12, 8, "#5dd5ff");
      px(ctx, x0 + w - 49, baseY - 6, 12, 4, "#1a1a1a");
      break;
    }
    case "executive": {
      drawCarpet(ctx, x0 + 6, baseY, w - 12, p);
      // executive desk
      px(ctx, cx, baseY - 10, 30, 7, p.desk);
      px(ctx, cx, baseY - 3, 30, 3, p.deskShade);
      px(ctx, cx + 2, baseY - 9, 26, 4, lighten(p.desk, 0.15));
      // computer + nameplate + lamp
      px(ctx, cx + 4, baseY - 16, 8, 6, "#1a1a1a");
      px(ctx, cx + 5, baseY - 15, 6, 4, "#5dd5ff");
      px(ctx, cx + 16, baseY - 12, 6, 2, "#ffcf3a"); // nameplate
      // desk lamp
      px(ctx, cx + 24, baseY - 16, 1, 6, "#1a1a1a");
      px(ctx, cx + 23, baseY - 17, 4, 2, "#3a3a3a");
      px(ctx, cx + 23, baseY - 15, 4, 1, "#ffe49a");
      // executive chair (high-back)
      px(ctx, cx + 30, baseY - 18, 7, 14, "#3a1a1a");
      px(ctx, cx + 31, baseY - 17, 5, 11, "#5a2a2a");
      px(ctx, cx + 33, baseY, 1, 1, "#1a1a1a");
      // aquarium against wall
      drawAquarium(ctx, x0 + w - 28, baseY, t);
      // big plant
      drawBigPlant(ctx, cx + 42, baseY);
      drawBookshelf(ctx, x0 + 4, baseY, 36);
      // globe on cabinet
      px(ctx, x0 + w - 6, baseY - 18, 5, 5, "#3aa8d4");
      px(ctx, x0 + w - 5, baseY - 17, 1, 1, "#7a9a5a");
      px(ctx, x0 + w - 3, baseY - 16, 1, 2, "#7a9a5a");
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Sprite render
// ---------------------------------------------------------------------------
function drawSprite(ctx: CanvasRenderingContext2D, s: Sprite) {
  const { shirt, pants, accent } = roleColor(s.role);
  const x = Math.round(s.x);
  const y = Math.round(s.y);
  px(ctx, x - 3, y, 6, 1, "rgba(0,0,0,0.25)");
  const offset = s.state === "walking" ? (s.frame === 0 ? 0 : 1) : 0;
  px(ctx, x - 2, y - 3 + offset, 1, 3, pants);
  px(ctx, x + 1, y - 3 - offset, 1, 3, pants);
  px(ctx, x - 2, y - 8, 4, 5, shirt);
  if (s.state === "walking") {
    px(ctx, s.dir === 1 ? x + 2 : x - 3, y - 7 + offset, 1, 3, shirt);
  } else {
    px(ctx, x - 3, y - 7, 1, 3, shirt);
    px(ctx, x + 2, y - 7, 1, 3, shirt);
  }
  px(ctx, x - 1, y - 6, 1, 1, accent);
  px(ctx, x - 2, y - 12, 4, 4, "#f4c79a");
  px(ctx, s.dir === 1 ? x : x - 2, y - 11, 1, 1, "#1a1a1a");
  px(ctx, s.dir === 1 ? x + 1 : x - 1, y - 11, 1, 1, "#1a1a1a");
  px(ctx, x - 2, y - 13, 4, 1, s.role === "manager" ? "#3a2a1a" : "#1a1a1a");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface Props {
  employees: number;
  year: number;
  quarter: number;
  companyName: string;
}

export const HeadquartersCanvas = ({ employees, year, quarter, companyName }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spritesRef = useRef<Sprite[]>([]);
  const layoutRef = useRef<Floor[]>([]);
  const propsRef = useRef({ employees, year, quarter, companyName });
  propsRef.current = { employees, year, quarter, companyName };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let raf = 0;
    const W = BUILDING_W + STAIR_W + 100;
    const H = SKY_H + MAX_FLOORS * FLOOR_H + GROUND_H + 12;

    const floorBaselineY = (floor: number, _floorCount: number): number => {
      const groundY = H - GROUND_H;
      return groundY - floor * FLOOR_H - 2;
    };

    const reconcileSprites = () => {
      const layout = layoutRef.current;
      if (layout.length === 0) {
        spritesRef.current = [];
        return;
      }
      const representative = Math.max(1, Math.ceil(propsRef.current.employees / 3));
      const visibleCap = Math.min(MAX_VISIBLE_SPRITES, Math.max(1, layout.length * 2));
      const target = Math.min(representative, visibleCap);
      const list = spritesRef.current;

      for (const s of list) {
        if (s.floor >= layout.length) {
          s.floor = layout.length - 1;
          s.targetFloor = s.floor;
          s.y = floorBaselineY(s.floor, layout.length);
        }
      }

      let nextId = list.length > 0 ? Math.max(...list.map(s => s.id)) + 1 : 0;
      while (list.length < target) {
        const role: Role =
          Math.random() < 0.15 ? "manager" : Math.random() < 0.45 ? "developer" : "worker";
        const floor = pickFloorForNewSprite(layout, list);
        const baseY = floorBaselineY(floor, layout.length);
        const buildingX = (W - BUILDING_W - STAIR_W) / 2;
        const sx = buildingX + 8 + Math.random() * (BUILDING_W - 16);
        list.push({
          id: nextId++,
          role,
          floor,
          x: sx,
          y: baseY,
          targetX: sx,
          targetFloor: floor,
          state: "idle",
          stateUntil: performance.now() + 500 + Math.random() * 2000,
          frame: 0,
          frameAt: 0,
          dir: Math.random() > 0.5 ? 1 : -1,
        });
      }
      if (list.length > target) list.length = target;
    };

    const pickFloorForNewSprite = (layout: Floor[], list: Sprite[]): number => {
      const counts = new Array(layout.length).fill(0);
      for (const s of list) if (s.floor < layout.length) counts[s.floor]++;
      for (let i = 0; i < layout.length; i++) {
        if (counts[i] < layout[i].capacity) return i;
      }
      return Math.floor(Math.random() * layout.length);
    };

    const updateSprite = (s: Sprite, now: number, layout: Floor[]) => {
      const buildingX = (W - BUILDING_W - STAIR_W) / 2;
      const stairX = buildingX + BUILDING_W + STAIR_W / 2;
      const baseY = floorBaselineY(s.floor, layout.length);
      s.y = baseY;

      if (s.targetFloor !== s.floor) {
        s.state = "walking";
        s.targetX = stairX;
        const dx = s.targetX - s.x;
        if (Math.abs(dx) < 0.8) {
          s.floor = s.targetFloor;
          s.y = floorBaselineY(s.floor, layout.length);
          s.x = buildingX + BUILDING_W - 12;
          s.dir = -1;
          s.state = "idle";
          s.stateUntil = now + 300;
        } else {
          s.dir = dx > 0 ? 1 : -1;
          s.x += s.dir * 0.35;
        }
        animateFrame(s, now);
        return;
      }
      if (s.state === "idle") {
        if (now >= s.stateUntil) {
          if (Math.random() < 0.15 && layout.length > 1) {
            s.targetFloor = Math.floor(Math.random() * layout.length);
          } else {
            const innerMin = buildingX + 6;
            const innerMax = buildingX + BUILDING_W - 6;
            const tx = innerMin + Math.random() * (innerMax - innerMin);
            s.targetX = tx;
            s.dir = tx > s.x ? 1 : -1;
            s.state = "walking";
          }
        }
        return;
      }
      const dx = s.targetX - s.x;
      if (Math.abs(dx) < 0.6) {
        s.state = "idle";
        s.stateUntil = now + 800 + Math.random() * 2200;
        return;
      }
      s.dir = dx > 0 ? 1 : -1;
      s.x += s.dir * 0.35;
      animateFrame(s, now);
    };

    const animateFrame = (s: Sprite, now: number) => {
      if (now - s.frameAt > 180) {
        s.frame = s.frame === 0 ? 1 : 0;
        s.frameAt = now;
      }
    };

    let lastEmployees = -1;
    const tick = (now: number) => {
      const { employees: em, year: yr, quarter: q, companyName: cn } = propsRef.current;
      if (em !== lastEmployees) {
        layoutRef.current = buildLayout(em);
        reconcileSprites();
        lastEmployees = em;
      }
      const layout = layoutRef.current;
      const palette = getPalette(yr, q);
      const era = yr < 1985 ? 0 : yr < 1992 ? 1 : 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const groundY = H - GROUND_H;
      drawBackground(ctx, W, groundY, palette, q);
      drawGround(ctx, W, groundY, palette);

      const buildingX = (W - BUILDING_W - STAIR_W) / 2;
      const buildingTop = groundY - layout.length * FLOOR_H;

      // outer facade frame
      px(ctx, buildingX - 3, buildingTop - 3, BUILDING_W + STAIR_W + 6, layout.length * FLOOR_H + 3, palette.facadeDark);
      px(ctx, buildingX - 3, buildingTop - 3, BUILDING_W + STAIR_W + 6, 2, palette.facadeLight);
      // brick texture along outer edges
      for (let by = buildingTop; by < groundY; by += 4) {
        px(ctx, buildingX - 3, by, 1, 1, palette.facadeLight);
        px(ctx, buildingX + BUILDING_W + STAIR_W + 2, by, 1, 1, palette.facadeLight);
      }

      // rooms
      for (let f = 0; f < layout.length; f++) {
        const baseY = groundY - f * FLOOR_H;
        const floor = layout[f];
        for (const room of floor.rooms) {
          drawRoom(ctx, room, f, baseY, palette, era, now, buildingX);
        }
        // floor slab (between floors)
        px(ctx, buildingX, baseY, BUILDING_W, 2, palette.floor);
        px(ctx, buildingX, baseY + 1, BUILDING_W, 1, palette.floorShade);
      }

      // Stairs / elevator shaft on the right
      const shaftX = buildingX + BUILDING_W;
      const shaftTop = groundY - layout.length * FLOOR_H;
      px(ctx, shaftX, shaftTop, STAIR_W, layout.length * FLOOR_H, palette.facade);
      px(ctx, shaftX, shaftTop, STAIR_W, 1, palette.facadeDark);
      px(ctx, shaftX, shaftTop, 1, layout.length * FLOOR_H, palette.facadeDark);
      // stairs zigzag
      for (let f = 0; f < layout.length; f++) {
        const yTop = groundY - (f + 1) * FLOOR_H;
        for (let s = 0; s < 8; s++) {
          const sx = shaftX + 2 + s * 3;
          const sy = yTop + 6 + s * 7;
          px(ctx, sx, sy, 3, 2, palette.facadeLight);
          px(ctx, sx, sy + 2, 3, 1, palette.facadeDark);
        }
      }
      // Elevator
      if (layout.length >= 3) {
        const ex = shaftX + STAIR_W - 8;
        px(ctx, ex, shaftTop + 2, 6, layout.length * FLOOR_H - 4, "#1a1a1a");
        const cabFloor = Math.floor((now / 1200) % layout.length);
        const cabY = groundY - cabFloor * FLOOR_H - FLOOR_H + 2;
        px(ctx, ex, cabY, 6, FLOOR_H - 4, "#ffcf3a");
        px(ctx, ex + 2, cabY + 2, 2, 4, "#1a1a1a");
        // floor indicators
        for (let f = 0; f < layout.length; f++) {
          const ind = groundY - f * FLOOR_H - 4;
          px(ctx, ex - 2, ind, 1, 1, f === cabFloor ? "#ff3a3a" : "#3a3a3a");
        }
      }

      // Entrance & sign at ground level
      const entranceX = buildingX + BUILDING_W / 2 - 10;
      px(ctx, entranceX - 2, groundY - 22, 24, 22, palette.facadeDark);
      px(ctx, entranceX, groundY - 20, 20, 20, palette.door);
      px(ctx, entranceX, groundY - 20, 20, 1, palette.doorTrim);
      px(ctx, entranceX + 9, groundY - 20, 2, 20, palette.doorTrim);
      px(ctx, entranceX + 6, groundY - 10, 1, 1, "#ffcf3a");
      px(ctx, entranceX + 13, groundY - 10, 1, 1, "#ffcf3a");
      // awning
      px(ctx, entranceX - 4, groundY - 24, 28, 3, palette.signFg);
      px(ctx, entranceX - 4, groundY - 24, 28, 1, palette.signBg);
      drawSign(ctx, buildingX + BUILDING_W / 2, buildingTop - 14, cn || "TYCOON", palette);

      // Sprites
      const list = spritesRef.current;
      for (const s of list) updateSprite(s, now, layout);
      const sorted = [...list].sort((a, b) => a.y - b.y);
      for (const s of sorted) drawSprite(ctx, s);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const W = BUILDING_W + STAIR_W + 100;
  const H = SKY_H + MAX_FLOORS * FLOOR_H + GROUND_H + 12;

  return (
    <div className="w-full overflow-hidden rounded-md">
      <canvas
        ref={canvasRef}
        width={W * S}
        height={H * S}
        className="block w-full h-auto"
        style={{ aspectRatio: `${W} / ${H}` }}
      />
    </div>
  );
};
