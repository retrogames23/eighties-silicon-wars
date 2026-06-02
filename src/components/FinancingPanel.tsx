// Finanzierungs-Panel: Bankkredit & VC-Pitch in einem Tab.
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Landmark, TrendingUp, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  calculateLoanOffer,
  calcQuarterlyAnnuity,
  type Loan, type VcRound,
} from "@/types/financing";
import { LoanService } from "@/services/LoanService";
import { VcPitchService, type CompanySnapshot } from "@/services/VcPitchService";
import { pickVcForRound, type VcCharacter } from "@/lib/vcCharacters";

interface FinancingPanelProps {
  gameState: any;
  onCashChange: (delta: number) => void;
  onReloadGameState?: () => void;
}

export function FinancingPanel({ gameState, onCashChange }: FinancingPanelProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [vcRounds, setVcRounds] = useState<VcRound[]>([]);
  const [recentRevenues, setRecentRevenues] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const [activeLoans, rounds] = await Promise.all([
          LoanService.listActive(uid),
          VcPitchService.listRounds(uid),
        ]);
        setLoans(activeLoans);
        setVcRounds(rounds);
      }
    })();
  }, []);

  // Letzte bis zu 4 Quartalsumsätze: vereinfacht aus aktuellem Quartalsumsatz.
  // (In voller Version aus Quarter-Log; vorerst nehmen wir den aktuellen × Faktor.)
  useEffect(() => {
    const q = gameState.company?.quarterlyRevenue ?? (gameState.company?.monthlyIncome ?? 0) * 3;
    setRecentRevenues(q > 0 ? [q, q * 0.9, q * 0.8, q * 0.7] : []);
  }, [gameState.company?.quarterlyRevenue, gameState.company?.monthlyIncome]);

  const reload = async () => {
    if (!userId) return;
    const [activeLoans, rounds] = await Promise.all([
      LoanService.listActive(userId),
      VcPitchService.listRounds(userId),
    ]);
    setLoans(activeLoans);
    setVcRounds(rounds);
  };

  const outstandingDebt = loans.reduce((s, l) => s + Number(l.outstanding_balance), 0);
  const acceptedRounds = vcRounds.filter(r => r.status === "accepted");
  const equityGivenAway = acceptedRounds.reduce((s, r) => s + Number(r.offered_equity_pct), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="retro-border">
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground">Offene Schulden</div>
            <div className="text-2xl font-bold">${Math.round(outstandingDebt).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="retro-border">
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground">Equity vergeben</div>
            <div className="text-2xl font-bold">{equityGivenAway.toFixed(1)} %</div>
          </CardContent>
        </Card>
        <Card className="retro-border">
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground">Verbleibend (Gründer)</div>
            <div className="text-2xl font-bold">{(100 - equityGivenAway).toFixed(1)} %</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="loan" className="w-full">
        <TabsList className="retro-border bg-card/50">
          <TabsTrigger value="loan" className="retro-tab">
            <Landmark className="h-4 w-4 mr-2" />Bankkredit
          </TabsTrigger>
          <TabsTrigger value="vc" className="retro-tab">
            <TrendingUp className="h-4 w-4 mr-2" />VC-Pitch
          </TabsTrigger>
        </TabsList>

        <TabsContent value="loan" className="space-y-4">
          <BankLoanCard
            userId={userId}
            year={gameState.year}
            quarter={gameState.quarter}
            reputation={gameState.company.reputation}
            recentRevenues={recentRevenues}
            outstandingDebt={outstandingDebt}
            activeLoans={loans}
            onLoanTaken={(amount) => { onCashChange(amount); reload(); }}
          />
        </TabsContent>

        <TabsContent value="vc" className="space-y-4">
          <VcPitchCard
            userId={userId}
            gameState={gameState}
            vcRounds={vcRounds}
            equityGivenAway={equityGivenAway}
            outstandingDebt={outstandingDebt}
            onPitchSuccess={(cash) => { onCashChange(cash); reload(); }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ----------------------------- Bank Loan -----------------------------

function BankLoanCard({
  userId, year, quarter, reputation, recentRevenues, outstandingDebt, activeLoans, onLoanTaken,
}: {
  userId: string | null; year: number; quarter: number; reputation: number;
  recentRevenues: number[]; outstandingDebt: number; activeLoans: Loan[];
  onLoanTaken: (cash: number) => void;
}) {
  const offer = calculateLoanOffer(reputation, year, recentRevenues, outstandingDebt);
  const [amount, setAmount] = useState(0);
  const [term, setTerm] = useState(12);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setAmount(Math.min(offer.maxPrincipal, Math.round(offer.maxPrincipal * 0.5)));
  }, [offer.maxPrincipal]);

  const quarterlyPayment = amount > 0 ? calcQuarterlyAnnuity(amount, offer.annualRate, term) : 0;
  const totalPayback = quarterlyPayment * term;
  const totalInterest = totalPayback - amount;

  const apply = async () => {
    if (!userId || amount <= 0) return;
    setBusy(true);
    const loan = await LoanService.create({
      userId, principal: amount, annualRate: offer.annualRate,
      quartersTotal: term, year, quarter,
    });
    setBusy(false);
    if (loan) {
      toast({ title: "Kredit aufgenommen", description: `$${amount.toLocaleString()} zu ${(offer.annualRate * 100).toFixed(1)} % p.a.` });
      onLoanTaken(amount);
    } else {
      toast({ title: "Fehler", description: "Kredit konnte nicht angelegt werden.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="retro-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />Bankkonditionen Q{quarter}/{year}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>Leitzins (Reputation {reputation}):</div>
            <div className="font-semibold">{(offer.annualRate * 100).toFixed(1)} % p.a.</div>
            <div>Ø Quartalsumsatz:</div>
            <div className="font-semibold">${offer.avgQuarterlyRevenue.toLocaleString()}</div>
            <div>Maximaler Kreditrahmen:</div>
            <div className="font-semibold">${offer.maxPrincipal.toLocaleString()}</div>
          </div>
          {!offer.eligible && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded text-destructive text-xs">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Nicht kreditwürdig: {offer.reason ?? "Bonität unzureichend"}</span>
            </div>
          )}

          {offer.eligible && (
            <>
              <Separator className="my-2" />
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Kreditsumme: ${amount.toLocaleString()}</Label>
                  <Slider
                    min={50_000} max={offer.maxPrincipal} step={10_000}
                    value={[amount]} onValueChange={(v) => setAmount(v[0])}
                  />
                </div>
                <div>
                  <Label className="text-xs">Laufzeit (Quartale)</Label>
                  <div className="flex gap-2 mt-1">
                    {offer.quartersOptions.map(q => (
                      <Button
                        key={q} size="sm"
                        variant={term === q ? "default" : "outline"}
                        onClick={() => setTerm(q)}
                      >{q} Q</Button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-muted/30 rounded">
                  <div>Quartalsrate:</div>
                  <div className="font-mono">${Math.round(quarterlyPayment).toLocaleString()}</div>
                  <div>Gesamtrückzahlung:</div>
                  <div className="font-mono">${Math.round(totalPayback).toLocaleString()}</div>
                  <div>Zinsen gesamt:</div>
                  <div className="font-mono">${Math.round(totalInterest).toLocaleString()}</div>
                </div>
                <Button onClick={apply} disabled={busy || amount < 50_000} className="w-full">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Kredit aufnehmen
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {activeLoans.length > 0 && (
        <Card className="retro-border">
          <CardHeader>
            <CardTitle className="text-base">Aktive Kredite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {activeLoans.map(l => (
              <div key={l.id} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                <div>
                  <div className="font-semibold">${Math.round(Number(l.principal)).toLocaleString()} @ {(Number(l.annual_interest_rate) * 100).toFixed(1)} %</div>
                  <div className="text-muted-foreground">{l.quarters_paid}/{l.quarters_total} Raten · ${Math.round(Number(l.outstanding_balance)).toLocaleString()} offen</div>
                </div>
                <div className="text-right">
                  <div>Rate: ${Math.round(Number(l.quarterly_payment)).toLocaleString()}</div>
                  {l.consecutive_defaults > 0 && (
                    <Badge variant="destructive" className="text-xs">{l.consecutive_defaults}/3 Ausfälle</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ----------------------------- VC Pitch -----------------------------

function VcPitchCard({
  userId, gameState, vcRounds, equityGivenAway, outstandingDebt, onPitchSuccess,
}: {
  userId: string | null; gameState: any; vcRounds: VcRound[];
  equityGivenAway: number; outstandingDebt: number;
  onPitchSuccess: (cash: number) => void;
}) {
  const [phase, setPhase] = useState<"setup" | "questions" | "evaluating" | "result">("setup");
  const [offered, setOffered] = useState(15);
  const [valuation, setValuation] = useState(3_000_000);
  const [useOfFunds, setUseOfFunds] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ accepted: boolean; mult: number; cash: number; feedback: string; weaknesses: string[] } | null>(null);

  const roundsLeft = 3 - vcRounds.length;
  const canPitch = roundsLeft > 0 && equityGivenAway + offered <= 75;

  const snapshot = (): CompanySnapshot => ({
    companyName: gameState.company.name || "Unbekannt",
    cash: Math.round(gameState.company.cash),
    reputation: Math.round(gameState.company.reputation),
    marketShare: Math.round(gameState.company.marketShare || 0),
    brandAwareness: Math.round(gameState.company.brandAwareness ?? 0),
    outstandingDebt: Math.round(outstandingDebt),
    equityGivenAwayPct: equityGivenAway,
    year: gameState.year, quarter: gameState.quarter,
    activeModels: (gameState.models ?? [])
      .filter((m: any) => m.status === "released")
      .map((m: any) => ({ name: m.name, price: m.price, cpu: m.cpu, releaseYear: m.releaseYear })),
    quarterlyRevenue: Math.round(gameState.company.quarterlyRevenue ?? 0),
    quarterlyProfit: Math.round(gameState.company.quarterlyProfit ?? 0),
  });

  const startPitch = async () => {
    if (!userId) return;
    setBusy(true);
    try {
      const { round, questions } = await VcPitchService.startRound({
        userId, setup: { offeredEquityPct: offered, proposedValuation: valuation, useOfFunds },
        company: snapshot(), language: "de",
      });
      setRoundId(round.id);
      setRoundNumber(round.round_number);
      setQuestions(questions);
      setAnswers(["", "", ""]);
      setPhase("questions");
    } catch (e: any) {
      toast({ title: "VC nicht erreichbar", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!userId || !roundId) return;
    if (answers.some(a => a.trim().length < 10)) {
      toast({ title: "Antworten zu kurz", description: "Mindestens 10 Zeichen je Frage.", variant: "destructive" });
      return;
    }
    setBusy(true); setPhase("evaluating");
    try {
      const evalRes = await VcPitchService.submitAnswers({
        userId, roundId, roundNumber,
        qna: questions.map((q, i) => ({ question: q, answer: answers[i] })),
        setup: { offeredEquityPct: offered, proposedValuation: valuation, useOfFunds },
        company: snapshot(), language: "de",
      });
      const cash = evalRes.accepted
        ? Math.round(valuation * evalRes.negotiated_valuation_multiplier * (offered / 100))
        : 0;
      setResult({
        accepted: evalRes.accepted, mult: evalRes.negotiated_valuation_multiplier,
        cash, feedback: evalRes.feedback, weaknesses: evalRes.weaknesses,
      });
      setPhase("result");
      if (evalRes.accepted) {
        onPitchSuccess(cash);
        toast({ title: "VC investiert!", description: `+$${cash.toLocaleString()} für ${offered} % Equity` });
      } else {
        toast({ title: "Abgelehnt", description: evalRes.feedback, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Bewertung fehlgeschlagen", description: e?.message ?? String(e), variant: "destructive" });
      setPhase("questions");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setPhase("setup"); setQuestions([]); setAnswers(["", "", ""]); setRoundId(null); setResult(null);
  };

  return (
    <div className="space-y-4">
      <Card className="retro-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />VC-Pitch ({3 - roundsLeft}/3 abgehalten)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canPitch && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded text-xs">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                {roundsLeft <= 0
                  ? "Maximum 3 VC-Runden erreicht."
                  : "Zu wenig Equity verfügbar (max. 75 % insgesamt vergeben)."}
              </span>
            </div>
          )}

          {phase === "setup" && canPitch && (
            <div className="space-y-3 text-sm">
              <div>
                <Label className="text-xs">Angebotener Equity-Anteil: {offered} %</Label>
                <Slider min={1} max={Math.min(40, 75 - equityGivenAway)} value={[offered]} onValueChange={v => setOffered(v[0])} />
              </div>
              <div>
                <Label className="text-xs">Vorgeschlagene Bewertung (Post-Money, $)</Label>
                <Input
                  type="number" value={valuation}
                  onChange={e => setValuation(Math.max(0, Number(e.target.value) || 0))}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Erwarteter Cash bei Akzeptanz: ~${Math.round(valuation * offered / 100).toLocaleString()}
                </div>
              </div>
              <div>
                <Label className="text-xs">Verwendung der Mittel</Label>
                <Textarea
                  rows={3} value={useOfFunds}
                  onChange={e => setUseOfFunds(e.target.value.slice(0, 500))}
                  placeholder="z.B. R&D für 32-Bit-Linie, Aufbau Vertrieb in Europa, ..."
                />
              </div>
              <Button onClick={startPitch} disabled={busy || useOfFunds.length < 20} className="w-full">
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Pitch starten (VC stellt 3 Fragen)
              </Button>
            </div>
          )}

          {phase === "questions" && (
            <div className="space-y-4 text-sm">
              <div className="text-xs text-muted-foreground">
                Beantworte alle 3 Fragen so konkret wie möglich. Vager Pitch = niedrigere Bewertung.
              </div>
              {questions.map((q, i) => (
                <div key={i} className="space-y-1">
                  <div className="font-semibold">Frage {i + 1}: {q}</div>
                  <Textarea
                    rows={3} value={answers[i]}
                    onChange={e => {
                      const next = [...answers]; next[i] = e.target.value.slice(0, 1500); setAnswers(next);
                    }}
                    placeholder="Deine Antwort..."
                  />
                </div>
              ))}
              <Button onClick={submit} disabled={busy} className="w-full">
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Antworten einreichen
              </Button>
            </div>
          )}

          {phase === "evaluating" && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm">VC denkt nach...</span>
            </div>
          )}

          {phase === "result" && result && (
            <div className="space-y-3 text-sm">
              <div className={`flex items-center gap-2 p-3 rounded ${result.accepted ? "bg-green-500/10 text-green-700 dark:text-green-300" : "bg-destructive/10 text-destructive"}`}>
                {result.accepted ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <div>
                  <div className="font-semibold">
                    {result.accepted ? `Investiert: $${result.cash.toLocaleString()}` : "Investment abgelehnt"}
                  </div>
                  <div className="text-xs">
                    Bewertungs-Multiplikator: {result.mult.toFixed(2)}×
                  </div>
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded text-xs italic">"{result.feedback}"</div>
              {result.weaknesses.length > 0 && (
                <div>
                  <div className="text-xs font-semibold mb-1">Kritikpunkte:</div>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    {result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}
              <Button onClick={reset} variant="outline" className="w-full">Schließen</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {vcRounds.length > 0 && (
        <Card className="retro-border">
          <CardHeader>
            <CardTitle className="text-base">VC-Historie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {vcRounds.map(r => (
              <div key={r.id} className="flex justify-between p-2 bg-muted/20 rounded">
                <div>
                  <div className="font-semibold">Runde {r.round_number} · Q{r.game_quarter}/{r.game_year}</div>
                  <div className="text-muted-foreground">{r.offered_equity_pct}% @ ${Number(r.proposed_valuation).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  {r.status === "accepted" ? (
                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">+${Math.round(Number(r.cash_received || 0)).toLocaleString()}</Badge>
                  ) : r.status === "rejected" ? (
                    <Badge variant="destructive">Abgelehnt</Badge>
                  ) : (
                    <Badge variant="outline">Läuft</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
