// 1:1 mirror partiel de `src/overworld.c` (pokeemerald) — fonctions de musique de map +
// gating vélo. Créé « en chemin » pour le sous-système vélo (bike.ts) qui les appelle.
//
// ⚠️ Le sous-système de RÉSOLUTION de musique de map (GetCurrLocationDefaultMusic /
// GetCurrentMapMusic / PlayNewMapMusic / FadeOut* = sound.c + tables musique par location)
// n'est PAS encore porté → c'est un chantier séparé. Ici on porte la LOGIQUE d'état 1:1
// (`gSaveBlock1Ptr->savedMusic` bookkeeping) et on ROUTE le playback vers `PlayBGM`
// (= le moteur son, qu'on ne touche pas — no-op silencieux dans notre moteur). Le contrat :
// on porte la logique musique, on ne remplace PAS le moteur son.

import { SetGpuReg } from './gpu_regs';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { gMapHeader, type MapConnection } from './fieldmap';
import {
  PlayBGM, getRuntime, LoadOam, gMain, ResetTasks, ResetPaletteFade, FillPalBufferBlack,
  WININ_WIN0_BG_ALL, WININ_WIN0_OBJ, WININ_WIN1_BG_ALL, WININ_WIN1_OBJ,
  WINOUT_WIN01_BG0, WINOUT_WINOBJ_BG0, BLDALPHA_BLEND,
} from '../harness/runtime/decomp-globals';
import {
  REG_OFFSET_DISPCNT, REG_OFFSET_MOSAIC, REG_OFFSET_WININ, REG_OFFSET_WINOUT,
  REG_OFFSET_WIN0H, REG_OFFSET_WIN0V, REG_OFFSET_WIN1H, REG_OFFSET_WIN1V,
  REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA,
  BLDCNT_TGT2_BG0, BLDCNT_TGT2_BG1, BLDCNT_TGT2_BG2, BLDCNT_TGT2_BG3,
  BLDCNT_TGT2_OBJ, BLDCNT_EFFECT_BLEND,
} from '../harness/runtime/decomp-runtime';

import {
  DISPCNT_OBJ_ON, DISPCNT_WIN0_ON, DISPCNT_WIN1_ON,
  DISPCNT_OBJ_1D_MAP, DISPCNT_HBLANK_INTERVAL,
} from '../include/gba/io_reg';
import {
  ShowBg, ChangeBgX, ChangeBgY, ScheduleBgCopyTilemapToVram,
  ClearScheduledBgCopiesToVram, ResetTempTileDataBuffers,
} from './window';
import { ScanlineEffect_Stop } from './scanline_effect';
import { ResetOamRange, ResetSpriteData } from './sprite';
import { InitFieldMessageBox } from './field_message_box';
import { FadeScreen, FADE_FROM_BLACK } from './field_weather';
import { MUS_DUMMY } from '../include/constants/songs';
import { FlagGet, FlagClear, VarGet, VarSet } from './engine/script/script-vars';

/** 1:1 décomp `enum { BG_COORD_SET, BG_COORD_ADD }` (bg.h:26) → BG_COORD_SET = 0.
 *  Const locale (pas d'enum bg.h porté côté valeur). */
const BG_COORD_SET = 0;

/** 1:1 décomp `gMaxFlashLevel = ARRAY_COUNT(sFlashLevelToRadius) - 1 = 8`. Const
 *  locale (import statique de script-opcodes-screen-fx ferme un cycle ESM → TDZ). */
const gMaxFlashLevel = 8;

// ─── Map header lookup (1:1 décomp `src/overworld.c:579`) ─────────────────────
//
// Décyclé du bridge (foyer 1:1 = overworld.c). Notre map data est async (fetch
// JSON) alors que la fn décomp est sync (`return gMapGroups[mapGroup][mapNum];`).
// Stopgap port : on lit un registre peuplé par `defineMapHeaderEntry`, sinon on
// retourne un header structurellement vide pour éviter le crash. NOTE : à ce jour
// `defineMapHeaderEntry` n'a aucun appelant → le getter retourne toujours le
// fallback (les consommateurs de mapType routent sur `gMapHeader.mapType`).
const _mapHeaderRegistry = new Map<string, any>();
export function defineMapHeaderEntry(key: string, header: any): void {
  _mapHeaderRegistry.set(key, header);
}
/** 1:1 décomp `src/overworld.c:579 Overworld_GetMapHeaderByGroupAndId(group, num)` :
 *    return gMapGroups[mapGroup][mapNum]; */
export function Overworld_GetMapHeaderByGroupAndId(mapGroup: number, mapNum: number): any {
  const key = `${mapGroup}.${mapNum}`;
  const header = _mapHeaderRegistry.get(key);
  if (header) return header;
  // Fallback : header structurellement vide (champs .music/.mapType/.battleType = 0/undef).
  return {
    mapLayoutId: 0,
    events: { objectEventCount: 0, warpCount: 0, coordEventCount: 0, bgEventCount: 0,
              objectEvents: [], warps: [], coordEvents: [], bgEvents: [] },
    mapScripts: [],
    connections: { count: 0, connections: [] },
    music: 0,
    mapLayoutId16: 0,
    regionMapSectionId: 0,
    cave: 0,
    weather: 0,
    mapType: 0,
    bikingAllowed: 0,
    allowEscaping: 0,
    allowRunning: 0,
    showMapName: 0,
    battleType: 0,
  };
}

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

/** 1:1 STRICT décomp `Overworld_ResetStateAfterWhiteOut(void)` (overworld.c:399) :
 *    ResetInitialPlayerAvatarState();   // dette mineure (re-spawn avatar, idem Teleport/DigEscRope)
 *    FlagClear(FLAG_SYS_CYCLING_ROAD/CRUISE_MODE/SAFARI_MODE/USE_STRENGTH/USE_FLASH);
 *    if (VarGet(VAR_SHOULD_END_ABNORMAL_WEATHER) == 1) {
 *        VarSet(VAR_SHOULD_END_ABNORMAL_WEATHER, 0);
 *        VarSet(VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_NONE);  // = 0
 *    }
 *  Appelé par DoWhiteOut (overworld.c:363) après HealPlayerParty, AVANT le warp respawn :
 *  remet l'avatar à pied + coupe surf/strength/flash/vélo (sinon on réapparaît en surfant). */
export function Overworld_ResetStateAfterWhiteOut(): void {
  FlagClear('FLAG_SYS_CYCLING_ROAD');
  FlagClear('FLAG_SYS_CRUISE_MODE');
  FlagClear('FLAG_SYS_SAFARI_MODE');
  FlagClear('FLAG_SYS_USE_STRENGTH');
  FlagClear('FLAG_SYS_USE_FLASH');
  // Fin de la météo anormale (Kyogre/Groudon) si le compteur de pas a saturé.
  if (VarGet('VAR_SHOULD_END_ABNORMAL_WEATHER') === 1) {
    VarSet('VAR_SHOULD_END_ABNORMAL_WEATHER', 0);
    VarSet('VAR_ABNORMAL_WEATHER_LOCATION', 0);  // ABNORMAL_WEATHER_NONE
  }
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

/** 1:1 STRICT décomp `ResetScreenForMapLoad(void)` (overworld.c:2077) :
 *    SetGpuReg(REG_OFFSET_DISPCNT, 0);
 *    ScanlineEffect_Stop();
 *    DmaClear16(3, PLTT + 2, PLTT_SIZE - 2);
 *    DmaFillLarge16(3, 0, (void *)VRAM, VRAM_SIZE, 0x1000);
 *    ResetOamRange(0, 128);
 *    LoadOam();
 *  Éteint l'affichage (DISPCNT=0) le temps du map load.
 *
 *  ⚠️ DÉVIATION MODÈLE (documentée) : les deux DMA bruts `DmaClear16(PLTT…)` +
 *  `DmaFillLarge16(VRAM…)` ne sont PAS portés. Le port recharge palettes + tilesets
 *  PAR MAP via `LoadMapTilesetPalettes`/`CopyMapTilesetsToVram` (compositor) ; un wipe
 *  VRAM/PLTT brut détruirait les assets chargés UNE FOIS (tiles de police BG0, sprite
 *  joueur) que le port ne recharge pas à chaque map. Le net visuel est identique au
 *  décomp (écran éteint pendant le load → rallumé par InitOverworldGraphicsRegisters). */
export function ResetScreenForMapLoad(): void {
  SetGpuReg(REG_OFFSET_DISPCNT, 0);
  ScanlineEffect_Stop();
  // DmaClear16(3, PLTT + 2, PLTT_SIZE - 2) + DmaFillLarge16(3, 0, VRAM, VRAM_SIZE, 0x1000)
  // = déviation modèle (cf. en-tête) : palettes/tilesets rechargés par map (compositor).
  ResetOamRange(0, 128);
  LoadOam();
}

/** 1:1 STRICT décomp `InitOverworldBgs(void)` (overworld.c:1401) :
 *    InitBgsFromTemplates(0, sOverworldBgTemplates, ARRAY_COUNT(sOverworldBgTemplates));
 *    SetBgAttribute(1/2/3, BG_ATTR_MOSAIC, 1);
 *    gOverworldTilemapBuffer_Bg1/2/3 = AllocZeroed(BG_SCREEN_SIZE);
 *    SetBgTilemapBuffer(1/2/3, ...);
 *    InitStandardTextBoxWindows();
 *  Configure les 4 BG layers OW depuis `sOverworldBgTemplates` (overworld.c:266) :
 *    BG0 charBase 2 mapBase 31 prio 0 (UI/dialogue) ;
 *    BG1 charBase 0 mapBase 29 prio 1 ; BG2 mapBase 28 prio 2 ; BG3 mapBase 30 prio 3.
 *
 *  ⚠️ DÉVIATION MODÈLE (documentée) : `SetBgAttribute(BG_ATTR_MOSAIC)` (effet mosaïque
 *  du door-warp, non modélisé per-bg), l'alloc des buffers tilemap (= buffers persistants
 *  du compositor `gOverworldTilemapBuffer`, gérés par clear/flushOverworldTilemaps) et
 *  `InitStandardTextBoxWindows` (fenêtres texte init par le window-system du port) ne
 *  sont pas re-déclenchés ici — ils n'ajoutent rien et risqueraient de wiper le tilemap
 *  déjà dessiné. Le port se limite donc à la CONFIG des 4 BG (= rôle net de la fonction). */
export function InitOverworldBgs(): void {
  const rt = getRuntime();
  // 1:1 sOverworldBgTemplates (overworld.c:266-304) : [bg, charBaseIndex, mapBaseIndex, priority].
  const templates: ReadonlyArray<readonly [0 | 1 | 2 | 3, number, number, number]> = [
    [0, 2, 31, 0],
    [1, 0, 29, 1],
    [2, 0, 28, 2],
    [3, 0, 30, 3],
  ];
  for (const [bg, charBaseIndex, mapBaseIndex, priority] of templates) {
    const c = rt.gba.bg(bg).config;
    c.charBaseIndex = charBaseIndex;
    c.mapBaseIndex = mapBaseIndex;
    c.screenSize = 0;
    c.paletteMode = 0;
    c.priority = priority;
    c.hofs = 0;
    c.vofs = 0;
  }
}

/** 1:1 STRICT décomp `InitOverworldGraphicsRegisters(void)` (overworld.c:2096) :
 *    ClearScheduledBgCopiesToVram(); ResetTempTileDataBuffers();
 *    SetGpuReg(MOSAIC, 0);
 *    SetGpuReg(WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN1_BG_ALL | WININ_WIN1_OBJ);
 *    SetGpuReg(WINOUT, WINOUT_WIN01_BG0 | WINOUT_WINOBJ_BG0);
 *    SetGpuReg(WIN0H, 0xFF); SetGpuReg(WIN0V, 0xFF);
 *    SetGpuReg(WIN1H, 0xFFFF); SetGpuReg(WIN1V, 0xFFFF);
 *    SetGpuReg(BLDCNT, gOverworldBackgroundLayerFlags[1|2|3] | BLDCNT_TGT2_OBJ | BLDCNT_EFFECT_BLEND);
 *    SetGpuReg(BLDALPHA, BLDALPHA_BLEND(13, 7));
 *    InitOverworldBgs();
 *    ScheduleBgCopyTilemapToVram(1/2/3);
 *    ChangeBgX/Y(0..3, 0, BG_COORD_SET);
 *    SetGpuReg(DISPCNT, OBJ_ON | WIN0_ON | WIN1_ON | OBJ_1D_MAP | HBLANK_INTERVAL);
 *    ShowBg(0..3);
 *    InitFieldMessageBox();
 *  Pose TOUS les registres GPU de l'overworld (mosaïque OFF, fenêtres plein-écran,
 *  blend 2e-cible BG1/2/3+OBJ no-op par défaut (eva=13/evb=7), DISPCNT OW) + (ré)active
 *  les 4 BG. C'est la fonction qui RÉINITIALISE l'état WIN/BLD/MOSAIC laissé par l'écran
 *  précédent (intro/titre) — d'où la disparition de « l'ombre » sur la fenêtre de dialogue
 *  au passage intro→OW (état blend mode-3 résiduel écrasé par ce blend OW). */
export function InitOverworldGraphicsRegisters(): void {
  // 1:1 décomp `const u16 gOverworldBackgroundLayerFlags[]` (io_reg.c:24) :
  //   { BLDCNT_TGT2_BG0, BLDCNT_TGT2_BG1, BLDCNT_TGT2_BG2, BLDCNT_TGT2_BG3 }.
  // ⚠️ Construit LOCALEMENT (lecture paresseuse) : un `const` module-level lisant
  // ces imports à l'init déclenche un TDZ (cycle ESM decomp-runtime↔overworld) ;
  // ici la lecture se fait au runtime, modules pleinement initialisés. Cf.
  // [[feedback-map-loader-var-tdz]].
  const gOverworldBackgroundLayerFlags = [
    BLDCNT_TGT2_BG0, BLDCNT_TGT2_BG1, BLDCNT_TGT2_BG2, BLDCNT_TGT2_BG3,
  ];
  ClearScheduledBgCopiesToVram();
  ResetTempTileDataBuffers();
  SetGpuReg(REG_OFFSET_MOSAIC, 0);
  SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN1_BG_ALL | WININ_WIN1_OBJ);
  SetGpuReg(REG_OFFSET_WINOUT, WINOUT_WIN01_BG0 | WINOUT_WINOBJ_BG0);
  SetGpuReg(REG_OFFSET_WIN0H, 0xFF);
  SetGpuReg(REG_OFFSET_WIN0V, 0xFF);
  SetGpuReg(REG_OFFSET_WIN1H, 0xFFFF);
  SetGpuReg(REG_OFFSET_WIN1V, 0xFFFF);
  SetGpuReg(REG_OFFSET_BLDCNT,
    gOverworldBackgroundLayerFlags[1] | gOverworldBackgroundLayerFlags[2] | gOverworldBackgroundLayerFlags[3]
    | BLDCNT_TGT2_OBJ | BLDCNT_EFFECT_BLEND);
  SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(13, 7));
  InitOverworldBgs();
  ScheduleBgCopyTilemapToVram(1);
  ScheduleBgCopyTilemapToVram(2);
  ScheduleBgCopyTilemapToVram(3);
  ChangeBgX(0, 0, BG_COORD_SET);
  ChangeBgY(0, 0, BG_COORD_SET);
  ChangeBgX(1, 0, BG_COORD_SET);
  ChangeBgY(1, 0, BG_COORD_SET);
  ChangeBgX(2, 0, BG_COORD_SET);
  ChangeBgY(2, 0, BG_COORD_SET);
  ChangeBgX(3, 0, BG_COORD_SET);
  ChangeBgY(3, 0, BG_COORD_SET);
  SetGpuReg(REG_OFFSET_DISPCNT,
    DISPCNT_OBJ_ON | DISPCNT_WIN0_ON | DISPCNT_WIN1_ON | DISPCNT_OBJ_1D_MAP | DISPCNT_HBLANK_INTERVAL);
  ShowBg(0);
  ShowBg(1);
  ShowBg(2);
  ShowBg(3);
  InitFieldMessageBox();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CB2_ReturnToField* — flow retour-au-field depuis un sous-menu (option/sac/party).
//  1:1 décomp overworld.c:1638-1681 (state machine avec gMain.state mutable direct,
//  bypass le bug pointer-arg `u8 *state` du transpiler auto-fichier). Rapatrié depuis
//  l'ex-`engine/ui/option-menu-return.ts` (nom non-1:1) vers son vrai foyer overworld.c.
//  Réfs : overworld.c:1638/1657/1670/1677/1961/1505 + start_menu.c:543-559 +
//  field_screen_effect.c:150/440.
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `bool8 FieldCB_ReturnToFieldOpenStartMenu(void)` (field_screen_effect.c:440).
 *  ShowReturnToFieldStartMenu set gFieldCallback2 = FieldCB_ReturnToFieldStartMenu ;
 *  returns FALSE → RunFieldCallback répète la frame suivante (chain pattern décomp).
 *  ⚠️ FillPalBufferBlack ICI (1er cb2) évite le flash 1-frame (Faded=nouvelles couleurs
 *  avant le FadeScreen du 2ème cb2). */
function FieldCB_ReturnToFieldOpenStartMenu(): boolean {
  FillPalBufferBlack();
  (globalThis as Record<string, unknown>).gFieldCallback2 = FieldCB_ReturnToFieldStartMenu;
  return false;
}

/** 1:1 décomp `bool8 FieldCB_ReturnToFieldStartMenu(void)` (start_menu.c:543) :
 *  if (InitStartMenuStep() == FALSE) return FALSE; ReturnToFieldOpenStartMenu(); return TRUE.
 *  Notre `sm.open()` est synchrone (≡ while InitStartMenuStep()==FALSE) ; on l'appelle
 *  AVANT FillPalBufferBlack pour que la palette menu soit dans Unfaded → fade in menu+field
 *  ensemble. Cursor persiste 1:1 (sStartMenuCursorPos module static). */
function FieldCB_ReturnToFieldStartMenu(): boolean {
  const sm = (globalThis as Record<string, unknown>).startMenu as
    { open?: () => void } | undefined;
  sm?.open?.();
  FillPalBufferBlack();
  FadeScreen(FADE_FROM_BLACK, 0);
  return true;
}

/** 1:1 décomp `bool8 RunFieldCallback(void)` (overworld.c:1505). */
function RunFieldCallback_Manual(): boolean {
  const cb2 = (globalThis as Record<string, unknown>).gFieldCallback2 as (() => boolean) | null | undefined;
  if (cb2) {
    if (!cb2()) return false;
    (globalThis as Record<string, unknown>).gFieldCallback2 = null;
    (globalThis as Record<string, unknown>).gFieldCallback = null;
  } else {
    const cb = (globalThis as Record<string, unknown>).gFieldCallback as (() => void) | null | undefined;
    if (cb) cb();
    (globalThis as Record<string, unknown>).gFieldCallback = null;
  }
  return true;
}

/** Flag interne : true entre case 1 (kick off async restore) et la résolution (state→2). */
let _isRestoringOverworld = false;

/** 1:1 décomp `bool32 ReturnToFieldLocal(u8 *state)` (overworld.c:1961) avec `gMain.state`
 *  mutable direct (bypass bug pointer-arg du transpiler). Returns true à case 3 (= done). */
function ReturnToFieldLocal_Manual(): boolean {
  switch (gMain.state) {
    case 0: {
      // ResumeMap essentiels (ResetTasks/ResetSpriteData/ResetPaletteFade).
      ResetTasks();
      ResetSpriteData();
      ResetPaletteFade();
      // 1:1 décomp ResetVramOamAndBgCntRegs (menu_helpers.c:97) via ResetScreenForMapLoad :
      // reset BLDCNT/BLDY/WIN regs sinon les effets du sub-menu (option menu BLDCNT_DARKEN)
      // persistent → BG0 assombri au retour (bug "textbox noircie" session 129).
      const rt = getRuntime();
      rt.SetGpuReg(0x50 /* BLDCNT */, 0);
      rt.SetGpuReg(0x52 /* BLDALPHA */, 0);
      rt.SetGpuReg(0x54 /* BLDY */, 0);
      rt.SetGpuReg(0x40 /* WIN0H */, 0);
      rt.SetGpuReg(0x44 /* WIN0V */, 0);
      rt.SetGpuReg(0x42 /* WIN1H */, 0);
      rt.SetGpuReg(0x46 /* WIN1V */, 0);
      rt.SetGpuReg(0x48 /* WININ */, 0);
      rt.SetGpuReg(0x4A /* WINOUT */, 0);
      // InitFieldMessageBox : reset sWindowId (field-message-box module-level) sinon le
      // prochain ShowFieldMessage skip le AddWindow → dialog invisible (session 129).
      InitFieldMessageBox();
      gMain.state++;
      break;
    }
    case 1: {
      // 1:1 décomp case 1 InitViewGraphics. `_restoreOverworldFromMenu` (TestOverworldScene)
      // fait BG regs + DISPCNT + ShowBg + InitFieldMessageBox + InitMapView + re-spawn NPCs.
      // Async (fetch tilesets/palettes).
      if (!_isRestoringOverworld) {
        _isRestoringOverworld = true;
        const restore = (globalThis as Record<string, unknown>)._restoreOverworldFromMenu as (() => Promise<void>) | undefined;
        if (typeof restore === 'function') {
          void restore().then(() => {
            gMain.state++;
            _isRestoringOverworld = false;
            // _restoreOverworldFromMenu fait SetMainCallback2(MainCB2_Overworld) à sa fin →
            // le state machine n'est plus tické → case 2 (RunFieldCallback) ne tourne pas via
            // le tick. Le décomp run RunFieldCallback (case 2) AVANT SetMainCallback2(CB2_Overworld).
            // Pour un field-move party-menu en attente (gPostMenuFieldCallback) ou item-use field
            // (gFieldCallback), on run RunFieldCallback ICI (place 1:1 de case 2). On N'inclut PAS
            // gFieldCallback2 seul (= retour WithOpenMenu = ré-ouvre start menu) pour ne pas
            // changer le retour-sac/options standard.
            const g = globalThis as Record<string, unknown>;
            if (g.gPostMenuFieldCallback || g.gFieldCallback) {
              RunFieldCallback_Manual();
            }
          }).catch(e => {
            console.error('[CB2_ReturnToFieldLocal_Manual case 1] restore THREW:', e);
            _isRestoringOverworld = false;
          });
        } else {
          console.warn('[CB2_ReturnToFieldLocal_Manual case 1] no _restoreOverworldFromMenu, skip');
          gMain.state++;
        }
      }
      break;
    }
    case 2: {
      // 1:1 décomp case 2 : if (RunFieldCallback()) (*state)++. 1ère frame → OpenStartMenu
      // (set gFieldCallback2=StartMenu, FALSE) ; frame suivante → StartMenu (open + TRUE).
      if (RunFieldCallback_Manual()) gMain.state++;
      break;
    }
    case 3: {
      return true;
    }
  }
  return false;
}

/** 1:1 décomp `static void CB2_ReturnToFieldLocal(void)` (overworld.c:1638).
 *  Notre `CB2_Overworld` = `MainCB2_Overworld` (closure TestOverworldScene via
 *  globalThis._overworldMainCB2). */
export function CB2_ReturnToFieldLocal_Manual(): void {
  if (ReturnToFieldLocal_Manual()) {
    const rt = getRuntime();
    const cb2 = (globalThis as Record<string, unknown>)._overworldMainCB2 as (() => void) | undefined;
    if (typeof cb2 === 'function') {
      rt.SetMainCallback2(cb2);
    } else {
      console.error('[CB2_ReturnToFieldLocal_Manual] _overworldMainCB2 not exposed');
    }
  }
}

/** 1:1 décomp `void CB2_ReturnToFieldWithOpenMenu(void)` (overworld.c:1670). Reset gMain.state
 *  + pose gFieldCallback2 = FieldCB_ReturnToFieldOpenStartMenu (ré-ouvre le start menu). */
export function CB2_ReturnToFieldWithOpenMenu_Manual(): void {
  const rt = getRuntime();
  rt.SetVBlankCallback(null);
  (globalThis as Record<string, unknown>).gFieldCallback2 = FieldCB_ReturnToFieldOpenStartMenu;
  gMain.state = 0;
  rt.SetMainCallback2(CB2_ReturnToFieldLocal_Manual);
}

/** 1:1 décomp `void CB2_ReturnToField(void)` (overworld.c:1657, branche non-link).
 *  SANS poser gFieldCallback2 : l'appelant (SetUpFieldMove_X party menu) a DÉJÀ posé
 *  gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu (party_menu.c:3757). */
export function CB2_ReturnToField_Manual(): void {
  const rt = getRuntime();
  rt.SetVBlankCallback(null);
  gMain.state = 0;
  rt.SetMainCallback2(CB2_ReturnToFieldLocal_Manual);
}

/** 1:1 décomp `void FieldCB_ContinueScript(void)` (field_screen_effect.c:150). Notre script
 *  bloqué reprend de lui-même au 1er tick de l'OW restauré → juste le fade FROM_BLACK
 *  (le `fadescreen FADE_TO_BLACK` du script avait noirci avant d'ouvrir le sac). */
function FieldCB_ContinueScript_Manual(): void {
  FillPalBufferBlack();
  FadeScreen(FADE_FROM_BLACK, 0);
}

/** 1:1 décomp `void CB2_ReturnToFieldContinueScript(void)` (overworld.c:1677). gFieldCallback
 *  (PAS gFieldCallback2) → RunFieldCallback branche `if (cb) cb()` (= ContinueScript). */
export function CB2_ReturnToFieldContinueScript_Manual(): void {
  const rt = getRuntime();
  rt.SetVBlankCallback(null);
  (globalThis as Record<string, unknown>).gFieldCallback = FieldCB_ContinueScript_Manual;
  (globalThis as Record<string, unknown>).gFieldCallback2 = null;
  gMain.state = 0;
  rt.SetMainCallback2(CB2_ReturnToFieldLocal_Manual);
}
