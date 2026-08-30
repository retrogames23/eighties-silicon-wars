import { useTranslation } from 'react-i18next';
import { Coins, Scale, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type PresetKind = 'budget' | 'balanced' | 'highend';

interface QuickBuildPresetsProps {
  onApply: (kind: PresetKind) => void;
}

export const QuickBuildPresets = ({ onApply }: QuickBuildPresetsProps) => {
  const { t } = useTranslation(['ui']);
  const presets: { kind: PresetKind; icon: typeof Coins }[] = [
    { kind: 'budget', icon: Coins },
    { kind: 'balanced', icon: Scale },
    { kind: 'highend', icon: Rocket },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground mr-1">
        {t('ui:development.workbench.presets.label')}
      </span>
      {presets.map(({ kind, icon: Icon }) => (
        <Button
          key={kind}
          size="sm"
          variant="outline"
          className="retro-border bg-card/20 min-h-[44px]"
          onClick={() => onApply(kind)}
        >
          <Icon className="w-4 h-4 mr-2" />
          {t(`ui:development.workbench.presets.${kind}`)}
        </Button>
      ))}
    </div>
  );
};
