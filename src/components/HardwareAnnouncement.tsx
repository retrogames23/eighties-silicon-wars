import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Cpu, Monitor, HardDrive, Zap, Calendar } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface HardwareItem {
  name: string;
  type: 'cpu' | 'gpu' | 'ram' | 'sound' | 'accessory';
  description: string;
  year: number;
  performance?: number;
}

interface HardwareAnnouncementProps {
  isOpen: boolean;
  onClose: () => void;
  newHardware: HardwareItem[];
  currentYear: number;
  currentQuarter: number;
}

const getHardwareIcon = (type: string) => {
  switch (type) {
    case 'cpu': return Cpu;
    case 'gpu': return Monitor;
    case 'ram': return HardDrive;
    case 'sound': return Zap;
    default: return HardDrive;
  }
};

const getHardwareTypeLabel = (type: string, t: any) => {
  switch (type) {
    case 'cpu': return t('hardware:types.cpu');
    case 'gpu': return t('hardware:types.gpu');
    case 'ram': return t('hardware:types.ram');
    case 'sound': return t('hardware:types.sound');
    case 'accessory': return t('hardware:types.accessory');
    default: return t('hardware:types.default');
  }
};

export const HardwareAnnouncement = ({ 
  isOpen, 
  onClose, 
  newHardware, 
  currentYear, 
  currentQuarter 
}: HardwareAnnouncementProps) => {
  const { t } = useTranslation(['hardware', 'common']);
  
  if (!isOpen || newHardware.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl retro-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl text-neon-green font-mono flex items-center gap-2">
            <Zap className="w-6 h-6" />
            {t('hardware:announcement.title')}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {t('hardware:announcement.subtitle', { quarter: currentQuarter, year: currentYear })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('hardware:availability.unlocked')}
          </p>
          
          <div className="grid gap-3">
            {newHardware.map((hardware, index) => {
              const IconComponent = getHardwareIcon(hardware.type);
              return (
                <Card key={index} className="border-neon-blue/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-8 h-8 text-neon-blue" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-mono font-semibold text-neon-green">
                            {hardware.name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {getHardwareTypeLabel(hardware.type, t)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {hardware.description}
                        </p>
                        {hardware.performance && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">{t('hardware:performance.label')}:</span>
                            <Badge variant="secondary" className="text-xs">
                              {t('hardware:performance.points', { points: hardware.performance })}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground mb-4">
              {t('hardware:availability.developmentNote')}
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={onClose}
                className="px-8 font-mono retro-border bg-neon-green text-black hover:bg-neon-green/80"
              >
                {t('common.ok')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};