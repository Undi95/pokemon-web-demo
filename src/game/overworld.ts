// 1:1 mirror partiel de `src/overworld.c` (pokeemerald) — fonctions de musique de map +
// gating vélo. Créé « en chemin » pour le sous-système vélo (bike.ts) qui les appelle.
//
// ⚠️ Le sous-système de RÉSOLUTION de musique de map (GetCurrLocationDefaultMusic /
// GetCurrentMapMusic / PlayNewMapMusic / FadeOut* = sound.c + tables musique par location)
// n'est PAS encore porté → c'est un chantier séparé. Ici on porte la LOGIQUE d'état 1:1
// (`gSaveBlock1Ptr->savedMusic` bookkeeping) et on ROUTE le playback vers `PlayBGM`
// (= le moteur son, qu'on ne touche pas — no-op silencieux dans notre moteur). Le contrat :
// on porte la logique musique, on ne remplace PAS le moteur son.

import { gSaveBlock1Ptr } from '../engine/save/save-block-state';
import { gMapHeader, type MapConnection } from './fieldmap';
import { PlayBGM } from '../engine/system/decomp-globals';
import { MUS_DUMMY } from '../engine/decomp-data/include/constants/songs-data';
import { FlagGet, FlagClear } from '../engine/script/script-vars';

/** 1:1 décomp `gMaxFlashLevel = ARRAY_COUNT(sFlashLevelToRadius) - 1 = 8`. Const
 *  locale (import statique de script-opcodes-screen-fx ferme un cycle ESM → TDZ). */
const gMaxFlashLevel = 8;

/** 1:1 STRICT décomp `Overworld_MapTypeAllowsTeleportAndFly(u8 mapType)` (overworld.c:1366) :
 *    return (mapType == ROUTE || TOWN || OCEAN_ROUTE || CITY).
 *  `mapType` = STRING dans le port (= json.map_type, ex. "MAP_TYPE_TOWN"). */
export function Overworld_MapTypeAllowsTeleportAndFly(mapType: string | number | undefined): boolean {
  return mapType === 'MAP_TYPE_ROUTE'
      || mapType === 'MAP_TYPE_TOWN'
      || mapType === 'MAP_TYPE_OCEAN_ROUTE'
      || mapType === 'MAP_TYPE_CITY';
}

/** 1:1 STRICT décomp `Overworld_ResetStateAfterTeleport(void)` (overworld.c:partie sup.) :
 *    ResetInitialPlayerAvatarState();
 *    FlagClear(FLAG_SYS_CYCLING_ROAD/CRUISE_MODE/SAFARI_MODE/USE_STRENGTH/USE_FLASH);
 *    RunScriptImmediately(EventScript_ResetMrBriney);
 *  Port : les FlagClear (état de map transitoire). `ResetInitialPlayerAvatarState`
 *  (re-spawn avatar) + `RunScriptImmediately(EventScript_ResetMrBriney)` (reset NPC
 *  bateau M. Brine) = dette mineure (non porté ici). */
export function Overworld_ResetStateAfterTeleport(): void {
  FlagClear('FLAG_SYS_CYCLING_ROAD');
  FlagClear('FLAG_SYS_CRUISE_MODE');
  FlagClear('FLAG_SYS_SAFARI_MODE');
  FlagClear('FLAG_SYS_USE_STRENGTH');
  FlagClear('FLAG_SYS_USE_FLASH');
}

/** 1:1 STRICT décomp `Overworld_ResetStateAfterDigEscRope(void)` (overworld.c) :
 *    ResetInitialPlayerAvatarState();   // dette mineure (re-spawn avatar)
 *    FlagClear(FLAG_SYS_CYCLING_ROAD/CRUISE_MODE/SAFARI_MODE/USE_STRENGTH/USE_FLASH);
 *  (= identique à ResetStateAfterTeleport sans le RunScriptImmediately(ResetMrBriney).) */
export function Overworld_ResetStateAfterDigEscRope(): void {
  FlagClear('FLAG_SYS_CYCLING_ROAD');
  FlagClear('FLAG_SYS_CRUISE_MODE');
  FlagClear('FLAG_SYS_SAFARI_MODE');
  FlagClear('FLAG_SYS_USE_STRENGTH');
  FlagClear('FLAG_SYS_USE_FLASH');
}

/** 1:1 STRICT décomp `SetDefaultFlashLevel(void)` (overworld.c:970) :
 *    if (!gMapHeader.cave)            gSaveBlock1Ptr->flashLevel = 0;          // pleine lumière
 *    else if (FlagGet(FLAG_SYS_USE_FLASH)) gSaveBlock1Ptr->flashLevel = 1;    // grand cercle (Flash utilisé)
 *    else                            gSaveBlock1Ptr->flashLevel = gMaxFlashLevel - 1;  // = 7 (petit cercle, grotte sombre)
 *  Appelé au map load (overworld.c:805, juste avant RunOnTransitionMapScript) →
 *  une grotte (cave = json.requires_flash) sans CS Flash s'affiche en pénombre
 *  (masque circulaire flash-mask.ts). `SetFlashLevel` pose `globalThis.gFlashLevel`
 *  (source du masque) + `_gFlashLevel` (niveau de départ d'`animateflash`). */
export function SetDefaultFlashLevel(): void {
  let level: number;
  if (!gMapHeader || !gMapHeader.cave) level = 0;
  else if (FlagGet('FLAG_SYS_USE_FLASH')) level = 1;
  else level = gMaxFlashLevel - 1;  // = 7
  // SetFlashLevel via globalThis (anti-cycle ESM) — pose globalThis.gFlashLevel
  // (masque) + _gFlashLevel (départ animateflash).
  const setFlash = (globalThis as Record<string, unknown>).__SetFlashLevel as ((l: number) => void) | undefined;
  setFlash?.(level);
}

/** 1:1 décomp `Overworld_SetSavedMusic` (overworld.c:1160) :
 *    gSaveBlock1Ptr->savedMusic = songNum; */
export function Overworld_SetSavedMusic(songNum: number): void {
  gSaveBlock1Ptr.savedMusic = songNum;
}

/** 1:1 décomp `Overworld_ClearSavedMusic` (overworld.c:1165) :
 *    gSaveBlock1Ptr->savedMusic = MUS_DUMMY; */
export function Overworld_ClearSavedMusic(): void {
  gSaveBlock1Ptr.savedMusic = MUS_DUMMY;
}

/** 1:1 décomp `Overworld_PlaySpecialMapMusic` (overworld.c:1142).
 *  Restaure la musique de map (= sortie de vélo / surf). La résolution de la musique
 *  par défaut (GetCurrLocationDefaultMusic) appartient au chantier sound.c non porté ;
 *  on porte la branche `savedMusic` (state réel) et on route vers PlayBGM (moteur son). */
export function Overworld_PlaySpecialMapMusic(): void {
  // GetCurrLocationDefaultMusic() + GetCurrentMapType()/SURFING → chantier sound.c.
  // Branche portable : si une musique sauvegardée est posée, la jouer.
  const music = gSaveBlock1Ptr.savedMusic;
  if (music)
    PlayBGM(music);  // = PlayNewMapMusic(music) → moteur son (no-op dans notre moteur).
}

/** 1:1 décomp `Overworld_ChangeMusicTo` (overworld.c:1200) :
 *    if (currentMusic != newMusic && currentMusic != MUS_ABNORMAL_WEATHER)
 *        FadeOutAndPlayNewMapMusic(newMusic, 8);
 *  Le guard `!= GetCurrentMapMusic()` dépend du tracking de musique courante (chantier
 *  sound.c) ; on route directement le playback vers PlayBGM (moteur son). */
export function Overworld_ChangeMusicTo(newMusic: number): void {
  PlayBGM(newMusic);  // = FadeOutAndPlayNewMapMusic(newMusic, 8) → moteur son (no-op).
}

/** 1:1 décomp `Overworld_IsBikingAllowed` (overworld.c:959) :
 *    if (!gMapHeader.allowCycling) return FALSE; else return TRUE; */
export function Overworld_IsBikingAllowed(): boolean {
  if (!gMapHeader || !gMapHeader.allowCycling)
    return false;
  else
    return true;
}

/** 1:1 STRICT décomp `GetMapConnection(u8 dir)` (overworld.c:740) :
 *    for (i = 0; i < count; i++, connection++)
 *        if (connection->direction == dir) return connection;
 *    return NULL;
 *  Retourne la PREMIÈRE connexion de la map courante dont la direction == dir
 *  (≠ GetMapConnectionAtPos qui filtre par position border, fieldmap.c). Utilisé
 *  par le warp Dive (`SetDiveWarp` cherche la connexion CONNECTION_DIVE/EMERGE). */
export function GetMapConnection(dir: number): MapConnection | null {
  if (!gMapHeader || !gMapHeader.connections) return null;
  for (const connection of gMapHeader.connections) {
    if (connection.direction === dir) return connection;
  }
  return null;
}
