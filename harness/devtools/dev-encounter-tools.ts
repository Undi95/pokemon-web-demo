// ─────────────────────────────────────────────────────────────────────────────
// Outils devtool « rencontres event » (NON 1:1, harness isolé).
//
// Ne TOUCHE PAS au fichier 1:1 `src/wild_encounter.ts` : ces helpers vivent ici, dans
// la couche harness/devtools, et se contentent d'appeler les fonctions du jeu + de poser
// les vars/positions. Deux outils :
//
//  1) Altering Cave — cave à event : sa table de rencontres est choisie par
//     VAR_ALTERING_CAVE_WILD_SET (0..8 ; 1:1 GetCurrentMapWildMonHeaderId). TP + switch de table.
//  2) Feebas (Barpau) — exclusif à 6 cases d'eau de la Route 119 qui CHANGENT avec la tendance
//     de Dewford (`dewfordTrends[0].rand`). On recalcule ces 6 cases (même graine + même
//     numérotation que CheckFeebas / GetFeebasFishingSpotId), puis on TP le joueur sur une case
//     voisine, tourné vers le spot → il n'a plus qu'à pêcher (noclip = peut se poser sur l'eau).
//
// Les petites constantes décomp Feebas sont répliquées localement (mirroir wild_encounter.c,
// avec n° de ligne) — c'est du code harness isolé, comme le reste des devtools.
// ─────────────────────────────────────────────────────────────────────────────

import { ISO_RANDOMIZE2 } from '../../include/random';
import { MAP_OFFSET, MapGridGetMetatileBehaviorAt } from '../../src/fieldmap';
import { MetatileBehavior_IsSurfableAndNotWaterfall } from '../../src/metatile_behavior';
import { VarGet, VarSet } from '../../src/engine/script/script-vars';
import { PlayerFaceDirection, DIR_NORTH, DIR_SOUTH, DIR_EAST, DIR_WEST } from '../../src/field_player_avatar';

// ─── Accès globals live (pattern devtools) ────────────────────────────────────
type GProbe = {
  gMapHeader?: { id?: string; mapLayout?: { width?: number; height?: number } };
  gSaveBlock1Ptr?: { dewfordTrends?: Array<{ rand?: number }>; pos?: { x: number; y: number } };
  __devGotoMap?: (mapId: string, x: number, y: number) => void;
};
function gp(): GProbe { return globalThis as unknown as GProbe; }

/** Attend qu'un prédicat soit vrai (poll rAF), borné par timeout. Résout true/false. */
function waitFor(pred: () => boolean, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = (): void => {
      let ok = false;
      try { ok = pred(); } catch { ok = false; }
      if (ok) { resolve(true); return; }
      if (performance.now() - start > timeoutMs) { resolve(false); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  Altering Cave
// ══════════════════════════════════════════════════════════════════════════════

export const ALTERING_CAVE_MAP = 'MAP_ALTERING_CAVE';
const VAR_ALTERING_CAVE_WILD_SET = 'VAR_ALTERING_CAVE_WILD_SET';
const NUM_ALTERING_CAVE_TABLES = 9;  // include/constants/wild_encounter.h:9

/** Espèce principale de chaque table (chargée depuis wild-encounters.json → alteringCave). */
let _alteringSpecies: string[] = [];

/** Charge (une fois) les espèces des 9 tables depuis le JSON de données (zéro hardcode). */
export async function loadAlteringCaveSpecies(): Promise<string[]> {
  if (_alteringSpecies.length) return _alteringSpecies;
  try {
    const res = await fetch('/decomp/em/wild-encounters.json');
    const data = await res.json() as { alteringCave?: Array<{ land?: { mons?: Array<{ species?: string }> } }> };
    _alteringSpecies = (data.alteringCave ?? []).map(
      (t) => (t.land?.mons?.[0]?.species ?? '?').replace('SPECIES_', ''),
    );
  } catch { _alteringSpecies = []; }
  return _alteringSpecies;
}

export function tpToAlteringCave(): void {
  gp().__devGotoMap?.(ALTERING_CAVE_MAP, 5, 5);
}

export function getAlteringCaveTable(): number {
  return VarGet(VAR_ALTERING_CAVE_WILD_SET) | 0;
}

export function setAlteringCaveTable(n: number): number {
  const id = ((n % NUM_ALTERING_CAVE_TABLES) + NUM_ALTERING_CAVE_TABLES) % NUM_ALTERING_CAVE_TABLES;
  VarSet(VAR_ALTERING_CAVE_WILD_SET, id);
  return id;
}

/** Avance d'une table (boucle 0→8→0). Renvoie la nouvelle table active. */
export function cycleAlteringCaveTable(): number {
  return setAlteringCaveTable(getAlteringCaveTable() + 1);
}

/** Libellé court de la table (n° + espèce), pour le bouton. */
export function alteringCaveLabel(table: number): string {
  const sp = _alteringSpecies[table];
  return sp ? `${table}: ${sp}` : `table ${table}`;
}

// ══════════════════════════════════════════════════════════════════════════════
//  Feebas (Barpau) — Route 119
// ══════════════════════════════════════════════════════════════════════════════

const ROUTE119_MAP = 'MAP_ROUTE119';
// Constantes décomp répliquées (mirroir src/wild_encounter.c — harness isolé).
const NUM_FEEBAS_SPOTS = 6;                                                          // c:29
const NUM_FISHING_SPOTS_1 = 131, NUM_FISHING_SPOTS_2 = 167, NUM_FISHING_SPOTS_3 = 149; // c:33-35
const NUM_FISHING_SPOTS = NUM_FISHING_SPOTS_1 + NUM_FISHING_SPOTS_2 + NUM_FISHING_SPOTS_3; // c:36 (447)
/** {yMin, yMax, nbSpotsAvant} × 3 sections (wild_encounter.c:69). */
const sRoute119WaterTileData: readonly number[] = [
  0, 45, 0,
  46, 91, NUM_FISHING_SPOTS_1,
  92, 139, NUM_FISHING_SPOTS_1 + NUM_FISHING_SPOTS_2,
];

let _feebasRng = 0;
function feebasSeed(seed: number): void { _feebasRng = seed >>> 0; }
function feebasRandom(): number {
  _feebasRng = ISO_RANDOMIZE2(_feebasRng) >>> 0;
  return (_feebasRng >>> 16) & 0xFFFF;
}

/** Les 6 spotId Feebas — même graine Dewford + même quirk (skip 1-3) que CheckFeebas. */
function computeFeebasSpotIds(): number[] {
  feebasSeed(gp().gSaveBlock1Ptr?.dewfordTrends?.[0]?.rand ?? 0);
  const spots: number[] = new Array(NUM_FEEBAS_SPOTS);
  for (let i = 0; i !== NUM_FEEBAS_SPOTS;) {
    spots[i] = feebasRandom() % NUM_FISHING_SPOTS;
    if (spots[i] === 0) spots[i] = NUM_FISHING_SPOTS;
    if (spots[i] < 1 || spots[i] >= 4) i++;
  }
  return spots;
}

/** Les cases (x,y logiques) qui SONT des spots Feebas — numérotation identique à
 *  GetFeebasFishingSpotId (cases surfables-non-cascade, par section, gauche→droite/haut→bas). */
export function findFeebasTiles(): Array<{ x: number; y: number; spotId: number }> {
  const wanted = new Set(computeFeebasSpotIds());
  const width = gp().gMapHeader?.mapLayout?.width ?? 0;
  const out: Array<{ x: number; y: number; spotId: number }> = [];
  for (let section = 0; section < 3; section++) {
    const yMin = sRoute119WaterTileData[section * 3 + 0];
    const yMax = sRoute119WaterTileData[section * 3 + 1];
    let spotId = sRoute119WaterTileData[section * 3 + 2];
    for (let y = yMin; y <= yMax; y++) {
      for (let x = 0; x < width; x++) {
        if (MetatileBehavior_IsSurfableAndNotWaterfall(MapGridGetMetatileBehaviorAt(x + MAP_OFFSET, y + MAP_OFFSET))) {
          spotId++;
          if (wanted.has(spotId)) out.push({ x, y, spotId });
        }
      }
    }
  }
  return out;
}

/** Vrai si la grille Route 119 est chargée (au moins une case surfable en section 0). */
function gridHasWater(): boolean {
  const width = gp().gMapHeader?.mapLayout?.width ?? 0;
  if (!width) return false;
  for (let y = 0; y <= 45; y++)
    for (let x = 0; x < width; x++)
      if (MetatileBehavior_IsSurfableAndNotWaterfall(MapGridGetMetatileBehaviorAt(x + MAP_OFFSET, y + MAP_OFFSET)))
        return true;
  return false;
}

/** Une case voisine (in-bounds) d'un spot + la direction pour REGARDER le spot. */
function neighborFacing(wx: number, wy: number): { x: number; y: number; dir: number; dirName: string } | null {
  const width = gp().gMapHeader?.mapLayout?.width ?? 0;
  const height = gp().gMapHeader?.mapLayout?.height ?? 0;
  const cands = [
    { x: wx, y: wy + 1, dir: DIR_NORTH, dirName: 'Nord' },  // au sud du spot → regarde Nord
    { x: wx, y: wy - 1, dir: DIR_SOUTH, dirName: 'Sud' },
    { x: wx + 1, y: wy, dir: DIR_WEST, dirName: 'Ouest' },
    { x: wx - 1, y: wy, dir: DIR_EAST, dirName: 'Est' },
  ];
  for (const c of cands) {
    if (c.x >= 0 && c.x < width && c.y >= 0 && c.y < height) return c;
  }
  return null;
}

/** TP le joueur sur une case voisine d'un spot Feebas aléatoire, tourné vers le spot.
 *  (Le joueur peut se poser sur l'eau via noclip.) Renvoie un compte-rendu. */
export async function tpToRandomFeebasTile(): Promise<{ ok: boolean; msg: string }> {
  const goto = gp().__devGotoMap;
  if (!goto) return { ok: false, msg: '__devGotoMap indisponible (overworld pas booté ?)' };

  // 1) Être sur la Route 119 (la grille doit être chargée pour scanner les cases d'eau).
  if (gp().gMapHeader?.id !== ROUTE119_MAP) {
    goto(ROUTE119_MAP, 20, 60);
    const loaded = await waitFor(() => gp().gMapHeader?.id === ROUTE119_MAP && gridHasWater(), 5000);
    if (!loaded) return { ok: false, msg: 'Route 119 pas chargée à temps — reclique.' };
  }

  // 2) Calculer les spots + choisir un voisin in-bounds.
  const tiles = findFeebasTiles();
  if (!tiles.length) return { ok: false, msg: 'Aucun spot Feebas calculé (grille pas prête ?) — reclique.' };
  // ordre aléatoire (varie par index, pas de Math.random requis) : rotation depuis un offset Dewford.
  const offset = (gp().gSaveBlock1Ptr?.dewfordTrends?.[0]?.rand ?? 0) % tiles.length;
  for (let k = 0; k < tiles.length; k++) {
    const w = tiles[(k + offset) % tiles.length];
    const stand = neighborFacing(w.x, w.y);
    if (!stand) continue;
    goto(ROUTE119_MAP, stand.x, stand.y);
    const arrived = await waitFor(
      () => gp().gSaveBlock1Ptr?.pos?.x === stand.x && gp().gSaveBlock1Ptr?.pos?.y === stand.y, 3000);
    // Tourner vers le spot (best effort même si l'arrivée n'a pas été détectée à temps).
    try { PlayerFaceDirection(stand.dir); } catch { /* noop */ }
    return {
      ok: true,
      msg: `Spot Barpau (${w.x},${w.y}) — posé en (${stand.x},${stand.y}) face ${stand.dirName}`
        + `${arrived ? '' : ' (arrivée non confirmée)'}. Pêche (canne) ! [${tiles.length} spots ce jour]`,
    };
  }
  return { ok: false, msg: `Spots trouvés (${tiles.length}) mais aucun voisin in-bounds — réessaie.` };
}
