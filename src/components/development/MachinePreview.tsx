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
import { PixelSprite } from './machine/PixelSprite';
import { partShades, spriteColors } from './machine/pixelPalette';
import { CaseArtwork } from './machine/CaseArtwork';
import { OVERLAY_SLOTS, type OverlaySlot } from './machine/caseLayouts';

interface MachinePreviewProps {
  selected: Partial<Record<SlotType, HardwareComponent>>;
  selectedCase: WorkbenchCase | null;
  ghost?: { slot: SlotType; component?: HardwareComponent; caseItem?: WorkbenchCase } | null;
  onClearSlot: (slot: SlotType) => void;
  modelName?: string;
}

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
 * One stage: the chassis artwork of the chosen case (opened as soon as parts are
 * installed) plus a clear parts bay listing every internal slot.
 * Purely presentational — no game logic.
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

  const display = part('display');
  const fullyBuilt = REQUIRED_SLOTS.every((s) => (s === 'case' ? !!selectedCase : !!selected[s]));
  const hasInternals = OVERLAY_SLOTS.some((s) => !!selected[s]);

  const title = (modelName || t('ui:development.workbench.boot.unnamed')).slice(0, 16).toUpperCase();

  return (
    <div className="w-full space-y-3">
      <CaseArtwork caseItem={effectiveCase} view={hasInternals ? 'open' : 'closed'} isGhost={isGhostCase} />

      {/* screen status */}
      <p className="text-center font-mono text-[10px] uppercase tracking-widest">
        {display ? (
          <span className="text-[hsl(var(--screen-phosphor))]">
            {fullyBuilt ? `${title} ${t('ui:development.workbench.boot.ready')}` : title}
          </span>
        ) : (
          <span className="text-muted-foreground">{t('ui:development.workbench.noDisplay')}</span>
        )}
      </p>

      {/* parts bay */}
      <div className="grid grid-cols-5 gap-2">
        {OVERLAY_SLOTS.map((slot) => {
          const component = part(slot);
          const shades = partShades(slot);
          const matrix = matrixFor(slot, component);
          const cols = Math.max(...matrix.map((r) => r.length));
          const installed = !!selected[slot];

          return (
            <button
              key={slot}
              type="button"
              onClick={installed ? () => onClearSlot(slot) : undefined}
              disabled={!installed}
              title={component?.name ?? t(`ui:development.workbench.slots.${slot}`)}
              aria-label={component?.name ?? t(`ui:development.workbench.slots.${slot}`)}
              className="flex flex-col items-center gap-1 rounded-sm border p-2 transition-colors disabled:cursor-default"
              style={{
                borderColor: slotColor(slot, component ? 0.9 : 0.35),
                background: component ? slotColor(slot, 0.12) : 'transparent',
                borderStyle: component ? 'solid' : 'dashed',
                opacity: isGhost(slot) ? 0.6 : 1,
              }}
            >
              <svg
                viewBox={`0 0 ${cols} ${matrix.length}`}
                className="w-full h-auto [image-rendering:pixelated]"
                shapeRendering="crispEdges"
                aria-hidden="true"
                style={{ opacity: component ? 1 : 0.25 }}
              >
                <PixelSprite matrix={matrix} colors={spriteColors(shades, { W: shades.bright })} x={0} y={0} />
              </svg>
              <span className="w-full truncate text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {component?.name ?? t(`ui:development.workbench.slots.${slot}`)}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {hasInternals
          ? t('ui:development.workbench.removeHint')
          : t('ui:development.workbench.machineTitle')}
      </p>
    </div>
  );
};
