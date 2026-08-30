import { useTranslation } from 'react-i18next';
import type { WorkbenchCase } from '../partTokens';
import beigeTower from '@/assets/workbench/case-beige-tower.png';
import blackDesktop from '@/assets/workbench/case-black-desktop.png';
import gamerRgb from '@/assets/workbench/case-gamer-rgb.png';
import retroWood from '@/assets/workbench/case-retro-wood.png';
import premiumMetal from '@/assets/workbench/case-premium-metal.png';
import compactMini from '@/assets/workbench/case-compact-mini.png';

const ART: Record<string, string> = {
  'beige-tower': beigeTower,
  'black-desktop': blackDesktop,
  'gamer-rgb': gamerRgb,
  'retro-wood': retroWood,
  'premium-metal': premiumMetal,
  'compact-mini': compactMini,
};

interface CaseArtworkProps {
  caseItem: WorkbenchCase | null;
  /** True while only previewing a hovered case. */
  isGhost?: boolean;
}

/**
 * High-resolution 16-bit style artwork of the chosen chassis.
 * Purely presentational — it mirrors the selected case, no game logic.
 */
export const CaseArtwork = ({ caseItem, isGhost = false }: CaseArtworkProps) => {
  const { t } = useTranslation('ui');
  const src = caseItem ? ART[caseItem.id] ?? beigeTower : null;

  return (
    <div className="relative overflow-hidden rounded-md retro-border bg-background/60">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_35%,hsl(var(--neon-cyan)/0.14),transparent_65%)]" />
      {src ? (
        <img
          key={src}
          src={src}
          alt={t('development.workbench.artworkAlt', { name: caseItem?.name ?? '' })}
          loading="lazy"
          width={1200}
          height={896}
          className={`relative w-full h-auto object-contain animate-fade-in [image-rendering:pixelated] ${
            isGhost ? 'opacity-50' : 'opacity-100'
          }`}
        />
      ) : (
        <div className="relative flex aspect-[4/3] items-center justify-center px-4 text-center">
          <p className="text-xs text-muted-foreground font-mono">
            {t('development.workbench.artworkEmpty')}
          </p>
        </div>
      )}
    </div>
  );
};
