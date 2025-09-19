import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Volume2 } from "lucide-react";

interface GameIntroProps {
  onComplete: () => void;
}

export const GameIntro = ({ onComplete }: GameIntroProps) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const scenes = [
    {
      title: "DAS JAHR 1983",
      text: "Die Heimcomputer-Revolution beginnt...",
      subtitle: "Personal Computer erobern die Wohnzimmer"
    },
    {
      title: "DER KRIEG DER CHIPS",
      text: "Commodore 64, Atari 8-bit, Apple II...",
      subtitle: "Wer wird den Markt dominieren?"
    },
    {
      title: "IHRE MISSION",
      text: "Gründe dein eigenes Computer-Imperium",
      subtitle: "Entwickle die Computer der Zukunft"
    }
  ];

  useEffect(() => {
    if (currentScene < scenes.length - 1) {
      const timer = setTimeout(() => {
        setCurrentScene(currentScene + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentScene, scenes.length]);

  const playSound = () => {
    // Create 80s-style beep sound using Web Audio API
    if (!audioPlaying) {
      setAudioPlaying(true);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      setTimeout(() => setAudioPlaying(false), 300);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-crt p-6 flex items-center justify-center">
      <div className="crt-screen">
        <div className="scanline" />
        
        <div className="max-w-4xl mx-auto text-center">
          {/* CRT Monitor Frame */}
          <div className="retro-border bg-card/90 backdrop-blur-sm p-12 rounded-lg">
            {/* Scene Display */}
            <div className="mb-12 min-h-[200px] flex flex-col justify-center">
              <div className="space-y-6 animate-pulse">
                <h1 className="text-6xl font-bold neon-text text-primary mb-4">
                  {scenes[currentScene].title}
                </h1>
                <p className="text-2xl text-accent font-mono">
                  {scenes[currentScene].text}
                </p>
                <p className="text-lg text-muted-foreground font-mono">
                  {scenes[currentScene].subtitle}
                </p>
              </div>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center space-x-3 mb-8">
              {scenes.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full border-2 ${
                    index <= currentScene 
                      ? 'bg-primary border-primary shadow-glow-green' 
                      : 'border-muted-foreground'
                  }`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={playSound}
                variant="outline"
                className="glow-button"
                disabled={audioPlaying}
              >
                <Volume2 className="w-5 h-5 mr-2" />
                80s Sound
              </Button>
              
              <Button
                onClick={onComplete}
                className="glow-button px-8 py-3 text-lg"
                variant="default"
              >
                <ChevronRight className="w-5 h-5 mr-2" />
                Spiel starten
              </Button>
            </div>

            {/* Terminal Footer */}
            <div className="mt-12 text-center">
              <div className="inline-block p-3 bg-card/50 backdrop-blur-sm rounded border border-border/50">
                <p className="text-sm text-terminal-green font-mono">
                  {">>> SYSTEM INITIALISIERUNG... <<<"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};