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
import { gMapHeader } from '../engine/field/map-loader';
import { PlayBGM } from '../engine/system/decomp-globals';
import { MUS_DUMMY } from '../engine/decomp-data/include/constants/songs-data';

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
