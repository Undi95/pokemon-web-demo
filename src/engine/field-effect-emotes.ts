/**
 * field-effect-emotes.ts — Port 1:1 des field effects emote (!?♥) du décomp.
 *
 * Source de vérité (1:1 strict) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/trainer_see.c:62-177` :
 *      sEmotion_ExclamationMarkGfx + sSpriteTemplate_ExclamationQuestionMark
 *   - `D:/Projet 1/decomps/pokeemeraude/src/trainer_see.c:696-743` :
 *      FldEff_ExclamationMarkIcon / FldEff_QuestionMarkIcon / FldEff_HeartIcon
 *      + SetIconSpriteData + SpriteCB_TrainerIcons (bounce + auto-destroy)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/event_object_movement.c:6479-6501` :
 *      MovementAction_EmoteExclamationMark/QuestionMark/Heart_Step0 → call
 *      FieldEffectStart(FLDEFF_EXCLAMATION_MARK_ICON) puis sActionFuncId=1
 *      → action terminée immédiatement (= sprite vit indépendamment).
 *
 * Wiring :
 *   - `movement-system.ts` `_tickAction('emote_*')` appelle `SpawnEmoteSprite()`
 *     puis retourne TRUE immédiatement. Le sprite vit ~60 frames de bounce.
 *   - `TestOverworldScene.ts` `update()` appelle `tickEmoteSprites(rt)` chaque
 *     frame pour update positions + détecter sprite ended.
 *
 * Architecture :
 *   - Tiles 4bpp : 4 tiles 8x8 par emote (16x16), 3 emotes = 12 tiles total
 *     loaded à OBJ VRAM offset `EMOTE_OBJ_TILE_START` (= 976..988).
 *   - Palette : `general_0.pal` (= `gFieldEffectObjectPalette0`) loaded à OBJ
 *     palette bank `EMOTE_PALETTE_BANK` (= 13). Couleurs jaune/bleu/rouge
 *     1:1 décomp.
 *   - State : array `_activeEmotes` avec sprite OAM + npc reference + bounce
 *     state. tick chaque frame pour update sprite.x/y + bounce + ttl decrement.
 */

import type { DecompRuntime } from './decomp-runtime';
import { loadTileBin, loadGbaPal } from './gba/png-loader';
import { gObjectEvents, type ObjectEvent } from './object-events';
import { OBJ_PLTT_ID } from './decomp-globals';

// ─── Asset paths ────────────────────────────────────────────────────────────

const EXCLAMATION_PNG = '/decomp/em/field_effects/emotion_exclamation.png';
const QUESTION_PNG    = '/decomp/em/field_effects/emotion_question.png';
const HEART_PNG       = '/decomp/em/field_effects/emotion_heart.png';
/** Palette dédiée du sprite emote (= 16 colors RGB15 binaire 32 bytes).
 *  Extraite par `scripts/extract-png-indexed-tiles.mjs` depuis la PLTE du PNG
 *  source emotion_exclamation.png (= bytes identiques aux 3 PNGs emote car ils
 *  partagent la même PLTE, qui est elle-même 1:1 décomp `general_0.pal`).
 *  Le fichier `general_0.pal` source est en format JASC-PAL texte ASCII
 *  (= 213 bytes), donc utilisable directement par loadGbaPal. */
const EMOTE_PAL_BIN   = '/decomp/em/field_effects/emotion_exclamation.gbapal';

// ─── OBJ VRAM + palette allocation ─────────────────────────────────────────

/** Tile start dans OBJ VRAM. 4 tiles 8x8 par emote × 3 emotes = 12 tiles.
 *  Réservons 976..988 (= juste avant ARROW_OBJ_TILE_START=992 du field-effect-arrow). */
const EMOTE_OBJ_TILE_START = 976;
const TILES_PER_EMOTE = 4;  // 16x16 = 2x2 tiles 4bpp

/** Frame index dans l'OBJ tile space (= tile offset relative to EMOTE_OBJ_TILE_START). */
const ANIM_FRAME_EXCLAMATION = 0;  // tiles 976..979
const ANIM_FRAME_QUESTION    = 1;  // tiles 980..983
const ANIM_FRAME_HEART       = 2;  // tiles 984..987

/** Palette OBJ bank dédiée aux emotes. Slot 13 = libre dans nos OW maps
 *  (= banks 0-12 utilisés par NPCs + player). 1:1 décomp `gFieldEffectObjectPalette0`
 *  = `general_0.pal`, qui contient les couleurs jaune (!), bleu (?), rouge (♥)
 *  + plage standard pour effects. */
const EMOTE_PALETTE_BANK = 13;

// ─── Types ──────────────────────────────────────────────────────────────────

/** Type d'emote (= 1:1 décomp FLDEFF_*_ICON enum). */
export type EmoteType = 'exclamation' | 'question' | 'heart';

interface EmoteState {
  /** OAM sprite ID alloué via CreateSpriteAtOam. */
  spriteId: number;
  /** localId du NPC qui porte cet emote (= pour tracking position). */
  npcLocalIdRaw: string;
  /** Frames restantes avant auto-destroy (= 1:1 décomp ANIMCMD_FRAME(0, 60) +
   *  ANIMCMD_END → sprite ends après 60 game frames). */
  framesRemaining: number;
  /** 1:1 décomp `sYVelocity` (= sprite->data[3]). Initial = -5. Incrémenté
   *  chaque frame (= rebondit puis tombe). */
  yVelocity: number;
  /** 1:1 décomp `sYOffset` (= sprite->data[4]). Accumule yVelocity chaque
   *  frame. Utilisé comme y2 sprite offset. */
  yOffset: number;
}

const _activeEmotes: EmoteState[] = [];

// ─── Asset loading (idempotent) ────────────────────────────────────────────

let _emoteAssetsLoaded = false;
let _emoteAssetsLoading: Promise<void> | null = null;

/** Charge async les 3 PNG emote + palette general_0.pal en OBJ VRAM/PLTT.
 *  Idempotent : safe à appeler plusieurs fois (= cache). À call avant le
 *  1er SpawnEmoteSprite (= TestOverworldScene boot ou warp). */
export async function LoadEmoteAssets(rt: DecompRuntime): Promise<void> {
  if (_emoteAssetsLoaded) return;
  if (_emoteAssetsLoading) return _emoteAssetsLoading;
  _emoteAssetsLoading = (async () => {
    const [excl, qst, hrt, pal] = await Promise.all([
      loadTileBin(EXCLAMATION_PNG, 4),
      loadTileBin(QUESTION_PNG, 4),
      loadTileBin(HEART_PNG, 4),
      loadGbaPal(EMOTE_PAL_BIN),
    ]);
    const objVram = rt.gba.objVram;
    // Layout : 4 tiles consecutifs par emote (= 2x2 tiles 4bpp = 128 bytes).
    objVram.set(excl, (EMOTE_OBJ_TILE_START + ANIM_FRAME_EXCLAMATION * TILES_PER_EMOTE) * 32);
    objVram.set(qst,  (EMOTE_OBJ_TILE_START + ANIM_FRAME_QUESTION    * TILES_PER_EMOTE) * 32);
    objVram.set(hrt,  (EMOTE_OBJ_TILE_START + ANIM_FRAME_HEART       * TILES_PER_EMOTE) * 32);
    // Palette : general_0.pal → OBJ palette bank EMOTE_PALETTE_BANK.
    rt.LoadPaletteObj(pal, OBJ_PLTT_ID(EMOTE_PALETTE_BANK));
    _emoteAssetsLoaded = true;
    console.log(`[field-effect-emotes] assets loaded (tiles ${EMOTE_OBJ_TILE_START}..${EMOTE_OBJ_TILE_START + 12}, palette bank ${EMOTE_PALETTE_BANK})`);
  })();
  return _emoteAssetsLoading;
}

// ─── Public API 1:1 décomp ──────────────────────────────────────────────────

/** Map EmoteType → tile offset dans OBJ VRAM. */
const EMOTE_TILE_OFFSET: Record<EmoteType, number> = {
  exclamation: ANIM_FRAME_EXCLAMATION * TILES_PER_EMOTE,
  question:    ANIM_FRAME_QUESTION    * TILES_PER_EMOTE,
  heart:       ANIM_FRAME_HEART       * TILES_PER_EMOTE,
};

/** 1:1 décomp `FldEff_ExclamationMarkIcon` / `FldEff_QuestionMarkIcon` /
 *  `FldEff_HeartIcon` (trainer_see.c:696-729). Spawn un sprite OAM 16x16
 *  au-dessus du NPC pour ~60 frames.
 *
 *  Si les assets ne sont pas encore chargés (= map load pas fait LoadEmoteAssets
 *  préalable), call async + return false. Ne spawn rien dans ce cas (= MVP, le
 *  décomp ne devrait jamais avoir cet edge case car LoadFieldEffectGraphics
 *  load au boot).
 *
 *  Returns true si spawn OK, false sinon. */
export function SpawnEmoteSprite(rt: DecompRuntime, npcLocalIdRaw: string, type: EmoteType): boolean {
  if (!_emoteAssetsLoaded) {
    // Defensive : si pas loaded, kick off async load + skip ce call (= sprite
    // pas spawned cette frame). Le prochain emote sera OK.
    void LoadEmoteAssets(rt);
    console.warn('[field-effect-emotes] SpawnEmoteSprite called before assets loaded — skipping');
    return false;
  }
  const npc = _findNpc(npcLocalIdRaw);
  if (!npc) {
    console.warn(`[field-effect-emotes] SpawnEmoteSprite: NPC ${npcLocalIdRaw} not found`);
    return false;
  }
  // Initial position = sprite NPC déjà synchronisé (= 1:1 décomp `sprite->x =
  // objEventSprite->x; sprite->y = objEventSprite->y - 16`). Lecture directe du
  // sprite NPC, pas de `npc.worldX/Y` qui est pre-sync cam/pan.
  const npcSprite = npc.spriteId >= 0 ? rt.gSprites.get(npc.spriteId) : null;
  const spriteX = npcSprite?.x ?? 0;
  const spriteY = (npcSprite?.y ?? 0) - 16;
  const tileId = EMOTE_OBJ_TILE_START + EMOTE_TILE_OFFSET[type];
  const result = rt.CreateSpriteAtOam({
    tileId,
    paletteBank: EMOTE_PALETTE_BANK,
    x: spriteX,
    y: spriteY,
    shape: 0,    // square
    size: 1,     // 16x16
    priority: 1, // au-dessus de BG2 + NPCs
    paletteMode: 0,
    affineMode: 0,
  });
  _activeEmotes.push({
    spriteId: result.spriteId,
    npcLocalIdRaw,
    framesRemaining: 60,  // 1:1 décomp ANIMCMD_FRAME(N, 60) → 60 game frames.
    yVelocity: -5,        // 1:1 décomp `sprite->sYVelocity = -5`.
    yOffset: 0,
  });
  return true;
}

/** 1:1 décomp `SpriteCB_TrainerIcons` (trainer_see.c:745-767) :
 *      sYOffset += sYVelocity;
 *      sprite->x = objEventSprite->x;        ← copie du sprite NPC (= déjà sync cam)
 *      sprite->y = objEventSprite->y - 16;
 *      sprite->x2 = objEventSprite->x2;
 *      sprite->y2 = objEventSprite->y2 + sYOffset;
 *      if (sYOffset) sYVelocity++;
 *      else sYVelocity = 0;
 *      → quand animEnded (= 60 frames), destroy sprite.
 *
 *  Crucial 1:1 : on copie `objEventSprite->x/y`, pas `npc.worldX/Y`. La
 *  raison : `sprite.x/y` est la position FINALE post-camera-pan post-offset
 *  (cf. object-events.ts:1753-1754 `sprite.x = npc.worldX + offX - panX + visualOffsetX`).
 *  Si on lit `worldX` directement, l'emote sera décalé du sprite NPC.
 *
 *  À call chaque frame depuis le main loop OW. */
export function tickEmoteSprites(rt: DecompRuntime): void {
  for (let i = _activeEmotes.length - 1; i >= 0; i--) {
    const emote = _activeEmotes[i];
    const npc = _findNpc(emote.npcLocalIdRaw);
    if (!npc || !npc.active) {
      // NPC disparu → cleanup sprite.
      _destroyEmoteSprite(rt, emote);
      _activeEmotes.splice(i, 1);
      continue;
    }
    emote.framesRemaining--;
    if (emote.framesRemaining <= 0) {
      // Anim ended → destroy.
      _destroyEmoteSprite(rt, emote);
      _activeEmotes.splice(i, 1);
      continue;
    }
    // Update bounce : yOffset += yVelocity, puis yVelocity++ si yOffset != 0.
    emote.yOffset += emote.yVelocity;
    if (emote.yOffset !== 0) emote.yVelocity++;
    else emote.yVelocity = 0;
    // 1:1 décomp : sprite->x = objEventSprite->x; sprite->y = objEventSprite->y - 16
    // + sYOffset (= bounce). Copy depuis le sprite NPC déjà synchronisé.
    const sprite = rt.gSprites.get(emote.spriteId);
    const npcSprite = npc.spriteId >= 0 ? rt.gSprites.get(npc.spriteId) : null;
    if (sprite && npcSprite) {
      sprite.x = npcSprite.x;
      sprite.y = npcSprite.y - 16 + emote.yOffset;
    }
  }
}

/** Cleanup tous les emote sprites actifs. À call au map switch / scene close. */
export function DestroyAllEmoteSprites(rt: DecompRuntime): void {
  for (const emote of _activeEmotes) {
    _destroyEmoteSprite(rt, emote);
  }
  _activeEmotes.length = 0;
}

// ─── Internal helpers ──────────────────────────────────────────────────────

function _findNpc(localIdRaw: string): ObjectEvent | null {
  for (const npc of gObjectEvents) {
    if (npc.active && npc.localIdRaw === localIdRaw) return npc;
  }
  return null;
}

function _destroyEmoteSprite(rt: DecompRuntime, emote: EmoteState): void {
  const sprite = rt.gSprites.get(emote.spriteId);
  if (sprite) {
    if (sprite.oamIndex >= 0) {
      rt.gba.oam[sprite.oamIndex].visible = false;
    }
    sprite.inUse = false;
  }
}

// ─── Debug exposure ────────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__getActiveEmotes = () => [..._activeEmotes];
