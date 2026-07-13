// src/pokenav_resources.ts — 1:1 décomp `src/pokenav.c` : ressources Pokénav (struct + substructs).
//
// Module LEAF (aucun dep lourd) : `gPokenavResources` + le système de SUBSTRUCTS = l'état par écran
// Pokénav. Chaque subscreen fait `AllocSubstruct(POKENAV_SUBSTRUCT_X, size)` au début et
// `GetSubstructPtr(POKENAV_SUBSTRUCT_X)` ensuite pour retrouver SON état (persistant tant que
// l'écran vit). Importé par pokenav.ts (orchestrateur) + les subscreens (qui stubent aujourd'hui
// AllocSubstruct/GetSubstructPtr/FreePokenavSubstruct via __wireTodo = « sentinelles »).
//
// ADAPTATION MOTEUR : la ROM fait `Alloc(size)` (octets bruts) puis caste vers `struct Pokenav_X`.
// Côté web on alloue un OBJET JS que l'écran remplit par champ ; le `size` en octets n'a aucun sens
// et est ignoré. Le reste est 1:1.

/** 1:1 `struct PokenavResources` (pokenav.c:17-25). */
export interface PokenavResources {
  currentMenuCb1: (() => number) | null; // u32 (*currentMenuCb1)(void)
  currentMenuIndex: number;              // u32
  mode: number;                          // u16
  conditionSearchId: number;             // u16
  hasAnyRibbons: boolean;                // bool32
  substructPtrs: (Record<string, unknown> | null)[]; // void *substructPtrs[POKENAV_SUBSTRUCT_COUNT]
}

/** 1:1 fin d'enum `POKENAV_SUBSTRUCT_COUNT` (pokenav.h:93) — 19 substructs (0..18). */
export const POKENAV_SUBSTRUCT_COUNT = 19;

/** 1:1 `EWRAM_DATA struct PokenavResources *gPokenavResources = NULL;` (pokenav.c:207). */
export let gPokenavResources: PokenavResources | null = null;

/** Pose `gPokenavResources` (réassignation d'un `export let` = interdite à l'import → passe par ici).
 *  Appelé par CB2_InitPokeNav (= `gPokenavResources = Alloc(...)`). */
export function _setGPokenavResources(r: PokenavResources | null): void {
  gPokenavResources = r;
}

/** Fabrique un `PokenavResources` neuf (= `Alloc(sizeof(*gPokenavResources))`) ; les champs sont
 *  ensuite finalisés 1:1 par InitPokenavResources (substructPtrs déjà à NULL ici). */
export function newPokenavResources(): PokenavResources {
  return {
    currentMenuCb1: null,
    currentMenuIndex: 0,
    mode: 0,
    conditionSearchId: 0,
    hasAnyRibbons: false,
    substructPtrs: new Array<Record<string, unknown> | null>(POKENAV_SUBSTRUCT_COUNT).fill(null),
  };
}

/** 1:1 décomp `void *AllocSubstruct(u32 index, u32 size)` (pokenav.c:547). `size` = octets côté ROM,
 *  ignoré côté web (on alloue un objet que le subscreen remplit). */
export function AllocSubstruct(index: number, _size: number): Record<string, unknown> {
  const sub: Record<string, unknown> = {};
  gPokenavResources!.substructPtrs[index] = sub;
  return sub;
}

/** 1:1 décomp `void *GetSubstructPtr(u32 index)` (pokenav.c:553). */
export function GetSubstructPtr(index: number): Record<string, unknown> | null {
  return gPokenavResources!.substructPtrs[index];
}

/** 1:1 décomp `void FreePokenavSubstruct(u32 index)` (pokenav.c:558) : `TRY_FREE_AND_SET_NULL`. */
export function FreePokenavSubstruct(index: number): void {
  gPokenavResources!.substructPtrs[index] = null;
}

// 1:1 include/pokenav.h:158,162 — bornes d'items du menu recherche condition (défaut local, à consolider include/).
const POKENAV_MENUITEM_CONDITION_SEARCH_COOL = 8;
const POKENAV_MENUITEM_CONDITION_SEARCH_TOUGH = 12;

/** 1:1 décomp `u32 GetPokenavMode(void)` (pokenav.c:563). */
export function GetPokenavMode(): number {
  return gPokenavResources!.mode;
}

/** 1:1 décomp `void SetPokenavMode(u16 mode)` (pokenav.c:568). */
export function SetPokenavMode(mode: number): void {
  gPokenavResources!.mode = mode;
}

/** 1:1 décomp `void SetSelectedConditionSearch(u32 cursorPos)` (pokenav.c:573). */
export function SetSelectedConditionSearch(cursorPos: number): void {
  let searchId = cursorPos;
  if (searchId > POKENAV_MENUITEM_CONDITION_SEARCH_TOUGH - POKENAV_MENUITEM_CONDITION_SEARCH_COOL)
    searchId = 0;
  gPokenavResources!.conditionSearchId = searchId;
}

/** 1:1 décomp `u32 GetSelectedConditionSearch(void)` (pokenav.c:582). */
export function GetSelectedConditionSearch(): number {
  return gPokenavResources!.conditionSearchId;
}

/** 1:1 décomp `bool32 CanViewRibbonsMenu(void)` (pokenav.c:587). */
export function CanViewRibbonsMenu(): boolean {
  return gPokenavResources!.hasAnyRibbons;
}
