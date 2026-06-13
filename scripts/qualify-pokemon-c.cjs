// Qualification des 70 items pokemon.c du backlog : croise les call-sites
// décomp (qui appelle ? depuis quel fichier ?) avec notre src/ (équivalence ?).
const { execSync } = require('child_process');
const fs = require('fs');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const WEB = 'D:/Projet 1/pokemon-web-demo';

const names = `ZeroBoxMonData ZeroPlayerPartyMons CreateMonWithGenderNatureLetter CreateMaleMon
CreateMonWithIVsPersonality CreateMonWithIVsOTID CreateMonWithEVSpread CreateBattleTowerMon
CreateBattleTowerMon_HandleLevel CreateApprenticeMon CreateMonWithEVSpreadNatureOTID
ConvertPokemonToBattleTowerPokemon CreateEventMon GetDeoxysStat GetUnionRoomTrainerPic
GetUnionRoomTrainerClass BoxMonToMon SetBattleMonMoveSlot GiveMonInitialMoveset
GiveBoxMonInitialMoveset DeleteFirstMoveAndGiveMoveToMon GetMonGender GetBoxMonGender
SetMultiuseSpriteTemplateToTrainerFront EncryptBoxMon DecryptBoxMon GetMonData3
GetMonsStateToDoubles_2 CreateSecretBaseEnemyParty GetSecretBaseTrainerPicIndex
GetSecretBaseTrainerClass IsPokemonStorageFull GetSpeciesName RemoveBattleMonPPBonus
ExecuteTableBasedItemEffect BufferStatRoseMessage UseStatIncreaseItem HoennPokedexNumToSpecies
SpeciesToCryId DrawSpindaSpotsUnused DrawSpindaSpots EvolutionRenameMon GetPlayerFlankId
GetTrainerEncounterMusicId UpdatePartyPokerusTime TryIncrementMonLevel CanSpeciesLearnTMHM
GetMoveRelearnerMoves GetLevelUpMovesBySpecies GetNumberOfRelearnableMoves IsSpeciesInHoennDex
PlayMapChosenOrBattleBGM CreateTask_PlayMapChosenOrBattleBGM Task_PlayMapChosenOrBattleBGM
IsHMMove2 GetMonFlavorRelation MonRestorePP BoxMonRestorePP SetMonPreventsSwitchingString
GetWildMonTableIdInAlteringCave GetOwnOpposingLinkMultiBattlerId GetOpposingLinkMultiBattlerId
FacilityClassToPicIndex PlayerGenderToFrontTrainerPicId GetTrainerClassNameFromId
GetTrainerNameFromId InitMonSpritesGfx_Battle CreateMonSpritesGfxManager
DestroyMonSpritesGfxManager MonSpritesGfxManager_GetSpritePtr`.split(/\s+/).filter(Boolean);

function grep(pattern, dir, extra) {
  try {
    return execSync(`grep -rn ${extra || ''} "${pattern}" ${dir}`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).split('\n').filter(Boolean);
  } catch { return []; }
}

const out = [];
for (const name of names) {
  // call-sites décomp : src/*.c + include/*.h, on EXCLUT la ligne de déf (pokemon.c) et les prototypes (include/pokemon.h)
  const hits = grep(`\\b${name}(\\b|\\()`, `"${DECOMP}/src" "${DECOMP}/include"`, '-E')
    .filter(l => !l.includes('.h:') || !/^\s*(u8|u16|u32|s8|s16|s32|void|bool8|bool32|const)\b.*\);\s*$/.test(l.split(':').slice(2).join(':')));
  const callers = new Set();
  for (const l of hits) {
    const m = l.match(/[\\/]([\w.]+\.(c|h)):(\d+):/);
    if (!m) continue;
    const file = m[1];
    const body = l.split(':').slice(2).join(':');
    // exclure la définition elle-même (pokemon.c, ligne qui COMMENCE par un type + nom)
    if (file === 'pokemon.c' && new RegExp(`^(static )?(u8|u16|u32|s8|s16|s32|void|bool8|bool32|struct [\\w *]+|const [\\w *]+)\\s+\\*?${name}\\(`).test(body.trim())) continue;
    // exclure prototypes .h
    if (file.endsWith('.h') && /\);\s*$/.test(body) && !/=/.test(body) && !/\w+\(.*\b\w+\(/.test(body)) {
      // garde les usages en macro/table, exclut les prototypes simples
      if (new RegExp(`${name}\\s*\\([^)]*\\)\\s*;\\s*$`).test(body.trim()) && /^(u8|u16|u32|s8|s16|s32|void|bool8|bool32|struct|const)/.test(body.trim())) continue;
    }
    callers.add(file);
  }
  // équivalence chez nous (src/, hors decomp-data auto)
  const ours = grep(`\\b${name}\\b`, `"${WEB}/src"`, '-E')
    .filter(l => !l.includes('decomp-data'))
    .map(l => { const m = l.match(/src[\\/](.+?):(\d+)/); return m ? m[1] + ':' + m[2] : null; })
    .filter(Boolean);
  out.push({ name, callers: [...callers].sort(), ours: ours.slice(0, 6), oursCount: ours.length });
}
fs.writeFileSync(`${WEB}/audit-reports/pokemon-c-qualification.json`, JSON.stringify(out, null, 1));
for (const o of out) {
  console.log(`${o.name} | decomp-callers: ${o.callers.join(',') || 'AUCUN'} | ours(${o.oursCount}): ${o.ours.slice(0, 3).join(' ; ') || '-'}`);
}
