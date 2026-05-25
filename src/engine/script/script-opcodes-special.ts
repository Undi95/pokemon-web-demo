/**
 * script-opcodes-special.ts — opcodes `special` / `specialvar` + dispatcher
 * UI ChooseStarter/StartBirchTutorialBattle/FieldShowRegionMap/BedroomPC/
 * PlayerPC/Special_ViewWallClock/StartWallClock + waitstate + SignalWaitState.
 *
 * Source de vérité :
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:118-132` :
 *     `ScrCmd_special`    : gSpecials[ScriptReadHalfword(ctx)]() ;
 *     `ScrCmd_specialvar` : *var = gSpecials[ScriptReadHalfword(ctx)]() ;
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:142-146` :
 *     `ScrCmd_waitstate`  : ScriptContext_Stop().
 *
 * gSpecials[] (data/specials.inc, 527 entries) est une table de function
 * pointers indexés par SPECIAL_xxx. Notre version : registry name-based
 * (= registerSpecial). Scripts JSON pré-extraits ont les noms.
 */

import type { ScriptContext } from './script-runtime';
import { registerOpcode, SetupNativeScript } from './script-runtime';
import { VarSet } from './script-vars';
import { gMapHeader } from '../map-loader';
import { getPendingWarp } from '../warp-system';

// ─── waitstate / SignalWaitState ────────────────────────────────────────────

// Session 124 fix Bug 4 : signal generic pour UI flows (= wallclock, starter,
// future MartUI, etc.). Le décomp `waitstate` poll `ScriptContext_Stop` cleared
// par `ScriptContext_Enable()` appelé par le UI flow quand il finit. Notre
// equivalent : un latch booleen set par `SignalWaitState()`.
let _waitStateSignaled = false;

/** Call par les UI flows (= wallclock, starter, region map, etc.) quand ils
 *  ferment, pour débloquer le script bloqué sur `waitstate`. */
export function SignalWaitState(): void {
  _waitStateSignaled = true;
}

/** 1:1 décomp `ScrCmd_waitstate` (scrcmd.c:142-146) :
 *  ScriptContext_Stop jusqu'à ce qu'une autre routine (= warp completion,
 *  multichoice result, UI flow done) call ScriptContext_Enable. Utilisé
 *  après `warpsilent`, après `special X waitstate=1` (= wallclock, starter
 *  choose), etc. */
registerOpcode('waitstate', (ctx) => {
  // Si signaled UPSTREAM (= UI flow déjà terminé avant waitstate dispatch),
  // consume + continue immédiat.
  if (_waitStateSignaled) {
    _waitStateSignaled = false;
    return false;
  }
  const startMapId = gMapHeader?.id;
  const tick = (): boolean => {
    if (_waitStateSignaled) {
      _waitStateSignaled = false;
      return true;
    }
    // Warp path : poll warp consume + map switch (= 1:1 session 122 fix).
    if (getPendingWarp()) return false;
    const currentMapId = gMapHeader?.id;
    if (currentMapId && currentMapId !== startMapId) return true;
    return false;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

// ─── Special opcode dispatcher (= 1:1 décomp ScrCmd_special) ────────────────

/** 1:1 décomp `gSpecials[]` table (data/specials.inc, 527 entries).
 *  Décomp : array de function pointers indexés par SPECIAL_xxx. Notre version
 *  string-keyed pour matcher les script JSON pré-extraits. */
type SpecialHandler = () => number | void;
const _specialHandlers: Record<string, SpecialHandler> = {};

/** Register un special handler. Le handler peut return un u16 qui est stored
 *  par opcode `specialvar` dans une variable. À call par les modules qui
 *  implémentent un special spécifique (= battle module → `HealPlayerParty`). */
export function registerSpecial(name: string, handler: SpecialHandler): void {
  _specialHandlers[name] = handler;
}

/** Internal : invoke un special handler. Returns 0 si pas registered + log
 *  warning. Utilisé par opcodes `special` et `specialvar`, et par les
 *  fichiers `script-opcodes-frontier` / `script-opcodes-seteventmon`
 *  (= via le facility call helper). */
export function invokeSpecial(name: string): number {
  const handler = _specialHandlers[name];
  if (!handler) {
    // Log les specials manquants pour wire au fur et à mesure.
    console.log(`[opcode special] '${name}' not registered yet — wire dans specials-registry.ts`);
    return 0;
  }
  return handler() ?? 0;
}

/** UI dispatcher inline pour les specials qui ouvrent une UI overlay.
 *  Helper séparé pour réutiliser le pattern. */
function _runUIOverlay(
  ctx: ScriptContext,
  open: () => Promise<{ isOpen: () => boolean }>,
): boolean {
  let opened = false;
  let isOpenChecker: (() => boolean) | null = null;
  void open().then(({ isOpen }) => {
    isOpenChecker = isOpen;
    opened = true;
  });
  SetupNativeScript(ctx, () => {
    if (!opened) return false;
    return !isOpenChecker!();
  });
  return true;
}

/** 1:1 décomp `ScrCmd_special` (scrcmd.c:118-124).
 *  ```c
 *  bool8 ScrCmd_special(struct ScriptContext *ctx) {
 *      u16 index = ScriptReadHalfword(ctx);
 *      gSpecials[index]();
 *      return FALSE;
 *  }
 *  ``` */
registerOpcode('special', (ctx, args) => {
  const name = args[0] as string;
  // Phase 5.5 : ChooseStarter UI INLINE dans l'overworld via state machine
  // utilisant nos systèmes engine (= ShowFieldMessage + CreateYesNoMenu, no scene switch).
  // 1:1 décomp Task_StarterChoose flow + Task_AskConfirmStarter.
  // Dynamic import : avoid circular dependency at load time.
  if (name === 'ChooseStarter') {
    let flowReady = false;
    let flow: { tick: () => boolean } | null = null;
    void import('../starter-choose-flow').then((mod) => {
      flow = mod.startChooseStarterFlow();
      flowReady = true;
    });
    SetupNativeScript(ctx, () => {
      if (!flowReady) return false;
      return flow!.tick();
    });
    return true;
  }
  // Phase 5.6 : Birch tutorial wild battle flow.
  // 1:1 décomp battle_setup.c:CB2_GiveStarter chains starter give → CB2_StartFirstBattle
  // (= BATTLE_TYPE_FIRST_BATTLE vs SPECIES_ZIGZAGOON Lv 2). Notre version :
  // inline state machine via SetupNativeScript (= block script, no scene switch).
  if (name === 'StartBirchTutorialBattle') {
    let flowReady = false;
    let flow: { tick: () => boolean } | null = null;
    void import('../battle-flow').then((mod) => {
      flow = mod.startBirchTutorialBattle();
      flowReady = true;
    });
    SetupNativeScript(ctx, () => {
      if (!flowReady) return false;
      return flow!.tick();
    });
    return true;
  }
  // 1:1 décomp `FieldShowRegionMap` (field_specials.c:973) : CB2 swap vers
  // worldmap HOENN. Notre version utilise un overlay HTML (= region-map.ts)
  // qui se dessine au-dessus du field. Le special est `waitstate=1`
  // dans specials.inc:279 donc on bloque le script via SetupNativeScript
  // jusqu'à ce que la carte se ferme (= IsRegionMapOpen() false).
  if (name === 'FieldShowRegionMap') {
    return _runUIOverlay(ctx, async () => {
      const mod = await import('../region-map');
      await mod.OpenRegionMap();
      return { isOpen: mod.IsRegionMapOpen };
    });
  }
  // 1:1 décomp player_pc.c (= BedroomPC + PlayerPC). Pattern overlay (= pas
  // de CB2 swap car le PC dessine au-dessus de l'overworld). OpenBedroomPC()
  // ouvre le main menu UI ; TickBedroomPC() est polled chaque frame depuis
  // TestOverworldScene main loop pour drive l'input. Le special est `waitstate=1`
  // dans specials.inc:277-278 donc on bloque le script via SetupNativeScript
  // jusqu'à ce que le PC se ferme (= IsBedroomPCOpen() false).
  if (name === 'BedroomPC' || name === 'PlayerPC') {
    const isBedroom = (name === 'BedroomPC');
    return _runUIOverlay(ctx, async () => {
      const mod = await import('../bedroom-pc');
      mod.OpenBedroomPC(isBedroom);
      return { isOpen: mod.IsBedroomPCOpen };
    });
  }
  // 1:1 décomp port `wallclock.c` (session 2026-05-20) : CB2 swap via
  // SetMainCallback2(CB2_InitWallClock). Aiguilles affines via SetOamMatrix +
  // sClockHandCoords pivot offsets. Tilemap BG3 clock_start/clock_view depuis
  // graphics/wallclock/. AM/PM indicator anime entre 2 positions selon période.
  // `Special_ViewWallClock` = mode VIEW (RTC live + A/B = close).
  // `StartWallClock` = mode SET (D-pad ajuste hours/minutes, A = confirm via
  // RtcInitLocalTimeOffset, sauvegarde).
  if (name === 'Special_ViewWallClock' || name === 'StartWallClock') {
    const mode: 'VIEW' | 'SET' = name === 'StartWallClock' ? 'SET' : 'VIEW';
    return _runUIOverlay(ctx, async () => {
      const mod = await import('../wallclock');
      mod.OpenWallClock(mode);
      return { isOpen: mod.IsWallClockOpen };
    });
  }
  invokeSpecial(name);
  return false;
});

/** 1:1 décomp `ScrCmd_specialvar` (scrcmd.c:126-132).
 *  ```c
 *  bool8 ScrCmd_specialvar(struct ScriptContext *ctx) {
 *      u16 *var = GetVarPointer(ScriptReadHalfword(ctx));
 *      *var = gSpecials[ScriptReadHalfword(ctx)]();
 *      return FALSE;
 *  }
 *  ```
 *  Format args : args[0] = varId (= "VAR_RESULT" etc.), args[1] = special name. */
registerOpcode('specialvar', (_ctx, args) => {
  const varId = args[0] as string;
  const specialName = args[1] as string;
  const result = invokeSpecial(specialName);
  VarSet(varId, result);
  return false;
});
