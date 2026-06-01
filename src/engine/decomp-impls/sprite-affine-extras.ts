/**
 * Runtime registry for sprite affine animation tables/anims that are NOT in
 * the auto-generated `SPRITE_AFFINE_ANIMS` / `SPRITE_AFFINE_ANIM_TABLES`
 * (e.g. `gAffineAnims_BattleSpritePlayerSide` from `src/data.c:198` — used by
 * EVERY battler/release/return/emerge animation across battles + Birch + egg
 * hatch + evolution).
 *
 * 1:1 décomp data : src/data.c:132+ defines `sAffineAnim_Battler_*` then
 * tables `gAffineAnims_BattleSprite{PlayerSide,OpponentSide,Contest}`.
 *
 * Why a runtime registry instead of editing the auto file ?
 *  - User directive : do NOT regenerate transpiler files.
 *  - Future scenes (battles, evolutions) will keep adding tables; a registry
 *    avoids constant `as const` mutations.
 *
 * The sprite engine (`sprite-engine-impl.ts`) checks this registry FIRST,
 * falling back to the auto-generated tables. So adding entries here is
 * non-breaking and additive.
 */

interface AffineAnimFrameCmd {
  xScale: number;
  yScale: number;
  rotation: number;
  duration: number;
}

export interface AffineAnim {
  frames: ReadonlyArray<AffineAnimFrameCmd>;
  terminator: 'END' | 'LOOP' | 'JUMP';
}

export interface AffineAnimTable {
  affineAnims: ReadonlyArray<string>;
}

const EXTRA_AFFINE_ANIMS: Record<string, AffineAnim> = {};
const EXTRA_AFFINE_ANIM_TABLES: Record<string, AffineAnimTable> = {};

export function registerAffineAnim(name: string, anim: AffineAnim): void {
  EXTRA_AFFINE_ANIMS[name] = anim;
}

export function registerAffineAnimTable(name: string, table: AffineAnimTable): void {
  EXTRA_AFFINE_ANIM_TABLES[name] = table;
}

export function getExtraAffineAnim(name: string): AffineAnim | undefined {
  return EXTRA_AFFINE_ANIMS[name];
}

export function getExtraAffineAnimTable(name: string): AffineAnimTable | undefined {
  return EXTRA_AFFINE_ANIM_TABLES[name];
}

// ─── Battler affine animations (1:1 décomp src/data.c:132-266) ──────────────
// All comments reference the DECOMP filename:linenumber so the source of truth
// is unambiguous.

// src/data.c:144 — sAffineAnim_Battler_Emerge :
//   AFFINEANIMCMD_FRAME(0x28, 0x28, 0, 0)    → start at scale 0x28 (≈16%)
//   AFFINEANIMCMD_FRAME(0x12, 0x12, 0, 12)   → +0x12/frame for 12 frames → 0x100 (100%)
//   AFFINEANIMCMD_END
// Visual : tiny → grows up to full size in 12 frames (= the "ball opens, mon emerges" effect).
registerAffineAnim('sAffineAnim_Battler_Emerge', {
  frames: [
    { xScale: 0x28, yScale: 0x28, rotation: 0, duration: 0 },
    { xScale: 0x12, yScale: 0x12, rotation: 0, duration: 12 },
  ],
  terminator: 'END',
});

// src/data.c:132 — sAffineAnim_Battler_Normal : identity (xScale=yScale=0x100).
registerAffineAnim('sAffineAnim_Battler_Normal', {
  frames: [
    { xScale: 0x100, yScale: 0x100, rotation: 0, duration: 0 },
  ],
  terminator: 'END',
});

// src/data.c:138 — sAffineAnim_Battler_Flipped : horizontal flip (xScale=-0x100).
registerAffineAnim('sAffineAnim_Battler_Flipped', {
  frames: [
    { xScale: -0x100, yScale: 0x100, rotation: 0, duration: 0 },
  ],
  terminator: 'END',
});

// src/data.c:151 — sAffineAnim_Battler_Return : shrink back to ball (full → tiny).
//   AFFINEANIMCMD_FRAME(-0x2,  -0x2, 0, 18)  → -0x2/frame × 18 = -0x24 (slight shrink)
//   AFFINEANIMCMD_FRAME(-0x10, -0x10, 0, 15) → -0x10/frame × 15 = -0xF0 (rapid shrink to ~0)
registerAffineAnim('sAffineAnim_Battler_Return', {
  frames: [
    { xScale: -0x02, yScale: -0x02, rotation: 0, duration: 18 },
    { xScale: -0x10, yScale: -0x10, rotation: 0, duration: 15 },
  ],
  terminator: 'END',
});

// src/data.c:198 — gAffineAnims_BattleSpritePlayerSide
// The first three indices are explicitly named (NORMAL=0, EMERGE=1, RETURN=2).
// We only need those three for non-battle scenes; battle adds 6 more (squish,
// grow, shrink, etc.) — they can be added later when battles ship.
registerAffineAnimTable('gAffineAnims_BattleSpritePlayerSide', {
  affineAnims: [
    'sAffineAnim_Battler_Normal',   // BATTLER_AFFINE_NORMAL
    'sAffineAnim_Battler_Emerge',   // BATTLER_AFFINE_EMERGE
    'sAffineAnim_Battler_Return',   // BATTLER_AFFINE_RETURN
  ],
});

// src/data.c:238 — gAffineAnims_BattleSpriteOpponentSide (same first 3 indices).
registerAffineAnimTable('gAffineAnims_BattleSpriteOpponentSide', {
  affineAnims: [
    'sAffineAnim_Battler_Normal',
    'sAffineAnim_Battler_Emerge',
    'sAffineAnim_Battler_Return',
  ],
});

// src/data.c:253 — gAffineAnims_BattleSpriteContest : NORMAL is Flipped.
registerAffineAnimTable('gAffineAnims_BattleSpriteContest', {
  affineAnims: [
    'sAffineAnim_Battler_Flipped',
    'sAffineAnim_Battler_Emerge',
    'sAffineAnim_Battler_Return',
  ],
});

// ─── Poké Ball rotation (1:1 décomp src/pokeball.c:166-203) ─────────────────
// Toutes les anims sont des FRAME(0,0,Δrot,1) + JUMP(0) → la rotation s'accumule
// de Δrot/frame INDÉFINIMENT (boucle). Le mode OAM de la ball = ST_OAM_AFFINE_DOUBLE
// (sBallOamData) → la zone de rendu est 2× (32×32) pour qu'une rotation 360° d'un
// sprite 16×16 ne soit PAS clippée à son cadre. ⚠️ Ces anims ont duration=1 → elles
// dépendent du fix ApplyAffineAnimFrame (branche relative, pas absolue) — voir
// sprite-engine-impl.ts. La ball du SEND-OUT utilise l'index 0 (statique) puis 4
// (spin) à l'apex de l'arc (pokeball.c:939), reset à 0 en fin d'arc (pokeball.c:975).

// pokeball.c:166 — sAffineAnim_BallRotate_0 : FRAME(0,0,0,1) + JUMP(0) = statique (rot += 0).
registerAffineAnim('sAffineAnim_BallRotate_0', {
  frames: [{ xScale: 0, yScale: 0, rotation: 0, duration: 1 }],
  terminator: 'JUMP',
});
// pokeball.c:172 — sAffineAnim_BallRotate_Right : FRAME(0,0,-3,1) + JUMP(0) = rot -3/frame.
registerAffineAnim('sAffineAnim_BallRotate_Right', {
  frames: [{ xScale: 0, yScale: 0, rotation: -3, duration: 1 }],
  terminator: 'JUMP',
});
// pokeball.c:178 — sAffineAnim_BallRotate_Left : FRAME(0,0,3,1) + JUMP(0) = rot +3/frame.
registerAffineAnim('sAffineAnim_BallRotate_Left', {
  frames: [{ xScale: 0, yScale: 0, rotation: 3, duration: 1 }],
  terminator: 'JUMP',
});
// pokeball.c:184 — sAffineAnim_BallRotate_3 : FRAME(256,256,0,0) + END = identité one-shot.
registerAffineAnim('sAffineAnim_BallRotate_3', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: 0, duration: 0 }],
  terminator: 'END',
});
// pokeball.c:190 — sAffineAnim_BallRotate_4 : FRAME(0,0,25,1) + JUMP(0) = rot +25/frame (= le SPIN
// rapide du send-out, ~1 tour / 10 frames). C'est l'anim lancée à l'apex de l'arc.
registerAffineAnim('sAffineAnim_BallRotate_4', {
  frames: [{ xScale: 0, yScale: 0, rotation: 25, duration: 1 }],
  terminator: 'JUMP',
});

// pokeball.c:196 — sAffineAnim_BallRotate[] : indexé par BALL_AFFINE_ANIM_0(0)/RIGHT(1)/LEFT(2)/3/4.
registerAffineAnimTable('sAffineAnim_BallRotate', {
  affineAnims: [
    'sAffineAnim_BallRotate_0',      // BALL_AFFINE_ANIM_0
    'sAffineAnim_BallRotate_Right',  // BALL_ROTATE_RIGHT
    'sAffineAnim_BallRotate_Left',   // BALL_ROTATE_LEFT
    'sAffineAnim_BallRotate_3',      // BALL_AFFINE_ANIM_3
    'sAffineAnim_BallRotate_4',      // BALL_AFFINE_ANIM_4
  ],
});
