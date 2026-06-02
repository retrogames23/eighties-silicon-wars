/**
 * AnnualMeeting (Phase 3a)
 *
 * Jahreshauptversammlung am Ende eines Spieljahres (nach Q4).
 * Zeigt eine zusammenfassende Bilanz und ein knappes Aktionärs-Verdikt.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { AiCompetitor } from '@/services/CompetitorsService';

interface AnnualMeetingProps {
  isOpen: boolean;
  onClose: () => void;
  year: number; // das gerade abgeschlossene Jahr
  yearRevenue: number;
  cash: number;
  reputation: number;
  marketShare: number;
  modelsReleased: number;
  competitors: AiCompetitor[];
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function verdict(reputation: number, marketShare: number, yearRevenue: number) {
  const score =
    (reputation - 50) * 0.4 + marketShare * 1.5 + Math.min(20, yearRevenue / 500_000);
  if (score > 25) {
    return {
      icon: TrendingUp,
      tone: 'text-emerald-400',
      headline: 'Aktionärinnen zufrieden',
      body: 'Margarete Vogel hebt das Glas: „Solides Jahr. Weiter so — aber ruht euch nicht aus."',
    };
  }
  if (score < 0) {
    return {
      icon: TrendingDown,
      tone: 'text-red-400',
      headline: 'Aktionärinnen unzufrieden',
      body: 'Margarete Vogel runzelt die Stirn: „Das nächste Jahr braucht klare Ergebnisse, sonst gibt es Konsequenzen."',
    };
  }
  return {
    icon: Minus,
    tone: 'text-yellow-400',
    headline: 'Aktionärinnen abwartend',
    body: 'Margarete Vogel nickt knapp: „Solide. Aber wir hätten mehr erwartet."',
  };
}

export const AnnualMeeting = ({
  isOpen,
  onClose,
  year,
  yearRevenue,
  cash,
  reputation,
  marketShare,
  modelsReleased,
  competitors,
}: AnnualMeetingProps) => {
  const v = verdict(reputation, marketShare, yearRevenue);
  const Icon = v.icon;

  const topCompetitor = [...competitors].sort((a, b) => b.market_share - a.market_share)[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Jahreshauptversammlung {year}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">Jahresumsatz</div>
                <div className="text-right font-mono">{formatCurrency(yearRevenue)}</div>
                <div className="text-muted-foreground">Liquide Mittel</div>
                <div className="text-right font-mono">{formatCurrency(cash)}</div>
                <div className="text-muted-foreground">Reputation</div>
                <div className="text-right font-mono">{Math.round(reputation)} / 100</div>
                <div className="text-muted-foreground">Marktanteil</div>
                <div className="text-right font-mono">{marketShare.toFixed(1)} %</div>
                <div className="text-muted-foreground">Neue Modelle</div>
                <div className="text-right font-mono">{modelsReleased}</div>
              </div>
            </CardContent>
          </Card>

          {topCompetitor && (
            <Card>
              <CardContent className="pt-4 text-sm space-y-1">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">
                  Stärkster Konkurrent
                </div>
                <div className="font-semibold">{topCompetitor.name}</div>
                <div className="text-xs text-muted-foreground">
                  Marktanteil {topCompetitor.market_share.toFixed(1)} % · Ruf{' '}
                  {Math.round(topCompetitor.reputation)}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="border rounded-md p-3 bg-muted/30 flex gap-3 items-start">
            <Icon className={`w-5 h-5 mt-0.5 ${v.tone}`} />
            <div>
              <div className={`font-semibold text-sm ${v.tone}`}>{v.headline}</div>
              <p className="text-sm text-muted-foreground mt-1">{v.body}</p>
            </div>
          </div>

          <Button className="w-full" onClick={onClose}>
            Neues Geschäftsjahr beginnen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
