import { Volume2, VolumeX, SkipBack, SkipForward, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioManager } from '@/hooks/useAudioManager';
import { useTranslation } from 'react-i18next';

export const MusicToggle = () => {
  const { t } = useTranslation('ui');
  const {
    isEnabled,
    toggleMusic,
    nextTrack,
    prevTrack,
    currentTrackTitle,
    trackIndex,
    trackCount,
  } = useAudioManager();

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="flex items-center gap-1 bg-card/90 backdrop-blur-sm border rounded-full pl-1 pr-1 py-1 shadow-md">
        {/* Mini title — only when playing */}
        {isEnabled && (
          <div className="hidden sm:flex items-center gap-1.5 px-2 max-w-[180px] overflow-hidden">
            <Music2 className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
            <span
              className="text-xs font-medium truncate text-foreground"
              title={currentTrackTitle}
            >
              {currentTrackTitle}
            </span>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {trackIndex + 1}/{trackCount}
            </span>
          </div>
        )}

        {isEnabled && (
          <Button
            variant="ghost"
            size="icon"
            onClick={prevTrack}
            className="h-8 w-8 rounded-full"
            title={t('music.previous', { defaultValue: 'Previous track' })}
            aria-label={t('music.previous', { defaultValue: 'Previous track' })}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMusic}
          className="h-9 w-9 rounded-full"
          title={
            isEnabled
              ? t('music.off', { defaultValue: 'Turn music off' })
              : t('music.on', { defaultValue: 'Turn music on' })
          }
          aria-label={
            isEnabled
              ? t('music.off', { defaultValue: 'Turn music off' })
              : t('music.on', { defaultValue: 'Turn music on' })
          }
        >
          {isEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>

        {isEnabled && (
          <Button
            variant="ghost"
            size="icon"
            onClick={nextTrack}
            className="h-8 w-8 rounded-full"
            title={t('music.next', { defaultValue: 'Next track' })}
            aria-label={t('music.next', { defaultValue: 'Next track' })}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
