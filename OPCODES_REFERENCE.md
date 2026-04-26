# OPCODES REFERENCE — pokeemeraude → script-runner.ts

> Audit exhaustif du 2026-04-25 (Agent Explore very thorough).
> Source de vérité : `asm/macros/event.inc` + `src/scrcmd.c` + `data/specials.inc`.
> **Couverture actuelle : 63/227 opcodes (28%)** — couvre top usage des scripts d'intro.

---

## 1. Stats globales

- **227 opcodes** (0x00 à 0xE2)
- **528 specials** (table `data/specials.inc`)
- ~63 opcodes wirés dans `script-runner.ts`
- ~5 specials wirés dans la table `SPECIALS`

---

## 2. Table complète des 227 opcodes

| Hex | Nom | Catégorie | Args | Bloquant? | Notes |
|---|---|---|---|---|---|
| 0x00 | nop | misc | - | non | No-op |
| 0x01 | nop1 | misc | - | non | No-op variant |
| 0x02 | end | flow | - | non | Termine script |
| 0x03 | return | flow | - | non | Retour call |
| 0x04 | call | flow | dest (4B) | non | Appel subroutine |
| 0x05 | goto | flow | dest (4B) | non | Saut incond. |
| 0x06 | goto_if | flow | cond (1B), dest (4B) | non | Saut cond. |
| 0x07 | call_if | flow | cond (1B), dest (4B) | non | Appel cond. |
| 0x08 | gotostd | flow | function (1B) | non | Saut std script |
| 0x09 | callstd | flow | function (1B) | non | Appel std script |
| 0x0A | gotostd_if | flow | cond, function | non | Saut std cond. |
| 0x0B | callstd_if | flow | cond, function | non | Appel std cond. |
| 0x0C | returnram | flow | - | non | Retour RAM script |
| 0x0D | endram | flow | - | non | Fin RAM script |
| 0x0E | setmysteryeventstatus | misc | value (1B) | non | Set MEVENT_STATUS_* |
| 0x0F | loadword | var | destIdx, value (4B) | non | Load 4B into local |
| 0x10 | loadbyte | var | destIdx, value (1B) | non | Load 1B into local |
| 0x11 | setptr | var | value (1B), ptr (4B) | non | Set ptr value |
| 0x12 | loadbytefromptr | var | destIdx, source (4B) | non | Load from ptr |
| 0x13 | setptrbyte | var | srcIdx, dest (4B) | non | Write to ptr |
| 0x14 | copylocal | var | destIdx, srcIdx | non | Copy locals |
| 0x15 | copybyte | var | dest (4B), source (4B) | non | Copy bytes |
| 0x16 | setvar | var | dest (2B), value (2B) | non | Set VAR_* |
| 0x17 | addvar | var | dest (2B), value (2B) | non | VAR += value |
| 0x18 | subvar | var | dest (2B), value (2B) | non | VAR -= value |
| 0x19 | copyvar | var | dest (2B), src (2B) | non | Copy VAR_* |
| 0x1A | setorcopyvar | var | dest, src | non | Set or copy |
| 0x1B-0x22 | compare_* (8 variants) | var | various | non | Comparaisons (locals/ptrs/values/vars) |
| 0x23 | callnative | misc | func (4B) | non | Call C func |
| 0x24 | gotonative | misc | func (4B) | oui | Goto C func |
| 0x25 | special | field | special_id (2B) | cond. | Call special handler |
| 0x26 | specialvar | field | var, special_id | cond. | Call special → var |
| 0x27 | waitstate | misc | - | oui | Block script |
| 0x28 | delay | misc | frames (2B) | non | Wait N frames |
| 0x29 | setflag | var | flag (2B) | non | FLAG = TRUE |
| 0x2A | clearflag | var | flag (2B) | non | FLAG = FALSE |
| 0x2B | checkflag | var | flag (2B) | non | Compare FLAG |
| 0x2C | initclock | misc | hour, minute | non | Init RTC offset |
| 0x2D | dotimebasedevents | misc | - | non | Update time |
| 0x2E | gettime | misc | - | non | Get time → VAR_0x8000-2 |
| 0x2F | playse | audio | song (2B) | non | Play SE |
| 0x30 | waitse | audio | - | oui | Wait SE finish |
| 0x31 | playfanfare | audio | song (2B) | non | Play fanfare |
| 0x32 | waitfanfare | audio | - | oui | Wait fanfare |
| 0x33 | playbgm | audio | song, save_song | non | Play BGM |
| 0x34 | savebgm | audio | song (2B) | non | Save BGM |
| 0x35 | fadedefaultbgm | audio | - | non | Fade to map BGM |
| 0x36 | fadenewbgm | audio | song (2B) | non | Fade to new BGM |
| 0x37 | fadeoutbgm | audio | speed (1B) | non | Fade out BGM |
| 0x38 | fadeinbgm | audio | speed (1B) | non | Fade in BGM |
| 0x39 | warp | warp | map, [warpId/x, y] | oui | Warp avec SE |
| 0x3A | warpsilent | warp | map, [warpId/x, y] | oui | Warp silent |
| 0x3B | warpdoor | warp | map, [warpId/x, y] | oui | Warp avec porte |
| 0x3C | warphole | warp | map | oui | Warp trou |
| 0x3D | warpteleport | warp | map, [warpId/x, y] | oui | Warp télé |
| 0x3E | setwarp | warp | map, [warpId/x, y] | non | Set warp dest |
| 0x3F | setdynamicwarp | warp | map, [warpId/x, y] | non | Set dynamic warp |
| 0x40 | setdivewarp | warp | map, [warpId/x, y] | non | Set dive warp |
| 0x41 | setholewarp | warp | map, [x, y] | non | Set hole warp |
| 0x42 | getplayerxy | var | x (2B), y (2B) | non | Get player pos |
| 0x43 | getpartysize | party | - | non | Get party size |
| 0x44 | additem | item | itemId, qty | non | Add item to bag |
| 0x45 | removeitem | item | itemId, qty | non | Remove item |
| 0x46 | checkitemspace | item | itemId, qty | non | Check space |
| 0x47 | checkitem | item | itemId, qty | non | Check qty |
| 0x48 | checkitemtype | item | itemId | non | Get pocket |
| 0x49 | addpcitem | pc | itemId, qty | non | Add to PC |
| 0x4A | checkpcitem | pc | itemId, qty | non | Check PC qty |
| 0x4B-0x4E | adddecoration / removedecoration / checkdecor / checkdecorspace | pc | decoration (2B) | non | Décor secret base |
| 0x4F | applymovement | movement | localId, movements (4B) | non | Apply move data |
| 0x50 | applymovementat | movement | localId, movements, map | non | Move other map |
| 0x51 | waitmovement | movement | [localId] | oui | Wait move done |
| 0x52 | waitmovementat | movement | localId, map | oui | Wait move other |
| 0x53 | removeobject | movement | localId | non | Despawn obj |
| 0x54 | removeobjectat | movement | localId, map | non | Despawn other |
| 0x55 | addobject | movement | localId | non | Spawn obj |
| 0x56 | addobjectat | movement | localId, map | non | Spawn other |
| 0x57 | setobjectxy | movement | localId, x, y | non | Set obj pos |
| 0x58 | showobjectat | movement | localId, map | non | Show obj |
| 0x59 | hideobjectat | movement | localId, map | non | Hide obj |
| 0x5A | faceplayer | movement | - | non | Face player |
| 0x5B | turnobject | movement | localId, direction | non | Turn obj |
| 0x5C | trainerbattle | battle | type, trainer, localid, ptrs | non | Setup battle |
| 0x5D | dotrainerbattle | battle | - | oui | Run battle |
| 0x5E | gotopostbattlescript | battle | - | non | Goto after battle |
| 0x5F | gotobeatenscript | battle | - | non | Goto beaten |
| 0x60 | checktrainerflag | var | trainer (2B) | non | Check defeated |
| 0x61 | settrainerflag | var | trainer (2B) | non | Mark defeated |
| 0x62 | cleartrainerflag | var | trainer (2B) | non | Unmark defeated |
| 0x63 | setobjectxyperm | movement | localId, x, y | non | Perm obj pos |
| 0x64 | copyobjectxytoperm | movement | localId | non | Sync obj pos |
| 0x65 | setobjectmovementtype | movement | localId, type (1B) | non | Set move type |
| 0x66 | waitmessage | dialogue | - | oui | Wait msg box |
| 0x67 | message | dialogue | text (4B) | non | Show msg |
| 0x68 | closemessage | dialogue | - | non | Close msg |
| 0x69 | lockall | movement | - | non | Freeze all |
| 0x6A | lock | movement | - | non | Freeze sel. |
| 0x6B | releaseall | movement | - | non | Unfreeze all |
| 0x6C | release | movement | - | non | Unfreeze sel. |
| 0x6D | waitbuttonpress | dialogue | - | oui | Wait A/B |
| 0x6E | yesnobox | dialogue | x, y | oui | YES/NO box |
| 0x6F | multichoice | dialogue | x, y, id, ignoreBPress | oui | Multichoice |
| 0x70 | multichoicedefault | dialogue | x, y, id, default, ignoreBPress | oui | Multichoice def. |
| 0x71 | multichoicegrid | dialogue | x, y, id, per_row, ignoreBPress | oui | Multichoice grid |
| 0x72-0x74 | drawbox / erasebox / drawboxtext | dialogue | various | non | Nopped en GBA |
| 0x75 | showmonpic | dialogue | species, x, y | non | Show mon pic |
| 0x76 | hidemonpic | dialogue | - | non | Hide mon pic |
| 0x77 | showcontestpainting | misc | winnerId | non | Show contest img |
| 0x78 | braillemessage | dialogue | text (4B) | non | Braille msg |
| 0x79 | givemon | party | species, level, item | non | Give mon |
| 0x7A | giveegg | party | species (2B) | non | Give egg |
| 0x7B | setmonmove | party | partyIdx, slot, move | non | Set mon move |
| 0x7C | checkpartymove | party | move (2B) | non | Check move in party |
| 0x7D | bufferspeciesname | buffer | strVarId, species | non | Buffer species |
| 0x7E | bufferleadmonspeciesname | buffer | strVarId | non | Buffer lead species |
| 0x7F | bufferpartymonnick | buffer | strVarId, slot | non | Buffer mon nick |
| 0x80 | bufferitemname | buffer | strVarId, item | non | Buffer item name |
| 0x81 | bufferdecorationname | buffer | strVarId, decor | non | Buffer decor name |
| 0x82 | buffermovename | buffer | strVarId, move | non | Buffer move name |
| 0x83 | buffernumberstring | buffer | strVarId, input | non | Buffer number |
| 0x84 | bufferstdstring | buffer | strVarId, index | non | Buffer std string |
| 0x85 | bufferstring | buffer | strVarId, text (4B) | non | Buffer string |
| 0x86 | pokemart | shop | products (4B) | oui | Pokemart |
| 0x87 | pokemartdecoration | shop | products (4B) | oui | Pokemart décor |
| 0x88 | pokemartdecoration2 | shop | products (4B) | oui | Pokemart décor 2 |
| 0x89 | playslotmachine | misc | id (2B) | oui | Slot machine |
| 0x8A | setberrytree | misc | treeId, berry, stage | non | Set berry tree |
| 0x8B-0x8E | choosecontestmon / startcontest / showcontestresults / contestlinktransfer | contest | various | oui | Concours |
| 0x8F | random | misc | limit (2B) | non | Random 0..limit |
| 0x90 | addmoney | var | value (4B), disable (1B) | non | Add money |
| 0x91 | removemoney | var | value (4B), disable | non | Remove money |
| 0x92 | checkmoney | var | value, disable | non | Check money |
| 0x93-0x95 | showmoneybox / hidemoneybox / updatemoneybox | var | x, y/disable | non | Money UI |
| 0x96 | getpokenewsactive | var | newsKind (2B) | non | Check news |
| 0x97 | fadescreen | field | mode (1B) | oui | Fade screen |
| 0x98 | fadescreenspeed | field | mode, speed | oui | Fade speed |
| 0x99 | setflashlevel | field | level (2B) | non | Set flash |
| 0x9A | animateflash | field | level (1B) | non | Animate flash |
| 0x9B | messageautoscroll | dialogue | text (4B) | non | Auto-scroll msg |
| 0x9C | dofieldeffect | field | animation (2B) | non | Do field fx |
| 0x9D | setfieldeffectargument | field | argNum, value | non | Set fx arg |
| 0x9E | waitfieldeffect | field | animation (2B) | oui | Wait fx |
| 0x9F | setrespawn | field | heallocation (2B) | non | Set respawn |
| 0xA0 | checkplayergender | var | - | non | Get gender |
| 0xA1 | playmoncry | audio | species, mode | non | Play cry |
| 0xA2 | setmetatile | field | x, y, metaId, impassable | non | Set metatile |
| 0xA3-0xA5 | resetweather / setweather / doweather | field | type | partly oui | Météo |
| 0xA6 | setstepcallback | field | stepCbId (1B) | non | Set step callback |
| 0xA7 | setmaplayoutindex | field | index (2B) | non | Set layout |
| 0xA8 | setobjectsubpriority | movement | localId, map, subpriority | non | Set priority |
| 0xA9 | resetobjectsubpriority | movement | localId, map | non | Reset priority |
| 0xAA | createvobject | misc | gfxId, id, x, y, elev, dir | non | Create vobj |
| 0xAB | turnvobject | misc | id, direction | non | Turn vobj |
| 0xAC | opendoor | field | x, y | oui | Open door |
| 0xAD | closedoor | field | x, y | oui | Close door |
| 0xAE | waitdooranim | field | - | oui | Wait door |
| 0xAF | setdooropen | field | x, y | non | Open door instant |
| 0xB0 | setdoorclosed | field | x, y | non | Close door instant |
| 0xB1-0xB2 | addelevmenuitem / showelevmenu | misc | various | non | Elevator (unused) |
| 0xB3-0xB5 | checkcoins / addcoins / removecoins | var | count (2B) | non | Coins (slot machine) |
| 0xB6 | setwildbattle | battle | species, level, item | non | Setup wild |
| 0xB7 | dowildbattle | battle | - | oui | Run wild battle |
| 0xB8 | setvaddress | warp | pointer (4B) | non | Set relative addr |
| 0xB9-0xBC | vgoto / vcall / vgoto_if / vcall_if | flow | dest | non | Variantes relatives |
| 0xBD-0xBF | vmessage / vbuffermessage / vbufferstring | dialogue/buffer | various | non | Variantes relatives |
| 0xC0-0xC2 | showcoinsbox / hidecoinsbox / updatecoinsbox | var | x, y | non | Coins UI |
| 0xC3 | incrementgamestat | misc | stat (1B) | non | Inc game stat |
| 0xC4 | setescapewarp | warp | map, [warpId/x, y] | non | Set escape warp |
| 0xC5 | waitmoncry | audio | - | oui | Wait cry |
| 0xC6 | bufferboxname | buffer | strVarId, box (2B) | non | Buffer box name |
| 0xC7-0xCC | textcolor / loadhelp / unloadhelp / signmsg / normalmsg / comparehiddenvar | misc | various | non | Nopped (FireRed only) |
| 0xCD-0xCE | setmodernfatefulencounter / checkmodernfatefulencounter | party | slot (2B) | non | Fateful encounter |
| 0xCF | trywondercardscript | misc | - | non | Wonder Card |
| 0xD0 | setworldmapflag | misc | flag (2B) | non | Nopped (FireRed) |
| 0xD1 | warpspinenter | warp | map, [warpId/x, y] | oui | Warp spin |
| 0xD2 | setmonmetlocation | party | slot, location | non | Set met location |
| 0xD3-0xD6 | rotatingtilepuzzle ops | field | various | partly oui | Trick House |
| 0xD7 | warpmossdeepgym | warp | map, [warpId/x, y] | oui | Warp Mossdeep |
| 0xD8 | selectapproachingtrainer | misc | - | non | Select trainer |
| 0xD9 | lockfortrainer | movement | - | non | Lock for trainer |
| 0xDA | closebraillemessage | dialogue | - | non | Close braille |
| 0xDB | messageinstant | dialogue | text (4B) | non | Message instant |
| 0xDC | fadescreenswapbuffers | field | mode (1B) | oui | Fade swap pal |
| 0xDD | buffertrainerclassname | buffer | strVarId, trainerId | non | Buffer class name |
| 0xDE | buffertrainername | buffer | strVarId, trainerId | non | Buffer trainer name |
| 0xDF | pokenavcall | misc | text (4B) | non | Pokenav call |
| 0xE0 | warpwhitefade | warp | map, [warpId/x, y] | oui | Warp white fade |
| 0xE1 | buffercontestname | buffer | strVarId, category | non | Buffer contest cat |
| 0xE2 | bufferitemnameplural | buffer | strVarId, item, qty | non | Buffer item plural |

---

## 3. Top 50 specials par fréquence d'usage

| Rang | Special | Occ | Description |
|---|---|---|---|
| 1 | DrawWholeMapView | 64 | Redraw whole map view (après setmetatile) |
| 2 | PlayerFaceTrainerAfterBattle | 60 | Player face trainer après bataille |
| 3 | LoadPlayerParty | 54 | Load party depuis save |
| 4 | HealPlayerParty | 42 | Restore HP/PP party |
| 5 | SavePlayerParty | 35 | Save party state |
| 6 | ShakeCamera | 23 | Shake screen effect |
| 7 | BufferFanClubTrainerName | 17 | Buffer trainer name for fan club |
| 8 | RemoveRecordsWindow | 16 | Close records window |
| 9 | SpawnCameraObject | 15 | Create camera sprite |
| 10 | DoSpecialTrainerBattle | 14 | Launch trainer battle (special) |
| 11 | ShowScrollableMultichoice | 13 | Show scrollable menu |
| 12 | ChoosePartyForBattleFrontier | 12 | Party select frontier |
| 13 | RemoveCameraObject | 10 | Delete camera sprite |
| 14 | GetPlayerBigGuyGirlString | 10 | Get boy/girl string |
| 15 | ChoosePartyMon | 10 | Show party selector |
| 16 | CloseLink | 7 | Close link connection |
| 17 | CloseBattlePointsWindow | 7 | Close BP window |
| 18 | BattleSetup_StartLegendaryBattle | 7 | Start legendary battle |
| 19 | Script_TryGainNewFanFromCounter | 5 | Fan club gain |
| 20 | MauvilleGymPressSwitch | 5 | Mauville gym switch |
| 21 | DoContestHallWarp | 5 | Warp to contest hall |
| 22 | WaitWeather | 4 | Wait weather change |
| 23 | TakeFrontierBattlePoints | 4 | Receive BP |
| 24 | ShowFrontierExchangeCornerItemIconWindow | 4 | Show item icon |
| 25 | ShowBattlePointsWindow | 4 | Show BP window |
| 26 | Script_DoRayquazaScene | 4 | Rayquaza cutscene |
| 27 | ResetSSTidalFlag | 4 | Reset SS Tidal |
| 28 | DoInGameTradeScene | 4 | NPC trade scene |
| 29 | CreateInGameTradePokemon | 4 | Create trade mon |
| 30 | CloseFrontierExchangeCornerItemIconWindow | 4 | Close item icon |
| 31 | UpdateBattlePointsWindow | 3 | Update BP display |
| 32 | StartRegiBattle | 3 | Legendary Regi |
| 33 | RemoveBerryPowderVendorMenu | 3 | Close berry menu |
| 34 | MoveElevator | 3 | Elevator animation |
| 35 | GetRivalSonDaughterString | 3 | Get rival text (déjà ✅) |
| 36 | DoSealedChamberShakingEffect_Short | 3 | Sealed chamber shake |
| 37 | CloseDeptStoreElevatorWindow | 3 | Close elevator |
| 38 | ClearLinkContestFlags | 3 | Link contest init |
| 39 | BufferMoveDeleterNicknameAndMove | 3 | Buffer move relearner text |
| 40 | BufferMonNickname | 3 | Buffer pokemon nickname |
| 41 | TryPutLotteryWinnerReportOnAir | 2 | Lottery TV |
| 42 | StorePlayerCoordsInVars | 2 | Get current position |
| 43 | ShowMapNamePopup | 2 | Location popup |
| 44 | ShowFrontierGamblerGoMessage | 2 | Gambler message |
| 45 | ShowFieldMessageStringVar | 2 | Field message (VAR_4) |
| 46 | ShouldDoBrailleRegicePuzzle | 2 | Regice puzzle check |
| 47 | SetSSTidalFlag | 2 | Flag SS Tidal |
| 48 | SetRoute | 2 | Route flag |
| 49 | SetPacifidlogTMReceivedDay | 2 | Pacifidlog TM |
| 50 | SetMewAboveGrass | 2 | Mew spawn |

---

## 4. Implémentation par catégorie : statut

| Catégorie | Total | Implémenté | % | Critique restant |
|---|---|---|---|---|
| flow | 14 | 12 | 86% | gotostd/callstd, vgoto/vcall, returnram |
| var | 27 | 11 | 41% | compare_* (8 variantes), addmoney/checkmoney, getplayerxy |
| dialogue | 29 | 5 | 17% | yesnobox, multichoice, waitbuttonpress, messageautoscroll |
| movement | 26 | 13 | 50% | turnobject, applymovementat, lockfortrainer |
| buffer | 13 | 0 | 0% | **TOUS** : bufferspecies/item/move/string critique pour dialogues |
| audio | 12 | 8 | 67% | fadeoutbgm/fadeinbgm/savebgm |
| warp | 15 | 5 | 33% | warpdoor, warphole, warpteleport, warpwhitefade, warpspinenter |
| battle | 8 | 0 | 0% | **TOUS** : trainerbattle, dotrainerbattle, wildbattle = bloqueur jeu |
| field | 19 | 11 | 58% | dofieldeffect, weather, animateflash |
| party | 8 | 0 | 0% | **TOUS** : givemon, giveegg, checkpartymove |
| item | 8 | 0 | 0% | **TOUS** : additem, checkitem, removeitem |
| shop | 3 | 0 | 0% | pokemart |
| misc | 16 | 5 | 31% | random, callnative, multichoice |
| pc/contest | 5 | 0 | 0% | Skip post-MVP |
| **TOTAL** | **227** | **~63** | **28%** | |

---

## 5. Roadmap d'implémentation (depuis l'audit)

### Phase A.x — MVP gameplay (priorité)
1. **Buffers** (13 opcodes, ~150 LoC) — débloquera énormément de dialogues. Priorité 1.
2. **trainerbattle / dotrainerbattle** + branches `gotopostbattlescript` / `gotobeatenscript` — combats fonctionnels.
3. **givemon / additem / removeitem / checkitem** — premier Pokémon, items basiques.
4. **yesnobox / multichoice** — UI interactive.
5. **special HealPlayerParty** + **DrawWholeMapView** + **GetPlayerBigGuyGirlString** + **ShakeCamera**.

### Phase B — Polish
- Variantes warp (warpdoor / warphole / warpteleport / spin / whitefade)
- Weather opcodes
- compare_* variantes
- Money UI + pokemart

### Skip permanently
- Contests (8 opcodes), berry blender, slot machine
- Battle frontier specials
- Wonder card / mystery event
- Braille puzzles
- Pokenav call

---

## 6. Patterns d'implémentation TS

### Opcode simple sync (ex. `setflag`)
```ts
if (op === 'setflag') {
  if (tokens[1]?.startsWith('FLAG_')) gameState.setFlag(tokens[1]);
  continue;
}
```

### Opcode bloquant async (ex. `dotrainerbattle`)
```ts
if (op === 'dotrainerbattle' && ctx.runTrainerBattle) {
  await ctx.runTrainerBattle();
  continue;
}
```

### Opcode buffer (ex. `bufferspeciesname`)
```ts
if (op === 'bufferspeciesname') {
  const n = Number(tokens[1]);
  const species = tokens[2]; // SPECIES_PIKACHU
  setStringVar(n, getSpeciesNameFr(species));
  continue;
}
```

### Special handler
```ts
const SPECIALS: Record<string, (ctx: ScriptContext) => Promise<void> | void> = {
  HealPlayerParty: () => { gameState.party.forEach(m => m.currentHp = m.maxHp); },
  ShakeCamera: async (ctx) => { await ctx.shakeCamera?.(); },
};
```

---

## 7. Maintenance

À mettre à jour quand :
- Nouvel opcode wiré dans `script-runner.ts` → cocher dans la table §4
- Nouveau special wiré dans la `SPECIALS` table → idem
- Nouveau opcode découvert dans le décomp (rare, ils sont stables Gen 3)

Source du décomp : `D:\Projet 1\decomps\pokeemeraude\asm\macros\event.inc` + `src/scrcmd.c`.
