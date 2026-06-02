/**
 * AiCompetitorsPanel
 *
 * Zeigt die drei lebenden KI-Konkurrenten samt ihrer letzten Quartalsaktion.
 * Daten kommen aus der DB-Tabelle `ai_competitors` (siehe CompetitorsService).
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AiCompetitor } from '@/services/CompetitorsService';

interface AiCompetitorsPanelProps {
  competitors: AiCompetitor[];
}

const ACTION_TONE: Record<string, string> = {
  price_cut: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  price_hike: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  new_model_announce: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  marketing_push: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  layoffs: 'bg-red-500/15 text-red-400 border-red-500/30',
  partnership: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  quiet_quarter: 'bg-muted text-muted-foreground border-border',
};

export const AiCompetitorsPanel = ({ competitors }: AiCompetitorsPanelProps) => {
  const { t } = useTranslation();
  if (!competitors || competitors.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4" />
          {t('ui:competitors.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {competitors.map((c) => {
          const action = c.last_action?.action_kind;
          return (
            <div
              key={c.id}
              className="border rounded-md p-3 space-y-2 bg-muted/20"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {c.archetype}
                  </div>
                </div>
                <div className="text-right text-xs whitespace-nowrap">
                  <div>{t('ui:competitors.market')}: <span className="font-mono">{c.market_share.toFixed(1)}%</span></div>
                  <div>{t('ui:competitors.reputation')}: <span className="font-mono">{Math.round(c.reputation)}</span></div>
                </div>
              </div>

              {action && (
                <div className="space-y-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${ACTION_TONE[action] ?? ''}`}
                  >
                    {t(`ui:competitors.actions.${action}`, { defaultValue: action })}
                    {c.last_action_year && c.last_action_quarter
                      ? ` · Q${c.last_action_quarter}/${c.last_action_year}`
                      : ''}
                  </Badge>
                  {c.last_action.headline && (
                    <p className="text-xs italic text-muted-foreground line-clamp-2">
                      „{c.last_action.headline}"
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
