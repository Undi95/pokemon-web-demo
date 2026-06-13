// Applique les 70 qualifications pokemon.c au backlog (remplacement des lignes "- [ ] Nom  @ ...").
const fs = require('fs');
const FILE = 'D:/Projet 1/pokemon-web-demo/audit-reports/1to1/BACKLOG-TROUS-COMBAT.md';

const Q = {
  ZeroBoxMonData: 'ÉQUIVALENCE — modèle party-storage EN CLAIR : createEmptyPokemon (party-storage.ts:221) zéroe le mon ; pas de BoxPokemon chiffré',
  ZeroPlayerPartyMons: 'ÉQUIVALENCE — gPlayerParty initialisé ×6 via createEmptyPokemon (party-storage.ts:249) ; callers restants = frontier/recorded (hors démo)',
  CreateMonWithGenderNatureLetter: 'DETTE — branche Cute Charm de CreateWildMon, non-port déjà documenté (wild-encounter.ts:36) ; pas de lead Cute Charm atteignable démo',
  CreateMaleMon: 'DETTE — caller unique battle_setup.c:482 = Ralts de Wally (tuto Petalburg) ; contrôleur Wally = dette actée (6f928ed6)',
  CreateMonWithIVsPersonality: 'DETTE — caller roamer.c (Latias/Latios) hors démo',
  CreateMonWithIVsOTID: 'DETTE — helper de la chaîne roamer (caller interne pokemon.c only)',
  CreateMonWithEVSpread: 'DETTE — caller battle_tower.c only (frontier)',
  CreateBattleTowerMon: 'DETTE — battle_tower/trainer_hill (frontier)',
  CreateBattleTowerMon_HandleLevel: 'DETTE — battle_tower (frontier)',
  CreateApprenticeMon: 'DETTE — apprentice (frontier)',
  CreateMonWithEVSpreadNatureOTID: 'DETTE — battle_dome/factory/tower (frontier)',
  ConvertPokemonToBattleTowerPokemon: 'DETTE — battle_tower (frontier)',
  CreateEventMon: 'DETTE — mystery event : aucun caller hors pokemon.c (code mort démo)',
  GetDeoxysStat: 'DETTE — Deoxys (event hors démo) ; notre GetMonData (party-storage.ts:257) = branche !DEOXYS 1:1',
  GetUnionRoomTrainerPic: 'DETTE — union room (link), callers controller_link/recorded_opponent',
  GetUnionRoomTrainerClass: 'DETTE — union room (link)',
  BoxMonToMon: 'DETTE — storage PC Phase 5 + summary non portés ; modèle sans BoxMon (party directe, pas de copie box→mon)',
  SetBattleMonMoveSlot: 'DETTE — brique du state 4 Cmd_yesnoboxlearnmove (remplacement de move au level-up, bsc.c:5484-5495) : notre opcode = auto-NO UI Phase 1.4 deferred (battle-script-commands.ts:10359-10365) ; à porter au câblage yes/no + summary réels',
  GiveMonInitialMoveset: 'ÉQUIVALENCE — moveset initial par learnset au spawn : gameDataLevelUpLearnsets bridge (battle-script-commands.ts:9976) + instances spawner ; vérifié A/B (Wurmple Tackle/String Shot)',
  GiveBoxMonInitialMoveset: 'ÉQUIVALENCE — même chemin learnset (modèle sans BoxMon)',
  DeleteFirstMoveAndGiveMoveToMon: 'DETTE — caller daycare.c only (héritage œufs hors démo)',
  GetMonGender: 'ÉQUIVALENCE — GetGenderFromSpeciesAndPersonality (species-runtime), consommé par battle_interface.ts:1216 _gender (symbole ♂/♀ healthbox) = formule genderRatio/personality 1:1',
  GetBoxMonGender: 'ÉQUIVALENCE — même formule (modèle sans BoxMon)',
  SetMultiuseSpriteTemplateToTrainerFront: 'DETTE — caller controller_player.c:2326 = branche LINK/multi de DrawTrainerPic (front pic du joueur adverse) ; solo = back pic porté',
  EncryptBoxMon: 'ÉQUIVALENCE STRUCTURELLE — modèle party-storage EN CLAIR : pas de chiffrement XOR/checksum ; GetMonData/SetMonData accès direct (divergence plateforme documentée)',
  DecryptBoxMon: 'ÉQUIVALENCE STRUCTURELLE — idem EncryptBoxMon (modèle en clair)',
  GetMonData3: 'ÉQUIVALENCE — notre GetMonData(mon, field) (party-storage.ts:257) = la signature data=NULL ; champs string retournés en string TS',
  GetMonsStateToDoubles_2: 'DETTE — gating doubles de trainer_see.c (:216/:283) : aucun dresseur double atteignable démo',
  CreateSecretBaseEnemyParty: 'DETTE — secret bases (battle_util2.c) hors démo',
  GetSecretBaseTrainerPicIndex: 'DETTE — secret bases',
  GetSecretBaseTrainerClass: 'DETTE — secret bases',
  IsPokemonStorageFull: 'DETTE — caller unique GiveMonToPlayer→CopyMonToPC ; PC storage Phase 5, dette R3 déjà écrite (party-storage.ts:995 → MON_CANT_GIVE)',
  GetSpeciesName: 'ÉQUIVALENCE — call-site combat battle_message.c:2913 (B_BUFF_SPECIES) porté : _speciesName (battle-message.ts:421), encodage byte-level via encodeChars',
  RemoveBattleMonPPBonus: 'DETTE — brique du state 4 Cmd_yesnoboxlearnmove (cf. SetBattleMonMoveSlot), auto-NO UI deferred',
  ExecuteTableBasedItemEffect: 'ÉQUIVALENCE — moteur PokemonUseItemEffects PORTÉ 1:1 (bag-item-effects.ts:266) ; ce wrapper 4-args (retry moveIndex) = chemins party_menu/item_use OW',
  BufferStatRoseMessage: 'DETTE douce — message vitamines OW (appelé par UseStatIncreaseItem) ; moteur EV porté, message sac OW = UI non câblée',
  UseStatIncreaseItem: 'DETTE douce — wrapper UI item_use.c (DisplayItemMessage du boost) ; moteur 1:1 porté (bag-item-effects.ts PokemonUseItemEffects)',
  HoennPokedexNumToSpecies: 'DETTE — code mort : aucun caller (proto pokemon.h only)',
  SpeciesToCryId: 'DETTE AUDIO — mapping species→cry index du player vanilla ; audio = bricolage maison (ordre user : ne pas toucher BGM/SE)',
  DrawSpindaSpotsUnused: 'DETTE — UNUSED nominal',
  DrawSpindaSpots: 'DETTE douce — spots procéduraux Spinda (LoadSpecialPokePic, decompress.c:112/343/404) ; Spinda hors zone démo (Route 113) ; pic harnais sans spots documenté',
  EvolutionRenameMon: 'DETTE — evolution_scene.c non porté (naming screen) ; évolution hors flux démo',
  GetPlayerFlankId: 'DETTE — multi link (party_menu)',
  GetTrainerEncounterMusicId: 'DETTE BGM — sélection musique de rencontre par classe ; BGM maison (battle_setup soldé avec cette dette)',
  UpdatePartyPokerusTime: 'DETTE — clock.c RTC daily (pokérus hors démo)',
  TryIncrementMonLevel: 'DETTE — caller daycare.c only (le Rare Candy vanilla passe par l’EXP direct dans PokemonUseItemEffects, porté bag-item-effects.ts)',
  CanSpeciesLearnTMHM: 'DETTE — caller apprentice.c only (frontier)',
  GetMoveRelearnerMoves: 'DETTE — move_relearner.c (tuteur Fallarbor) hors démo',
  GetLevelUpMovesBySpecies: 'DETTE — caller daycare.c only (héritage œufs)',
  GetNumberOfRelearnableMoves: 'DETTE — party_menu mode RELEARNER (DisplayPartyPokemonDataForRelearner :948 + special :6302) hors démo',
  IsSpeciesInHoennDex: 'DETTE — trade.c (échanges in-game hors démo)',
  PlayMapChosenOrBattleBGM: 'DETTE BGM — audio maison (ordre user : ne pas toucher)',
  CreateTask_PlayMapChosenOrBattleBGM: 'DETTE BGM — idem',
  Task_PlayMapChosenOrBattleBGM: 'DETTE BGM — idem',
  IsHMMove2: 'DETTE — callers : state 4 yesnoboxlearnmove (auto-NO deferred, cf. SetBattleMonMoveSlot) + evolution_scene (hors démo)',
  GetMonFlavorRelation: 'DETTE — use_pokeblock.c (pokéblocks hors démo)',
  MonRestorePP: 'DETTE — caller egg_hatch.c only (œufs hors démo)',
  BoxMonRestorePP: 'DETTE — daycare + storage PC (Phase 5)',
  SetMonPreventsSwitchingString: 'DETTE douce — party_menu.c:5841 PARTY_ACTION_ABILITY_PREVENTS (Shadow Tag/Arena Trap/Magnet Pull) : aucun porteur atteignable démo ; chemin party-menu combat non câblé',
  GetWildMonTableIdInAlteringCave: 'DETTE — Altering Cave (event) hors démo',
  GetOwnOpposingLinkMultiBattlerId: 'DETTE — link multi',
  GetOpposingLinkMultiBattlerId: 'DETTE — link multi (battle_tv)',
  FacilityClassToPicIndex: 'DETTE — frontier facility classes (main_menu/trainer_card, hors combat)',
  PlayerGenderToFrontTrainerPicId: 'DETTE — callers link/recorded/dome + transition Mugshot (hors démo) + branche link controller_player.c:2324',
  GetTrainerClassNameFromId: 'DETTE — scrcmd buffertrainerclassname : aucun script démo',
  GetTrainerNameFromId: 'DETTE — scrcmd buffertrainername : aucun script démo',
  InitMonSpritesGfx_Battle: 'ÉQUIVALENCE — AllocateMonSpritesGfx + gMonSpritesGfxPtr (battle_gfx_sfx_util, consommés battle_controller_opponent.ts:93/:353) couvrent le mode battle ; le ManagerA = summary',
  CreateMonSpritesGfxManager: 'DETTE — pokemon_summary_screen.c:1137 (summary screen non porté) ; mode battle couvert par AllocateMonSpritesGfx',
  DestroyMonSpritesGfxManager: 'DETTE — idem summary',
  MonSpritesGfxManager_GetSpritePtr: 'DETTE — idem summary',
};

let txt = fs.readFileSync(FILE, 'utf8');
let done = 0, miss = [];
for (const [name, qual] of Object.entries(Q)) {
  const re = new RegExp(`^- \\[ \\] ${name}  @ (L[\\d-]+)$`, 'm');
  const m = txt.match(re);
  if (!m) { miss.push(name); continue; }
  txt = txt.replace(re, `- [x] ${name}  @ ${m[1]} — ${qual}`);
  done++;
}
fs.writeFileSync(FILE, txt);
console.log(`qualifiés: ${done}/70 ; manqués: ${miss.join(',') || 'aucun'}`);
console.log('restants non cochés:', (txt.match(/^- \[ \]/gm) || []).length);
