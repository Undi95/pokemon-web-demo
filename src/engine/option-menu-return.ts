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

import { getRuntime, gMain, ResetTasks, ResetPaletteFade, FillPalBufferBlack } from './decomp-globals';
import { ResetSpriteData } from './decomp-bridge';
import { InitFieldMessageBox } from './field-message-box';
import { FadeScreen, FADE_FROM_BLACK } from './fade-screen';

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
  // 1:1 décomp `ReturnToFieldOpenStartMenu` (field_screen_effect.c:433) :
  //   FadeInFromBlack();
  //   CreateTask(Task_WaitForFadeShowStartMenu, 0x50);
  //   LockPlayerFieldControls();
  // FadeInFromBlack (field_weather.c:71) :
  //   FillPalBufferBlack();
  //   FadeScreen(FADE_FROM_BLACK, 0);
  //
  // ⚠️ USER FLAG 2026-05-20 : précédent commentaire disait "= FadeScreen(...)"
  // ce qui était FAUX — il MANQUAIT le FillPalBufferBlack pré-fade. Sans ça,
  // _restoreOverworldFromMenu a déjà loadé les NEW tileset palettes via
  // LoadPalette (= écrit gPlttBufferFaded + Unfaded). Le fade FROM_BLACK
  // démarre alors depuis "Faded = couleurs nouvelles" au lieu de "Faded =
  // black" → 1 frame de flash couleurs visible avant que la fade animation
  // ne reprenne le contrôle. Fix : FillPalBufferBlack() AVANT FadeScreen,
  // exactement 1:1 décomp FadeInFromBlack.
  FillPalBufferBlack();
  FadeScreen(FADE_FROM_BLACK, 0);
  // Open start menu via le module start-menu.ts (exposé via globalThis).
  // 1:1 décomp `Task_ShowStartMenu` set gMenuCallback = HandleStartMenuInput.
  const sm = (globalThis as Record<string, unknown>).startMenu as { open?: () => void } | undefined;
  sm?.open?.();
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
