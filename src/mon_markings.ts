// game/mon_markings.ts — miroir 1:1 PARTIEL de `src/mon_markings.c` (616 l.).
//
// Transcrit pour l'écran BOÎTES du PC (Task_InitPokeStorage état 9 + display mon) :
// InitMonMarkingsMenu (:290), BufferMonMarkingsMenuTiles (:342, + BufferMenuWindowTiles :295
// et BufferMenuFrameTiles :304), CreateMonMarkingComboSprite (:578 → CreateMarkingComboSprite
// :585), UpdateMonMarkingTiles (:613). Le MENU interactif (OpenMonMarkingsMenu, HandleInput…)
// = lot dédié au moment du menu contextuel MARQUER.
//
// ⚠️ Asset : sMonMarkings_Gfx (graphics/misc/mon_markings.png) N'EST PAS extrait dans
// public/decomp/em → le sprite combo se crée avec des tiles vides + console.warn (le PC reste
// fonctionnel, les marques ●▲■♥ invisibles jusqu'à l'extraction de l'asset).

import { getRuntime, SpriteCallbackDummy, JOY_NEW, PlaySE } from '../harness/runtime/decomp-globals';
import {
  LoadSpriteSheet, LoadSpritePalette, CreateSprite, LoadSpriteSheets, LoadSpritePalettes,
  StartSpriteAnim, CalcCenterToCornerVec, FreeSpriteTilesByTag, FreeSpritePaletteByTag,
  DestroySprite, ANIMCMD_FRAME, ANIMCMD_END, type AnimCmd,
} from './sprite';
import { GetWindowFrameTilesPal } from './text_window';
import { loadIndexedPngStrict } from '../harness/gba/png-loader';
import { A_BUTTON, B_BUTTON, DPAD_UP, DPAD_DOWN } from '../include/gba/io_reg';

const TILE_SIZE_4BPP = 32;
const NUM_MON_MARKINGS = 4;

/** struct MonMarkingsMenu (mon_markings.h) — champs utilisés par les fonctions transcrites. */
export interface MonMarkingsMenu {
  baseTileTag: number;
  basePaletteTag: number;
  markings?: number;
  cursorPos?: number;
  markingsArray?: boolean[];
  frameTiles?: Uint8Array | null;
  framePalette?: Uint16Array | null;
  windowSpriteTiles?: Uint8Array;   // u8[0x1000] (:mon_markings.h)
  tileLoadState?: number;
  windowSprites?: number[];         // struct Sprite *windowSprites[2] → spriteId (-1 = NULL)
  markingSprites?: number[];        // struct Sprite *markingSprites[NUM_MON_MARKINGS] → spriteId
  cursorSprite?: number;            // struct Sprite *cursorSprite → spriteId
  textSprite?: number;              // struct Sprite *textSprite (OK/Cancel) → spriteId
}

let sMenu: MonMarkingsMenu | null = null;

// sMonMarkings_Gfx / sMonMarkings_Pal — chargés async (asset à extraire ; .catch bruyant).
let _markingsGfx: Uint8Array | null = null;
let _markingsPal: Uint16Array | null = null;
let _markingsLoadTried = false;
let _markingsLoadPromise: Promise<void> | null = null;
function _loadMarkingsGfx(): void {
  if (_markingsLoadTried) return;
  _markingsLoadTried = true;
  _markingsLoadPromise = (async () => {
    const png = await loadIndexedPngStrict('/decomp/em/ui/interface/mon_markings.png', 4);
    _markingsGfx = png.charData;
    _markingsPal = png.palette;
  })();
  _markingsLoadPromise.catch((e) => console.warn('[mon_markings] asset mon_markings.png absent (à extraire) :', e));
}
/** Précharge (async) le gfx/pal des marques. À await AVANT CreateMonMarkingComboSprite :
 *  le décomp a `sMonMarkings_Pal` en donnée statique (dispo immédiatement), donc sans ce
 *  préchargement la 1re création charge une palette vide (16 zéros = noir) = marques invisibles. */
export async function EnsureMonMarkingsGfxLoaded(): Promise<void> {
  _loadMarkingsGfx();
  if (_markingsLoadPromise) { try { await _markingsLoadPromise; } catch { /* warn déjà loggué ci-dessus */ } }
}

/** 1:1 `void InitMonMarkingsMenu(struct MonMarkingsMenu *ptr)` (mon_markings.c:290). */
export function InitMonMarkingsMenu(ptr: MonMarkingsMenu): void {
  sMenu = ptr;
}

/** 1:1 `static void BufferMenuWindowTiles(void)` (:295). */
function BufferMenuWindowTiles(): void {
  if (!sMenu) return;
  const frame = GetWindowFrameTilesPal((globalThis as { gSaveBlock2Ptr?: { optionsWindowFrameType?: number } }).gSaveBlock2Ptr?.optionsWindowFrameType ?? 0);
  sMenu.frameTiles = (frame as { tiles?: Uint8Array }).tiles ?? null;
  sMenu.framePalette = (frame as { pal?: Uint16Array }).pal ?? null;
  sMenu.tileLoadState = 0;
  sMenu.windowSpriteTiles = new Uint8Array(0x1000);  // CpuFill16(0, …)
}

/** 1:1 `static bool8 BufferMenuFrameTiles(void)` (:304) — compose la fenêtre sprite du menu
 *  (14 rangées de 8 tiles : haut / 12×milieu / bas). */
function BufferMenuFrameTiles(): boolean {
  const m = sMenu;
  if (!m || !m.frameTiles || !m.windowSpriteTiles) return false;
  const state = m.tileLoadState ?? 0;
  const dest = m.windowSpriteTiles.subarray(state * 0x100);
  const ft = m.frameTiles;
  const copy = (srcTile: number, destTile: number) =>
    dest.set(ft.subarray(srcTile * TILE_SIZE_4BPP, (srcTile + 1) * TILE_SIZE_4BPP), destTile * TILE_SIZE_4BPP);
  if (state === 0) {
    copy(0, 0);
    for (let i = 0; i < 6; i++) copy(1, i + 1);
    copy(2, 7);
    m.tileLoadState = state + 1;
    return true;
  } else if (state === 13) {
    copy(6, 0);
    for (let i = 0; i < 6; i++) copy(7, i + 1);
    copy(8, 7);
    m.tileLoadState = state + 1;
    return false;
  } else if (state >= 14) {
    return false;
  } else {
    copy(3, 0);
    for (let i = 0; i < 6; i++) copy(4, i + 1);
    copy(5, 7);
    m.tileLoadState = state + 1;
    return true;
  }
}

/** 1:1 `void BufferMonMarkingsMenuTiles(void)` (:342). */
export function BufferMonMarkingsMenuTiles(): void {
  BufferMenuWindowTiles();
  while (BufferMenuFrameTiles());
}

/** 1:1 `struct Sprite *CreateMonMarkingComboSprite(tileTag, paletteTag, palette)` (:578) —
 *  sheet d'UNE combinaison (size=1) pour le mon affiché du PC. Renvoie le spriteId (-1 = NULL). */
export function CreateMonMarkingComboSprite(tileTag: number | string, paletteTag: number | string, palette: Uint16Array | null): number {
  return CreateMarkingComboSprite(tileTag, paletteTag, palette, 1);
}

/** 1:1 `static struct Sprite *CreateMarkingComboSprite(tileTag, paletteTag, palette, size)` (:585). */
function CreateMarkingComboSprite(tileTag: number | string, paletteTag: number | string, palette: Uint16Array | null, size: number): number {
  _loadMarkingsGfx();
  const gfx = _markingsGfx ?? new Uint8Array(size * 0x80);       // asset absent → tiles vides (warn loggué)
  const pal = palette ?? _markingsPal ?? new Uint16Array(16);    // sMonMarkings_Pal par défaut
  LoadSpriteSheet({ data: gfx.subarray(0, size * 0x80), size: size * 0x80, tag: tileTag });
  LoadSpritePalette({ data: pal, tag: paletteTag });
  const spriteId = CreateSprite({
    tileTag, paletteTag,
    oam: { shape: 1, size: 1, priority: 0 },  // sOamData_MarkingCombo : SPRITE_SHAPE/SIZE(32x8) — 4 marques EN LIGNE (mon_markings.c:162)
    anims: null, callback: null,
  }, 0, 0, 0);
  return spriteId === 64 /* MAX_SPRITES */ ? -1 : spriteId;
}

/** 1:1 `void UpdateMonMarkingTiles(u8 markings, void *dest)` (:613) — RequestDma3Copy de la
 *  combinaison `markings` vers l'OBJ VRAM du sprite combo (dest = tile start, adaptation). */
export function UpdateMonMarkingTiles(markings: number, dest: unknown): void {
  const rt = getRuntime();
  if (!rt || !_markingsGfx || typeof dest !== 'number') return;
  const src = _markingsGfx.subarray(markings * 0x80, (markings + 1) * 0x80);
  (rt as { _writeToObjVram?: (d: Uint8Array, o: number) => void })._writeToObjVram?.(src, dest * TILE_SIZE_4BPP);
}

// ═══════════════════════════════════════════════════════════════════════════
// MENU INTERACTIF « MARQUER » (mon_markings.c:13-565) — sélection des marques
// ═══════════════════════════════════════════════════════════════════════════

// Constantes (mon_markings.c:13-17).
const ANIM_CURSOR = NUM_MON_MARKINGS * 2;   // 8
const ANIM_TEXT = ANIM_CURSOR + 1;          // 9
const SELECTION_OK = NUM_MON_MARKINGS;      // 4
const SELECTION_CANCEL = SELECTION_OK + 1;  // 5
const SE_SELECT = 5;                        // include/constants/songs.h
const MAX_SPRITES = 64;

// OAM (mon_markings.c:28 sOamData_MenuWindow 64×64 ; :46 sOamData_8x8 8×8).
const sOamData_MenuWindow = { shape: 0 as const, size: 3 as const, priority: 0 };
const sOamData_8x8 = { shape: 0 as const, size: 0 as const, priority: 0 };

// Anims (mon_markings.c:63-153). sAnims_MenuSprite : 8 marques on/off + [ANIM_CURSOR] + [ANIM_TEXT].
const sAnims_MenuSprite: AnimCmd[][] = [
  [ANIMCMD_FRAME(0, 5), ANIMCMD_END],  // Circle Off
  [ANIMCMD_FRAME(1, 5), ANIMCMD_END],  // Circle On
  [ANIMCMD_FRAME(2, 5), ANIMCMD_END],  // Square Off
  [ANIMCMD_FRAME(3, 5), ANIMCMD_END],  // Square On
  [ANIMCMD_FRAME(4, 5), ANIMCMD_END],  // Triangle Off
  [ANIMCMD_FRAME(5, 5), ANIMCMD_END],  // Triangle On
  [ANIMCMD_FRAME(6, 5), ANIMCMD_END],  // Heart Off
  [ANIMCMD_FRAME(7, 5), ANIMCMD_END],  // Heart On
  [ANIMCMD_FRAME(8, 5), ANIMCMD_END],  // [ANIM_CURSOR] = 8
  [ANIMCMD_FRAME(9, 5), ANIMCMD_END],  // [ANIM_TEXT]   = 9
];
const sAnims_MenuWindow: AnimCmd[][] = [
  [ANIMCMD_FRAME(0, 5), ANIMCMD_END],   // UpperHalf
  [ANIMCMD_FRAME(64, 5), ANIMCMD_END],  // LowerHalf
];

// gMonMarkingsMenu_Gfx (0x320) / gMonMarkingsMenu_Pal — asset extrait, chargé async.
let _menuGfx: Uint8Array | null = null;
let _menuPal: Uint16Array | null = null;
let _menuLoadTried = false;
let _menuLoadPromise: Promise<void> | null = null;
function _loadMarkingsMenuGfx(): void {
  if (_menuLoadTried) return;
  _menuLoadTried = true;
  _menuLoadPromise = (async () => {
    const png = await loadIndexedPngStrict('/decomp/em/ui/interface/mon_markings_menu.png', 4);
    _menuGfx = png.charData;
    _menuPal = png.palette;
  })();
  _menuLoadPromise.catch((e) => console.warn('[mon_markings] mon_markings_menu.png absent :', e));
}
/** Précharge (async) le gfx/pal du menu MARQUER. À await AVANT OpenMonMarkingsMenu : le décomp a
 *  gMonMarkingsMenu_Gfx en donnée statique (dispo immédiatement), donc sans ce préchargement la
 *  1re ouverture crée les sprites marques/texte/curseur avec des tiles VIDES (= invisibles). */
export async function EnsureMonMarkingsMenuGfxLoaded(): Promise<void> {
  _loadMarkingsMenuGfx();
  if (_menuLoadPromise) { try { await _menuLoadPromise; } catch { /* warn déjà loggué ci-dessus */ } }
}

function _spr(id: number | undefined) {
  const rt = getRuntime();
  return rt && id !== undefined && id >= 0 && id < MAX_SPRITES ? rt.gSprites[id] : null;
}

/** 1:1 `void OpenMonMarkingsMenu(u8 markings, s16 x, s16 y)` (mon_markings.c:348). */
export function OpenMonMarkingsMenu(markings: number, x: number, y: number): void {
  if (!sMenu) return;
  sMenu.cursorPos = 0;
  sMenu.markings = markings;
  sMenu.markingsArray = sMenu.markingsArray ?? [];
  for (let i = 0; i < NUM_MON_MARKINGS; i++)
    sMenu.markingsArray[i] = ((sMenu.markings >> i) & 1) !== 0;
  CreateMonMarkingsMenuSprites(x, y, sMenu.baseTileTag, sMenu.basePaletteTag);
}

/** 1:1 `void FreeMonMarkingsMenu(void)` (:358). */
export function FreeMonMarkingsMenu(): void {
  if (!sMenu) return;
  for (let i = 0; i < 2; i++) {
    FreeSpriteTilesByTag(sMenu.baseTileTag + i);
    FreeSpritePaletteByTag(sMenu.basePaletteTag + i);
  }
  // DestroySprite prend un ID (adaptation moteur — cf. storage DestroySprite(partySprites[i])).
  const ws = sMenu.windowSprites ?? [];
  for (let i = 0; i < ws.length; i++) {
    if (ws[i] === undefined || ws[i] < 0) return;
    DestroySprite(ws[i]);
    ws[i] = -1;
  }
  const ms = sMenu.markingSprites ?? [];
  for (let i = 0; i < NUM_MON_MARKINGS; i++) {
    if (ms[i] === undefined || ms[i] < 0) return;
    DestroySprite(ms[i]);
    ms[i] = -1;
  }
  if (sMenu.cursorSprite !== undefined && sMenu.cursorSprite >= 0) {
    DestroySprite(sMenu.cursorSprite);
    sMenu.cursorSprite = -1;
  }
  if (sMenu.textSprite !== undefined && sMenu.textSprite >= 0) {
    DestroySprite(sMenu.textSprite);
    sMenu.textSprite = -1;
  }
}

/** 1:1 `bool8 HandleMonMarkingsMenuInput(void)` (:393). Renvoie false = fermer le menu. */
export function HandleMonMarkingsMenuInput(): boolean {
  const m = sMenu; if (!m) return false;
  m.cursorPos = m.cursorPos ?? 0;
  m.markingsArray = m.markingsArray ?? [];

  if (JOY_NEW(DPAD_UP)) {
    PlaySE(SE_SELECT);
    if (--m.cursorPos < 0) m.cursorPos = SELECTION_CANCEL;
    return true;
  }
  if (JOY_NEW(DPAD_DOWN)) {
    PlaySE(SE_SELECT);
    if (++m.cursorPos > SELECTION_CANCEL) m.cursorPos = 0;
    return true;
  }
  if (JOY_NEW(A_BUTTON)) {
    PlaySE(SE_SELECT);
    switch (m.cursorPos) {
      case SELECTION_OK:
        m.markings = 0;
        for (let i = 0; i < NUM_MON_MARKINGS; i++)
          m.markings |= (m.markingsArray[i] ? 1 : 0) << i;
        return false;
      case SELECTION_CANCEL:
        return false;
    }
    m.markingsArray[m.cursorPos] = !m.markingsArray[m.cursorPos];
    return true;
  }
  if (JOY_NEW(B_BUTTON)) {
    PlaySE(SE_SELECT);
    return false;
  }
  return true;
}

/** 1:1 `static void CreateMonMarkingsMenuSprites(s16 x, s16 y, u16 baseTileTag, u16 basePaletteTag)` (:444). */
function CreateMonMarkingsMenuSprites(x: number, y: number, baseTileTag: number, basePaletteTag: number): void {
  const m = sMenu; if (!m) return;
  _loadMarkingsMenuGfx();
  const sheets = [
    { data: m.windowSpriteTiles ?? new Uint8Array(0x1000), size: 0x1000, tag: baseTileTag },
    { data: _menuGfx ?? new Uint8Array(0x320), size: 0x320, tag: baseTileTag + 1 },
  ];
  const palettes = [
    { data: m.framePalette ?? new Uint16Array(16), tag: basePaletteTag },
    { data: _menuPal ?? new Uint16Array(16), tag: basePaletteTag + 1 },
  ];
  LoadSpriteSheets(sheets);
  LoadSpritePalettes(palettes);

  m.windowSprites = m.windowSprites ?? [-1, -1];
  m.markingSprites = m.markingSprites ?? [-1, -1, -1, -1];

  // Create window sprites (haut / bas).
  for (let i = 0; i < m.windowSprites.length; i++) {
    const spriteId = CreateSprite({
      tileTag: baseTileTag, paletteTag: basePaletteTag,
      oam: sOamData_MenuWindow, anims: sAnims_MenuWindow, callback: SpriteCB_Dummy as never,
    }, x + 32, y + 32, 1);
    if (spriteId !== MAX_SPRITES) {
      m.windowSprites[i] = spriteId;
      const spr = _spr(spriteId); if (spr) StartSpriteAnim(spr as never, i);
    } else { m.windowSprites[i] = -1; return; }
  }
  { const spr = _spr(m.windowSprites[1]); if (spr) spr.y = y + 96; }

  // Create marking sprites (les 4 marques cliquables).
  for (let i = 0; i < NUM_MON_MARKINGS; i++) {
    const spriteId = CreateSprite({
      tileTag: baseTileTag + 1, paletteTag: basePaletteTag + 1,
      oam: sOamData_8x8, anims: sAnims_MenuSprite, callback: SpriteCB_Marking as never,
    }, x + 32, y + 16 + 16 * i, 0);
    if (spriteId !== MAX_SPRITES) {
      m.markingSprites[i] = spriteId;
      const spr = _spr(spriteId); if (spr) spr.data[0] = i;   // sMarkingId
    } else { m.markingSprites[i] = -1; return; }
  }

  // Create OK/Cancel text sprite (template 8×8 → redimensionné 32×32).
  {
    const spriteId = CreateSprite({
      tileTag: baseTileTag + 1, paletteTag: basePaletteTag + 1,
      oam: sOamData_8x8, anims: sAnims_MenuSprite, callback: SpriteCallbackDummy as never,
    }, 0, 0, 0);
    if (spriteId !== MAX_SPRITES) {
      m.textSprite = spriteId;
      const spr = _spr(spriteId);
      if (spr) {
        const rt = getRuntime();
        if (rt) { const o = rt.gba.oam[spr.oamIndex]; o.shape = 0; o.size = 2; }  // SPRITE_SHAPE/SIZE(32x32)
        StartSpriteAnim(spr as never, ANIM_TEXT);
        spr.x = x + 32; spr.y = y + 80;
        CalcCenterToCornerVec(spr as never, 1, 2);  // SPRITE_SHAPE(32x16), SPRITE_SIZE(32x16)
      }
    } else { m.textSprite = -1; }
  }

  // Create cursor sprite.
  {
    const spriteId = CreateSprite({
      tileTag: baseTileTag + 1, paletteTag: basePaletteTag + 1,
      oam: sOamData_8x8, anims: sAnims_MenuSprite, callback: SpriteCB_Cursor as never,
    }, x + 12, 0, 0);
    if (spriteId !== MAX_SPRITES) {
      m.cursorSprite = spriteId;
      const spr = _spr(spriteId);
      if (spr) { spr.data[0] = y + 16; StartSpriteAnim(spr as never, ANIM_CURSOR); }  // sCursorYOffset
    } else { m.cursorSprite = -1; }
  }
}

/** 1:1 `static void SpriteCB_Dummy(struct Sprite *sprite)` (:548). */
function SpriteCB_Dummy(_sprite: unknown): void { /* no-op */ }

/** 1:1 `static void SpriteCB_Marking(struct Sprite *sprite)` (:552). */
function SpriteCB_Marking(sprite: { data: number[] }): void {
  if (!sMenu || !sMenu.markingsArray) return;
  const id = sprite.data[0];  // sMarkingId
  if (sMenu.markingsArray[id])
    StartSpriteAnim(sprite as never, 2 * id + 1);  // marking 'on'
  else
    StartSpriteAnim(sprite as never, 2 * id);      // marking 'off'
}

/** 1:1 `static void SpriteCB_Cursor(struct Sprite *sprite)` (:562). */
function SpriteCB_Cursor(sprite: { data: number[]; y: number }): void {
  if (!sMenu) return;
  sprite.y = 16 * (sMenu.cursorPos ?? 0) + sprite.data[0];  // sCursorYOffset
}

export const MON_MARKINGS_COUNT = NUM_MON_MARKINGS;
