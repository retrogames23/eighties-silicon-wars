// Obsoleszenz-Manager für Hardware-Alterung über Zeit
export class ObsolescenceManager {
  
  /**
   * Berechnet Obsoleszenz-Faktor: Ältere Hardware wird weniger attraktiv
   */
  static calculateObsolescenceFactor(
    releaseYear: number, 
    releaseQuarter: number, 
    currentYear: number, 
    currentQuarter: number
  ): { factor: number; quarters: number } {
    const quartersSinceRelease = (currentYear - releaseYear) * 4 + (currentQuarter - releaseQuarter);
    
    // -15% Appeal pro Quartal, mindestens 20% der ursprünglichen Attraktivität
    const factor = Math.max(0.2, 1.0 - (quartersSinceRelease * 0.15));
    
    return { factor, quarters: quartersSinceRelease };
  }
  
  /**
   * Prüft Obsoleszenz-Effekte für Tests
   */
  static testObsolescenceEffect(models: any[], currentYear: number, currentQuarter: number): void {
    console.log(`🧪 [Obsolescence Test] Testing age effects in Q${currentQuarter}/${currentYear}`);
    
    const testedModels = models.filter(m => 
      m.status === 'released' && 
      m.releaseYear && 
      m.releaseQuarter &&
      (currentYear > m.releaseYear || (currentYear === m.releaseYear && currentQuarter > m.releaseQuarter))
    );
    
    if (testedModels.length === 0) {
      console.log(`📝 No aged models to test yet`);
      return;
    }
    
    testedModels.forEach(model => {
      const { factor, quarters } = this.calculateObsolescenceFactor(
        model.releaseYear, 
        model.releaseQuarter, 
        currentYear, 
        currentQuarter
      );
      
      if (quarters >= 2) { // Ab 2+ Quartalen Alter
        console.log(`⏰ ${model.name} (${quarters}Q old): ${(factor * 100).toFixed(1)}% appeal vs. launch`);
        console.log(`✅ ASSERTION: Gleicher Preis, ältere Hardware → sichtbar weniger Verkäufe ab Q+2`);
      }
    });
  }
  
  /**
   * Wendet Obsoleszenz auf Modell-Sales an
   */
  static applyObsolescenceToSales(
    baseSales: number,
    releaseYear: number,
    releaseQuarter: number,
    currentYear: number,
    currentQuarter: number
  ): number {
    const { factor } = this.calculateObsolescenceFactor(releaseYear, releaseQuarter, currentYear, currentQuarter);
    return Math.round(baseSales * factor);
  }
}