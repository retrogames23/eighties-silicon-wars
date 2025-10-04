import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Cpu, Gamepad2 } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface Company {
  id: string;
  name: string;
  description: string;
  startingCash: number;
  speciality: string;
  icon: React.ReactNode;
}

export const CompanySelection = ({ onSelectCompany }: { onSelectCompany: (company: Company) => void }) => {
  const { t } = useTranslation(['company', 'common']);
  
  const companies: Company[] = [
    {
      id: "commodore",
      name: t('company:selection.companies.commodore.name'),
      description: t('company:selection.companies.commodore.description'),
      startingCash: 500000,
      speciality: t('company:selection.companies.commodore.speciality'),
      icon: <Cpu className="w-8 h-8" />
    },
    {
      id: "atari",
      name: t('company:selection.companies.atari.name'),
      description: t('company:selection.companies.atari.description'),
      startingCash: 450000,
      speciality: t('company:selection.companies.atari.speciality'),
      icon: <Gamepad2 className="w-8 h-8" />
    },
    {
      id: "custom",
      name: t('company:selection.companies.custom.name'),
      description: t('company:selection.companies.custom.description'),
      startingCash: 300000,
      speciality: t('company:selection.companies.custom.speciality'),
      icon: <Building2 className="w-8 h-8" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-crt p-8">
      <div className="crt-screen">
        <div className="scanline" />
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold neon-text text-neon-green mb-4 animate-glow-pulse">
              {t('company:selection.title')}
            </h1>
            <h2 className="text-2xl text-neon-cyan mb-2">
              {t('company:selection.subtitle')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('company:selection.prompt')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {companies.map((company) => (
              <Card 
                key={company.id}
                className="retro-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 group cursor-pointer"
                onClick={() => onSelectCompany(company)}
              >
                <div className="p-6 text-center">
                  <div className="mb-6 text-neon-cyan group-hover:text-neon-magenta transition-colors">
                    {company.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-primary mb-2 neon-text">
                    {company.name}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4">
                    {company.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('company:selection.startingCapital')}</span>
                      <span className="text-neon-green font-mono">
                        ${company.startingCash.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('company:selection.speciality')}</span>
                      <span className="text-accent">{company.speciality}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-6 glow-button"
                    variant="default"
                  >
                    {t('company:selection.selectButton')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className="retro-border inline-block p-4 bg-card/30 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground mb-2">
                {t('company:selection.systemOnline')}
              </p>
              <p className="text-xs text-terminal-green font-mono">
                {t('company:selection.copyright')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
