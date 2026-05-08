/**
 * map-name-popup.ts — 1:1 décomp `src/map_name_popup.c`.
 *
 * Source de vérité (1:1 décomp) :
 *   - `src/map_name_popup.c` (= ShowMapNamePopup, Task_MapNamePopUpWindow)
 *   - `src/overworld.c:824` (= ShowMapNamePopup() appelé fin LoadMapFromCameraTransition)
 *
 * Comportement 1:1 décomp :
 *   - Au cross-border / map load (= si mapsec différent), affiche un popup en
 *     haut de l'écran avec le nom de la map (= "BOURG-EN-VOL").
 *   - Anim : SLIDE_IN (~20 frames) → WAIT (= 120 frames) → SLIDE_OUT (~20 frames).
 *   - Total durée ~160 frames = ~2.7 secondes à 60fps.
 *   - Skip si le mapsec n'a pas changé (= cross-border vers même région).
 *
 * Phase 4.9 first cut :
 *   - Skip les graphics theme spécifiques (= wood/marble/stone PNGs pas extraits).
 *   - Utilise un simple text rendering via gba-window-system + gba-text-system.
 *   - Slide via REG_OFFSET_BG0VOFS (= 1:1 décomp BG0VOFS scrolling).
 *   - Map name = lookup dans map-names-fr.json (= MAPSEC → "NOM").
 *
 * À étendre Phase 5+ :
 *   - Theme graphics (= sMapPopUp_Table[][960] PNG par theme).
 *   - sMapSectionToThemeId table (= choix theme selon mapsec).
 *   - Battle Frontier Pyramid floor strings.
 */

import { getRuntime } from './decomp-globals';
import { REG_OFFSET_BG0VOFS } from './decomp-runtime';
import { gMapHeader } from './map-loader';
import type { DecompTask } from './decomp-runtime';

// ─── 1:1 décomp constants (map_name_popup.c:222-229) ────────────────────────

const POPUP_OFFSCREEN_Y = 40;
const POPUP_SLIDE_SPEED = 2;

// 1:1 décomp data slots (= map_name_popup.c:225-229)
const T_STATE          = 0;
const T_ONSCREEN_TIMER = 1;
const T_Y_OFFSET       = 2;
const T_INCOMING_POPUP = 3;
const T_PRINT_TIMER    = 4;

// 1:1 décomp enum (= map_name_popup.c:212-220)
const STATE_SLIDE_IN  = 0;
const STATE_WAIT      = 1;
const STATE_SLIDE_OUT = 2;
const STATE_ERASE     = 4;
const STATE_END       = 5;
const STATE_PRINT     = 6;

// ─── Module state ──────────────────────────────────────────────────────────

let _sPopupTaskId = -1;
/** 1:1 décomp `sLastMapSectionId` (overworld.c). Tracking pour skip popup si
 *  même mapsec que le précédent (= cross-border into same region area). */
let _sLastMapSectionId = '';
/** Map mapsec → name FR cache (= async loaded au boot). */
let _mapNamesFr: Record<string, string> | null = null;

/** Preload map-names-fr.json. À call au boot avant ShowMapNamePopup. */
export async function preloadMapNames(): Promise<void> {
  if (_mapNamesFr) return;
  try {
    const response = await fetch('/decomp/em/map-names-fr.json');
    _mapNamesFr = await response.json() as Record<string, string>;
  } catch (e) {
    console.warn('[map-name-popup] failed to load map-names-fr.json:', e);
    _mapNamesFr = {};
  }
}

/** Get FR name for mapsec id (= e.g. "MAPSEC_LITTLEROOT_TOWN" → "BOURG-EN-VOL").
 *  Fallback to mapsec id if not found. */
function getMapName(mapsecId: string): string {
  return _mapNamesFr?.[mapsecId] ?? mapsecId;
}

// ─── 1:1 décomp ShowMapNamePopup (map_name_popup.c:231-252) ─────────────────

/** 1:1 décomp `ShowMapNamePopup(void)` (map_name_popup.c:231).
 *
 *  ```c
 *  void ShowMapNamePopup(void) {
 *      if (FlagGet(FLAG_HIDE_MAP_NAME_POPUP) != TRUE) {
 *          if (!FuncIsActiveTask(Task_MapNamePopUpWindow)) {
 *              sPopupTaskId = CreateTask(Task_MapNamePopUpWindow, 90);
 *              SetGpuReg(REG_OFFSET_BG0VOFS, POPUP_OFFSCREEN_Y);
 *              gTasks[sPopupTaskId].tState = STATE_PRINT;
 *              gTasks[sPopupTaskId].tYOffset = POPUP_OFFSCREEN_Y;
 *          } else {
 *              // Hurry old popup offscreen so new one can appear.
 *              if (gTasks[sPopupTaskId].tState != STATE_SLIDE_OUT)
 *                  gTasks[sPopupTaskId].tState = STATE_SLIDE_OUT;
 *              gTasks[sPopupTaskId].tIncomingPopUp = TRUE;
 *          }
 *      }
 *  }
 *  ```
 *
 *  Phase 4.9 : skip si mapsec inchangé (= 1:1 décomp condition implicite via
 *  sLastMapSectionId qu'on track ici plutôt que dans overworld.c). */
export function ShowMapNamePopup(): void {
  if (!gMapHeader) return;
  const mapsec = gMapHeader.regionMapSectionId;
  // 1:1 décomp : skip si même mapsec (= overworld.c:822-824 condition
  // `regionMapSectionId != sLastMapSectionId`).
  if (mapsec === _sLastMapSectionId) return;
  _sLastMapSectionId = mapsec;

  // TODO Phase 5 : check FlagGet(FLAG_HIDE_MAP_NAME_POPUP).

  const rt = getRuntime();
  const tasks = rt.gTasks;
  const existingTask = _sPopupTaskId >= 0 ? tasks.get(_sPopupTaskId) : null;
  if (existingTask && existingTask.func === Task_MapNamePopUpWindow) {
    // Existing popup → hurry offscreen for incoming.
    if (existingTask.data[T_STATE] !== STATE_SLIDE_OUT) {
      existingTask.data[T_STATE] = STATE_SLIDE_OUT;
    }
    existingTask.data[T_INCOMING_POPUP] = 1;
    return;
  }

  // New popup.
  _sPopupTaskId = rt.CreateTask(Task_MapNamePopUpWindow, 90);
  rt.SetGpuReg(REG_OFFSET_BG0VOFS, POPUP_OFFSCREEN_Y);
  const task = tasks.get(_sPopupTaskId);
  if (!task) return;
  task.data[T_STATE] = STATE_PRINT;
  task.data[T_Y_OFFSET] = POPUP_OFFSCREEN_Y;
  task.data[T_PRINT_TIMER] = 0;
  task.data[T_ONSCREEN_TIMER] = 0;
  task.data[T_INCOMING_POPUP] = 0;
}

// ─── 1:1 décomp Task_MapNamePopUpWindow (map_name_popup.c:254-317) ──────────

function Task_MapNamePopUpWindow(task: DecompTask): void {
  const rt = getRuntime();
  switch (task.data[T_STATE]) {
    case STATE_PRINT:
      // 1:1 décomp : wait 30 frames before render+slide_in.
      task.data[T_PRINT_TIMER]++;
      if (task.data[T_PRINT_TIMER] > 30) {
        task.data[T_STATE] = STATE_SLIDE_IN;
        task.data[T_PRINT_TIMER] = 0;
        ShowMapNamePopUpWindow();
      }
      break;
    case STATE_SLIDE_IN:
      task.data[T_Y_OFFSET] -= POPUP_SLIDE_SPEED;
      if (task.data[T_Y_OFFSET] <= 0) {
        task.data[T_Y_OFFSET] = 0;
        task.data[T_STATE] = STATE_WAIT;
        task.data[T_ONSCREEN_TIMER] = 0;
      }
      break;
    case STATE_WAIT:
      task.data[T_ONSCREEN_TIMER]++;
      if (task.data[T_ONSCREEN_TIMER] > 120) {
        task.data[T_ONSCREEN_TIMER] = 0;
        task.data[T_STATE] = STATE_SLIDE_OUT;
      }
      break;
    case STATE_SLIDE_OUT:
      task.data[T_Y_OFFSET] += POPUP_SLIDE_SPEED;
      if (task.data[T_Y_OFFSET] >= POPUP_OFFSCREEN_Y) {
        task.data[T_Y_OFFSET] = POPUP_OFFSCREEN_Y;
        if (task.data[T_INCOMING_POPUP]) {
          // Re-loop pour next popup.
          task.data[T_STATE] = STATE_PRINT;
          task.data[T_PRINT_TIMER] = 0;
          task.data[T_INCOMING_POPUP] = 0;
        } else {
          task.data[T_STATE] = STATE_ERASE;
          return;
        }
      }
      break;
    case STATE_ERASE:
      // 1:1 décomp : ClearStdWindowAndFrame(GetMapNamePopUpWindowId(), TRUE).
      // Phase 4.9 first cut : pas de window à clear (= simple console log).
      task.data[T_STATE] = STATE_END;
      break;
    case STATE_END:
      HideMapNamePopUpWindow();
      return;
  }
  rt.SetGpuReg(REG_OFFSET_BG0VOFS, task.data[T_Y_OFFSET]);
}

// ─── ShowMapNamePopUpWindow + Hide (= map_name_popup.c:319-368) ─────────────

/** 1:1 décomp `ShowMapNamePopUpWindow` (map_name_popup.c:335).
 *  Phase 4.9 first cut : log seulement (= popup visuel TBD avec gba-window-system).
 *  Le user verra "BOURG-EN-VOL" dans la console au cross-border + le BG0VOFS
 *  slide visuel (= la BG0 layer existante slide, mais sans popup graphic dessus
 *  car pas de window créée). */
function ShowMapNamePopUpWindow(): void {
  if (!gMapHeader) return;
  const mapName = getMapName(gMapHeader.regionMapSectionId);
  console.log(`[map-name-popup] ${gMapHeader.regionMapSectionId} → "${mapName}"`);
  // TODO Phase 5 : create window, render text via AddTextPrinterParameterized,
  // load theme graphics via DrawMapNamePopUpFrame.
}

/** 1:1 décomp `HideMapNamePopUpWindow` (map_name_popup.c:319-333). */
export function HideMapNamePopUpWindow(): void {
  if (_sPopupTaskId < 0) return;
  const rt = getRuntime();
  // 1:1 décomp : SetGpuReg_ForcedBlank(REG_OFFSET_BG0VOFS, 0) + DestroyTask.
  rt.SetGpuReg(REG_OFFSET_BG0VOFS, 0);
  rt.gTasks.delete(_sPopupTaskId);
  _sPopupTaskId = -1;
}

/** Reset state (= utile en dev pour re-afficher le popup au même mapsec). */
export function _resetMapNamePopupState(): void {
  _sLastMapSectionId = '';
  HideMapNamePopUpWindow();
}
