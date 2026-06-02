import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Advisor = 'market_researcher' | 'head_of_development' | 'shareholder';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AdvisorChatProps {
  isOpen: boolean;
  onClose: () => void;
  // Slim, advisor-relevant slice of the game state — we deliberately do NOT
  // dump everything; the LLM only needs business-context, not internal flags.
  gameContext: {
    year: number;
    quarter: number;
    company: { name: string; cash: number; reputation: number; marketShare: number };
    budget: { marketing: number; development: number; research: number };
    activeModels: Array<{ name: string; price: number; status: string }>;
    activeEvents?: Array<{ headline: string; category: string }>;
  };
}

const ADVISORS: Record<Advisor, { label: string; intro: string }> = {
  market_researcher: {
    label: 'Marktforschung',
    intro: 'Dr. Helga Brandt, Marktforschung. Was möchten Sie wissen?',
  },
  head_of_development: {
    label: 'Entwicklung',
    intro: 'K.J. Jordan, Entwicklung. Was steht an?',
  },
  shareholder: {
    label: 'Aktionäre',
    intro: 'Margarete Vogel, Aktionärssprecherin. Reden wir Klartext.',
  },
};

export const AdvisorChat = ({ isOpen, onClose, gameContext }: AdvisorChatProps) => {
  const { toast } = useToast();
  const [activeAdvisor, setActiveAdvisor] = useState<Advisor>('market_researcher');
  const [threads, setThreads] = useState<Record<Advisor, Message[]>>({
    market_researcher: [],
    head_of_development: [],
    shareholder: [],
  });
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const messages = threads[activeAdvisor];
  const intro = useMemo(() => ADVISORS[activeAdvisor].intro, [activeAdvisor]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    const userMsg: Message = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setThreads((t) => ({ ...t, [activeAdvisor]: next }));
    setDraft('');
    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('advisor-chat', {
        body: { advisor: activeAdvisor, messages: next, gameContext },
      });
      if (error) throw error;
      const reply = (data as { reply?: string })?.reply ?? '…';
      setThreads((t) => ({
        ...t,
        [activeAdvisor]: [...next, { role: 'assistant', content: reply }],
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({
        title: 'Berater nicht erreichbar',
        description: msg,
        variant: 'destructive',
      });
      // Roll back the user message so they can retry without losing it.
      setThreads((t) => ({ ...t, [activeAdvisor]: messages }));
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Berater sprechen</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeAdvisor}
          onValueChange={(v) => setActiveAdvisor(v as Advisor)}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid grid-cols-3">
            {(Object.keys(ADVISORS) as Advisor[]).map((a) => (
              <TabsTrigger key={a} value={a}>
                {ADVISORS[a].label}
              </TabsTrigger>
            ))}
          </TabsList>

          {(Object.keys(ADVISORS) as Advisor[]).map((a) => (
            <TabsContent key={a} value={a} className="flex-1 flex flex-col min-h-0 mt-3">
              <ScrollArea className="flex-1 border rounded-md p-3 bg-muted/30">
                <div className="space-y-3 text-sm">
                  {threads[a].length === 0 && (
                    <p className="text-muted-foreground italic">{ADVISORS[a].intro}</p>
                  )}
                  {threads[a].map((m, i) => (
                    <div
                      key={i}
                      className={
                        m.role === 'user'
                          ? 'ml-8 bg-primary/10 rounded-md p-2'
                          : 'mr-8 bg-background border rounded-md p-2'
                      }
                    >
                      {m.content}
                    </div>
                  ))}
                  {sending && activeAdvisor === a && (
                    <div className="mr-8 text-muted-foreground flex items-center gap-2 text-xs">
                      <Loader2 className="w-3 h-3 animate-spin" /> denkt nach…
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex gap-2 pt-3 border-t">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Frage an ${ADVISORS[activeAdvisor].label}…`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            disabled={sending}
          />
          <Button onClick={send} disabled={sending || !draft.trim()}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
