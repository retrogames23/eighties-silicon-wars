import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function ResetPassword() {
  const { t } = useTranslation(['toast', 'ui']);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    if (type === 'recovery' && accessToken) {
      setIsRecoveryMode(true);
      // Set the session from the URL token so updateUser works
      const refreshToken = hashParams.get('refresh_token') || '';
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    }
  }, []);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('toast:auth.missingFields'));
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/#/reset-password',
      });
      if (error) {
        toast.error(t('toast:auth.resetEmailError', { error: error.message }));
      } else {
        setSent(true);
        toast.success(t('toast:auth.resetEmailSent'));
      }
    } catch (error: any) {
      toast.error(t('toast:auth.resetEmailError', { error: error.message }));
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error(t('toast:auth.missingFields'));
      return;
    }
    if (password.length < 6) {
      toast.error(t('toast:auth.passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t('toast:auth.passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(t('toast:auth.passwordResetError', { error: error.message }));
      } else {
        toast.success(t('toast:auth.passwordResetSuccess'));
        setTimeout(() => navigate('/auth'), 1500);
      }
    } catch (error: any) {
      toast.error(t('toast:auth.passwordResetError', { error: error.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Home Computer Tycoon</CardTitle>
          <CardDescription>
            {isRecoveryMode ? t('ui:auth.setNewPassword') : t('ui:auth.resetPassword')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRecoveryMode ? (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t('ui:auth.newPassword')}</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder={t('ui:auth.passwordMinLength')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t('ui:auth.confirmPassword')}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder={t('ui:auth.confirmPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('ui:auth.sending') : t('ui:auth.setNewPassword')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSendReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">{t('ui:auth.email')}</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder={t('ui:auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {sent ? (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">{t('ui:auth.resetEmailSent')}</p>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
                    {t('ui:auth.backToSignIn')}
                  </Button>
                </div>
              ) : (
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('ui:auth.sending') : t('ui:auth.sendResetLink')}
                </Button>
              )}
            </form>
          )}

          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-sm">
              ← {t('ui:auth.backToGame')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
