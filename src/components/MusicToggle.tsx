import { Volume2, VolumeX, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioManager } from '@/hooks/useAudioManager';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const MusicToggle = () => {
  const { isPlaying, isEnabled, currentTrack, toggleMusic, setEnabled, nextTrack } = useAudioManager();

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <TooltipProvider>
        <div className="bg-card/90 backdrop-blur-sm border rounded-lg p-2 flex items-center gap-2">
          {isEnabled && (
            <div className="text-xs text-muted-foreground hidden sm:block">
              {currentTrack.title}
            </div>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextTrack}
                className="h-8 w-8"
                disabled={!isEnabled}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Nächster Track</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMusic}
                className="h-8 w-8"
                disabled={!isEnabled}
              >
                {isPlaying ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPlaying ? 'Musik pausieren' : 'Musik abspielen'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEnabled(!isEnabled)}
                className="h-8 w-8"
              >
                {isEnabled ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                ) : (
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isEnabled ? 'Musik deaktivieren' : 'Musik aktivieren'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};