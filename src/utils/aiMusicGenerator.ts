// AI-basierte Musikgenerierung für authentische 80er-Jahre-Sounds
// Verwendet Machine Learning Konzepte und musikalische KI-Algorithmen

export interface AITrackConfig {
  name: string;
  title: string;
  bpm: number;
  key: string;
  style: 'scifi' | 'jungle' | 'monkey';
  seed?: number; // Für reproduzierbare Ergebnisse
}

// Musikalische Skalen und Akkorde für 80er-Jahre-Musik
class MusicTheoryAI {
  // 80er-Jahre typische Skalen
  static readonly scales = {
    dorian: [0, 2, 3, 5, 7, 9, 10], // Sehr 80er
    minor: [0, 2, 3, 5, 7, 8, 10],
    pentatonic: [0, 2, 5, 7, 9], // Für exotische Sounds
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  };

  // 80er-Jahre Akkordprogressionen
  static readonly progressions = {
    synthwave: [0, 7, 5, 10], // i-VII-v-♭VI (sehr 80er)
    eighties: [0, 5, 7, 3], // i-v-VII-III
    retro: [0, 10, 7, 5], // i-♭VI-VII-v
    ambient: [0, 7, 10, 5] // i-VII-♭VI-v
  };

  // Rhythmus-Patterns für verschiedene Stile
  static readonly rhythmPatterns = {
    scifi: [1, 0, 0.5, 0, 0.8, 0, 0.3, 0], // Spacige Kicks
    jungle: [1, 0, 0, 0.6, 0.2, 0, 0.8, 0.3], // Tribal Pattern
    monkey: [1, 0.3, 0, 0.7, 0, 0.4, 0.9, 0] // Verspielt
  };
}

// Markov-Chain basierte Melodie-Generierung
class MelodyAI {
  private transitionMatrix: Map<string, Map<string, number>> = new Map();
  
  constructor(seed: number = 42) {
    this.seedRandom(seed);
    this.trainModel();
  }

  private seedRandom(seed: number) {
    // Simple seeded random function
    let s = seed;
    Math.random = () => {
      s = Math.imul(16807, s) | 0 % 2147483647;
      return (s & 2147483647) / 2147483648;
    };
  }

  // Trainiere das Modell mit 80er-Jahre typischen Melodie-Patterns
  private trainModel() {
    // 80er-Jahre Melodie-Fragmente (vereinfacht als Intervall-Ketten)
    const melodyPatterns = [
      [0, 2, 0, -1, 3, 0], // Typisches Synthwave-Pattern
      [0, 7, -3, 2, -1, 0], // Retro-Arpeggios
      [0, -2, 4, -1, 2, -3], // New Wave Melodie
      [0, 5, -2, 7, -5, 2], // Spacige Sprünge
    ];

    melodyPatterns.forEach(pattern => {
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

  // Generiere eine neue Melodie basierend auf gelernten Patterns
  generateMelody(length: number = 16): number[] {
    const melody: number[] = [0]; // Starte mit Root
    
    for (let i = 1; i < length; i++) {
      const current = melody[i - 1].toString();
      const transitions = this.transitionMatrix.get(current);
      
      if (transitions && transitions.size > 0) {
        // Wähle nächste Note basierend auf Wahrscheinlichkeiten
        const totalWeight = Array.from(transitions.values()).reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (const [note, weight] of transitions) {
          random -= weight;
          if (random <= 0) {
            melody.push(parseInt(note));
            break;
          }
        }
      } else {
        // Fallback: zufällige Note aus der Skala
        const scaleNotes = [-7, -5, -3, -2, 0, 2, 3, 5, 7];
        melody.push(scaleNotes[Math.floor(Math.random() * scaleNotes.length)]);
      }
    }
    
    return melody;
  }
}

// Neural Network-inspirierte Harmonie-Generierung
class HarmonyAI {
  private weights: number[][];
  
  constructor(seed: number = 42) {
    // Initialisiere "Gewichte" für verschiedene harmonische Funktionen
    this.weights = this.initializeWeights(seed);
  }
  
  private initializeWeights(seed: number): number[][] {
    const seededRandom = (s: number) => {
      s = Math.imul(16807, s) | 0 % 2147483647;
      return (s & 2147483647) / 2147483648;
    };
    
    // Gewichte für Akkord-Übergänge (vereinfachtes "Neural Network")
    const weights: number[][] = [];
    for (let i = 0; i < 12; i++) {
      weights[i] = [];
      for (let j = 0; j < 12; j++) {
        weights[i][j] = seededRandom(seed + i * 12 + j) * 2 - 1;
      }
    }
    return weights;
  }
  
  // "Aktivierungsfunktion" für Akkord-Auswahl
  selectNextChord(currentChord: number, style: string): number {
    const progressions = MusicTheoryAI.progressions;
    const styleProgression = progressions[style as keyof typeof progressions] || progressions.synthwave;
    
    // Verwende Neural Network-ähnliche Berechnung
    let bestChord = 0;
    let maxActivation = -Infinity;
    
    for (const chord of styleProgression) {
      const activation = this.weights[currentChord][chord] + Math.random() * 0.2;
      if (activation > maxActivation) {
        maxActivation = activation;
        bestChord = chord;
      }
    }
    
    return bestChord;
  }
}

export class AIMusicGenerator {
  private audioContext: AudioContext;
  private melodyAI: MelodyAI;
  private harmonyAI: HarmonyAI;
  private gainNode: GainNode;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.3;
    this.gainNode.connect(this.audioContext.destination);
    
    // Initialisiere AI-Module
    this.melodyAI = new MelodyAI();
    this.harmonyAI = new HarmonyAI();
  }

  // Erzeuge einen 80er-Jahre Synthesizer-Sound
  private createSynthOscillator(frequency: number, type: OscillatorType = 'sawtooth'): OscillatorNode {
    const osc = this.audioContext.createOscillator();
    const filter = this.audioContext.createBiquadFilter();
    const envelope = this.audioContext.createGain();
    
    osc.type = type;
    osc.frequency.value = frequency;
    
    // 80er-Jahre typischer Low-Pass Filter
    filter.type = 'lowpass';
    filter.frequency.value = 2000 + Math.random() * 1000;
    filter.Q.value = 15;
    
    // ADSR Envelope (sehr 80er)
    envelope.gain.setValueAtTime(0, this.audioContext.currentTime);
    envelope.gain.linearRampToValueAtTime(0.8, this.audioContext.currentTime + 0.1);
    envelope.gain.linearRampToValueAtTime(0.6, this.audioContext.currentTime + 0.3);
    envelope.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 2);
    
    osc.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.gainNode);
    
    return osc;
  }

  // Generiere Drum-Pattern mit AI
  private generateDrumPattern(style: 'scifi' | 'jungle' | 'monkey', duration: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
    const pattern = MusicTheoryAI.rhythmPatterns[style];
    const bpm = style === 'scifi' ? 120 : style === 'jungle' ? 140 : 130;
    const beatDuration = 60 / bpm / 4; // 16tel Noten
    
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const time = i / sampleRate;
        const beatIndex = Math.floor(time / beatDuration) % pattern.length;
        const intensity = pattern[beatIndex];
        
        if (intensity > 0) {
          // KI-generiertes Drum-Sample
          const frequency = style === 'scifi' ? 60 : style === 'jungle' ? 80 : 70;
          const envelope = Math.exp(-(time % beatDuration) * 20);
          const kick = Math.sin(2 * Math.PI * frequency * time) * envelope * intensity;
          
          // Füge Harmonics für realistischeren Sound hinzu
          const harmonic1 = Math.sin(2 * Math.PI * frequency * 2 * time) * envelope * intensity * 0.3;
          const harmonic2 = Math.sin(2 * Math.PI * frequency * 3 * time) * envelope * intensity * 0.1;
          
          data[i] += (kick + harmonic1 + harmonic2) * 0.7;
        }
      }
    }
    
    return buffer;
  }

  // Hauptfunktion: Generiere KI-basierte 80er-Musik
  async generateTrack(style: 'scifi' | 'jungle' | 'monkey', seed: number = Date.now()): Promise<AudioBuffer> {
    // Resume audio context if needed
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Setze Seed für reproduzierbare Ergebnisse
    this.melodyAI = new MelodyAI(seed);
    this.harmonyAI = new HarmonyAI(seed);

    const duration = 90; // 1.5 Minuten
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);

    // Generiere AI-basierte musikalische Elemente
    const melody = this.melodyAI.generateMelody(32);
    const bpm = style === 'scifi' ? 115 : style === 'jungle' ? 138 : 125;
    const noteLength = 60 / bpm / 2; // Halbe Noten
    
    // Style-spezifische Parameter
    const params = this.getStyleParameters(style);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const time = i / sampleRate;
        let sample = 0;
        
        // AI-generierte Melodie
        const noteIndex = Math.floor(time / noteLength) % melody.length;
        const baseFreq = params.baseFreq;
        const melodyFreq = baseFreq * Math.pow(2, melody[noteIndex] / 12);
        const melodyEnvelope = this.calculateEnvelope(time, noteLength);
        const melodySample = this.generateSynthWave(melodyFreq, time, params.melodyWaveform) * melodyEnvelope * 0.4;
        
        // AI-generierte Harmonie
        const chordIndex = Math.floor(time / (noteLength * 4)) % 4;
        const currentChord = this.harmonyAI.selectNextChord(chordIndex, style);
        const harmonyFreq = baseFreq * Math.pow(2, currentChord / 12) * 0.5;
        const harmonySample = this.generateSynthWave(harmonyFreq, time, 'sawtooth') * 0.2;
        
        // Bass-Linie (AI-generiert)
        const bassFreq = baseFreq * 0.25;
        const bassPattern = Math.sin(time * Math.PI * 2) * 0.3;
        const bassSample = this.generateSynthWave(bassFreq, time, 'triangle') * bassPattern * 0.5;
        
        // Ambient Pad (für Atmosphäre)
        const padFreq = baseFreq * 2;
        const padSample = this.generateSynthWave(padFreq, time, 'sine') * 0.15 * (Math.sin(time * 0.1) + 1) / 2;
        
        // Stereo-Effekte
        const pan = channel === 0 ? 0.8 : 1.2; // Leichtes Stereo-Panning
        
        sample = (melodySample + harmonySample + bassSample + padSample) * pan;
        
        // Einfacher Reverb-Effekt
        if (i > sampleRate * 0.05) {
          const delay = data[i - Math.floor(sampleRate * 0.05)] * 0.2;
          sample += delay;
        }
        
        // Soft Limiting
        sample = Math.tanh(sample * 2) * 0.5;
        
        data[i] = sample;
      }
    }

    // Mixe mit AI-generierten Drums
    const drumBuffer = this.generateDrumPattern(style, duration);
    this.mixBuffers(buffer, drumBuffer, 0.7, 0.3);

    return buffer;
  }

  private getStyleParameters(style: 'scifi' | 'jungle' | 'monkey') {
    switch (style) {
      case 'scifi':
        return {
          baseFreq: 220, // A3
          melodyWaveform: 'sawtooth' as OscillatorType,
          filterCutoff: 1500,
          reverb: 0.4
        };
      case 'jungle':
        return {
          baseFreq: 164.81, // E3
          melodyWaveform: 'square' as OscillatorType,
          filterCutoff: 2000,
          reverb: 0.6
        };
      case 'monkey':
        return {
          baseFreq: 261.63, // C4
          melodyWaveform: 'triangle' as OscillatorType,
          filterCutoff: 2500,
          reverb: 0.3
        };
    }
  }

  private generateSynthWave(frequency: number, time: number, waveform: OscillatorType): number {
    switch (waveform) {
      case 'sine':
        return Math.sin(2 * Math.PI * frequency * time);
      case 'sawtooth':
        return 2 * (frequency * time - Math.floor(frequency * time + 0.5));
      case 'square':
        return Math.sin(2 * Math.PI * frequency * time) > 0 ? 1 : -1;
      case 'triangle':
        return 2 * Math.abs(2 * (frequency * time - Math.floor(frequency * time + 0.5))) - 1;
      default:
        return Math.sin(2 * Math.PI * frequency * time);
    }
  }

  private calculateEnvelope(time: number, noteLength: number): number {
    const noteTime = time % noteLength;
    const attack = 0.1;
    const decay = 0.2;
    const sustain = 0.6;
    const release = 0.3;
    
    if (noteTime < attack) {
      return noteTime / attack;
    } else if (noteTime < attack + decay) {
      return 1 - (1 - sustain) * (noteTime - attack) / decay;
    } else if (noteTime < noteLength - release) {
      return sustain;
    } else {
      return sustain * (noteLength - noteTime) / release;
    }
  }

  private mixBuffers(buffer1: AudioBuffer, buffer2: AudioBuffer, mix1: number, mix2: number) {
    for (let channel = 0; channel < Math.min(buffer1.numberOfChannels, buffer2.numberOfChannels); channel++) {
      const data1 = buffer1.getChannelData(channel);
      const data2 = buffer2.getChannelData(channel);
      const length = Math.min(data1.length, data2.length);
      
      for (let i = 0; i < length; i++) {
        data1[i] = data1[i] * mix1 + data2[i] * mix2;
      }
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
    // Cleanup wird vom useAudioManager Handle übernommen
  }
}