import { useEffect, useRef } from "react";

// ============================================================================
// Pixel-Art Headquarters Canvas (Sim Tower style)
// ============================================================================
// Logical resolution is fixed; CSS scales it up with image-rendering: pixelated
// so the result stays crisp on retina displays.
// ============================================================================

const S = 4;                     // resolution multiplier (backing buffer + drawing scale) — higher = sharper
const TILE = 8;                  // logical pixels per tile
const FLOOR_TILES_W = 36;        // width of a floor in tiles
const FLOOR_TILES_H = 6;         // height of a floor in tiles (room interior)
const FLOOR_H = FLOOR_TILES_H * TILE; // 48 px
const BUILDING_W = FLOOR_TILES_W * TILE; // 288 px
const GROUND_H = 16;
const SKY_H = 40;
const STAIR_W = 24;              // right-side stairs / elevator shaft
const MAX_FLOORS = 7;
const MAX_VISIBLE_SPRITES = 30;

// ---------------------------------------------------------------------------
// Palettes (era-driven: 1980 → 2000+)
// ---------------------------------------------------------------------------
interface Palette {
  skyTop: string; skyBot: string;
  ground: string; grass: string;
  facade: string; facadeDark: string; facadeLight: string;
  wall: string; wallShade: string;
  floor: string; floorShade: string;
  windowGlass: string; windowFrame: string;
  door: string; doorTrim: string;
  desk: string; deskShade: string;
  signBg: string; signFg: string;
}

function getPalette(year: number, quarter: number): Palette {
  // Tag/Nacht je nach Quartal
  let skyTop = "#7ec0ee", skyBot = "#c9e6f7";
  if (quarter === 3) { skyTop = "#f78c4a"; skyBot = "#ffd28a"; }
  if (quarter === 4) { skyTop = "#0b1a3a"; skyBot = "#2b1d4a"; }

  if (year < 1985) {
    return {
      skyTop, skyBot,
      ground: "#6b4f2a", grass: "#4a7a3a",
      facade: "#b58a5a", facadeDark: "#7c5a35", facadeLight: "#d4ad7a",
      wall: "#e8d8b8", wallShade: "#c9b88f",
      floor: "#7a5a3a", floorShade: "#5a4028",
      windowGlass: "#9ed1ff", windowFrame: "#3a2a1a",
      door: "#5a3a1f", doorTrim: "#3a2410",
      desk: "#8a5a2a", deskShade: "#5a3a18",
      signBg: "#2a1a0a", signFg: "#ffcf3a",
    };
  }
  if (year < 1992) {
    return {
      skyTop, skyBot,
      ground: "#5a5a5a", grass: "#5a8a4a",
      facade: "#9aa5b5", facadeDark: "#5a6878", facadeLight: "#c5cdd8",
      wall: "#e0e6ee", wallShade: "#b0b8c4",
      floor: "#5a5a6a", floorShade: "#3a3a48",
      windowGlass: "#a8d8ff", windowFrame: "#2a2a3a",
      door: "#3a4a5a", doorTrim: "#1a2230",
      desk: "#8a6a3a", deskShade: "#5a4020",
      signBg: "#1a1a2a", signFg: "#39ff88",
    };
  }
  return {
    skyTop, skyBot,
    ground: "#4a4a4a", grass: "#3a6a3a",
    facade: "#3a4a5a", facadeDark: "#1f2a38", facadeLight: "#6a7a8a",
    wall: "#f4f4f4", wallShade: "#c8ccd2",
    floor: "#2a2f38", floorShade: "#15181e",
    windowGlass: "#5dd5ff", windowFrame: "#1a1f28",
    door: "#1a1a1a", doorTrim: "#000000",
    desk: "#5a4a3a", deskShade: "#3a2a1f",
    signBg: "#000000", signFg: "#00d9ff",
  };
}

// ---------------------------------------------------------------------------
// Layout: employees → floors / rooms
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
  startTile: number;   // x in tiles
  widthTiles: number;
}

interface Floor {
  rooms: Room[];
  capacity: number;    // how many sprites can work here
}

function buildLayout(employees: number): Floor[] {
  // Etagen-Schwellen (kumulative MA, ab denen die Etage existiert)
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
// Sprite model
// ---------------------------------------------------------------------------
type Role = "worker" | "developer" | "manager";

interface Sprite {
  id: number;
  role: Role;
  floor: number;
  x: number;          // logical px
  y: number;          // logical px (floor baseline)
  targetX: number;
  targetFloor: number;
  state: "walking" | "idle";
  stateUntil: number; // ms timestamp
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
// Tiny deterministic RNG for stable poster/decor choices
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
  // Sub-pixel-Rendering: kein Math.round → glattere Kanten, weniger "klotzig"
  ctx.fillRect(x * S, y * S, w * S, h * S);
}

function drawBackground(ctx: CanvasRenderingContext2D, W: number, groundY: number, p: Palette, quarter: number) {
  // Sky gradient fills the ENTIRE backdrop down to the ground line
  const bands = 12;
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    const c = lerpColor(p.skyTop, p.skyBot, t);
    px(ctx, 0, (groundY * i) / bands, W, groundY / bands + 1, c);
  }
  // Stars in Q4 only in the upper portion
  if (quarter === 4) {
    const r = rng(42);
    for (let i = 0; i < 50; i++) {
      px(ctx, Math.floor(r() * W), Math.floor(r() * Math.min(SKY_H, groundY)), 1, 1, "#ffffff");
    }
  }
  // Sun/moon
  if (quarter === 3) {
    px(ctx, W - 40, 10, 10, 10, "#ffe49a");
  } else if (quarter === 4) {
    px(ctx, W - 36, 8, 8, 8, "#e8e8f0");
    px(ctx, W - 34, 10, 4, 4, p.skyTop);
  }
}

function lerpColor(a: string, b: string, t: number): string {
  const pa = parseHex(a), pb = parseHex(b);
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return `rgb(${r},${g},${bl})`;
}
function parseHex(h: string): [number, number, number] {
  const v = h.replace("#", "");
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

function drawGround(ctx: CanvasRenderingContext2D, W: number, groundY: number, p: Palette) {
  px(ctx, 0, groundY, W, GROUND_H, p.ground);
  px(ctx, 0, groundY, W, 2, p.grass);
  // grass tufts
  const r = rng(7);
  for (let i = 0; i < 24; i++) {
    px(ctx, Math.floor(r() * W), groundY + 2 + Math.floor(r() * 4), 1, 1, "#2f5a2a");
  }
}

function drawSign(ctx: CanvasRenderingContext2D, x: number, y: number, name: string, p: Palette) {
  const text = name.slice(0, 18).toUpperCase();
  // Sign sized for a readable font (canvas backing pixels via S multiplier)
  const fontPx = 11; // backing pixels (after S scaling = 22)
  // measure roughly
  ctx.font = `bold ${fontPx * S}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const measured = ctx.measureText(text).width;
  const padX = 8;
  const wLogical = Math.max(40, measured / S + padX * 2);
  const hLogical = 14;
  // Plate + double trim
  px(ctx, x - wLogical / 2, y, wLogical, hLogical, p.signBg);
  px(ctx, x - wLogical / 2, y, wLogical, 1, p.signFg);
  px(ctx, x - wLogical / 2, y + hLogical - 1, wLogical, 1, p.signFg);
  px(ctx, x - wLogical / 2, y, 1, hLogical, p.signFg);
  px(ctx, x + wLogical / 2 - 1, y, 1, hLogical, p.signFg);
  // Text (raw ctx coords are in scaled space)
  ctx.fillStyle = p.signFg;
  ctx.fillText(text, x * S, (y + hLogical / 2) * S);
}

function drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number, p: Palette, lit: boolean) {
  px(ctx, x, y, 10, 8, p.windowFrame);
  px(ctx, x + 1, y + 1, 8, 6, lit ? "#ffe49a" : p.windowGlass);
  px(ctx, x + 5, y + 1, 1, 6, p.windowFrame);
  px(ctx, x + 1, y + 3, 8, 1, p.windowFrame);
}

function drawDesk(ctx: CanvasRenderingContext2D, x: number, baseY: number, p: Palette, era: number) {
  // baseY = floor surface y
  px(ctx, x, baseY - 6, 14, 4, p.desk);
  px(ctx, x, baseY - 2, 14, 1, p.deskShade);
  px(ctx, x + 1, baseY - 2, 1, 4, p.deskShade);
  px(ctx, x + 12, baseY - 2, 1, 4, p.deskShade);
  // Monitor
  if (era === 0) {
    // CRT beige
    px(ctx, x + 3, baseY - 13, 8, 7, "#d8c89a");
    px(ctx, x + 4, baseY - 12, 6, 5, "#5dd5ff");
    px(ctx, x + 5, baseY - 6, 4, 1, "#9a8a6a");
  } else if (era === 1) {
    // grey CRT
    px(ctx, x + 3, baseY - 13, 8, 7, "#9aa5b0");
    px(ctx, x + 4, baseY - 12, 6, 5, "#39ff88");
    px(ctx, x + 5, baseY - 6, 4, 1, "#5a6878");
  } else {
    // flat screen
    px(ctx, x + 3, baseY - 12, 8, 6, "#1a1a1a");
    px(ctx, x + 4, baseY - 11, 6, 4, "#5dd5ff");
    px(ctx, x + 6, baseY - 6, 2, 2, "#2a2a2a");
  }
  // Keyboard
  px(ctx, x + 2, baseY - 7, 10, 1, "#e0e0e0");
}

function drawPlant(ctx: CanvasRenderingContext2D, x: number, baseY: number) {
  px(ctx, x, baseY - 4, 6, 4, "#8a4a2a");          // pot
  px(ctx, x, baseY - 3, 6, 1, "#6a3a20");
  px(ctx, x - 1, baseY - 9, 8, 5, "#2f7a3a");      // leaves
  px(ctx, x + 1, baseY - 11, 4, 3, "#3fa04a");
}

function drawPoster(ctx: CanvasRenderingContext2D, x: number, y: number, kind: number) {
  // 10x8 poster
  px(ctx, x, y, 10, 8, "#1a1a1a");
  px(ctx, x + 1, y + 1, 8, 6, "#000000");
  if (kind === 0) {
    // Synthwave sun
    px(ctx, x + 1, y + 1, 8, 3, "#ff3a8a");
    px(ctx, x + 3, y + 2, 4, 3, "#ffcf3a");
    px(ctx, x + 1, y + 5, 8, 2, "#5dd5ff");
    px(ctx, x + 1, y + 6, 8, 1, "#000000");
  } else if (kind === 1) {
    // Space invaders
    px(ctx, x + 2, y + 2, 1, 1, "#39ff88");
    px(ctx, x + 4, y + 2, 1, 1, "#39ff88");
    px(ctx, x + 6, y + 2, 1, 1, "#39ff88");
    px(ctx, x + 3, y + 4, 1, 1, "#39ff88");
    px(ctx, x + 5, y + 4, 1, 1, "#39ff88");
    px(ctx, x + 7, y + 4, 1, 1, "#39ff88");
    px(ctx, x + 2, y + 5, 6, 1, "#39ff88");
  } else if (kind === 2) {
    // I ♥ BASIC
    px(ctx, x + 1, y + 3, 8, 2, "#ffcf3a");
    px(ctx, x + 4, y + 2, 2, 1, "#ff3a3a");
  } else {
    // Checker
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 3; j++)
        if ((i + j) % 2 === 0) px(ctx, x + 1 + i * 2, y + 1 + j * 2, 2, 2, "#5dd5ff");
  }
}

function drawWhiteboard(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x, y, 16, 9, "#dddddd");
  px(ctx, x, y, 16, 1, "#7a7a7a");
  px(ctx, x + 2, y + 3, 4, 1, "#1a1a1a");
  px(ctx, x + 2, y + 5, 7, 1, "#ff3a3a");
}

function drawCoffee(ctx: CanvasRenderingContext2D, x: number, baseY: number) {
  px(ctx, x, baseY - 8, 8, 8, "#3a3a3a");
  px(ctx, x + 1, baseY - 7, 6, 2, "#1a1a1a");
  px(ctx, x + 2, baseY - 4, 4, 3, "#5a3a20");
  px(ctx, x + 6, baseY - 6, 1, 1, "#ff3a3a");
}

function drawServerRack(ctx: CanvasRenderingContext2D, x: number, baseY: number) {
  px(ctx, x, baseY - 22, 10, 22, "#1a1a1a");
  for (let i = 0; i < 6; i++) {
    px(ctx, x + 1, baseY - 21 + i * 3, 8, 2, "#2a2a2a");
    px(ctx, x + 2, baseY - 21 + i * 3, 1, 1, i % 2 ? "#ff3a3a" : "#39ff88");
  }
}

function drawCouch(ctx: CanvasRenderingContext2D, x: number, baseY: number) {
  px(ctx, x, baseY - 7, 18, 7, "#7a3a3a");
  px(ctx, x, baseY - 10, 18, 3, "#9a4a4a");
  px(ctx, x, baseY - 10, 2, 10, "#5a2a2a");
  px(ctx, x + 16, baseY - 10, 2, 10, "#5a2a2a");
}

function drawKicker(ctx: CanvasRenderingContext2D, x: number, baseY: number, t: number) {
  px(ctx, x, baseY - 10, 28, 8, "#2a4a8a");
  px(ctx, x + 1, baseY - 9, 26, 6, "#3fa04a");
  // rods
  for (let i = 0; i < 4; i++) {
    px(ctx, x + 3 + i * 6, baseY - 11, 1, 9, "#cccccc");
  }
  // figures rotating
  const phase = Math.floor(t / 200) % 2;
  for (let i = 0; i < 4; i++) {
    px(ctx, x + 2 + i * 6, baseY - 9 + phase, 3, 2, i % 2 ? "#ff3a3a" : "#3a3aff");
  }
  // legs
  px(ctx, x + 2, baseY - 2, 2, 2, "#1a1a1a");
  px(ctx, x + 24, baseY - 2, 2, 2, "#1a1a1a");
}

function drawArcade(ctx: CanvasRenderingContext2D, x: number, baseY: number, t: number, variant: number) {
  // cabinet
  const body = variant === 0 ? "#d44a4a" : variant === 1 ? "#3a3ad4" : "#ffcf3a";
  px(ctx, x, baseY - 24, 12, 24, body);
  px(ctx, x + 1, baseY - 23, 10, 1, "#ffffff");
  // screen
  px(ctx, x + 2, baseY - 21, 8, 7, "#000000");
  const blink = Math.floor(t / 250) % 4;
  if (variant === 0) {
    // Pac-like
    px(ctx, x + 4, baseY - 19, 2, 2, "#ffcf3a");
    px(ctx, x + 7, baseY - 19, 1, 1, blink % 2 ? "#39ff88" : "#ff3a8a");
  } else {
    // ship + bullets
    px(ctx, x + 5, baseY - 16, 2, 1, "#39ff88");
    px(ctx, x + 6, baseY - 18 + blink, 1, 1, "#ffffff");
  }
  // controls
  px(ctx, x + 2, baseY - 13, 8, 4, "#1a1a1a");
  px(ctx, x + 4, baseY - 12, 1, 2, "#ff3a3a");
  px(ctx, x + 7, baseY - 11, 1, 1, "#ffffff");
  px(ctx, x + 9, baseY - 11, 1, 1, "#ffffff");
}

function drawFilingCabinet(ctx: CanvasRenderingContext2D, x: number, baseY: number) {
  px(ctx, x, baseY - 14, 8, 14, "#9aa5b0");
  for (let i = 0; i < 3; i++) {
    px(ctx, x, baseY - 13 + i * 5, 8, 4, "#7a858f");
    px(ctx, x + 3, baseY - 11 + i * 5, 2, 1, "#3a3a3a");
  }
}

function drawAquarium(ctx: CanvasRenderingContext2D, x: number, baseY: number, t: number) {
  px(ctx, x, baseY - 12, 18, 12, "#1a3a5a");
  px(ctx, x + 1, baseY - 11, 16, 10, "#3aa8d4");
  // fish
  const fx = (Math.floor(t / 80) % 14) + 1;
  px(ctx, x + fx, baseY - 7, 2, 1, "#ffcf3a");
  px(ctx, x + 2, baseY - 4, 1, 1, "#39ff88");
  // sand
  px(ctx, x + 1, baseY - 2, 16, 1, "#d4c89a");
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

  // wall
  px(ctx, x0, topY, w, FLOOR_H, p.wall);
  // wall shading
  px(ctx, x0, baseY - 2, w, 1, p.wallShade);
  // floor strip
  px(ctx, x0, baseY - 1, w, 1, p.floorShade);

  // windows (2 per room)
  const winY = topY + 4;
  const lit = false;
  drawWindow(ctx, x0 + 4, winY, p, lit);
  if (w >= 12 * TILE) drawWindow(ctx, x0 + w - 14, winY, p, lit);

  // posters between/above windows
  const r = rng(floorIdx * 31 + room.startTile);
  const posterX = x0 + Math.floor(w / 2) - 5;
  drawPoster(ctx, posterX, topY + 3, Math.floor(r() * 4));

  // Room-specific furniture (baseY = floor surface)
  const cx = x0 + 4;
  switch (room.kind) {
    case "reception": {
      // counter + plant + couch for visitors
      px(ctx, cx, baseY - 8, 26, 8, p.desk);
      px(ctx, cx, baseY - 2, 26, 1, p.deskShade);
      drawPlant(ctx, cx + 32, baseY);
      drawCouch(ctx, x0 + w - 24, baseY);
      break;
    }
    case "office": {
      // realistic small office: 1 desk + chair + plant + cabinet, lots of empty space
      drawDesk(ctx, cx + 4, baseY, p, era);
      // chair behind desk
      px(ctx, cx + 12, baseY - 6, 5, 6, "#3a3a3a");
      drawFilingCabinet(ctx, x0 + w - 12, baseY);
      drawPlant(ctx, cx + 26, baseY);
      break;
    }
    case "openSpace": {
      // Max 3 well-spaced desks, with chairs and a plant
      const slots = Math.min(3, Math.max(1, Math.floor((w - 12) / 28)));
      const gap = Math.floor((w - 8 - slots * 14) / Math.max(1, slots));
      for (let i = 0; i < slots; i++) {
        const dx = cx + i * (14 + gap);
        drawDesk(ctx, dx, baseY, p, era);
        // chair
        px(ctx, dx + 4, baseY - 5, 5, 5, "#3a3a3a");
      }
      drawPlant(ctx, x0 + w - 10, baseY);
      break;
    }
    case "meeting": {
      // long table
      px(ctx, cx, baseY - 6, w - 8, 4, p.desk);
      px(ctx, cx, baseY - 2, w - 8, 1, p.deskShade);
      drawWhiteboard(ctx, x0 + 2, topY + 4);
      break;
    }
    case "kitchen": {
      // counter
      px(ctx, cx, baseY - 8, w - 8, 8, "#bababa");
      px(ctx, cx, baseY - 9, w - 8, 1, "#7a7a7a");
      drawCoffee(ctx, cx + 4, baseY);
      drawCoffee(ctx, cx + 16, baseY);
      // fridge
      px(ctx, x0 + w - 10, baseY - 14, 8, 14, "#e8e8e8");
      px(ctx, x0 + w - 4, baseY - 10, 1, 2, "#1a1a1a");
      break;
    }
    case "dev": {
      // Two dev workstations with chairs, plenty of breathing room
      drawDesk(ctx, cx + 4, baseY, p, era);
      px(ctx, cx + 12, baseY - 5, 5, 5, "#2a2a2a");
      // dual monitor on the second station
      drawDesk(ctx, cx + 28, baseY, p, era);
      px(ctx, cx + 40, baseY - 12, 6, 6, "#1a1a1a");
      px(ctx, cx + 41, baseY - 11, 4, 4, "#39ff88");
      px(ctx, cx + 36, baseY - 5, 5, 5, "#2a2a2a");
      drawServerRack(ctx, x0 + w - 12, baseY);
      break;
    }
    case "kicker": {
      drawCouch(ctx, cx, baseY);
      drawKicker(ctx, cx + 22, baseY, t);
      drawPlant(ctx, x0 + w - 8, baseY);
      break;
    }
    case "arcade": {
      // Two cabinets + couch, no third
      drawArcade(ctx, cx + 4, baseY, t, 0);
      drawArcade(ctx, cx + 20, baseY, t, 1);
      drawCouch(ctx, x0 + w - 22, baseY);
      drawPlant(ctx, cx + 36, baseY);
      break;
    }
    case "executive": {
      // big desk
      px(ctx, cx, baseY - 8, 24, 6, p.desk);
      px(ctx, cx, baseY - 2, 24, 1, p.deskShade);
      // executive chair
      px(ctx, cx + 26, baseY - 12, 6, 10, "#3a1a1a");
      px(ctx, cx + 26, baseY - 14, 6, 3, "#5a2a2a");
      drawAquarium(ctx, x0 + w - 22, baseY, t);
      drawPlant(ctx, cx - 2, baseY);
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Sprites
// ---------------------------------------------------------------------------
function drawSprite(ctx: CanvasRenderingContext2D, s: Sprite) {
  const { shirt, pants, accent } = roleColor(s.role);
  const x = Math.round(s.x);
  const y = Math.round(s.y);
  // shadow
  px(ctx, x - 3, y, 6, 1, "rgba(0,0,0,0.25)");
  // legs (2-frame walkcycle)
  const offset = s.state === "walking" ? (s.frame === 0 ? 0 : 1) : 0;
  px(ctx, x - 2, y - 3 + offset, 1, 3, pants);
  px(ctx, x + 1, y - 3 - offset, 1, 3, pants);
  // body
  px(ctx, x - 2, y - 8, 4, 5, shirt);
  // arms
  if (s.state === "walking") {
    px(ctx, s.dir === 1 ? x + 2 : x - 3, y - 7 + offset, 1, 3, shirt);
  } else {
    px(ctx, x - 3, y - 7, 1, 3, shirt);
    px(ctx, x + 2, y - 7, 1, 3, shirt);
  }
  // accent (badge)
  px(ctx, x - 1, y - 6, 1, 1, accent);
  // head
  px(ctx, x - 2, y - 12, 4, 4, "#f4c79a");
  // eyes
  px(ctx, s.dir === 1 ? x : x - 2, y - 11, 1, 1, "#1a1a1a");
  px(ctx, s.dir === 1 ? x + 1 : x - 1, y - 11, 1, 1, "#1a1a1a");
  // hair (random by role)
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

  // Mount: start animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let raf = 0;
    // Logical dimensions (px() multiplies by S when drawing to backing)
    const W = BUILDING_W + STAIR_W + 80;
    const H = SKY_H + MAX_FLOORS * FLOOR_H + GROUND_H + 10;

    const reconcileSprites = () => {
      const layout = layoutRef.current;
      if (layout.length === 0) {
        spritesRef.current = [];
        return;
      }
      // Sprites repräsentieren Mitarbeitende (nicht 1:1) — kleine Firmen bleiben ruhig.
      // 1 MA → 1 Sprite, 2–3 → 1, 4–6 → 2, 7–9 → 3, ...  (≈ ceil(em/3), min 1)
      const representative = Math.max(1, Math.ceil(propsRef.current.employees / 3));
      const visibleCap = Math.min(MAX_VISIBLE_SPRITES, Math.max(1, layout.length * 2));
      const target = Math.min(representative, visibleCap);
      const list = spritesRef.current;

      // Clamp existing sprites to existing floors
      for (const s of list) {
        if (s.floor >= layout.length) {
          s.floor = layout.length - 1;
          s.targetFloor = s.floor;
          s.y = floorBaselineY(s.floor, layout.length);
          s.targetFloor = s.floor;
        }
      }

      // Add missing
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
      // Remove extra
      if (list.length > target) list.length = target;
    };

    const floorBaselineY = (floor: number, floorCount: number): number => {
      // floor 0 is ground floor
      const groundY = H - GROUND_H;
      return groundY - floor * FLOOR_H - 2;
    };

    const pickFloorForNewSprite = (layout: Floor[], list: Sprite[]): number => {
      // Prefer floors below capacity
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

      // Floor change: walk to stairs, then snap to target floor
      if (s.targetFloor !== s.floor) {
        s.state = "walking";
        s.targetX = stairX;
        const dx = s.targetX - s.x;
        if (Math.abs(dx) < 0.8) {
          s.floor = s.targetFloor;
          s.y = floorBaselineY(s.floor, layout.length);
          // emerge a bit inside the building
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
          // pick new target
          if (Math.random() < 0.15 && layout.length > 1) {
            // change floor
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

      // walking
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

    // Rebuild layout when employees change
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

      // facade behind everything (sliver around floors)
      px(ctx, buildingX - 2, buildingTop - 2, BUILDING_W + STAIR_W + 4, layout.length * FLOOR_H + 2, palette.facadeDark);
      px(ctx, buildingX - 2, buildingTop - 2, BUILDING_W + STAIR_W + 4, 2, palette.facadeLight);

      // rooms
      for (let f = 0; f < layout.length; f++) {
        const baseY = groundY - f * FLOOR_H;
        const floor = layout[f];
        for (const room of floor.rooms) {
          drawRoom(ctx, room, f, baseY, palette, era, now, buildingX);
        }
        // floor slab
        px(ctx, buildingX, baseY, BUILDING_W, 1, palette.floor);
      }

      // Stairs / elevator shaft on the right
      const shaftX = buildingX + BUILDING_W;
      const shaftTop = groundY - layout.length * FLOOR_H;
      px(ctx, shaftX, shaftTop, STAIR_W, layout.length * FLOOR_H, palette.facade);
      // shaft outline
      px(ctx, shaftX, shaftTop, STAIR_W, 1, palette.facadeDark);
      px(ctx, shaftX, shaftTop, 1, layout.length * FLOOR_H, palette.facadeDark);
      // stairs zigzag
      for (let f = 0; f < layout.length; f++) {
        const yTop = groundY - (f + 1) * FLOOR_H;
        for (let s = 0; s < 6; s++) {
          const sx = shaftX + 2 + s * 3;
          const sy = yTop + 4 + s * 6;
          px(ctx, sx, sy, 3, 2, palette.facadeLight);
        }
      }
      // Elevator (if >= 3 floors)
      if (layout.length >= 3) {
        const ex = shaftX + STAIR_W - 8;
        px(ctx, ex, shaftTop + 2, 6, layout.length * FLOOR_H - 4, "#1a1a1a");
        const cabFloor = Math.floor((now / 1200) % layout.length);
        const cabY = groundY - cabFloor * FLOOR_H - FLOOR_H + 2;
        px(ctx, ex, cabY, 6, FLOOR_H - 4, "#ffcf3a");
        px(ctx, ex + 2, cabY + 2, 2, 4, "#1a1a1a");
      }

      // Entrance & sign at ground level
      const entranceX = buildingX + BUILDING_W / 2 - 8;
      px(ctx, entranceX, groundY - 16, 16, 16, palette.door);
      px(ctx, entranceX, groundY - 16, 16, 1, palette.doorTrim);
      px(ctx, entranceX + 7, groundY - 16, 2, 16, palette.doorTrim);
      px(ctx, entranceX + 5, groundY - 8, 1, 1, "#ffcf3a");
      px(ctx, entranceX + 10, groundY - 8, 1, 1, "#ffcf3a");
      drawSign(ctx, buildingX + BUILDING_W / 2, buildingTop - 12, cn || "TYCOON", palette);

      // Update + draw sprites
      const list = spritesRef.current;
      for (const s of list) updateSprite(s, now, layout);
      // sort by y so back sprites draw first (mostly same y per floor)
      const sorted = [...list].sort((a, b) => a.y - b.y);
      for (const s of sorted) drawSprite(ctx, s);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Logical canvas size: building width + stairs + horizontal padding
  const W = BUILDING_W + STAIR_W + 80;
  const H = SKY_H + MAX_FLOORS * FLOOR_H + GROUND_H + 10;

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
