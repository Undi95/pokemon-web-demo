/**
 * fly-field-move.ts — CS/move Vol (Fly). GLU MAISON (pas un miroir décomp).
 *
 * ⚠️ PAS DE `fldeff_fly.c` dans le décomp : ce fichier est de la glu maison qui AMALGAME +
 * SIMPLIFIE la chaîne Fly répartie sur 2 fichiers décomp (region_map.c CB2_OpenFlyMap +
 * field_effect.c ReturnToFieldFromFlyMapSelect). Il reste donc en `engine/` (non-1:1) tant que
 * la vraie chaîne n'est pas portée ligne-à-ligne dans `game/region_map.ts` + `game/field_effect.ts`.
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/region_map.c (CB2_OpenFlyMap +
 * sMapHealLocations) + field_effect.c:1339 (ReturnToFieldFromFlyMapSelect).
 *
 * Flux 1:1 : party menu → Vol → `SetUpFieldMove_Fly` (check map type) → fermeture menu →
 * retour-field → `FieldCallback_Fly` ouvre la CARTE RÉGION en mode FLY (region-map.ts) +
 * enregistre le callback de warp. Le joueur déplace le curseur sur une VILLE VISITÉE puis A →
 * `CloseRegionMap(true)` → `_flyWarp(mapSec)` → warp vers la destination Vol de la ville.
 *
 * ⚠️ CŒUR WARP simplifié (comme Téléport, décision user) : le spin-out/in 1:1
 * (`Task_FlyOut`/`Task_FlyIn`, le perso s'élève en tournoyant) = FOLLOW-UP (manip sprite M3).
 * Ici un FADE_TO_BLACK + warp (= ReturnToFieldFromFlyMapSelect net-effect).
 *
 * ⚠️ RESTE (refinement) : restreindre le CURSEUR aux villes CANFLY (region_map.c GetMapsecType).
 * Pour l'instant le warp est GATÉ sur FLAG_VISITED_X (pas de warp si non visitée), mais le
 * curseur peut se poser n'importe où (le préfixe le confirme → no-op si non visitée).
 */

import { setPendingWarp } from './warp-system';
import { GetHealLocationByName } from '../../heal_location';
import { FadeScreen, FADE_TO_BLACK } from '../system/fade-screen';
import { FlagGet } from '../script/script-vars';

/** 1:1 décomp `sMapHealLocations[]` (region_map.c:289) — mapsec → HEAL_LOCATION_* (destination
 *  Vol de chaque ville). Les 16 villes Fly-ables ; les routes = HEAL_LOCATION_NONE (non listées). */
const sMapHealLocations: Readonly<Record<string, string>> = {
  MAPSEC_LITTLEROOT_TOWN: 'HEAL_LOCATION_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F',
  MAPSEC_OLDALE_TOWN: 'HEAL_LOCATION_OLDALE_TOWN',
  MAPSEC_DEWFORD_TOWN: 'HEAL_LOCATION_DEWFORD_TOWN',
  MAPSEC_LAVARIDGE_TOWN: 'HEAL_LOCATION_LAVARIDGE_TOWN',
  MAPSEC_FALLARBOR_TOWN: 'HEAL_LOCATION_FALLARBOR_TOWN',
  MAPSEC_VERDANTURF_TOWN: 'HEAL_LOCATION_VERDANTURF_TOWN',
  MAPSEC_PACIFIDLOG_TOWN: 'HEAL_LOCATION_PACIFIDLOG_TOWN',
  MAPSEC_PETALBURG_CITY: 'HEAL_LOCATION_PETALBURG_CITY',
  MAPSEC_SLATEPORT_CITY: 'HEAL_LOCATION_SLATEPORT_CITY',
  MAPSEC_MAUVILLE_CITY: 'HEAL_LOCATION_MAUVILLE_CITY',
  MAPSEC_RUSTBORO_CITY: 'HEAL_LOCATION_RUSTBORO_CITY',
  MAPSEC_FORTREE_CITY: 'HEAL_LOCATION_FORTREE_CITY',
  MAPSEC_LILYCOVE_CITY: 'HEAL_LOCATION_LILYCOVE_CITY',
  MAPSEC_MOSSDEEP_CITY: 'HEAL_LOCATION_MOSSDEEP_CITY',
  MAPSEC_SOOTOPOLIS_CITY: 'HEAL_LOCATION_SOOTOPOLIS_CITY',
  MAPSEC_EVER_GRANDE_CITY: 'HEAL_LOCATION_EVER_GRANDE_CITY',
};

/** mapsec → FLAG_VISITED_* (= 1:1 GetMapsecType : FlagGet(FLAG_VISITED_X) → CITY_CANFLY). */
function _visitedFlagForMapSec(mapSec: string): string {
  return `FLAG_VISITED_${mapSec.replace(/^MAPSEC_/, '')}`;
}

/** ≈ décomp `ReturnToFieldFromFlyMapSelect` (field_effect.c:1339) net-effect : warp vers la
 *  destination Vol de la ville sélectionnée. Enregistré comme `_flyCallback` de la carte région. */
function _flyWarp(mapSec: string): void {
  const healId = sMapHealLocations[mapSec];
  if (!healId) {
    console.log(`[fly] ${mapSec} non Fly-able (route/lieu sans destination) — annulé`);
    return;
  }
  // 1:1 GetMapsecType : seulement si la ville est VISITÉE (CITY_CANFLY).
  if (!FlagGet(_visitedFlagForMapSec(mapSec))) {
    console.log(`[fly] ${mapSec} pas encore visitée (CANTFLY) — annulé`);
    return;
  }
  const heal = GetHealLocationByName(healId);
  if (!heal) {
    console.warn(`[fly] heal location non résolue: ${healId}`);
    return;
  }
  // ≈ WarpFadeOutScreen (FADE_TO_BLACK) puis warp (le spin Fly 1:1 = follow-up).
  FadeScreen(FADE_TO_BLACK, 0);
  setPendingWarp({ destMap: heal.map, x: heal.x, y: heal.y, elevation: 0, warpId: -1 }, 'step');
  console.log(`[fly] warp → ${heal.map} (${heal.x},${heal.y})`);
}

/** ≈ décomp `CB2_OpenFlyMap` (region_map.c) : ouvre la carte région en mode FLY + enregistre le
 *  callback de warp. Posé comme `gPostMenuFieldCallback` par `SetUpFieldMove_Fly` (party menu) →
 *  s'exécute au retour-field après fermeture du menu. */
export function FieldCallback_Fly(): void {
  // import LAZY de region-map (anti-cycle ESM TDZ : l'import STATIQUE tire tout le gros graphe
  // field → gba-global-scope.BG_SCREEN_SIZE avant son init = crash boot. Piège déjà payé sur
  // fishing/bag-menu → import dynamique au runtime quand le module léger appelle le gros).
  void import('./region-map').then(({ OpenRegionMap, SetFlyMapCallback }) => {
    SetFlyMapCallback(_flyWarp);
    void OpenRegionMap('FLY');
  });
}

// Exposé pour party-screen (SetUpFieldMove_Fly) sans import statique (anti-cycle ESM, comme Téléport).
(globalThis as Record<string, unknown>).__FieldCallback_Fly = FieldCallback_Fly;
