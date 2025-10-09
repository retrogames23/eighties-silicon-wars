import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Session } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

export default function Auth() {
  const { t } = useTranslation(['toast', 'ui']);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect to main page if user is authenticated
        if (session?.user) {
          navigate('/');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Redirect to main page if already authenticated
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('toast:auth.missingFields'));
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error(t('toast:auth.emailExists'));
        } else if (error.message.includes('Password should be')) {
          toast.error(t('toast:auth.passwordTooShort'));
        } else {
          toast.error(t('toast:auth.registerError', { error: error.message }));
        }
      } else {
        toast.success(t('toast:auth.registerSuccess'));
        setEmail('');
        setPassword('');
      }
    } catch (error: any) {
      toast.error(t('toast:auth.registerError', { error: error.message }));
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('toast:auth.missingFields'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error(t('toast:auth.invalidCredentials'));
        } else {
          toast.error(t('toast:auth.loginError', { error: error.message }));
        }
      } else {
        toast.success(t('toast:auth.loginSuccess'));
      }
    } catch (error: any) {
      toast.error(t('toast:auth.loginError', { error: error.message }));
    } finally {
      setLoading(false);
    }
  };

  // If user is already authenticated, show loading or redirect
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <div className="text-center">
          <p className="text-lg">{t('ui:auth.redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Silicon Wars</CardTitle>
          <CardDescription>
            {t('ui:auth.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t('ui:auth.signIn')}</TabsTrigger>
              <TabsTrigger value="signup">{t('ui:auth.register')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={signIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">{t('ui:auth.email')}</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder={t('ui:auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">{t('ui:auth.password')}</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder={t('ui:auth.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? t('ui:auth.signingIn') : t('ui:auth.signIn')}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={signUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t('ui:auth.email')}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t('ui:auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('ui:auth.password')}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder={t('ui:auth.passwordMinLength')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? t('ui:auth.registering') : t('ui:auth.register')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-sm"
            >
              ← {t('ui:auth.backToGame')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}