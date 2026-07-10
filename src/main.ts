/**
 * main.ts — miroir 1:1 de `decomp/src/main.c` (PARTIEL).
 *
 * ⚠️ PORTAGE INCRÉMENTAL : seul le sous-ensemble `SeedRngAndSetTrainerId` /
 * `GetGeneratedTrainerIdLower` (+ `sTrainerId`) est porté pour l'instant — il
 * provenait d'un shim transitoire (`engine/system/random.ts`) où il était
 * « gardé en transit » faute de foyer `main.c`. Ce foyer existe désormais.
 * Le reste de main.c (AgbMain, la boucle principale, les VBlank/HBlank
 * handlers, gMain) est assuré côté harness (`harness/main.ts` bootstrap +
 * `harness/runtime` pour gMain) ; à réconcilier plus tard au fil du marathon.
 *
 * NB : le bootstrap Phaser/Vite (cache-bust, register scenes) est `harness/main.ts`
 * (glue maison, PAS main.c) — ce fichier-ci est le miroir décomp pur.
 */
import { SeedRng } from './random';
import { LANGUAGE_FRENCH } from '../include/constants/global';
import { getRuntime } from '../harness/runtime/decomp-globals';

/** 1:1 décomp main.c — `void SetMainCallback2(MainCallback callback)`.
 *  Délègue au substrat runtime (swap de scène CB2). Foyer 1:1 : les modules
 *  miroir/transpilés importent d'ICI (même fichier que la décomp). */
export function SetMainCallback2(callback: ((...args: unknown[]) => void) | null): void {
  getRuntime().SetMainCallback2(callback as never);
}

/** 1:1 décomp main.c — `void SetVBlankCallback(IntrCallback callback)`. */
export function SetVBlankCallback(callback: (() => void) | null): void {
  getRuntime().SetVBlankCallback(callback);
}

// ─── 1:1 décomp main.c:72 — static u16 sTrainerId. ───────────────────────────
let sTrainerId = 0;

/** 1:1 décomp main.c — `EWRAM_DATA u8 gGameLanguage = GAME_LANGUAGE`.
 *  GAME_LANGUAGE = (LANGUAGE_FRENCH) = 3 (constants/global.h:22/:30, build FR). */
export const gGameLanguage = LANGUAGE_FRENCH;

/**
 * Simule `REG_TM1CNT_L` (timer 1 GBA, 16 bits) lu par SeedRngAndSetTrainerId :
 * compteur monotone XOR-é avec `performance.now()` au boot. Déterministe par
 * session ; trainerId reproductible pour un même flow de boot. (Bridge
 * plateforme — pas de timer hardware en web ; SEULE substitution, le reste 1:1.)
 */
let _tm1Counter = 0x12345 & 0xffff;
function _readSimulatedTM1CntL(): number {
  _tm1Counter = (_tm1Counter + 1) & 0xffff;
  if (typeof performance !== 'undefined' && performance.now) {
    _tm1Counter = (_tm1Counter ^ Math.floor(performance.now())) & 0xffff;
  }
  return _tm1Counter;
}

/** 1:1 décomp main.c:201 — void SeedRngAndSetTrainerId(void). */
export function SeedRngAndSetTrainerId(): void {
  const val = _readSimulatedTM1CntL();
  SeedRng(val);
  sTrainerId = val;
}

/** 1:1 décomp main.c:209 — u16 GetGeneratedTrainerIdLower(void). */
export function GetGeneratedTrainerIdLower(): number {
  return sTrainerId;
}

// ─── 1:1 main.c:433 ClearPokemonCrySongs (câblage son m4a) ───────────────────
import { gSoundMemory as _gSoundMemory_CRY } from './m4a_1';
import { CRYSONG_RAM_OFF as _CRYSONG_RAM_OFF } from './m4a';
import { CRYSONG_SIZE as _CRYSONG_SIZE, MAX_POKEMON_CRIES as _MAX_POKEMON_CRIES } from '../include/gba/m4a_internal';

/** 1:1 décomp `void ClearPokemonCrySongs(void)` (main.c:433-436) :
 *  CpuFill16(0, gPokemonCrySongs, MAX_POKEMON_CRIES * sizeof(struct PokemonCrySong)).
 *  gPokemonCrySongs vit dans la RAM audio de gSoundMemory (CRYSONG_RAM_OFF). */
export function ClearPokemonCrySongs(): void {
  _gSoundMemory_CRY.fill(0, _CRYSONG_RAM_OFF, _CRYSONG_RAM_OFF + _MAX_POKEMON_CRIES * _CRYSONG_SIZE);
}
