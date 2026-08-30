import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { WorkbenchCase } from '../partTokens';
import { layoutFor } from './caseLayouts';

export type StageView = 'closed' | 'open';

interface CaseArtworkProps {
  caseItem: WorkbenchCase | null;
  view: StageView;
  /** True while only previewing a hovered case. */
  isGhost?: boolean;
  /** Overlay layer (installed parts, sockets, screen state). */
  children?: ReactNode;
}

/**
 * High-resolution 16-bit artwork stage of the chosen chassis.
 * Purely presentational — it mirrors the selected case, no game logic.
 */
export const CaseArtwork = ({ caseItem, view, isGhost = false, children }: CaseArtworkProps) => {
  const { t } = useTranslation('ui');
  const layout = caseItem ? layoutFor(caseItem.id) : null;
  const src = layout ? layout[view] : null;

  return (
    <div className="relative overflow-hidden rounded-md retro-border bg-background/60">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_35%,hsl(var(--neon-cyan)/0.14),transparent_65%)]" />
      {src ? (
        <div className="relative">
          <img
            key={src}
            src={src}
            alt={t(
              view === 'open'
                ? 'development.workbench.insideAlt'
                : 'development.workbench.artworkAlt',
              { name: caseItem?.name ?? '' }
            )}
            width={1200}
            height={896}
            className={`relative block w-full h-auto object-contain animate-fade-in [image-rendering:pixelated] ${
              isGhost ? 'opacity-50' : 'opacity-100'
            }`}
          />
          <div className="absolute inset-0">{children}</div>
        </div>
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
