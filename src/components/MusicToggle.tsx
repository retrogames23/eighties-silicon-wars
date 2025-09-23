import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioManager } from '@/hooks/useAudioManager';

export const MusicToggle = () => {
  const { isEnabled, setEnabled } = useAudioManager();

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setEnabled(!isEnabled)}
        className="h-10 w-10 bg-card/90 backdrop-blur-sm border hover:bg-card"
      >
        {isEnabled ? (
          <Volume2 className="h-5 w-5" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};