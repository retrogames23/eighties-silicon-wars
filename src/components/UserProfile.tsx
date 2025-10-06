import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LogOut, User as UserIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface UserProfileProps {
  user: User | null;
}

export const UserProfile = ({ user }: UserProfileProps) => {
  const { t } = useTranslation(['ui', 'toast']);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(t('toast:auth.signOutError', { message: error.message }));
      } else {
        toast.success(t('toast:auth.signOutSuccess'));
      }
    } catch (error: any) {
      toast.error(t('toast:auth.signOutError', { message: error.message }));
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
        {t('ui:auth.signIn')}
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
                <p className="font-mono text-muted-foreground">{t('ui:auth.signedInAs')}</p>
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
                {loading ? t('ui:auth.signingOut') : t('ui:auth.signOut')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};