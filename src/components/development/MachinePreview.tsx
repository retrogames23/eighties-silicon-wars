import { useTranslation } from 'react-i18next';
import type { HardwareComponent } from '@/utils/HardwareManager';
import { REQUIRED_SLOTS, type SlotType, type WorkbenchCase } from './partTokens';
import { PixelSprite, Px } from './machine/PixelSprite';
import {
  CPU_SPRITE,
  GPU_SPRITE,
  GRILL_SPRITE,
  HEATSINK_SPRITE,
  RAM_SPRITE,
  SOUND_SPRITE,
  storageSprite,
  type StorageKind,
} from './machine/sprites';
import { caseShades, led, partShades, pcb, screen, spriteColors, tone } from './machine/pixelPalette';
import { useFlyIn } from './machine/useFlyIn';

interface MachinePreviewProps {
  selected: Partial<Record<SlotType, HardwareComponent>>;
  selectedCase: WorkbenchCase | null;
  ghost?: { slot: SlotType; component?: HardwareComponent; caseItem?: WorkbenchCase } | null;
  onClearSlot: (slot: SlotType) => void;
  modelName?: string;
}

// ---- Pixel grid layout (1 unit = 1 pixel cell) ----
const GRID_W = 80;
const GRID_H = 64;

const MON = { x: 22, y: 1, w: 36, h: 23 };
const CASE = { x: 6, y: 28, w: 68, h: 26 };
const BOARD = { x: 10, y: 35, w: 60, h: 17 };
const SLOTS = {
  cpu: { x: 13, y: 36, w: 11, h: 11 },
  memory: { x: 27, y: 36, w: 19, h: 12 },
  gpu: { x: 49, y: 36, w: 18, h: 7 },
  sound: { x: 49, y: 44, w: 18, h: 6 },
  storage: { x: 44, y: 29, w: 18, h: 5 },
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
 * Parts fly in from the shelf and snap onto the mainboard.
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
    const distance = Math.round((1 - p) * (from === 'left' ? -34 : -26));
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
  const screenBars = gpu ? Math.min(9, Math.max(2, Math.round(gpu.performance / 11))) : 0;
  const fullyBuilt = REQUIRED_SLOTS.every((s) => (s === 'case' ? !!selectedCase : !!selected[s]));

  /** Empty socket drawn on the board (never a plain dashed box). */
  const Socket = ({ slot }: { slot: SlotType }) => {
    const rect = SLOTS[slot as keyof typeof SLOTS];
    if (!rect) return null;
    const ps = partShades(slot);
    const required = REQUIRED_SLOTS.includes(slot);
    return (
      <g opacity={0.75} className={required ? 'animate-pulse' : undefined}>
        <Px x={rect.x} y={rect.y} w={rect.w} h={rect.h} fill={pcb.boardDark} />
        <Px x={rect.x} y={rect.y} w={rect.w} h={1} fill={tone(ps.deep, 0.1)} />
        <Px x={rect.x} y={rect.y + rect.h - 1} w={rect.w} h={1} fill={tone(ps.deep, 0.1)} />
        {Array.from({ length: Math.floor(rect.w / 3) }).map((_, i) => (
          <Px key={i} x={rect.x + 1 + i * 3} y={rect.y + Math.floor(rect.h / 2)} w={1} h={1} fill={pcb.pad} />
        ))}
      </g>
    );
  };

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${GRID_W} ${GRID_H}`}
        className="w-full h-auto"
        shapeRendering="crispEdges"
        role="img"
        aria-label={t('ui:development.workbench.previewAlt')}
      >
        {/* ---------- Monitor ---------- */}
        <g {...clickProps('display')} opacity={isGhost('display') ? 0.45 : 1}>
          <g {...entrance('display', 'top')}>
            {display ? (
              <>
                <Px x={MON.x} y={MON.y} w={MON.w} h={MON.h} fill={cs.dark} opacity={caseAlpha} />
                <Px x={MON.x + 1} y={MON.y + 1} w={MON.w - 2} h={MON.h - 2} fill={cs.bases} opacity={caseAlpha} />
                <Px x={MON.x + 1} y={MON.y + 1} w={MON.w - 2} h={1} fill={cs.bright} opacity={caseAlpha} />
                <Px x={MON.x + 3} y={MON.y + 3} w={MON.w - 6} h={MON.h - 9} fill={screen.off} />
                <Px x={MON.x + 4} y={MON.y + 4} w={MON.w - 8} h={MON.h - 11} fill={screen.glow} />
                {/* scanlines */}
                {Array.from({ length: Math.floor((MON.h - 11) / 2) }).map((_, i) => (
                  <Px
                    key={i}
                    x={MON.x + 4}
                    y={MON.y + 4 + i * 2}
                    w={MON.w - 8}
                    h={1}
                    fill={screen.off}
                    opacity={0.35}
                  />
                ))}
                {/* graphics output */}
                {Array.from({ length: screenBars }).map((_, i) => (
                  <Px
                    key={i}
                    x={MON.x + 5}
                    y={MON.y + 6 + i}
                    w={Math.max(3, ((i * 7) % (MON.w - 12)) + 4)}
                    h={1}
                    fill={partShades('gpu').bright}
                  />
                ))}
                <text
                  x={MON.x + 5}
                  y={MON.y + MON.h - 9}
                  fill={screen.phosphor}
                  fontSize="3"
                  fontFamily="monospace"
                >
                  {(modelName || t('ui:development.workbench.boot.unnamed')).slice(0, 14).toUpperCase()}
                </text>
                <text
                  x={MON.x + 5}
                  y={MON.y + MON.h - 5}
                  fill={screen.phosphor}
                  fontSize="3"
                  fontFamily="monospace"
                >
                  {t('ui:development.workbench.boot.ready')}
                </text>
                <Px x={MON.x + 4} y={MON.y + MON.h - 8} w={MON.w - 8} h={1} fill={screen.glow} opacity={0.25} />
                {/* stand */}
                <Px x={MON.x + MON.w / 2 - 5} y={MON.y + MON.h} w={10} h={2} fill={cs.dark} opacity={caseAlpha} />
                <Px x={MON.x + MON.w / 2 - 8} y={MON.y + MON.h + 2} w={16} h={2} fill={cs.deep} opacity={caseAlpha} />
              </>
            ) : (
              <g opacity={0.5}>
                <Px x={MON.x} y={MON.y} w={MON.w} h={1} fill={partShades('display').dark} />
                <Px x={MON.x} y={MON.y + MON.h - 1} w={MON.w} h={1} fill={partShades('display').dark} />
                <Px x={MON.x} y={MON.y} w={1} h={MON.h} fill={partShades('display').dark} />
                <Px x={MON.x + MON.w - 1} y={MON.y} w={1} h={MON.h} fill={partShades('display').dark} />
              </g>
            )}
          </g>
        </g>

        {/* ---------- Case ---------- */}
        {effectiveCase ? (
          <g {...clickProps('case')} {...entrance('case', 'top')}>
            <Px x={CASE.x} y={CASE.y} w={CASE.w} h={CASE.h} fill={cs.dark} opacity={caseAlpha} />
            <Px x={CASE.x + 1} y={CASE.y + 1} w={CASE.w - 2} h={CASE.h - 2} fill={cs.bases} opacity={caseAlpha} />
            <Px x={CASE.x + 1} y={CASE.y + 1} w={CASE.w - 2} h={1} fill={cs.bright} opacity={caseAlpha} />
            <Px x={CASE.x + 1} y={CASE.y + CASE.h - 2} w={CASE.w - 2} h={1} fill={cs.deep} opacity={caseAlpha} />

            {/* open interior showing the mainboard */}
            <Px x={BOARD.x - 1} y={BOARD.y - 1} w={BOARD.w + 2} h={BOARD.h + 2} fill={cs.deep} opacity={caseAlpha} />
            <Px x={BOARD.x} y={BOARD.y} w={BOARD.w} h={BOARD.h} fill={pcb.board} />
            {Array.from({ length: 6 }).map((_, i) => (
              <Px key={`tr-${i}`} x={BOARD.x + 2} y={BOARD.y + 2 + i * 3} w={BOARD.w - 4} h={1} fill={pcb.trace} opacity={0.35} />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <Px key={`tv-${i}`} x={BOARD.x + 4 + i * 7} y={BOARD.y + 1} w={1} h={BOARD.h - 2} fill={pcb.trace} opacity={0.25} />
            ))}

            {/* case front details */}
            <PixelSprite matrix={GRILL_SPRITE} colors={{ D: cs.deep }} x={CASE.x + 3} y={CASE.y + 3} />
            {caseId === 'beige-tower' &&
              Array.from({ length: 4 }).map((_, i) => (
                <Px key={i} x={CASE.x + 16} y={CASE.y + 3 + i * 2} w={20} h={1} fill={cs.dark} opacity={caseAlpha} />
              ))}
            {caseId === 'retro-wood' &&
              Array.from({ length: 5 }).map((_, i) => (
                <Px key={i} x={CASE.x + 2} y={CASE.y + 2 + i * 5} w={CASE.w - 4} h={1} fill={cs.deep} opacity={0.5} />
              ))}
            {caseId === 'premium-metal' &&
              Array.from({ length: 16 }).map((_, i) => (
                <Px key={i} x={CASE.x + 3 + i * 4} y={CASE.y + 2} w={1} h={CASE.h - 4} fill={cs.bright} opacity={0.25} />
              ))}
            {caseId === 'black-desktop' && (
              <Px x={CASE.x + 16} y={CASE.y + 4} w={22} h={2} fill={cs.bright} opacity={0.35} />
            )}
            {caseId === 'compact-mini' && (
              <>
                <Px x={CASE.x + 16} y={CASE.y + 3} w={10} h={4} fill={cs.bright} opacity={0.4} />
                <Px x={CASE.x + 28} y={CASE.y + 4} w={6} h={2} fill={cs.deep} opacity={0.6} />
              </>
            )}
            {caseId === 'gamer-rgb' && (
              <>
                <Px x={CASE.x + 2} y={CASE.y + CASE.h - 3} w={CASE.w - 4} h={1} fill={led.rgb} />
                <Px x={CASE.x + 2} y={CASE.y + 2} w={CASE.w - 4} h={1} fill={led.cyan} opacity={0.8} />
              </>
            )}

            {/* power LED */}
            <Px
              x={CASE.x + CASE.w - 5}
              y={CASE.y + 3}
              w={2}
              h={2}
              fill={fullyBuilt ? led.on : cs.deep}
              opacity={fullyBuilt ? 1 : 0.7}
            />
          </g>
        ) : (
          <g opacity={0.55} className="animate-pulse">
            <Px x={CASE.x} y={CASE.y} w={CASE.w} h={1} fill={partShades('case').bases} />
            <Px x={CASE.x} y={CASE.y + CASE.h - 1} w={CASE.w} h={1} fill={partShades('case').bases} />
            <Px x={CASE.x} y={CASE.y} w={1} h={CASE.h} fill={partShades('case').bases} />
            <Px x={CASE.x + CASE.w - 1} y={CASE.y} w={1} h={CASE.h} fill={partShades('case').bases} />
          </g>
        )}

        {/* ---------- Board parts ---------- */}
        {effectiveCase && (
          <>
            {/* CPU */}
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

            {/* RAM */}
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

            {/* GPU */}
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

            {/* Sound */}
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
          <Px x={16} y={57} w={48} h={5} fill={cs.dark} opacity={caseAlpha} />
          <Px x={17} y={57} w={46} h={3} fill={cs.bases} opacity={caseAlpha} />
          {Array.from({ length: 15 }).map((_, i) => (
            <Px key={i} x={18 + i * 3} y={58} w={2} h={1} fill={cs.deep} opacity={caseAlpha} />
          ))}
          <Px x={28} y={60} w={24} h={1} fill={cs.deep} opacity={caseAlpha} />
        </g>
      </svg>

      <p className="text-xs text-muted-foreground text-center mt-2">
        {t('ui:development.workbench.removeHint')}
      </p>
    </div>
  );
};
