import { useTranslation } from 'react-i18next';
import type { HardwareComponent } from '@/utils/HardwareManager';
import { caseColor, slotColor, type SlotType, type WorkbenchCase } from './partTokens';

interface MachinePreviewProps {
  selected: Partial<Record<SlotType, HardwareComponent>>;
  selectedCase: WorkbenchCase | null;
  ghost?: { slot: SlotType; component?: HardwareComponent; caseItem?: WorkbenchCase } | null;
  onClearSlot: (slot: SlotType) => void;
}

/**
 * Live 80s-style rendering of the machine being assembled.
 * Purely presentational — every layer reacts to the current selection.
 */
export const MachinePreview = ({ selected, selectedCase, ghost, onClearSlot }: MachinePreviewProps) => {
  const { t } = useTranslation(['ui', 'hardware']);

  const ghostSlot = ghost?.slot;
  const effectiveCase = selectedCase ?? (ghostSlot === 'case' ? ghost?.caseItem ?? null : null);
  const isGhostCase = !selectedCase && ghostSlot === 'case';

  const part = (slot: SlotType) =>
    selected[slot] ?? (ghostSlot === slot ? ghost?.component : undefined);
  const isGhost = (slot: SlotType) => !selected[slot] && ghostSlot === slot;

  const cpu = part('cpu');
  const gpu = part('gpu');
  const memory = part('memory');
  const sound = part('sound');
  const storage = part('storage');
  const display = part('display');

  const bodyFill = caseColor(effectiveCase?.id, isGhostCase ? 0.4 : 1);
  const bodyStroke = caseColor(effectiveCase?.id, 0.6);
  const isRgbCase = effectiveCase?.id === 'gamer-rgb';

  const screenBars = gpu ? Math.max(2, Math.round(gpu.performance / 12)) : 0;

  const clickable = (slot: SlotType) => ({
    onClick: () => selected[slot] && onClearSlot(slot),
    style: { cursor: selected[slot] ? 'pointer' : 'default' } as const,
  });

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 320 250"
        className="w-full h-auto"
        role="img"
        aria-label={t('ui:development.workbench.previewAlt')}
      >
        <defs>
          <linearGradient id="wb-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--neon-cyan) / 0.35)" />
            <stop offset="100%" stopColor="hsl(var(--background))" />
          </linearGradient>
        </defs>

        {/* Monitor / display slot */}
        <g {...clickable('display')}>
          {display ? (
            <>
              <rect
                x="66" y="8" width="188" height="122" rx="8"
                fill={caseColor(effectiveCase?.id, 0.9)}
                stroke={slotColor('display', isGhost('display') ? 0.4 : 0.9)}
                strokeWidth="2"
                opacity={isGhost('display') ? 0.5 : 1}
              />
              <rect x="80" y="20" width="160" height="92" rx="4" fill="url(#wb-screen)" />
              {screenBars > 0 && (
                <g opacity={isGhost('gpu') ? 0.5 : 1}>
                  {Array.from({ length: screenBars }).map((_, i) => (
                    <rect
                      key={i}
                      x={88}
                      y={28 + i * 7}
                      width={Math.min(144, 24 + ((i * 37) % 120))}
                      height="4"
                      rx="2"
                      fill={slotColor('gpu', 0.85)}
                    />
                  ))}
                </g>
              )}
              <rect x="150" y="118" width="20" height="8" fill={caseColor(effectiveCase?.id, 0.7)} />
            </>
          ) : (
            <rect
              x="66" y="8" width="188" height="122" rx="8"
              fill="transparent"
              stroke={slotColor('display', 0.45)}
              strokeWidth="2"
              strokeDasharray="6 6"
            />
          )}
        </g>

        {/* Case body */}
        <g {...clickable('case')}>
          {effectiveCase ? (
            <rect
              x="70" y="140" width="180" height="72" rx="6"
              fill={bodyFill}
              stroke={bodyStroke}
              strokeWidth="2"
            />
          ) : (
            <rect
              x="70" y="140" width="180" height="72" rx="6"
              fill="transparent"
              stroke={slotColor('case', 0.45)}
              strokeWidth="2"
              strokeDasharray="6 6"
              className="animate-pulse"
            />
          )}
        </g>

        {/* CPU badge / power LED */}
        <g {...clickable('cpu')}>
          {cpu ? (
            <>
              <rect
                x="84" y="152" width="34" height="34" rx="4"
                fill={slotColor('cpu', isGhost('cpu') ? 0.35 : 0.75)}
                stroke={slotColor('cpu', 0.9)}
              />
              {Array.from({ length: 4 }).map((_, i) => (
                <rect key={i} x={80} y={158 + i * 8} width="4" height="3" fill={slotColor('cpu', 0.9)} />
              ))}
              {cpu.performance >= 60 && (
                <circle cx="101" cy="200" r="4" fill="hsl(var(--neon-green))" className="animate-pulse" />
              )}
            </>
          ) : (
            <rect
              x="84" y="152" width="34" height="34" rx="4"
              fill="transparent" stroke={slotColor('cpu', 0.5)} strokeDasharray="4 4"
              className="animate-pulse"
            />
          )}
        </g>

        {/* Memory sticks */}
        <g {...clickable('memory')}>
          {memory ? (
            Array.from({ length: Math.max(1, Math.round(memory.performance / 30)) }).map((_, i) => (
              <rect
                key={i}
                x={128 + i * 9} y="152" width="6" height="34" rx="1"
                fill={slotColor('memory', isGhost('memory') ? 0.35 : 0.8)}
              />
            ))
          ) : (
            <rect x="128" y="152" width="24" height="34" rx="2" fill="transparent" stroke={slotColor('memory', 0.5)} strokeDasharray="4 4" className="animate-pulse" />
          )}
        </g>

        {/* Storage bay */}
        <g {...clickable('storage')}>
          {storage ? (
            <>
              <rect
                x="166" y="152" width="70" height="16" rx="2"
                fill={slotColor('storage', isGhost('storage') ? 0.3 : 0.7)}
                stroke={slotColor('storage', 0.9)}
              />
              <rect x="172" y="158" width="40" height="4" rx="2" fill="hsl(var(--background) / 0.6)" />
            </>
          ) : (
            <rect x="166" y="152" width="70" height="16" rx="2" fill="transparent" stroke={slotColor('storage', 0.4)} strokeDasharray="4 4" />
          )}
        </g>

        {/* Sound grill */}
        <g {...clickable('sound')}>
          {sound ? (
            Array.from({ length: Math.max(2, Math.round(sound.performance / 15)) }).map((_, i) => (
              <circle
                key={i}
                cx={172 + (i % 6) * 11}
                cy={182 + Math.floor(i / 6) * 11}
                r="3"
                fill={slotColor('sound', isGhost('sound') ? 0.3 : 0.75)}
              />
            ))
          ) : (
            <rect x="166" y="176" width="70" height="22" rx="2" fill="transparent" stroke={slotColor('sound', 0.4)} strokeDasharray="4 4" />
          )}
        </g>

        {/* RGB strip for gaming case */}
        {isRgbCase && (
          <rect x="70" y="206" width="180" height="4" rx="2" fill="hsl(var(--neon-magenta))" className="animate-pulse" />
        )}

        {/* Keyboard */}
        <rect x="62" y="222" width="196" height="20" rx="4" fill={caseColor(effectiveCase?.id, 0.85)} stroke={bodyStroke} />
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x={70 + i * 13} y="228" width="9" height="4" rx="1" fill="hsl(var(--background) / 0.55)" />
        ))}
      </svg>

      <p className="text-xs text-muted-foreground text-center mt-2">
        {t('ui:development.workbench.removeHint')}
      </p>
    </div>
  );
};
