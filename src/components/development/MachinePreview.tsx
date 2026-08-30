import { useTranslation } from 'react-i18next';
import type { HardwareComponent } from '@/utils/HardwareManager';
import { REQUIRED_SLOTS, type SlotType, type WorkbenchCase } from './partTokens';
import { Dither, Panel, PixelSprite, Px, SideDepth } from './machine/PixelSprite';
import {
  CPU_SPRITE,
  GPU_SPRITE,
  HEATSINK_SPRITE,
  RAM_SPRITE,
  SOUND_SPRITE,
  storageSprite,
  type StorageKind,
} from './machine/sprites';
import { caseShades, led, partShades, pcb, screen, spriteColors, tone } from './machine/pixelPalette';
import { useFlyIn } from './machine/useFlyIn';
import { CaseArtwork } from './machine/CaseArtwork';


interface MachinePreviewProps {
  selected: Partial<Record<SlotType, HardwareComponent>>;
  selectedCase: WorkbenchCase | null;
  ghost?: { slot: SlotType; component?: HardwareComponent; caseItem?: WorkbenchCase } | null;
  onClearSlot: (slot: SlotType) => void;
  modelName?: string;
}

// ---- Pixel grid layout (1 unit = 1 pixel cell) ----
const GRID_W = 160;
const GRID_H = 120;

const MON = { x: 44, y: 2, w: 70, h: 52 };
const SCR = { x: 51, y: 9, w: 56, h: 34 };
const CASE = { x: 8, y: 58, w: 124, h: 34 };
const BOARD = { x: 12, y: 62, w: 84, h: 26 };
const KBD = { x: 10, y: 98, w: 104, h: 18 };
const MOUSE = { x: 126, y: 100, w: 16, h: 14 };

const SLOTS = {
  cpu: { x: 15, y: 66, w: 11, h: 11 },
  memory: { x: 30, y: 65, w: 20, h: 12 },
  gpu: { x: 54, y: 65, w: 18, h: 7 },
  sound: { x: 54, y: 76, w: 18, h: 6 },
  storage: { x: 101, y: 70, w: 18, h: 5 },
} as const;

const storageKindOf = (component?: HardwareComponent): StorageKind => {
  const id = `${component?.id ?? ''} ${component?.name ?? ''}`.toLowerCase();
  if (id.includes('cassette') || id.includes('kassette')) return 'cassette';
  if (id.includes('cd')) return 'optical';
  if (id.includes('floppy') || id.includes('disket')) return 'floppy';
  return 'disk';
};

/**
 * 16-bit era pixel rendering of the machine being assembled.
 * Shaded bevels, dithering and a stepped side face give it a bitmap look;
 * parts fly in from the shelf and snap onto the mainboard.
 */
export const MachinePreview = ({
  selected,
  selectedCase,
  ghost,
  onClearSlot,
  modelName,
}: MachinePreviewProps) => {
  const { t } = useTranslation(['ui', 'hardware']);

  const ghostSlot = ghost?.slot;
  const effectiveCase = selectedCase ?? (ghostSlot === 'case' ? ghost?.caseItem ?? null : null);
  const isGhostCase = !selectedCase && ghostSlot === 'case';

  const part = (slot: SlotType) => selected[slot] ?? (ghostSlot === slot ? ghost?.component : undefined);
  const isGhost = (slot: SlotType) => !selected[slot] && ghostSlot === slot;

  const cpu = part('cpu');
  const gpu = part('gpu');
  const memory = part('memory');
  const sound = part('sound');
  const storage = part('storage');
  const display = part('display');

  const progressOf = useFlyIn({
    cpu: selected.cpu?.id,
    gpu: selected.gpu?.id,
    memory: selected.memory?.id,
    sound: selected.sound?.id,
    storage: selected.storage?.id,
    display: selected.display?.id,
    case: selectedCase?.id,
  });

  const cs = caseShades(effectiveCase?.id);
  const caseAlpha = isGhostCase ? 0.45 : 1;
  const caseId = effectiveCase?.id;

  /** Fly-in transform + opacity for a slot. */
  const entrance = (slot: SlotType, from: 'left' | 'top' = 'left') => {
    if (isGhost(slot)) return { transform: undefined, opacity: 0.4 };
    const p = progressOf(slot);
    if (p >= 1) return { transform: undefined, opacity: 1 };
    const distance = Math.round((1 - p) * (from === 'left' ? -60 : -46));
    return {
      transform: from === 'left' ? `translate(${distance} 0)` : `translate(0 ${distance})`,
      opacity: 0.35 + p * 0.65,
    };
  };

  const clickProps = (slot: SlotType) =>
    selected[slot]
      ? { onClick: () => onClearSlot(slot), style: { cursor: 'pointer' } as const }
      : {};

  const ramBanks = memory ? Math.min(4, Math.max(1, Math.round(memory.performance / 25))) : 0;
  const screenBars = gpu ? Math.min(10, Math.max(2, Math.round(gpu.performance / 10))) : 0;
  const fullyBuilt = REQUIRED_SLOTS.every((s) => (s === 'case' ? !!selectedCase : !!selected[s]));
  const title = (modelName || t('ui:development.workbench.boot.unnamed')).slice(0, 16).toUpperCase();

  /** Empty socket drawn on the board (never a plain dashed box). */
  const Socket = ({ slot }: { slot: SlotType }) => {
    const rect = SLOTS[slot as keyof typeof SLOTS];
    if (!rect) return null;
    const ps = partShades(slot);
    const required = REQUIRED_SLOTS.includes(slot);
    return (
      <g opacity={0.8} className={required ? 'animate-pulse' : undefined}>
        <Px x={rect.x} y={rect.y} w={rect.w} h={rect.h} fill={pcb.boardDark} />
        <Px x={rect.x} y={rect.y} w={rect.w} h={1} fill={tone(ps.deep, 0.15)} />
        <Px x={rect.x} y={rect.y + rect.h - 1} w={rect.w} h={1} fill={tone(ps.deep, 0.15)} />
        {Array.from({ length: Math.floor(rect.w / 2) }).map((_, i) => (
          <Px key={i} x={rect.x + 1 + i * 2} y={rect.y + Math.floor(rect.h / 2)} w={1} h={1} fill={pcb.pad} />
        ))}
      </g>
    );
  };

  return (
    <div className="w-full space-y-3">
      {/* High-res chassis artwork */}
      <CaseArtwork caseItem={effectiveCase} isGhost={isGhostCase} />

      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono text-center">
        {t('ui:development.workbench.insideTitle')}
      </p>

      <svg
        viewBox={`0 0 ${GRID_W} ${GRID_H}`}
        className="w-full h-auto"
        shapeRendering="crispEdges"
        role="img"
        aria-label={t('ui:development.workbench.previewAlt')}
      >

        {/* ---------- contact shadow ---------- */}
        <Dither x={CASE.x + 4} y={CASE.y + CASE.h} w={CASE.w + 6} h={4} fill={cs.deep} opacity={0.35} density={2} />
        <Dither x={KBD.x + 3} y={KBD.y + KBD.h} w={KBD.w} h={2} fill={cs.deep} opacity={0.3} density={2} />

        {/* ---------- Monitor ---------- */}
        <g {...clickProps('display')} opacity={isGhost('display') ? 0.45 : 1}>
          <g {...entrance('display', 'top')}>
            {display ? (
              <>
                {/* CRT depth (3/4 view) */}
                <SideDepth
                  x={MON.x + MON.w}
                  y={MON.y + 4}
                  h={MON.h - 10}
                  depth={11}
                  rise={0.45}
                  fill={cs.dark}
                  edge={cs.light}
                  opacity={caseAlpha}
                />
                <Panel x={MON.x} y={MON.y} w={MON.w} h={MON.h} shades={cs} opacity={caseAlpha} />
                {/* moulded bezel around the tube */}
                <Px x={SCR.x - 3} y={SCR.y - 3} w={SCR.w + 6} h={SCR.h + 6} fill={cs.dark} opacity={caseAlpha} />
                <Px x={SCR.x - 2} y={SCR.y - 2} w={SCR.w + 4} h={1} fill={cs.deep} opacity={caseAlpha} />
                <Px x={SCR.x - 2} y={SCR.y + SCR.h + 1} w={SCR.w + 4} h={1} fill={cs.bright} opacity={caseAlpha} />

                {/* tube */}
                <Px x={SCR.x} y={SCR.y} w={SCR.w} h={SCR.h} fill={screen.off} />
                <Dither x={SCR.x} y={SCR.y} w={SCR.w} h={SCR.h} fill={screen.glow} opacity={0.25} density={3} />
                {/* menu bar */}
                <Px x={SCR.x + 2} y={SCR.y + 2} w={SCR.w - 4} h={5} fill={cs.bases} opacity={0.85} />
                <Px x={SCR.x + 3} y={SCR.y + 3} w={2} h={2} fill={led.rgb} />
                <clipPath id="mp-screen-clip">
                  <rect x={SCR.x + 1} y={SCR.y + 1} width={SCR.w - 2} height={SCR.h - 2} />
                </clipPath>
                <text
                  x={SCR.x + 7}
                  y={SCR.y + 6.4}
                  fill={cs.deep}
                  fontSize="4"
                  fontFamily="monospace"
                  clipPath="url(#mp-screen-clip)"
                >
                  {title}
                </text>

                {/* desktop window */}
                <Px x={SCR.x + 4} y={SCR.y + 9} w={SCR.w - 8} h={SCR.h - 14} fill={pcb.boardDark} />
                <Px x={SCR.x + 5} y={SCR.y + 10} w={SCR.w - 10} h={SCR.h - 16} fill={screen.off} />
                {Array.from({ length: screenBars }).map((_, i) => (
                  <Px
                    key={i}
                    x={SCR.x + 7}
                    y={SCR.y + 12 + i * 2}
                    w={Math.max(4, ((i * 9) % (SCR.w - 20)) + 5)}
                    h={1}
                    fill={partShades('gpu').bright}
                    opacity={0.9}
                  />
                ))}
                <text
                  x={SCR.x + 7}
                  y={SCR.y + SCR.h - 4}
                  fill={screen.phosphor}
                  fontSize="4"
                  fontFamily="monospace"
                  clipPath="url(#mp-screen-clip)"
                >

                  {t('ui:development.workbench.boot.ready')}
                </text>
                {/* scanlines + glass reflection */}
                {Array.from({ length: Math.floor(SCR.h / 2) }).map((_, i) => (
                  <Px key={`sl-${i}`} x={SCR.x} y={SCR.y + i * 2} w={SCR.w} h={1} fill={screen.off} opacity={0.28} />
                ))}
                <Dither x={SCR.x + 2} y={SCR.y + 2} w={14} h={10} fill={cs.bright} opacity={0.12} density={2} />

                {/* front controls + brand */}
                <Px x={MON.x + 5} y={MON.y + MON.h - 6} w={5} h={2} fill={cs.dark} opacity={caseAlpha} />
                <Px x={MON.x + 12} y={MON.y + MON.h - 6} w={5} h={2} fill={cs.dark} opacity={caseAlpha} />
                <Px x={MON.x + 19} y={MON.y + MON.h - 6} w={2} h={2} fill={cs.deep} opacity={caseAlpha} />
                <Px
                  x={MON.x + MON.w - 8}
                  y={MON.y + MON.h - 6}
                  w={2}
                  h={2}
                  fill={fullyBuilt ? led.on : cs.deep}
                />

                {/* stand */}
                <Px x={MON.x + MON.w / 2 - 8} y={MON.y + MON.h} w={16} h={2} fill={cs.dark} opacity={caseAlpha} />
                <Px x={MON.x + MON.w / 2 - 12} y={MON.y + MON.h + 2} w={24} h={2} fill={cs.deep} opacity={caseAlpha} />
              </>
            ) : (
              <g opacity={0.45} className="animate-pulse">
                <Dither x={MON.x} y={MON.y} w={MON.w} h={MON.h} fill={partShades('display').bases} opacity={0.5} density={4} />
                <Px x={MON.x} y={MON.y} w={MON.w} h={1} fill={partShades('display').bases} />
                <Px x={MON.x} y={MON.y + MON.h - 1} w={MON.w} h={1} fill={partShades('display').bases} />
                <Px x={MON.x} y={MON.y} w={1} h={MON.h} fill={partShades('display').bases} />
                <Px x={MON.x + MON.w - 1} y={MON.y} w={1} h={MON.h} fill={partShades('display').bases} />
              </g>
            )}
          </g>
        </g>

        {/* ---------- Case ---------- */}
        {effectiveCase ? (
          <g {...clickProps('case')} {...entrance('case', 'top')}>
            <SideDepth
              x={CASE.x + CASE.w}
              y={CASE.y + 3}
              h={CASE.h - 6}
              depth={11}
              rise={0.45}
              fill={cs.dark}
              edge={cs.light}
              opacity={caseAlpha}
            />
            <Panel x={CASE.x} y={CASE.y} w={CASE.w} h={CASE.h} shades={cs} opacity={caseAlpha} />

            {/* open side panel: the mainboard bay */}
            <Px x={BOARD.x - 2} y={BOARD.y - 2} w={BOARD.w + 4} h={BOARD.h + 4} fill={cs.deep} opacity={caseAlpha} />
            <Px x={BOARD.x - 1} y={BOARD.y - 1} w={BOARD.w + 2} h={1} fill={cs.dark} opacity={caseAlpha} />
            <Px x={BOARD.x} y={BOARD.y} w={BOARD.w} h={BOARD.h} fill={pcb.board} />
            <Dither x={BOARD.x} y={BOARD.y} w={BOARD.w} h={BOARD.h} fill={pcb.boardDark} opacity={0.4} density={3} />
            {Array.from({ length: 8 }).map((_, i) => (
              <Px
                key={`tr-${i}`}
                x={BOARD.x + 2}
                y={BOARD.y + 2 + i * 3}
                w={BOARD.w - 4}
                h={1}
                fill={pcb.trace}
                opacity={0.3}
              />
            ))}
            {Array.from({ length: 11 }).map((_, i) => (
              <Px
                key={`tv-${i}`}
                x={BOARD.x + 4 + i * 7}
                y={BOARD.y + 1}
                w={1}
                h={BOARD.h - 2}
                fill={pcb.trace}
                opacity={0.22}
              />
            ))}
            {Array.from({ length: 14 }).map((_, i) => (
              <Px
                key={`pad-${i}`}
                x={BOARD.x + 3 + ((i * 11) % (BOARD.w - 6))}
                y={BOARD.y + 2 + ((i * 7) % (BOARD.h - 4))}
                w={1}
                h={1}
                fill={pcb.pad}
                opacity={0.7}
              />
            ))}

            {/* right front bezel: badge, vents, LEDs, drive bay */}
            <Px x={100} y={CASE.y + 4} w={26} h={5} fill={cs.dark} opacity={caseAlpha} />
            <Px x={101} y={CASE.y + 5} w={3} h={3} fill={led.cyan} opacity={0.8} />
            <Px x={105} y={CASE.y + 5} w={3} h={3} fill={led.rgb} opacity={0.8} />
            <Px x={109} y={CASE.y + 5} w={3} h={3} fill={led.on} opacity={0.8} />
            <Px x={100} y={CASE.y + 12} w={2} h={2} fill={fullyBuilt ? led.on : cs.deep} />
            <Px x={100} y={CASE.y + 16} w={2} h={2} fill={storage ? led.on : cs.deep} opacity={storage ? 1 : 0.6} />
            {Array.from({ length: 9 }).map((_, i) => (
              <Px key={`vent-${i}`} x={100} y={CASE.y + 22 + i} w={26} h={i % 2 === 0 ? 1 : 0.6} fill={cs.deep} opacity={0.55} />
            ))}

            {/* case identity details */}
            {caseId === 'beige-tower' &&
              Array.from({ length: 5 }).map((_, i) => (
                <Px key={i} x={BOARD.x} y={CASE.y + 1 + i} w={BOARD.w} h={i % 2 === 0 ? 1 : 0} fill={cs.dark} opacity={0.4} />
              ))}
            {caseId === 'retro-wood' &&
              Array.from({ length: 7 }).map((_, i) => (
                <Px key={i} x={CASE.x + 2} y={CASE.y + 2 + i * 4} w={CASE.w - 4} h={1} fill={cs.deep} opacity={0.35} />
              ))}
            {caseId === 'premium-metal' &&
              Array.from({ length: 28 }).map((_, i) => (
                <Px key={i} x={CASE.x + 2 + i * 4} y={CASE.y + 1} w={1} h={CASE.h - 2} fill={cs.bright} opacity={0.18} />
              ))}
            {caseId === 'black-desktop' && (
              <Dither x={CASE.x + 2} y={CASE.y + 1} w={CASE.w - 4} h={3} fill={cs.bright} opacity={0.25} density={2} />
            )}
            {caseId === 'compact-mini' && (
              <Px x={BOARD.x} y={CASE.y + 1} w={BOARD.w} h={2} fill={cs.bright} opacity={0.3} />
            )}
            {caseId === 'gamer-rgb' && (
              <>
                <Px x={CASE.x + 2} y={CASE.y + CASE.h - 3} w={CASE.w - 4} h={1} fill={led.rgb} />
                <Px x={CASE.x + 2} y={CASE.y + 1} w={CASE.w - 4} h={1} fill={led.cyan} opacity={0.85} />
              </>
            )}
          </g>
        ) : (
          <g opacity={0.5} className="animate-pulse">
            <Dither x={CASE.x} y={CASE.y} w={CASE.w} h={CASE.h} fill={partShades('case').bases} opacity={0.4} density={4} />
            <Px x={CASE.x} y={CASE.y} w={CASE.w} h={1} fill={partShades('case').bases} />
            <Px x={CASE.x} y={CASE.y + CASE.h - 1} w={CASE.w} h={1} fill={partShades('case').bases} />
            <Px x={CASE.x} y={CASE.y} w={1} h={CASE.h} fill={partShades('case').bases} />
            <Px x={CASE.x + CASE.w - 1} y={CASE.y} w={1} h={CASE.h} fill={partShades('case').bases} />
          </g>
        )}

        {/* ---------- Board parts ---------- */}
        {effectiveCase && (
          <>
            <g {...clickProps('cpu')}>
              {cpu ? (
                <g {...entrance('cpu')}>
                  {cpu.performance >= 55 && (
                    <PixelSprite
                      matrix={HEATSINK_SPRITE}
                      colors={spriteColors(partShades('cpu'))}
                      x={SLOTS.cpu.x}
                      y={SLOTS.cpu.y - 4}
                    />
                  )}
                  <PixelSprite
                    matrix={CPU_SPRITE}
                    colors={spriteColors(partShades('cpu'), { W: screen.phosphor })}
                    x={SLOTS.cpu.x}
                    y={SLOTS.cpu.y}
                  />
                </g>
              ) : (
                <Socket slot="cpu" />
              )}
            </g>

            <g {...clickProps('memory')}>
              {memory ? (
                <g {...entrance('memory')}>
                  {Array.from({ length: ramBanks }).map((_, i) => (
                    <PixelSprite
                      key={i}
                      matrix={RAM_SPRITE}
                      colors={spriteColors(partShades('memory'))}
                      x={SLOTS.memory.x + i * 5}
                      y={SLOTS.memory.y}
                    />
                  ))}
                </g>
              ) : (
                <Socket slot="memory" />
              )}
            </g>

            <g {...clickProps('gpu')}>
              {gpu ? (
                <g {...entrance('gpu')}>
                  <PixelSprite
                    matrix={GPU_SPRITE}
                    colors={spriteColors(partShades('gpu'), { W: screen.phosphor })}
                    x={SLOTS.gpu.x}
                    y={SLOTS.gpu.y}
                  />
                </g>
              ) : (
                <Socket slot="gpu" />
              )}
            </g>

            <g {...clickProps('sound')}>
              {sound ? (
                <g {...entrance('sound')}>
                  <PixelSprite
                    matrix={SOUND_SPRITE}
                    colors={spriteColors(partShades('sound'), { W: led.cyan })}
                    x={SLOTS.sound.x}
                    y={SLOTS.sound.y}
                  />
                </g>
              ) : (
                <Socket slot="sound" />
              )}
            </g>

            {/* Storage drive in the front bezel */}
            <g {...clickProps('storage')}>
              {storage ? (
                <g {...entrance('storage')}>
                  <PixelSprite
                    matrix={storageSprite(storageKindOf(storage))}
                    colors={spriteColors(partShades('storage'), { W: led.on })}
                    x={SLOTS.storage.x}
                    y={SLOTS.storage.y}
                  />
                </g>
              ) : (
                <g opacity={0.6}>
                  <Px x={SLOTS.storage.x} y={SLOTS.storage.y} w={SLOTS.storage.w} h={SLOTS.storage.h} fill={cs.dark} />
                  <Px x={SLOTS.storage.x + 1} y={SLOTS.storage.y + 2} w={SLOTS.storage.w - 2} h={1} fill={cs.deep} />
                </g>
              )}
            </g>
          </>
        )}

        {/* ---------- Keyboard ---------- */}
        <g opacity={effectiveCase ? 1 : 0.4}>
          <SideDepth
            x={KBD.x + KBD.w}
            y={KBD.y + 3}
            h={KBD.h - 6}
            depth={6}
            rise={0.5}
            fill={cs.dark}
            edge={cs.light}
            opacity={caseAlpha}
          />
          <Panel x={KBD.x} y={KBD.y} w={KBD.w} h={KBD.h} shades={cs} opacity={caseAlpha} />
          {/* keycaps: 4 rows of shaded caps */}
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 24 }).map((__, c) => {
              const x = KBD.x + 4 + c * 4 + (r === 3 ? 1 : 0);
              const y = KBD.y + 3 + r * 3;
              if (x + 3 > KBD.x + KBD.w - 3) return null;
              return (
                <g key={`k-${r}-${c}`}>
                  <Px x={x} y={y} w={3} h={2} fill={cs.light} opacity={caseAlpha} />
                  <Px x={x} y={y + 1} w={3} h={1} fill={cs.dark} opacity={caseAlpha} />
                </g>
              );
            })
          )}
          {/* space bar */}
          <Px x={KBD.x + 32} y={KBD.y + 15} w={36} h={2} fill={cs.light} opacity={caseAlpha} />
          <Px x={KBD.x + 32} y={KBD.y + 16} w={36} h={1} fill={cs.dark} opacity={caseAlpha} />
          {/* cable to the case */}
          <Px x={KBD.x + 8} y={KBD.y - 4} w={1} h={4} fill={cs.deep} opacity={0.7} />
          <Px x={KBD.x + 8} y={KBD.y - 5} w={6} h={1} fill={cs.deep} opacity={0.7} />
        </g>

        {/* ---------- Mouse ---------- */}
        <g opacity={effectiveCase ? 1 : 0.35}>
          <Panel x={MOUSE.x} y={MOUSE.y} w={MOUSE.w} h={MOUSE.h} shades={cs} opacity={caseAlpha} />
          <Px x={MOUSE.x + 3} y={MOUSE.y + 2} w={4} h={5} fill={cs.dark} opacity={caseAlpha} />
          <Px x={MOUSE.x + 9} y={MOUSE.y + 2} w={4} h={5} fill={cs.dark} opacity={caseAlpha} />
          <Px x={MOUSE.x + 7} y={MOUSE.y - 4} w={1} h={4} fill={cs.deep} opacity={0.7} />
        </g>
      </svg>

      <p className="text-xs text-muted-foreground text-center mt-2">
        {t('ui:development.workbench.removeHint')}
      </p>
    </div>
  );
};
