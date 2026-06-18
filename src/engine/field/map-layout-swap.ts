/**
 * map-layout-swap.ts — 1:1 décomp `src/fieldmap.c:SetCurrentMapLayout`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/fieldmap.c:SetCurrentMapLayout`.
 *
 * Concept :
 *   Quand un script appelle `setmaplayoutindex N`, le décomp swappe le layout
 *   courant (= tile data + collision data) sans recharger toute la map.
 *
 *   Usages connus :
 *   - LittlerootTown_ProfessorBirchsLab : swap lab post-starter (= remove
 *     starter pokeball décor)
 *   - Pacifidlog day/night : swap layout selon RTC
 *   - SootopolisCity_Gym_1F après badge 7 : ice cracks → all melted
 *   - ShoalCave low tide / high tide swap
 *   - SkyPillar 1F-4F dust → revealed
 *   - Route 111 desert → desert with car (= Eon Ticket flow)
 *   - Route 130/131 mirage island visibility
 *
 *   1:1 décomp :
 *     void SetCurrentMapLayout(u16 layoutId) {
 *         gMapHeader.mapLayoutId = layoutId;
 *         gMapHeader.mapLayout = GetMapLayout();
 *     }
 *
 *   GetMapLayout() lookup `gMapLayouts[layoutId]` and returns the MapLayout
 *   struct (= tile data + secondary tileset + width/height).
 *
 *   Notre port : le mapping numerical idx → layoutId string n'est pas
 *   directement disponible (= manque data/layouts/layouts.h extraction).
 *   On stocke l'idx demandé sur gPendingMapLayoutIndex et le scene field
 *   peut polluer le re-render au prochain check. Future iteration : full
 *   tile swap + BG re-render.
 */

import { gMapHeader, loadLayout } from '../../game/fieldmap';

/** Tableau idx → layoutId pour Em (= 1:1 data/layouts/layouts.h enum order).
 *  Extraction TODO : générer ce mapping depuis le décomp `include/constants/layouts.h`
 *  via une étape build. Pour l'instant : empty (= future). */
const _LAYOUT_IDX_TO_ID: ReadonlyMap<number, string> = new Map();

/** 1:1 décomp `SetCurrentMapLayout(layoutId)` (fieldmap.c).
 *  Swap le layout courant + trigger BG re-render. */
export async function SetCurrentMapLayout(layoutIdx: number): Promise<void> {
  // Store demand request — field scene poll cette valeur.
  (globalThis as Record<string, unknown>).gPendingMapLayoutIndex = layoutIdx;

  const layoutId = _LAYOUT_IDX_TO_ID.get(layoutIdx);
  if (!layoutId) {
    console.warn(`[map-layout-swap] layoutIdx ${layoutIdx} not in _LAYOUT_IDX_TO_ID — TODO extract from decomp layouts.h`);
    return;
  }

  try {
    const newLayout = await loadLayout(layoutId);
    // 1:1 décomp : update gMapHeader.mapLayout in place. Le scene field
    // detect la changé via gPendingMapLayoutIndex flag et re-render BG.
    (gMapHeader as unknown as { mapLayout: unknown }).mapLayout = newLayout;
    (gMapHeader as unknown as { mapLayoutId: string }).mapLayoutId = layoutId;
    console.log(`[map-layout-swap] swapped to layout '${layoutId}' (idx=${layoutIdx})`);
    // Signal au scene field qu'il faut re-render.
    (globalThis as Record<string, unknown>).gMapLayoutReloadRequested = true;
  } catch (e) {
    console.warn(`[map-layout-swap] failed to load layout '${layoutId}':`, e);
  }
}

// Auto-register sur globalThis pour script-opcode.
(globalThis as { __mapLayoutSwap?: Record<string, unknown> }).__mapLayoutSwap = {
  SetCurrentMapLayout,
};
