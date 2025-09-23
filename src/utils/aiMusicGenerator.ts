// Professionelle AI-basierte Musikgenerierung für hochwertige, melodische Sounds
// Erweiterte Synthese mit realistischen Instrumenten und Harmonien

export interface AITrackConfig {
  name: string;
  title: string;
  bpm: number;
  key: string;
  style: 'scifi' | 'jungle' | 'monkey';
  seed?: number;
}

// Erweiterte Musiktheorie für professionelle Komposition
class AdvancedMusicTheory {
  // Komplexere Skalen für verschiedene Stimmungen
  static readonly scales = {
    // Sci-Fi: Mystisch und spacig
    dorian: [0, 2, 3, 5, 7, 9, 10],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    
    // Jungle: Exotisch und rhythmisch
    pentatonic: [0, 2, 5, 7, 9],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    
    // Monkey: Verspielt und fröhlich
    major: [0, 2, 4, 5, 7, 9, 11],
    lydian: [0, 2, 4, 6, 7, 9, 11]
  };

  // Professionelle Akkordprogressionen
  static readonly progressions = {
    scifi: [
      [0, 4, 7], [5, 9, 0], [7, 11, 2], [3, 7, 10] // Cm - Fm - Gm - Eb
    ],
    jungle: [
      [0, 3, 7], [7, 10, 2], [5, 8, 0], [10, 1, 5] // Am - Em - Dm - Bb
    ],
    monkey: [
      [0, 4, 7], [5, 9, 0], [2, 6, 9], [7, 11, 2] // C - F - D - G
    ]
  };

  // Rhythmische Patterns für natürlichere Grooves
  static readonly rhythmPatterns = {
    scifi: {
      kick: [1, 0, 0, 0, 0.6, 0, 0, 0, 0.8, 0, 0, 0, 0, 0, 0.4, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0.3, 0, 0, 0, 0, 1, 0, 0, 0.2],
      hihat: [0.3, 0.2, 0.4, 0.2, 0.3, 0.2, 0.4, 0.2, 0.3, 0.2, 0.4, 0.2, 0.3, 0.2, 0.4, 0.2]
    },
    jungle: {
      kick: [1, 0, 0, 0.3, 0, 0, 0.7, 0, 0.5, 0, 0, 0.2, 0, 0, 0.9, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0.4, 0, 0, 0.6, 0, 1, 0, 0, 0.3],
      hihat: [0.4, 0.3, 0.2, 0.4, 0.3, 0.2, 0.4, 0.3, 0.2, 0.4, 0.3, 0.2, 0.4, 0.3, 0.2, 0.4]
    },
    monkey: {
      kick: [1, 0, 0.5, 0, 0.8, 0, 0.3, 0, 1, 0, 0.4, 0, 0.6, 0, 0.2, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0.5, 0, 0, 0, 0, 1, 0, 0, 0.3],
      hihat: [0.5, 0.3, 0.7, 0.3, 0.5, 0.3, 0.7, 0.3, 0.5, 0.3, 0.7, 0.3, 0.5, 0.3, 0.7, 0.3]
    }
  };
}

// Erweiterte Melodie-KI mit kontextueller Harmonie
class ProfessionalMelodyAI {
  private transitionMatrix: Map<string, Map<string, number>> = new Map();
  private harmonicContext: number[] = [];
  
  constructor(seed: number = 42) {
    this.seedRandom(seed);
    this.trainAdvancedModel();
  }

  private seedRandom(seed: number) {
    let s = seed;
    Math.random = () => {
      s = Math.imul(16807, s) | 0 % 2147483647;
      return (s & 2147483647) / 2147483648;
    };
  }

  // Trainiere mit professionellen Melodie-Patterns
  private trainAdvancedModel() {
    const professionalPatterns = [
      // Cinematic/Emotional Patterns
      [0, 2, 4, 7, 5, 3, 0, -2],
      [0, 4, 7, 9, 7, 4, 2, 0],
      [0, -2, 3, 5, 7, 5, 3, 0],
      
      // Rhythmic/Energetic Patterns
      [0, 7, -5, 2, 4, 0, -3, 5],
      [0, 3, 7, 5, 2, 4, 0, -2],
      
      // Ambient/Atmospheric Patterns
      [0, 5, 7, 12, 10, 7, 5, 0],
      [0, 7, 9, 5, 7, 4, 2, 0]
    ];

    professionalPatterns.forEach(pattern => {
      for (let i = 0; i < pattern.length - 1; i++) {
        const current = pattern[i].toString();
        const next = pattern[i + 1].toString();
        
        if (!this.transitionMatrix.has(current)) {
          this.transitionMatrix.set(current, new Map());
        }
        
        const transitions = this.transitionMatrix.get(current)!;
        transitions.set(next, (transitions.get(next) || 0) + 1);
      }
    });
  }

  generateMelody(length: number, chords: number[][]): number[] {
    const melody: number[] = [0];
    this.harmonicContext = chords.flat();
    
    for (let i = 1; i < length; i++) {
      const current = melody[i - 1].toString();
      const currentChord = chords[Math.floor(i / 4) % chords.length];
      
      let nextNote = 0;
      const transitions = this.transitionMatrix.get(current);
      
      if (transitions && transitions.size > 0) {
        const candidates: Array<{note: number, weight: number}> = [];
        
        for (const [noteStr, weight] of transitions) {
          const note = parseInt(noteStr);
          // Bevorzuge harmonische Noten (Akkordtöne)
          const harmonyBonus = currentChord.includes((note + 12) % 12) ? 3 : 1;
          candidates.push({note, weight: weight * harmonyBonus});
        }
        
        const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const {note, weight} of candidates) {
          random -= weight;
          if (random <= 0) {
            nextNote = note;
            break;
          }
        }
      } else {
        // Fallback: Wähle harmonische Note
        nextNote = currentChord[Math.floor(Math.random() * currentChord.length)];
      }
      
      melody.push(nextNote);
    }
    
    return melody;
  }
}

// Professionelle Instrumenten-Synthese
class InstrumentSynthesizer {
  private audioContext: AudioContext;
  
  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  // Erstelle einen realistischen Piano-Sound
  createPiano(frequency: number, time: number, duration: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 2) * (1 - Math.exp(-t * 50));
      
      // Mehrere Harmonics für realistischen Piano-Sound
      const fundamental = Math.sin(2 * Math.PI * frequency * t);
      const harmonic2 = Math.sin(2 * Math.PI * frequency * 2 * t) * 0.5;
      const harmonic3 = Math.sin(2 * Math.PI * frequency * 3 * t) * 0.3;
      const harmonic4 = Math.sin(2 * Math.PI * frequency * 4 * t) * 0.2;
      
      data[i] = (fundamental + harmonic2 + harmonic3 + harmonic4) * envelope * 0.3;
    }
    
    return buffer;
  }

  // Erstelle einen warmen Pad-Sound
  createPad(frequency: number, time: number, duration: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = (1 - Math.exp(-t * 3)) * Math.exp(-t * 0.5);
      
      // Detuned Oscillators für warmen Pad-Sound
      const osc1 = Math.sin(2 * Math.PI * frequency * t);
      const osc2 = Math.sin(2 * Math.PI * frequency * 1.003 * t);
      const osc3 = Math.sin(2 * Math.PI * frequency * 0.997 * t);
      
      // Low-pass Filter Simulation
      const filtered = (osc1 + osc2 + osc3) / 3;
      
      data[i] = filtered * envelope * 0.4;
    }
    
    return buffer;
  }

  // Erstelle einen professionellen Bass-Sound
  createBass(frequency: number, time: number, duration: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 1.5);
      
      // Sawtooth mit Sub-Bass
      const sawtooth = 2 * (frequency * t - Math.floor(frequency * t + 0.5));
      const sub = Math.sin(2 * Math.PI * frequency * 0.5 * t);
      
      data[i] = (sawtooth * 0.7 + sub * 0.3) * envelope * 0.6;
    }
    
    return buffer;
  }
}

export class AIMusicGenerator {
  private audioContext: AudioContext;
  private melodyAI: ProfessionalMelodyAI;
  private instrumentSynth: InstrumentSynthesizer;
  private gainNode: GainNode;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.4;
    this.gainNode.connect(this.audioContext.destination);
    
    // Initialisiere AI-Module
    this.melodyAI = new ProfessionalMelodyAI();
    this.instrumentSynth = new InstrumentSynthesizer(this.audioContext);
  }

  // Hauptfunktion: Generiere KI-basierte professionelle Musik
  async generateTrack(style: 'scifi' | 'jungle' | 'monkey', seed: number = Date.now()): Promise<AudioBuffer> {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Setze Seed für reproduzierbare Ergebnisse
    this.melodyAI = new ProfessionalMelodyAI(seed);

    const duration = 60; // 1 Minute
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);

    // Generiere AI-basierte musikalische Elemente
    const chords = AdvancedMusicTheory.progressions[style];
    const melody = this.melodyAI.generateMelody(64, chords);
    const bpm = style === 'scifi' ? 108 : style === 'jungle' ? 126 : 118;
    const beatLength = 60 / bpm / 4; // 16tel Noten
    
    // Style-spezifische Parameter
    const params = this.getStyleParameters(style);
    const rhythmPattern = AdvancedMusicTheory.rhythmPatterns[style];
    
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const time = i / sampleRate;
        let sample = 0;
        
        // Haupt-Melodie (Lead-Instrument)
        const noteIndex = Math.floor(time / (beatLength * 2)) % melody.length;
        const baseFreq = params.baseFreq;
        const melodyFreq = baseFreq * Math.pow(2, melody[noteIndex] / 12);
        const noteTime = (time % (beatLength * 2)) / (beatLength * 2);
        const melodyEnvelope = this.calculateProfessionalEnvelope(noteTime);
        const melodySample = this.generateRichSynth(melodyFreq, time, params.leadWaveform) * melodyEnvelope * 0.35;
        
        // Akkord-Progression (Pad)
        const chordIndex = Math.floor(time / (beatLength * 16)) % chords.length;
        const currentChord = chords[chordIndex];
        let harmonySample = 0;
        
        for (let c = 0; c < currentChord.length; c++) {
          const chordFreq = baseFreq * Math.pow(2, currentChord[c] / 12) * 0.5;
          harmonySample += this.generatePad(chordFreq, time) * 0.15;
        }
        
        // Bass-Linie
        const bassNote = currentChord[0]; // Root note
        const bassFreq = baseFreq * Math.pow(2, (bassNote - 12) / 12);
        const bassPattern = Math.floor(time / beatLength) % 2 === 0 ? 1 : 0.6;
        const bassSample = this.generateBass(bassFreq, time) * bassPattern * 0.4;
        
        // Drums
        const beatIndex = Math.floor(time / beatLength) % 16;
        const kickIntensity = rhythmPattern.kick[beatIndex];
        const snareIntensity = rhythmPattern.snare[beatIndex];
        const hihatIntensity = rhythmPattern.hihat[beatIndex];
        
        const drumSample = 
          this.generateKick(time, beatLength) * kickIntensity * 0.5 +
          this.generateSnare(time, beatLength) * snareIntensity * 0.3 +
          this.generateHihat(time, beatLength) * hihatIntensity * 0.2;
        
        // Stereo-Effekte
        const pan = channel === 0 ? 0.9 : 1.1;
        const stereoMelody = channel === 0 ? melodySample : melodySample * 0.8;
        
        sample = (stereoMelody + harmonySample + bassSample + drumSample) * pan;
        
        // Professioneller Reverb
        if (i > sampleRate * 0.08) {
          const delay1 = data[i - Math.floor(sampleRate * 0.08)] * 0.15;
          const delay2 = i > sampleRate * 0.15 ? data[i - Math.floor(sampleRate * 0.15)] * 0.08 : 0;
          sample += delay1 + delay2;
        }
        
        // Soft Limiting und Kompression
        sample = Math.tanh(sample * 1.2) * 0.8;
        
        data[i] = sample;
      }
    }

    return buffer;
  }

  private getStyleParameters(style: 'scifi' | 'jungle' | 'monkey') {
    switch (style) {
      case 'scifi':
        return {
          baseFreq: 220, // A3
          leadWaveform: 'sawtooth' as const,
          filterCutoff: 1800,
          reverb: 0.5
        };
      case 'jungle':
        return {
          baseFreq: 164.81, // E3
          leadWaveform: 'square' as const,
          filterCutoff: 2200,
          reverb: 0.4
        };
      case 'monkey':
        return {
          baseFreq: 261.63, // C4
          leadWaveform: 'triangle' as const,
          filterCutoff: 2800,
          reverb: 0.3
        };
    }
  }

  private generateRichSynth(frequency: number, time: number, waveform: 'sawtooth' | 'square' | 'triangle'): number {
    const fundamental = this.generateWaveform(frequency, time, waveform);
    const harmonic2 = this.generateWaveform(frequency * 2, time, waveform) * 0.3;
    const harmonic3 = this.generateWaveform(frequency * 3, time, waveform) * 0.1;
    
    // Leichtes Detune für Wärme
    const detuned = this.generateWaveform(frequency * 1.002, time, waveform) * 0.8;
    
    return (fundamental + harmonic2 + harmonic3 + detuned) * 0.4;
  }

  private generatePad(frequency: number, time: number): number {
    const osc1 = Math.sin(2 * Math.PI * frequency * time);
    const osc2 = Math.sin(2 * Math.PI * frequency * 1.005 * time);
    const osc3 = Math.sin(2 * Math.PI * frequency * 0.995 * time);
    
    // Slow attack für Pad-Sound
    const envelope = 1 - Math.exp(-time * 2);
    
    return (osc1 + osc2 + osc3) / 3 * envelope;
  }

  private generateBass(frequency: number, time: number): number {
    const sawtooth = 2 * (frequency * time - Math.floor(frequency * time + 0.5));
    const sub = Math.sin(2 * Math.PI * frequency * 0.5 * time);
    const triangle = 2 * Math.abs(2 * (frequency * 0.5 * time - Math.floor(frequency * 0.5 * time + 0.5))) - 1;
    
    return (sawtooth * 0.6 + sub * 0.3 + triangle * 0.1);
  }

  private generateKick(time: number, beatLength: number): number {
    const beatTime = time % beatLength;
    if (beatTime > 0.1) return 0;
    
    const frequency = 60 * (1 - beatTime * 5);
    const envelope = Math.exp(-beatTime * 20);
    
    return Math.sin(2 * Math.PI * frequency * beatTime) * envelope;
  }

  private generateSnare(time: number, beatLength: number): number {
    const beatTime = time % beatLength;
    if (beatTime > 0.08) return 0;
    
    const noise = (Math.random() - 0.5) * 2;
    const tone = Math.sin(2 * Math.PI * 200 * beatTime);
    const envelope = Math.exp(-beatTime * 15);
    
    return (noise * 0.7 + tone * 0.3) * envelope;
  }

  private generateHihat(time: number, beatLength: number): number {
    const beatTime = time % beatLength;
    if (beatTime > 0.05) return 0;
    
    const noise = (Math.random() - 0.5) * 2;
    const envelope = Math.exp(-beatTime * 30);
    
    return noise * envelope;
  }

  private generateWaveform(frequency: number, time: number, waveform: 'sawtooth' | 'square' | 'triangle'): number {
    switch (waveform) {
      case 'sawtooth':
        return 2 * (frequency * time - Math.floor(frequency * time + 0.5));
      case 'square':
        return Math.sin(2 * Math.PI * frequency * time) > 0 ? 1 : -1;
      case 'triangle':
        return 2 * Math.abs(2 * (frequency * time - Math.floor(frequency * time + 0.5))) - 1;
    }
  }

  private calculateProfessionalEnvelope(noteTime: number): number {
    const attack = 0.05;
    const decay = 0.2;
    const sustain = 0.7;
    const release = 0.3;
    
    if (noteTime < attack) {
      return noteTime / attack;
    } else if (noteTime < attack + decay) {
      return 1 - (1 - sustain) * (noteTime - attack) / decay;
    } else if (noteTime < 1 - release) {
      return sustain;
    } else {
      return sustain * (1 - noteTime) / release;
    }
  }

  async playTrack(style: 'scifi' | 'jungle' | 'monkey'): Promise<AudioBufferSourceNode> {
    const buffer = await this.generateTrack(style);
    
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
    // Cleanup wird vom useAudioManager übernommen
  }
}