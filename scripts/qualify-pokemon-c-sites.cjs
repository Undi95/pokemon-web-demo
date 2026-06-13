// Call-sites précis (fichier:ligne + code) des items pokemon.c « gris » —
// ceux dont l'atteignabilité démo dépend du contexte d'appel exact.
const { execSync } = require('child_process');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';

const probes = [
  ['CreateMaleMon', 'battle_setup.c'],
  ['CreateMonWithGenderNatureLetter', 'wild_encounter.c'],
  ['SetBattleMonMoveSlot', 'battle_script_commands.c'],
  ['RemoveBattleMonPPBonus', 'battle_script_commands.c'],
  ['IsHMMove2', 'battle_script_commands.c'],
  ['IsHMMove2', 'evolution_scene.c'],
  ['SetMultiuseSpriteTemplateToTrainerFront', 'battle_controller_player.c'],
  ['PlayerGenderToFrontTrainerPicId', 'battle_controller_player.c'],
  ['PlayerGenderToFrontTrainerPicId', 'battle_transition.c'],
  ['GetMonsStateToDoubles_2', 'trainer_see.c'],
  ['GetNumberOfRelearnableMoves', 'party_menu.c'],
  ['SetMonPreventsSwitchingString', 'party_menu.c'],
  ['UseStatIncreaseItem', 'item_use.c'],
  ['ExecuteTableBasedItemEffect', 'item_use.c'],
  ['ExecuteTableBasedItemEffect', 'party_menu.c'],
  ['IsPokemonStorageFull', 'pokemon.c'],
  ['GetWildMonTableIdInAlteringCave', 'pokemon.c'],
  ['GetDeoxysStat', 'pokemon.c'],
  ['TryIncrementMonLevel', 'pokemon.c'],
  ['GetTrainerClassNameFromId', 'scrcmd.c'],
  ['GetTrainerNameFromId', 'scrcmd.c'],
  ['DrawSpindaSpots', 'decompress.c'],
  ['SpeciesToCryId', 'sound.c'],
  ['CreateMonSpritesGfxManager', 'pokemon_summary_screen.c'],
  ['InitMonSpritesGfx_Battle', 'pokemon.c'],
  ['GetMonGender', 'battle_interface.c'],
  ['GetMonGender', 'battle_main.c'],
  ['GetMonGender', 'battle_script_commands.c'],
  ['GetSpeciesName', 'battle_message.c'],
  ['BufferStatRoseMessage', 'pokemon.c'],
  ['HoennPokedexNumToSpecies', 'pokemon.c'],
  ['GetUnionRoomTrainerPic', 'battle_controller_link_opponent.c'],
];

for (const [name, file] of probes) {
  let lines = [];
  try {
    lines = execSync(`grep -n "${name}" "${DECOMP}/src/${file}"`, { encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch { /* absent */ }
  // exclure la déf elle-même
  lines = lines.filter(l => {
    const body = l.replace(/^\d+:/, '').trim();
    return !new RegExp(`^(static )?(u8|u16|u32|s8|s16|s32|void|bool8|bool32|struct [\\w *]+|const [\\w *]+)\\s+\\*?${name}\\(`).test(body);
  });
  console.log(`### ${name} @ ${file}`);
  for (const l of lines.slice(0, 4)) console.log('   ' + l.slice(0, 150));
}
