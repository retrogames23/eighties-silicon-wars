import { useTranslation } from 'react-i18next';
import { Cpu, Monitor, MemoryStick, Volume2, HardDrive, Package, Tv } from 'lucide-react';
import type { HardwareComponent } from '@/utils/HardwareManager';
import { PartTile } from './PartTile';
import { SLOT_ORDER, slotColor, type SlotType, type WorkbenchCase } from './partTokens';

interface PartsShelfProps {
  components: HardwareComponent[];
  cases: WorkbenchCase[];
  activeSlot: SlotType;
  onActiveSlotChange: (slot: SlotType) => void;
  selected: Partial<Record<SlotType, HardwareComponent>>;
  selectedCase: WorkbenchCase | null;
  onPickComponent: (component: HardwareComponent) => void;
  onPickCase: (item: WorkbenchCase) => void;
  onHover: (payload: { slot: SlotType; component?: HardwareComponent; caseItem?: WorkbenchCase } | null) => void;
}

const slotIcon: Record<SlotType, typeof Cpu> = {
  cpu: Cpu,
  gpu: Monitor,
  memory: MemoryStick,
  case: Package,
  sound: Volume2,
  storage: HardDrive,
  display: Tv,
};

const slotLabelKey: Record<SlotType, string> = {
  cpu: 'hardware:types.cpu',
  gpu: 'hardware:types.gpu',
  memory: 'hardware:types.memory',
  case: 'ui:development.workbench.slots.case',
  sound: 'hardware:types.sound',
  storage: 'hardware:types.storage',
  display: 'hardware:types.display',
};

export const PartsShelf = ({
  components, cases, activeSlot, onActiveSlotChange, selected, selectedCase,
  onPickComponent, onPickCase, onHover,
}: PartsShelfProps) => {
  const { t } = useTranslation(['ui', 'hardware']);

  const tiles = activeSlot === 'case'
    ? cases.map(item => (
        <PartTile
          key={item.id}
          slot="case"
          name={item.name}
          description={item.description}
          cost={item.price}
          rating={Math.round((item.quality + item.design) / 2)}
          available
          selected={selectedCase?.id === item.id}
          onPick={() => onPickCase(item)}
          onHoverStart={() => onHover({ slot: 'case', caseItem: item })}
          onHoverEnd={() => onHover(null)}
        />
      ))
    : components
        .filter(c => c.type === activeSlot)
        .map(component => (
          <PartTile
            key={component.id}
            slot={activeSlot}
            name={component.name}
            description={component.description?.startsWith('hardware:') ? t(component.description) : component.description}
            cost={component.cost}
            rating={component.performance}
            available={component.available}
            availableYear={component.year}
            availableQuarter={component.quarter}
            selected={selected[activeSlot]?.id === component.id}
            highlight={component.name.includes('⭐')}
            onPick={() => component.available && onPickComponent(component)}
            onHoverStart={() => component.available && onHover({ slot: activeSlot, component })}
            onHoverEnd={() => onHover(null)}
          />
        ));

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {SLOT_ORDER.map(slot => {
          const Icon = slotIcon[slot];
          const isActive = slot === activeSlot;
          const isFilled = slot === 'case' ? !!selectedCase : !!selected[slot];
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onActiveSlotChange(slot)}
              className={`shrink-0 min-h-[44px] px-3 py-2 rounded-md border text-xs font-mono flex items-center gap-2 transition-all
                ${isActive ? 'bg-card/60 border-neon-green text-neon-green' : 'bg-card/10 border-border/40 text-muted-foreground hover:bg-card/30'}`}
            >
              <Icon className="w-4 h-4" style={{ color: slotColor(slot, 0.95) }} />
              <span>{t(slotLabelKey[slot])}</span>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isFilled ? 'hsl(var(--neon-green))' : 'hsl(var(--muted-foreground) / 0.4)' }}
              />
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
        {tiles}
      </div>
    </div>
  );
};
