/**
 * Runner de scripts de map pokeemerald — version legacy (= utilisée par
 * `OverworldScene` non-active + `world-renderer` type-only + `map-scripts`).
 *
 * Audit session 126 LOT C10 : le commentaire daté précédent disait que
 * `goto_if_set` était toujours ignoré. C'est faux : ligne 602 lit
 * `FlagGet(token)` correctement. Vars / flags sont aussi readés
 * depuis `gameState` (= shared avec `script-runtime` moderne).
 *
 * **Status legacy** : le runtime principal est désormais `script-runtime.ts`
 * (= bytecode-style 1:1 décomp avec waits + compositional opcodes). Ce
 * runner reste pour back-compat de `OverworldScene` (= scene 5 inactive
 * dans le path actuel). Migration future : delete ce module + adapter
 * OverworldScene.
 *
 * Commandes implémentées (= sous-ensemble) :
 *   lock / release / end / return / nop / closemessage : no-op visuel
 *   faceplayer        : tourne le NPC vers le joueur
 *   msgbox <tx>, ... : affiche le texte <tx>, attend input
 *   goto <label>      : saut inconditionnel
 *   goto_if_set ...   : check FlagGet (= 1:1 décomp)
 *   goto_if_ne ...    : check var != value
 *   goto_if_eq ...    : check var == value
 *   call <label>      : push et saut
 */

export interface ParsedScripts {
  scripts: Record<string, string[]>;
  texts: Record<string, string>;
}

export type ScriptContext = {
  showText: (text: string) => Promise<void>;
  faceNpcToPlayer: () => void;
  lockPlayer: () => void;
  releasePlayer: () => void;
  warp?: (destMapId: string, x: number, y: number) => void;
  setObjectXY?: (localId: string, x: number, y: number) => void;
  // applymovement : retourne une promise qui resolve à la fin de la séquence,
  // qui peut être awaitée par waitmovement (ou non, mouvement parallèle).
  applyMovement?: (localId: string, actions: string[]) => Promise<void>;
  waitMovement?: (localId: string) => Promise<void>;
  // addobject/removeobject : show/hide le NPC. Le sprite reste à sa position
  // courante (pas de respawn), seul .visible est togglé.
  setObjectVisible?: (localId: string, visible: boolean) => void;
  // delay N : pause de N frames (1 frame ≈ 16ms à 60fps)
  delay?: (frames: number) => Promise<void>;
  // hideplayer / showplayer : toggle visibility du sprite joueur
  setPlayerVisible?: (visible: boolean) => void;
  // setobjectmovementtype LOCALID, MOVEMENT_TYPE_X : change l'idle facing du NPC
  setObjectMovementType?: (localId: string, mvmtType: string) => void;
  // fadescreen FADE_TO_BLACK / FADE_FROM_BLACK : transition d'écran
  fadeScreen?: (mode: string) => Promise<void>;
  // setmetatile X, Y, METATILE_LABEL, IMPASSABLE : modifie la tile à (x,y).
  // Pour l'instant le label METATILE_* n'est pas résolu en numérique (besoin
  // d'extraire metatile_labels.h). On note l'appel pour debugging futur.
  setMetatile?: (x: number, y: number, metatileLabel: string, impassable: boolean) => void;
  // setstepcallback STEP_CB_X : active un effet visuel pendant le déplacement
  // (STEP_CB_TRUCK = oscillation caméra "le camion roule", etc.)
  setStepCallback?: (name: string) => void;
  // opendoor X, Y / closedoor X, Y : lance une animation de porte à (x,y).
  // Retourne une promise résolue à la fin de l'animation (await par waitdooranim).
  playDoorAnim?: (mode: 'open' | 'close', x: number, y: number) => Promise<void>;
  // trainerbattle / dotrainerbattle : lance la BattleScene contre un dresseur.
  // Retourne 'win' | 'lose'. La party joueur courante est utilisée.
  runTrainerBattle?: (trainerId: string) => Promise<'win' | 'lose'>;
  // setwildbattle / dowildbattle : combat sauvage.
  runWildBattle?: (species: string, level: number, heldItem?: string) => Promise<'win' | 'lose' | 'caught' | 'flee'>;
  // yesnobox : menu OUI/NON. Retourne true si OUI, false si NON ou cancel.
  askYesNo?: () => Promise<boolean>;
  // multichoice : menu liste. Retourne l'index (0-based) du choix, ou -1 si cancel.
  askMultichoice?: (options: string[], defaultIdx?: number) => Promise<number>;
  // Audio : routés vers music.ts si dispo. Tous non-bloquants (waitse/waitmoncry sont no-op).
  playSE?: (name: string) => void;       // ex: 'se_ball_throw' → joue se_*.mid one-shot
  // playbgm SONG, save : reboucle infini. Si save=true, save le slot pour fadedefaultbgm.
  playBGM?: (name: string, save?: boolean) => void;
  playCry?: (species: string) => void;   // ex: 'rayquaza' → joue cries/<species>.wav
  // playfanfare : pause BGM, joue jingle one-shot, restore BGM. Cf. décomp.
  playFanfare?: (name: string) => void;
  // savebgm SONG : set le slot saved (MUS_DUMMY = clear). Pas de play immédiat.
  saveBgm?: (name: string) => void;
  // fadedefaultbgm : crossfade vers la BGM par défaut de la map courante.
  fadeDefaultBgm?: () => void;
  // fadenewbgm SONG : crossfade vers SONG.
  fadeNewBgm?: (name: string) => void;
  // Item balls : pickup affiché + persistance "ramassé" pour ne pas réapparaître
  findItem?: (itemName: string, quantity: number) => Promise<void>;
  markItemBallTaken?: (scriptLabel: string) => void;
};

import { gSaveBlock1Ptr, gSaveBlock2Ptr } from '../save-block-state';
import { SetDynamicWarp } from '../warp-system';
import { MALE, FEMALE } from '../decomp-globals';
import { FlagSet, FlagClear, FlagGet, VarSet, VarGet } from './script-vars';
import { resolveDecompConstant } from '../decomp-constants';
import { setStringVar } from '../string-buffers';
import {
  getSpeciesNameFr, getMoveNameFr, getTrainerClassNameFr,
  getItemNameFr, getTrainer, getTrainerNameFr,
} from '../data-tables';
import { createPokemonInstance, GiveMonToPlayer, MON_GIVEN_TO_PARTY } from '../pokemon';

// Constantes décomp `include/constants/items.h` enum starters (Hoenn).
// `sStarterMon[]` dans starter_choose.c : index 0/1/2 → species enum.
const STARTER_SPECIES = ['SPECIES_TREECKO', 'SPECIES_TORCHIC', 'SPECIES_MUDKIP'];
const STARTER_NAMES_FR = ['Arcko', 'Poussifeu', 'Gobou'];

/**
 * Table des `special <FuncName>` du décomp implémentés côté TS. Chaque entrée
 * imite le comportement de la fonction C correspondante (cf. data/specials.inc
 * + src/scripts_*.c). Les specials non listés sont ignorés (no-op).
 *
 * Signature : reçoit le ScriptContext courant pour pouvoir interagir avec
 * la scène (msgbox, fadeScreen, etc.). Peut être async.
 */
type SpecialFn = (ctx: ScriptContext) => void | Promise<void>;
const SPECIALS: Record<string, SpecialFn> = {
  // Set STR_VAR_1 à "fils" si le rival est un garçon, "fille" sinon.
  // Cf. src/data/event_scripts.s + src/script_specials.c.
  GetRivalSonDaughterString: () => {
    // gameState.gender MALE → rival = May (fille). FEMALE → rival = Brendan (garçon).
    const rivalIsBoy = gSaveBlock2Ptr.playerGender === FEMALE;
    setStringVar(1, rivalIsBoy ? 'fils' : 'fille');
  },
  // 1:1 décomp `HealPlayerParty()` (script_pokemon_util.c) : heal HP + PP +
  // status pour tous les mons de gPlayerParty (= gSaveBlock1Ptr.playerParty).
  HealPlayerParty: () => {
    for (const m of (gSaveBlock1Ptr.playerParty as Array<{ currentHp: number; maxHp: number; status: unknown; moves: Array<{ pp: number; ppMax: number }> }>)) {
      m.currentHp = m.maxHp;
      m.status = null;
      for (const mv of m.moves) mv.pp = mv.ppMax;
    }
  },
  // Save/Load party : décomp = mem-to-mem entre gPlayerParty et frontier
  // playerParty buffer, PAS d'écriture SRAM. La save SRAM ne se fait QUE via
  // START → SAUVER explicite. Notre party est déjà partagée en RAM. (Avant :
  // `gameState.save()` ici → cause user-flag "save random" 2026-05-21).
  SavePlayerParty: () => { /* mem-to-mem, no SRAM write */ },
  LoadPlayerParty: () => { /* gameState.load() déjà fait au boot */ },
  // Refresh visuel de la map après setmetatile. Nos setmetatile sont sync.
  DrawWholeMapView: () => { /* no-op */ },
  // WallClock UI (= 1:1 décomp `Special_ViewWallClock` + `StartWallClock`).
  // **Note** : ce legacy script runner est bypass par le NEW opcode dispatcher
  // dans script-opcodes.ts qui intercepte ces specials directement et lance
  // `wallclock-flow.ts`. Si on arrive ici (= legacy path), on fait un fallback
  // léger : juste un msgbox texte de l'heure courante. Compatible avec PC time
  // via `rtc.ts:RtcCalcLocalTime` (= source de vérité unifiée, fix overflow
  // 366-day du décomp).
  StartWallClock: () => { /* legacy fallback : skip UI, offset reste 0 */ },
  Special_ViewWallClock: async (ctx) => {
    const { RtcCalcLocalTime, gLocalTime } = await import('../rtc');
    RtcCalcLocalTime();
    const h12 = gLocalTime.hours < 12 ? (gLocalTime.hours === 0 ? 12 : gLocalTime.hours) : (gLocalTime.hours === 12 ? 12 : gLocalTime.hours - 12);
    const period = gLocalTime.hours < 12 ? 'AM' : 'PM';
    const m = String(gLocalTime.minutes).padStart(2, '0');
    await ctx.showText(`Il est ${h12}h${m} ${period}.$`);
  },
  // Choix du starter (Route 101 sac de Birch). Décomp `ChooseStarter()` →
  // `CB2_ChooseStarter` (UI 3 pokeballs) → `CB2_GiveStarter` (donne mon lvl 5
  // + lance BATTLE_TYPE_FIRST_BATTLE vs Pochyena). On simplifie : multichoice
  // texte → addToParty → set VAR_RESULT + VAR_STARTER_MON. Le combat tutorial
  // vs Pochyena est lancé après par le wildbattle (cf. extension future si
  // besoin — pour l'instant le script Route101 enchaîne directement Birch
  // remercie + warp lab).
  ChooseStarter: async (ctx) => {
    if (!ctx.askMultichoice) {
      console.warn('[ChooseStarter] askMultichoice non fourni → defaultIdx 0');
      VarSet('VAR_RESULT', 0);
      VarSet('VAR_STARTER_MON', 0);
      GiveMonToPlayer(createPokemonInstance(STARTER_SPECIES[0], 5));
      return;
    }
    let idx = await ctx.askMultichoice(STARTER_NAMES_FR);
    if (idx < 0 || idx > 2) idx = 0; // cancel = treecko (déco fait pareil)
    const speciesEnum = STARTER_SPECIES[idx];
    const mon = createPokemonInstance(speciesEnum, 5);
    GiveMonToPlayer(mon);
    VarSet('VAR_RESULT', idx);
    VarSet('VAR_STARTER_MON', idx);
    console.log(`[ChooseStarter] starter=${speciesEnum} (idx=${idx}) → party size=${gSaveBlock1Ptr.playerPartyCount}`);
    // Combat tutorial vs Poochyena lvl 2 (équivalent BATTLE_TYPE_FIRST_BATTLE
    // du décomp `CB2_StartFirstBattle`). Bloquant : on attend la fin avant que
    // le script Birch continue (Birch remercie + warp lab).
    if (ctx.runWildBattle) {
      console.log('[ChooseStarter] → combat tutorial vs Poochyena L2');
      await ctx.runWildBattle('SPECIES_POOCHYENA', 2);
    }
  },
};

// Constantes pokemerald usuelles pour résoudre les `call_if_eq VAR, CONST, LABEL`.
// Cf. include/constants/global.h pour DIR_*.
const CONST_VALUES: Record<string, number> = {
  MALE: 0, FEMALE: 1,
  TRUE: 1, FALSE: 0, NO: 0, YES: 1,
  POKEMON_1: 1, POKEMON_2: 2, POKEMON_3: 3, POKEMON_4: 4, POKEMON_5: 5, POKEMON_6: 6,
  DIR_NONE: 0, DIR_SOUTH: 1, DIR_NORTH: 2, DIR_WEST: 3, DIR_EAST: 4,
};

function resolveValue(token: string, vars: Record<string, number>): number {
  if (/^-?\d+$/.test(token)) return Number(token);
  if (/^0x[0-9a-f]+$/i.test(token)) return parseInt(token, 16);
  if (token in vars) return vars[token];
  if (token in CONST_VALUES) return CONST_VALUES[token];
  // Var globale dans gameState (VAR_*) ou flag (FLAG_* → 1 si set, 0 sinon)
  if (token.startsWith('VAR_')) return VarGet(token);
  if (token.startsWith('FLAG_')) return FlagGet(token) ? 1 : 0;
  return 0;
}

export async function runScript(
  scriptName: string,
  data: ParsedScripts,
  ctx: ScriptContext
): Promise<void> {
  const callStack: Array<{ label: string; pc: number }> = [];
  const vars: Record<string, number> = {};
  // Animation de porte courante (opendoor/closedoor → promise; waitdooranim await)
  let pendingDoorAnim: Promise<void> | null = null;
  // Le décomp passe les LOCALID via VAR_0x8004/0x8005 (`setvar VAR_0x8004,
  // LOCALID_PLAYERS_HOUSE_1F_MOM`). On garde l'alias string pour que
  // applyMovement / waitMovement puissent retrouver le bon NPC.
  const localIdAlias: Record<string, string> = {};
  const resolveLocalId = (token: string): string =>
    (token in localIdAlias) ? localIdAlias[token] : token;
  let label = scriptName;
  let pc = 0;
  const MAX_STEPS = 500;
  let steps = 0;

  while (steps++ < MAX_STEPS) {
    const commands = data.scripts[label];
    if (!commands) return;
    if (pc >= commands.length) {
      const ret = callStack.pop();
      if (!ret) return;
      label = ret.label;
      pc = ret.pc;
      continue;
    }
    const line = commands[pc++];
    const tokens = line.split(/[\s,]+/).filter(Boolean);
    const op = tokens[0];

    if (op === 'end' || op === 'return') {
      const ret = callStack.pop();
      if (!ret) return;
      label = ret.label;
      pc = ret.pc;
      continue;
    }
    if (op === 'lock' || op === 'lockall') { ctx.lockPlayer(); continue; }
    if (op === 'release' || op === 'releaseall') { ctx.releasePlayer(); continue; }
    if (op === 'faceplayer') { ctx.faceNpcToPlayer(); continue; }
    if (op === 'closemessage') continue;
    // opendoor X, Y / closedoor X, Y : lance l'anim porte (non bloquant).
    // Le décomp passe les coords via VAR_0x8004 / VAR_0x8005 (resolveValue gère).
    if (op === 'opendoor' || op === 'closedoor') {
      const x = resolveValue(tokens[1], vars);
      const y = resolveValue(tokens[2], vars);
      if (ctx.playDoorAnim) {
        pendingDoorAnim = ctx.playDoorAnim(op === 'opendoor' ? 'open' : 'close', x, y);
      }
      continue;
    }
    if (op === 'waitdooranim') {
      if (pendingDoorAnim) { await pendingDoorAnim; pendingDoorAnim = null; }
      continue;
    }
    // Sons : route vers le moteur audio si dispo (sinon no-op pour ne pas bloquer)
    if (op === 'playse') {
      const seName = (tokens[1] || '').toLowerCase(); // ex: "SE_BALL_THROW" → "se_ball_throw"
      if (seName && ctx.playSE) ctx.playSE(seName);
      continue;
    }
    if (op === 'playfanfare') {
      // Fanfare = pause BGM + jingle one-shot + restore. NE PAS confondre avec playse.
      const fanName = (tokens[1] || '').toLowerCase();
      if (fanName && ctx.playFanfare) ctx.playFanfare(fanName);
      continue;
    }
    if (op === 'waitse' || op === 'waitfanfare') continue; // non-bloquants
    if (op === 'playbgm') {
      // Format : `playbgm SONG, save_song` (save_song = TRUE/FALSE)
      const bgmName = (tokens[1] || '').toLowerCase().replace(/,$/, '');
      const save = (tokens[2] || '').toUpperCase().replace(/,$/, '') === 'TRUE';
      if (bgmName && ctx.playBGM) ctx.playBGM(bgmName, save);
      continue;
    }
    if (op === 'savebgm') {
      // savebgm SONG : set saved slot (MUS_DUMMY = clear). Pas de play.
      const bgmName = (tokens[1] || '').toLowerCase();
      if (bgmName && ctx.saveBgm) ctx.saveBgm(bgmName);
      continue;
    }
    if (op === 'fadedefaultbgm') {
      if (ctx.fadeDefaultBgm) ctx.fadeDefaultBgm();
      continue;
    }
    if (op === 'fadenewbgm') {
      const bgmName = (tokens[1] || '').toLowerCase();
      if (bgmName && ctx.fadeNewBgm) ctx.fadeNewBgm(bgmName);
      continue;
    }
    if (op === 'playmoncry') {
      // Format : playmoncry SPECIES, MODE — on ignore MODE
      const speciesConst = tokens[1] || '';
      const species = speciesConst.replace(/^SPECIES_/, '').toLowerCase();
      if (species && ctx.playCry) ctx.playCry(species);
      continue;
    }
    if (op === 'waitmoncry') continue; // cry est non-bloquant
    // finditem ITEM_X[, N] : pickup d'une pokeball au sol. On résout l'item via
    // item-balls.json (mapping scriptLabel → {item, quantity}). Pour l'instant on
    // affiche juste un msgbox (gestion sac persistant à venir Phase A.8).
    if (op === 'finditem' || op === 'finditem_underfoot') {
      const item = (tokens[1] || '').replace(/^ITEM_/, '');
      const qty = Number(tokens[2]) || 1;
      if (ctx.findItem) await ctx.findItem(item, qty);
      // Marque cet item ball comme "ramassé" pour qu'il disparaisse au prochain spawn
      if (ctx.markItemBallTaken && label) {
        ctx.markItemBallTaken(label);
      }
      continue;
    }
    // delay N : pause de N frames (clé pour synchroniser dialogues + animations)
    if (op === 'delay') {
      const frames = Number(tokens[1]) || 0;
      if (ctx.delay) await ctx.delay(frames);
      continue;
    }
    if (op === 'waitstate') continue;
    // fadescreen FADE_TO_BLACK / FADE_FROM_BLACK : transition
    if (op === 'fadescreen' || op === 'fadescreenspeed') {
      if (ctx.fadeScreen) await ctx.fadeScreen(tokens[1] || 'FADE_TO_BLACK');
      continue;
    }
    // applymovement LOCALID, MovementLabel : lance la séquence sur le NPC.
    // On NE bloque PAS ici (les decomp scripts lancent souvent plusieurs apply
    // en parallèle puis font un waitmovement pour synchroniser).
    if (op === 'applymovement' || op === 'applymovement_canmove') {
      const movLabel = tokens[2];
      const seq = data.scripts[movLabel];
      if (seq && ctx.applyMovement) void ctx.applyMovement(resolveLocalId(tokens[1]), seq);
      continue;
    }
    if (op === 'waitmovement') {
      // waitmovement 0 = attend TOUS les movements en cours
      if (ctx.waitMovement) await ctx.waitMovement(tokens[1] === '0' ? '0' : resolveLocalId(tokens[1]));
      continue;
    }
    if (op === 'hideplayer') { if (ctx.setPlayerVisible) ctx.setPlayerVisible(false); continue; }
    if (op === 'showplayer') { if (ctx.setPlayerVisible) ctx.setPlayerVisible(true); continue; }
    // addobject LOCALID / removeobject LOCALID : show/hide le NPC
    if (op === 'addobject') {
      if (ctx.setObjectVisible) ctx.setObjectVisible(resolveLocalId(tokens[1]), true);
      continue;
    }
    if (op === 'removeobject') {
      if (ctx.setObjectVisible) ctx.setObjectVisible(resolveLocalId(tokens[1]), false);
      continue;
    }
    if (op === 'setobjectmovementtype') {
      if (ctx.setObjectMovementType) ctx.setObjectMovementType(resolveLocalId(tokens[1]), tokens[2]);
      continue;
    }
    // setobjectxyperm LOCALID_X, X, Y : déplace l'NPC dans le state pour le prochain spawn
    if (op === 'setobjectxyperm' || op === 'setobjectxy') {
      if (ctx.setObjectXY) ctx.setObjectXY(tokens[1], Number(tokens[2]) || 0, Number(tokens[3]) || 0);
      continue;
    }
    // setrespawn HEAL_LOCATION_X : où on revient après un blackout
    if (op === 'setrespawn') { gSaveBlock1Ptr.respawnLocation = tokens[1]; continue; }
    // setdynamicwarp MAP_X, X, Y : spawn point dynamique (1er spawn de partie / cordes...)
    if (op === 'setdynamicwarp') {
      SetDynamicWarp(tokens[1], Number(tokens[2]) || 0, Number(tokens[3]) || 0);
      continue;
    }
    if (op === 'setstepcallback') {
      if (ctx.setStepCallback) ctx.setStepCallback(tokens[1] || 'STEP_CB_NONE');
      continue;
    }
    // setmetatile X, Y, METATILE_LABEL, IMPASSABLE : modifie la tile (souvent
    // utilisé en MAP_SCRIPT_ON_LOAD pour les portes ouvertes/fermées, lumières).
    if (op === 'setmetatile') {
      const x = Number(tokens[1]) || 0;
      const y = Number(tokens[2]) || 0;
      const metaLabel = tokens[3];
      const impassable = (tokens[4] === 'TRUE' || tokens[4] === '1');
      if (ctx.setMetatile) ctx.setMetatile(x, y, metaLabel, impassable);
      continue;
    }
    // Warps : déclenchent un changement de scène via le callback
    if ((op === 'warpsilent' || op === 'warp' || op === 'warpwalk' || op === 'warpspin') && ctx.warp) {
      ctx.warp(tokens[1], Number(tokens[2]) || 0, Number(tokens[3]) || 0);
      return; // arrête le script — la nouvelle map prend le relais
    }
    // ===== Battle opcodes (Vague 3) =====
    // trainerbattle TYPE, TRAINER_X, localid, [ptrs...] — types : SINGLE=0,
    // NO_INTRO_TEXT=1, DOUBLE=2, REMATCH=4, etc. Pour MVP on traite tous comme single.
    if (op === 'trainerbattle') {
      const trainerId = tokens[2];
      if (ctx.runTrainerBattle && trainerId?.startsWith('TRAINER_')) {
        const result = await ctx.runTrainerBattle(trainerId);
        vars['__lastBattleResult'] = result === 'win' ? 1 : 0;
        // 1:1 strict (B1) : FlagSet(TRAINER_FLAGS_START=1280 + trainerNumId).
        if (result === 'win') {
          const numId = resolveDecompConstant(trainerId) ?? 0;
          FlagSet(1280 + numId);
        }
      }
      continue;
    }
    // dotrainerbattle : dans le décomp, lance le combat préalablement setupé par
    // trainerbattle. Notre version trainerbattle fait tout d'un coup → no-op ici.
    if (op === 'dotrainerbattle') continue;
    // gotopostbattlescript / gotobeatenscript : devraient sauter vers les ptrs
    // stockés par trainerbattle (intro text / defeat text). Pour MVP : no-op.
    if (op === 'gotopostbattlescript' || op === 'gotobeatenscript') continue;
    // setwildbattle SPECIES, level, [ITEM] : setup wild
    if (op === 'setwildbattle') {
      vars['__wildSpecies'] = 0; // marqueur "wild armed"
      vars['__wildSpeciesEnum'] = 0;
      // On stocke directement species/level dans des slots dédiés
      (vars as Record<string, unknown>)['__wildSpeciesEnumStr'] = tokens[1] || 'SPECIES_NONE';
      vars['__wildLevel'] = Number(tokens[2]) || 5;
      (vars as Record<string, unknown>)['__wildItemEnumStr'] = tokens[3] || '';
      continue;
    }
    if (op === 'dowildbattle') {
      const species = (vars as Record<string, unknown>)['__wildSpeciesEnumStr'] as string;
      const level = vars['__wildLevel'] || 5;
      const heldItem = (vars as Record<string, unknown>)['__wildItemEnumStr'] as string;
      if (ctx.runWildBattle && species) {
        const result = await ctx.runWildBattle(species, level, heldItem);
        vars['__lastBattleResult'] = result === 'win' || result === 'caught' ? 1 : 0;
      }
      continue;
    }
    // Trainer flag opcodes — 1:1 strict (B1) : FlagSet/Get/Clear(TRAINER_FLAGS_START=1280 + id).
    if (op === 'checktrainerflag') {
      const numId = resolveDecompConstant(tokens[1] ?? '') ?? 0;
      vars['VAR_RESULT'] = FlagGet(1280 + numId) ? 1 : 0;
      VarSet('VAR_RESULT', vars['VAR_RESULT']);
      continue;
    }
    if (op === 'settrainerflag') {
      const numId = resolveDecompConstant(tokens[1] ?? '') ?? 0;
      FlagSet(1280 + numId);
      continue;
    }
    if (op === 'cleartrainerflag') {
      const numId = resolveDecompConstant(tokens[1] ?? '') ?? 0;
      FlagClear(1280 + numId);
      continue;
    }

    if (op === 'checkplayergender') {
      vars['VAR_RESULT'] = gSaveBlock2Ptr.playerGender === MALE ? 0 : 1;
      VarSet('VAR_RESULT', vars['VAR_RESULT']);
      continue;
    }
    // gettime → VAR_0x8000=heures, 0x8001=minutes, 0x8002=secondes (cf. ScrCmd_gettime du décomp)
    if (op === 'gettime') {
      const d = new Date();
      vars['VAR_0x8000'] = d.getHours();
      vars['VAR_0x8001'] = d.getMinutes();
      vars['VAR_0x8002'] = d.getSeconds();
      VarSet('VAR_0x8000', d.getHours());
      VarSet('VAR_0x8001', d.getMinutes());
      VarSet('VAR_0x8002', d.getSeconds());
      continue;
    }
    if (op === 'setvar') {
      const v = resolveValue(tokens[2], vars);
      vars[tokens[1]] = v;
      if (tokens[1].startsWith('VAR_')) VarSet(tokens[1], v);
      // Si on stocke un LOCALID dans une scratch var, garde l'alias string
      if (tokens[2]?.startsWith('LOCALID_')) localIdAlias[tokens[1]] = tokens[2];
      continue;
    }
    if (op === 'addvar') {
      const cur = tokens[1].startsWith('VAR_') ? VarGet(tokens[1]) : (vars[tokens[1]] ?? 0);
      const v = cur + resolveValue(tokens[2], vars);
      vars[tokens[1]] = v;
      if (tokens[1].startsWith('VAR_')) VarSet(tokens[1], v);
      continue;
    }
    if (op === 'subvar') {
      const cur = tokens[1].startsWith('VAR_') ? VarGet(tokens[1]) : (vars[tokens[1]] ?? 0);
      const v = cur - resolveValue(tokens[2], vars);
      vars[tokens[1]] = v;
      if (tokens[1].startsWith('VAR_')) VarSet(tokens[1], v);
      continue;
    }
    if (op === 'setflag') { if (tokens[1]?.startsWith('FLAG_')) FlagSet(tokens[1]); continue; }
    if (op === 'clearflag') { if (tokens[1]?.startsWith('FLAG_')) FlagClear(tokens[1]); continue; }
    if (op === 'playse' || op === 'waitse' || op === 'playfanfare' || op === 'waitfanfare') continue;
    if (op === 'delay' || op === 'playbgm' || op === 'savebgm' || op === 'fadedefaultbgm' || op === 'fadenewbgm') continue;
    if (op === 'applymovement' || op === 'waitmovement' || op === 'applymovement_canmove') continue;
    // special <FuncName> : execute le handler TS si présent (cf. SPECIALS table)
    if (op === 'special') {
      const fn = SPECIALS[tokens[1]];
      if (fn) await fn(ctx);
      continue;
    }
    if (op === 'specialvar' || op === 'random') continue;
    if (op === 'incrementgamestat') continue;
    // copyvar DST, SRC : copie de var
    if (op === 'copyvar') {
      const v = resolveValue(tokens[2], vars);
      vars[tokens[1]] = v;
      if (tokens[1].startsWith('VAR_')) VarSet(tokens[1], v);
      continue;
    }

    // ===== Buffer opcodes (Vague 2) — alimentent STR_VAR_1..4 pour les msgbox =====
    if (op === 'bufferspeciesname') {
      setStringVar(Number(tokens[1]) || 1, getSpeciesNameFr(tokens[2] || ''));
      continue;
    }
    if (op === 'buffermovename') {
      setStringVar(Number(tokens[1]) || 1, getMoveNameFr(tokens[2] || ''));
      continue;
    }
    if (op === 'bufferitemname') {
      setStringVar(Number(tokens[1]) || 1, getItemNameFr(tokens[2] || ''));
      continue;
    }
    if (op === 'bufferitemnameplural') {
      const name = getItemNameFr(tokens[2] || '');
      const qty = resolveValue(tokens[3] || '0', vars);
      setStringVar(Number(tokens[1]) || 1, qty > 1 ? name + 's' : name);
      continue;
    }
    if (op === 'buffertrainerclassname') {
      const t = getTrainer(tokens[2] || '');
      setStringVar(Number(tokens[1]) || 1, t ? getTrainerClassNameFr(t.trainerClass) : '');
      continue;
    }
    if (op === 'buffertrainername') {
      setStringVar(Number(tokens[1]) || 1, getTrainerNameFr(tokens[2] || ''));
      continue;
    }
    if (op === 'buffernumberstring') {
      setStringVar(Number(tokens[1]) || 1, String(resolveValue(tokens[2] || '0', vars)));
      continue;
    }
    if (op === 'bufferstring' || op === 'vbufferstring' || op === 'vbuffermessage') {
      // Texte direct entre guillemets — extraire (peut contenir des espaces)
      const txt = tokens.slice(2).join(' ').replace(/^"/, '').replace(/"$/, '');
      setStringVar(Number(tokens[1]) || 1, txt);
      continue;
    }
    if (op === 'bufferpartymonnick') {
      // bufferpartymonnick STR_VAR_N, SLOT (0-5) → nickname du Pokémon à ce slot
      const slot = Math.max(0, Math.min(5, Number(tokens[2]) || 0));
      const mon = gSaveBlock1Ptr.playerParty[slot];
      setStringVar(Number(tokens[1]) || 1, mon?.nickname || mon?.speciesNameFr || (gSaveBlock2Ptr.playerName ?? 'UNDI'));
      continue;
    }
    if (op === 'bufferleadmonspeciesname') {
      // bufferleadmonspeciesname STR_VAR_N → species name du lead (party[0])
      const lead = gSaveBlock1Ptr.playerParty[0];
      setStringVar(Number(tokens[1]) || 1, lead?.speciesNameFr || (gSaveBlock2Ptr.playerName ?? 'UNDI'));
      continue;
    }
    if (op === 'bufferstdstring' || op === 'bufferdecorationname'
        || op === 'bufferboxname' || op === 'buffercontestname') {
      // Pas de table extraite pour ces specifiques. Retourne vide pour ne pas
      // afficher le placeholder brut (`{STR_VAR_N}`) dans les dialogues.
      setStringVar(Number(tokens[1]) || 1, '');
      continue;
    }

    // ===== Menu interactif (Vague choix) =====
    // yesnobox X, Y : positionne pas géré côté décomp pour MVP. Result → VAR_RESULT (1=OUI, 0=NON).
    if (op === 'yesnobox') {
      if (ctx.askYesNo) {
        const yes = await ctx.askYesNo();
        vars['VAR_RESULT'] = yes ? 1 : 0;
        VarSet('VAR_RESULT', yes ? 1 : 0);
      }
      continue;
    }
    // multichoice X, Y, MULTI_X, ignoreBPress : MULTI_X référence une table décomp
    // (gMultichoiceList) qu'on n'a pas extraite. Pour MVP, retourne 0 (1er choix par défaut).
    if (op === 'multichoice' || op === 'multichoicedefault' || op === 'multichoicegrid') {
      // TODO Vague suivante : extract data/list_menu_items.h pour résoudre MULTI_X → labels
      vars['VAR_RESULT'] = 0;
      VarSet('VAR_RESULT', 0);
      continue;
    }

    if (op === 'msgbox') {
      const textLabel = tokens[1];
      const style = tokens[2] || 'MSGBOX_DEFAULT';
      // MSGBOX_NPC, _DEFAULT, _AUTOCLOSE, _YESNO impliquent lock + faceplayer
      // avant le message (cf. macros pokemerald). Seul MSGBOX_SIGN skippe.
      if (style === 'MSGBOX_NPC' || style === 'MSGBOX_DEFAULT'
          || style === 'MSGBOX_AUTOCLOSE' || style === 'MSGBOX_YESNO') {
        ctx.lockPlayer();
        ctx.faceNpcToPlayer();
      }
      const text = data.texts[textLabel] ?? `[texte manquant: ${textLabel}]`;
      await ctx.showText(text);
      // MSGBOX_YESNO : ouvre un menu OUI/NON après le texte, result → VAR_RESULT.
      // C'est LE pattern utilisé pour "Voulez-vous nicknamer votre Pokémon ?",
      // "Voulez-vous voir le rival ?", etc. Plus courant que yesnobox isolé.
      if (style === 'MSGBOX_YESNO' && ctx.askYesNo) {
        const yes = await ctx.askYesNo();
        vars['VAR_RESULT'] = yes ? 1 : 0;
        VarSet('VAR_RESULT', yes ? 1 : 0);
      }
      continue;
    }
    if (op === 'message') {
      const textLabel = tokens[1];
      const text = data.texts[textLabel] ?? `[texte manquant: ${textLabel}]`;
      await ctx.showText(text);
      continue;
    }
    if (op === 'goto') {
      label = tokens[1]; pc = 0; continue;
    }
    if (op === 'call') {
      callStack.push({ label, pc });
      label = tokens[1]; pc = 0; continue;
    }
    // goto_if_set / call_if_set FLAG, LABEL : check le vrai état du flag.
    // CRITIQUE : avant on était no-op (skip) car au début gameState n'avait
    // pas de flags persistents. Maintenant qu'il en a, faut vraiment check
    // sinon les scripts à branches type "horloge déjà réglée → skip" boucle.
    if (op === 'goto_if_set' || op === 'call_if_set') {
      if (tokens[1]?.startsWith('FLAG_') && FlagGet(tokens[1])) {
        if (op === 'call_if_set') callStack.push({ label, pc });
        label = tokens[2]; pc = 0;
      }
      continue;
    }
    // goto_if_unset / call_if_unset FLAG, LABEL : check le vrai état du flag.
    if (op === 'goto_if_unset' || op === 'call_if_unset') {
      const isUnset = !tokens[1]?.startsWith('FLAG_') || !FlagGet(tokens[1]);
      if (isUnset) {
        if (op === 'call_if_unset') callStack.push({ label, pc });
        label = tokens[2]; pc = 0;
      }
      continue;
    }
    // goto_if_eq VAR, VALUE, LABEL : var == value → jump
    if (op === 'goto_if_eq' || op === 'call_if_eq') {
      const varVal = resolveValue(tokens[1], vars);
      const expected = resolveValue(tokens[2], vars);
      if (varVal === expected) {
        if (op === 'call_if_eq') callStack.push({ label, pc });
        label = tokens[3]; pc = 0;
      }
      continue;
    }
    if (op === 'goto_if_ne' || op === 'call_if_ne') {
      const varVal = resolveValue(tokens[1], vars);
      const expected = resolveValue(tokens[2], vars);
      if (varVal !== expected) {
        if (op === 'call_if_ne') callStack.push({ label, pc });
        label = tokens[3]; pc = 0;
      }
      continue;
    }
    // compare VAR, VALUE → stocke le résultat dans un pseudo-flag pour les if suivants
    if (op === 'compare') {
      vars['__lastCompareA'] = resolveValue(tokens[1], vars);
      vars['__lastCompareB'] = resolveValue(tokens[2], vars);
      continue;
    }
    // goto_if_lt VAR, VAL, LABEL ; goto_if_gt VAR, VAL, LABEL ; idem call_if_*
    if (op === 'goto_if_lt' || op === 'call_if_lt' || op === 'goto_if_gt' || op === 'call_if_gt'
        || op === 'goto_if_le' || op === 'call_if_le' || op === 'goto_if_ge' || op === 'call_if_ge') {
      const a = resolveValue(tokens[1], vars);
      const b = resolveValue(tokens[2], vars);
      const cmp = op.includes('_lt') ? a < b
                : op.includes('_gt') ? a > b
                : op.includes('_le') ? a <= b
                : a >= b;
      if (cmp) {
        if (op.startsWith('call')) callStack.push({ label, pc });
        label = tokens[3]; pc = 0;
      }
      continue;
    }
    // givemon SPECIES, LEVEL[, ITEM[, BALL[, NATURE[, ABILITY_NUM[, ...]]]]]
    // Cf. asm/macros/event.inc + scripts décomp (rivaux, scripted gifts).
    // Décomp `ScriptGiveMon` : tente d'add à la party, sinon envoie au PC.
    // VAR_RESULT : MON_GIVEN_TO_PARTY=0, MON_GIVEN_TO_PC=1, MON_CANT_GIVE=2.
    if (op === 'givemon') {
      const species = (tokens[1] || '').replace(/,$/, '');
      const level = Math.max(1, Math.min(100, Number((tokens[2] || '5').replace(/,$/, ''))));
      const itemTok = (tokens[3] || '').replace(/,$/, '');
      const heldItem = itemTok && itemTok !== 'ITEM_NONE' && itemTok !== '0'
        ? itemTok.replace(/^ITEM_/, '').toLowerCase().replace(/_/g, '')
        : '';
      const mon = createPokemonInstance(species, level, heldItem ? { heldItem } : undefined);
      // 1:1 décomp ScriptGiveMon : VarSet(VAR_RESULT, GiveMonToPlayer(...)) directe.
      // GiveMonToPlayer retourne MON_GIVEN_TO_PARTY=0 | MON_GIVEN_TO_PC=1 | MON_CANT_GIVE=2.
      // Notre GiveMonToPlayer port retourne actuellement MON_GIVEN_TO_PARTY ou MON_CANT_GIVE
      // (= dette R3 : CopyMonToPC pas porté, party-full → CANT_GIVE au lieu de PC).
      const result = GiveMonToPlayer(mon);
      vars['VAR_RESULT'] = result;
      VarSet('VAR_RESULT', result);
      console.log(`[givemon] ${species} L${level} → party (size=${gSaveBlock1Ptr.playerPartyCount}, result=${result})`);
      continue;
    }
    // Opcode inconnu : log une fois pour traçabilité (warn limité)
    if (!warnedOps.has(op)) {
      warnedOps.add(op);
      const known = scriptOpcodesCatalog?.macros?.[op];
      const tag = known
        ? `KNOWN_BUT_UNHANDLED (decomp: ${known.opcode || 'composed'}, args: [${known.args.join(', ')}])`
        : 'UNKNOWN (typo ou nouvel opcode du décomp)';
      console.warn(`[script-runner] opcode "${op}" → ${tag} (line: "${line}", script: ${label})`);
      unhandledOpsCount.set(op, (unhandledOpsCount.get(op) || 0) + 1);
    } else {
      unhandledOpsCount.set(op, (unhandledOpsCount.get(op) || 0) + 1);
    }
  }
}

const warnedOps = new Set<string>();
const unhandledOpsCount = new Map<string, number>();

/** Catalog issu de `script-opcodes.json` (270 macros + 227 opcodes décomp).
 *  Permet de distinguer "opcode connu mais pas implémenté" vs "typo". */
let scriptOpcodesCatalog: {
  macros: Record<string, { args: string[]; opcode: string | null }>;
  opcodes: Record<string, { value: number; handler: string }>;
} | null = null;

/** À appeler au boot : `loadScriptOpcodesCatalog(scene.cache.json.get('script-opcodes'))` */
export function loadScriptOpcodesCatalog(json: typeof scriptOpcodesCatalog) {
  scriptOpcodesCatalog = json;
}

/** Stats coverage : combien d'opcodes du décomp on supporte. */
export function getScriptCoverageStats() {
  const total = scriptOpcodesCatalog ? Object.keys(scriptOpcodesCatalog.macros).length : 0;
  const unhandled = unhandledOpsCount.size;
  const top = [...unhandledOpsCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([op, count]) => `${op}:${count}`);
  return {
    total_decomp: total,
    unhandled_seen: unhandled,
    coverage_pct: total > 0 ? Math.round((1 - unhandled / total) * 100) : 0,
    top_unhandled_by_usage: top,
  };
}

/** Reset compteurs (utile entre tests / changements de map). */
export function resetScriptCoverage() {
  warnedOps.clear();
  unhandledOpsCount.clear();
}
