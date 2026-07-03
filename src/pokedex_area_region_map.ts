/**
 * pokedex_area_region_map.ts — miroir 1:1 de `src/pokedex_area_region_map.c` (69 l).
 *
 * Affiche la carte de Hoenn (version 8bpp dédiée au Pokédex) sur le BG du
 * template (BG3, charBase 3, paletteMode 256 couleurs, palette BG 7).
 * Assets : graphics/pokedex/region_map.{png,bin,pal} → public/decomp/em/pokedex/
 * (PNG 8bpp indexé : les pixels référencent les index ABSOLUS 112..159 = palette
 * 7 — vérifié par sonde, cohérent avec le CpuCopy32 vers BG_PLTT_ID(7) du C).
 * Le mode affine (mode != 0) n'est jamais atteint en jeu (le C ne passe que 0).
 *
 * Chargement asynchrone (le C décompresse en VRAM par DMA différé, d'où son
 * TryShowPokedexAreaMap qui poll FreeTempTileDataBuffersIfPossible — notre
 * équivalent exact : poll « assets arrivés »).
 */
import { getRuntime, LoadPalette } from '../harness/runtime/decomp-globals';
import { loadTileBin, loadTilemapBin, loadGbaPal } from '../harness/gba/png-loader';
import { BG_PLTT_ID } from '../harness/runtime/decomp-runtime';
import { ShowBg } from './window';

export interface PokedexAreaMapTemplate {
  bg: number;
  offset: number;
  mode: number;
  unk: number;
}

let sPokedexAreaMapBgNum: number | null = null;
let _gfxReady = false;
let _assets: { tiles: Uint8Array; tilemap: Uint16Array; pal: Uint16Array } | null = null;

/** 1:1 `void LoadPokedexAreaMapGfx(const struct PokedexAreaMapTemplate *template)`
 *  (pokedex_area_region_map.c:17) — mode 0 : BG texte 8bpp. */
export function LoadPokedexAreaMapGfx(template: PokedexAreaMapTemplate): void {
  const rt = getRuntime();
  if (!rt) return;
  const bg = rt.gba.bg(template.bg as 0 | 1 | 2 | 3);
  // SetBgAttribute(bg, BG_ATTR_METRIC, 0) — BG texte (déjà le cas).
  // SetBgAttribute(bg, BG_ATTR_PALETTEMODE, 1) — 8bpp.
  bg.config.paletteMode = 1;
  _gfxReady = false;
  void (async () => {
    const [tiles, tilemap, pal] = await Promise.all([
      loadTileBin('/decomp/em/pokedex/region_map.png', 8),
      loadTilemapBin('/decomp/em/pokedex/region_map.bin'),
      loadGbaPal('/decomp/em/pokedex/region_map.pal'),
    ]);
    _assets = { tiles, tilemap, pal };
    // DecompressAndCopyTileDataToVram(bg, gfx) → tiles 8bpp au charBase du BG.
    rt.gba.vram.set(tiles, (bg.config.charBaseIndex & 3) * 0x4000);
    // ... (tilemap, mode 1) → buffer tilemap du BG (AddValToTilemapBuffer offset 0 = no-op).
    bg.tilemap.set(tilemap.subarray(0, bg.tilemap.length));
    // CpuCopy32(sPokedexAreaMap_Pal, &gPlttBufferUnfaded[BG_PLTT_ID(7)]) — 48 couleurs.
    LoadPalette(pal, BG_PLTT_ID(7), pal.length * 2);
    _gfxReady = true;
  })();
  // ChangeBgX/Y(bg, 0, SET).
  rt.SetGpuReg(0x1c /* BG3HOFS — template.bg=3 en pratique */, 0);
  rt.SetGpuReg(0x1e /* BG3VOFS */, 0);
  sPokedexAreaMapBgNum = template.bg;
}

/** 1:1 `bool32 TryShowPokedexAreaMap(void)` (pokedex_area_region_map.c:49) :
 *  TRUE = encore en chargement (le caller re-tick), FALSE = affiché. */
export function TryShowPokedexAreaMap(): boolean {
  if (!_gfxReady) return true;
  if (sPokedexAreaMapBgNum !== null) ShowBg(sPokedexAreaMapBgNum);
  return false;
}

/** 1:1 `void FreePokedexAreaMapBgNum(void)`. */
export function FreePokedexAreaMapBgNum(): void {
  sPokedexAreaMapBgNum = null;
  _assets = null;
  _gfxReady = false;
}

/** 1:1 `void PokedexAreaMapChangeBgY(u32 move)` : ChangeBgY(bg, move*0x100, SET)
 *  = VOFS du BG en pixels (Q8 → px). */
export function PokedexAreaMapChangeBgY(move: number): void {
  const rt = getRuntime();
  if (!rt || sPokedexAreaMapBgNum === null) return;
  const VOFS_BY_BG = [0x12, 0x16, 0x1a, 0x1e];
  rt.SetGpuReg(VOFS_BY_BG[sPokedexAreaMapBgNum], move & 0xffff);
}
