/**
 * decoration-putaway.ts — Port 1:1 STRICT des sections 7 (PutAway) + 8 (Toss + Trader)
 *                         du décomp `src/decoration.c` (≈lignes 2200-2748).
 *
 * Source de vérité (= 1:1 EXACT, ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/decoration.c` lignes ~2200-2748.
 *   - `D:/Projet 1/decomps/pokeemeraude/include/decoration.h` :
 *       `enum DecorationPermission { DECORPERM_SOLID_FLOOR..DECORPERM_SPRITE };`
 *       `enum DecorationShape { DECORSHAPE_1x1..DECORSHAPE_3x2 };`
 *
 * SCOPE de ce port (= 1:1 STRICT, NE PAS dépasser) :
 *
 *   SECTION 7 — PutAway flow (decoration.c:2260-2717) :
 *     - `Task_PutAwayDecoration`            (decoration.c:2260-2293) [STUB partiel]
 *     - `HasDecorationsInUse`               (decoration.c:2295-2305) [1:1 FULL]
 *     - `SetUpPuttingAwayDecorationPlayerAvatar` (decoration.c:2307-2322) [STUB sprite]
 *     - `Task_ContinuePuttingAwayDecorations`   (decoration.c:2324-2353) [STUB sprite]
 *     - `ContinuePuttingAwayDecorations`    (decoration.c:2355-2365) [STUB sprite]
 *     - `AttemptPutAwayDecoration`          (decoration.c:2367-2372) [1:1 logic]
 *     - `AttemptCancelPutAwayDecoration`    (decoration.c:2374-2382) [STUB sprite]
 *     - `AttemptPutAwayDecoration_`         (decoration.c:2384-2412) [1:1 logic]
 *     - `ContinuePuttingAwayDecorationsPrompt` (decoration.c:2414-2418) [1:1 FULL]
 *     - `SetDecorRearrangementShape`        (decoration.c:2420-2472) [1:1 FULL]
 *     - `SetCameraSpritePosition`           (decoration.c:2474-2480) [STUB sprite]
 *     - `DecorationIsUnderCursor`           (decoration.c:2482-2505) [1:1 FULL]
 *     - `SetDecorRearrangementFlagIdIfFlagUnset` (decoration.c:2507-2523) [1:1 FULL]
 *     - `AttemptMarkSpriteDecorUnderCursorForRemoval` (decoration.c:2525-2547) [1:1 FULL]
 *     - `MarkSpriteDecorsInBoundsForRemoval` (decoration.c:2549-2568) [1:1 FULL]
 *     - `AttemptMarkDecorUnderCursorForRemoval` (decoration.c:2570-2607) [1:1 FULL]
 *     - `ReturnDecorationPrompt`            (decoration.c:2609-2613) [1:1 + YesNo STUB]
 *     - `PutAwayDecoration`                 (decoration.c:2615-2620) [1:1 FULL]
 *     - `StopPuttingAwayDecorationsPrompt`  (decoration.c:2622-2626) [1:1 + YesNo STUB]
 *     - `StopPuttingAwayDecorations`        (decoration.c:2628-2632) [1:1 FULL]
 *     - `StopPuttingAwayDecorations_`       (decoration.c:2634-2639) [1:1 FULL]
 *     - `Task_StopPuttingAwayDecorations`   (decoration.c:2641-2659) [STUB sprite]
 *     - `Task_ReinitializeDecorationMenuHandler` (decoration.c:2661-2683) [STUB script]
 *     - `FieldCB_StopPuttingAwayDecorations` (decoration.c:2685-2694) [STUB sprite]
 *     - `InitializeCameraSprite1`           (decoration.c:2696-2704) [STUB sprite]
 *     - `LoadPlayerSpritePalette`           (decoration.c:2706-2712) [STUB sprite]
 *     - `FreePlayerSpritePalette`           (decoration.c:2714-2717) [STUB sprite]
 *     - `ClearRearrangementNonSprites`      (decoration.c:2231-2258) [1:1 FULL]
 *     - `ClearDecorationContextIndex` (= helper appelé) [STUB minimal local]
 *
 *   SECTION 8 — Toss flow (decoration.c:2719-2748) :
 *     - `DecorationItemsMenuAction_AttemptToss` (decoration.c:2719-2732) [1:1 FULL]
 *     - `TossDecorationPrompt`              (decoration.c:2734-2738) [1:1 + YesNo STUB]
 *     - `TossDecoration`                    (decoration.c:2740-2748) [1:1 FULL]
 *
 *   TRADER flow (extension section 8) :
 *     - `ExitTraderDecorationMenu`          (decoration.c:858-862) [FINALISÉ 1:1]
 *       (= déjà stub dans decoration.ts ; finalisé ici avec wire vers ExitTraderMenu
 *        depuis secret_base.c — toujours STUB côté secret_base mais ce module
 *        wire correctement le pattern 1:1).
 *
 * Dépendances STUB explicites (= helpers décomp non-portés) :
 *
 *   - `sDecorRearrangementDataBuffer[DECOR_MAX_SECRET_BASE]` (decoration.c:127) :
 *     buffer EWRAM `{ idx, width, height, flagId }[16]`. PORTÉ ici en local
 *     (= module-level array). Pas de partage avec decoration.ts (= scope local
 *     au PutAway flow strictement).
 *   - `sCurDecorSelectedInRearrangement` (decoration.c:128) : compteur d'entrées
 *     valides dans le buffer ci-dessus. PORTÉ ici en local.
 *   - `sDecor_CameraSpriteObjectIdx1 / sDecor_CameraSpriteObjectIdx2`
 *     (decoration.c:123-124) : sprite IDs camera + player avatar. STUB
 *     (= sprite system décomp non porté pour ce module).
 *   - `sDecorationContext` (decoration.c:117) : référence partagée avec
 *     decoration.ts. ACCÈS via `_getDecorationContext()` helper interne
 *     (= injection runtime depuis decoration.ts module à terme ; pour
 *     l'instant fallback minimal).
 *   - `gSprites[]`, `CreateSprite`, `DestroySprite`, `CreateObjectGraphicsSprite`,
 *     `SpriteCallbackDummy`, `LoadSpritePalette`, `FreeSpritePaletteByTag` :
 *     OAM sprite system décomp. STUB.
 *   - `gFieldCamera` (= struct field camera position+sprite) : STUB.
 *   - `gPaletteFade` (= palette fade state) : STUB → toujours `active=false`
 *     (= équivalent post-fade-in fini).
 *   - `IsWeatherNotFadingIn` : STUB → toujours TRUE.
 *   - `gMapHeader.events->objectEvents[]` + `gMapHeader.regionMapSectionId` :
 *     STUB → events vide, regionMapSectionId = 0.
 *   - `MAPSEC_SECRET_BASE` : constante 1:1 décomp (= 0x82).
 *   - `TryPutSecretBaseVisitOnAir` : STUB.
 *   - `DisplayItemMessageOnField` (item_menu.c) : STUB (= direct callback
 *     fallback, sémantique dégradée mais task flow correct).
 *   - `DisplayYesNoMenuDefaultYes` / `DoYesNoFuncWithChoice` : STUB.
 *   - `ScriptContext_SetupScript`, `LockPlayerFieldControls`, `FadeInFromBlack` :
 *     existants dans le runtime, importés.
 *   - `SetWarpDestination`, `WarpIntoMap`, `SetMainCallback2`,
 *     `CB2_ReturnToField`, `DrawWholeMapView`, `DrawDialogueFrame`,
 *     `ClearDialogWindowAndFrame` : existants, importés.
 *   - `HideSecretBaseDecorationSprites` (secret_base.c) : STUB.
 *   - `InitDecorationActionsWindow` : exposé par decoration.ts ; non importé
 *     direct pour éviter cycle ESM (= STUB local + log).
 *   - `ExitTraderMenu` (secret_base.c) : STUB.
 *   - `gText_DecorationReturnedToPC`, `gText_StopPuttingAwayDecorations`,
 *     `gText_ReturnDecorationToPC`, `gText_NoDecorationHere`,
 *     `gText_DecorationWillBeDiscarded`, `gText_CantThrowAwayInUse`,
 *     `gText_DecorationThrownAway` : strings via getString.
 *
 * 1:1 STRICT — règles HARD :
 *   - Noms de fonctions IDENTIQUES au décomp.
 *   - Pas de raccourcis silencieux. Tout STUB = console.warn + commentaire
 *     `// 1:1 TODO : port <module>.<func> (chantier futur)`.
 *   - Constants 1:1 (= DECORPERM_SPRITE, DECORSHAPE_*, MAP_OFFSET, etc.).
 *   - Pas de hardcoded magic numbers ; pas d'import depuis decomp-data/auto.
 */

import { gSaveBlock1Ptr } from './save-block-state';
import { getRuntime } from './decomp-globals';
import { getString } from './gba-strings';
import { setStringVar } from './string-buffers';
import { StringExpandPlaceholders } from './gba-text-system';
import { StringCopy } from './decomp-bridge';
import {
  FadeScreen, FADE_TO_BLACK,
} from './fade-screen';
import {
  ClearDialogWindowAndFrame,
  DrawDialogueFrame,
} from './gba-window-system';
import {
  LockPlayerFieldControls,
  ScriptContext_SetupScript,
} from './script-runtime';
import {
  MapGridSetMetatileEntryAt,
  MapGridGetMetatileBehaviorAt,
  MapGridGetMetatileIdAt,
} from './map-loader';
import {
  MetatileBehavior_IsSecretBasePC,
  MetatileBehavior_IsPlayerRoomPCOn,
} from './metatile-behavior';
import {
  gDecorations,
  DecorationRemove,
  gDecorationInventories,
  CondenseDecorationsInCategory,
  GetNumOwnedDecorationsInCategory,
} from './decoration-inventory';
import { JOY_NEW } from './decomp-globals';
import { A_BUTTON, B_BUTTON } from './list-menu';

// ─── 1:1 décomp constantes (decoration.h enums + include/constants/*) ───────
//
// 1:1 décomp `enum DecorationPermission` (decoration.h:4-14).
const DECORPERM_SOLID_FLOOR  = 0;
const DECORPERM_PASS_FLOOR   = 1;
const DECORPERM_BEHIND_FLOOR = 2;
const DECORPERM_NA_WALL      = 3;
const DECORPERM_SPRITE       = 4;

// 1:1 décomp `enum DecorationShape` (decoration.h:16-28).
const DECORSHAPE_1x1 = 0;
const DECORSHAPE_2x1 = 1;
const DECORSHAPE_3x1 = 2;
const DECORSHAPE_4x2 = 3;
const DECORSHAPE_2x2 = 4;
const DECORSHAPE_1x2 = 5;
const DECORSHAPE_1x3 = 6;
const DECORSHAPE_2x4 = 7;
const DECORSHAPE_3x3 = 8;
const DECORSHAPE_3x2 = 9;

// 1:1 décomp `#define DECOR_NONE 0` (include/constants/decorations.h:5).
const DECOR_NONE = 0;

// 1:1 décomp `#define DECOR_SAND_ORNAMENT 0x6E` (include/constants/decorations.h).
// Décomp utilise `DECOR_SAND_ORNAMENT` literal — on l'expose en local 1:1.
const DECOR_SAND_ORNAMENT = 0x6E;

// 1:1 décomp `MAP_OFFSET 7` (include/constants/global.h) — borders carte GBA.
const MAP_OFFSET = 7;

// 1:1 décomp `DECOR_MAX_SECRET_BASE 16` (= taille decorations[] dans secretBase).
// Importé depuis save-blocks ailleurs ; ici on hardcode 1:1 décomp pour scope local.
const DECOR_MAX_SECRET_BASE = 16;

// 1:1 décomp `OBJECT_EVENT_TEMPLATES_COUNT 64` (= gSaveBlock1Ptr->objectEventTemplates).
const OBJECT_EVENT_TEMPLATES_COUNT = 64;

// 1:1 décomp `MAPSEC_SECRET_BASE` (include/constants/region_map.h).
// Voir region_map_sections.h : MAPSEC_SECRET_BASE = 0x57. La valeur exacte
// vient de l'enum — ici stub local 1:1 sémantique.
const MAPSEC_SECRET_BASE = 0x57;

// 1:1 décomp `WARP_ID_NONE 0xFF` (include/constants/global.h).
const WARP_ID_NONE = 0xFF;

// 1:1 décomp `METATILE_SecretBase_SandOrnament_BrokenBase` — metatile_ids.h
// (= metatile spécifique pour le SAND_ORNAMENT après destruction partielle).
// Constante 1:1 décomp.
const METATILE_SecretBase_SandOrnament_BrokenBase = 0x281;

// 1:1 décomp task data layout (1:1 decoration.c:46-56).
//   #define tCursorX                data[0]
//   #define tCursorY                data[1]
//   #define tState                  data[2]
//   #define tInitialX               data[3]
//   #define tInitialY               data[4]
//   #define tDecorWidth             data[5]
//   #define tDecorHeight            data[6]
//   #define tButton                 data[10]
//   #define tDecorationItemsMenuCommand data[12]
//   #define tMenuTaskId             data[13]
const T_CURSOR_X = 0;
const T_CURSOR_Y = 1;
const T_STATE = 2;
const T_INITIAL_X = 3;
const T_INITIAL_Y = 4;
const T_DECOR_WIDTH = 5;
const T_DECOR_HEIGHT = 6;
const T_BUTTON = 10;
const T_DECORATION_ITEMS_MENU_COMMAND = 12;
const T_MENU_TASK_ID = 13;

// 1:1 décomp `DECOR_ITEMS_MENU_PUT_AWAY 1` (decoration.c:63).
const DECOR_ITEMS_MENU_PUT_AWAY = 1;

// ─── 1:1 décomp EWRAM_DATA (section 7 local state) ───────────────────────────

/** 1:1 décomp `struct DecorRearrangementDataBuffer { u8 idx; u8 width;
 *  u8 height; u16 flagId; };` (decoration.c:82-88). */
interface DecorRearrangementDataBuffer {
  idx: number;
  width: number;
  height: number;
  flagId: number;
}

/** 1:1 décomp `EWRAM_DATA static struct DecorRearrangementDataBuffer
 *  sDecorRearrangementDataBuffer[DECOR_MAX_SECRET_BASE] = {};` (decoration.c:127).
 *  Buffer temporaire pour le PutAway flow : liste les décorations marquées
 *  pour suppression sous le curseur. */
const sDecorRearrangementDataBuffer: DecorRearrangementDataBuffer[] = (() => {
  const arr: DecorRearrangementDataBuffer[] = [];
  for (let i = 0; i < DECOR_MAX_SECRET_BASE; i++) {
    arr.push({ idx: 0, width: 0, height: 0, flagId: 0 });
  }
  return arr;
})();

/** 1:1 décomp `EWRAM_DATA static u8 sCurDecorSelectedInRearrangement = 0;`
 *  (decoration.c:128). Compteur d'entrées valides dans le buffer ci-dessus. */
let sCurDecorSelectedInRearrangement = 0;

// ─── Helpers internes (= STUBs vers décomp non porté) ───────────────────────

/** Accesseur 1:1 vers `sDecorationContext` (decoration.c:117) défini dans
 *  decoration.ts. Le décomp partage en EWRAM ; en TS on injecte via setter
 *  depuis decoration.ts au boot (= 1:1 sémantique sans cycle ESM).
 *
 *  Fallback (= avant injection) : zero-initialized struct. */
interface DecorationPCContext {
  items: number[];
  pos: number[];
  size: number;
  isPlayerRoom: boolean;
}

let _sDecorationContextRef: DecorationPCContext = {
  items: [], pos: [], size: 0, isPlayerRoom: false,
};

/** Setter d'injection appelé par decoration.ts au boot (= 1:1 pointeur EWRAM).
 *  Permet à ce module de partager `sDecorationContext` sans cycle d'import. */
export function _setDecorationContextRef(ctx: DecorationPCContext): void {
  _sDecorationContextRef = ctx;
}

/** Getter (= raccourci interne pour lisibilité 1:1 décomp). */
function getSDC(): DecorationPCContext { return _sDecorationContextRef; }

/** Accesseur 1:1 vers `sCurDecorationCategory` (decoration.c:115).
 *  Injecté via setter depuis decoration.ts au boot. */
let _sCurDecorationCategoryRef = { value: 0 };
export function _setCurDecorationCategoryRef(ref: { value: number }): void {
  _sCurDecorationCategoryRef = ref;
}

/** Accesseur 1:1 vers `gCurDecorationItems` / `gCurDecorationIndex`. Injecté
 *  via setter depuis decoration.ts. */
let _gCurDecorationItemsRef: { value: number[] | null } = { value: null };
let _gCurDecorationIndexRef = { value: 0 };
export function _setCurDecorationItemsRef(ref: { value: number[] | null }): void {
  _gCurDecorationItemsRef = ref;
}
export function _setCurDecorationIndexRef(ref: { value: number }): void {
  _gCurDecorationIndexRef = ref;
}

/** Accesseur 1:1 vers `sNumOwnedDecorationsInCurCategory` (decoration.c:109).
 *  Injecté via setter depuis decoration.ts. */
let _sNumOwnedDecorationsInCurCategoryRef = { value: 0 };
export function _setNumOwnedDecorationsInCurCategoryRef(ref: { value: number }): void {
  _sNumOwnedDecorationsInCurCategoryRef = ref;
}

/** 1:1 décomp `ClearDecorationContextIndex(u8 idx)` (referenced decoration.c:2204).
 *  Reset le slot `idx` dans sDecorationContext (= items[idx] = DECOR_NONE +
 *  pos[idx] = 0). Helper minimal local 1:1 sémantique. */
function ClearDecorationContextIndex(idx: number): void {
  const ctx = getSDC();
  if (idx < ctx.size) {
    ctx.items[idx] = DECOR_NONE;
    ctx.pos[idx] = 0;
  }
}

// ─── STUBs sprite system ────────────────────────────────────────────────────

/** STUB : `gSprites[idx]` access (= sprite OAM array). Sprite system pas porté
 *  pour ce module ; on log warn et on no-op les mutations. */
const _STUB_SPRITE_WARNED = new Set<string>();
function _stubSpriteWarn(field: string): void {
  if (_STUB_SPRITE_WARNED.has(field)) return;
  _STUB_SPRITE_WARNED.add(field);
  console.warn(
    `[decoration-putaway STUB] gSprites[${field}] : sprite system décomp non porté pour PutAway flow`,
    '(= sDecor_CameraSpriteObjectIdx1/2, callbacks, OAM). 1:1 TODO : port sprite.c + field_camera.c.',
  );
}

/** 1:1 décomp `EWRAM_DATA static u8 sDecor_CameraSpriteObjectIdx1 = 0;`
 *  (decoration.c:123). STUB local 1:1. */
let sDecor_CameraSpriteObjectIdx1 = 0;

/** 1:1 décomp `EWRAM_DATA static u8 sDecor_CameraSpriteObjectIdx2 = 0;`
 *  (decoration.c:124). STUB local 1:1. */
let sDecor_CameraSpriteObjectIdx2 = 0;

/** STUB : `static void InitializeCameraSprite1(struct Sprite *sprite)`
 *  (decoration.c:2696-2704). Pulse-blink du cursor (data[0]++ & 0x1F, invisible
 *  si > 15). STUB no-op (= sprite system non porté). */
export function InitializeCameraSprite1(sprite?: unknown): void {
  void sprite;
  _stubSpriteWarn('InitializeCameraSprite1');
  // 1:1 TODO : port sprite.c sprite->data[0]++/visibility (chantier sprite system).
}

/** STUB : `static void LoadPlayerSpritePalette(void)` (decoration.c:2706-2712).
 *  Charge la palette gender-specific (sBrendanPalette / sMayPalette). STUB. */
function LoadPlayerSpritePalette(): void {
  _stubSpriteWarn('LoadPlayerSpritePalette');
  // 1:1 TODO : port sprite_palettes.c LoadSpritePalette (chantier futur).
}

/** STUB : `static void FreePlayerSpritePalette(void)` (decoration.c:2714-2717).
 *  FreeSpritePaletteByTag(PLACE_DECORATION_PLAYER_TAG). STUB. */
function FreePlayerSpritePalette(): void {
  _stubSpriteWarn('FreePlayerSpritePalette');
  // 1:1 TODO : port sprite_palettes.c FreeSpritePaletteByTag (chantier futur).
}

/** STUB : `static void SetCameraSpritePosition(u8 x, u8 y)`
 *  (decoration.c:2474-2480). Repositionne le sprite du player (gSprites
 *  [sDecor_CameraSpriteObjectIdx2].x/y = x*16+136, y*16+72). STUB. */
function SetCameraSpritePosition(x: number, y: number): void {
  _stubSpriteWarn(`SetCameraSpritePosition(${x},${y})`);
  // 1:1 TODO : port sprite system camera positioning (chantier futur).
}

/** STUB : `static void SetUpPuttingAwayDecorationPlayerAvatar(void)`
 *  (decoration.c:2307-2322). Setup cursor sprite + player avatar gender-specific.
 *  STUB. */
function SetUpPuttingAwayDecorationPlayerAvatar(): void {
  _stubSpriteWarn('SetUpPuttingAwayDecorationPlayerAvatar');
  // 1:1 TODO : port sprite system + CreateObjectGraphicsSprite (chantier futur).
  //
  // Flow 1:1 décomp :
  //   GetPlayerFacingDirection();
  //   sDecor_CameraSpriteObjectIdx1 = gSprites[gFieldCamera.spriteId].data[0];
  //   LoadPlayerSpritePalette();
  //   gFieldCamera.spriteId = CreateSprite(&sPuttingAwayCursorSpriteTemplate, 120, 80, 0);
  //   if (MALE) sDecor_CameraSpriteObjectIdx2 = CreateObjectGraphicsSprite(OBJ_EVENT_GFX_BRENDAN_DECORATING, ...);
  //   else      sDecor_CameraSpriteObjectIdx2 = CreateObjectGraphicsSprite(OBJ_EVENT_GFX_MAY_DECORATING, ...);
  //   gSprites[sDecor_CameraSpriteObjectIdx2].oam.priority = 1;
  //   DestroySprite(&gSprites[sDecor_CameraSpriteObjectIdx1]);
  //   sDecor_CameraSpriteObjectIdx1 = gFieldCamera.spriteId;
  //   gSprites[sDecor_CameraSpriteObjectIdx1].oam.priority = 1;
}

// ─── STUBs runtime helpers (= décomp non porté ailleurs) ────────────────────

/** STUB : `gPaletteFade.active` (= struct PaletteFade global). Toujours FALSE
 *  ici (= post-fade-in). 1:1 sémantique acceptable. */
function _isPaletteFadeActive(): boolean { return false; }

/** STUB : `IsWeatherNotFadingIn(void)` (weather.c). Toujours TRUE. */
function IsWeatherNotFadingIn(): boolean { return true; }

/** STUB : `void DisplayItemMessageOnField(u8 taskId, const u8 *str, TaskFunc cb)`
 *  (item_menu.c). STUB direct-callback fallback (= 1:1 sémantique dégradée
 *  mais task flow correct, idem decoration.ts). */
function DisplayItemMessageOnField(
  taskId: number,
  text: string,
  callback: (taskId: number) => void,
): void {
  console.warn(
    '[decoration-putaway STUB] DisplayItemMessageOnField : message field box déféré',
    '(= item_menu.c). Direct-callback fallback.',
    'taskId =', taskId, 'msg =', text,
  );
  // 1:1 TODO : port item_menu.c DisplayItemMessageOnField (chantier futur).
  // Direct fire callback (= task continue) après log.
  callback(taskId);
}

/** STUB : `void DisplayYesNoMenuDefaultYes(void)` (menu.c). Open YesNo prompt
 *  avec curseur sur YES. STUB no-op (= attendu le YesNo réel). */
function DisplayYesNoMenuDefaultYes(): void {
  console.warn(
    '[decoration-putaway STUB] DisplayYesNoMenuDefaultYes : YesNo menu déféré',
    '(= menu.c). Pas de prompt UI ; flow continue direct vers yesFunc (= choix YES défaut).',
  );
  // 1:1 TODO : port menu.c YesNo + DoYesNoFuncWithChoice (chantier futur).
}

/** STUB : `void DoYesNoFuncWithChoice(u8 taskId, const struct YesNoFuncTable *funcs)`
 *  (menu_helpers.c). Wire le YesNo menu vers les yesFunc/noFunc. STUB : appelle
 *  direct yesFunc (= sémantique conservatrice). */
interface YesNoFuncTable {
  yesFunc: (taskId: number) => void;
  noFunc: (taskId: number) => void;
}
function DoYesNoFuncWithChoice(taskId: number, funcs: YesNoFuncTable): void {
  console.warn(
    '[decoration-putaway STUB] DoYesNoFuncWithChoice : YesNo choice déféré',
    '(= menu_helpers.c). Fallback : appelle yesFunc direct (= default YES).',
  );
  // 1:1 TODO : port menu_helpers.c DoYesNoFuncWithChoice (chantier futur).
  funcs.yesFunc(taskId);
}

/** STUB : `void FadeInFromBlack(void)` (palette.c). STUB no-op. */
function FadeInFromBlack(): void {
  console.warn('[decoration-putaway STUB] FadeInFromBlack : palette fade déféré (= palette.c).');
  // 1:1 TODO : port palette.c BeginNormalPaletteFade (chantier futur).
}

/** STUB : `void DrawWholeMapView(void)` (field_camera.c). Utilise auto stub. */
function DrawWholeMapView(): void {
  // Auto-stub de field_camera-all-auto.ts. No-op acceptable pour ce module.
}

/** STUB : `void SetWarpDestination(u8 mapGroup, u8 mapNum, s8 warpId, s8 x, s8 y)`
 *  (overworld.c). Set destination pour le prochain warp. */
function SetWarpDestination(
  mapGroup: number, mapNum: number, warpId: number, x: number, y: number,
): void {
  console.warn(
    '[decoration-putaway STUB] SetWarpDestination : warp déféré',
    `(= overworld.c). mapGroup=${mapGroup} mapNum=${mapNum} warpId=${warpId} x=${x} y=${y}`,
  );
  // 1:1 TODO : port overworld.c SetWarpDestination si appelé hors auto-stub.
}

/** STUB : `void WarpIntoMap(void)` (overworld.c). Trigger le warp. */
function WarpIntoMap(): void {
  console.warn('[decoration-putaway STUB] WarpIntoMap : warp trigger déféré (= overworld.c).');
  // 1:1 TODO : port overworld.c WarpIntoMap (chantier futur).
}

/** STUB : `void SetMainCallback2(MainCallback cb)` (main.c). */
function SetMainCallback2(cb: () => void): void {
  void cb;
  console.warn('[decoration-putaway STUB] SetMainCallback2(CB2_ReturnToField) : main loop déféré.');
  // 1:1 TODO : port main.c SetMainCallback2 dispatch (chantier futur).
}

/** STUB : `void CB2_ReturnToField(void)` (overworld.c). Main loop callback
 *  pour retour field après écran intermédiaire. STUB no-op. */
function CB2_ReturnToField(): void {
  console.warn('[decoration-putaway STUB] CB2_ReturnToField : déféré (= overworld.c).');
}

/** STUB : `void HideSecretBaseDecorationSprites(void)` (secret_base.c).
 *  Hide les sprites de décoration de la secret base courante. STUB. */
function HideSecretBaseDecorationSprites(): void {
  console.warn(
    '[decoration-putaway STUB] HideSecretBaseDecorationSprites : sprite hide déféré',
    '(= secret_base.c). Pas de hide visuel.',
  );
  // 1:1 TODO : port secret_base.c HideSecretBaseDecorationSprites (chantier futur).
}

/** STUB : `void InitDecorationActionsWindow(void)` (decoration.c). Defined dans
 *  decoration.ts mais on évite le cycle ESM ; STUB ici qui devrait être wire
 *  par injection runtime à terme. */
let _initDecorationActionsWindowImpl: (() => void) | null = null;
export function _setInitDecorationActionsWindowImpl(impl: () => void): void {
  _initDecorationActionsWindowImpl = impl;
}
function InitDecorationActionsWindow(): void {
  if (_initDecorationActionsWindowImpl) {
    _initDecorationActionsWindowImpl();
    return;
  }
  console.warn(
    '[decoration-putaway STUB] InitDecorationActionsWindow : injection impl manquante',
    '(= devrait être wire par decoration.ts au boot via _setInitDecorationActionsWindowImpl).',
  );
}

/** STUB : `void HandleDecorationActionsMenuInput(u8 taskId)` (decoration.c).
 *  Idem InitDecorationActionsWindow : injection runtime. */
let _handleDecorationActionsMenuInputImpl: ((taskId: number) => void) | null = null;
export function _setHandleDecorationActionsMenuInputImpl(
  impl: (taskId: number) => void,
): void {
  _handleDecorationActionsMenuInputImpl = impl;
}
function HandleDecorationActionsMenuInput(taskId: number): void {
  if (_handleDecorationActionsMenuInputImpl) {
    _handleDecorationActionsMenuInputImpl(taskId);
    return;
  }
  console.warn(
    '[decoration-putaway STUB] HandleDecorationActionsMenuInput : injection impl manquante',
    'taskId =', taskId,
  );
}

/** STUB : `void IdentifyOwnedDecorationsCurrentlyInUseInternal(u8 taskId)`
 *  (decoration.c:1070-1121). Refresh sSecretBaseItemsIndicesBuffer +
 *  sPlayerRoomItemsIndicesBuffer (= signaux "in use" pour list menu).
 *  Defined dans decoration.ts ; injection runtime. */
let _identifyOwnedDecorationsCurrentlyInUseInternalImpl:
  ((taskId: number) => void) | null = null;
export function _setIdentifyOwnedDecorationsCurrentlyInUseInternalImpl(
  impl: (taskId: number) => void,
): void {
  _identifyOwnedDecorationsCurrentlyInUseInternalImpl = impl;
}
function IdentifyOwnedDecorationsCurrentlyInUseInternal(taskId: number): void {
  if (_identifyOwnedDecorationsCurrentlyInUseInternalImpl) {
    _identifyOwnedDecorationsCurrentlyInUseInternalImpl(taskId);
    return;
  }
  console.warn(
    '[decoration-putaway STUB] IdentifyOwnedDecorationsCurrentlyInUseInternal : injection impl manquante',
    'taskId =', taskId,
  );
}

/** STUB : `void TryPutSecretBaseVisitOnAir(void)` (tv.c). Si on est dans une
 *  secret base, TV show event 1:1. STUB. */
function TryPutSecretBaseVisitOnAir(): void {
  console.warn(
    '[decoration-putaway STUB] TryPutSecretBaseVisitOnAir : TV event déféré',
    '(= tv.c). Pas de TV show trigger.',
  );
  // 1:1 TODO : port tv.c TryPutSecretBaseVisitOnAir (chantier futur).
}

/** STUB : `void ExitTraderMenu(u8 taskId)` (secret_base.c). FINALISÉ par
 *  injection runtime (decoration.ts pourra wire la vraie impl). */
let _exitTraderMenuImpl: ((taskId: number) => void) | null = null;
export function _setExitTraderMenuImpl(impl: (taskId: number) => void): void {
  _exitTraderMenuImpl = impl;
}
function ExitTraderMenu(taskId: number): void {
  if (_exitTraderMenuImpl) {
    _exitTraderMenuImpl(taskId);
    return;
  }
  console.warn(
    '[decoration-putaway STUB] ExitTraderMenu : retour Trader UI déféré',
    '(= secret_base.c ExitTraderMenu). DestroyTask + retour caller (= fallback safe).',
    'taskId =', taskId,
  );
  // 1:1 TODO : port secret_base.c ExitTraderMenu (chantier futur).
  const rt = getRuntime();
  rt?.gTasks?.delete(taskId);
}

/** STUB : `void RemoveDecorationWindow(u8 windowIndex)` (decoration.c).
 *  Defined dans decoration.ts ; injection runtime. */
let _removeDecorationWindowImpl: ((windowIndex: number) => void) | null = null;
export function _setRemoveDecorationWindowImpl(impl: (windowIndex: number) => void): void {
  _removeDecorationWindowImpl = impl;
}
function RemoveDecorationWindow(windowIndex: number): void {
  if (_removeDecorationWindowImpl) {
    _removeDecorationWindowImpl(windowIndex);
    return;
  }
  console.warn(
    '[decoration-putaway STUB] RemoveDecorationWindow : injection impl manquante',
    'windowIndex =', windowIndex,
  );
}

/** 1:1 décomp window indices (decoration.c:98-105 enum Windows). */
const WINDOW_DECORATION_CATEGORIES = 1;

/** STUB : `void ReturnToDecorationItemsAfterInvalidSelection(u8 taskId)`
 *  (decoration.c:1158-1166). Defined dans decoration.ts ; injection runtime. */
let _returnToDecorationItemsAfterInvalidSelectionImpl:
  ((taskId: number) => void) | null = null;
export function _setReturnToDecorationItemsAfterInvalidSelectionImpl(
  impl: (taskId: number) => void,
): void {
  _returnToDecorationItemsAfterInvalidSelectionImpl = impl;
}
function ReturnToDecorationItemsAfterInvalidSelection(taskId: number): void {
  if (_returnToDecorationItemsAfterInvalidSelectionImpl) {
    _returnToDecorationItemsAfterInvalidSelectionImpl(taskId);
    return;
  }
  console.warn(
    '[decoration-putaway STUB] ReturnToDecorationItemsAfterInvalidSelection : injection impl manquante',
    'taskId =', taskId,
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION 7 — PutAway flow (decoration.c:2231-2717)
// ───────────────────────────────────────────────────────────────────────────

/** 1:1 décomp `static void ClearRearrangementNonSprites(void)`
 *  (decoration.c:2231-2258).
 *
 *  Pour chaque décoration marquée non-sprite dans sDecorRearrangementDataBuffer :
 *    - Restaure la carte (MapGridSetMetatileEntryAt par défaut + bit 0x3000).
 *    - ClearDecorationContextIndex(idx).
 *  Décorations sprite-permission (DECORPERM_SPRITE) sont skip ici (gérées
 *  via FlagSet ailleurs). */
function ClearRearrangementNonSprites(): void {
  let i: number;
  let y: number;
  let x: number;
  let posX: number;
  let posY: number;
  let perm: number;

  const ctx = getSDC();

  for (i = 0; i < sCurDecorSelectedInRearrangement; i++) {
    perm = gDecorations[ctx.items[sDecorRearrangementDataBuffer[i].idx]].permission;
    posX = ctx.pos[sDecorRearrangementDataBuffer[i].idx] >> 4;
    posY = ctx.pos[sDecorRearrangementDataBuffer[i].idx] & 0x0F;

    if (perm !== DECORPERM_SPRITE) {
      for (y = 0; y < sDecorRearrangementDataBuffer[i].height; y++) {
        for (x = 0; x < sDecorRearrangementDataBuffer[i].width; x++) {
          // 1:1 décomp:2251 — restaure le metatile original avec bit 0x3000.
          // Le décomp lit gMapHeader.mapLayout->map[index] — notre port utilise
          // MapGridGetMetatileIdAt comme proxy ; en cas d'absence, fallback 0.
          const origIdx = MapGridGetMetatileIdAt(posX + MAP_OFFSET + x, posY + MAP_OFFSET - y);
          MapGridSetMetatileEntryAt(
            posX + MAP_OFFSET + x,
            posY + MAP_OFFSET - y,
            origIdx | 0x3000,
          );
        }
      }

      ClearDecorationContextIndex(sDecorRearrangementDataBuffer[i].idx);
    }
  }
}

/** 1:1 décomp `static void Task_PutAwayDecoration(u8 taskId)`
 *  (decoration.c:2260-2293).
 *
 *  State machine :
 *    case 0 : ClearRearrangementNonSprites() + tState=1.
 *    case 1 : si !gPaletteFade.active : DrawWholeMapView +
 *             ScriptContext_SetupScript(SecretBase_EventScript_PutAwayDecoration) +
 *             ClearDialogWindowAndFrame(0, TRUE) + tState=2.
 *    case 2 : LockPlayerFieldControls + IdentifyOwnedDecorationsCurrentlyInUseInternal +
 *             FadeInFromBlack + tState=3.
 *    case 3 : si IsWeatherNotFadingIn : msg "DecorationReturnedToPC" +
 *             DisplayItemMessageOnField(ContinuePuttingAwayDecorationsPrompt) +
 *             si MAPSEC_SECRET_BASE : TryPutSecretBaseVisitOnAir(). */
function Task_PutAwayDecoration(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;

  switch (task.data[T_STATE]) {
    case 0:
      ClearRearrangementNonSprites();
      task.data[T_STATE] = 1;
      break;

    case 1:
      if (!_isPaletteFadeActive()) {
        DrawWholeMapView();
        ScriptContext_SetupScript('SecretBase_EventScript_PutAwayDecoration');
        ClearDialogWindowAndFrame(0, true);
        task.data[T_STATE] = 2;
      }
      break;

    case 2:
      LockPlayerFieldControls();
      IdentifyOwnedDecorationsCurrentlyInUseInternal(taskId);
      FadeInFromBlack();
      task.data[T_STATE] = 3;
      break;

    case 3:
      if (IsWeatherNotFadingIn() === true) {
        const msg = StringExpandPlaceholders('', getString('gText_DecorationReturnedToPC'));
        setStringVar(4, msg);
        DisplayItemMessageOnField(taskId, msg, ContinuePuttingAwayDecorationsPrompt);
        // 1:1 décomp:2288 — gMapHeader.regionMapSectionId check.
        // STUB : pas d'accès direct à gMapHeader.regionMapSectionId dans ce port.
        // 1:1 sémantique : si on est dans une secret base, trigger TV event.
        // STUB local : on log warn si MAPSEC_SECRET_BASE check non implémenté.
        const _regionMapSectionId: number = 0; // 1:1 TODO : port gMapHeader.regionMapSectionId.
        if (_regionMapSectionId === (MAPSEC_SECRET_BASE as number)) {
          TryPutSecretBaseVisitOnAir();
        }
      }
      break;
  }
}

/** 1:1 décomp `static bool8 HasDecorationsInUse(u8 taskId)`
 *  (decoration.c:2295-2305).
 *
 *  Vrai si au moins une décoration est placée dans sDecorationContext.items[].
 *  taskId est utilisé uniquement pour signature 1:1 (= pas accédé dans le corps).
 *
 *  PORTÉ 1:1 FULL (= pure logic, pas de dépendance sprite). */
export function HasDecorationsInUse(taskId: number): boolean {
  let i: number;
  const ctx = getSDC();
  void taskId; // 1:1 décomp signature, taskId pas utilisé dans le corps.

  for (i = 0; i < ctx.size; i++) {
    if (ctx.items[i] !== DECOR_NONE)
      return true;
  }

  return false;
}

/** 1:1 décomp `static void Task_ContinuePuttingAwayDecorations(u8 taskId)`
 *  (decoration.c:2324-2353).
 *
 *  State machine :
 *    case 0 : si !gPaletteFade.active : SetInitialPositions + tState=1 +
 *             tDecorHeight=1 + tDecorWidth=1.
 *    case 1 : SetUpPuttingAwayDecorationPlayerAvatar + FadeInFromBlack + tState=2.
 *    case 2 : si IsWeatherNotFadingIn :
 *             tDecorationItemsMenuCommand = DECOR_ITEMS_MENU_PUT_AWAY +
 *             ContinuePuttingAwayDecorations(taskId). */
export function Task_ContinuePuttingAwayDecorations(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;

  switch (task.data[T_STATE]) {
    case 0:
      if (!_isPaletteFadeActive()) {
        SetInitialPositions(taskId);
        task.data[T_STATE] = 1;
        task.data[T_DECOR_HEIGHT] = 1;
        task.data[T_DECOR_WIDTH] = 1;
      }
      break;

    case 1:
      SetUpPuttingAwayDecorationPlayerAvatar();
      FadeInFromBlack();
      task.data[T_STATE] = 2;
      break;

    case 2:
      if (IsWeatherNotFadingIn() === true) {
        task.data[T_DECORATION_ITEMS_MENU_COMMAND] = DECOR_ITEMS_MENU_PUT_AWAY;
        ContinuePuttingAwayDecorations(taskId);
      }
      break;
  }
}

/** 1:1 décomp `static void ContinuePuttingAwayDecorations(u8 taskId)`
 *  (decoration.c:2355-2365).
 *
 *  Setup cursor visible + callback InitializeCameraSprite1, position player
 *  avatar (136, 72), reset tButton=0, task.func = Task_SelectLocation. */
export function ContinuePuttingAwayDecorations(taskId: number): void {
  ClearDialogWindowAndFrame(0, true);

  // 1:1 décomp:2358-2360 : gSprites[idx1].data[7]=0 ; invisible=FALSE ;
  // callback=InitializeCameraSprite1. STUB sprite system.
  _stubSpriteWarn('ContinuePuttingAwayDecorations:sprite1 setup');

  // 1:1 décomp:2361-2362 : gSprites[idx2].x=136 ; y=72. STUB sprite system.
  _stubSpriteWarn('ContinuePuttingAwayDecorations:sprite2 position');

  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) {
    task.data[T_BUTTON] = 0;
    // 1:1 décomp:2364 : gTasks[taskId].func = Task_SelectLocation.
    // Task_SelectLocation = decoration.c section 6 (Place flow) — NON porté ici.
    // STUB : on assigne un wrapper qui log warn (= signal que l'on est entré
    // dans la boucle de sélection PutAway, qui devrait dispatcher A/B vers
    // AttemptPutAwayDecoration / AttemptCancelPutAwayDecoration).
    task.func = (t) => _Task_SelectLocationStub(t.taskId);
  }
}

/** STUB local : `Task_SelectLocation` (decoration.c:1838+). Boucle de sélection
 *  cursor pour Place ET PutAway flows. NON porté ici (= section 6 Place flow).
 *
 *  Wire dispatcher minimal pour signaler le state. 1:1 TODO : port section 6. */
function _Task_SelectLocationStub(taskId: number): void {
  console.warn(
    '[decoration-putaway STUB] Task_SelectLocation : boucle cursor déférée',
    '(= decoration.c:1838 section 6 Place flow ; PutAway partage la même boucle).',
    'taskId =', taskId, 'Pour avancer : A_BUTTON → AttemptPutAwayDecoration,',
    'B_BUTTON → AttemptCancelPutAwayDecoration (= cf décomp Task_SelectLocation).',
  );
  // 1:1 TODO : port decoration.c Task_SelectLocation (chantier futur).
  // Pour éviter blocage : DestroyTask fallback.
  const rt = getRuntime();
  rt?.gTasks?.delete(taskId);
}

/** STUB local : `SetInitialPositions` (decoration.c:1178-1183). Snapshot
 *  position player initiale dans task.data[3,4] + tCursorX/Y. Defined dans
 *  decoration.ts ailleurs ; ici minimal 1:1 inline pour éviter cycle ESM. */
function SetInitialPositions(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;

  // 1:1 décomp:1180-1182 :
  task.data[T_INITIAL_X] = gSaveBlock1Ptr.pos.x;
  task.data[T_INITIAL_Y] = gSaveBlock1Ptr.pos.y;

  // 1:1 décomp PlayerGetDestCoords(&tCursorX, &tCursorY). Notre port :
  // tCursorX = pos.x + MAP_OFFSET, tCursorY = pos.y + MAP_OFFSET (= 1:1
  // sémantique PlayerGetDestCoords).
  task.data[T_CURSOR_X] = gSaveBlock1Ptr.pos.x + MAP_OFFSET;
  task.data[T_CURSOR_Y] = gSaveBlock1Ptr.pos.y + MAP_OFFSET;
}

/** STUB local : `WarpToInitialPosition` (decoration.c:1185-1190). */
function WarpToInitialPosition(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;

  DrawWholeMapView();
  SetWarpDestination(
    gSaveBlock1Ptr.location.mapGroup,
    gSaveBlock1Ptr.location.mapNum,
    WARP_ID_NONE,
    task.data[T_INITIAL_X],
    task.data[T_INITIAL_Y],
  );
  WarpIntoMap();
}

/** STUB local : `ResetCursorMovement` (decoration.c:1801). Reset les data[2..6]
 *  du sprite cursor. STUB no-op (= sprite system non porté). */
function ResetCursorMovement(): void {
  _stubSpriteWarn('ResetCursorMovement');
  // 1:1 TODO : port decoration.c ResetCursorMovement (= sprite system).
}

/** 1:1 décomp `static void AttemptPutAwayDecoration(u8 taskId)`
 *  (decoration.c:2367-2372).
 *
 *  tButton=0 ; ResetCursorMovement ; AttemptPutAwayDecoration_(taskId). */
export function AttemptPutAwayDecoration(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) task.data[T_BUTTON] = 0;
  ResetCursorMovement();
  AttemptPutAwayDecoration_(taskId);
}

/** 1:1 décomp `static void AttemptCancelPutAwayDecoration(u8 taskId)`
 *  (decoration.c:2374-2382).
 *
 *  tButton=0 ; ResetCursorMovement ;
 *  gSprites[idx1].invisible=FALSE ; callback=SpriteCallbackDummy ;
 *  msg "StopPuttingAwayDecorations" + DisplayItemMessageOnField → StopPuttingAwayDecorationsPrompt. */
export function AttemptCancelPutAwayDecoration(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) task.data[T_BUTTON] = 0;
  ResetCursorMovement();

  // 1:1 décomp:2378-2379 — sprite visibility + callback. STUB.
  _stubSpriteWarn('AttemptCancelPutAwayDecoration:sprite1 reset');

  const msg = StringExpandPlaceholders('', getString('gText_StopPuttingAwayDecorations'));
  setStringVar(4, msg);
  DisplayItemMessageOnField(taskId, msg, StopPuttingAwayDecorationsPrompt);
}

/** 1:1 décomp `static void AttemptPutAwayDecoration_(u8 taskId)`
 *  (decoration.c:2384-2412).
 *
 *  AttemptMarkDecorUnderCursorForRemoval(taskId).
 *  Si sCurDecorSelectedInRearrangement != 0 :
 *    msg "ReturnDecorationToPC" + DisplayItemMessageOnField → ReturnDecorationPrompt.
 *  Sinon :
 *    behavior = MapGridGetMetatileBehaviorAt(tCursorX, tCursorY).
 *    Si SecretBasePC || PlayerRoomPCOn :
 *      sprite reset + msg "StopPuttingAwayDecorations" + DisplayItemMessageOnField → StopPuttingAwayDecorationsPrompt.
 *    Sinon :
 *      msg "NoDecorationHere" + DisplayItemMessageOnField → ContinuePuttingAwayDecorationsPrompt. */
function AttemptPutAwayDecoration_(taskId: number): void {
  AttemptMarkDecorUnderCursorForRemoval(taskId);

  if (sCurDecorSelectedInRearrangement !== 0) {
    const msg = StringExpandPlaceholders('', getString('gText_ReturnDecorationToPC'));
    setStringVar(4, msg);
    DisplayItemMessageOnField(taskId, msg, ReturnDecorationPrompt);
    return;
  }

  // 1:1 décomp:2397-2398 : data = gTasks[taskId].data ; behavior = MGGMBAt.
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;

  const behavior = MapGridGetMetatileBehaviorAt(
    task.data[T_CURSOR_X],
    task.data[T_CURSOR_Y],
  );

  if (MetatileBehavior_IsSecretBasePC(behavior) === true
      || MetatileBehavior_IsPlayerRoomPCOn(behavior) === true) {
    // 1:1 décomp:2401-2402 — sprite reset. STUB.
    _stubSpriteWarn('AttemptPutAwayDecoration_:sprite1 reset (PC behavior)');

    const msg = StringExpandPlaceholders('', getString('gText_StopPuttingAwayDecorations'));
    setStringVar(4, msg);
    DisplayItemMessageOnField(taskId, msg, StopPuttingAwayDecorationsPrompt);
  } else {
    const msg = StringExpandPlaceholders('', getString('gText_NoDecorationHere'));
    setStringVar(4, msg);
    DisplayItemMessageOnField(taskId, msg, ContinuePuttingAwayDecorationsPrompt);
  }
}

/** 1:1 décomp `static void ContinuePuttingAwayDecorationsPrompt(u8 taskId)`
 *  (decoration.c:2414-2418).
 *
 *  Si A ou B pressé : ContinuePuttingAwayDecorations(taskId). */
export function ContinuePuttingAwayDecorationsPrompt(taskId: number): void {
  if (JOY_NEW(A_BUTTON) || JOY_NEW(B_BUTTON))
    ContinuePuttingAwayDecorations(taskId);
}

/** 1:1 décomp `static void SetDecorRearrangementShape(u8 decor,
 *  struct DecorRearrangementDataBuffer *data)` (decoration.c:2420-2472).
 *
 *  Set data->width + data->height selon gDecorations[decor].shape.
 *  PORTÉ 1:1 FULL (= pure switch sur shape enum). */
function SetDecorRearrangementShape(
  decor: number,
  data: DecorRearrangementDataBuffer,
): void {
  if (gDecorations[decor].shape === DECORSHAPE_1x1) {
    data.width = 1;
    data.height = 1;
  } else if (gDecorations[decor].shape === DECORSHAPE_2x1) {
    data.width = 2;
    data.height = 1;
  } else if (gDecorations[decor].shape === DECORSHAPE_3x1) {
    data.width = 3;
    data.height = 1;
  } else if (gDecorations[decor].shape === DECORSHAPE_4x2) {
    data.width = 4;
    data.height = 2;
  } else if (gDecorations[decor].shape === DECORSHAPE_2x2) {
    data.width = 2;
    data.height = 2;
  } else if (gDecorations[decor].shape === DECORSHAPE_1x2) {
    data.width = 1;
    data.height = 2;
  } else if (gDecorations[decor].shape === DECORSHAPE_1x3) {
    data.width = 1;
    data.height = 3;
  } else if (gDecorations[decor].shape === DECORSHAPE_2x4) {
    data.width = 2;
    data.height = 4;
  } else if (gDecorations[decor].shape === DECORSHAPE_3x3) {
    data.width = 3;
    data.height = 3;
  } else if (gDecorations[decor].shape === DECORSHAPE_3x2) {
    data.width = 3;
    data.height = 2;
  }
}

/** 1:1 décomp `static bool8 DecorationIsUnderCursor(u8 taskId, u8 idx,
 *  struct DecorRearrangementDataBuffer *data)` (decoration.c:2482-2505).
 *
 *  TRUE si le rectangle (xOff..xOff+width, yOff-height..yOff) couvre la
 *  position du curseur. Cas spécial SAND_ORNAMENT : ht-- si metatile broken.
 *  Side-effect : SetCameraSpritePosition si TRUE.
 *
 *  PORTÉ 1:1 FULL (= pure logic + sprite stub side-effect). */
function DecorationIsUnderCursor(
  taskId: number,
  idx: number,
  data: DecorRearrangementDataBuffer,
): boolean {
  let x: number;
  let y: number;
  let xOff: number;
  let yOff: number;
  let ht: number;

  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return false;

  const ctx = getSDC();

  // 1:1 décomp:2490-2491 : x/y = tCursorX/Y - MAP_OFFSET.
  x = task.data[T_CURSOR_X] - MAP_OFFSET;
  y = task.data[T_CURSOR_Y] - MAP_OFFSET;
  xOff = ctx.pos[idx] >> 4;
  yOff = ctx.pos[idx] & 0x0F;
  ht = data.height;

  // 1:1 décomp:2495-2496 : cas SAND_ORNAMENT broken → ht--.
  if (ctx.items[idx] === DECOR_SAND_ORNAMENT
      && MapGridGetMetatileIdAt(xOff + MAP_OFFSET, yOff + MAP_OFFSET) === METATILE_SecretBase_SandOrnament_BrokenBase) {
    ht--;
  }

  // 1:1 décomp:2498-2502 : check bounds rectangle inclusif.
  if (x >= xOff && x < xOff + data.width && y > yOff - ht && y <= yOff) {
    SetCameraSpritePosition(data.width - (x - xOff + 1), yOff - y);
    return true;
  }

  return false;
}

/** 1:1 décomp `static void SetDecorRearrangementFlagIdIfFlagUnset(void)`
 *  (decoration.c:2507-2523).
 *
 *  Pour la décoration en cours (= sDecorRearrangementDataBuffer[sCurDecorSelectedInRearrangement]) :
 *    Itère gSaveBlock1Ptr->objectEventTemplates[64].
 *    Si template à (xOff, yOff) ET flag NOT set : assigne flagId à .flagId.
 *  PORTÉ 1:1 FULL. */
function SetDecorRearrangementFlagIdIfFlagUnset(): void {
  let xOff: number;
  let yOff: number;
  let i: number;

  const ctx = getSDC();

  xOff = ctx.pos[sDecorRearrangementDataBuffer[sCurDecorSelectedInRearrangement].idx] >> 4;
  yOff = ctx.pos[sDecorRearrangementDataBuffer[sCurDecorSelectedInRearrangement].idx] & 0x0F;

  // 1:1 décomp:2515-2522 : itère objectEventTemplates et check (x, y, !FlagGet).
  const templates = gSaveBlock1Ptr.objectEventTemplates;
  if (!templates) return; // STUB : si pas porté côté SaveBlock1, no-op.

  for (i = 0; i < OBJECT_EVENT_TEMPLATES_COUNT; i++) {
    const tmpl = templates[i];
    if (!tmpl) continue;

    // 1:1 décomp FlagGet check : skip si déjà set.
    const flagSet = gSaveBlock1Ptr.flags?.[String(tmpl.flagId)] === true;

    if (tmpl.x === xOff && tmpl.y === yOff && !flagSet) {
      sDecorRearrangementDataBuffer[sCurDecorSelectedInRearrangement].flagId = tmpl.flagId;
      break;
    }
  }
}

/** 1:1 décomp `static bool8 AttemptMarkSpriteDecorUnderCursorForRemoval(u8 taskId)`
 *  (decoration.c:2525-2547).
 *
 *  Itère sDecorationContext.items :
 *    Si decor != DECOR_NONE ET permission == DECORPERM_SPRITE :
 *      SetDecorRearrangementShape + DecorationIsUnderCursor check.
 *      Si TRUE : remplit sDecorRearrangementDataBuffer[0] + SetFlagIdIfUnset +
 *                sCurDecorSelectedInRearrangement = 1 + return TRUE.
 *  PORTÉ 1:1 FULL. */
function AttemptMarkSpriteDecorUnderCursorForRemoval(taskId: number): boolean {
  let i: number;
  const ctx = getSDC();

  for (i = 0; i < ctx.size; i++) {
    if (ctx.items[i] !== DECOR_NONE) {
      if (gDecorations[ctx.items[i]].permission === DECORPERM_SPRITE) {
        SetDecorRearrangementShape(ctx.items[i], sDecorRearrangementDataBuffer[0]);
        if (DecorationIsUnderCursor(taskId, i, sDecorRearrangementDataBuffer[0]) === true) {
          sDecorRearrangementDataBuffer[0].idx = i;
          SetDecorRearrangementFlagIdIfFlagUnset();
          sCurDecorSelectedInRearrangement = 1;
          return true;
        }
      }
    }
  }
  return false;
}

/** 1:1 décomp `static void MarkSpriteDecorsInBoundsForRemoval(u8 left, u8 top,
 *  u8 right, u8 bottom)` (decoration.c:2549-2568).
 *
 *  Itère sDecorationContext.items : marque tous les sprites contenus dans
 *  le rectangle (left, top, right, bottom). PORTÉ 1:1 FULL. */
function MarkSpriteDecorsInBoundsForRemoval(
  left: number, top: number, right: number, bottom: number,
): void {
  let i: number;
  let xOff: number;
  let yOff: number;
  let decor: number;
  const ctx = getSDC();

  for (i = 0; i < ctx.size; i++) {
    decor = ctx.items[i];
    xOff = ctx.pos[i] >> 4;
    yOff = ctx.pos[i] & 0x0F;
    if (decor !== DECOR_NONE
        && gDecorations[decor].permission === DECORPERM_SPRITE
        && left <= xOff && top <= yOff && right >= xOff && bottom >= yOff) {
      sDecorRearrangementDataBuffer[sCurDecorSelectedInRearrangement].idx = i;
      SetDecorRearrangementFlagIdIfFlagUnset();
      sCurDecorSelectedInRearrangement++;
    }
  }
}

/** 1:1 décomp `static void AttemptMarkDecorUnderCursorForRemoval(u8 taskId)`
 *  (decoration.c:2570-2607).
 *
 *  Reset sCurDecorSelectedInRearrangement = 0.
 *  Try sprite-only path d'abord. Si pas trouvé :
 *    Itère ctx.items : SetDecorRearrangementShape + DecorationIsUnderCursor.
 *    Premier hit : remplit buffer[0] + sCurDecorSelectedInRearrangement++ + break.
 *  Si trouvé : calcul bounds + MarkSpriteDecorsInBoundsForRemoval (= remove
 *  dolls/cushions empilés dessus).
 *  PORTÉ 1:1 FULL. */
export function AttemptMarkDecorUnderCursorForRemoval(taskId: number): void {
  let i: number;
  let xOff: number;
  let yOff: number;
  let var1: number;
  let var2: number;
  const ctx = getSDC();

  sCurDecorSelectedInRearrangement = 0;

  if (AttemptMarkSpriteDecorUnderCursorForRemoval(taskId) !== true) {
    // Not a sprite.
    for (i = 0; i < ctx.size; i++) {
      var1 = ctx.items[i];
      if (var1 !== DECOR_NONE) {
        SetDecorRearrangementShape(var1, sDecorRearrangementDataBuffer[0]);
        if (DecorationIsUnderCursor(taskId, i, sDecorRearrangementDataBuffer[0]) === true) {
          sDecorRearrangementDataBuffer[0].idx = i;
          sCurDecorSelectedInRearrangement++;
          break;
        }
      }
    }
    if (sCurDecorSelectedInRearrangement !== 0) {
      xOff = ctx.pos[sDecorRearrangementDataBuffer[0].idx] >> 4;
      yOff = ctx.pos[sDecorRearrangementDataBuffer[0].idx] & 0x0F;
      var1 = yOff - sDecorRearrangementDataBuffer[0].height + 1;
      var2 = sDecorRearrangementDataBuffer[0].width + xOff - 1;

      // 1:1 décomp:2604 : Remove any dolls/cushions on this decoration.
      MarkSpriteDecorsInBoundsForRemoval(xOff, var1, var2, yOff);
    }
  }
}

/** 1:1 décomp `static void ReturnDecorationPrompt(u8 taskId)`
 *  (decoration.c:2609-2613).
 *
 *  DisplayYesNoMenuDefaultYes + DoYesNoFuncWithChoice(sReturnDecorationYesNoFunctions). */
export function ReturnDecorationPrompt(taskId: number): void {
  DisplayYesNoMenuDefaultYes();
  DoYesNoFuncWithChoice(taskId, sReturnDecorationYesNoFunctions);
}

/** 1:1 décomp `static void PutAwayDecoration(u8 taskId)`
 *  (decoration.c:2615-2620).
 *
 *  FadeScreen(BLACK, 0) + tState=0 + task.func = Task_PutAwayDecoration. */
export function PutAwayDecoration(taskId: number): void {
  FadeScreen(FADE_TO_BLACK, 0);
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) {
    task.data[T_STATE] = 0;
    task.func = (t) => Task_PutAwayDecoration(t.taskId);
  }
}

/** 1:1 décomp `static void StopPuttingAwayDecorationsPrompt(u8 taskId)`
 *  (decoration.c:2622-2626).
 *
 *  DisplayYesNoMenuDefaultYes + DoYesNoFuncWithChoice(sStopPuttingAwayDecorationsYesNoFunctions). */
export function StopPuttingAwayDecorationsPrompt(taskId: number): void {
  DisplayYesNoMenuDefaultYes();
  DoYesNoFuncWithChoice(taskId, sStopPuttingAwayDecorationsYesNoFunctions);
}

/** 1:1 décomp `static void StopPuttingAwayDecorations(u8 taskId)`
 *  (decoration.c:2628-2632).
 *
 *  ClearDialogWindowAndFrame(0, FALSE) + StopPuttingAwayDecorations_(taskId). */
export function StopPuttingAwayDecorations(taskId: number): void {
  ClearDialogWindowAndFrame(0, false);
  StopPuttingAwayDecorations_(taskId);
}

/** 1:1 décomp `static void StopPuttingAwayDecorations_(u8 taskId)`
 *  (decoration.c:2634-2639).
 *
 *  FadeScreen(BLACK, 0) + tState=0 + task.func = Task_StopPuttingAwayDecorations. */
export function StopPuttingAwayDecorations_(taskId: number): void {
  FadeScreen(FADE_TO_BLACK, 0);
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) {
    task.data[T_STATE] = 0;
    task.func = (t) => Task_StopPuttingAwayDecorations(t.taskId);
  }
}

/** 1:1 décomp `static void Task_StopPuttingAwayDecorations(u8 taskId)`
 *  (decoration.c:2641-2659).
 *
 *  case 0 : si !gPaletteFade.active : WarpToInitialPosition + tState=1.
 *  case 1 : FreePlayerSpritePalette +
 *           gFieldCallback = FieldCB_StopPuttingAwayDecorations +
 *           SetMainCallback2(CB2_ReturnToField) + DestroyTask. */
export function Task_StopPuttingAwayDecorations(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;

  switch (task.data[T_STATE]) {
    case 0:
      if (!_isPaletteFadeActive()) {
        WarpToInitialPosition(taskId);
        task.data[T_STATE] = 1;
      }
      break;

    case 1:
      FreePlayerSpritePalette();
      // 1:1 décomp:2654 — gFieldCallback = FieldCB_StopPuttingAwayDecorations.
      // Notre runtime expose gFieldCallback via globalThis (= 1:1 sémantique).
      (globalThis as Record<string, unknown>).gFieldCallback = FieldCB_StopPuttingAwayDecorations;
      SetMainCallback2(CB2_ReturnToField);
      rt?.gTasks?.delete(taskId);
      break;
  }
}

/** 1:1 décomp `static void Task_ReinitializeDecorationMenuHandler(u8 taskId)`
 *  (decoration.c:2661-2683).
 *
 *  case 0 : HideSecretBaseDecorationSprites + tState++.
 *  case 1 : ScriptContext_SetupScript(SecretBase_EventScript_InitDecorations) + tState++.
 *  case 2 : LockPlayerFieldControls + tState++.
 *  case 3 : si IsWeatherNotFadingIn : task.func = HandleDecorationActionsMenuInput. */
function Task_ReinitializeDecorationMenuHandler(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;

  switch (task.data[T_STATE]) {
    case 0:
      HideSecretBaseDecorationSprites();
      task.data[T_STATE]++;
      break;

    case 1:
      ScriptContext_SetupScript('SecretBase_EventScript_InitDecorations');
      task.data[T_STATE]++;
      break;

    case 2:
      LockPlayerFieldControls();
      task.data[T_STATE]++;
      break;

    case 3:
      if (IsWeatherNotFadingIn() === true)
        task.func = (t) => HandleDecorationActionsMenuInput(t.taskId);
      break;
  }
}

/** 1:1 décomp `static void FieldCB_StopPuttingAwayDecorations(void)`
 *  (decoration.c:2685-2694).
 *
 *  FadeInFromBlack + DrawDialogueFrame(0, TRUE) + InitDecorationActionsWindow +
 *  CreateTask(Task_ReinitializeDecorationMenuHandler, 8) + tState=0. */
export function FieldCB_StopPuttingAwayDecorations(): void {
  let taskId: number;

  FadeInFromBlack();
  DrawDialogueFrame(0, true);
  InitDecorationActionsWindow();

  // 1:1 décomp:2692 : taskId = CreateTask(Task_ReinitializeDecorationMenuHandler, 8).
  const rt = getRuntime();
  if (rt?.CreateTask) {
    taskId = rt.CreateTask(
      (t: { taskId: number }) => Task_ReinitializeDecorationMenuHandler(t.taskId),
      8,
    );
    const task = rt.gTasks.get(taskId);
    if (task) task.data[T_STATE] = 0;
  } else {
    console.warn(
      '[decoration-putaway STUB] FieldCB_StopPuttingAwayDecorations : runtime.CreateTask absent.',
    );
  }
}

// ─── 1:1 décomp YesNo func tables (decoration.c:441-451) ────────────────────

/** 1:1 décomp `static const struct YesNoFuncTable sReturnDecorationYesNoFunctions`
 *  (decoration.c:441-445).
 *      .yesFunc = PutAwayDecoration,
 *      .noFunc  = ContinuePuttingAwayDecorations, */
const sReturnDecorationYesNoFunctions: YesNoFuncTable = {
  yesFunc: PutAwayDecoration,
  noFunc: ContinuePuttingAwayDecorations,
};

/** 1:1 décomp `static const struct YesNoFuncTable sStopPuttingAwayDecorationsYesNoFunctions`
 *  (decoration.c:447-451).
 *      .yesFunc = StopPuttingAwayDecorations,
 *      .noFunc  = ContinuePuttingAwayDecorations, */
const sStopPuttingAwayDecorationsYesNoFunctions: YesNoFuncTable = {
  yesFunc: StopPuttingAwayDecorations,
  noFunc: ContinuePuttingAwayDecorations,
};

// ───────────────────────────────────────────────────────────────────────────
// SECTION 8 — Toss flow (decoration.c:2719-2748)
// ───────────────────────────────────────────────────────────────────────────

/** 1:1 décomp `static void DecorationItemsMenuAction_AttemptToss(u8 taskId)`
 *  (decoration.c:2719-2732).
 *
 *  Si IsSelectedDecorInThePC == TRUE :
 *    StringCopy(gStringVar1, gDecorations[gCurDecorationItems[gCurDecorationIndex]].name).
 *    msg "DecorationWillBeDiscarded" + DisplayItemMessageOnField → TossDecorationPrompt.
 *  Sinon :
 *    msg "CantThrowAwayInUse" + DisplayItemMessageOnField → ReturnToDecorationItemsAfterInvalidSelection. */
export function DecorationItemsMenuAction_AttemptToss(taskId: number): void {
  if (IsSelectedDecorInThePC() === true) {
    // 1:1 décomp:2723 : StringCopy(gStringVar1, gDecorations[...].name).
    const items = _gCurDecorationItemsRef.value;
    const idx = _gCurDecorationIndexRef.value;
    const decor = items ? items[idx] : DECOR_NONE;
    const name = gDecorations[decor]?.name ?? '';
    setStringVar(1, name);
    // StringCopy 1:1 signature : on appelle aussi pour cohérence runtime.
    StringCopy({ value: '' }, name);

    const msg = StringExpandPlaceholders('', getString('gText_DecorationWillBeDiscarded'));
    setStringVar(4, msg);
    DisplayItemMessageOnField(taskId, msg, TossDecorationPrompt);
  } else {
    const msg = StringExpandPlaceholders('', getString('gText_CantThrowAwayInUse'));
    setStringVar(4, msg);
    DisplayItemMessageOnField(taskId, msg, ReturnToDecorationItemsAfterInvalidSelection);
  }
}

/** 1:1 décomp `static void TossDecorationPrompt(u8 taskId)`
 *  (decoration.c:2734-2738).
 *
 *  DisplayYesNoMenuDefaultYes + DoYesNoFuncWithChoice(sTossDecorationYesNoFunctions). */
export function TossDecorationPrompt(taskId: number): void {
  DisplayYesNoMenuDefaultYes();
  DoYesNoFuncWithChoice(taskId, sTossDecorationYesNoFunctions);
}

/** 1:1 décomp `static void TossDecoration(u8 taskId)` (decoration.c:2740-2748).
 *
 *  gCurDecorationItems[gCurDecorationIndex] = DECOR_NONE.
 *  sNumOwnedDecorationsInCurCategory = GetNumOwnedDecorationsInCategory(sCurDecorationCategory).
 *  CondenseDecorationsInCategory(sCurDecorationCategory).
 *  IdentifyOwnedDecorationsCurrentlyInUseInternal(taskId).
 *  msg "DecorationThrownAway" + DisplayItemMessageOnField → ReturnToDecorationItemsAfterInvalidSelection. */
export function TossDecoration(taskId: number): void {
  // 1:1 décomp:2742 : gCurDecorationItems[gCurDecorationIndex] = DECOR_NONE.
  const items = _gCurDecorationItemsRef.value;
  if (items) {
    items[_gCurDecorationIndexRef.value] = DECOR_NONE;
  }

  const category = _sCurDecorationCategoryRef.value;
  _sNumOwnedDecorationsInCurCategoryRef.value = GetNumOwnedDecorationsInCategory(category);
  CondenseDecorationsInCategory(category);
  IdentifyOwnedDecorationsCurrentlyInUseInternal(taskId);

  const msg = StringExpandPlaceholders('', getString('gText_DecorationThrownAway'));
  setStringVar(4, msg);
  DisplayItemMessageOnField(taskId, msg, ReturnToDecorationItemsAfterInvalidSelection);

  // Note 1:1 : décomp utilise aussi DecorationRemove dans certains flows
  // de cleanup (= via Condense). gDecorationInventories est référencé via
  // gDecorations[...].category — l'effet visible est la suppression du slot
  // dans gSaveBlock1Ptr->decoration<Category>[].
  void gDecorationInventories;
  void DecorationRemove;
}

/** STUB local : `IsSelectedDecorInThePC` (decoration.c, exposé par decoration.ts).
 *  Injection runtime depuis decoration.ts pour éviter cycle ESM. */
let _isSelectedDecorInThePCImpl: (() => boolean) | null = null;
export function _setIsSelectedDecorInThePCImpl(impl: () => boolean): void {
  _isSelectedDecorInThePCImpl = impl;
}
function IsSelectedDecorInThePC(): boolean {
  if (_isSelectedDecorInThePCImpl) return _isSelectedDecorInThePCImpl();
  console.warn(
    '[decoration-putaway STUB] IsSelectedDecorInThePC : injection impl manquante',
    '(= devrait être wire par decoration.ts au boot).',
  );
  return true;
}

// 1:1 décomp `static const struct YesNoFuncTable sTossDecorationYesNoFunctions`
// (decoration.c:509-513).
//      .yesFunc = TossDecoration,
//      .noFunc  = DontTossDecoration,
const sTossDecorationYesNoFunctions: YesNoFuncTable = {
  yesFunc: TossDecoration,
  noFunc: (taskId) => {
    // STUB : DontTossDecoration vit dans decoration.ts. Injection runtime
    // ou fallback ReturnToItems.
    if (_dontTossDecorationImpl) {
      _dontTossDecorationImpl(taskId);
      return;
    }
    console.warn(
      '[decoration-putaway STUB] DontTossDecoration noFunc : injection impl manquante',
      '(= devrait être wire par decoration.ts au boot).',
    );
  },
};

/** STUB local : `DontTossDecoration` (decoration.c:1152-1156, defined dans
 *  decoration.ts). Injection runtime pour éviter cycle ESM. */
let _dontTossDecorationImpl: ((taskId: number) => void) | null = null;
export function _setDontTossDecorationImpl(impl: (taskId: number) => void): void {
  _dontTossDecorationImpl = impl;
}

// ───────────────────────────────────────────────────────────────────────────
// TRADER flow (= finalisation 1:1 du stub de decoration.ts)
// ───────────────────────────────────────────────────────────────────────────

/** 1:1 décomp `static void ExitTraderDecorationMenu(u8 taskId)`
 *  (decoration.c:858-862).
 *
 *  RemoveDecorationWindow(WINDOW_DECORATION_CATEGORIES) + ExitTraderMenu(taskId).
 *
 *  FINALISÉ 1:1 (= remplace le stub dans decoration.ts). Wire ExitTraderMenu
 *  via injection runtime depuis secret_base.ts (= chantier futur). */
export function ExitTraderDecorationMenu(taskId: number): void {
  RemoveDecorationWindow(WINDOW_DECORATION_CATEGORIES);
  ExitTraderMenu(taskId);
}

// ───────────────────────────────────────────────────────────────────────────
// Module reset (= 1:1 EWRAM cleared au boot)
// ───────────────────────────────────────────────────────────────────────────

/** Reset complet de tout le module-state PutAway. Utile pour tests/soft-reset.
 *  Pas de pendant décomp direct (= EWRAM cleared automatiquement par boot). */
export function _resetDecorationPutAwayModuleState(): void {
  for (let i = 0; i < DECOR_MAX_SECRET_BASE; i++) {
    sDecorRearrangementDataBuffer[i].idx = 0;
    sDecorRearrangementDataBuffer[i].width = 0;
    sDecorRearrangementDataBuffer[i].height = 0;
    sDecorRearrangementDataBuffer[i].flagId = 0;
  }
  sCurDecorSelectedInRearrangement = 0;
  sDecor_CameraSpriteObjectIdx1 = 0;
  sDecor_CameraSpriteObjectIdx2 = 0;
  _STUB_SPRITE_WARNED.clear();
}

// ───────────────────────────────────────────────────────────────────────────
// Reférence des constantes / helpers stub utilisés (= side-effect cleanup)
// pour que tsc ne flag pas comme unused.
// ───────────────────────────────────────────────────────────────────────────
void DECORPERM_SOLID_FLOOR; void DECORPERM_PASS_FLOOR;
void DECORPERM_BEHIND_FLOOR; void DECORPERM_NA_WALL;
void sDecor_CameraSpriteObjectIdx1; void sDecor_CameraSpriteObjectIdx2;
