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

import { getRuntime } from '../harness/runtime/decomp-globals';
import { LoadSpriteSheet, LoadSpritePalette, CreateSprite } from './sprite';
import { GetWindowFrameTilesPal } from './text_window';
import { loadIndexedPngStrict } from '../harness/gba/png-loader';

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

export const MON_MARKINGS_COUNT = NUM_MON_MARKINGS;
