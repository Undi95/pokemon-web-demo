/**
 * option-menu-return.ts
 * ----------------------
 * 1:1 décomp `CB2_ReturnToFieldWithOpenMenu` + `CB2_ReturnToFieldLocal` flow
 * (overworld.c:1638-1681), mais avec `gMain.state` mutable correctement.
 *
 * Pourquoi ce module :
 *   Le auto-fichier `overworld-all-auto.ts` traduit `static bool32
 *   ReturnToFieldLocal(u8 *state)` en `function ReturnToFieldLocal(state: any)`.
 *   Le décomp passe `&gMain.state` (pointer), donc `(*state)++` mute la
 *   variable du caller. Notre transpiler passe par valeur, donc `state++` ne
 *   propage PAS au caller (gMain.state) → state machine bloque case 0 forever.
 *
 *   Cette implémentation manuelle reproduit la state machine 1:1 mais avec
 *   `gMain.state++` direct. Bypass le auto-fichier broken.
 *
 * Flow décomp 1:1 (B button option menu) :
 *   1. Task_OptionMenuFadeOut → SetMainCallback2(gMain.savedCallback) qui est
 *      `CB2_ReturnToFieldWithOpenMenu_Manual`.
 *   2. CB2_ReturnToFieldWithOpenMenu_Manual : FieldClearVBlankHBlankCallbacks +
 *      gFieldCallback2 = FieldCB_ReturnToFieldOpenStartMenu + reset state +
 *      SetMainCallback2(CB2_ReturnToFieldLocal_Manual).
 *   3. CB2_ReturnToFieldLocal_Manual : state machine 0..3.
 *      - case 0 : reset (ResetTasks/ResetSpriteData/ResetPaletteFade)
 *      - case 1 : await re-init overworld via _restoreOverworldFromMenu()
 *      - case 2 : RunFieldCallback (= call gFieldCallback2 → ouvre start menu)
 *      - case 3 : SetMainCallback2(_overworldMainCB2) (= MainCB2_Overworld custom)
 *
 * Source de vérité décomp :
 *   - src/overworld.c:1670 CB2_ReturnToFieldWithOpenMenu
 *   - src/overworld.c:1638 CB2_ReturnToFieldLocal
 *   - src/overworld.c:1961 ReturnToFieldLocal
 *   - src/overworld.c:1505 RunFieldCallback
 *   - src/start_menu.c:543-559 FieldCB_ReturnToFieldStartMenu + ShowReturnToFieldStartMenu
 *   - src/field_screen_effect.c:440 FieldCB_ReturnToFieldOpenStartMenu
 */

import { getRuntime, gMain, ResetTasks, ResetPaletteFade, FillPalBufferBlack } from '../../../harness/runtime/decomp-globals';
import { ResetSpriteData } from '../../../harness/runtime/decomp-bridge';
import { InitFieldMessageBox } from '../../field_message_box';
import { FadeScreen, FADE_FROM_BLACK } from '../system/fade-screen';

/** 1:1 décomp `bool8 FieldCB_ReturnToFieldOpenStartMenu(void)`
 *  (field_screen_effect.c:440) :
 *
 *      ShowReturnToFieldStartMenu();
 *      return FALSE;
 *
 *  ShowReturnToFieldStartMenu set `gFieldCallback2 = FieldCB_ReturnToFieldStartMenu`
 *  (= second-stage callback). Returns FALSE pour que `RunFieldCallback` répète
 *  la frame suivante avec le NEW gFieldCallback2 (= chain pattern décomp). */
function FieldCB_ReturnToFieldOpenStartMenu(): boolean {
  // 1:1 décomp `ShowReturnToFieldStartMenu` (start_menu.c:554) :
  //   sInitStartMenuData[0] = 0; sInitStartMenuData[1] = 0;
  //   gFieldCallback2 = FieldCB_ReturnToFieldStartMenu;
  // Notre wrapper TS skip le sInitStartMenuData (= state machine du init multi-step
  // décomp pas porté ici car notre `startMenu.open()` est synchrone).
  //
  // ⚠️ USER FLAG 2026-05-20 (in-game devtools confirmé via frame freeze) :
  // 1 frame de flash visible ici. À ce point :
  //   - case 1 ReturnToFieldLocal a loadé les NEW tileset palettes
  //     (= LoadPalette écrit Faded + Unfaded aux nouvelles couleurs)
  //   - case 2 RunFieldCallback appelle CE callback (= 1er cb2 dans la chaîne)
  //   - Returns FALSE → state reste à 2 → frame rendu AVANT que le 2ème cb2
  //     (FieldCB_ReturnToFieldStartMenu) fire son FillPalBufferBlack +
  //     FadeScreen. Pendant ce frame, Faded = couleurs nouvelles → FLASH.
  // Fix : FillPalBufferBlack ICI, dans le 1er cb2. Le render qui suit dans
  // la MÊME frame voit Faded=black → pas de flash. Le 2ème cb2 fait
  // FillPalBufferBlack à nouveau (= idempotent) puis FadeScreen.
  // Décomp 1:1 ne fait pas ce clear ici (= leur impl est sync donc pas de
  // gap visible), mais avec notre tick + async restore ici c'est nécessaire.
  FillPalBufferBlack();
  (globalThis as Record<string, unknown>).gFieldCallback2 = FieldCB_ReturnToFieldStartMenu;
  return false;
}

/** 1:1 décomp `bool8 FieldCB_ReturnToFieldStartMenu(void)` (start_menu.c:543) :
 *
 *      if (InitStartMenuStep() == FALSE) return FALSE;
 *      ReturnToFieldOpenStartMenu();
 *      return TRUE;
 *
 *  `ReturnToFieldOpenStartMenu` (field_screen_effect.c:433) :
 *      FadeInFromBlack();
 *      CreateTask(Task_WaitForFadeShowStartMenu, 0x50);
 *      LockPlayerFieldControls();
 *
 *  Notre version simplifiée : open start menu directement (= notre TS
 *  startMenu.open() handle l'ouverture sync). */
function FieldCB_ReturnToFieldStartMenu(): boolean {
  // 1:1 décomp `FieldCB_ReturnToFieldStartMenu` (start_menu.c:543-552) :
  //   if (InitStartMenuStep() == FALSE) return FALSE;
  //   ReturnToFieldOpenStartMenu();
  //   return TRUE;
  //
  // ⚠️ USER FLAG 2026-05-20 (round 3, devtools ingame frozen frame) :
  // Le décomp BUILD le menu (= window + items + cursor draw via
  // InitStartMenuStep cases 0..5) AVANT d'appeler ReturnToFieldOpenStartMenu
  // qui fait FadeInFromBlack. Le LoadPalette du menu (cases 2-3-5) écrit
  // palette 14/15 dans Faded+Unfaded ; puis FillPalBufferBlack clear le
  // Faded ENTIER (= y compris palette menu) ; puis FadeScreen FROM_BLACK
  // anime le fade depuis 0 → Unfaded → menu+field fade in ENSEMBLE.
  //
  // Notre `sm.open()` est synchrone (= équivalent fonctionnel à while
  // (InitStartMenuStep() == FALSE) ;). On l'appelle AVANT FillPalBufferBlack
  // pour que la palette menu soit dans Unfaded au moment du FillPalBufferBlack
  // → fade in tire le menu depuis black vers Unfaded en même temps que le field.
  //
  // Cursor persiste 1:1 décomp `sStartMenuCursorPos` (= module static, jamais
  // reset entre opens). Voir start-menu.ts sCursorPos.
  const sm = (globalThis as Record<string, unknown>).startMenu as
    { open?: () => void } | undefined;
  sm?.open?.();
  // 1:1 décomp `ReturnToFieldOpenStartMenu` (field_screen_effect.c:433) :
  //   FadeInFromBlack();  // = FillPalBufferBlack + FadeScreen(FADE_FROM_BLACK, 0)
  //   CreateTask(Task_WaitForFadeShowStartMenu, 0x50);  // = active input post-fade
  //   LockPlayerFieldControls();  // déjà set via sm.open()
  FillPalBufferBlack();
  FadeScreen(FADE_FROM_BLACK, 0);
  return true;
}

/** 1:1 décomp `bool8 RunFieldCallback(void)` (overworld.c:1505) :
 *
 *      if (gFieldCallback2) {
 *          if (!gFieldCallback2()) return FALSE;
 *          else { gFieldCallback2 = NULL; gFieldCallback = NULL; }
 *      } else {
 *          if (gFieldCallback) gFieldCallback();
 *          else FieldCB_DefaultWarpExit();
 *          gFieldCallback = NULL;
 *      }
 *      return TRUE;
 */
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

/** Flag interne : true entre case 1 (kick off async restore) et la résolution
 *  (state→2). Évite de re-trigger restoreOverworldFromMenu sur les frames
 *  suivantes pendant que la promise est in-flight. */
let _isRestoringOverworld = false;

/** 1:1 décomp `bool32 ReturnToFieldLocal(u8 *state)` (overworld.c:1961) mais
 *  avec `gMain.state` mutable directement (= bypass le bug pointer arg du
 *  transpiler). Returns true quand la state machine atteint case 3 (= done). */
function ReturnToFieldLocal_Manual(): boolean {
  switch (gMain.state) {
    case 0: {
      // 1:1 décomp case 0 : ResetMirageTowerAndSaveBlockPtrs (no-op pour notre
      // arch — pas de mirage tower pulse + save blocks sont gérés par game-state),
      // ResetScreenForMapLoad (DmaClear PLTT/VRAM/OAM — déjà clear par option
      // menu CB2_InitOptionMenu, no-op redondant), ResumeMap (ResetTasks +
      // ResetSpriteData + ResetPaletteFade — les essentiels).
      ResetTasks();
      ResetSpriteData();
      ResetPaletteFade();
      // 1:1 décomp `ResetVramOamAndBgCntRegs` (menu_helpers.c:97) appelé par
      // `ResetScreenForMapLoad` (overworld.c:2077) au début de
      // `CB2_ReturnToFieldLocal` case 0. CRITIQUE : reset BLDCNT/BLDY/WIN regs
      // sinon les effets du sub-menu (= option menu set BLDCNT_EFFECT_DARKEN +
      // BLDY=4 pour le highlight) persistent → BG0 reste assombri en revenant
      // à l'overworld → dialog text apparaît "noirci" (= user session 129 bug
      // report "toutes les palette des textbox sont noircie").
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
      // 1:1 décomp `InitFieldMessageBox` (= post-FreeAllWindowBuffers reset).
      // Le bag/options ont fait `InitWindows([...])` qui appelle `FreeAllWindowBuffers`
      // → tous les slots gWindows[] free, mais `sWindowId` dans field-message-box.ts
      // (let module-level) garde encore la valeur alloué AVANT le bag. Sans reset
      // ici, le prochain ShowFieldMessage skip le AddWindow (= sWindowId >= 0)
      // mais AddTextPrinterParameterized3 fail "window N not found" → dialog
      // sign/dialogbox invisible (user session 129 bug report).
      InitFieldMessageBox();
      gMain.state++;
      break;
    }
    case 1: {
      // 1:1 décomp case 1 : InitViewGraphics (= setup BG regs + DISPCNT +
      // ShowBg + InitFieldMessageBox + InitMapView). Notre helper
      // `_restoreOverworldFromMenu` exposé par TestOverworldScene fait tout
      // ce travail + re-spawn NPCs (= 1:1 InitObjectEventsReturnToField).
      // Async car loadAndInitMap fetch tilesets/palettes via fetch().
      if (!_isRestoringOverworld) {
        _isRestoringOverworld = true;
        const restore = (globalThis as Record<string, unknown>)._restoreOverworldFromMenu as (() => Promise<void>) | undefined;
        if (typeof restore === 'function') {
          void restore().then(() => {
            gMain.state++;
            _isRestoringOverworld = false;
            // ⚠️ `_restoreOverworldFromMenu` fait `SetMainCallback2(MainCB2_Overworld)`
            // à sa FIN (TestOverworldScene, fix retour-combat "voie L") → le state
            // machine n'est plus tické → case 2 (RunFieldCallback) ne tourne JAMAIS
            // via le tick. Or le décomp run RunFieldCallback (case 2) AVANT
            // SetMainCallback2(CB2_Overworld). Pour un field-move party-menu en
            // attente (gPostMenuFieldCallback posé par SetUpFieldMove_X), on run
            // donc RunFieldCallback ICI, juste après le restore (= place 1:1 de
            // case 2). Gardé pour ne pas changer le retour option-menu/normal.
            // gPostMenuFieldCallback : field-move party-menu (gFieldCallback2 = PrepareFadeInFromMenu).
            // gFieldCallback : item-use field (vélo/canne/détecteur → FieldCB_UseItemOnField, posé par
            // SetUpItemUseOnFieldCallback ; newScreenCallback = CB2_ReturnToField, donc PAS de
            // gFieldCallback2 ici). On N'inclut PAS gFieldCallback2 seul (= retour WithOpenMenu normal
            // = ré-ouverture start menu) pour ne pas changer le retour-sac/options standard.
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
      // 1:1 décomp case 2 : `if (RunFieldCallback()) (*state)++`. Première frame
      // RunFieldCallback appelle FieldCB_ReturnToFieldOpenStartMenu qui set
      // gFieldCallback2 = FieldCB_ReturnToFieldStartMenu et returns FALSE.
      // Frame suivante, RunFieldCallback appelle FieldCB_ReturnToFieldStartMenu
      // qui open le start menu et returns TRUE → state++.
      if (RunFieldCallback_Manual()) gMain.state++;
      break;
    }
    case 3: {
      // 1:1 décomp `return TRUE` → CB2_ReturnToFieldLocal post-case 3 :
      //   SetFieldVBlankCallback(); SetMainCallback2(CB2_Overworld);
      return true;
    }
  }
  return false;
}

/** 1:1 décomp `static void CB2_ReturnToFieldLocal(void)` (overworld.c:1638) :
 *
 *      if (ReturnToFieldLocal(&gMain.state)) {
 *          SetFieldVBlankCallback();
 *          SetMainCallback2(CB2_Overworld);
 *      }
 *
 *  Notre `CB2_Overworld` = `MainCB2_Overworld` (= closure custom de
 *  TestOverworldScene exposé via globalThis._overworldMainCB2). */
export function CB2_ReturnToFieldLocal_Manual(): void {
  if (ReturnToFieldLocal_Manual()) {
    const rt = getRuntime();
    // 1:1 décomp `SetFieldVBlankCallback` (overworld.c:1385) — already done
    // par _restoreOverworldFromMenu via SetVBlankCallback.
    const cb2 = (globalThis as Record<string, unknown>)._overworldMainCB2 as (() => void) | undefined;
    if (typeof cb2 === 'function') {
      rt.SetMainCallback2(cb2);
    } else {
      console.error('[CB2_ReturnToFieldLocal_Manual] _overworldMainCB2 not exposed');
    }
  }
}

/** 1:1 décomp `void CB2_ReturnToFieldWithOpenMenu(void)` (overworld.c:1670) :
 *
 *      FieldClearVBlankHBlankCallbacks();
 *      gFieldCallback2 = FieldCB_ReturnToFieldOpenStartMenu;
 *      CB2_ReturnToField();   // → SetMainCallback2(CB2_ReturnToFieldLocal)
 *
 *  Notre version reset gMain.state à 0 pour le state machine + pointe vers
 *  notre version manuelle CB2_ReturnToFieldLocal_Manual. */
export function CB2_ReturnToFieldWithOpenMenu_Manual(): void {
  // 1:1 décomp `FieldClearVBlankHBlankCallbacks` : SetVBlankCallback(NULL) +
  // SetHBlankCallback(NULL). Notre arch n'a pas de HBlank (= simulé par
  // ScanlineEffect). VBlank est reset par _restoreOverworldFromMenu.
  const rt = getRuntime();
  rt.SetVBlankCallback(null);
  // 1:1 décomp `gFieldCallback2 = FieldCB_ReturnToFieldOpenStartMenu`.
  (globalThis as Record<string, unknown>).gFieldCallback2 = FieldCB_ReturnToFieldOpenStartMenu;
  // Reset state machine pour la nouvelle séquence.
  gMain.state = 0;
  rt.SetMainCallback2(CB2_ReturnToFieldLocal_Manual);
}

/** 1:1 décomp `void CB2_ReturnToField(void)` (overworld.c:1657) — branche
 *  non-link :
 *
 *      FieldClearVBlankHBlankCallbacks();
 *      SetMainCallback2(CB2_ReturnToFieldLocal);
 *
 *  Identique à `CB2_ReturnToFieldWithOpenMenu_Manual` MAIS **sans** poser
 *  `gFieldCallback2` : ici l'appelant (= `SetUpFieldMove_X` du party menu) a
 *  DÉJÀ posé `gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu`, donc on
 *  ne doit PAS l'écraser avec FieldCB_ReturnToFieldOpenStartMenu (= ré-ouvre le
 *  start menu). RunFieldCallback (case 2) appellera donc le callback field-move.
 *  C'est le `gPartyMenu.exitCallback = CB2_ReturnToField` du switch default de
 *  `CursorCb_FieldMove` (party_menu.c:3757). */
export function CB2_ReturnToField_Manual(): void {
  const rt = getRuntime();
  rt.SetVBlankCallback(null);
  // NE PAS toucher gFieldCallback2 (posé par SetUpFieldMove_X).
  gMain.state = 0;
  rt.SetMainCallback2(CB2_ReturnToFieldLocal_Manual);
}

/** 1:1 décomp `void FieldCB_ContinueScript(void)` (field_screen_effect.c:150) :
 *
 *      LockPlayerFieldControls();
 *      FadeInFromBlack();
 *      CreateTask(Task_WaitForFadeAndEnableScriptCtx, 10);
 *
 *  `Task_WaitForFadeAndEnableScriptCtx` (field_screen_effect.c:133) attend
 *  `WaitForWeatherFadeIn()` puis `ScriptContext_Enable()` (reprend le script).
 *
 *  Notre version : le script bloqué (`special Bag_ChooseBerry` `waitstate=1` →
 *  SetupNativeScript dans script-opcodes-special) reprend de lui-même au 1er
 *  tick de l'OW restauré (le native script n'est pollé QUE quand l'OW est actif,
 *  = post-retour, exactement comme StartBirchTutorialBattle) → pas besoin d'un
 *  ScriptContext_Enable explicite ici. On fait juste le fade FROM_BLACK (le
 *  `fadescreen FADE_TO_BLACK` du script avait noirci avant d'ouvrir le sac).
 *  Appelé par RunFieldCallback_Manual (branche gFieldCallback) en case 2. */
function FieldCB_ContinueScript_Manual(): void {
  FillPalBufferBlack();
  FadeScreen(FADE_FROM_BLACK, 0);
}

/** 1:1 décomp `void CB2_ReturnToFieldContinueScript(void)` (overworld.c:1677) :
 *
 *      FieldClearVBlankHBlankCallbacks();
 *      gFieldCallback = FieldCB_ContinueScript;
 *      CB2_ReturnToField();   // → SetMainCallback2(CB2_ReturnToFieldLocal)
 *
 *  ⚠️ L'auto-gen `overworld-callbacks-auto.ts:222` est CASSÉ : il appelle
 *  `CB2_ReturnToField`→`CB2_ReturnToFieldLocal`(auto) qui passe `ReturnToFieldLocal(
 *  gMain.state)` PAR VALEUR (le transpiler ne gère pas `u8 *state`) → state machine
 *  bloquée case 0 ; + cible `CB2_Overworld` auto ≠ vrai `_overworldMainCB2`. Audit :
 *  ces auto-gen ne sont câblés nulle part. On réutilise la state machine manuelle
 *  (la SEULE qui marche), juste avec `gFieldCallback = FieldCB_ContinueScript`. */
export function CB2_ReturnToFieldContinueScript_Manual(): void {
  const rt = getRuntime();
  rt.SetVBlankCallback(null);
  // gFieldCallback (PAS gFieldCallback2) → RunFieldCallback_Manual branche le
  // chemin `if (cb) cb()` (= FieldCB_ContinueScript), pas le start menu.
  (globalThis as Record<string, unknown>).gFieldCallback = FieldCB_ContinueScript_Manual;
  (globalThis as Record<string, unknown>).gFieldCallback2 = null;
  gMain.state = 0;
  rt.SetMainCallback2(CB2_ReturnToFieldLocal_Manual);
}
