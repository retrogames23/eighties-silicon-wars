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

  // Einfache 80er-Heimcomputer-Melodie generieren
  private generate80sTrack(): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 30; // 30 Sekunden Loop
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
    
    // C64-style Melodie (einfache Frequenzen wie beim SID-Chip)
    const melody = [
      523.25, 587.33, 659.25, 698.46, // C5, D5, E5, F5
      783.99, 698.46, 659.25, 587.33, // G5, F5, E5, D5
      523.25, 659.25, 783.99, 880.00, // C5, E5, G5, A5
      783.99, 659.25, 523.25, 523.25  // G5, E5, C5, C5
    ];
    
    const bassline = [
      130.81, 130.81, 164.81, 164.81, // C3, C3, E3, E3
      196.00, 196.00, 164.81, 164.81, // G3, G3, E3, E3
      146.83, 146.83, 130.81, 130.81, // D3, D3, C3, C3
      174.61, 174.61, 196.00, 196.00  // F3, F3, G3, G3
    ];

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const time = i / sampleRate;
        let sample = 0;
        
        // Haupt-Melodie (Square Wave wie SID-Chip)
        const melodyIndex = Math.floor(time * 2) % melody.length;
        const melodyFreq = melody[melodyIndex];
        const melodyWave = Math.sin(2 * Math.PI * melodyFreq * time) > 0 ? 0.3 : -0.3;
        
        // Bass-Linie (Triangle Wave)
        const bassIndex = Math.floor(time * 0.5) % bassline.length;
        const bassFreq = bassline[bassIndex];
        const bassWave = 2 * Math.abs(2 * (bassFreq * time - Math.floor(bassFreq * time + 0.5))) - 1;
        
        // Einfacher Arpeggio-Effekt
        const arpeggioFreq = melodyFreq * 1.5;
        const arpeggioWave = Math.sin(2 * Math.PI * arpeggioFreq * time) > 0 ? 0.1 : -0.1;
        
        // Hi-Hat ähnlicher Noise (sehr gedämpft)
        const noise = (Math.random() - 0.5) * 0.05;
        const rhythmGate = Math.floor(time * 8) % 4 === 0 ? 1 : 0;
        
        // Stereo-Panning
        const pan = channel === 0 ? 1.0 : 0.8;
        
        sample = (melodyWave + bassWave * 0.6 + arpeggioWave + noise * rhythmGate) * pan;
        
        // Einfaches Echo
        if (i > sampleRate * 0.1) {
          sample += data[i - Math.floor(sampleRate * 0.1)] * 0.2;
        }
        
        data[i] = sample * 0.7;
      }
    }
    
    return buffer;
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