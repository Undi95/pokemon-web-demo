/**
 * battle/battle-faint-anim.ts — Port 1:1 strict des callbacks faint sprite.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c:2744-2891`
 *
 * Callbacks portés 1:1 :
 *   - SpriteCB_FaintOpponentMon (2744-2786) — entry faint pour opp mon
 *   - SpriteCB_AnimFaintOpponent (2788-2811) — tick fall animation (8 frames)
 *   - SpriteCB_FaintSlideAnim (2881-2891) — slide post-faint (player side)
 *
 * Mécanique faint :
 *   - Sprite drop 8 pixels par step ; chaque step erase 256 bytes (= 1 row de
 *     tile data) du sprite gfx pour effet "tomber" smooth.
 *   - data[3] = nombre de steps restants (= 8 - yOffset/8 ; varie par species).
 *   - data[4] = countdown frames avant prochain step (= 1 puis 2).
 *
 * Dépendances :
 *   - decomp-runtime.ts : DecompSprite, DestroySprite, FreeSpriteOamMatrix
 *   - util.ts : GetBattlerPosition
 *   - data/species-runtime.ts : species front pic coords (= y_offset)
 */

import { getRuntime } from '../system/decomp-globals';
import { GetBattlerPosition } from './util';

/** 1:1 décomp `sBattler` data field (= sprite->data[5] in décomp). */
const SPRITE_DATA_BATTLER = 5;
/** 1:1 décomp `sSpeciesId` data field (= sprite->data[7] in décomp). */
const SPRITE_DATA_SPECIES = 7;
/** 1:1 décomp `sSpeedX` data field (= sprite->data[1]). */
const SPRITE_DATA_SPEED_X = 1;
/** 1:1 décomp `sSpeedY` data field (= sprite->data[2]). */
const SPRITE_DATA_SPEED_Y = 2;

/** Type minimal de sprite (= compatible avec DecompSprite du runtime). */
interface FaintSprite {
  data: number[];
  y2: number;
  x2: number;
  invisible?: boolean;
  callback?: ((sprite: FaintSprite) => void) | null;
}

// ─── Hardware/data helpers (= dette R3 documentée) ────────────────────────

/** 1:1 décomp `gMonFrontPicCoords[species].y_offset`. Default = 0 si species
 *  data absente. Cascade : pokemon_front_pic_coords data dans
 *  decomp-data/auto-data/. */
function _getMonFrontPicYOffset(species: number): number {
  // Wire vers species-runtime si disponible (= getMonFrontPicCoords data).
  // Pour now : default 8 (= middle des 8 steps).
  void species;
  return 8;
}

/** 1:1 décomp `FreeSpriteOamMatrix(sprite)`. Libère le matrix slot affine. */
function FreeSpriteOamMatrix(_sprite: FaintSprite): void {
  // Dette R3 : full OAM matrix dealloc via runtime FreeOamMatrix. Pour now :
  // notre runtime gère via tag-based system, le matrix sera libéré au DestroySprite.
}

/** 1:1 décomp `DestroySprite(sprite)`. */
function DestroySprite(sprite: FaintSprite): void {
  // Wire vers runtime : trouve l'id du sprite et appelle DestroySprite.
  const r = getRuntime();
  if (!r || !r.gSprites) return;
  // Trouve l'entry sprite dans gSprites Map et delete.
  for (const [id, s] of r.gSprites.entries()) {
    if (s === sprite) {
      r.gSprites.delete(id);
      // Set callback à null pour stop le tick.
      sprite.callback = null;
      return;
    }
  }
}

/** 1:1 décomp `gMonSpritesGfxPtr->sprites.byte[position]`. Pointer vers
 *  le buffer GFX du sprite mon battler. Cascade : 4 buffers per side. */
function _getMonSpriteGfxByteBuffer(_position: number): Uint8Array | null {
  // Dette R3 : gMonSpritesGfxPtr access via decomp-bridge. Pour now : pas
  // de buffer manipulation directe — le runtime gère via tile data.
  return null;
}

/** 1:1 décomp `gBattleMonForms[battler]`. Form index pour species multi-form
 *  (= Castform/Unown). */
function _getBattleMonForm(_battler: number): number {
  // Dette R3 : track per-battler form change (= Castform weather, Unown letter).
  return 0;
}

/** 1:1 décomp `StartSpriteAnim(sprite, animNum)`. Démarre une animation
 *  sprite par index. */
function StartSpriteAnim(_sprite: FaintSprite, _animNum: number): void {
  // Dette R3 : sprite anim restart (= sprite.animNum = animNum, reset anim
  // state machine). Wire vers sprite-animation.ts si dispo.
}

/** 1:1 décomp `gIntroSlideFlags`. Si bit 0 set, slide animations sont pause. */
let _gIntroSlideFlags = 0;
export function setFaintSlideFlags(v: number): void { _gIntroSlideFlags = v; }
export function getFaintSlideFlags(): number { return _gIntroSlideFlags; }

// ─── SpriteCB_FaintOpponentMon (battle_main.c:2744) — 1:1 décomp ───────────

/** 1:1 décomp `SpriteCB_FaintOpponentMon(sprite)` (battle_main.c:2744-2786).
 *  Entry callback pour le faint d'un opponent mon. Compute le nombre de
 *  steps depuis le y_offset de l'image species, puis switch vers
 *  SpriteCB_AnimFaintOpponent pour le tick par tick.
 *
 *  Note : décomp utilise GetMonData(MON_DATA_PERSONALITY) une fois (return
 *  value unused) puis check species == SPECIES_UNOWN. Notre port simplifie
 *  car les SPECIES_UNOWN/CASTFORM handling sont rare cases. */
export function SpriteCB_FaintOpponentMon(sprite: FaintSprite): void {
  const battler = sprite.data[SPRITE_DATA_BATTLER] ?? 0;
  // Dette R3 : transformSpecies tracker dans gBattleSpritesDataPtr->battlerData.
  // Pour now : use sprite's stored species directly.
  const species = sprite.data[SPRITE_DATA_SPECIES] ?? 0;

  // 1:1 décomp ll. 2755 : unused GetMonData(MON_DATA_PERSONALITY) call.
  // Notre port skip car return value unused.
  void species;
  void battler;

  // Y offset par species ; SPECIES_UNOWN, SPECIES_CASTFORM = special cases.
  // Dette R3 : full case match. Pour now : default offset 8.
  const yOffset = _getMonFrontPicYOffset(species);

  sprite.data[3] = 8 - Math.floor(yOffset / 8);
  sprite.data[4] = 1;
  sprite.callback = SpriteCB_AnimFaintOpponent;
}

// ─── SpriteCB_AnimFaintOpponent (battle_main.c:2788) — 1:1 décomp ──────────

/** 1:1 décomp `SpriteCB_AnimFaintOpponent(sprite)` (battle_main.c:2788-2811).
 *  Tick par tick le sprite drop : data[4] countdown → 0 = step. Chaque step :
 *  - y2 += 8 (sprite descend de 8 pixels)
 *  - data[3] décrémente (= nombre de steps restants)
 *  - erase 256 bytes du gfx buffer (= 1 row de tile data) pour smooth illusion
 *  - StartSpriteAnim avec form actuel (= reload graphics avec partial erase)
 *  - Quand data[3] < 0 : FreeOamMatrix + DestroySprite (= sprite gone). */
export function SpriteCB_AnimFaintOpponent(sprite: FaintSprite): void {
  sprite.data[4]--;
  if (sprite.data[4] === 0) {
    sprite.data[4] = 2;
    sprite.y2 += 8;
    sprite.data[3]--;
    if (sprite.data[3] < 0) {
      FreeSpriteOamMatrix(sprite);
      DestroySprite(sprite);
    } else {
      // Erase bottom part of the sprite to create a smooth illusion of mon falling.
      const battler = sprite.data[SPRITE_DATA_BATTLER] ?? 0;
      const position = GetBattlerPosition(battler);
      const monForm = _getBattleMonForm(battler);
      const dst = _getMonSpriteGfxByteBuffer(position);
      if (dst) {
        // 1:1 décomp : (monForm << 11) + (data[3] << 8) offset, write 0x100 zeros.
        const offset = (monForm << 11) + (sprite.data[3] << 8);
        for (let i = 0; i < 0x100; i++) {
          if (offset + i < dst.length) dst[offset + i] = 0;
        }
      }

      StartSpriteAnim(sprite, monForm);
    }
  }
}

// ─── SpriteCB_FaintSlideAnim (battle_main.c:2881) — 1:1 décomp ─────────────

/** 1:1 décomp `SpriteCB_FaintSlideAnim(sprite)` (battle_main.c:2881-2888).
 *  Slide simple post-faint (= player side fait souvent un offset slide).
 *  data[1]=speedX, data[2]=speedY. */
export function SpriteCB_FaintSlideAnim(sprite: FaintSprite): void {
  if (!(_gIntroSlideFlags & 1)) {
    sprite.x2 += sprite.data[SPRITE_DATA_SPEED_X] ?? 0;
    sprite.y2 += sprite.data[SPRITE_DATA_SPEED_Y] ?? 0;
  }
}

// ─── SpriteCB_FaintPlayerMon helper (= entry pour player side) ─────────────

/** Helper : trigger un faint slide pour player side. Décomp utilise
 *  SpriteCB_FaintSlideAnim direct avec speeds set par caller. */
export function TriggerFaintSlide(sprite: FaintSprite, speedX: number, speedY: number): void {
  sprite.data[SPRITE_DATA_SPEED_X] = speedX;
  sprite.data[SPRITE_DATA_SPEED_Y] = speedY;
  sprite.callback = SpriteCB_FaintSlideAnim;
}

/** Helper : trigger un faint opponent (= drop animation). Sets data[5] = battler
 *  et data[7] = species, puis active SpriteCB_FaintOpponentMon. */
export function TriggerFaintOpponent(sprite: FaintSprite, battler: number, species: number): void {
  sprite.data[SPRITE_DATA_BATTLER] = battler;
  sprite.data[SPRITE_DATA_SPECIES] = species;
  sprite.callback = SpriteCB_FaintOpponentMon;
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleFaintAnim = {
  SpriteCB_FaintOpponentMon, SpriteCB_AnimFaintOpponent, SpriteCB_FaintSlideAnim,
  TriggerFaintSlide, TriggerFaintOpponent,
  setFaintSlideFlags, getFaintSlideFlags,
};
