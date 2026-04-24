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
};

export async function runScript(
  scriptName: string,
  data: ParsedScripts,
  ctx: ScriptContext
): Promise<void> {
  const callStack: Array<{ label: string; pc: number }> = [];
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
    if (op === 'lock') { ctx.lockPlayer(); continue; }
    if (op === 'release') { ctx.releasePlayer(); continue; }
    if (op === 'faceplayer') { ctx.faceNpcToPlayer(); continue; }
    if (op === 'closemessage' || op === 'releaseall' || op === 'lockall') continue;
    if (op === 'setflag' || op === 'clearflag' || op === 'setvar' || op === 'addvar' || op === 'subvar') continue;
    if (op === 'playse' || op === 'waitse' || op === 'playfanfare' || op === 'waitfanfare') continue;
    if (op === 'delay' || op === 'playbgm' || op === 'fadedefaultbgm' || op === 'fadenewbgm') continue;
    if (op === 'applymovement' || op === 'waitmovement' || op === 'applymovement_canmove') continue;
    if (op === 'special' || op === 'specialvar' || op === 'compare' || op === 'random') continue;

    if (op === 'msgbox') {
      const textLabel = tokens[1];
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
    // goto_if_eq VAR, VALUE, LABEL : var == value → jump. En début de jeu la plupart des vars = 0.
    if (op === 'goto_if_eq' || op === 'call_if_eq') {
      const expected = Number(tokens[2]);
      if (expected === 0) {
        if (op === 'call_if_eq') callStack.push({ label, pc });
        label = tokens[3]; pc = 0;
      }
      continue;
    }
    // goto_if_ne VAR, VALUE, LABEL : var != value → jump. Var == 0, donc jump si value != 0.
    if (op === 'goto_if_ne' || op === 'call_if_ne') {
      const expected = Number(tokens[2]);
      if (expected !== 0) {
        if (op === 'call_if_ne') callStack.push({ label, pc });
        label = tokens[3]; pc = 0;
      }
      continue;
    }
    // Autres : on ignore silencieusement (NOP)
  }
}
