// Zentrale Hardware-Verwaltung - Single Source of Truth
import { HARDWARE_TIMELINE, type CustomChip } from "@/components/GameMechanics";

export interface HardwareComponent {
  id: string;
  name: string;
  type: 'cpu' | 'gpu' | 'memory' | 'sound' | 'storage' | 'display';
  performance: number;
  cost: number;
  description: string;
  year: number;
  quarter?: number;
  available: boolean;
  isCustomChip?: boolean;
  exclusiveToPlayer?: boolean;
}

export class HardwareManager {
  private static readonly BASE_COMPONENTS = {
    cpu: [
      { name: 'MOS 6502', performance: 15, cost: 25, description: '8-bit Prozessor, 1 MHz - Der Klassiker', year: 1983, quarter: 1 },
      { name: 'Zilog Z80', performance: 20, cost: 35, description: '8-bit Prozessor, 2,5 MHz - Zuverlässig und bewährt', year: 1983, quarter: 1 },
      { name: 'Intel 8086', performance: 35, cost: 85, description: '16-bit Prozessor, 5 MHz - Moderne Business-Power', year: 1984, quarter: 1 },
      { name: 'Motorola 68000', performance: 45, cost: 120, description: '16/32-bit Prozessor, 8 MHz - Premium Performance', year: 1984, quarter: 2 },
      { name: 'Intel 80286', performance: 65, cost: 200, description: '16-bit Prozessor, 12 MHz - High-End Computing', year: 1985, quarter: 1 },
      { name: 'Intel 80386', performance: 85, cost: 350, description: '32-bit Prozessor, 16 MHz - Zukunftstechnologie', year: 1986, quarter: 1 },
      { name: 'Intel 80486', performance: 100, cost: 500, description: '32-bit Prozessor, 25 MHz - Spitzentechnologie', year: 1988, quarter: 1 }
    ],
    gpu: [
      { name: 'MOS VIC', performance: 10, cost: 15, description: '160x200 Pixel, 16 Farben - Einfache Grafik', year: 1983, quarter: 1 },
      { name: 'TI TMS9918', performance: 25, cost: 45, description: '256x192 Pixel, 16 Farben - Solide Gaming-Grafik', year: 1983, quarter: 2 },
      { name: 'Atari GTIA', performance: 30, cost: 60, description: '320x192 Pixel, 256 Farben - Atari-Technologie', year: 1984, quarter: 1 },
      { name: 'Commodore VIC-II', performance: 35, cost: 70, description: '320x200 Pixel, Sprites - Der C64-Chip', year: 1984, quarter: 3 },
      { name: 'EGA Graphics', performance: 45, cost: 120, description: '640x350 Pixel, 16 Farben - Enhanced Graphics', year: 1985, quarter: 4 },
      { name: 'VGA Graphics', performance: 55, cost: 180, description: '640x480 Pixel, 256 Farben - VGA-Standard', year: 1986, quarter: 2 },
      { name: 'Super VGA', performance: 70, cost: 250, description: '800x600 Pixel, High-Res Gaming', year: 1987, quarter: 2 }
    ],
    memory: [
      { name: '4KB RAM', performance: 5, cost: 20, description: '4096 Byte Arbeitsspeicher - Basis-Ausstattung', year: 1983, quarter: 1 },
      { name: '16KB RAM', performance: 15, cost: 60, description: '16384 Byte Arbeitsspeicher - Erweitert', year: 1983, quarter: 1 },
      { name: '64KB RAM', performance: 35, cost: 150, description: '65536 Byte Arbeitsspeicher - Komfortabel', year: 1984, quarter: 1 },
      { name: '256KB RAM', performance: 55, cost: 300, description: '262144 Byte Arbeitsspeicher - Professionell', year: 1985, quarter: 1 },
      { name: '512KB RAM', performance: 70, cost: 500, description: '512KB Arbeitsspeicher - High-End', year: 1986, quarter: 1 },
      { name: '1MB RAM', performance: 85, cost: 800, description: '1 Megabyte Arbeitsspeicher - Workstation-Niveau', year: 1987, quarter: 1 },
      { name: '2MB RAM', performance: 95, cost: 1200, description: '2 Megabyte Arbeitsspeicher - Extrem viel Speicher', year: 1988, quarter: 1 }
    ],
    sound: [
      { name: 'PC Speaker', performance: 5, cost: 5, description: 'Einfache Pieptöne - Basis-Sound', year: 1983, quarter: 1 },
      { name: 'AY-3-8910', performance: 25, cost: 35, description: '3-Kanal Synthesizer - Klassischer Arcade-Sound', year: 1983, quarter: 4 },
      { name: 'SID 6581', performance: 45, cost: 80, description: '3-Kanal Synthesizer + Filter - Legendärer C64-Sound', year: 1984, quarter: 3 },
      { name: 'Yamaha YM2149', performance: 35, cost: 50, description: '3-Kanal PSG Synthesizer - Atari ST Sound', year: 1985, quarter: 3 },
      { name: 'AdLib Sound', performance: 60, cost: 120, description: 'FM-Synthesizer - PC-Gaming Audio', year: 1986, quarter: 2 },
      { name: 'Sound Blaster', performance: 75, cost: 150, description: 'Digitale Samples + FM - Premium PC-Audio', year: 1987, quarter: 1 },
      { name: 'Sound Blaster Pro', performance: 90, cost: 200, description: 'Stereo Digital Audio - Professioneller Sound', year: 1989, quarter: 3 }
    ],
    storage: [
      { name: 'Kassettenlaufwerk', performance: 10, cost: 40, description: 'Datenspeicherung auf Kassette - Günstig aber langsam', year: 1983, quarter: 2 },
      { name: 'Diskettenlaufwerk 5.25"', performance: 35, cost: 150, description: '160KB Disketten - Standard-Speicher', year: 1983, quarter: 3 },
      { name: 'Diskettenlaufwerk 3.5"', performance: 50, cost: 120, description: '720KB Disketten - Moderne Disketten', year: 1985, quarter: 3 },
      { name: 'Festplatte 5MB', performance: 60, cost: 1500, description: '5 Megabyte Festplatte - Permanenter Speicher', year: 1985, quarter: 2 },
      { name: 'Festplatte 10MB', performance: 65, cost: 1200, description: '10 Megabyte Festplatte - Mehr Kapazität', year: 1986, quarter: 3 },
      { name: 'Festplatte 20MB', performance: 70, cost: 1000, description: '20 Megabyte Festplatte - Viel Speicherplatz', year: 1987, quarter: 2 },
      { name: 'CD-ROM Drive', performance: 55, cost: 800, description: 'CD-ROM Laufwerk - Multimedia-Zukunft', year: 1986, quarter: 4 }
    ],
    display: [
      { name: 'RF Modulator', performance: 15, cost: 25, description: 'Anschluss an TV-Gerät - Budget-Option', year: 1983, quarter: 3 },
      { name: 'Composite Monitor', performance: 35, cost: 200, description: 'Monochrom Monitor - Scharf und klar', year: 1983, quarter: 4 },
      { name: 'RGB Monitor', performance: 65, cost: 500, description: 'Farb-Monitor RGB - Brillante Farben', year: 1984, quarter: 4 },
      { name: 'EGA Monitor', performance: 75, cost: 600, description: 'Enhanced Graphics Monitor - Professionell', year: 1985, quarter: 4 },
      { name: 'VGA Monitor', performance: 85, cost: 750, description: 'VGA High-Resolution Monitor - Beste Bildqualität', year: 1987, quarter: 1 },
      { name: 'Multisync Monitor', performance: 95, cost: 1200, description: 'Multi-Standard Monitor - Workstation-Klasse', year: 1988, quarter: 2 }
    ]
  };

  /**
   * Holt alle verfügbaren Hardware-Komponenten basierend auf Jahr, Quartal und Custom Chips
   */
  static getAvailableComponents(
    currentYear: number, 
    currentQuarter: number, 
    customChips: CustomChip[] = []
  ): HardwareComponent[] {
    const components: HardwareComponent[] = [];
    let componentId = 0;

    // Historische Hardware (verfügbar für alle basierend auf Timeline)
    Object.entries(this.BASE_COMPONENTS).forEach(([type, hardwareList]) => {
      hardwareList.forEach(hw => {
        const isTimeAvailable = (currentYear > hw.year) || 
                               (currentYear === hw.year && currentQuarter >= (hw.quarter || 1));
        
        components.push({
          id: `hw-${componentId++}`,
          name: hw.name,
          type: type as HardwareComponent['type'],
          performance: hw.performance,
          cost: hw.cost,
          description: hw.description,
          year: hw.year,
          quarter: hw.quarter,
          available: isTimeAvailable,
          isCustomChip: false,
          exclusiveToPlayer: false
        });
      });
    });

    // Custom Chips (exklusiv für Spieler durch Forschung)
    customChips.forEach(chip => {
      components.push({
        id: `custom-${chip.id}`,
        name: `${chip.name} ⭐`,
        type: chip.type as HardwareComponent['type'],
        performance: chip.performance,
        cost: chip.cost,
        description: `${chip.description} - EXKLUSIV`,
        year: chip.developedYear,
        quarter: chip.developedQuarter,
        available: true,
        isCustomChip: true,
        exclusiveToPlayer: true
      });
    });

    return components;
  }

  /**
   * Prüft ob neue Hardware seit dem letzten Quartal verfügbar wurde
   */
  static getNewlyAvailableHardware(
    previousYear: number,
    previousQuarter: number,
    currentYear: number,
    currentQuarter: number
  ): HardwareComponent[] {
    const newHardware: HardwareComponent[] = [];
    let componentId = 0;

    Object.entries(this.BASE_COMPONENTS).forEach(([type, hardwareList]) => {
      hardwareList.forEach(hw => {
        const wasAvailable = (previousYear > hw.year) || 
                            (previousYear === hw.year && previousQuarter >= (hw.quarter || 1));
        const isNowAvailable = (currentYear > hw.year) || 
                              (currentYear === hw.year && currentQuarter >= (hw.quarter || 1));
        
        if (!wasAvailable && isNowAvailable) {
          newHardware.push({
            id: `new-hw-${componentId++}`,
            name: hw.name,
            type: type as HardwareComponent['type'],
            performance: hw.performance,
            cost: hw.cost,
            description: hw.description,
            year: hw.year,
            quarter: hw.quarter,
            available: true,
            isCustomChip: false,
            exclusiveToPlayer: false
          });
        }
      });
    });

    return newHardware;
  }

  /**
   * Holt Hardware-Komponente für Preiskalkulationen
   */
  static getComponentByCPU(cpu: string): { performance: number; cost: number } | null {
    const cpuData = this.BASE_COMPONENTS.cpu.find(c => c.name === cpu);
    return cpuData ? { performance: cpuData.performance, cost: cpuData.cost } : null;
  }

  static getComponentByGPU(gpu: string): { performance: number; cost: number } | null {
    const gpuData = this.BASE_COMPONENTS.gpu.find(c => c.name === gpu);
    return gpuData ? { performance: gpuData.performance, cost: gpuData.cost } : null;
  }

  static getComponentByRAM(ram: string): { performance: number; cost: number } | null {
    const ramData = this.BASE_COMPONENTS.memory.find(c => c.name === ram);
    return ramData ? { performance: ramData.performance, cost: ramData.cost } : null;
  }

  static getComponentBySound(sound: string): { performance: number; cost: number } | null {
    const soundData = this.BASE_COMPONENTS.sound.find(c => c.name === sound);
    return soundData ? { performance: soundData.performance, cost: soundData.cost } : null;
  }

  /**
   * Berechnet Gesamtkosten eines Computer-Modells
   */
  static calculateModelCost(model: {
    cpu: string;
    gpu: string; 
    ram: string;
    sound: string;
    accessories?: string[];
    case?: { price: number };
  }): number {
    let totalCost = 0;

    // CPU
    const cpuData = this.getComponentByCPU(model.cpu);
    totalCost += cpuData?.cost || 50;

    // GPU  
    const gpuData = this.getComponentByGPU(model.gpu);
    totalCost += gpuData?.cost || 30;

    // RAM
    const ramData = this.getComponentByRAM(model.ram);
    totalCost += ramData?.cost || 40;

    // Sound
    const soundData = this.getComponentBySound(model.sound);
    totalCost += soundData?.cost || 5;

    // Accessories (Storage/Display)
    const accessoryCosts = {
      'Kassettenlaufwerk': 40,
      'Diskettenlaufwerk 5.25"': 150,
      'Diskettenlaufwerk 3.5"': 120,
      'Festplatte 5MB': 1500,
      'Festplatte 10MB': 1200,
      'Festplatte 20MB': 1000,
      'CD-ROM Drive': 800,
      'RF Modulator': 25,
      'Composite Monitor': 200,
      'RGB Monitor': 500,
      'EGA Monitor': 600,
      'VGA Monitor': 750,
      'Multisync Monitor': 1200
    };

    if (model.accessories) {
      model.accessories.forEach(accessory => {
        totalCost += accessoryCosts[accessory as keyof typeof accessoryCosts] || 50;
      });
    }

    // Case
    totalCost += model.case?.price || 80;

    return totalCost;
  }
}