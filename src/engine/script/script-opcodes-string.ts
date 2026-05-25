/**
 * script-opcodes-string.ts — opcodes buffer* 1:1 décomp `string_util.c` +
 * `text.c` (= StringCopy + sScriptStringVars dispatch).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` :
 *   `ScrCmd_bufferspeciesname`        (l. 1549-1556) : StringCopy(STR_VAR_N, gSpeciesNames[id]).
 *   `ScrCmd_bufferleadmonspeciesname` (l. 1558-1567) : StringCopy(STR_VAR_N, lead mon species name).
 *   `ScrCmd_bufferpartymonnick`       (l. 1569-1577) : StringCopy(STR_VAR_N, party mon nick).
 *   `ScrCmd_bufferitemname`           (l. 1579-1586) : StringCopy(STR_VAR_N, gItems[id].name).
 *   `ScrCmd_bufferitemnameplural`     (l. 1588-1596) : pluralisée selon qty.
 *   `ScrCmd_buffermovename`           (l. 1607-1614) : StringCopy(STR_VAR_N, gMoveNames[id]).
 *   `ScrCmd_buffernumberstring`       (l. 1616-1624) : ConvertIntToDecimalStringN.
 *   `ScrCmd_bufferstdstring`          (l. 1626-1633) : StringCopy(STR_VAR_N, gStdStrings[id]).
 *   `ScrCmd_bufferstring`             (l. 1644-1651) : StringCopy(STR_VAR_N, ptr).
 *   `ScrCmd_buffertrainerclassname`   (l. 2272-2279) : StringCopy(STR_VAR_N, gTrainerClasses[t].className).
 *   `ScrCmd_buffertrainername`        (l. 2281-2293) : StringCopy(STR_VAR_N, gTrainers[t].trainerName).
 *   `ScrCmd_bufferboxname`            (l. 1672-1679) : StringCopy(STR_VAR_N, gPokemonStoragePtr->boxNames[id]).
 *   `ScrCmd_vbuffermessage`           (l. 1653-1659) : alias bufferstring (multi-lang).
 *   `ScrCmd_vbufferstring`            (l. 1661-1670) : alias bufferstring.
 *   `ScrCmd_vbuffer`                  : RS-era, removed in Em — no-op.
 *
 * `bufferattackname` = alias de `buffermovename` (= macro user-level).
 * `buffermoneyamount` n'est pas dans scrcmd.c décomp Em ; macro user-level.
 * `preparemsg` = RS-era removed in Em — no-op.
 */

import { registerOpcode, getOpcodeHandler } from './script-runtime';
import { VarGet } from './script-vars';
import { setStringVar } from '../string-buffers';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { reverseDecompConstant } from '../system/decomp-constants';
import {
  getSpeciesNameFr, getMoveNameFr, getItemNameFr, getTrainerNameFr,
  getTrainerClassNameFr, getTrainer,
} from '../data-tables';
import { parseValue } from './script-opcodes-helpers';

/** 1:1 décomp `ScrCmd_bufferspeciesname` (scrcmd.c) :
 *    StringCopy(sScriptStringVars[N], gSpeciesNames[VarGet(species)]); */
registerOpcode('bufferspeciesname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  let speciesName = args[1] || '';
  if (!speciesName.startsWith('SPECIES_')) {
    const num = VarGet(args[1] || '');
    speciesName = reverseDecompConstant(num, 'SPECIES_') ?? `SPECIES_${num}`;
  }
  setStringVar(n, getSpeciesNameFr(speciesName));
  return false;
});

/** 1:1 décomp `ScrCmd_bufferleadmonspeciesname` (scrcmd.c) :
 *    species = GetMonData(&gPlayerParty[GetLeadMonIndex()], MON_DATA_SPECIES);
 *    StringCopy(dest, gSpeciesNames[species]); */
registerOpcode('bufferleadmonspeciesname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  const lead = gSaveBlock1Ptr.playerParty?.[0];
  const speciesName = lead?.speciesNameFr ?? (lead?.speciesEnum ? getSpeciesNameFr(lead.speciesEnum) : '');
  setStringVar(n, speciesName);
  return false;
});

/** 1:1 décomp `ScrCmd_buffertrainerclassname` (scrcmd.c:2272-2279) :
 *    StringCopy(sScriptStringVars[N], gTrainerClasses[VarGet(trainerId)].className). */
registerOpcode('buffertrainerclassname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  const t = getTrainer(args[1] || '');
  setStringVar(n, t ? getTrainerClassNameFr(t.trainerClass) : '');
  return false;
});

/** 1:1 décomp `ScrCmd_buffertrainername` (scrcmd.c:2281-2293) :
 *    StringCopy(sScriptStringVars[N], gTrainers[VarGet(trainerId)].trainerName). */
registerOpcode('buffertrainername', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  setStringVar(n, getTrainerNameFr(args[1] || ''));
  return false;
});

/** 1:1 décomp `ScrCmd_bufferpartymonnick` (scrcmd.c) :
 *    GetMonData(&gPlayerParty[VarGet(slot)], MON_DATA_NICKNAME, dest); */
registerOpcode('bufferpartymonnick', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  const slot = Math.max(0, Math.min(5, parseValue(args[1] || '0')));
  const mon = gSaveBlock1Ptr.playerParty?.[slot];
  setStringVar(n, mon?.nickname || mon?.speciesNameFr || '');
  return false;
});

/** 1:1 décomp `ScrCmd_bufferitemname` (scrcmd.c) :
 *    StringCopy(sScriptStringVars[N], gItems[VarGet(item)].name). */
registerOpcode('bufferitemname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  let itemName = args[1] || '';
  if (!itemName.startsWith('ITEM_')) {
    const num = VarGet(args[1] || '');
    itemName = reverseDecompConstant(num, 'ITEM_') ?? `ITEM_${num}`;
  }
  setStringVar(n, getItemNameFr(itemName));
  return false;
});

/** 1:1 décomp `ScrCmd_bufferitemnameplural` (scrcmd.c) :
 *    Si qty > 1 → utilise StringAppend (gString_s).
 *    Sinon → StringCopy gItems[item].name. */
registerOpcode('bufferitemnameplural', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  let itemName = args[1] || '';
  if (!itemName.startsWith('ITEM_')) {
    const num = VarGet(args[1] || '');
    itemName = reverseDecompConstant(num, 'ITEM_') ?? `ITEM_${num}`;
  }
  const qty = parseValue(args[2] || '0');
  const name = getItemNameFr(itemName);
  setStringVar(n, qty > 1 ? name + 's' : name);
  return false;
});

/** 1:1 décomp `ScrCmd_buffermovename` (scrcmd.c) :
 *    StringCopy(sScriptStringVars[N], gMoveNames[VarGet(move)]). */
registerOpcode('buffermovename', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  let moveName = args[1] || '';
  if (!moveName.startsWith('MOVE_')) {
    const num = VarGet(args[1] || '');
    moveName = reverseDecompConstant(num, 'MOVE_') ?? `MOVE_${num}`;
  }
  setStringVar(n, getMoveNameFr(moveName));
  return false;
});

/** Alias de `buffermovename` — macro user-level. */
registerOpcode('bufferattackname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  let moveName = args[1] || '';
  if (!moveName.startsWith('MOVE_')) {
    const num = VarGet(args[1] || '');
    moveName = reverseDecompConstant(num, 'MOVE_') ?? `MOVE_${num}`;
  }
  setStringVar(n, getMoveNameFr(moveName));
  return false;
});

/** 1:1 décomp `ScrCmd_buffernumberstring` (scrcmd.c) :
 *    ConvertIntToDecimalStringN(sScriptStringVars[N], VarGet(num), STR_CONV_MODE_LEFT_ALIGN, 5). */
registerOpcode('buffernumberstring', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  setStringVar(n, String(parseValue(args[1] || '0')));
  return false;
});

/** Macro user-level — buffer money amount (= number + $). */
registerOpcode('buffermoneyamount', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  const amount = parseValue(args[1] || '0');
  setStringVar(n, String(amount) + '$');
  return false;
});

/** 1:1 décomp `ScrCmd_bufferstdstring` (scrcmd.c) :
 *    StringCopy(sScriptStringVars[N], gStdStrings[VarGet(id)]). */
registerOpcode('bufferstdstring', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  // Pas de table std strings extraite — fallback vide pour ne pas afficher
  // `{STR_VAR_N}` brut dans les dialogs.
  setStringVar(n, '');
  void args;
  return false;
});

/** 1:1 décomp `ScrCmd_bufferstring` (scrcmd.c) :
 *    StringCopy(sScriptStringVars[N], ptr). */
registerOpcode('bufferstring', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  // Texte direct entre guillemets — extraire (peut contenir des espaces).
  const txt = (args.slice(1).join(' ') || '').replace(/^"/, '').replace(/"$/, '');
  setStringVar(n, txt);
  return false;
});

/** 1:1 décomp `ScrCmd_bufferboxname` (scrcmd.c:1672-1679) :
 *    GetBoxNamePtr(VarGet(boxId), dest). */
registerOpcode('bufferboxname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  setStringVar(n, '');
  void args;
  return false;
});

// RS-era opcodes (= retirés du décomp Em) :
registerOpcode('preparemsg', (_ctx, _args) => false);
registerOpcode('vbuffer', (_ctx, _args) => false);

/** 1:1 décomp `ScrCmd_vbufferstring` (scrcmd.c) :
 *    Alias de bufferstring (multi-lang variant). */
registerOpcode('vbufferstring', (ctx, args) => getOpcodeHandler('bufferstring')?.(ctx, args) ?? false);

/** 1:1 décomp `ScrCmd_vbuffermessage` (scrcmd.c) :
 *    Alias de bufferstring (= multi-lang resolve). */
registerOpcode('vbuffermessage', (ctx, args) => {
  return getOpcodeHandler('bufferstring')?.(ctx, args) ?? false;
});
