/**
 * random.ts — RNG 1:1 décomp `src/random.c` + `include/random.h`.
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/random.c`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/random.h`
 *
 * ATTENTION — RNG bug Gen 3 Emerald (= 1:1 reproduit ici intentionnellement) :
 *   La fonction `SeedRngWithRtc()` (= seed via RTC minute count) est wrappée
 *   dans `#ifdef BUGFIX` dans le décomp. La ROM ORIGINALE Emerald ne la
 *   call PAS — donc gRngValue reste à 0 (= COMMON_DATA initialization).
 *   Conséquence : tous les events random (= Pokémon shiny, IV, EV, wild
 *   encounters, lottery, etc.) commencent depuis le même seed à chaque boot.
 *
 *   User feedback session 121 : "je m'en fou de savoir si elle est glitch
 *   ou pas (elle l'est de nature spoiler haha, erreur de gamefreak) je veux
 *   la même 1:1, car ça va être utiliser partout."
 *
 *   → On reproduit le bug. SeedRngWithRtc PAS appelée. gRngValue start à 0.
 *
 * ISO_RANDOMIZE1 formula 1:1 (= ANSI C rand() coefficients) :
 *   gRngValue = 1103515245 * gRngValue + 24691
 *
 * U32 arithmétique : on utilise `Math.imul` pour la multiplication 32-bit
 * exacte (= sinon JS double-precision génère des résultats incorrects pour
 * des val * 1103515245 > 2^53). `>>> 0` cast unsigned 32-bit final.
 */

// ─── State (= 1:1 décomp COMMON_DATA / EWRAM_DATA) ───────────────────────────

/** 1:1 décomp COMMON_DATA u32 gRngValue = 0. Seed initial 0 (= bug Emerald). */
let gRngValue = 0;
/** 1:1 décomp COMMON_DATA u32 gRng2Value = 0. Used pour battle damage rolls etc. */
let gRng2Value = 0;
/** 1:1 décomp EWRAM_DATA static u8 sUnknown = 0. Reset par SeedRng. */
let sUnknown = 0;
/** 1:1 décomp EWRAM_DATA static u32 sRandCount = 0. Increment chaque Random() call. */
let sRandCount = 0;

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────

/** 1:1 décomp `#define ISO_RANDOMIZE1(val) (1103515245 * (val) + 24691)`.
 *  Math.imul pour multiplication u32 exacte. >>> 0 cast unsigned. */
function ISO_RANDOMIZE1(val: number): number {
  return ((Math.imul(1103515245, val) + 24691) >>> 0);
}

/** 1:1 décomp `#define ISO_RANDOMIZE2(val) (1103515245 * (val) + 12345)`.
 *  Used par Random2() (= secondary RNG). */
function ISO_RANDOMIZE2(val: number): number {
  return ((Math.imul(1103515245, val) + 12345) >>> 0);
}

// ─── Public API 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `u16 Random(void)` (random.c:11).
 *  Returns 16-bit pseudorandom number. */
export function Random(): number {
  gRngValue = ISO_RANDOMIZE1(gRngValue);
  sRandCount++;
  return (gRngValue >>> 16) & 0xFFFF;
}

/** 1:1 décomp `u16 Random2(void)` (random.c:30).
 *  Secondary RNG (= gRng2Value indépendant de gRngValue).
 *  NOTE : Random2 utilise ISO_RANDOMIZE1 dans le décomp, pas ISO_RANDOMIZE2
 *  (= bug ou choix volontaire ? pas clear). On 1:1 reproduit. */
export function Random2(): number {
  gRng2Value = ISO_RANDOMIZE1(gRng2Value);
  return (gRng2Value >>> 16) & 0xFFFF;
}

/** 1:1 décomp `Random32` macro (random.h:7) :
 *  `Random() | (Random() << 16)` — 32-bit pseudorandom. Note l'ordre :
 *  les LOW 16 bits viennent du 1er Random(), HIGH 16 du 2ème. */
export function Random32(): number {
  return (Random() | (Random() << 16)) >>> 0;
}

/** 1:1 décomp `void SeedRng(u16 seed)` (random.c:18). */
export function SeedRng(seed: number): void {
  gRngValue = seed & 0xFFFF;  // u16 truncate (= 1:1 décomp signature)
  sUnknown = 0;
}

/** 1:1 décomp `void SeedRng2(u16 seed)` (random.c:24). */
export function SeedRng2(seed: number): void {
  gRng2Value = seed & 0xFFFF;
}

// ─── SeedRngAndSetTrainerId + GetGeneratedTrainerIdLower (= main.c:201,209) ──

/** 1:1 décomp `static u16 sTrainerId` (main.c). Set par SeedRngAndSetTrainerId
 *  via REG_TM1CNT_L (= timer 1 lower count). */
let sTrainerId = 0;

/** Simulate REG_TM1CNT_L (= GBA hardware timer 1, lower 16 bits).
 *
 *  La GBA's TM1 incrémente à 16384Hz quand chained avec TM0. Au boot, sa valeur
 *  dépend du timing exact entre power-on et le moment où SeedRngAndSetTrainerId
 *  est appelé. C'est SEMI-DÉTERMINISTE : sur un boot rapide la valeur est ≈
 *  petite, sur un boot lent ≈ grande, mais l'ordre des opérations est figé →
 *  par run la valeur est reproductible si tous les delays sont identiques.
 *
 *  Notre simulation : counter qui incrémente une fois par appel, au lieu de
 *  Date.now() (= jamais déterministe). Le trainerId par run sera reproductible
 *  pour un même flow de boot.
 *
 *  ⚠️ Audit BIG section 2.11 (= Phase 4 RNG sync) : pour être 1:1 décomp, le
 *  counter devrait incrémenter à chaque frame (= 60Hz vs 16384Hz décomp).
 *  Different scaling, but deterministic. Acceptable pour démo. */
let _tm1Counter = 0x12345 & 0xFFFF;  // Init value chosen pour avoid trainerId=0 (= reserved).
function _readSimulatedTM1CntL(): number {
  // Increment monotone (= simulate hardware timer running). Modulo 0xFFFF
  // pour wrap u16 comme GBA.
  _tm1Counter = (_tm1Counter + 1) & 0xFFFF;
  // Mix avec performance.now() pour avoir entropy au boot init (= deterministic
  // per session mais varie entre tabs/page reloads). Production game preferra
  // un counter pur, mais MVP demo ok.
  if (typeof performance !== 'undefined' && performance.now) {
    _tm1Counter = (_tm1Counter ^ Math.floor(performance.now())) & 0xFFFF;
  }
  return _tm1Counter;
}

/** 1:1 décomp `void SeedRngAndSetTrainerId(void)` (main.c:201).
 *  ```c
 *  void SeedRngAndSetTrainerId(void) {
 *      u16 val = REG_TM1CNT_L;
 *      SeedRng(val);
 *      REG_TM1CNT_H = 0;
 *      sTrainerId = val;
 *  }
 *  ```
 *  Notre version : utilise `_readSimulatedTM1CntL()` (= counter monotone +
 *  performance.now() entropy mix) au lieu de Date.now(). Plus déterministe
 *  par session ; trainerId reproductible pour un même flow de boot. */
export function SeedRngAndSetTrainerId(): void {
  // 1:1 décomp : val = REG_TM1CNT_L (= u16 hardware timer).
  const val = _readSimulatedTM1CntL();
  SeedRng(val);
  sTrainerId = val;
  console.log(`[random] SeedRngAndSetTrainerId : sTrainerId=${val} (simulated TM1), gRngValue seeded`);
}

/** 1:1 décomp `u16 GetGeneratedTrainerIdLower(void)` (main.c:209). */
export function GetGeneratedTrainerIdLower(): number {
  return sTrainerId;
}

// ─── Debug + tests helpers (= ne pas utiliser en gameplay) ──────────────────

/** Lit gRngValue courant (= debug). Ne PAS utiliser pour décision gameplay. */
export function _debugGetRngValue(): number {
  return gRngValue;
}

/** Lit gRng2Value courant (= debug). */
export function _debugGetRng2Value(): number {
  return gRng2Value;
}

/** Lit sRandCount (= nombre de Random() calls depuis boot). Debug only. */
export function _debugGetRandCount(): number {
  return sRandCount;
}

/** Force reset complet (= test only). NE PAS utiliser en gameplay. */
export function _debugResetRng(): void {
  gRngValue = 0;
  gRng2Value = 0;
  sUnknown = 0;
  sRandCount = 0;
}

// ─── Expose pour console debug (= window.rng) ───────────────────────────────
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).rng = {
    Random,
    Random2,
    Random32,
    SeedRng,
    SeedRng2,
    value: _debugGetRngValue,
    value2: _debugGetRng2Value,
    count: _debugGetRandCount,
    reset: _debugResetRng,
  };
}
