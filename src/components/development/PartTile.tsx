import { useTranslation } from 'react-i18next';
import { Lock, Check } from 'lucide-react';
import { slotColor, type SlotType } from './partTokens';

interface PartTileProps {
  slot: SlotType;
  name: string;
  description?: string;
  cost: number;
  rating: number; // 0-100
  available: boolean;
  availableYear?: number;
  availableQuarter?: number;
  selected: boolean;
  highlight?: boolean;
  onPick: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

/** Single clickable part card with a mini performance bar and cost chip. */
export const PartTile = ({
  slot, name, description, cost, rating, available, availableYear, availableQuarter,
  selected, highlight, onPick, onHoverStart, onHoverEnd,
}: PartTileProps) => {
  const { t } = useTranslation(['ui', 'hardware']);
  const segments = 5;
  const filled = Math.round((Math.min(100, Math.max(0, rating)) / 100) * segments);

  return (
    <button
      type="button"
      disabled={!available}
      onClick={onPick}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      className={`relative w-full min-h-[44px] text-left p-3 rounded-lg border transition-all
        ${!available
          ? 'border-border/40 bg-muted/10 opacity-50 cursor-not-allowed'
          : selected
            ? 'border-neon-green bg-neon-green/10 shadow-[0_0_12px_hsl(var(--neon-green)/0.25)]'
            : 'border-terminal-green/30 bg-card/10 hover:border-terminal-green/60 hover:bg-card/30'}
        ${highlight ? 'ring-2 ring-amber/60' : ''}`}
      style={{ borderLeftWidth: 4, borderLeftColor: slotColor(slot, available ? 0.9 : 0.3) }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="block font-semibold text-sm text-foreground truncate">{name}</span>
          {description && (
            <span className="block text-[11px] text-muted-foreground line-clamp-2">{description}</span>
          )}
        </div>
        <span className="shrink-0 text-xs font-mono text-amber">${cost.toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-1 mt-2">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-sm"
            style={{ backgroundColor: slotColor(slot, i < filled ? 0.9 : 0.18) }}
          />
        ))}
      </div>

      {!available && (
        <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-amber">
          <Lock className="w-3 h-3" />
          {t('hardware:availability.availableAt', { year: availableYear, quarter: availableQuarter || 1 })}
        </span>
      )}
      {selected && available && (
        <span className="absolute top-2 right-2 text-neon-green">
          <Check className="w-4 h-4" />
        </span>
      )}
    </button>
  );
};
