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

/** 1:1 décomp `union AffineAnimCmd` (include/sprite.h:110-160) — commande d'anim
 *  affine sous forme command-array COMPLÈTE. Alternative au couple frames[]+terminator :
 *  nécessaire pour les anims à marqueurs LOOP(0)/LOOP(n) INTERCALÉS (battle_anim_*,
 *  object_event_anims, slot_machine) que le modèle normalisé frames[]+terminator ne peut
 *  pas représenter (le terminator est unique et en fin). Optionnelle : si `cmds` absent,
 *  l'engine utilise le chemin legacy frames[]+terminator (= toutes les anims actuelles). */
export type AffineAnimCmd =
  | { kind: 'frame'; xScale: number; yScale: number; rotation: number; duration: number }
  | { kind: 'loop'; count: number }
  | { kind: 'jump'; target: number }
  | { kind: 'end' };

export interface AffineAnim {
  frames: ReadonlyArray<AffineAnimFrameCmd>;
  terminator: 'END' | 'LOOP' | 'JUMP';
  /** 1:1 décomp AFFINEANIMCMD_JUMP(target) (sprite.c:1163) : `cmdIndex = jump.target`.
   *  Défaut 0 (= l'ancien comportement « jump index 0 »). Pour les anims simples
   *  `FRAME* JUMP(n)` (26× JUMP(1), JUMP(2), JUMP(3) dans le décomp). */
  jumpTarget?: number;
  /** 1:1 décomp AFFINEANIMCMD_LOOP(count) (sprite.c:1132) : nb de boucles pour le cas
   *  simple (frames[] bouclées, top = index 0). Marqueurs mid-séquence → utiliser `cmds`. */
  loopCount?: number;
  /** Représentation command-array complète (cf. AffineAnimCmd). Si présente, l'engine
   *  la dispatche 1:1 (LOOP/JUMP/END/FRAME + compteur de boucle) au lieu de
   *  frames[]+terminator. INERTE tant qu'aucune anim ne l'enregistre. */
  cmds?: ReadonlyArray<AffineAnimCmd>;
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

// sprite.c:177-179 — gDummySpriteAffineAnimTable = { &sDummyAffineAnim } où
// sDummyAffineAnim = { AFFINE_ANIM_END } : une anim vide, END immédiat.
// (Consommée via le NOM exporté par src/sprite.ts — kernel transpiler.)
registerAffineAnim('sDummyAffineAnim', { frames: [], terminator: 'END' });
registerAffineAnimTable('gDummySpriteAffineAnimTable', {
  affineAnims: ['sDummyAffineAnim'],
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

// ─── Rotating gates (1:1 décomp src/rotating_gate.c:305-463) ─────────────────
// Puzzle portes tournantes (arène Fortree badge 6 + Trick House puzzle 6). Table
// `sSpriteAffineAnimTable_RotatingGate` (rotating_gate.c:441-463), 20 anims :
//   0-3   : Rotated0/90/180/270  — hold statique de l'orientation courante (FRAME + JUMP(0)).
//   4-7   : RotatingAnticlockwise{360to270,90to0,180to90,270to180}   (vitesse normale, ±4/frame×16).
//   8-11  : RotatingClockwise{0to90,90to180,180to270,270to360}       (vitesse normale, ∓4/frame×16).
//   12-15 : Anticlockwise …Faster (vélo/dash : +8/frame×8).
//   16-19 : Clockwise …Faster    (vélo/dash : -8/frame×8).
// Le 1er FRAME (duration 0) pose scale 0x100 + rotation de départ ABSOLUE ; le 2e FRAME
// (0,0,Δrot,durée) accumule la rotation en relatif jusqu'à END (cf. ApplyAffineAnimFrame).

// rotating_gate.c:305-327 — Rotated0/90/180/270 : FRAME(0x100,0x100,rot,0) + JUMP(0) = hold.
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Rotated0', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: 0, duration: 0 }],
  terminator: 'JUMP', jumpTarget: 0,
});
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Rotated90', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: -64, duration: 0 }],
  terminator: 'JUMP', jumpTarget: 0,
});
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Rotated180', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: -128, duration: 0 }],
  terminator: 'JUMP', jumpTarget: 0,
});
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Rotated270', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: 64, duration: 0 }],
  terminator: 'JUMP', jumpTarget: 0,
});

// rotating_gate.c:357-383 — Anticlockwise (normal, +4/frame × 16 = +64 = 1 quart de tour).
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Anticlockwise360to270', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: 0, duration: 0 }, { xScale: 0, yScale: 0, rotation: 4, duration: 16 }],
  terminator: 'END',
});
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Anticlockwise90to0', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: -64, duration: 0 }, { xScale: 0, yScale: 0, rotation: 4, duration: 16 }],
  terminator: 'END',
});
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Anticlockwise180to90', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: -128, duration: 0 }, { xScale: 0, yScale: 0, rotation: 4, duration: 16 }],
  terminator: 'END',
});
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Anticlockwise270to180', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: 64, duration: 0 }, { xScale: 0, yScale: 0, rotation: 4, duration: 16 }],
  terminator: 'END',
});

// rotating_gate.c:329-355 — Clockwise (normal, -4/frame × 16 = -64).
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Clockwise0to90', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: 0, duration: 0 }, { xScale: 0, yScale: 0, rotation: -4, duration: 16 }],
  terminator: 'END',
});
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Clockwise90to180', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: -64, duration: 0 }, { xScale: 0, yScale: 0, rotation: -4, duration: 16 }],
  terminator: 'END',
});
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Clockwise180to270', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: -128, duration: 0 }, { xScale: 0, yScale: 0, rotation: -4, duration: 16 }],
  terminator: 'END',
});
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Clockwise270to360', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: 64, duration: 0 }, { xScale: 0, yScale: 0, rotation: -4, duration: 16 }],
  terminator: 'END',
});

// rotating_gate.c:413-439 — Anticlockwise Faster (+8/frame × 8 = +64).
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Anticlockwise360to270Faster', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: 0, duration: 0 }, { xScale: 0, yScale: 0, rotation: 8, duration: 8 }],
  terminator: 'END',
});
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Anticlockwise90to0Faster', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: -64, duration: 0 }, { xScale: 0, yScale: 0, rotation: 8, duration: 8 }],
  terminator: 'END',
});
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Anticlockwise180to90Faster', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: -128, duration: 0 }, { xScale: 0, yScale: 0, rotation: 8, duration: 8 }],
  terminator: 'END',
});
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Anticlockwise270to180Faster', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: 64, duration: 0 }, { xScale: 0, yScale: 0, rotation: 8, duration: 8 }],
  terminator: 'END',
});

// rotating_gate.c:385-411 — Clockwise Faster (-8/frame × 8 = -64).
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Clockwise0to90Faster', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: 0, duration: 0 }, { xScale: 0, yScale: 0, rotation: -8, duration: 8 }],
  terminator: 'END',
});
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Clockwise90to180Faster', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: -64, duration: 0 }, { xScale: 0, yScale: 0, rotation: -8, duration: 8 }],
  terminator: 'END',
});
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Clockwise180to270Faster', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: -128, duration: 0 }, { xScale: 0, yScale: 0, rotation: -8, duration: 8 }],
  terminator: 'END',
});
registerAffineAnim('sSpriteAffineAnim_RotatingGate_Clockwise270to360Faster', {
  frames: [{ xScale: 0x100, yScale: 0x100, rotation: 64, duration: 0 }, { xScale: 0, yScale: 0, rotation: -8, duration: 8 }],
  terminator: 'END',
});

// rotating_gate.c:441-463 — sSpriteAffineAnimTable_RotatingGate (20 entrées, ordre EXACT).
registerAffineAnimTable('sSpriteAffineAnimTable_RotatingGate', {
  affineAnims: [
    'sSpriteAffineAnim_RotatingGate_Rotated0',                     // 0
    'sSpriteAffineAnim_RotatingGate_Rotated90',                    // 1
    'sSpriteAffineAnim_RotatingGate_Rotated180',                   // 2
    'sSpriteAffineAnim_RotatingGate_Rotated270',                   // 3
    'sSpriteAffineAnim_RotatingGate_Anticlockwise360to270',        // 4
    'sSpriteAffineAnim_RotatingGate_Anticlockwise90to0',           // 5
    'sSpriteAffineAnim_RotatingGate_Anticlockwise180to90',         // 6
    'sSpriteAffineAnim_RotatingGate_Anticlockwise270to180',        // 7
    'sSpriteAffineAnim_RotatingGate_Clockwise0to90',               // 8
    'sSpriteAffineAnim_RotatingGate_Clockwise90to180',             // 9
    'sSpriteAffineAnim_RotatingGate_Clockwise180to270',            // 10
    'sSpriteAffineAnim_RotatingGate_Clockwise270to360',            // 11
    'sSpriteAffineAnim_RotatingGate_Anticlockwise360to270Faster',  // 12
    'sSpriteAffineAnim_RotatingGate_Anticlockwise90to0Faster',     // 13
    'sSpriteAffineAnim_RotatingGate_Anticlockwise180to90Faster',   // 14
    'sSpriteAffineAnim_RotatingGate_Anticlockwise270to180Faster',  // 15
    'sSpriteAffineAnim_RotatingGate_Clockwise0to90Faster',         // 16
    'sSpriteAffineAnim_RotatingGate_Clockwise90to180Faster',       // 17
    'sSpriteAffineAnim_RotatingGate_Clockwise180to270Faster',      // 18
    'sSpriteAffineAnim_RotatingGate_Clockwise270to360Faster',      // 19
  ],
});
