import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Save, Upload, Trash2, Calendar } from 'lucide-react';
import { supabase, SaveGame, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';

interface ComputerModel {
  id: string;
  name: string;
  cpu: string;
  ram: string;
  gpu?: string;
  soundchip?: string;
  accessories?: string[];
  case?: {
    id: string;
    name: string;
    type: 'gamer' | 'office';
    quality: number;
    design: number;
    price: number;
  };
  price: number;
  unitsSold: number;
  developmentCost: number;
  releaseQuarter: number;
  releaseYear: number;
  status: 'development' | 'released' | 'discontinued';
  developmentTime: number;
  developmentProgress: number;
  complexity: number;
}

interface Budget {
  marketing: number;
  development: number;
  research: number;
}

interface GameState {
  company: {
    name: string;
    logo: string;
    cash: number;
    employees: number;
    reputation: number;
    marketShare: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    hardwareIncome?: number;
    additionalRevenue?: {
      softwareLicenses: { games: number; office: number };
      supportService: { b2c: number; b2b: number };
    };
  };
  quarter: number;
  year: number;
  models: ComputerModel[];
  budget: Budget;
  competitors: any[];
  marketEvents: any[];
  totalMarketSize: number;
  customChips: any[];
  totalRevenue: number;
}

interface SaveGameManagerProps {
  gameState: GameState;
  onLoadGame: (gameState: GameState) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SaveGameManager = ({ gameState, onLoadGame, isOpen, onClose }: SaveGameManagerProps) => {
  const [saves, setSaves] = useState<SaveGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Check if Supabase is properly configured
  const supabaseReady = isSupabaseConfigured() && supabase;

  useEffect(() => {
    if (isOpen && supabaseReady) {
      loadSaves();
    }
  }, [isOpen, supabaseReady]);

  const loadSaves = async () => {
    if (!supabaseReady) {
      toast.error('Supabase ist nicht konfiguriert');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Bitte melde dich an, um Spielstände zu verwalten');
        return;
      }

      const { data, error } = await supabase
        .from('save_games')
        .select('*')
        .eq('user_id', user.id)
        .order('slot_number', { ascending: true });

      if (error) throw error;
      setSaves(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Spielstände:', error);
      toast.error('Fehler beim Laden der Spielstände');
    } finally {
      setLoading(false);
    }
  };

  const saveGame = async (slotNumber: number, name: string) => {
    if (!supabaseReady) {
      toast.error('Supabase ist nicht konfiguriert');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Bitte melde dich an, um zu speichern');
        return;
      }

      const saveData = {
        user_id: user.id,
        slot_number: slotNumber,
        save_name: name || `Spielstand ${slotNumber}`,
        game_state: gameState,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('save_games')
        .upsert(saveData, { 
          onConflict: 'user_id,slot_number'
        });

      if (error) throw error;
      
      toast.success('Spielstand gespeichert!');
      loadSaves();
      setSaveName('');
      setSelectedSlot(null);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast.error('Fehler beim Speichern des Spielstands');
    } finally {
      setLoading(false);
    }
  };

  const loadGame = async (save: SaveGame) => {
    try {
      onLoadGame(save.game_state);
      toast.success('Spielstand geladen!');
      onClose();
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      toast.error('Fehler beim Laden des Spielstands');
    }
  };

  const deleteSave = async (save: SaveGame) => {
    if (!supabaseReady) {
      toast.error('Supabase ist nicht konfiguriert');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('save_games')
        .delete()
        .eq('id', save.id);

      if (error) throw error;
      
      toast.success('Spielstand gelöscht!');
      loadSaves();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      toast.error('Fehler beim Löschen des Spielstands');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEmptySlots = () => {
    const usedSlots = saves.map(save => save.slot_number);
    const emptySlots = [];
    for (let i = 1; i <= 5; i++) {
      if (!usedSlots.includes(i)) {
        emptySlots.push(i);
      }
    }
    return emptySlots;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl text-primary">
            SPIELSTAND VERWALTUNG
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Supabase Status Check */}
          {!supabaseReady && (
            <Card className="p-4 border border-destructive/50 bg-destructive/10">
              <div className="text-center text-sm font-mono">
                <p className="text-destructive mb-2">SUPABASE NICHT KONFIGURIERT</p>
                <p className="text-muted-foreground text-xs">
                  Bitte konfiguriere deine Supabase-Verbindung, um Spielstände zu speichern.
                </p>
              </div>
            </Card>
          )}

          {/* Vorhandene Spielstände */}
          <div className="space-y-2">
            <h3 className="font-mono text-sm text-muted-foreground">
              GESPEICHERTE SPIELSTÄNDE
            </h3>
            
            {saves.length === 0 ? (
              <Card className="p-4 text-center text-muted-foreground font-mono text-sm">
                Keine Spielstände vorhanden
              </Card>
            ) : (
              saves.map((save) => (
                <Card key={save.id} className="p-4 bg-card/50 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono text-xs">
                          SLOT {save.slot_number}
                        </Badge>
                        <span className="font-mono text-sm text-primary">
                          {save.save_name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-familyname font-mono">
                        <span>Firma: {save.game_state.company?.name}</span>
                        <span>Runde: Q{save.game_state.quarter}/{save.game_state.year}</span>
                        <span>Geld: ${save.game_state.company?.cash?.toLocaleString()}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(save.updated_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadGame(save)}
                        disabled={loading}
                        className="font-mono"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        LADEN
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteSave(save)}
                        disabled={loading}
                        className="font-mono text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Neuen Spielstand speichern */}
          {getEmptySlots().length > 0 && (
            <div className="space-y-2">
              <h3 className="font-mono text-sm text-muted-foreground">
                NEUEN SPIELSTAND SPEICHERN
              </h3>
              
              <Card className="p-4 bg-card/50 border border-primary/20">
                <div className="space-y-3">
                  <Input
                    placeholder="Name für den Spielstand (optional)"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="font-mono"
                  />
                  
                  <div className="flex gap-2 flex-wrap">
                    {getEmptySlots().map((slot) => (
                      <Button
                        key={slot}
                        size="sm"
                        variant={selectedSlot === slot ? "default" : "outline"}
                        onClick={() => setSelectedSlot(slot)}
                        className="font-mono"
                      >
                        SLOT {slot}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => selectedSlot && saveGame(selectedSlot, saveName)}
                    disabled={!selectedSlot || loading}
                    className="w-full font-mono"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    SPIELSTAND SPEICHERN
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {saves.length >= 5 && getEmptySlots().length === 0 && (
            <Card className="p-4 text-center text-muted-foreground font-mono text-sm bg-card/30">
              Alle 5 Speicherplätze sind belegt. Lösche einen Spielstand, um einen neuen zu speichern.
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};