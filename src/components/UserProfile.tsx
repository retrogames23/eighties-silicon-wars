import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LogOut, User as UserIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfileProps {
  user: User | null;
}

export const UserProfile = ({ user }: UserProfileProps) => {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Fehler beim Abmelden: ' + error.message);
      } else {
        toast.success('Erfolgreich abgemeldet');
      }
    } catch (error: any) {
      toast.error('Fehler beim Abmelden: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => window.location.href = '/auth'}
        className="font-mono"
      >
        <UserIcon className="w-4 h-4 mr-2" />
        Anmelden
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono">
          <UserIcon className="w-4 h-4 mr-2" />
          {user.email?.split('@')[0]}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-mono text-muted-foreground">Angemeldet als:</p>
                <p className="font-mono text-primary truncate">{user.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={loading}
                className="w-full font-mono"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {loading ? 'Wird abgemeldet...' : 'Abmelden'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};