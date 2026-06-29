/**
 * special_flows.ts — flows UI inline des `special` (voie A, partagé parsé + byte-VM).
 *
 * Certains specials (waitstate=1) ouvrent une UI inline dans l'overworld (state machine
 * via SetupNativeScript, PAS de gSpecials[] fn). Ils étaient codés en dur dans le handler
 * `special` PARSÉ (scrcmd.ts) → invisibles au byte-VM. Ici = source UNIQUE : chaque moteur
 * appelle `makeSpecialInlineFlowPoll(name)` ; si non-null → SetupNativeScript(poll)+return true,
 * sinon → invokeSpecial/callSpecial (special classique). Zéro divergence au swap Phase 5.
 */

import { StartFirstBattle } from './engine/battle/battle-setup-helpers';

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
      void import('./starter_choose').then((m) => { flow = m.startChooseStarterFlow(); ready = true; });
      return () => (ready && flow ? flow.tick() : false);
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
    default:
      return null;
  }
}
