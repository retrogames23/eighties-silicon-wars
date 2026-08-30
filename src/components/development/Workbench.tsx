import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Wrench, MonitorSmartphone, Gauge } from 'lucide-react';
import type { HardwareComponent } from '@/utils/HardwareManager';
import { PartsShelf } from './PartsShelf';
import { MachinePreview } from './MachinePreview';
import { StatsPanel } from './StatsPanel';
import { QuickBuildPresets, type PresetKind } from './QuickBuildPresets';
import { REQUIRED_SLOTS, type SlotType, type WorkbenchCase } from './partTokens';

interface WorkbenchProps {
  components: HardwareComponent[];
  cases: WorkbenchCase[];
  selected: Partial<Record<SlotType, HardwareComponent>>;
  selectedCase: WorkbenchCase | null;
  onPickComponent: (component: HardwareComponent) => void;
  onPickCase: (item: WorkbenchCase) => void;
  onClearSlot: (slot: SlotType) => void;
  onApplyPreset: (kind: PresetKind) => void;
  modelName: string;
  onModelNameChange: (value: string) => void;
  sellingPrice: number;
  onPriceChange: (value: number) => void;
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  totalCost: number;
  performance: number;
  eraScore: number;
  currentYear: number;
  canFinish: boolean;
  onFinish: () => void;
}

export const Workbench = (props: WorkbenchProps) => {
  const { t } = useTranslation(['ui', 'hardware']);
  const [activeSlot, setActiveSlot] = useState<SlotType>('cpu');
  const [ghost, setGhost] = useState<{ slot: SlotType; component?: HardwareComponent; caseItem?: WorkbenchCase } | null>(null);

  const delta = useMemo(() => {
    if (!ghost) return null;
    const current = props.selected[ghost.slot];
    if (ghost.slot === 'case' && ghost.caseItem) {
      return { performance: 0, cost: ghost.caseItem.price - (props.selectedCase?.price ?? 0) };
    }
    if (!ghost.component) return null;
    return {
      performance: ghost.component.performance - (current?.performance ?? 0),
      cost: ghost.component.cost - (current?.cost ?? 0),
    };
  }, [ghost, props.selected, props.selectedCase]);

  const missingSlots = REQUIRED_SLOTS.filter(slot =>
    slot === 'case' ? !props.selectedCase : !props.selected[slot]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Live machine — sticky on mobile so it stays visible while picking parts */}
      <Card className="retro-border bg-card/20 backdrop-blur-sm order-1 lg:order-2 lg:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-neon-cyan flex items-center gap-2 text-base">
            <MonitorSmartphone className="w-4 h-4" />
            {t('ui:development.workbench.machineTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MachinePreview
            selected={props.selected}
            selectedCase={props.selectedCase}
            ghost={ghost}
            onClearSlot={props.onClearSlot}
          />

          <div className="space-y-2">
            <Label htmlFor="wb-name" className="text-xs text-muted-foreground">
              {t('ui:development.workbench.nameLabel')}
            </Label>
            <Input
              id="wb-name"
              value={props.modelName}
              onChange={(e) => props.onModelNameChange(e.target.value)}
              placeholder={t('ui:development.workbench.namePlaceholder')}
              className="bg-background border-terminal-green/30 focus:border-terminal-green"
            />
            <Label htmlFor="wb-price" className="text-xs text-muted-foreground">
              {t('ui:development.workbench.priceLabel')}
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-terminal-green font-mono">$</span>
              <Input
                id="wb-price"
                type="number"
                value={props.sellingPrice || ''}
                onChange={(e) => props.onPriceChange(parseInt(e.target.value) || 0)}
                placeholder={props.suggestedPrice.toString()}
                className="bg-background border-terminal-green/30 focus:border-terminal-green font-mono"
              />
              <Button
                size="sm"
                variant="outline"
                className="retro-border bg-card/20 shrink-0 min-h-[44px]"
                onClick={() => props.onPriceChange(props.suggestedPrice)}
              >
                {t('ui:development.workbench.useRecommended')}
              </Button>
            </div>
          </div>

          <Button
            onClick={props.onFinish}
            disabled={!props.canFinish}
            className="w-full glow-button min-h-[44px]"
          >
            <Zap className="w-4 h-4 mr-2" />
            {t('ui:development.workbench.buildButton')}
          </Button>
          {missingSlots.length > 0 && (
            <p className="text-xs text-amber text-center">
              {t('ui:development.workbench.missingParts', {
                parts: missingSlots.map(s => t(`ui:development.workbench.slots.${s}`)).join(', '),
              })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Parts shelf */}
      <Card className="retro-border bg-card/20 backdrop-blur-sm order-2 lg:order-1 lg:col-span-5">
        <CardHeader className="pb-2">
          <CardTitle className="text-neon-cyan flex items-center gap-2 text-base">
            <Wrench className="w-4 h-4" />
            {t('ui:development.workbench.shelfTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <QuickBuildPresets onApply={props.onApplyPreset} />
          <PartsShelf
            components={props.components}
            cases={props.cases}
            activeSlot={activeSlot}
            onActiveSlotChange={setActiveSlot}
            selected={props.selected}
            selectedCase={props.selectedCase}
            onPickComponent={props.onPickComponent}
            onPickCase={props.onPickCase}
            onHover={setGhost}
          />
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="retro-border bg-card/20 backdrop-blur-sm order-3 lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-neon-cyan flex items-center gap-2 text-base">
            <Gauge className="w-4 h-4" />
            {t('ui:development.workbench.statsTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatsPanel
            selected={props.selected}
            selectedCase={props.selectedCase}
            performance={props.performance}
            eraScore={props.eraScore}
            totalCost={props.totalCost}
            sellingPrice={props.sellingPrice}
            suggestedPrice={props.suggestedPrice}
            minPrice={props.minPrice}
            maxPrice={props.maxPrice}
            currentYear={props.currentYear}
            delta={delta}
          />
        </CardContent>
      </Card>
    </div>
  );
};
