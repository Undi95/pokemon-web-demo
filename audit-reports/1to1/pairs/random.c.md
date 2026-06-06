# Paires décomp↔port — `random.c`

Généré : 2026-06-05T16:00:53.692Z

> ⚠️ Pairing statique pour relecture BORNÉE. NE PROUVE PAS le comportement.

6 fonction(s) décomp citée(s) (sur 4 fonctions du fichier).

## Index des paires

- `sUnknown` (random.c:4-4) ‖ src/game/random.ts:22
- `gRngValue` (random.c:8-8) ‖ src/game/random.ts:19
- `Random` (random.c:11-17) ‖ src/game/random.ts:Random
- `SeedRng` (random.c:18-23) ‖ src/game/random.ts:SeedRng
- `SeedRng2` (random.c:24-28) ‖ src/game/random.ts:SeedRng2
- `Random2` (random.c:29-34) ‖ src/game/random.ts:Random2

## Paires détaillées

```

══════════════════════════════════════════════════════════════════════════════
▌ · sUnknown  —  random.c:4-4 (1 l)
▌ ‖ port: src/game/random.ts:22 (hors fonction)  ← cite "random.c:4-5" @src/game/random.ts:22
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP random.c:4-4 ────────────────────────────────────────
    4│ EWRAM_DATA static u8 sUnknown = 0;
├─ PORT : aucune fonction TS résolue (citation hors corps de fonction)
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ · gRngValue  —  random.c:8-8 (1 l)
▌ ‖ port: src/game/random.ts:19 (hors fonction)  ← cite "random.c:8-9" @src/game/random.ts:19
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP random.c:8-8 ────────────────────────────────────────
    8│ COMMON_DATA u32 gRngValue = 0;
├─ PORT : aucune fonction TS résolue (citation hors corps de fonction)
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ Random  —  random.c:11-17 (7 l)
▌ ‖ port: Random (src/game/random.ts:26-31)  ← cite "random.c:11" @src/game/random.ts:26
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP random.c:11-17 ────────────────────────────────────────
   11│ u16 Random(void)
   12│ {
   13│     gRngValue = ISO_RANDOMIZE1(gRngValue);
   14│     sRandCount++;
   15│     return gRngValue >> 16;
   16│ }
   17│ 
├─ PORT src/game/random.ts:26-31 ────────────────────────────────────────
   26│ // 1:1 décomp random.c:11 — u16 Random(void).
   27│ export function Random(): number {
   28│   gRngValue = ISO_RANDOMIZE1(gRngValue);
   29│   sRandCount++;
   30│   return (gRngValue >>> 16) & 0xFFFF;
   31│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ SeedRng  —  random.c:18-23 (6 l)
▌ ‖ port: SeedRng (src/game/random.ts:33-37)  ← cite "random.c:18" @src/game/random.ts:33
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP random.c:18-23 ────────────────────────────────────────
   18│ void SeedRng(u16 seed)
   19│ {
   20│     gRngValue = seed;
   21│     sUnknown = 0;
   22│ }
   23│ 
├─ PORT src/game/random.ts:33-37 ────────────────────────────────────────
   33│ // 1:1 décomp random.c:18 — void SeedRng(u16 seed).
   34│ export function SeedRng(seed: number): void {
   35│   gRngValue = seed & 0xFFFF;
   36│   sUnknown = 0;
   37│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ SeedRng2  —  random.c:24-28 (5 l)
▌ ‖ port: SeedRng2 (src/game/random.ts:39-42)  ← cite "random.c:24" @src/game/random.ts:39
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP random.c:24-28 ────────────────────────────────────────
   24│ void SeedRng2(u16 seed)
   25│ {
   26│     gRng2Value = seed;
   27│ }
   28│ 
├─ PORT src/game/random.ts:39-42 ────────────────────────────────────────
   39│ // 1:1 décomp random.c:24 — void SeedRng2(u16 seed).
   40│ export function SeedRng2(seed: number): void {
   41│   gRng2Value = seed & 0xFFFF;
   42│ }
└────────────────────────────────────────────────────────────

```

```

══════════════════════════════════════════════════════════════════════════════
▌ ƒ Random2  —  random.c:29-34 (6 l)
▌ ‖ port: Random2 (src/game/random.ts:44-48)  ← cite "random.c:29" @src/game/random.ts:44
══════════════════════════════════════════════════════════════════════════════
┌─ DÉCOMP random.c:29-34 ────────────────────────────────────────
   29│ u16 Random2(void)
   30│ {
   31│     gRng2Value = ISO_RANDOMIZE1(gRng2Value);
   32│     return gRng2Value >> 16;
   33│ }
   34│ 
├─ PORT src/game/random.ts:44-48 ────────────────────────────────────────
   44│ // 1:1 décomp random.c:29 — u16 Random2(void). Utilise ISO_RANDOMIZE1 (pas _2 — 1:1).
   45│ export function Random2(): number {
   46│   gRng2Value = ISO_RANDOMIZE1(gRng2Value);
   47│   return (gRng2Value >>> 16) & 0xFFFF;
   48│ }
└────────────────────────────────────────────────────────────

```
