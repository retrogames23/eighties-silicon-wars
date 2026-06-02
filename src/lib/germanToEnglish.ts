// Runtime DE → EN translation for dynamically generated game text
// (test report comments, ratings, market verdicts, advisor headlines, etc.).
//
// Background: Test reports and several services emit user-facing German strings
// at runtime that are not driven by i18n keys. Refactoring all generators to
// emit translation keys would be a large surgical change. This map lets us
// localize the output without touching the generators, and falls back to the
// original German text when no mapping exists.

import i18n from "i18next";

const DE_TO_EN: Record<string, string> = {
  // ----- Ratings (lowercase comparison) -----
  "Exzellent": "Excellent",
  "Hervorragend": "Outstanding",
  "Sehr gut": "Very good",
  "Gut": "Good",
  "Befriedigend": "Satisfactory",
  "Durchschnittlich": "Average",
  "Ausreichend": "Sufficient",
  "Mangelhaft": "Poor",
  "Ungenügend": "Inadequate",
  "Nicht anwendbar": "Not applicable",

  // ----- Gaming comments -----
  "Exzellente Grafikleistung setzt neue Maßstäbe für Gaming-Computer": "Excellent graphics set a new bar for gaming computers",
  "Sehr gute Grafik-Performance für anspruchsvolle Spiele": "Very good graphics performance for demanding games",
  "Solide Grafikdarstellung für die meisten aktuellen Spiele": "Solid graphics for most current games",
  "Exzellente Grafikleistung ermöglicht beste Gaming-Erfahrung der 80er Jahre": "Excellent graphics deliver the best gaming experience of the 80s",
  "Exzellente Grafikleistung für Spiele der 80er Jahre": "Excellent graphics for 80s-era games",
  "Sehr gute Grafikdarstellung für anspruchsvolle Spiele geeignet": "Very good graphics, suitable for demanding games",
  "Solide Grafikdarstellung, geeignet für die meisten Spiele": "Solid graphics suitable for most games",
  "Solide Grafik für die meisten aktuellen Spiele ausreichend": "Solid graphics, sufficient for most current games",
  "Ausreichende Grafik für einfachere Spiele": "Adequate graphics for simpler games",
  "Grafik ist für moderne Spiele eher limitiert": "Graphics are rather limited for modern games",
  "Grafikleistung limitiert das Gaming-Erlebnis erheblich": "Graphics significantly limit the gaming experience",
  "Grafik-Leistung limitiert das Gaming-Potenzial erheblich": "Graphics significantly limit the gaming potential",
  "Gute Sound-Qualität verbessert das Spielerlebnis spürbar": "Good sound quality noticeably improves the gameplay experience",
  "Gute Sound-Qualität verbessert das Spielerlebnis deutlich": "Good sound quality clearly improves the gameplay experience",
  "Guter Sound-Chip ergänzt starke Grafik perfekt für Spiele": "Solid sound chip pairs perfectly with strong graphics for games",
  "Hervorragender Sound-Chip sorgt für beeindruckende Audio-Effekte": "Outstanding sound chip delivers impressive audio effects",
  "Hervorragender Sound-Chip mit beeindruckenden Audio-Effekten": "Outstanding sound chip with impressive audio effects",
  "Hervorragender Sound-Chip bietet beeindruckende Audio-Effekte": "Outstanding sound chip provides impressive audio effects",
  "Basic Sound-Ausgabe mindert das Gaming-Erlebnis": "Basic sound output detracts from the gaming experience",
  "Sound-Ausgabe ist sehr basic und limitiert": "Sound output is very basic and limited",
  "Leistungsstarke CPU ermöglicht flüssige Spiele-Performance": "Powerful CPU enables smooth gameplay performance",
  "Leistungsstarke CPU sorgt für flüssige Spiele-Performance": "Powerful CPU ensures smooth gameplay performance",
  "CPU-Performance könnte bei anspruchsvollen Spielen limitieren": "CPU performance may limit demanding games",
  "CPU-Leistung könnte bei anspruchsvollen Spielen limitieren": "CPU power may limit demanding games",
  "Farbmonitor ermöglicht brillante visuelle Gaming-Erfahrung": "Color monitor enables a brilliant visual gaming experience",
  "RGB-Monitor ermöglicht brillante Farbdarstellung": "RGB monitor enables brilliant color rendering",
  "Monochrom-Display mindert das visuelle Gaming-Erlebnis": "Monochrome display detracts from the visual gaming experience",
  "Ohne Farbmonitor geht viel vom visuellen Erlebnis verloren": "Without a color monitor, much of the visual experience is lost",

  // ----- Business comments -----
  "Exzellente CPU-Leistung für anspruchsvollste Büro-Anwendungen": "Excellent CPU power for the most demanding office applications",
  "Exzellente CPU-Leistung für anspruchsvolle Büro-Anwendungen": "Excellent CPU power for demanding office applications",
  "Sehr gute Performance für professionelle Software und Tabellenkalkulation": "Very good performance for professional software and spreadsheets",
  "Sehr gute Performance für Standardsoftware und Tabellenkalkulation": "Very good performance for standard software and spreadsheets",
  "Ausreichende Leistung für Standard-Bürotätigkeiten": "Adequate performance for standard office tasks",
  "Ausreichend für grundlegende Bürotätigkeiten": "Sufficient for basic office tasks",
  "CPU-Performance ist für professionelle Anwendungen zu schwach": "CPU performance is too weak for professional applications",
  "CPU-Leistung ist für professionelle Anwendungen zu schwach": "CPU power is too weak for professional applications",
  "Großzügiger Arbeitsspeicher ermöglicht effizientes Multitasking": "Generous memory enables efficient multitasking",
  "Großzügiger Arbeitsspeicher ermöglicht Multitasking": "Generous memory enables multitasking",
  "Ausreichend RAM für die meisten Business-Anwendungen": "Sufficient RAM for most business applications",
  "Wenig Arbeitsspeicher limitiert komplexere Programme": "Limited memory restricts more complex programs",
  "Diskettenlaufwerk ermöglicht Datenaustausch und -sicherung": "Floppy drive enables data exchange and backup",
  "Festplatte bietet schnellen Zugriff auf Programme und Daten": "Hard disk provides fast access to programs and data",
  "Festplatte bietet schnellen Zugriff auf Programme und Datenspeicherung": "Hard disk provides fast access to programs and data storage",
  "Fehlende Speicherlaufwerke erschweren die praktische Büro-Nutzung": "Missing storage drives hinder practical office use",
  "Fehlende Speicherlaufwerke erschweren die praktische Nutzung": "Missing storage drives hinder practical use",
  "Professionelles Design passt perfekt in Büroumgebungen": "Professional design fits perfectly in office environments",
  "Professionelles Design passt perfekt ins Büro": "Professional design fits perfectly in the office",
  "Gaming-Design wirkt im Bürokontext unprofessionell": "Gaming-styled design looks unprofessional in an office context",

  // ----- Workstation comments -----
  "Spitzen-CPU ermöglicht professionelle CAD- und Engineering-Anwendungen": "Top-tier CPU enables professional CAD and engineering applications",
  "Top-Performance für anspruchsvollste Workstation-Anwendungen": "Top performance for the most demanding workstation applications",
  "Sehr gute Performance für anspruchsvolle Workstation-Tasks": "Very good performance for demanding workstation tasks",
  "Sehr gute Leistung für professionelle CAD/Engineering-Software": "Very good performance for professional CAD/engineering software",
  "Ausreichend für einfachere professionelle Anwendungen": "Sufficient for simpler professional applications",
  "Ausreichend für einfachere Workstation-Tasks": "Sufficient for simpler workstation tasks",
  "CPU-Leistung reicht nicht für echte Workstation-Nutzung": "CPU power is insufficient for true workstation use",
  "CPU-Leistung reicht nicht für echte Workstation-Anwendungen": "CPU power is insufficient for true workstation applications",
  "Großzügiger Arbeitsspeicher für komplexeste Berechnungen und große Datenmengen": "Generous memory for the most complex computations and large datasets",
  "Großzügiger Arbeitsspeicher für komplexeste Berechnungen": "Generous memory for the most complex computations",
  "Ausreichend RAM für mittlere Workstation-Anwendungen": "Sufficient RAM for mid-range workstation applications",
  "Zu wenig RAM für professionelle Workstation-Nutzung": "Too little RAM for professional workstation use",
  "Professionelle Speicherlösungen für große Projektdateien": "Professional storage solutions for large project files",
  "Professionelle Speicherlösungen für große Datenmengen": "Professional storage solutions for large data volumes",
  "Fehlende Festplatte limitiert Workstation-Funktionalität massiv": "Missing hard disk massively limits workstation functionality",
  "Fehlende Festplatte limitiert Workstation-Funktionalität erheblich": "Missing hard disk significantly limits workstation functionality",
  "Workstation-Markt existiert noch nicht in den frühen 80er Jahren": "The workstation market does not yet exist in the early 1980s",
  "Workstation-Markt existiert noch nicht in den frühen 80ern": "The workstation market does not yet exist in the early 80s",

  // ----- Synergies / bottlenecks -----
  "CPU und GPU harmonieren perfekt miteinander": "CPU and GPU harmonize perfectly",
  "RAM-Ausstattung passt perfekt zur CPU-Leistung": "RAM configuration perfectly matches CPU power",
  "Gaming-Case unterstreicht die Gaming-Hardware perfekt": "Gaming case perfectly accents the gaming hardware",
  "Gaming-Design unterstreicht die Spiele-Ausrichtung": "Gaming design underlines the gaming orientation",
  "Business-Case passt ideal zur professionellen Hardware": "Business case is an ideal match for the professional hardware",
  "Speicherlaufwerk + viel RAM = optimale Produktivitäts-Kombination": "Storage drive + plenty of RAM = optimal productivity combo",
  "Starke CPU wird durch schwache Grafik ausgebremst": "Strong CPU is held back by weak graphics",
  "Gute Grafik wird durch schwache CPU limitiert": "Good graphics are limited by a weak CPU",
  "Zu wenig RAM für die CPU-Leistung - Multitasking leidet": "Too little RAM for the CPU – multitasking suffers",
  "Viel RAM kann durch schwache CPU nicht optimal genutzt werden": "Plenty of RAM cannot be fully used due to a weak CPU",
  "Gaming-Case passt nicht zur Hardware-Ausrichtung": "Gaming case does not match the hardware orientation",
  "Viele Hardware-Konflikte beeinträchtigen die Gesamtleistung": "Many hardware conflicts hurt overall performance",

  // ----- Market position / competitor response -----
  "Marktführer-Potenzial": "Market-leader potential",
  "Gaming-Marktführer": "Gaming market leader",
  "Konkurrenten werden mit verstärkten Entwicklungsanstrengungen reagieren": "Competitors will respond with intensified R&D efforts",
  "Konkurrenten werden aggressive Gegenmaßnahmen ergreifen": "Competitors will take aggressive countermeasures",

  // ----- Section / verdict labels used as data -----
  "Büro-Leistung": "Office performance",
  "Workstation-Tauglichkeit": "Workstation suitability",
  "Standard-Gehäuse": "Standard case",
  "Für Büro-Anwendungen ist dieser Computer eine ausgezeichnete Wahl.": "An excellent choice for office applications.",
  "Für professionelle Büro-Anwendungen eine ausgezeichnete Wahl.": "An excellent choice for professional office applications.",
  "Als Workstation für professionelle Anwendungen ist er top geeignet.": "Top-tier suitability as a workstation for professional applications.",
  "Als High-End-Workstation für anspruchsvollste Aufgaben uneingeschränkt empfehlenswert.": "Unreservedly recommended as a high-end workstation for the most demanding tasks.",
};

/**
 * Translate a runtime-generated German string. When the current i18n language
 * is not "en", or when no mapping is found, the original string is returned.
 */
export function translateText(text: string | undefined | null): string {
  if (!text) return text ?? "";
  const lang = (i18n.language || "de").toLowerCase().split("-")[0];
  if (lang === "de") return text;
  // Exact match first
  if (DE_TO_EN[text]) return DE_TO_EN[text];
  // Try trimmed
  const trimmed = text.trim();
  if (DE_TO_EN[trimmed]) return DE_TO_EN[trimmed];
  // Handle prefix/suffix patterns: "<CPU>: Solide CPU mit guter Qualität"
  const m = text.match(/^(.+?:\s*)(.+)$/);
  if (m && DE_TO_EN[m[2]]) return m[1] + DE_TO_EN[m[2]];
  return text;
}

/** Lowercase translation lookup for rating equality checks. */
export function translateRating(rating: string): string {
  return translateText(rating);
}
