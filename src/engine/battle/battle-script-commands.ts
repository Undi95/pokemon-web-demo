/**
 * battle/battle-script-commands.ts — index centralisé 1:1 décomp
 * `src/battle_script_commands.c` (~10000 lignes).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c`.
 *
 * Le décomp organise tous les Cmd_X (= ~256 opcodes battle bytecode) dans UN
 * SEUL fichier de ~10000 lignes. Notre port split en 34 batches historiques
 * (= cmd-niveau-1..34) pour audit incrémental + git history claire.
 *
 * Ce fichier centralise les imports lazy + documente le mapping
 * cmd-niveau-X → opcodes/sections décomp. À la place de 34 imports dans
 * script-interpreter.ts, un seul `installAllBattleScriptCommands(_commands)`
 * fait tout le wire-up.
 *
 * Mapping cmd-niveau-X → opcodes/sections :
 *   - Niveau 1  : 0x00-0x19 + 0x49 (damage flow basic + moveend)
 *   - Niveau 2  : 0x16-0x18 + 0x47-0x48 + 0x89-0x8A + 0x98 (stat stages + status)
 *   - Niveau 3  : 0x1C-0x22 + 0x84 (branching jumpif*)
 *   - Niveau 4  : 0x02 + 0x08-0x0E (animations + UI emit + datahpupdate)
 *   - Niveau 5  : 0x1A-0x1B + 0x26-0x33 (result + messages + faint)
 *   - Niveau 6  : 0x34-0x3F (UI/audio misc)
 *   - Niveau 7  : 0x40-0x4F (mutation + flow control)
 *   - Niveau 8  : 0x50-0x5F partial (utility + dynamic)
 *   - Niveau 9  : 0x60-0x6F partial (status-set opcodes)
 *   - Niveau 10 : 0x70-0x7F (weather + side status + charge)
 *   - Niveau 11 : 0x80-0x8F partial (damage manip + substitute)
 *   - Niveau 12 : 0x6B-0xC6 partial (semi-invul + buffers + misc)
 *   - Niveau 13 : 0x90-0x9F (damage calcs special)
 *   - Niveau 14 : 0xA0-0xAF (turn/action management)
 *   - Niveau 15 : 0xB0-0xBF (protect/sport/environment)
 *   - Niveau 16 : 0xC0-0xCF (damage calcs spéciaux)
 *   - Niveau 17 : 0xD0-0xDF (status field / type conversion)
 *   - Niveau 18 : 0x77 + abilities + weather ball (status anims)
 *   - Niveau 19 : rest/bide/camouflage/party UI
 *   - Niveau 20 : protect/explosion/weather dmg
 *   - Niveau 21 : item/wish/transform/OHKO
 *   - Niveau 22 : cleanup/stockpile/dmg adjust
 *   - Niveau 23 : clear/spite/imprison/future/pursuit
 *   - Niveau 24 : switch UI emit + checkteamslost
 *   - Niveau 25 : anim variants + mimic + castform
 *   - Niveau 26 : hpthresholds + money + switch checks
 *   - Niveau 27 : infatuation + sleep talk + metronome + nature
 *   - Niveau 28 : switchineffects + rapidspin + item
 *   - Niveau 29 : mirror/sketch/heal bell/assist
 *   - Niveau 30 : conversion2/pursuit/switchupdate/beatup/trick
 *   - Niveau 31 : seteffectwithchance + catching
 *   - Niveau 32 : 0x50-0x5B + 0x6C + 0xEF (party screen UI + learnmove + ball)
 *   - Niveau 33 : 15 opcodes natifs script-var manipulation
 *   - Niveau 34 : 0x44 + 0x76 (getexp + various — last 2 huge opcodes)
 *
 * Architecture wire-up :
 *   - Chaque cmd-niveau-X.ts exporte `installNiveauN Handlers(commands: BattleOpcodeHandler[])`
 *     qui register les opcodes dans le dispatch table indexed par opcode byte.
 *   - Lazy import pour break cyclic dep (cmd-niveau-X.ts importent
 *     BattleOpcodeHandler de script-interpreter.ts).
 *   - L'ordre des `installNiveauN` ne matter pas (= chaque opcode est unique).
 *
 * Stubs Phase 1.4 N (= battle UI not wired) :
 *   - BtlController_Emit* dans battle-controllers.ts → no-op (= "instant done").
 *   - UI fns (HandleBattleWindow, BattlePutTextOnWindow) → no-op.
 *   - State machines UI lourdes (party screen, yesno box, ball anim) → state
 *     advance immédiat.
 *   À implémenter complete quand battle scene Phaser sera wired aux opcodes.
 */

import type { BattleOpcodeHandler } from './script-interpreter';

/** Type pour les installers Niveau N qui peuplent le dispatch table. */
type CmdInstaller = (commands: BattleOpcodeHandler[]) => void;

/** Install tous les handlers battle script opcodes en parallèle.
 *  Appelé par script-interpreter.ts:_initCommandsTable() après que la base
 *  dispatch table soit construite avec stubs par défaut. Les installers
 *  Niveau N override les opcodes spécifiques par leur impl 1:1 strict décomp.
 *
 *  Lazy import : break cyclic dep (cmd-niveau-X importent
 *  BattleOpcodeHandler de script-interpreter.ts). */
export async function installAllBattleScriptCommands(
  commands: BattleOpcodeHandler[],
): Promise<void> {
  const installers: Promise<CmdInstaller>[] = [
    import('./cmd-niveau-1').then(m => m.installNiveau1Handlers as CmdInstaller),
    import('./cmd-niveau-2').then(m => m.installNiveau2Handlers as CmdInstaller),
    import('./cmd-niveau-3').then(m => m.installNiveau3Handlers as CmdInstaller),
    import('./cmd-niveau-4').then(m => m.installNiveau4Handlers as CmdInstaller),
    import('./cmd-niveau-5').then(m => m.installNiveau5Handlers as CmdInstaller),
    import('./cmd-niveau-6').then(m => m.installNiveau6Handlers as CmdInstaller),
    import('./cmd-niveau-7').then(m => m.installNiveau7Handlers as CmdInstaller),
    import('./cmd-niveau-8').then(m => m.installNiveau8Handlers as CmdInstaller),
    import('./cmd-niveau-9').then(m => m.installNiveau9Handlers as CmdInstaller),
    import('./cmd-niveau-10').then(m => m.installNiveau10Handlers as CmdInstaller),
    import('./cmd-niveau-11').then(m => m.installNiveau11Handlers as CmdInstaller),
    import('./cmd-niveau-12').then(m => m.installNiveau12Handlers as CmdInstaller),
    import('./cmd-niveau-13').then(m => m.installNiveau13Handlers as CmdInstaller),
    import('./cmd-niveau-14').then(m => m.installNiveau14Handlers as CmdInstaller),
    import('./cmd-niveau-15').then(m => m.installNiveau15Handlers as CmdInstaller),
    import('./cmd-niveau-16').then(m => m.installNiveau16Handlers as CmdInstaller),
    import('./cmd-niveau-17').then(m => m.installNiveau17Handlers as CmdInstaller),
    import('./cmd-niveau-18').then(m => m.installNiveau18Handlers as CmdInstaller),
    import('./cmd-niveau-19').then(m => m.installNiveau19Handlers as CmdInstaller),
    import('./cmd-niveau-20').then(m => m.installNiveau20Handlers as CmdInstaller),
    import('./cmd-niveau-21').then(m => m.installNiveau21Handlers as CmdInstaller),
    import('./cmd-niveau-22').then(m => m.installNiveau22Handlers as CmdInstaller),
    import('./cmd-niveau-23').then(m => m.installNiveau23Handlers as CmdInstaller),
    import('./cmd-niveau-24').then(m => m.installNiveau24Handlers as CmdInstaller),
    import('./cmd-niveau-25').then(m => m.installNiveau25Handlers as CmdInstaller),
    import('./cmd-niveau-26').then(m => m.installNiveau26Handlers as CmdInstaller),
    import('./cmd-niveau-27').then(m => m.installNiveau27Handlers as CmdInstaller),
    import('./cmd-niveau-28').then(m => m.installNiveau28Handlers as CmdInstaller),
    import('./cmd-niveau-29').then(m => m.installNiveau29Handlers as CmdInstaller),
    import('./cmd-niveau-30').then(m => m.installNiveau30Handlers as CmdInstaller),
    import('./cmd-niveau-31').then(m => m.installNiveau31Handlers as CmdInstaller),
    import('./cmd-niveau-32').then(m => m.installNiveau32Handlers as CmdInstaller),
    import('./cmd-niveau-33').then(m => m.installNiveau33Handlers as CmdInstaller),
    import('./cmd-niveau-34').then(m => m.installNiveau34Handlers as CmdInstaller),
  ];

  const resolved = await Promise.all(installers);
  for (const installer of resolved) {
    installer(commands);
  }
}
