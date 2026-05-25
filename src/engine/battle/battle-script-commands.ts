/**
 * battle/battle-script-commands.ts — index centralisé 1:1 décomp
 * `src/battle_script_commands.c` (~10000 lignes).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c`.
 *
 * Le décomp organise tous les Cmd_X (= ~256 opcodes battle bytecode) dans UN
 * SEUL fichier de ~10000 lignes. Notre port split en 34 batches historiques
 * (= cmd-batch-01..34) pour audit incrémental + git history claire.
 *
 * Ce fichier centralise les imports lazy + documente le mapping
 * cmd-niveau-X → opcodes/sections décomp. À la place de 34 imports dans
 * script-interpreter.ts, un seul `installAllBattleScriptCommands(_commands)`
 * fait tout le wire-up.
 *
 * Mapping cmd-niveau-X → opcodes/sections :
 *   - Batch 01  : 0x00-0x19 + 0x49 (damage flow basic + moveend)
 *   - Batch 02  : 0x16-0x18 + 0x47-0x48 + 0x89-0x8A + 0x98 (stat stages + status)
 *   - Batch 03  : 0x1C-0x22 + 0x84 (branching jumpif*)
 *   - Batch 04  : 0x02 + 0x08-0x0E (animations + UI emit + datahpupdate)
 *   - Batch 05  : 0x1A-0x1B + 0x26-0x33 (result + messages + faint)
 *   - Batch 06  : 0x34-0x3F (UI/audio misc)
 *   - Batch 07  : 0x40-0x4F (mutation + flow control)
 *   - Batch 08  : 0x50-0x5F partial (utility + dynamic)
 *   - Batch 09  : 0x60-0x6F partial (status-set opcodes)
 *   - Batch 10 : 0x70-0x7F (weather + side status + charge)
 *   - Batch 11 : 0x80-0x8F partial (damage manip + substitute)
 *   - Batch 12 : 0x6B-0xC6 partial (semi-invul + buffers + misc)
 *   - Batch 13 : 0x90-0x9F (damage calcs special)
 *   - Batch 14 : 0xA0-0xAF (turn/action management)
 *   - Batch 15 : 0xB0-0xBF (protect/sport/environment)
 *   - Batch 16 : 0xC0-0xCF (damage calcs spéciaux)
 *   - Batch 17 : 0xD0-0xDF (status field / type conversion)
 *   - Batch 18 : 0x77 + abilities + weather ball (status anims)
 *   - Batch 19 : rest/bide/camouflage/party UI
 *   - Batch 20 : protect/explosion/weather dmg
 *   - Batch 21 : item/wish/transform/OHKO
 *   - Batch 22 : cleanup/stockpile/dmg adjust
 *   - Batch 23 : clear/spite/imprison/future/pursuit
 *   - Batch 24 : switch UI emit + checkteamslost
 *   - Batch 25 : anim variants + mimic + castform
 *   - Batch 26 : hpthresholds + money + switch checks
 *   - Batch 27 : infatuation + sleep talk + metronome + nature
 *   - Batch 28 : switchineffects + rapidspin + item
 *   - Batch 29 : mirror/sketch/heal bell/assist
 *   - Batch 30 : conversion2/pursuit/switchupdate/beatup/trick
 *   - Batch 31 : seteffectwithchance + catching
 *   - Batch 32 : 0x50-0x5B + 0x6C + 0xEF (party screen UI + learnmove + ball)
 *   - Batch 33 : 15 opcodes natifs script-var manipulation
 *   - Batch 34 : 0x44 + 0x76 (getexp + various — last 2 huge opcodes)
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
    import('./cmd-batch-01').then(m => m.installBatch01Handlers as CmdInstaller),
    import('./cmd-batch-02').then(m => m.installBatch02Handlers as CmdInstaller),
    import('./cmd-batch-03').then(m => m.installBatch03Handlers as CmdInstaller),
    import('./cmd-batch-04').then(m => m.installBatch04Handlers as CmdInstaller),
    import('./cmd-batch-05').then(m => m.installBatch05Handlers as CmdInstaller),
    import('./cmd-batch-06').then(m => m.installBatch06Handlers as CmdInstaller),
    import('./cmd-batch-07').then(m => m.installBatch07Handlers as CmdInstaller),
    import('./cmd-batch-08').then(m => m.installBatch08Handlers as CmdInstaller),
    import('./cmd-batch-09').then(m => m.installBatch09Handlers as CmdInstaller),
    import('./cmd-batch-10').then(m => m.installBatch10Handlers as CmdInstaller),
    import('./cmd-batch-11').then(m => m.installBatch11Handlers as CmdInstaller),
    import('./cmd-batch-12').then(m => m.installBatch12Handlers as CmdInstaller),
    import('./cmd-batch-13').then(m => m.installBatch13Handlers as CmdInstaller),
    import('./cmd-batch-14').then(m => m.installBatch14Handlers as CmdInstaller),
    import('./cmd-batch-15').then(m => m.installBatch15Handlers as CmdInstaller),
    import('./cmd-batch-16').then(m => m.installBatch16Handlers as CmdInstaller),
    import('./cmd-batch-17').then(m => m.installBatch17Handlers as CmdInstaller),
    import('./cmd-batch-18').then(m => m.installBatch18Handlers as CmdInstaller),
    import('./cmd-batch-19').then(m => m.installBatch19Handlers as CmdInstaller),
    import('./cmd-batch-20').then(m => m.installBatch20Handlers as CmdInstaller),
    import('./cmd-batch-21').then(m => m.installBatch21Handlers as CmdInstaller),
    import('./cmd-batch-22').then(m => m.installBatch22Handlers as CmdInstaller),
    import('./cmd-batch-23').then(m => m.installBatch23Handlers as CmdInstaller),
    import('./cmd-batch-24').then(m => m.installBatch24Handlers as CmdInstaller),
    import('./cmd-batch-25').then(m => m.installBatch25Handlers as CmdInstaller),
    import('./cmd-batch-26').then(m => m.installBatch26Handlers as CmdInstaller),
    import('./cmd-batch-27').then(m => m.installBatch27Handlers as CmdInstaller),
    import('./cmd-batch-28').then(m => m.installBatch28Handlers as CmdInstaller),
    import('./cmd-batch-29').then(m => m.installBatch29Handlers as CmdInstaller),
    import('./cmd-batch-30').then(m => m.installBatch30Handlers as CmdInstaller),
    import('./cmd-batch-31').then(m => m.installBatch31Handlers as CmdInstaller),
    import('./cmd-batch-32').then(m => m.installBatch32Handlers as CmdInstaller),
    import('./cmd-batch-33').then(m => m.installBatch33Handlers as CmdInstaller),
    import('./cmd-batch-34').then(m => m.installBatch34Handlers as CmdInstaller),
  ];

  const resolved = await Promise.all(installers);
  for (const installer of resolved) {
    installer(commands);
  }
}
