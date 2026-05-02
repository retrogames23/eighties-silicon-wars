import { useState } from "react";
import { Coffee, Heart, Mail, FileText, Scale } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OssItem {
  name: string;
  license: string;
  url: string;
}

const OSS_LIBRARIES: OssItem[] = [
  { name: "React", license: "MIT", url: "https://react.dev" },
  { name: "React DOM", license: "MIT", url: "https://react.dev" },
  { name: "React Router", license: "MIT", url: "https://reactrouter.com" },
  { name: "Vite", license: "MIT", url: "https://vitejs.dev" },
  { name: "TypeScript", license: "Apache-2.0", url: "https://www.typescriptlang.org" },
  { name: "Tailwind CSS", license: "MIT", url: "https://tailwindcss.com" },
  { name: "tailwindcss-animate", license: "MIT", url: "https://github.com/jamiebuilds/tailwindcss-animate" },
  { name: "tailwind-merge", license: "MIT", url: "https://github.com/dcastil/tailwind-merge" },
  { name: "Radix UI", license: "MIT", url: "https://www.radix-ui.com" },
  { name: "shadcn/ui", license: "MIT", url: "https://ui.shadcn.com" },
  { name: "Lucide Icons", license: "ISC", url: "https://lucide.dev" },
  { name: "Sonner", license: "MIT", url: "https://sonner.emilkowal.ski" },
  { name: "next-themes", license: "MIT", url: "https://github.com/pacocoursey/next-themes" },
  { name: "class-variance-authority", license: "Apache-2.0", url: "https://cva.style" },
  { name: "clsx", license: "MIT", url: "https://github.com/lukeed/clsx" },
  { name: "cmdk", license: "MIT", url: "https://cmdk.paco.me" },
  { name: "vaul", license: "MIT", url: "https://vaul.emilkowal.ski" },
  { name: "@tanstack/react-query", license: "MIT", url: "https://tanstack.com/query" },
  { name: "react-hook-form", license: "MIT", url: "https://react-hook-form.com" },
  { name: "@hookform/resolvers", license: "MIT", url: "https://github.com/react-hook-form/resolvers" },
  { name: "Zod", license: "MIT", url: "https://zod.dev" },
  { name: "date-fns", license: "MIT", url: "https://date-fns.org" },
  { name: "Recharts", license: "MIT", url: "https://recharts.org" },
  { name: "Embla Carousel", license: "MIT", url: "https://www.embla-carousel.com" },
  { name: "react-day-picker", license: "MIT", url: "https://react-day-picker.js.org" },
  { name: "react-resizable-panels", license: "MIT", url: "https://github.com/bvaughn/react-resizable-panels" },
  { name: "react-swipeable", license: "MIT", url: "https://github.com/FormidableLabs/react-swipeable" },
  { name: "input-otp", license: "MIT", url: "https://input-otp.rdsx.dev" },
  { name: "i18next", license: "MIT", url: "https://www.i18next.com" },
  { name: "react-i18next", license: "MIT", url: "https://react.i18next.com" },
  { name: "i18next-browser-languagedetector", license: "MIT", url: "https://github.com/i18next/i18next-browser-languageDetector" },
  { name: "i18next-http-backend", license: "MIT", url: "https://github.com/i18next/i18next-http-backend" },
  { name: "@formatjs/intl-pluralrules", license: "MIT", url: "https://formatjs.io" },
  { name: "@formatjs/intl-relativetimeformat", license: "MIT", url: "https://formatjs.io" },
  { name: "Supabase JS Client", license: "MIT", url: "https://supabase.com" },
];

const FONTS: OssItem[] = [
  { name: "Inter", license: "SIL Open Font License 1.1", url: "https://rsms.me/inter/" },
  { name: "JetBrains Mono", license: "SIL Open Font License 1.1", url: "https://www.jetbrains.com/lp/mono/" },
];

export const IntroFooter = () => {
  const { t } = useTranslation(["game"]);
  const [showImpressum, setShowImpressum] = useState(false);
  const [showLicenses, setShowLicenses] = useState(false);

  return (
    <footer className="w-full max-w-3xl mx-auto mt-8 px-4 pb-6 text-xs text-muted-foreground/80 font-mono">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
        <a
          href="https://buymeacoffee.com/doener"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-primary transition-colors"
        >
          <Coffee className="w-3 h-3" />
          {t("game:footer.buyMeCoffee")}
        </a>

        <span className="inline-flex items-center gap-1">
          <Heart className="w-3 h-3 text-primary" />
          {t("game:footer.builtWith")}{" "}
          <a
            href="https://lovable.dev/invite/LN0I260"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors underline-offset-2 hover:underline"
          >
            Lovable
          </a>
        </span>

        <button
          type="button"
          onClick={() => setShowImpressum(true)}
          className="inline-flex items-center gap-1 hover:text-primary transition-colors"
        >
          <FileText className="w-3 h-3" />
          {t("game:footer.imprint")}
        </button>

        <a
          href="mailto:stephan.doerner@posteo.de"
          className="inline-flex items-center gap-1 hover:text-primary transition-colors"
        >
          <Mail className="w-3 h-3" />
          {t("game:footer.contact")}
        </a>

        <button
          type="button"
          onClick={() => setShowLicenses(true)}
          className="inline-flex items-center gap-1 hover:text-primary transition-colors"
        >
          <Scale className="w-3 h-3" />
          {t("game:footer.licenses")}
        </button>
      </div>

      {/* Impressum Dialog */}
      <Dialog open={showImpressum} onOpenChange={setShowImpressum}>
        <DialogContent className="font-mono">
          <DialogHeader>
            <DialogTitle>{t("game:footer.imprintTitle")}</DialogTitle>
            <DialogDescription>
              {t("game:footer.imprintLegal")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Stephan Dörner</p>
            <p>Bornholmer Str. 89</p>
            <p>10439 Berlin</p>
            <p className="pt-2">
              <a
                href="mailto:stephan.doerner@posteo.de"
                className="text-primary hover:underline"
              >
                stephan.doerner@posteo.de
              </a>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Licenses Dialog */}
      <Dialog open={showLicenses} onOpenChange={setShowLicenses}>
        <DialogContent className="font-mono max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("game:footer.licensesTitle")}</DialogTitle>
            <DialogDescription>
              {t("game:footer.licensesDescription")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6 text-sm">
              <section>
                <h3 className="font-semibold text-primary mb-2">
                  {t("game:footer.gameLicenseHeading")}
                </h3>
                <p className="text-muted-foreground mb-2">
                  {t("game:footer.gameLicenseText")}
                </p>
                <a
                  href="https://github.com/retrogames23/eighties-silicon-wars"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  {t("game:footer.viewOnGithub")} — MIT License
                </a>
              </section>

              <section>
                <h3 className="font-semibold text-primary mb-2">
                  {t("game:footer.librariesHeading")}
                </h3>
                <ul className="space-y-1">
                  {OSS_LIBRARIES.map((item) => (
                    <li key={item.name} className="flex flex-wrap gap-x-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:text-primary hover:underline"
                      >
                        {item.name}
                      </a>
                      <span className="text-muted-foreground">— {item.license}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-primary mb-2">
                  {t("game:footer.fontsHeading")}
                </h3>
                <ul className="space-y-1">
                  {FONTS.map((item) => (
                    <li key={item.name} className="flex flex-wrap gap-x-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:text-primary hover:underline"
                      >
                        {item.name}
                      </a>
                      <span className="text-muted-foreground">— {item.license}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </footer>
  );
};
