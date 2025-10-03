import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'toggle';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const languages = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export const LanguageSwitcher = ({ 
  variant = 'dropdown', 
  size = 'default',
  className = '' 
}: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
  const otherLang = languages.find(l => l.code !== i18n.language) || languages[1];

  if (variant === 'toggle') {
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={() => handleLanguageChange(otherLang.code)}
        className={className}
      >
        <Globe className="w-4 h-4 mr-2" />
        {otherLang.name}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={size} className={className}>
          <Globe className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">{currentLang.name}</span>
          <span className="sm:hidden">{currentLang.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={i18n.language === lang.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
