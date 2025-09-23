// 80s-Style Synthesizer Audio Generator using Web Audio API

export interface TrackConfig {
  name: string;
  title: string;
  bpm: number;
  key: string;
  style: 'scifi' | 'jungle' | 'monkey';
}

export class Audio80sGenerator {
  private audioContext: AudioContext;
  private isPlaying = false;
  private oscillators: OscillatorNode[] = [];
  private gainNode: GainNode;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.3;
    this.gainNode.connect(this.audioContext.destination);
  }

  // Scifi Track - Retro-futuristic synthesizer
  generateScifiTrack(): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 120; // 2 minutes
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const time = i / sampleRate;
        
        // Main synth pad (slow arpeggios)
        const freq1 = 220 + Math.sin(time * 0.5) * 50; // Slow frequency modulation
        const synth1 = Math.sin(2 * Math.PI * freq1 * time) * 0.3;
        
        // Bass line
        const bassFreq = 55 + Math.sin(time * 0.25) * 10;
        const bass = Math.sin(2 * Math.PI * bassFreq * time) * 0.4;
        
        // Spacey lead
        const leadFreq = 880 + Math.sin(time * 2) * 100;
        const lead = Math.sin(2 * Math.PI * leadFreq * time) * 0.2 * (Math.sin(time * 0.1) + 1) / 2;
        
        // Add some reverb-like delay
        const delay = i > sampleRate * 0.1 ? data[i - Math.floor(sampleRate * 0.1)] * 0.3 : 0;
        
        data[i] = (synth1 + bass + lead + delay) * 0.5;
      }
    }
    return buffer;
  }

  // Jungle Track - Tropical/exotic with drums
  generateJungleTrack(): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 120;
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const time = i / sampleRate;
        
        // Tribal drums (kick pattern)
        const kickPattern = Math.floor(time * 2) % 4 === 0 ? 1 : 0;
        const kick = kickPattern * Math.exp(-time % 0.5 * 10) * 0.6;
        
        // Exotic melody (pentatonic-ish)
        const melodyFreq = 330 + Math.sin(time * 1.5) * 80;
        const melody = Math.sin(2 * Math.PI * melodyFreq * time) * 0.3;
        
        // Jungle atmosphere (filtered noise)
        const atmosphere = (Math.random() - 0.5) * 0.1 * Math.sin(time * 0.3);
        
        // Bassline
        const bassFreq = 82.4; // E2
        const bassPattern = Math.sin(2 * Math.PI * bassFreq * time) * 0.4 * (time % 1 < 0.5 ? 1 : 0.5);
        
        data[i] = kick + melody + atmosphere + bassPattern;
      }
    }
    return buffer;
  }

  // Monkey Track - Playful and quirky
  generateMonkeyTrack(): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 120;
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const time = i / sampleRate;
        
        // Quirky melody with jumpy intervals
        const melodyFreq = 440 + Math.sin(time * 3) * 200 + Math.sin(time * 7) * 50;
        const melody = Math.sin(2 * Math.PI * melodyFreq * time) * 0.3;
        
        // Playful bass hops
        const bassFreq = 110 + Math.sin(time * 4) * 30;
        const bass = Math.sin(2 * Math.PI * bassFreq * time) * 0.4;
        
        // Percussive elements
        const perc = Math.sin(time * 16 * Math.PI) * Math.exp(-((time * 8) % 1) * 5) * 0.2;
        
        // Cheerful pad
        const padFreq = 220;
        const pad = (Math.sin(2 * Math.PI * padFreq * time) + Math.sin(2 * Math.PI * padFreq * 1.5 * time)) * 0.15;
        
        data[i] = melody + bass + perc + pad;
      }
    }
    return buffer;
  }

  async playTrack(style: 'scifi' | 'jungle' | 'monkey'): Promise<AudioBufferSourceNode> {
    // Resume audio context if needed
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    let buffer: AudioBuffer;
    
    switch (style) {
      case 'scifi':
        buffer = this.generateScifiTrack();
        break;
      case 'jungle':
        buffer = this.generateJungleTrack();
        break;
      case 'monkey':
        buffer = this.generateMonkeyTrack();
        break;
      default:
        buffer = this.generateScifiTrack();
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode);
    source.start();

    return source;
  }

  setVolume(volume: number) {
    this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  stop() {
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    this.oscillators = [];
    this.isPlaying = false;
  }
}