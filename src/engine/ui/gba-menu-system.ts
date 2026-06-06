/**
 * gba-menu-system.ts
 * ------------------
 * Helpers menu GENERIQUES + persistence saveBlock. Tout ce qui est
 * spécifique main_menu.c vit dans `main-menu-impl.ts` (= split Phase C
 * audit session 83 pour respecter directive #1 "foundations unifiées").
 *
 * Architecture :
 *   - Constantes input keys (A_BUTTON, B_BUTTON, DPAD_*) — partagées
 *   - Menu cursor input générique (Menu_ProcessInputNoWrapClearOnChoose,
 *     Menu_GetCursorPos, InitMenuInUpperLeftCornerNormal)
 *   - Yes/No menu stubs (CreateYesNoMenuParameterized, CreateYesNoMenu)
 *   - Misc generic stubs (IsWirelessAdapterConnected, IsMysteryGiftEnabled,
 *     CanResetRTC, RtcGetErrorStatus, PlayBGM bridge)
 *   - gSaveBlock1Ptr / gSaveBlock2Ptr Proxy auto-persistant localStorage
 *   - gSaveFileStatus mutable global
 */
import { m4aSongNumStart, LoadPalette } from '../system/decomp-globals';
import { PLTT_SIZE_4BPP } from '../system/decomp-bridge';
// Miroir 1:1 `event_data.ts` — délégation (source unique flags/vars number[]).
import { IsMysteryGiftEnabled as _MirrorIsMysteryGiftEnabled, CanResetRTC as _MirrorCanResetRTC } from '../../game/include/event_data';
// ─── Hub : système Menu (curseur) + YesNo RELOCALISÉS dans le miroir `src/game/menu.ts`
//     (menu.c). Ré-exportés ici pour les importeurs existants (starter-choose,
//     script-opcodes*, start-menu…). La version simplifiée `menuCursorPos`/`menuNumItems`
//     (cursor char, sans `sMenu`/wrap/APressMuted) est remplacée par le 1:1 `sMenu`.
export {
  InitMenuNormal, InitMenuInUpperLeftCorner, InitMenuInUpperLeftCornerNormal,
  RedrawMenuCursor, Menu_MoveCursor, Menu_MoveCursorNoWrapAround, Menu_GetCursorPos,
  Menu_ProcessInput, Menu_ProcessInputNoWrap, Menu_ProcessInputNoWrapClearOnChoose,
  ProcessMenuInput_other, Menu_ProcessInputNoWrapAround_other,
  CreateYesNoMenu, DisplayYesNoMenuDefaultYes, DisplayYesNoMenuWithDefault,
  EraseYesNoWindow, GetYesNoWindowId,
} from '../../game/menu';

/** 1:1 décomp `ListMenuLoadStdPalAt` (menu.c:2077) : palId → gMenuInfo
 *  Elements{1,2,3}_Pal → LoadPalette(pal, palOffset, PLTT_SIZE_4BPP).
 *  Les symboles sont résolus via assetCache (LoadPalette(string)) — le
 *  consommateur précharge les .pal (interface/menu_info{1,2,3}.pal,
 *  copies décomp byte-identiques). Fonction PARTAGÉE menu.c (bag, union
 *  room…) → sa maison = ici (≠ bag-menu local). */
export function ListMenuLoadStdPalAt(palOffset: number, palId: number): void {
  let palette: string;
  switch (palId) {
    case 0:
    default:
      palette = 'gMenuInfoElements1_Pal';
      break;
    case 1:
      palette = 'gMenuInfoElements2_Pal';
      break;
    case 2:
      palette = 'gMenuInfoElements3_Pal';
      break;
  }
  LoadPalette(palette, palOffset, PLTT_SIZE_4BPP);
}

// ─── Input keys (= shared with main-menu-impl.ts) ────────────────────────────

export const A_BUTTON = 0x01;
export const B_BUTTON = 0x02;
export const DPAD_UP = 0x40;
export const DPAD_DOWN = 0x80;

// (Système Menu curseur + YesNo RELOCALISÉS dans `src/game/menu.ts`, ré-exportés
//  via le hub en tête de fichier.)

// ─── Misc generic stubs ──────────────────────────────────────────────────────

/** 1:1 décomp src/link.c IsWirelessAdapterConnected. Notre engine web : pas
 *  de wireless adapter (= toujours false). Utilisé par main_menu.c pour les
 *  Mystery Gift / Mystery Events checks. */
export function IsWirelessAdapterConnected(): boolean {
  return false;
}

/** 1:1 décomp `IsMysteryGiftEnabled` — délègue au miroir `event_data.ts`
 *  (FlagGet(FLAG_SYS_MYSTERY_GIFT_ENABLE)). Avant : stub `return false`. */
export function IsMysteryGiftEnabled(): boolean {
  return _MirrorIsMysteryGiftEnabled();
}

/** 1:1 décomp `CanResetRTC` — délègue au miroir `event_data.ts`. Avant : stub. */
export function CanResetRTC(): boolean {
  return _MirrorCanResetRTC();
}

export function RtcGetErrorStatus(): number {
  return 0;
}

/** 1:1 décomp `sound.c PlayBGM(songNum)` — bridge vers m4aSongNumStart avec loop=true.
 *  Utilisé par Birch (MUS_ROUTE122) et autres scenes. Skip si MUS_NONE (= 0xFFFF)
 *  ou 0 pour éviter spam warnings sur les maps sans music (= MAP_INSIDE_OF_TRUCK). */
export function PlayBGM(songNum: number): void {
  if (songNum === 0xFFFF || songNum === 0) return;
  m4aSongNumStart(songNum, true);  // BGM = loop
}

// ─── Save block + persistence (= localStorage proxy) ─────────────────────────
//
// 1:1 décomp : gSaveBlock2Ptr est un struct EWRAM qui contient les options
// joueur (textSpeed, sound, frame style…) + identité player (gender, name).
// Décomp persiste via flash mem sur GBA. Notre engine : localStorage.
//
// Mécanique : `_saveBlock2Storage` est l'objet runtime. `gSaveBlock2Ptr` est
// un Proxy qui auto-persist toute écriture vers localStorage. Charge depuis
// localStorage au boot (= options préservées au refresh).

// Bug fix session 122 : auparavant `gSaveBlock2Ptr` avait sa propre store
// localStorage `pokemon-web-demo:saveBlock2` séparée du save-system. Résultat :
// MainMenu Options écrivait dans gSaveBlock2Ptr → l'overworld lisait depuis
// GetSaveBlock2() (save-system) → options non partagées.
//
// 1:1 décomp : il n'y a qu'UN SEUL gSaveBlock2Ptr (= &gSaveblock2.block en
// EWRAM). On l'aligne en faisant le Proxy delegate vers `GetSaveBlock2()`
// du save-system. Toute écriture mute le SaveBlock2 partagé en mémoire.
//
// Persistance : le save-system écrit le slot complet quand TrySavingData()
// est appelé (= via SAUVER menu). Pour les options, on persiste aussi en
// auto à chaque écriture (= 1:1 décomp comportement attendu : les options
// changent dans le menu Options sont préservées même sans save explicit).
//
// Pas de cycle d'import : save-system ne dépend PAS de gba-menu-system
// (vérifié via grep). On peut donc importer GetSaveBlock2 statiquement.
import { GetSaveBlock2 as _GetSaveBlock2, GetSaveBlock1 as _GetSaveBlock1 } from '../save/save-system';

const LEGACY_SAVEBLOCK2_LSKEY = 'pokemon-web-demo:saveBlock2';

/** Migrate legacy `pokemon-web-demo:saveBlock2` localStorage → save-system SaveBlock2.
 *  Une seule fois au boot. Préserve les options déjà set dans MainMenu legacy. */
function _migrateLegacySaveBlock2(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(LEGACY_SAVEBLOCK2_LSKEY);
    if (!raw) return;
    const legacy = JSON.parse(raw) as Record<string, unknown>;
    const sb2 = _GetSaveBlock2() as unknown as Record<string, unknown>;
    // Migrer les options + identité player (= seules valeurs intéressantes).
    const fields = [
      'optionsTextSpeed', 'optionsBattleSceneOff', 'optionsBattleStyle',
      'optionsSound', 'optionsButtonMode', 'optionsWindowFrameType',
      'playerName', 'playerGender',
    ];
    let migrated = false;
    for (const k of fields) {
      if (legacy[k] !== undefined && sb2[k] !== legacy[k]) {
        sb2[k] = legacy[k];
        migrated = true;
      }
    }
    if (migrated) {
      // 1:1 décomp : la migration mute le SaveBlock2 RAM uniquement. Pas
      // d'écriture SRAM auto — l'utilisateur sauvegarde explicitement via
      // START → SAUVER. Avant : on appelait _TrySavingData() si HasValidSave
      // → save automatique random non-1:1, retiré.
      console.log('[gSaveBlock2Ptr] migrated legacy localStorage options → SaveBlock2 RAM (no auto-save)');
    }
    localStorage.removeItem(LEGACY_SAVEBLOCK2_LSKEY);
  } catch (e) {
    console.warn('[gSaveBlock2Ptr] legacy migration failed:', e);
  }
}
_migrateLegacySaveBlock2();

/** 1:1 décomp `gSaveBlock1Ptr` / `gSaveBlock2Ptr` (= pointers vers EWRAM,
 *  global.h:990). Définition déplacée dans `save-block-state.ts` (= module
 *  Foundation qui permet l'import direct depuis n'importe quel module du port
 *  sans cycle ESM). Re-export ici pour préserver les call-sites existants
 *  qui font `import { gSaveBlock1Ptr } from './gba-menu-system'`. */
import { gSaveBlock1Ptr as _gSaveBlock1PtrFoundation, gSaveBlock2Ptr as _gSaveBlock2PtrFoundation } from '../save/save-block-state';
export const gSaveBlock1Ptr = _gSaveBlock1PtrFoundation;
export const gSaveBlock2Ptr = _gSaveBlock2PtrFoundation;

export let gSaveFileStatus = 0; // SAVE_STATUS_EMPTY

export function SetSaveFileStatus(status: number): void {
  gSaveFileStatus = status;
  console.log(`[gba-menu-system] SetSaveFileStatus(${status}) → gSaveFileStatus=${gSaveFileStatus}`);
}

// ─── Options helpers (= 1:1 décomp text.c + sound.c + main.c key remap) ────
//
// Décomp pattern : les call sites lisent gSaveBlock2Ptr.options* + appliquent
// au système concerné. Notre engine fait pareil via les helpers ci-dessous,
// utilisés par le text printer / audio engine / key handler runtime.

/** OPTIONS_TEXT_SPEED_* enum (= include/constants/options.h). */
export const OPTIONS_TEXT_SPEED_SLOW = 0;
export const OPTIONS_TEXT_SPEED_MID  = 1;
export const OPTIONS_TEXT_SPEED_FAST = 2;

/** OPTIONS_SOUND_* (= 0=MONO, 1=STEREO). */
export const OPTIONS_SOUND_MONO   = 0;
export const OPTIONS_SOUND_STEREO = 1;

/** OPTIONS_BUTTON_MODE_* (= 0=NORMAL, 1=LR, 2=L_EQUALS_A). */
export const OPTIONS_BUTTON_MODE_NORMAL    = 0;
export const OPTIONS_BUTTON_MODE_LR        = 1;
export const OPTIONS_BUTTON_MODE_L_EQUALS_A = 2;

// GetPlayerTextSpeed / GetPlayerTextSpeedDelay : RELOCALISÉS dans le miroir
// `src/game/menu.ts` (1:1 menu.c:474/481, foyer décomp unique). Import = binding
// local (pour l'expose global ci-dessous) + re-export pour les consommateurs.
import { GetPlayerTextSpeed, GetPlayerTextSpeedDelay } from '../../game/menu';
export { GetPlayerTextSpeed, GetPlayerTextSpeedDelay };

/** Audio pan adjustment — applied par M4A engine quand `optionsSound` lu.
 *  MONO : tous channels mixed centered. STEREO : pan respecté.
 *  Returns true si stereo (= apply pan), false si mono (= centered). */
export function IsStereoSound(): boolean {
  return ((gSaveBlock2Ptr.optionsSound ?? OPTIONS_SOUND_MONO) | 0) === OPTIONS_SOUND_STEREO;
}

/** 1:1 décomp `SetPokemonCryStereo(u32 val)` (= sound.c). Toggle live l'audio
 *  mode (= MONO/STEREO) sans attendre le sauvegarde Task_OptionMenuSave. Le
 *  m4a engine lit ce flag à chaque PlayCry/PlayBGM pour appliquer le pan.
 *
 *  Notre version : sync immédiate sur gSaveBlock2Ptr.optionsSound + notify
 *  l'audio engine. Le m4a engine lit `gSaveBlock2Ptr.optionsSound` à chaque
 *  note via `IsStereoSound()` — équivalent fonctionnel décomp. */
export function SetPokemonCryStereo(selection: number): void {
  // 1:1 décomp : SetSoundOutputMode + RestoreNoteStereo. Notre m4a engine
  // simplifié : update le flag dans gSaveBlock2Ptr, le prochain note lookup
  // utilisera la nouvelle valeur.
  gSaveBlock2Ptr.optionsSound = selection | 0;
}

/** 1:1 décomp helpers OPTIONS_BATTLE_SCENE_* / OPTIONS_BATTLE_STYLE_* — read
 *  les options pour gating battle behavior. Le battle code lit ces helpers
 *  à `SetUpFightOptions` / `OpponentSwitchInResetSentPokesToOpponentValue`
 *  pour skip animations / show switch prompt. */
export const OPTIONS_BATTLE_SCENE_ON  = 0;
export const OPTIONS_BATTLE_SCENE_OFF = 1;
export const OPTIONS_BATTLE_STYLE_SHIFT = 0;
export const OPTIONS_BATTLE_STYLE_SET   = 1;

/** Returns true si battle animations doivent être SKIPPED (= optionsBattleSceneOff
 *  set par user dans option menu → set `gHitMarker |= HITMARKER_NO_ANIMATIONS`
 *  dans battle init, cf. battle_main.c).
 *
 *  **OVERRIDE TEMPORAIRE (user 2026-05-26)** : tant que la cascade visuelle K1
 *  (= battle_anim_*.c per-move 50k+ lignes) n'est pas portée, force le retour
 *  TRUE peu importe l'option user. Le menu Options affiche "OUI" sans effet,
 *  l'engine se comporte comme "NON" (= skip toutes les anims, shake placeholder
 *  uniquement). À retirer quand K1 cascade portée + A/B validation. */
export function IsBattleSceneOff(): boolean {
  // Override : toujours OFF en attendant K1 cascade visuelle complète.
  return true;
  // 1:1 décomp original (= activé quand K1 cascade portée) :
  // return ((gSaveBlock2Ptr.optionsBattleSceneOff ?? OPTIONS_BATTLE_SCENE_ON) | 0) === OPTIONS_BATTLE_SCENE_OFF;
}

/** Returns true si les ANIMATIONS DE HIT (sprite blink + healthbox jiggle quand
 *  un mon prend des dégâts) doivent être SKIPPÉES. C'est la VRAIE option user
 *  `optionsBattleSceneOff` (1:1 décomp : `HITMARKER_NO_ANIMATIONS` est posé
 *  depuis cette option, et `Cmd_hitanimation` skip l'anim si le marker est set).
 *
 *  Découplé de `IsBattleSceneOff()` ci-dessus qui, lui, reste forcé TRUE pour
 *  masquer les MOVE animations (cascade K1 `battle_anim_*.c` non portée). Le hit
 *  blink, lui, EST porté 1:1 (`DoHitAnimBlinkSpriteEffect`) → on le pilote par la
 *  vraie option : scène ON (défaut 0) → blink joué ; scène OFF → skip. À fusionner
 *  avec `IsBattleSceneOff()` quand la cascade K1 sera portée + l'override retiré. */
export function IsHitAnimDisabled(): boolean {
  return ((gSaveBlock2Ptr.optionsBattleSceneOff ?? OPTIONS_BATTLE_SCENE_ON) | 0) === OPTIONS_BATTLE_SCENE_OFF;
}

/** Returns le battle style courant : 0 = SHIFT (= ask user before switch
 *  pokemon when enemy faints), 1 = SET (= no prompt). Future-proof : utilisé
 *  par battle-flow au moment du switch après KO ennemi. */
export function GetBattleStyle(): number {
  return ((gSaveBlock2Ptr.optionsBattleStyle ?? OPTIONS_BATTLE_STYLE_SHIFT) | 0) & 1;
}

/** Bridge globalThis pour les auto-callbacks (= eval scope @ts-nocheck). */
(globalThis as Record<string, unknown>).GetPlayerTextSpeed = GetPlayerTextSpeed;
(globalThis as Record<string, unknown>).GetPlayerTextSpeedDelay = GetPlayerTextSpeedDelay;
(globalThis as Record<string, unknown>).IsStereoSound = IsStereoSound;
(globalThis as Record<string, unknown>).SetPokemonCryStereo = SetPokemonCryStereo;
(globalThis as Record<string, unknown>).IsBattleSceneOff = IsBattleSceneOff;
(globalThis as Record<string, unknown>).IsHitAnimDisabled = IsHitAnimDisabled;
(globalThis as Record<string, unknown>).GetBattleStyle = GetBattleStyle;

// Synchronise gSaveFileStatus mutable export sur globalThis pour les
// callbacks auto-générés (= eval scope @ts-nocheck).
if (!('gSaveFileStatus' in globalThis)) {
  Object.defineProperty(globalThis, 'gSaveFileStatus', {
    get: () => gSaveFileStatus,
    set: (v) => { gSaveFileStatus = v as number; },
    enumerable: true,
    configurable: true,
  });
}
