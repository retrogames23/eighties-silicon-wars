import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

type Advisor = 'market_researcher' | 'head_of_development' | 'shareholder';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AdvisorChatProps {
  isOpen: boolean;
  onClose: () => void;
  gameContext: {
    year: number;
    quarter: number;
    company: { name: string; cash: number; reputation: number; marketShare: number };
    budget: { marketing: number; development: number; research: number };
    activeModels: Array<{ name: string; price: number; status: string }>;
    activeEvents?: Array<{ headline: string; category: string }>;
  };
}

const ADVISOR_KEYS: Advisor[] = ['market_researcher', 'head_of_development', 'shareholder'];

export const AdvisorChat = ({ isOpen, onClose, gameContext }: AdvisorChatProps) => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation('ui');
  const [activeAdvisor, setActiveAdvisor] = useState<Advisor>('market_researcher');
  const [threads, setThreads] = useState<Record<Advisor, Message[]>>({
    market_researcher: [],
    head_of_development: [],
    shareholder: [],
  });
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const messages = threads[activeAdvisor];
  const activeLabel = t(`advisor.tabs.${activeAdvisor}`);
  const intro = useMemo(
    () => t(`advisor.intros.${activeAdvisor}`),
    [activeAdvisor, t],
  );
  // Tell the edge function which language the persona should reply in.
  const language = (i18n.language || 'de').toLowerCase().startsWith('en') ? 'en' : 'de';

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast({
        title: t('advisor.loginRequiredTitle'),
        description: t('advisor.loginRequiredDescription'),
        variant: 'destructive',
      });
      return;
    }

    const userMsg: Message = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setThreads((t) => ({ ...t, [activeAdvisor]: next }));
    setDraft('');
    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('advisor-chat', {
        body: { advisor: activeAdvisor, messages: next, gameContext, language },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      const reply = (data as { reply?: string })?.reply ?? '…';
      setThreads((tr) => ({
        ...tr,
        [activeAdvisor]: [...next, { role: 'assistant', content: reply }],
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({
        title: t('advisor.unreachableTitle'),
        description: msg,
        variant: 'destructive',
      });
      setThreads((tr) => ({ ...tr, [activeAdvisor]: messages }));
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] h-[85vh] flex flex-col gap-3">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t('advisor.title')}</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeAdvisor}
          onValueChange={(v) => setActiveAdvisor(v as Advisor)}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid grid-cols-3 shrink-0">
            {ADVISOR_KEYS.map((a) => (
              <TabsTrigger key={a} value={a}>
                {t(`advisor.tabs.${a}`)}
              </TabsTrigger>
            ))}
          </TabsList>

          {ADVISOR_KEYS.map((a) => (
            <TabsContent
              key={a}
              value={a}
              className="flex-1 min-h-0 mt-3 data-[state=inactive]:hidden"
            >
              <ScrollArea className="h-full border rounded-md p-3 bg-muted/30">
                <div className="space-y-3 text-sm">
                  {threads[a].length === 0 && (
                    <p className="text-muted-foreground italic">{t(`advisor.intros.${a}`)}</p>
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
                      <Loader2 className="w-3 h-3 animate-spin" /> {t('advisor.thinking')}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex gap-2 pt-3 border-t shrink-0">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('advisor.inputPlaceholder', { label: activeLabel })}
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
