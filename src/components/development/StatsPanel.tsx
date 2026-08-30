import { useTranslation } from 'react-i18next';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { HardwareComponent } from '@/utils/HardwareManager';
import { slotColor, type SlotType, type WorkbenchCase } from './partTokens';

interface StatsPanelProps {
  selected: Partial<Record<SlotType, HardwareComponent>>;
  selectedCase: WorkbenchCase | null;
  performance: number;
  eraScore: number;
  totalCost: number;
  sellingPrice: number;
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  currentYear: number;
  delta?: { performance: number; cost: number } | null;
}

const Ring = ({ value, label }: { value: number; label: string }) => {
  const r = 34;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 90 90" className="w-24 h-24">
        <circle cx="45" cy="45" r={r} fill="none" stroke="hsl(var(--muted-foreground) / 0.2)" strokeWidth="8" />
        <circle
          cx="45" cy="45" r={r} fill="none"
          stroke="hsl(var(--neon-green))" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          transform="rotate(-90 45 45)"
          className="transition-all duration-300"
        />
        <text x="45" y="50" textAnchor="middle" className="fill-neon-green font-mono" fontSize="18">{pct}</text>
      </svg>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
};

export const StatsPanel = ({
  selected, selectedCase, performance, eraScore, totalCost, sellingPrice,
  suggestedPrice, minPrice, maxPrice, currentYear, delta,
}: StatsPanelProps) => {
  const { t } = useTranslation(['ui']);

  const costParts: { slot: SlotType; cost: number; name: string }[] = [
    ...(Object.entries(selected) as [SlotType, HardwareComponent][])
      .filter(([, c]) => !!c)
      .map(([slot, c]) => ({ slot, cost: c.cost, name: c.name })),
    ...(selectedCase ? [{ slot: 'case' as SlotType, cost: selectedCase.price, name: selectedCase.name }] : []),
  ];

  const margin = totalCost > 0 ? Math.round(((sellingPrice - totalCost) / totalCost) * 100) : 0;
  const priceRatio = maxPrice > minPrice
    ? Math.min(1, Math.max(0, (sellingPrice - minPrice) / (maxPrice - minPrice)))
    : 0;

  // Presentational audience hint (display only, no simulation logic).
  const expectedGamer = 600 + (currentYear - 1983) * 150;
  const expectedBusiness = 1200 + (currentYear - 1983) * 300;
  const fit = (expected: number) =>
    sellingPrice > 0 ? Math.round(Math.max(0, 100 - (Math.abs(sellingPrice - expected) / expected) * 100)) : 0;
  const designBonus = selectedCase ? (selectedCase.type === 'gamer' ? 10 : -5) : 0;
  const gamerFit = Math.min(100, Math.max(0, Math.round(fit(expectedGamer) * 0.7 + performance * 0.3) + designBonus));
  const businessFit = Math.min(100, Math.max(0, Math.round(fit(expectedBusiness) * 0.7 + eraScore * 0.3) - designBonus));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-around">
        <Ring value={performance} label={t('ui:development.workbench.stats.performance')} />
        <Ring value={eraScore} label={t('ui:development.workbench.stats.eraScore')} />
      </div>

      {delta && (delta.performance !== 0 || delta.cost !== 0) && (
        <div className="flex items-center justify-center gap-4 text-xs font-mono">
          <span className={delta.performance >= 0 ? 'text-neon-green' : 'text-destructive'}>
            {delta.performance >= 0 ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />}
            {' '}{t('ui:development.workbench.stats.performance')} {delta.performance > 0 ? '+' : ''}{delta.performance}
          </span>
          <span className={delta.cost <= 0 ? 'text-neon-green' : 'text-amber'}>
            {delta.cost > 0 ? '+' : ''}${delta.cost.toLocaleString()}
          </span>
        </div>
      )}

      {/* Stacked cost bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">{t('ui:development.workbench.stats.cost')}</span>
          <span className="font-mono text-amber">${totalCost.toLocaleString()}</span>
        </div>
        <div className="flex h-3 w-full rounded overflow-hidden bg-muted/20">
          {costParts.map(p => (
            <div
              key={p.slot}
              title={`${p.name}: $${p.cost.toLocaleString()}`}
              style={{
                width: totalCost > 0 ? `${(p.cost / totalCost) * 100}%` : '0%',
                backgroundColor: slotColor(p.slot, 0.85),
              }}
            />
          ))}
        </div>
      </div>

      {/* Price / margin */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">{t('ui:development.workbench.stats.price')}</span>
          <span className="font-mono text-neon-cyan">${sellingPrice.toLocaleString()}</span>
        </div>
        <div className="relative h-3 w-full rounded overflow-hidden bg-muted/20">
          <div className="absolute inset-y-0 left-0 w-1/4" style={{ backgroundColor: 'hsl(var(--destructive) / 0.35)' }} />
          <div className="absolute inset-y-0 left-1/4 right-1/4" style={{ backgroundColor: 'hsl(var(--neon-green) / 0.3)' }} />
          <div className="absolute inset-y-0 right-0 w-1/4" style={{ backgroundColor: 'hsl(var(--amber) / 0.3)' }} />
          <div
            className="absolute top-[-3px] w-1 h-[18px] rounded bg-neon-cyan transition-all"
            style={{ left: `calc(${priceRatio * 100}% - 2px)` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground mt-1 font-mono">
          <span>${minPrice.toLocaleString()}</span>
          <span className="text-neon-green">
            {t('ui:development.workbench.stats.margin', { pct: margin })}
          </span>
          <span>${maxPrice.toLocaleString()}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          {t('ui:development.workbench.stats.recommended', { price: `$${suggestedPrice.toLocaleString()}` })}
        </p>
      </div>

      {/* Audience match */}
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground">{t('ui:development.workbench.stats.audience')}</span>
        {[
          { label: t('ui:development.workbench.stats.gamer'), value: gamerFit, slot: 'gpu' as SlotType },
          { label: t('ui:development.workbench.stats.business'), value: businessFit, slot: 'memory' as SlotType },
        ].map(row => (
          <div key={row.label} className="flex items-center gap-2">
            <span className="text-[11px] w-20 shrink-0 text-muted-foreground">{row.label}</span>
            <div className="flex-1 h-2 rounded bg-muted/20 overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${row.value}%`, backgroundColor: slotColor(row.slot, 0.9) }}
              />
            </div>
            <span className="text-[11px] font-mono w-9 text-right text-muted-foreground">{row.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
