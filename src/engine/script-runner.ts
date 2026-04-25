/**
 * Runner de scripts de map pokeemerald — version minimaliste.
 *
 * On supporte le sous-ensemble nécessaire pour jouer les dialogues NPC de
 * début de jeu. Pour l'état joueur/flags/vars, on part du principe que TOUT
 * est à l'état initial (flags non set, vars = 0). Les branches conditionnelles
 * sont donc résolues en conséquence : `goto_if_set` ne saute jamais,
 * `goto_if_ne VAR, 0, label` ne saute jamais (var == 0), etc.
 *
 * Commandes implémentées :
 *   lock / release / end / return / nop / closemessage : no-op visuel
 *   faceplayer        : tourne le NPC vers le joueur
 *   msgbox <tx>, ... : affiche le texte <tx>, attend input
 *   goto <label>      : saut inconditionnel
 *   goto_if_set ...   : ignoré (on considère que le flag n'est pas set)
 *   goto_if_ne ...    : saute ssi la valeur != 0 — on considère var == 0, donc ignore
 *   goto_if_eq ...    : saute ssi la valeur == 0 par défaut
 *   call <label>      : push et saut
 *   <autres>          : ignorés silencieusement
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
};

import { gameState } from './game-state';

// Constantes pokemerald usuelles pour résoudre les `call_if_eq VAR, CONST, LABEL`.
const CONST_VALUES: Record<string, number> = {
  MALE: 0, FEMALE: 1,
  TRUE: 1, FALSE: 0, NO: 0, YES: 1,
  POKEMON_1: 1, POKEMON_2: 2, POKEMON_3: 3, POKEMON_4: 4, POKEMON_5: 5, POKEMON_6: 6
};

function resolveValue(token: string, vars: Record<string, number>): number {
  if (/^-?\d+$/.test(token)) return Number(token);
  if (/^0x[0-9a-f]+$/i.test(token)) return parseInt(token, 16);
  if (token in vars) return vars[token];
  if (token in CONST_VALUES) return CONST_VALUES[token];
  // Var globale dans gameState (VAR_*) ou flag (FLAG_* → 1 si set, 0 sinon)
  if (token.startsWith('VAR_')) return gameState.getVar(token);
  if (token.startsWith('FLAG_')) return gameState.hasFlag(token) ? 1 : 0;
  return 0;
}

export async function runScript(
  scriptName: string,
  data: ParsedScripts,
  ctx: ScriptContext
): Promise<void> {
  const callStack: Array<{ label: string; pc: number }> = [];
  const vars: Record<string, number> = {};
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
    // Ops d'animation/sound : no-op pour l'instant (warp final reste exécuté)
    if (op === 'opendoor' || op === 'closedoor' || op === 'waitdooranim') continue;
    // Sons : no-op (pas d'audio engine encore — pour ne pas bloquer le scénario)
    if (op === 'playse' || op === 'waitse' || op === 'playfanfare' || op === 'waitfanfare') continue;
    if (op === 'playbgm' || op === 'fadedefaultbgm' || op === 'fadenewbgm') continue;
    if (op === 'playmoncry' || op === 'waitmoncry') continue;
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
    if (op === 'setrespawn') { gameState.setRespawn(tokens[1]); continue; }
    // setdynamicwarp MAP_X, X, Y : spawn point dynamique (1er spawn de partie / cordes...)
    if (op === 'setdynamicwarp') {
      gameState.setDynamicWarp(tokens[1], Number(tokens[2]) || 0, Number(tokens[3]) || 0);
      continue;
    }
    if (op === 'setstepcallback') continue;
    // Warps : déclenchent un changement de scène via le callback
    if ((op === 'warpsilent' || op === 'warp' || op === 'warpwalk' || op === 'warpspin') && ctx.warp) {
      ctx.warp(tokens[1], Number(tokens[2]) || 0, Number(tokens[3]) || 0);
      return; // arrête le script — la nouvelle map prend le relais
    }
    if (op === 'checkplayergender') {
      vars['VAR_RESULT'] = gameState.gender === 'MALE' ? 0 : 1;
      gameState.setVar('VAR_RESULT', vars['VAR_RESULT']);
      continue;
    }
    // gettime → VAR_0x8000=heures, 0x8001=minutes, 0x8002=secondes (cf. ScrCmd_gettime du décomp)
    if (op === 'gettime') {
      const d = new Date();
      vars['VAR_0x8000'] = d.getHours();
      vars['VAR_0x8001'] = d.getMinutes();
      vars['VAR_0x8002'] = d.getSeconds();
      gameState.setVar('VAR_0x8000', d.getHours());
      gameState.setVar('VAR_0x8001', d.getMinutes());
      gameState.setVar('VAR_0x8002', d.getSeconds());
      continue;
    }
    if (op === 'setvar') {
      const v = resolveValue(tokens[2], vars);
      vars[tokens[1]] = v;
      if (tokens[1].startsWith('VAR_')) gameState.setVar(tokens[1], v);
      // Si on stocke un LOCALID dans une scratch var, garde l'alias string
      if (tokens[2]?.startsWith('LOCALID_')) localIdAlias[tokens[1]] = tokens[2];
      continue;
    }
    if (op === 'addvar') {
      const cur = tokens[1].startsWith('VAR_') ? gameState.getVar(tokens[1]) : (vars[tokens[1]] ?? 0);
      const v = cur + resolveValue(tokens[2], vars);
      vars[tokens[1]] = v;
      if (tokens[1].startsWith('VAR_')) gameState.setVar(tokens[1], v);
      continue;
    }
    if (op === 'subvar') {
      const cur = tokens[1].startsWith('VAR_') ? gameState.getVar(tokens[1]) : (vars[tokens[1]] ?? 0);
      const v = cur - resolveValue(tokens[2], vars);
      vars[tokens[1]] = v;
      if (tokens[1].startsWith('VAR_')) gameState.setVar(tokens[1], v);
      continue;
    }
    if (op === 'setflag') { if (tokens[1]?.startsWith('FLAG_')) gameState.setFlag(tokens[1]); continue; }
    if (op === 'clearflag') { if (tokens[1]?.startsWith('FLAG_')) gameState.clearFlag(tokens[1]); continue; }
    if (op === 'playse' || op === 'waitse' || op === 'playfanfare' || op === 'waitfanfare') continue;
    if (op === 'delay' || op === 'playbgm' || op === 'fadedefaultbgm' || op === 'fadenewbgm') continue;
    if (op === 'applymovement' || op === 'waitmovement' || op === 'applymovement_canmove') continue;
    if (op === 'special' || op === 'specialvar' || op === 'compare' || op === 'random') continue;
    if (op === 'incrementgamestat') continue;
    // copyvar DST, SRC : copie de var
    if (op === 'copyvar') {
      const v = resolveValue(tokens[2], vars);
      vars[tokens[1]] = v;
      if (tokens[1].startsWith('VAR_')) gameState.setVar(tokens[1], v);
      continue;
    }

    if (op === 'msgbox') {
      const textLabel = tokens[1];
      const style = tokens[2] || 'MSGBOX_DEFAULT';
      // MSGBOX_NPC et MSGBOX_DEFAULT impliquent lock + faceplayer avant le
      // message (macros pokemerald). Seul MSGBOX_SIGN skippe faceplayer.
      if (style === 'MSGBOX_NPC' || style === 'MSGBOX_DEFAULT' || style === 'MSGBOX_AUTOCLOSE') {
        ctx.lockPlayer();
        ctx.faceNpcToPlayer();
      }
      const text = data.texts[textLabel] ?? `[texte manquant: ${textLabel}]`;
      await ctx.showText(text);
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
    // goto_if_set FLAG, LABEL : on considère que le flag n'est pas set → don't jump
    if (op === 'goto_if_set' || op === 'call_if_set') continue;
    // goto_if_unset FLAG, LABEL : flag not set → always jump (on call, push return)
    if (op === 'goto_if_unset') { label = tokens[2]; pc = 0; continue; }
    if (op === 'call_if_unset') { callStack.push({ label, pc }); label = tokens[2]; pc = 0; continue; }
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
    // Opcode inconnu : log une fois pour traçabilité (warn limité)
    if (!warnedOps.has(op)) {
      warnedOps.add(op);
      console.warn(`[script-runner] opcode non géré: ${op} (line: "${line}", script: ${label})`);
    }
  }
}

const warnedOps = new Set<string>();
