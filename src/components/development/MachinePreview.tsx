import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { HardwareComponent } from '@/utils/HardwareManager';
import { REQUIRED_SLOTS, slotColor, type SlotType, type WorkbenchCase } from './partTokens';
import {
  CPU_SPRITE,
  GPU_SPRITE,
  RAM_SPRITE,
  SOUND_SPRITE,
  storageSprite,
  type PixelMatrix,
  type StorageKind,
} from './machine/sprites';
import { useFlyIn } from './machine/useFlyIn';
import { CaseArtwork, type StageView } from './machine/CaseArtwork';
import { PartChip } from './machine/PartChip';
import { layoutFor, OVERLAY_SLOTS, type OverlaySlot } from './machine/caseLayouts';

interface MachinePreviewProps {
  selected: Partial<Record<SlotType, HardwareComponent>>;
  selectedCase: WorkbenchCase | null;
  ghost?: { slot: SlotType; component?: HardwareComponent; caseItem?: WorkbenchCase } | null;
  onClearSlot: (slot: SlotType) => void;
  modelName?: string;
}

/** Rendered sprite width per slot, as a fraction of the stage width. */
const CHIP_WIDTH: Record<OverlaySlot, number> = {
  cpu: 0.06,
  memory: 0.035,
  gpu: 0.11,
  sound: 0.09,
  storage: 0.1,
};

const storageKindOf = (component?: HardwareComponent): StorageKind => {
  const id = `${component?.id ?? ''} ${component?.name ?? ''}`.toLowerCase();
  if (id.includes('cassette') || id.includes('kassette')) return 'cassette';
  if (id.includes('cd')) return 'optical';
  if (id.includes('floppy') || id.includes('disket')) return 'floppy';
  return 'disk';
};

const matrixFor = (slot: OverlaySlot, component?: HardwareComponent): PixelMatrix => {
  switch (slot) {
    case 'cpu':
      return CPU_SPRITE;
    case 'memory':
      return RAM_SPRITE;
    case 'gpu':
      return GPU_SPRITE;
    case 'sound':
      return SOUND_SPRITE;
    case 'storage':
    default:
      return storageSprite(storageKindOf(component));
  }
};

/**
 * One single stage: the high-resolution chassis artwork of the chosen case.
 * Toggling between the closed machine and the opened chassis keeps the same
 * framing; installed parts are pixel sprites overlaid on the visible board.
 */
export const MachinePreview = ({
  selected,
  selectedCase,
  ghost,
  onClearSlot,
  modelName,
}: MachinePreviewProps) => {
  const { t } = useTranslation(['ui', 'hardware']);
  const [view, setView] = useState<StageView>('closed');

  const ghostSlot = ghost?.slot;
  const effectiveCase = selectedCase ?? (ghostSlot === 'case' ? ghost?.caseItem ?? null : null);
  const isGhostCase = !selectedCase && ghostSlot === 'case';
  const layout = layoutFor(effectiveCase?.id);

  const part = (slot: SlotType) => selected[slot] ?? (ghostSlot === slot ? ghost?.component : undefined);
  const isGhost = (slot: SlotType) => !selected[slot] && ghostSlot === slot;

  const display = part('display');
  const fullyBuilt = REQUIRED_SLOTS.every((s) => (s === 'case' ? !!selectedCase : !!selected[s]));

  const progressOf = useFlyIn({
    cpu: selected.cpu?.id,
    gpu: selected.gpu?.id,
    memory: selected.memory?.id,
    sound: selected.sound?.id,
    storage: selected.storage?.id,
    display: selected.display?.id,
    case: selectedCase?.id,
  });

  // Show the inside whenever an internal part changes, so the player sees it land.
  const innerSignature = OVERLAY_SLOTS.map((s) => selected[s]?.id ?? '').join('|');
  useEffect(() => {
    if (innerSignature.replace(/\|/g, '')) setView('open');
  }, [innerSignature]);

  const title = (modelName || t('ui:development.workbench.boot.unnamed')).slice(0, 16).toUpperCase();
  const screen = layout.screen;
  const screenStyle = {
    left: `${screen.x * 100}%`,
    top: `${screen.y * 100}%`,
    width: `${screen.w * 100}%`,
    height: `${screen.h * 100}%`,
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-center gap-1">
        {(['closed', 'open'] as StageView[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            aria-pressed={view === v}
            className={`px-3 py-1 text-[10px] font-mono uppercase tracking-widest rounded-sm border transition-colors ${
              view === v
                ? 'border-primary text-primary bg-primary/10'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(v === 'closed' ? 'ui:development.workbench.viewOutside' : 'ui:development.workbench.viewInside')}
          </button>
        ))}
      </div>

      <CaseArtwork caseItem={effectiveCase} view={view} isGhost={isGhostCase}>
        {effectiveCase && (
          <>
            {/* ---- screen state ---- */}
            {display ? (
              <div
                className="absolute pointer-events-none animate-fade-in"
                style={{
                  ...screenStyle,
                  boxShadow: `0 0 18px hsl(var(--screen-phosphor) / ${fullyBuilt ? 0.55 : 0.25})`,
                }}
              >
                <span className="absolute bottom-0 left-0 right-0 truncate px-1 pb-[2px] text-center font-mono text-[8px] sm:text-[10px] text-[hsl(var(--screen-phosphor))] drop-shadow">
                  {fullyBuilt ? `${title} ${t('ui:development.workbench.boot.ready')}` : title}
                </span>
              </div>
            ) : (
              <div
                className="absolute pointer-events-none flex items-center justify-center bg-background/85 border border-dashed animate-pulse"
                style={{ ...screenStyle, borderColor: slotColor('display', 0.8) }}
              >
                <span className="font-mono text-[8px] sm:text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t('ui:development.workbench.noDisplay')}
                </span>
              </div>
            )}

            {/* ---- installed parts / empty sockets ---- */}
            {view === 'open' &&
              OVERLAY_SLOTS.map((slot) => {
                const pos = layout.slots[slot];
                const component = part(slot);
                const style = { left: `${pos.x * 100}%`, top: `${pos.y * 100}%` };

                if (!component) {
                  if (!REQUIRED_SLOTS.includes(slot)) return null;
                  return (
                    <div
                      key={slot}
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[2px] border border-dashed animate-pulse pointer-events-none"
                      style={{
                        ...style,
                        width: `${CHIP_WIDTH[slot] * 100}%`,
                        aspectRatio: '1 / 1',
                        borderColor: slotColor(slot, 0.9),
                        background: slotColor(slot, 0.12),
                      }}
                      aria-hidden="true"
                    />
                  );
                }

                return (
                  <div key={slot} className="absolute" style={style}>
                    <PartChip
                      slot={slot}
                      matrix={matrixFor(slot, component)}
                      widthPct={CHIP_WIDTH[slot] * 4}
                      progress={isGhost(slot) ? 1 : progressOf(slot)}
                      ghost={isGhost(slot)}
                      label={component.name}
                      onClick={selected[slot] ? () => onClearSlot(slot) : undefined}
                    />
                  </div>
                );
              })}
          </>
        )}
      </CaseArtwork>

      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono text-center">
        {view === 'open'
          ? t('ui:development.workbench.removeHint')
          : t('ui:development.workbench.machineTitle')}
      </p>
    </div>
  );
};
