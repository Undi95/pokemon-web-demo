// AUTO-GENERATED from data/text/abnormal_weather.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/text/abnormal_weather.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'gText_AbnormalWeatherEnded_Rain', isGlobal: true, instrIndex: 0 },
  { name: 'gText_AbnormalWeatherEnded_Sun', isGlobal: true, instrIndex: 0 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=2
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"La pluie torrentielle s'est arrêtée…$\""] },
  { kind: '.string', vals: ["\"Le soleil brille moins fort…$\""] },
] as const;
