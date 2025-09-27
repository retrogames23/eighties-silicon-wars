// Centralized Hardware Availability Service - Single Source of Truth
import { HardwareManager, type HardwareComponent } from '@/utils/HardwareManager';
import { type CustomChip } from '@/lib/game';

export class HardwareAvailabilityService {
  /**
   * Single source of truth for hardware availability
   * All UI components should use this method
   */
  static getAvailableHardware(
    currentYear: number,
    currentQuarter: number,
    customChips: CustomChip[] = []
  ): HardwareComponent[] {
    return HardwareManager.getAvailableComponents(currentYear, currentQuarter, customChips)
      .filter(component => component.available);
  }

  /**
   * Get hardware by type for popups/tooltips
   */
  static getAvailableHardwareByType(
    type: HardwareComponent['type'],
    currentYear: number,
    currentQuarter: number,
    customChips: CustomChip[] = []
  ): HardwareComponent[] {
    return this.getAvailableHardware(currentYear, currentQuarter, customChips)
      .filter(component => component.type === type);
  }

  /**
   * Check if specific hardware is available at given time
   */
  static isHardwareAvailable(
    hardwareName: string,
    currentYear: number,
    currentQuarter: number,
    customChips: CustomChip[] = []
  ): boolean {
    const availableHardware = this.getAvailableHardware(currentYear, currentQuarter, customChips);
    return availableHardware.some(hw => hw.name === hardwareName);
  }

  /**
   * Get newly available hardware for news synchronization
   */
  static getNewlyAvailableHardware(
    previousYear: number,
    previousQuarter: number,
    currentYear: number,
    currentQuarter: number
  ): HardwareComponent[] {
    return HardwareManager.getNewlyAvailableHardware(
      previousYear,
      previousQuarter,
      currentYear,
      currentQuarter
    );
  }
}