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
