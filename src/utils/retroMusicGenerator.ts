// Einfache 80er-Heimcomputermusik Generator (C64/Amiga Style)
// Basiert auf den klassischen SID-Chip und Paula-Chip Sounds

export class RetroMusicGenerator {
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private currentSource: AudioBufferSourceNode | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.3;
    this.gainNode.connect(this.audioContext.destination);
  }

  // Eingängige 80er-Synth-Melodie generieren (inspiriert von a-ha, Eurythmics, etc.)
  private generate80sTrack(): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 40; // 40 Sekunden für längere, entwickeltere Melodie
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
    
    // Eingängige Haupt-Melodie mit Hookline (wie "Take On Me" oder "Sweet Dreams")
    const mainMelody = [
      // Phrase 1: Aufsteigende Hookline
      523.25, 659.25, 783.99, 659.25, 783.99, 880.00, 783.99, 659.25,
      // Phrase 2: Variierter Abstieg
      698.46, 783.99, 659.25, 587.33, 523.25, 587.33, 659.25, 523.25,
      // Phrase 3: Höhepunkt mit Oktavsprung
      1046.5, 880.00, 783.99, 880.00, 1046.5, 1174.7, 1046.5, 880.00,
      // Phrase 4: Melodischer Abschluss
      783.99, 659.25, 698.46, 587.33, 523.25, 440.00, 523.25, 523.25
    ];
    
    // Rhythmische Bass-Synth-Linie mit 80er-Progressionen
    const bassPatterns = [
      // Am-F-C-G Progression (sehr 80er)
      220.00, 220.00, 174.61, 174.61, 130.81, 130.81, 196.00, 196.00,
      220.00, 220.00, 174.61, 174.61, 130.81, 130.81, 196.00, 196.00,
      // Dm-Bb-F-C Variation
      146.83, 146.83, 116.54, 116.54, 174.61, 174.61, 130.81, 130.81,
      146.83, 146.83, 116.54, 116.54, 174.61, 174.61, 130.81, 130.81
    ];
    
    // Arpeggierte Synth-Pads (wie in "Blue Monday")
    const arpeggioPattern = [
      440.00, 523.25, 659.25, 783.99, 659.25, 523.25, // Am-Arpeggio
      349.23, 440.00, 523.25, 659.25, 523.25, 440.00, // F-Arpeggio
      261.63, 329.63, 392.00, 523.25, 392.00, 329.63, // C-Arpeggio
      196.00, 246.94, 293.66, 392.00, 293.66, 246.94  // G-Arpeggio
    ];

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const time = i / sampleRate;
        let sample = 0;
        
        // Tempo: 120 BPM = 2 Beats pro Sekunde
        const beatTime = time * 2;
        const measureTime = beatTime / 4; // 4/4 Takt
        
        // Haupt-Synth-Lead (sawtooth-ähnlich für 80er-Sound)
        const melodyIndex = Math.floor(beatTime * 2) % mainMelody.length;
        const melodyFreq = mainMelody[melodyIndex];
        const envelope = Math.max(0, 1 - (beatTime * 2 % 0.5) * 2); // Attack/Decay
        const leadWave = this.generateSawtooth(melodyFreq, time) * 0.4 * envelope;
        
        // Bass-Synth (Square Wave mit Sub-Oktave)
        const bassIndex = Math.floor(beatTime) % bassPatterns.length;
        const bassFreq = bassPatterns[bassIndex];
        const bassWave = this.generateSquareWave(bassFreq, time) * 0.3;
        const subBass = this.generateSquareWave(bassFreq * 0.5, time) * 0.2;
        
        // Arpeggiated Synth Pads
        const arpeggioIndex = Math.floor(beatTime * 4) % arpeggioPattern.length;
        const arpeggioFreq = arpeggioPattern[arpeggioIndex];
        const arpeggioEnv = Math.sin(beatTime * 4 * Math.PI) * 0.5 + 0.5;
        const arpeggioWave = this.generateTriangleWave(arpeggioFreq, time) * 0.15 * arpeggioEnv;
        
        // 80er-Drum-Pattern (Kick auf 1 und 3, Snare auf 2 und 4)
        const beat = Math.floor(beatTime) % 4;
        let drumSample = 0;
        
        // Kick Drum (Sinuswelle mit schnellem Decay)
        if (beat === 0 || beat === 2) {
          const kickEnv = Math.exp(-beatTime % 1 * 10);
          drumSample += Math.sin(2 * Math.PI * 60 * time) * 0.3 * kickEnv;
        }
        
        // Snare (Noise mit Envelope)
        if (beat === 1 || beat === 3) {
          const snareEnv = Math.exp(-(beatTime % 1) * 8);
          drumSample += (Math.random() - 0.5) * 0.2 * snareEnv;
        }
        
        // Hi-Hat (kontinuierliche 8tel-Noten)
        const hihatEnv = Math.exp(-(beatTime * 8 % 1) * 20);
        drumSample += (Math.random() - 0.5) * 0.08 * hihatEnv;
        
        // Stereo-Effekte
        const panL = channel === 0 ? 1.0 : 0.7;
        const panR = channel === 1 ? 1.0 : 0.7;
        const stereoFactor = channel === 0 ? panL : panR;
        
        // Alles zusammenmischen
        sample = (leadWave + bassWave + subBass + arpeggioWave + drumSample) * stereoFactor;
        
        // Chorus-Effekt (sehr 80er)
        const chorusDelay = 0.02;
        if (i > sampleRate * chorusDelay) {
          const chorusModulation = Math.sin(2 * Math.PI * 1.5 * time) * 0.002;
          const delaySample = data[i - Math.floor(sampleRate * (chorusDelay + chorusModulation))];
          sample += delaySample * 0.3;
        }
        
        // Reverb-Simulation
        if (i > sampleRate * 0.05) {
          sample += data[i - Math.floor(sampleRate * 0.05)] * 0.15;
        }
        if (i > sampleRate * 0.12) {
          sample += data[i - Math.floor(sampleRate * 0.12)] * 0.08;
        }
        
        // Soft Clipping für warmen 80er-Sound
        sample = Math.tanh(sample) * 0.6;
        
        data[i] = sample;
      }
    }
    
    return buffer;
  }
  
  // Hilfsfunktionen für verschiedene Wellenformen
  private generateSawtooth(frequency: number, time: number): number {
    const period = 1 / frequency;
    const phase = (time % period) / period;
    return (phase * 2 - 1) * 0.8;
  }
  
  private generateSquareWave(frequency: number, time: number): number {
    return Math.sin(2 * Math.PI * frequency * time) > 0 ? 1 : -1;
  }
  
  private generateTriangleWave(frequency: number, time: number): number {
    const period = 1 / frequency;
    const phase = (time % period) / period;
    return phase < 0.5 ? (phase * 4 - 1) : (3 - phase * 4);
  }

  async play(): Promise<void> {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Stoppe aktuellen Track
    if (this.currentSource) {
      this.currentSource.stop();
    }

    // Generiere und spiele neuen Track
    const buffer = this.generate80sTrack();
    this.currentSource = this.audioContext.createBufferSource();
    this.currentSource.buffer = buffer;
    this.currentSource.loop = true; // Endlos-Schleife
    this.currentSource.connect(this.gainNode);
    this.currentSource.start();
  }

  stop(): void {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
  }

  setVolume(volume: number): void {
    this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
  }
}