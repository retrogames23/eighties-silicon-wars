import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist", "coverage", "*.config.*"] },
  {
    extends: [
      js.configs.recommended, 
      ...tseslint.configs.recommendedTypeChecked,
      prettier
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      
      // Gentle TypeScript rules (baseline)
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-const": "error",
      
      // Code quality (gentle start)
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "prefer-const": "error",
      "no-var": "error",
      
      // React specific
      "react-hooks/exhaustive-deps": "warn",
      
      // Performance hints
      "no-unused-expressions": "warn",
      "no-unreachable": "error",
    },
  },
  {
    // Sim-Pfad: keine Math.random — nutze quarterRng/mulberry32 aus src/lib/game/rng.ts.
    // Begründung: Determinismus + Reproduzierbarkeit, verhindert Save-Scumming.
    files: [
      "src/components/Economy*.ts",
      "src/components/AdvancedSalesSimulation.ts",
      "src/components/PriceDecayManager.ts",
      "src/components/ObsolescenceManager.ts",
      "src/lib/game/**/*.ts",
      "src/services/LivingWorldService.ts",
      "src/services/CompetitorsService.ts",
      "src/services/MarketEventsService.ts",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
          message: "No Math.random in the sim path. Use quarterRng(userId, year, quarter, salt) from @/lib/game/rng for determinism.",
        },
      ],
    },
  },
);
