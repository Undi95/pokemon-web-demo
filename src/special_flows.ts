/**
 * special_flows.ts — flows UI inline des `special` (voie A, partagé parsé + byte-VM).
 *
 * Certains specials (waitstate=1) ouvrent une UI inline dans l'overworld (state machine
 * via SetupNativeScript, PAS de gSpecials[] fn). Ils étaient codés en dur dans le handler
 * `special` PARSÉ (scrcmd.ts) → invisibles au byte-VM. Ici = source UNIQUE : chaque moteur
 * appelle `makeSpecialInlineFlowPoll(name)` ; si non-null → SetupNativeScript(poll)+return true,
 * sinon → invokeSpecial/callSpecial (special classique). Zéro divergence au swap Phase 5.
 */

import { StartFirstBattle } from './battle_setup';

/** Poll d'overlay : ouvre l'UI (async) puis attend sa fermeture (= _runUIOverlay décomp). */
function overlayPoll(open: () => Promise<{ isOpen: () => boolean }>): () => boolean {
  let opened = false;
  let isOpenChecker: (() => boolean) | null = null;
  void open().then(({ isOpen }) => { isOpenChecker = isOpen; opened = true; });
  return () => { if (!opened) return false; return !isOpenChecker!(); };
}

/** Retourne le poll de native-script pour un `special` à UI inline, ou null si ce n'est pas
 *  un de ces specials (→ le caller fait le special classique). 1:1 des cas du handler parsé. */
export function makeSpecialInlineFlowPoll(name: string): (() => boolean) | null {
  switch (name) {
    // ChooseStarter : state machine starter (ShowFieldMessage + CreateYesNoMenu, no scene swap).
    case 'ChooseStarter': {
      let ready = false;
      let flow: { tick: () => boolean } | null = null;
      let signaled = false;
      void import('./starter_choose').then((m) => { flow = m.startChooseStarterFlow(); ready = true; });
      return () => {
        if (!ready || !flow) return false;
        const done = flow.tick();
        // `special ChooseStarter` est `waitstate=1` (specials.inc:175) → l'image byte-VM porte
        // `special ChooseStarter; waitstate`. Contrairement aux autres flows-UI (region map / PC
        // qui « terminent » à la FERMETURE de l'overlay et libèrent eux-mêmes le waitstate), le
        // flow ChooseStarter « termine » quand le FIRST_BATTLE DÉMARRE (starter_choose : YES →
        // CB2_GiveStarter → StartFirstBattle → _done=true), pas quand il FINIT. Le `waitstate`
        // qui suit ne s'exécute donc qu'AU RETOUR du combat — or aucun chemin de retour combat ne
        // le libère (le décomp le libère via CB2_EndFirstBattle → CB2_ReturnToFieldContinueScript →
        // FieldCB_ContinueScriptHandleMusic → ScriptContext_Enable). Notre `ScrCmd_waitstate` polle
        // `consumeWaitStateSignal()` : on latch le signal ICI, à la complétion du flow (AVANT le
        // combat). `_waitStateSignaled` (module scrcmd) SURVIT au combat — aucun field-script ne
        // tourne pour le consommer entre-temps — et le `waitstate` post-combat le consomme, reprenant
        // le script Birch (`applymovement LOCALID_ROUTE101_BIRCH` → « tu m'as sauvé » → warp labo).
        // Sans ce latch : waitstate jamais libéré → FREEZE Route 101 + résidu cadre msgbox à la fin
        // du tuto Birch (bug latent : le chemin nouvelle-partie n'avait pas été rejoué).
        if (done && !signaled) {
          signaled = true;
          const sig = (globalThis as { __SignalWaitState?: () => void }).__SignalWaitState;
          if (sig) sig();
          else console.error('[ChooseStarter] pont __SignalWaitState absent — waitstate post-combat non libéré (freeze tuto Birch)');
        }
        return done;
      };
    }
    // Birch tutorial : CB2_GiveStarter → CB2_StartFirstBattle (BATTLE_TYPE_FIRST_BATTLE).
    case 'StartBirchTutorialBattle': {
      StartFirstBattle();
      let framesWaited = 0;
      return () => { framesWaited++; return framesWaited >= 1; };
    }
    // FieldShowRegionMap : overlay carte HOENN (waitstate jusqu'à fermeture).
    case 'FieldShowRegionMap':
      return overlayPoll(async () => {
        const m = await import('./engine/field/region-map');
        await m.OpenRegionMap();
        return { isOpen: m.IsRegionMapOpen };
      });
    // BedroomPC / PlayerPC : overlay PC.
    case 'BedroomPC':
    case 'PlayerPC': {
      const isBedroom = name === 'BedroomPC';
      return overlayPoll(async () => {
        const m = await import('./player_pc');
        m.OpenBedroomPC(isBedroom);
        return { isOpen: m.IsBedroomPCOpen };
      });
    }
    // NOTE : ScriptMenu_CreatePCMultichoice ET ShowPokemonStorageSystemPC sont `waitstate=1`
    // (specials.inc:79/281) → le script a un opcode `waitstate` INSÉRÉ après le special. Ce ne
    // sont donc PAS des special-flows : un poll bloquant ici DOUBLERAIT le waitstate (le poll
    // résout mais l'opcode waitstate attend un SignalWaitState jamais émis → freeze — même piège
    // que DoTrainerApproach ci-dessous). Ils sont des PLAIN specials (specials-registry.ts) dont
    // la task émet SignalWaitState au choix / à AU REVOIR pour relâcher le waitstate. 1:1 décomp.
    // Wall clock VIEW / SET : overlay horloge.
    case 'Special_ViewWallClock':
    case 'StartWallClock': {
      const mode: 'VIEW' | 'SET' = name === 'StartWallClock' ? 'SET' : 'VIEW';
      return overlayPoll(async () => {
        const m = await import('./wallclock');
        m.OpenWallClock(mode);
        return { isOpen: m.IsWallClockOpen };
      });
    }
    // Rematch battle : DoTrainerBattle + suspension script (boot+poll dans battle_setup, anti-cycle).
    case 'BattleSetup_StartRematchBattle': {
      const bs = (globalThis as { __battleSetup?: { _bootRematchBattleForScript?: () => () => boolean } }).__battleSetup;
      return bs?._bootRematchBattleForScript ? bs._bootRematchBattleForScript() : null;
    }
    // Bag_ChooseBerry : ouvre le sac poche BAIES (waitstate implicite de la macro).
    case 'Bag_ChooseBerry': {
      void import('./item_menu').then((m) => m.CB2_ChooseBerry());
      let framesWaited = 0;
      return () => { framesWaited++; return framesWaited >= 1; };
    }
    // NOTE : DoTrainerApproach n'est PAS un special-flow. Le décomp le déclare
    // `def_special DoTrainerApproach, waitstate=1` → le script fait un `waitstate`
    // (ScriptContext_Stop) APRÈS le special, relâché par le ScriptContext_Enable() de
    // Task_EndTrainerApproach. Chez nous, DoTrainerApproach est un PLAIN special (registry)
    // qui lance la task ; le `waitstate` opcode (déjà dans l'image byte-VM) bloque, et
    // Task_EndTrainerApproach émet SignalWaitState pour reprendre — 1:1, un seul mécanisme
    // de blocage (un special-flow poll ici doublait le waitstate → freeze).
    default:
      return null;
  }
}
