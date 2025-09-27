import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Globe, Check } from 'lucide-react';

interface LanguageSelectionProps {
  onLanguageSelected: () => void;
}

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onLanguageSelected }) => {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  ];

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-background/95 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t('language.title')}
            </CardTitle>
            <p className="text-muted-foreground">
              {t('language.description')}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={language === lang.code ? "default" : "outline"}
                  className={`w-full h-14 flex items-center justify-between text-left transition-all duration-200 ${
                    language === lang.code 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'hover:border-primary/40 hover:bg-primary/5'
                  }`}
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                  </div>
                  {language === lang.code && (
                    <Check className="w-5 h-5" />
                  )}
                </Button>
              ))}
            </div>
            
            <Button 
              onClick={onLanguageSelected}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary font-semibold shadow-lg"
            >
              {t('language.continue')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};