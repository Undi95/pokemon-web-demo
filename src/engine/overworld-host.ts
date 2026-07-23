// Registre host de l'overworld — pont MINIMAL entre la scène harness
// (OverworldScene) et src/overworld.ts. Volontairement SANS import lourd :
// la seule dépendance est un `import type` (DecompRuntime), effacé à la compile,
// donc ce module reste une FEUILLE du graphe ESM runtime (aucune arête d'éval →
// aucun risque de cycle / TDZ, cf. find-import-cycle.cjs).
import type { DecompRuntime } from '../../harness/runtime/decomp-runtime';

/** Membres de la scène overworld (OverworldScene) consommés par le corps de
 *  `ReturnToFieldFromBattleOrMenu` (ex-rustine `globalThis._restoreOverworldFromMenu`).
 *  Liste EXACTE établie en lisant le corps de la lambda : `rt` (runtime GBA),
 *  `loadAndInitMap` (re-chargement async du field), `_fieldVBlankCB` (le VBlank
 *  callback field d'origine, ré-armé au retour). */
export interface OverworldHost {
  rt: DecompRuntime;
  loadAndInitMap: (
    mapId: string, spawnX: number, spawnY: number, spawnDir: number,
    initFromSavedGame?: boolean, returnToField?: boolean,
  ) => Promise<unknown>;
  _fieldVBlankCB: () => void;
}

let _host: OverworldHost | null = null;

/** Enregistre la scène overworld comme host courant (appelé au boot de bootOverworld). */
export function SetOverworldHost(h: OverworldHost): void {
  _host = h;
}

/** Récupère le host overworld. Throw explicite si non enregistré (= appel hors field). */
export function GetOverworldHost(): OverworldHost {
  if (!_host) throw new Error('OverworldHost non enregistré');
  return _host;
}

// ─── Ré-exposition de ReturnToFieldFromBattleOrMenu (src/overworld.ts) ───
// battle-decomp-loop.ts ne peut PAS importer statiquement src/overworld.ts (un
// import direct fermerait le cycle overworld → field_player_avatar → wild_encounter
// → battle-decomp-loop → overworld). Il passe donc par ce registre-feuille : overworld.ts
// s'enregistre à son éval de module, battle-decomp-loop lit via GetReturnToFieldFn().
let _returnToFieldFn: (() => Promise<void>) | null = null;

/** Enregistre ReturnToFieldFromBattleOrMenu (appelé à l'éval de src/overworld.ts). */
export function SetReturnToFieldFn(fn: () => Promise<void>): void {
  _returnToFieldFn = fn;
}

/** Récupère ReturnToFieldFromBattleOrMenu. Throw explicite si non enregistré. */
export function GetReturnToFieldFn(): () => Promise<void> {
  if (!_returnToFieldFn) throw new Error('ReturnToFieldFromBattleOrMenu non enregistré');
  return _returnToFieldFn;
}
