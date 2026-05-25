/**
 * script-opcodes-party.ts — opcodes party 1:1 décomp `party_menu.c` +
 * `script_pokemon_util.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` :
 *   `ScrCmd_givemon`         (l. 1681-1692) : ScriptGiveMon(species, level, item, ...).
 *   `ScrCmd_giveegg`         (l. 1694-1700) : ScriptGiveEgg(species).
 *   `ScrCmd_setmonmove`      (l. 1702-1710) : ScriptSetMonMoveSlot(partyIndex, move, slot).
 *   `ScrCmd_setmonmetlocation` (l. 2256-2270) : SetMonData(MON_DATA_MET_LOCATION).
 *
 * `givepokemon` est un alias de `givemon` (= macro user-level dans event.inc).
 */

import { registerOpcode } from './script-runtime';
import { VarGet, VarSet } from './script-vars';
import { gSaveBlock1Ptr } from '../save-block-state';
import { reverseDecompConstant } from '../decomp-constants';
import { getMoveNameFr } from '../data-tables';
import { parseValue } from './script-opcodes-helpers';

/** _vget = VarGet avec fallback '0'. Local au fichier (= 1:1 décomp inline read). */
function _vget(arg: string | undefined): number {
  return VarGet(arg ?? '0');
}

/** 1:1 décomp `ScrCmd_givemon` (scrcmd.c:1681-1692) :
 *    species = VarGet(args[0]); level = VarGet(args[1]); item = VarGet(args[2]);
 *    ScriptGiveMon(species, level, item, 0, 0, 0);
 *  Retours : 0=MON_GIVEN_TO_PARTY, 1=MON_GIVEN_TO_PC, 2=MON_CANT_GIVE. */
registerOpcode('givemon', (_ctx, args) => {
  const speciesArg = args[0] ?? '';
  const level = parseValue(args[1] ?? '5') || 5;
  let speciesName = speciesArg;
  if (!speciesName.startsWith('SPECIES_')) {
    const num = VarGet(speciesArg);
    speciesName = reverseDecompConstant(num, 'SPECIES_') ?? `SPECIES_${num}`;
  }
  // item : ITEM_* littéral, VAR_*, ou absent (ITEM_NONE).
  const itemArg = args[2];
  let heldItem: string | undefined;
  if (itemArg && itemArg !== 'ITEM_NONE' && itemArg !== '0') {
    heldItem = itemArg.startsWith('ITEM_')
      ? itemArg
      : (reverseDecompConstant(VarGet(itemArg), 'ITEM_') ?? undefined);
  }
  void (async () => {
    try {
      const { createPokemonInstance, GiveMonToPlayer, MON_GIVEN_TO_PARTY } = await import('../pokemon');
      const mon = createPokemonInstance(speciesName, level, heldItem ? { heldItem } : undefined);
      const result = GiveMonToPlayer(mon);
      const ok = result === MON_GIVEN_TO_PARTY;
      // 1:1 ScriptGiveMon : 0=MON_GIVEN_TO_PARTY, 1=MON_GIVEN_TO_PC.
      VarSet('VAR_RESULT', ok ? 0 : 1);
      console.log(`[opcode givemon] ${speciesName} Lv${level}${heldItem ? ' @' + heldItem : ''} → ${ok ? 'PARTY(0)' : 'PC(1)'}`);
    } catch (e) {
      console.warn('[opcode givemon] failed:', e);
      VarSet('VAR_RESULT', 2);  // MON_CANT_GIVE
    }
  })();
  return false;
});

/** `givepokemon` est un alias de `givemon` (= macro user-level). */
registerOpcode('givepokemon', (_ctx, args) => {
  const speciesArg = args[0] ?? '';
  const level = parseValue(args[1] ?? '5') || 5;
  let speciesName = speciesArg;
  if (!speciesName.startsWith('SPECIES_')) {
    const num = VarGet(speciesArg);
    speciesName = reverseDecompConstant(num, 'SPECIES_') ?? `SPECIES_${num}`;
  }
  void (async () => {
    try {
      const { createPokemonInstance, GiveMonToPlayer, MON_GIVEN_TO_PARTY } = await import('../pokemon');
      const mon = createPokemonInstance(speciesName, level);
      const result = GiveMonToPlayer(mon);
      const ok = result === MON_GIVEN_TO_PARTY;
      VarSet('VAR_RESULT', ok ? 0 : 2);  // 0=success, 1=full, 2=fail
      console.log(`[opcode givepokemon] ${speciesName} Lv${level} → ${ok ? 'added' : 'party full'}`);
    } catch (e) {
      console.warn('[opcode givepokemon] failed:', e);
      VarSet('VAR_RESULT', 2);
    }
  })();
  return false;
});

/** 1:1 décomp `ScrCmd_giveegg` (scrcmd.c:1694-1700) :
 *    ScriptGiveEgg(VarGet(species)). Donne un Pokemon egg à la party.
 *  Notre port : log + skip (= ScriptGiveEgg à porter 1:1 strict en session dédiée).
 *  Dette : implémenter ScriptGiveEgg via script_pokemon_util.c port. */
registerOpcode('giveegg', (_ctx, args) => {
  console.log(`[opcode giveegg] species=${args[0]} — TODO ScriptGiveEgg port`);
  return false;
});

/** 1:1 décomp `ScrCmd_setmonmove` (scrcmd.c:1702-1710) :
 *    ScriptSetMonMoveSlot(partyIndex, move, slot). */
registerOpcode('setmonmove', (_ctx, args) => {
  const partyIndex = parseValue(args[0] ?? '0');
  const slot = parseValue(args[1] ?? '0');
  const moveArg = args[2] ?? 'MOVE_NONE';
  const party = gSaveBlock1Ptr.playerParty;
  if (party && partyIndex >= 0 && partyIndex < party.length && slot >= 0 && slot < 4) {
    const mon = party[partyIndex];
    if (!mon.moves) mon.moves = [];
    // 1:1 décomp `ScriptSetMonMoveSlot` set le slot direct (= overwrite).
    mon.moves[slot] = {
      id: moveArg.toLowerCase().replace(/^move_/, ''),
      nameFr: getMoveNameFr(moveArg),
      pp: 0, ppMax: 0,
    };
  }
  return false;
});

/** 1:1 décomp `ScrCmd_setmonmetlocation` (scrcmd.c:2256-2270) :
 *    SetMonData(&gPlayerParty[idx], MON_DATA_MET_LOCATION, &loc). */
registerOpcode('setmonmetlocation', (_ctx, args) => {
  const partyIndex = _vget(args[0]);
  const location = parseValue(args[1] ?? '0');
  const party = gSaveBlock1Ptr.playerParty as Array<{ metLocation?: number }>;
  if (party && partyIndex >= 0 && partyIndex < party.length) {
    party[partyIndex].metLocation = location;
  }
  return false;
});
