/**
 * bag-menu-icons.ts — 1:1 décomp `src/item_menu_icons.c` (sous-ensemble sac)
 * ============================================================================
 * Couche fine au-dessus de `item-icon.ts` (AddItemIconSprite 1:1). Gère le
 * double-buffer d'icône objet du sac (2 slots TAG_ITEM_ICON+0/+1 = anti-
 * flicker décomp) + bookkeeping `gBagMenu->spriteIds`.
 *
 * Cycle-safe : `gBagMenu` (export `let` de bag-menu.ts) lu UNIQUEMENT en
 * corps de fonction (live binding ESM résolu à l'appel, pas au module-eval)
 * → pas de TDZ malgré l'arête bag-menu ↔ bag-menu-icons (cf. leçon
 * feedback-map-loader-var-tdz : le danger = usage AU TOP-LEVEL d'un hub).
 */
import { AddItemIconSprite, MAX_SPRITES } from '../ui/item-icon';
import { gBagMenu } from './bag-menu';
import { IndexOfSpritePaletteTag, FreeSpritePaletteByTag as _spFreeSpritePaletteByTag, GetSpriteTileStartByTag as _spGetSpriteTileStartByTag } from '../sprite';
import {
  getRuntime,
  FreeSpriteTilesByTag as _rtFreeSpriteTilesByTag,
  LoadCompressedSpriteSheet,
  LoadSpritePalette,
} from '../system/decomp-globals';
import { DestroySprite, StartSpriteAnim, StartSpriteAffineAnim } from '../system/decomp-bridge';
import { getItemKeyById } from '../data-tables';
import { ENUM_ITEMMENUSPRITE_2 } from '../decomp-data/include/item_menu-data';
import { ITEM_LIST_END } from '../decomp-data/include/constants/items-data';
import { ENUM_TAG_0 as ENUM_BAG_TAG } from '../decomp-data/src/item_menu_icons-data';
const TAG_BAG_GFX = ENUM_BAG_TAG.TAG_BAG_GFX;                       // 100, sprite sheet sac
const TAG_ROTATING_BALL_GFX = ENUM_BAG_TAG.TAG_ROTATING_BALL_GFX;   // 101, ball rotative pocket-switch
import { registerAffineAnim, registerAffineAnimTable } from '../decomp-impls/sprite-affine-extras';
import type { DecompSprite, DecompRuntime } from '../system/decomp-runtime';

// 1:1 décomp `SPRITE_NONE` (sprite.h:6 TAIL_SENTINEL 0xFF).
const SPRITE_NONE = 0xFF;
// 1:1 décomp `ITEMMENUSPRITE_*` (item_menu.h) — slots dans gBagMenu->spriteIds.
const ITEMMENUSPRITE_BAG  = ENUM_ITEMMENUSPRITE_2.ITEMMENUSPRITE_BAG;   // 0
const ITEMMENUSPRITE_BALL = ENUM_ITEMMENUSPRITE_2.ITEMMENUSPRITE_BALL;  // 1
const ITEMMENUSPRITE_ITEM = ENUM_ITEMMENUSPRITE_2.ITEMMENUSPRITE_ITEM;  // 2 (base, double-buffer id^1)
// 1:1 décomp `#define TAG_ITEM_ICON 5557` (item_menu_icons.c) — GFXTAG/
// PALTAG de base ; les 2 slots = TAG_ITEM_ICON + id (id ∈ {0,1}). Valeur
// = clé unique de spriteSheetTagToTileStart/paletteTagToSlot (substrat).
const TAG_ITEM_ICON = 5557;

// 1:1 décomp `enum Pocket` (constants/items.h) — index dans sBagSpriteAnimTable
// (anims[POCKET_NONE..POCKET_KEY_ITEMS] = frame par poche).
const POCKET_NONE = 0;

/** 1:1 décomp `FreeSpriteTilesByTag(tag)` (sprite.c) — libère l'enregistrement
 *  tag→tileStart pour que LoadCompressedSpriteSheet ré-alloue au reload (le
 *  reload même tag est sinon ignoré, decomp-globals:1774). Pattern prouvé
 *  list-menu.ts:1101. (Le curseur VRAM est monotone — pas de rembobinage :
 *  limitation substrat documentée, raffinage Phase 3 ; fonctionnel ici.) */
function FreeSpriteTilesByTag(tag: number): void {
  _rtFreeSpriteTilesByTag(tag); // reclaim VRAM 1:1 (≠ simple Map.delete)
}
/** 1:1 décomp `FreeSpritePaletteByTag(tag)` (sprite.c:1652-1657). Délègue à
 *  la VRAIE impl sprite.ts qui clear sSpritePaletteTags[index] = TAG_NONE +
 *  sync paletteTagToSlot Map. Sans clear de l'array primary, le prochain
 *  LoadSpritePalette du même tag voit le slot toujours alloué via Index
 *  OfSpritePaletteTag → return early sans re-charger la palette → icône
 *  item rendue avec la palette du PRÉCÉDENT item (= bug user "POTION noire"
 *  après scroll depuis ITEM_LIST_END/return_arrow). */
function FreeSpritePaletteByTag(tag: number): void {
  _spFreeSpritePaletteByTag(tag);
}

/** 1:1 décomp `RemoveBagSprite(id)` (item_menu_icons.c:425) :
 *  FreeSpriteTilesByTag(id+TAG_BAG_GFX) + FreeSpritePaletteByTag(id+TAG_BAG_GFX)
 *  + FreeSpriteOamMatrix(&gSprites[id]) + DestroySprite + SPRITE_NONE. */
export function RemoveBagSprite(id: number): void {
  const bm = gBagMenu;
  if (!bm) return;
  const spriteId = bm.spriteIds[id];
  if (spriteId !== SPRITE_NONE) {
    // 1:1 :429-430 FreeSpriteTilesByTag(id + TAG_BAG_GFX) + FreeSpritePaletteByTag.
    _rtFreeSpriteTilesByTag(id + TAG_BAG_GFX);
    _spFreeSpritePaletteByTag(id + TAG_BAG_GFX);
    const rt = getRuntime() as unknown as {
      gSprites?: Map<number, { matrixNum: number; affineMode: number }>;
      FreeOamMatrix?: (matrixNum: number) => void;
    } | null;
    // 1:1 :431 FreeSpriteOamMatrix(&gSprites[*spriteId]) — libère la matrix
    // OAM si le sprite était affine (= ITEMMENUSPRITE_BAG, ITEMMENUSPRITE_BALL).
    const spr = rt?.gSprites?.get(spriteId);
    if (spr && spr.affineMode && rt?.FreeOamMatrix) rt.FreeOamMatrix(spr.matrixNum);
    DestroySprite(spriteId);
    bm.spriteIds[id] = SPRITE_NONE;
  }
}

/** 1:1 décomp `AddBagItemIconSprite(itemId, id)` (item_menu_icons.c:535) :
 *  slot = &gBagMenu->spriteIds[id + ITEMMENUSPRITE_ITEM] ; si SPRITE_NONE :
 *  FreeSpriteTilesByTag/FreeSpritePaletteByTag(id+TAG_ITEM_ICON) ;
 *  iconSpriteId = AddItemIconSprite(id+TAG_ITEM_ICON, id+TAG_ITEM_ICON,
 *  itemId) ; si != MAX_SPRITES : *slot = iconSpriteId ; gSprites[id].x2=24 ;
 *  y2=88. `itemId` numérique (call-site 1:1) → itemKey string CONFINÉ ici
 *  (getItemKeyById ; ITEM_LIST_END → flèche retour, item_icon.c:157). */
export function AddBagItemIconSprite(itemId: number, id: number): void {
  const bm = gBagMenu;
  if (!bm) return;
  const itemKey = itemId === ITEM_LIST_END ? 'ITEM_LIST_END' : getItemKeyById(itemId);
  const slot = id + ITEMMENUSPRITE_ITEM;
  if (bm.spriteIds[slot] === SPRITE_NONE) {
    FreeSpriteTilesByTag(id + TAG_ITEM_ICON);
    FreeSpritePaletteByTag(id + TAG_ITEM_ICON);
    const iconSpriteId = AddItemIconSprite(id + TAG_ITEM_ICON, id + TAG_ITEM_ICON, itemKey);
    if (iconSpriteId !== MAX_SPRITES) {
      bm.spriteIds[slot] = iconSpriteId;
      // 1:1 :549-550 gSprites[iconSpriteId].x2 = 24 ; .y2 = 88 (case gauche).
      const rt = getRuntime() as unknown as { gSprites?: Map<number, { x2: number; y2: number }> } | null;
      const spr = rt?.gSprites?.get(iconSpriteId);
      if (spr) { spr.x2 = 24; spr.y2 = 88; }
    }
  }
}

/** 1:1 décomp `RemoveBagItemIconSprite(id)` (item_menu_icons.c:555-572,
 *  branche **BUGFIX**) : libère les tags ITEM_ICON propres + destroy + hide
 *  l'autre slot. La branche non-BUGFIX appelait `RemoveBagSprite(id+ITEMMENU
 *  SPRITE_ITEM)` qui libère `(id+ITEMMENUSPRITE_ITEM)+TAG_BAG_GFX` au lieu
 *  de `id+TAG_ITEM_ICON` (= MAUVAIS TAG) → la palette item reste prise
 *  dans sSpritePaletteTags → next LoadSpritePalette voit existant → ne
 *  re-charge PAS la palette du nouvel item → icône item rendue avec palette
 *  du précédent (= user-bug "POTION noire" après scroll). */
export function RemoveBagItemIconSprite(id: number): void {
  const bm = gBagMenu;
  if (!bm) return;
  // 1:1 :562-563 hide the OTHER slot avant de destroy le slot courant —
  // évite le flicker 1-frame mentionné dans le commentaire décomp.
  const otherSpriteId = bm.spriteIds[(id ^ 1) + ITEMMENUSPRITE_ITEM];
  if (otherSpriteId !== SPRITE_NONE) {
    const rt = getRuntime() as unknown as { setSpriteInvisible?: (id: number, v: boolean) => void } | null;
    rt?.setSpriteInvisible?.(otherSpriteId, true);
  }
  // 1:1 :565-569 destroy le slot courant + libère ses tags ITEM_ICON propres.
  const spriteId = bm.spriteIds[id + ITEMMENUSPRITE_ITEM];
  if (spriteId !== SPRITE_NONE) {
    FreeSpriteTilesByTag(id + TAG_ITEM_ICON);
    FreeSpritePaletteByTag(id + TAG_ITEM_ICON);
    DestroySprite(spriteId);
    bm.spriteIds[id + ITEMMENUSPRITE_ITEM] = SPRITE_NONE;
  }
}

// ─── Sprite sac (gender + animation par poche + shake affine) ────────────────
// 1:1 décomp `src/item_menu_icons.c` : sBagSpriteTemplate :145 (tileTag/paletteTag
// =TAG_BAG_GFX, oam=sBagOamData 64×64 AFFINE_NORMAL prio1, anims=sBagSpriteAnimTable
// :94, affineAnims=sBagAffineAnimCmds :124, callback=SpriteCallbackDummy).

const BAG_ANIM_TABLE_NAME = 'sBagSpriteAnimTable';
const BAG_AFFINE_TABLE_NAME = 'sBagAffineAnimCmds';
const ANIM_BAG_NORMAL = 0;  // sBagAffineAnimCmds[0] = sSpriteAffineAnim_BagNormal
const ANIM_BAG_SHAKE  = 1;  // sBagAffineAnimCmds[1] = sSpriteAffineAnim_BagShake

// 1:1 décomp `sBagSpriteAnimTable` (item_menu_icons.c:94-102) :
//   [POCKET_NONE]      = sSpriteAnim_Bag_Closed    (frame tile=0)
//   [POCKET_ITEMS]     = sSpriteAnim_Bag_Items     (frame tile=64)
//   [POCKET_POKE_BALLS]= sSpriteAnim_Bag_Pokeballs (frame tile=192)
//   [POCKET_TM_HM]     = sSpriteAnim_Bag_TMsHMs    (frame tile=256)
//   [POCKET_BERRIES]   = sSpriteAnim_Bag_Berries   (frame tile=320)
//   [POCKET_KEY_ITEMS] = sSpriteAnim_Bag_KeyItems  (frame tile=128)
// (chaque anim : ANIMCMD_FRAME(tileOffset, 4) + ANIMCMD_END, durée 4 frames)
const _BAG_ANIM_NAMES = [
  'sSpriteAnim_Bag_Closed',
  'sSpriteAnim_Bag_Items',
  'sSpriteAnim_Bag_Pokeballs',
  'sSpriteAnim_Bag_TMsHMs',
  'sSpriteAnim_Bag_Berries',
  'sSpriteAnim_Bag_KeyItems',
] as const;
const _BAG_ANIM_TILE_OFFSETS = [0, 64, 192, 256, 320, 128] as const;

let _bagSpriteAnimsRegistered = false;
function _registerBagSpriteAnimsIfNeeded(): void {
  if (_bagSpriteAnimsRegistered) return;
  const rt = getRuntime() as unknown as {
    registerExtraAnim: (name: string, def: { frames: ReadonlyArray<{ tileNum: number; duration: number }>; terminator: 'END' | 'JUMP'; jumpTo?: number }) => void;
    registerExtraAnimTable: (name: string, table: { anims: ReadonlyArray<string> }) => void;
  } | null;
  if (!rt) return;
  _bagSpriteAnimsRegistered = true;
  // Frame anims : 1 frame chacune, ANIMCMD_FRAME(tileOffset, 4) (item_menu_icons.c:58-91).
  for (let i = 0; i < 6; i++) {
    rt.registerExtraAnim(_BAG_ANIM_NAMES[i], {
      frames: [{ tileNum: _BAG_ANIM_TILE_OFFSETS[i], duration: 4 }],
      terminator: 'END',
    });
  }
  rt.registerExtraAnimTable(BAG_ANIM_TABLE_NAME, { anims: _BAG_ANIM_NAMES });
  // Affine anims (item_menu_icons.c:104-117). Note : scale=256 = 1.0×.
  registerAffineAnim('sSpriteAffineAnim_BagNormal', {
    frames: [{ xScale: 256, yScale: 256, rotation: 0, duration: 0 }],
    terminator: 'END',
  });
  registerAffineAnim('sSpriteAffineAnim_BagShake', {
    // AFFINEANIMCMD_FRAME(0,0,254,2) + (0,0,2,4) + (0,0,254,4) + (0,0,2,2) + END.
    // rotation 254 = s8 -2 (= ~-2.8° par tick) ; 2 = +2.8° par tick. Oscille.
    frames: [
      { xScale: 0, yScale: 0, rotation: 254, duration: 2 },
      { xScale: 0, yScale: 0, rotation: 2,   duration: 4 },
      { xScale: 0, yScale: 0, rotation: 254, duration: 4 },
      { xScale: 0, yScale: 0, rotation: 2,   duration: 2 },
    ],
    terminator: 'END',
  });
  registerAffineAnimTable(BAG_AFFINE_TABLE_NAME, {
    affineAnims: ['sSpriteAffineAnim_BagNormal', 'sSpriteAffineAnim_BagShake'],
  });
}

/** 1:1 décomp `AddBagVisualSprite` (item_menu_icons.c:437) :
 *  spriteId = CreateSprite(&sBagSpriteTemplate, 68, 66, 0) ; SetBagVisualPocketId
 *  (pocket, FALSE). LoadCompressedSpriteSheet(bag{Male,Female}) + LoadSprite
 *  Palette(gBagPaletteTable) sont déjà faits par LoadBagMenu_Graphics (case 3+4).
 *  Substrat sprite dynamique : tag → tileStart/palBank → CreateSpriteAtOam +
 *  spriteAnimStatesRegister + affineAnimsTableName (= net-1:1 du template). */
export function AddBagVisualSprite(bagPocketId: number): void {
  const bm = gBagMenu;
  if (!bm) return;
  _registerBagSpriteAnimsIfNeeded();
  const rt = getRuntime() as unknown as {
    CreateSpriteAtOam: (c: Record<string, number>) => { spriteId: number };
    AllocOamMatrix: () => number;
    spriteAnimStatesRegister: (id: number, name: string, idx: number, base: number) => void;
    gSprites?: Map<number, DecompSprite>;
    StartSpriteAffineAnim: (id: number, num: number) => void;
  } | null;
  if (!rt) return;
  // 1:1 STRICT lookups via array primary sprite.ts (sprite.c:1542 + :1637).
  const tileStartRaw = _spGetSpriteTileStartByTag(TAG_BAG_GFX);
  const tileStart = tileStartRaw === 0xFFFF ? 0 : tileStartRaw;
  const palBankBag = IndexOfSpritePaletteTag(TAG_BAG_GFX);
  const palBank = palBankBag === 0xFF ? 0 : palBankBag;
  // AFFINE_NORMAL exige une matrix OAM (= sAffineAnimStates[matrixNum]).
  const matrixNum = rt.AllocOamMatrix();
  if (matrixNum < 0) return; // 32 slots saturés → impossible (cf. décomp MAX_SPRITES).
  // sBagOamData (item_menu_icons.c:41) : shape=0(square), size=3(64x64),
  // bpp=4, prio=1, AFFINE_NORMAL=1, matrixNum (alloué dynamiquement).
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: tileStart, paletteBank: palBank,
    x: 68, y: 66, shape: 0, size: 3, priority: 1, subpriority: 0,
    affineMode: 1, affineParamIndex: matrixNum,
  });
  if (spriteId === MAX_SPRITES) {
    // Échec sprite alloc → libère la matrix qu'on vient d'allouer.
    const rt2 = getRuntime() as unknown as { FreeOamMatrix?: (n: number) => void } | null;
    rt2?.FreeOamMatrix?.(matrixNum);
    return;
  }
  bm.spriteIds[ITEMMENUSPRITE_BAG] = spriteId;
  // Bind anim table (= sBagSpriteAnimTable) + affine anim table sur le sprite.
  rt.spriteAnimStatesRegister(spriteId, BAG_ANIM_TABLE_NAME, 0, tileStart);
  const spr = rt.gSprites?.get(spriteId);
  if (spr) spr.affineAnimsTableName = BAG_AFFINE_TABLE_NAME;
  // Init affine = NORMAL (scale 1.0, no rotation).
  rt.StartSpriteAffineAnim(spriteId, ANIM_BAG_NORMAL);
  // :441 SetBagVisualPocketId(bagPocketId, FALSE) — applique la frame de la poche.
  SetBagVisualPocketId(bagPocketId, false);
}

/** 1:1 décomp `SetBagVisualPocketId` (item_menu_icons.c:446).
 *  `#define sPocketId data[0]` — sprite.data[0] stocke le pocket+1 cible pour
 *  l'anim de switch (le SpriteCB le lit quand y2 atteint 0). */
export function SetBagVisualPocketId(bagPocketId: number, isSwitchingPockets: boolean): void {
  const bm = gBagMenu;
  if (!bm) return;
  const rt = getRuntime();
  if (!rt) return;
  const spriteId = bm.spriteIds[ITEMMENUSPRITE_BAG];
  if (spriteId === SPRITE_NONE) return;
  const spr = rt.gSprites.get(spriteId);
  if (!spr) return;
  if (isSwitchingPockets) {
    spr.y2 = -5;
    spr.callback = SpriteCB_BagVisualSwitchingPockets;
    spr.data[0] = bagPocketId + 1;
    StartSpriteAnim(spriteId, POCKET_NONE);
  } else {
    StartSpriteAnim(spriteId, bagPocketId + 1);
  }
}

/** 1:1 décomp `SpriteCB_BagVisualSwitchingPockets` (item_menu_icons.c:462).
 *  Anim "bounce" du sac à chaque changement de poche : y2 part de -5, monte
 *  +1 par frame jusqu'à 0 ; quand y2==0, on applique la frame finale de la
 *  nouvelle poche (data[0]) et on rétablit le callback dummy. */
function SpriteCB_BagVisualSwitchingPockets(sprite: DecompSprite, _rt: DecompRuntime): void {
  if (sprite.y2 !== 0) {
    sprite.y2++;
  } else {
    StartSpriteAnim(sprite.spriteId, sprite.data[0]);
    sprite.callback = null; // SpriteCallbackDummy (1:1 :471).
  }
}

/** 1:1 décomp `ShakeBagSprite` (item_menu_icons.c:477).
 *  Lance le shake affine (sSpriteAffineAnim_BagShake) UNIQUEMENT si l'anim
 *  précédente est terminée (= pas de re-shake en plein milieu d'un shake). */
export function ShakeBagSprite(): void {
  const bm = gBagMenu;
  if (!bm) return;
  const rt = getRuntime();
  if (!rt) return;
  const spriteId = bm.spriteIds[ITEMMENUSPRITE_BAG];
  if (spriteId === SPRITE_NONE) return;
  const spr = rt.gSprites.get(spriteId);
  if (!spr) return;
  if (spr.affineAnimEnded) {
    StartSpriteAffineAnim(spriteId, ANIM_BAG_SHAKE);
    spr.callback = SpriteCB_ShakeBagSprite;
  }
}

/** 1:1 décomp `SpriteCB_ShakeBagSprite` (item_menu_icons.c:487).
 *  Attend la fin du shake (affineAnimEnded) puis restore NORMAL + dummy cb. */
function SpriteCB_ShakeBagSprite(sprite: DecompSprite, _rt: DecompRuntime): void {
  if (sprite.affineAnimEnded) {
    StartSpriteAffineAnim(sprite.spriteId, ANIM_BAG_NORMAL);
    sprite.callback = null; // SpriteCallbackDummy.
  }
}

// ─── Ball rotative pocket-switch (item_menu_icons.c:184-225, 497-533) ─────────
// sRotatingBallSpriteTemplate :216 : tileTag=paletteTag=TAG_ROTATING_BALL_GFX,
// oam=sRotatingBallOamData (16×16 4bpp prio2, AFFINE_OFF init), anims=stationary,
// affineAnims=sRotatingBallAnimCmds (data[0]=-1) ou _FullRotation (data[0]=+1),
// callback=SpriteCB_SwitchPocketRotatingBallInit.
// 1:1 décomp tables :184/190 — frame rotation +8 ou +248(=-8) par tick, 16 ticks.

const ROTATING_BALL_AFFINE_TABLE_NEG = 'sRotatingBallAnimCmds';
const ROTATING_BALL_AFFINE_TABLE_POS = 'sRotatingBallAnimCmds_FullRotation';

let _rotatingBallAffineRegistered = false;
function _registerRotatingBallAnimsIfNeeded(): void {
  if (_rotatingBallAffineRegistered) return;
  _rotatingBallAffineRegistered = true;
  // sSpriteAffineAnim_RotatingBallRotation1 (item_menu_icons.c:184-188) :
  //   AFFINEANIMCMD_FRAME(0, 0, 8, 16) + END.
  registerAffineAnim('sSpriteAffineAnim_RotatingBallRotation1', {
    frames: [{ xScale: 0, yScale: 0, rotation: 8, duration: 16 }],
    terminator: 'END',
  });
  // sSpriteAffineAnim_RotatingBallRotation2 (item_menu_icons.c:190-194) :
  //   AFFINEANIMCMD_FRAME(0, 0, 248, 16). 248 = s8(-8) — rotation sens inverse.
  registerAffineAnim('sSpriteAffineAnim_RotatingBallRotation2', {
    frames: [{ xScale: 0, yScale: 0, rotation: 248, duration: 16 }],
    terminator: 'END',
  });
  // Tables (item_menu_icons.c:196-204).
  registerAffineAnimTable(ROTATING_BALL_AFFINE_TABLE_NEG, {
    affineAnims: ['sSpriteAffineAnim_RotatingBallRotation1'],
  });
  registerAffineAnimTable(ROTATING_BALL_AFFINE_TABLE_POS, {
    affineAnims: ['sSpriteAffineAnim_RotatingBallRotation2'],
  });
}

/** 1:1 décomp `AddSwitchPocketRotatingBallSprite` (item_menu_icons.c:497).
 *  Appelée par SwitchBagPocket(:1359). LoadSpriteSheet+LoadSpritePalette
 *  (idempotents au runtime) ; CreateSprite(&sRotatingBallSpriteTemplate, 16,
 *  16, 0) ; data[0] = rotationDirection (MENU_CURSOR_DELTA_LEFT/RIGHT). */
export function AddSwitchPocketRotatingBallSprite(rotationDirection: number): void {
  const bm = gBagMenu;
  if (!bm) return;
  _registerRotatingBallAnimsIfNeeded();
  const rt = getRuntime() as unknown as {
    CreateSpriteAtOam: (c: Record<string, number>) => { spriteId: number };
    AllocOamMatrix: () => number;
    FreeOamMatrix?: (n: number) => void;
    gSprites?: Map<number, DecompSprite>;
  } | null;
  if (!rt) return;
  // 1:1 :500-501 : assets chargés à chaque switch (idempotents au substrat
  // tag-keyed). Assets préchargés au boot du sac (__rotatingBallTiles/Pal).
  LoadCompressedSpriteSheet({ data: '__rotatingBallTiles', size: 0x80, tag: TAG_ROTATING_BALL_GFX });
  LoadSpritePalette({ data: '__rotatingBallPal', tag: TAG_ROTATING_BALL_GFX });
  // 1:1 STRICT lookups via array primary (sprite.c:1542 + :1637).
  const tileStartRaw = _spGetSpriteTileStartByTag(TAG_ROTATING_BALL_GFX);
  const tileStart = tileStartRaw === 0xFFFF ? 0 : tileStartRaw;
  const palBankRot = IndexOfSpritePaletteTag(TAG_ROTATING_BALL_GFX);
  const palBank = palBankRot === 0xFF ? 0 : palBankRot;
  // sRotatingBallOamData (item_menu_icons.c:156-171) : shape=0(sq), size=1(16x16),
  // bpp=4, prio=2, AFFINE_OFF init (SpriteCB_Init le passe à NORMAL :514).
  const matrixNum = rt.AllocOamMatrix();
  if (matrixNum < 0) return;
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: tileStart, paletteBank: palBank,
    x: 16, y: 16, shape: 0, size: 1, priority: 2, subpriority: 0,
    affineMode: 0, // AFFINE_OFF — SpriteCB_Init le passera à NORMAL :514.
    affineParamIndex: matrixNum,
  });
  if (spriteId === MAX_SPRITES) {
    rt.FreeOamMatrix?.(matrixNum);
    return;
  }
  bm.spriteIds[ITEMMENUSPRITE_BALL] = spriteId;
  // 1:1 :503 gSprites[id].data[0] = rotationDirection.
  // Notre voie dynamique : on attache le callback Init manuellement (= le
  // décomp le fait via template.callback). Le runtime appelle ce callback
  // chaque frame → 1er tick = init de l'affine (oam mode + table) + bascule
  // vers SpriteCB_Continue.
  const spr = rt.gSprites?.get(spriteId);
  if (spr) {
    spr.data[0] = rotationDirection;
    spr.callback = SpriteCB_SwitchPocketRotatingBallInit;
  }
}

/** 1:1 décomp `SpriteCB_SwitchPocketRotatingBallInit` (item_menu_icons.c:512).
 *  1er tick après création : active AFFINE_NORMAL, choisit la table affine
 *  selon data[0] (-1 → Rotation1, sinon Rotation2), InitSpriteAffineAnim,
 *  data[1] = centerToCornerVecY (1:1 bug décomp où data[1] est écrasé), puis
 *  bascule vers SpriteCB_Continue. */
function SpriteCB_SwitchPocketRotatingBallInit(sprite: DecompSprite, rt: DecompRuntime): void {
  // :514 sprite->oam.affineMode = ST_OAM_AFFINE_NORMAL.
  rt.gba.oam[sprite.oamIndex].affineMode = 1;
  sprite.affineMode = 1;
  // :515-518 : table affine selon data[0].
  sprite.affineAnimsTableName = sprite.data[0] === -1
    ? ROTATING_BALL_AFFINE_TABLE_NEG
    : ROTATING_BALL_AFFINE_TABLE_POS;
  // :520 InitSpriteAffineAnim — reset état + flag begin pour que le moteur
  // applique le 1er frame au prochain tick affine.
  sprite.affineAnimBeginning = true;
  sprite.affineAnimEnded = false;
  sprite.affineAnimNum = 0;
  sprite.affineAnimCmdIndex = 0;
  sprite.affineAnimDelayCounter = 0;
  sprite.xScale = 0x100;
  sprite.yScale = 0x100;
  sprite.rotation = 0;
  // :521-522 : data[1] = centerToCornerVecX puis data[1] = centerToCornerVecY
  // (= bug décomp : seul Y est conservé, X overwritté). On préserve 1:1.
  sprite.data[1] = sprite.centerToCornerVecY;
  UpdateSwitchPocketRotatingBallCoords(sprite);
  // :524 sprite->callback = SpriteCB_SwitchPocketRotatingBallContinue.
  sprite.callback = SpriteCB_SwitchPocketRotatingBallContinue;
}

/** 1:1 décomp `SpriteCB_SwitchPocketRotatingBallContinue` (item_menu_icons.c:527).
 *  data[3]++ chaque frame ; mise à jour des coords ; quand data[3]==16,
 *  RemoveBagSprite (= libère le sprite + sa matrix OAM). */
function SpriteCB_SwitchPocketRotatingBallContinue(sprite: DecompSprite, _rt: DecompRuntime): void {
  sprite.data[3]++;
  UpdateSwitchPocketRotatingBallCoords(sprite);
  if (sprite.data[3] === 16)
    RemoveBagSprite(ITEMMENUSPRITE_BALL);
}

/** 1:1 décomp `UpdateSwitchPocketRotatingBallCoords` (item_menu_icons.c:506).
 *  Ajuste les centerToCornerVec X/Y de ±1 selon parité du timer (= jitter
 *  visuel sur la rotation). NOTE : décomp set X et Y à la même formule
 *  (= bug ou intentionnel pour aligner ; 1:1 préservé). */
function UpdateSwitchPocketRotatingBallCoords(sprite: DecompSprite): void {
  const adj = sprite.data[1] - ((sprite.data[3] + 1) & 1);
  sprite.centerToCornerVecX = adj;
  sprite.centerToCornerVecY = adj;
}
