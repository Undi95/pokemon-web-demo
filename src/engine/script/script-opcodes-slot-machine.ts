/**
 * script-opcodes-slot-machine.ts — opcode `playslotmachine` 1:1 décomp `slot_machine.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:1914-1921` :
 *   `ScrCmd_playslotmachine` : PlaySlotMachine(machineId,
 *     CB2_ReturnToFieldContinueScriptPlayMapMusic) + ScriptContext_Stop + return TRUE.
 *
 * Et `D:/Projet 1/decomps/pokeemeraude/src/slot_machine.c` — ~6000 lignes de
 * UI slot machine à porter en session dédiée. CB2 swap pas encore exposé.
 */

import { registerOpcode, SetupNativeScript } from './script-runtime';
import { VarGet } from './script-vars';

registerOpcode('playslotmachine', (ctx, args) => {
  // 1:1 décomp ScrCmd_playslotmachine (scrcmd.c:1914-1921) :
  //   PlaySlotMachine(machineId, CB2_ReturnToFieldContinueScriptPlayMapMusic);
  //   ScriptContext_Stop();
  //   return TRUE;
  // Notre port : slot machine non implémentée (= slot_machine.c ~6000 lignes
  // décomp à porter en session dédiée). Wait state + return immédiatement.
  const _machineId = VarGet(args[0] ?? '0');
  void _machineId;
  let framesWaited = 0;
  const poll = (): boolean => {
    framesWaited++;
    return framesWaited >= 1;
  };
  SetupNativeScript(ctx, poll);
  return true;
});
