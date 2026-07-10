/**
 * decomp-strings.ts (ex src/engine/ui/gba-strings.ts, unification lot 19)
 * ----------------------------------------------------------------------
 * LOADER harness (pas de counterpart .c : strings.c du decomp = les DEFINITIONS,
 * ici extraites en data /decomp/em/strings.json ; ce module = le fetch + getString).
 * Strings globales utilisées par les callbacks auto-générés du main menu / Birch
 * speech / etc. Les callbacks référencent `gText_XXX` comme des variables globales.
 *
 * 1:1 GBA ABSOLU, ZÉRO HARDCODE :
 * Les valeurs viennent de `/decomp/em/strings.json` (= extracted from decomp
 * `src/strings.c` + `data/text/*.inc` par scripts/extract-strings.mjs).
 * `initStringsFromDecomp()` doit être appelé au boot AVANT toute Task qui
 * référence `gText_*` (= l'asset preload chain dans GameScene.bootIntro).
 *
 * Les valeurs hardcodées avant cette session étaient WRONG (ex: "OPTION" au lieu
 * de "OPTIONS", "STU" au lieu de "STEF" pour les noms par défaut, Birch speech
 * tronqué/divergent vs vrai jeu FR).
 */

/** Map runtime peuplée par initStringsFromDecomp(). Vide tant que le fetch
 *  n'a pas eu lieu. Les callbacks auto-gen accèdent via globalThis (= populé
 *  au moment où la map se remplit). */
const strings: Record<string, string> = {};

/** Charge toutes les strings depuis le décomp extracté. À appeler au boot. */
export async function initStringsFromDecomp(): Promise<void> {
  const resp = await fetch('/decomp/em/strings.json');
  if (!resp.ok) {
    console.error('[decomp-strings] failed to fetch /decomp/em/strings.json:', resp.status);
    return;
  }
  const data = await resp.json() as Record<string, string>;
  let count = 0;
  for (const [key, value] of Object.entries(data)) {
    strings[key] = value;
    (globalThis as Record<string, unknown>)[key] = value;
    count++;
  }
  console.log(`[decomp-strings] loaded ${count} strings from /decomp/em/strings.json`);
}

/** Lookup helper pour TS code qui voudrait accéder explicitement. */
export function getString(key: string): string {
  return strings[key] ?? `[MISSING:${key}]`;
}

/** Toutes les strings en mémoire (read-only). */
export function getAllStrings(): Readonly<Record<string, string>> {
  return strings;
}
