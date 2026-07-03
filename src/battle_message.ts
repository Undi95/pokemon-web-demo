/**
 * battle/battle-message.ts — Décodeur de texte battle BYTE-LEVEL pur 1:1.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_message.c`
 *   - BufferStringBattle (1968-2320)
 *   - BattleStringExpandPlaceholdersToDisplayedString (2322)
 *   - BattleStringExpandPlaceholders (2383-2842)   ← LE décodeur (switch ~70 B_TXT_*)
 *   - ExpandBattleTextBuffPlaceholders (2847-2953) ← expand les gBattleTextBuff (B_BUFF_*)
 *
 * Pourquoi (décision user 2026-06-03 « byte-level complet, pur 1:1 ») :
 *   Le décodeur précédent (battle-string-decoder.ts) est PARTIEL (~15/70
 *   placeholders, fallback "?", chemins "raw ASCII") et produit une JS-string
 *   re-encodée ensuite → round-trip = fiddling caractères/espaces sans fin.
 *   Ici : UNE seule représentation = bytes charmap, de BufferStringBattle
 *   jusqu'au renderer (qui décode déjà le charmap via text.c). Pas de round-trip.
 *
 * Couche séparée : ce module ne pose AUCUN flag / ne lance AUCUN event. Les
 * events/flags (Birch, rival) = moteur de script `scrcmd` (msgbox+setflag), à part.
 * Les seuls effets de bord du texte = codes audio (PLAY_SE/PLAY_BGM/WAIT_SE),
 * préservés tels quels (passés en bytes au renderer).
 *
 * STAGE 1 (ce commit) = fondation : buffers byte + helpers byte-level
 * (StringCopy/Append/Length/ConvertIntToDecimalStringN/StringGet_Nickname sur
 * Uint8Array) + encodage charmap (encodeChars / encodeTemplate). Les deux
 * expanders + BufferStringBattle montent dessus (stage suivant).
 *
 * NB voie V : battle-string-decoder.ts (partiel) reste utilisé par la voie V
 * jusqu'à son retrait. Ce module sert la voie L.
 */

import { encodeStringForFont } from './text';
import { EOS, EXT_CTRL_CODE_BEGIN, CHAR_NEWLINE, EXT_CTRL_CODE_PAUSE_UNTIL_PRESS, CHAR_PROMPT_SCROLL, CHAR_PROMPT_CLEAR } from '../include/constants/characters';
import { GetPlayerNameString } from '../include/text';
import {
  B_TXT_BUFF1, B_TXT_BUFF2, B_TXT_BUFF3, B_TXT_COPY_VAR_1, B_TXT_COPY_VAR_2, B_TXT_COPY_VAR_3,
  B_TXT_PLAYER_MON1_NAME, B_TXT_OPPONENT_MON1_NAME, B_TXT_PLAYER_MON2_NAME, B_TXT_OPPONENT_MON2_NAME,
  B_TXT_ATK_NAME_WITH_PREFIX_MON1, B_TXT_ATK_PARTNER_NAME,
  B_TXT_ATK_NAME_WITH_PREFIX, B_TXT_DEF_NAME_WITH_PREFIX, B_TXT_EFF_NAME_WITH_PREFIX,
  B_TXT_ACTIVE_NAME_WITH_PREFIX, B_TXT_SCR_ACTIVE_NAME_WITH_PREFIX,
  B_TXT_CURRENT_MOVE, B_TXT_LAST_MOVE, B_TXT_LAST_ITEM, B_TXT_LAST_ABILITY,
  B_TXT_ATK_ABILITY, B_TXT_DEF_ABILITY, B_TXT_SCR_ACTIVE_ABILITY, B_TXT_EFF_ABILITY,
  B_TXT_TRAINER1_CLASS, B_TXT_TRAINER1_NAME, B_TXT_PLAYER_NAME,
  B_TXT_TRAINER1_LOSE_TEXT, B_TXT_TRAINER1_WIN_TEXT, B_TXT_26, B_TXT_PC_CREATOR_NAME,
  B_TXT_ATK_PREFIX1, B_TXT_DEF_PREFIX1, B_TXT_ATK_PREFIX2, B_TXT_DEF_PREFIX2, B_TXT_ATK_PREFIX3, B_TXT_DEF_PREFIX3,
  B_TXT_TRAINER2_CLASS, B_TXT_TRAINER2_NAME, B_TXT_TRAINER2_LOSE_TEXT, B_TXT_TRAINER2_WIN_TEXT,
  B_BUFF_STRING, B_BUFF_NUMBER, B_BUFF_MOVE, B_BUFF_TYPE, B_BUFF_MON_NICK_WITH_PREFIX,
  B_BUFF_STAT, B_BUFF_SPECIES, B_BUFF_MON_NICK, B_BUFF_NEGATIVE_FLAVOR, B_BUFF_ABILITY, B_BUFF_ITEM,
  B_BUFF_PLACEHOLDER_BEGIN, B_BUFF_EOS,
  gBattleTextBuff1, gBattleTextBuff2, gBattleTextBuff3,
} from '../include/battle_message';

import { STRINGID_STATSHARPLY, STRINGID_STATHARSHLY } from '../include/constants/battle_string_ids';
import { getString } from './engine/ui/gba-strings';
import { gActiveBattler, gEffectBattler, gBattleTypeFlags, gTrainerBattleOpponent_A } from './engine/battle/state';
// Fin de combat dresseur : lose_text expand (1:1 GetTrainerALoseText). Usage RUNTIME (en fonction)
// -> live-binding ESM safe meme si cycle transitif. Fallback marqueur si non pose (voie V).
import { GetTrainerALoseText, getTrainerADefeatSpeech } from './engine/battle/battle-setup-helpers';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import type { BattleMsgData } from './engine/battle/battle-event-queue';
import { getMoveName as _getMoveNameFr } from './engine/data/game-data';
import { getSpeciesNameFr as _getSpeciesNameFr, getItemNameFr as _getItemNameFr } from '../harness/runtime/data-tables';
import { resolveDecompConstant } from '../harness/runtime/decomp-constants';
import { gBattleMons, gBattleScripting, gBattleStruct } from './engine/battle/state';
import { BATTLE_TYPE_DOUBLE, BATTLE_TYPE_LINK, BATTLE_TYPE_TRAINER, BATTLE_TYPE_MULTI, BATTLE_TYPE_LEGENDARY, BATTLE_TYPE_WALLY_TUTORIAL, BATTLE_TYPE_TWO_OPPONENTS, BATTLE_TYPE_INGAME_PARTNER, BATTLE_TYPE_TOWER_LINK_MULTI, BATTLE_TYPE_RECORDED, BATTLE_TYPE_RECORDED_LINK } from './engine/battle/constants';


// ─── Constantes 1:1 décomp (characters.h) ──────────────────────────────────

/** 1:1 décomp `PLACEHOLDER_BEGIN` (characters.h) = 0xFD. Préfixe d'un code
 *  placeholder B_TXT_* dans les strings battle (≠ EXT_CTRL_CODE_BEGIN=0xFC). */
export const PLACEHOLDER_BEGIN = 0xFD;

// ─── Buffers byte-level (1:1 décomp EWRAM u8 buffers) ───────────────────────

/** 1:1 décomp `u8 gDisplayedStringBattle[300]` (battle_main.c). Sortie finale
 *  du décodeur (bytes charmap), nourrie au renderer SANS re-encodage. */
export const gDisplayedStringBattle = new Uint8Array(300);

/** 1:1 décomp `gStringVar1/2/3` côté battle (string_util). Buffers de travail
 *  pour ExpandBattleTextBuffPlaceholders. (Le gStringVar OW reste JS-string,
 *  séparé — ici on a besoin de buffers byte dédiés au combat.) */
export const gStringVarBattle1 = new Uint8Array(256);
export const gStringVarBattle2 = new Uint8Array(256);
export const gStringVarBattle3 = new Uint8Array(256);

// ─── Charmap (char JS → byte GBA), chargé depuis le décomp ──────────────────

let _charmap: Record<string, number> | null = null;
let _charmapPromise: Promise<void> | null = null;

/** Charge `/decomp/em/ui/charmap.json` (= charmap.txt extrait : char→byte,
 *  espace=0, 'A'=187, 'é'=27, apostrophe=180, '0'=161…). Idempotent. */
export function loadBattleCharmap(): Promise<void> {
  if (_charmap) return Promise.resolve();
  if (!_charmapPromise) {
    _charmapPromise = fetch('/decomp/em/ui/charmap.json')
      .then((r) => r.json())
      .then((j) => { _charmap = j as Record<string, number>; });
  }
  return _charmapPromise;
}

/** Charmap synchrone (null si pas encore chargé). Pour les call-sites battle
 *  qui tournent après le boot (charmap déjà chargé par le renderer). */
export function getBattleCharmap(): Record<string, number> | null {
  return _charmap;
}

/** Encode un caractère JS → byte charmap. Inconnu → 0 (espace) + warn (=
 *  signal d'un char manquant dans charmap.json, à corriger à la SOURCE, pas
 *  par un hack de substitution — c'est tout l'intérêt du byte-level). */
function _encodeChar(ch: string): number {
  const cm = _charmap;
  if (!cm) return 0;
  const b = cm[ch];
  if (b === undefined) {
    console.warn('[battle-message] char absent du charmap.json: ' + JSON.stringify(ch) + ' (charcode ' + ch.charCodeAt(0) + ')');
    return cm[' '] ?? 0;
  }
  return b;
}

/** Encode une JS-string en bytes charmap (PAS de tokens — pour les VALEURS de
 *  placeholder : noms de moves/mons/abilities/items issus de nos tables FR).
 *  Pas d'EOS final (les helpers byte ajoutent l'EOS). */
export function encodeChars(js: string): Uint8Array {
  const out = new Uint8Array(js.length);
  for (let i = 0; i < js.length; i++) out[i] = _encodeChar(js[i]);
  return out;
}

/** Encode un TEMPLATE FR (JS-string avec tokens `{B_NAME}` + `\n`/`\p`) en bytes
 *  charmap + codes placeholder, 1:1 comme le template byte du décomp :
 *    - `{B_<NAME>}` → [PLACEHOLDER_BEGIN(0xFD), B_TXT_<NAME> code]
 *    - `\n`        → CHAR_NEWLINE (0xFE)
 *    - `\p`        → [0xFC, EXT_CTRL_CODE_PAUSE_UNTIL_PRESS] (paragraph/prompt)
 *    - autres chars → charmap byte
 *  Termine par EOS (0xFF).
 *  Le mapping {B_NAME}→code vient de B_TXT_NAME_TO_CODE (résolu au call-site
 *  pour éviter un cycle d'import avec text-buffers au top-level). */
export function encodeTemplate(
  js: string,
  tokenToCode: Record<string, number>,
): Uint8Array {
  const cm = _charmap;
  if (!cm) return Uint8Array.from([EOS]);
  const out: number[] = [];
  let segStart = 0;
  // Encode un segment littéral [segStart, end) via l'encodeur CANONIQUE
  // `encodeStringForFont` (= même que la voie OW) : gère \n/\p/\l, les codes de
  // contrôle ({COLOR}/{PAUSE}/{PLAY_SE}/{WAIT_SE}…) et les EXTRA_SYMBOL ({LV_2}=N.,
  // {NO}=№…), et SKIP les tokens inconnus. INDISPENSABLE : avant, encodeTemplate
  // encodait ces tokens en littéral → garbage « PLAY SE SE FLEE … » dans les
  // messages de fuite/capture/level-up (bug vu à l'audit byte-vs-oracle).
  const flushSeg = (end: number): void => {
    if (end <= segStart) return;
    const segBytes = encodeStringForFont(js.slice(segStart, end), cm);
    for (let k = 0; k < segBytes.length; k++) {
      if (segBytes[k] === EOS) break; // encodeStringForFont append un EOS → on le strip
      out.push(segBytes[k]);
    }
  };
  let i = 0;
  while (i < js.length) {
    if (js[i] === '{') {
      const close = js.indexOf('}', i + 1);
      if (close > i) {
        const token = js.slice(i + 1, close); // ex "B_ATK_NAME_WITH_PREFIX"
        if (token.startsWith('B_')) {
          const code = tokenToCode[token.slice(2)];
          if (code !== undefined) {
            flushSeg(i);                       // encode le littéral avant le placeholder
            out.push(PLACEHOLDER_BEGIN, code); // [0xFD, B_TXT_<NAME>]
            i = close + 1;
            segStart = i;
            continue;
          }
        }
        // Token non-{B_*} (ou B_ inconnu) : reste dans le segment → géré par
        // encodeStringForFont au prochain flush (codes de contrôle / EXTRA_SYMBOL / skip).
      }
    }
    i++;
  }
  flushSeg(js.length);
  out.push(EOS);
  return Uint8Array.from(out);
}

// ─── Helpers string byte-level (1:1 décomp string_util.c, sur Uint8Array) ───

/** 1:1 décomp `StringLength(str)` : nombre de bytes avant EOS. */
export function StringLength_(str: Uint8Array): number {
  let n = 0;
  while (n < str.length && str[n] !== EOS) n++;
  return n;
}

/** 1:1 décomp `StringCopy(dst, src)` : copie src (jusqu'à+inclus EOS) dans dst.
 *  Retourne l'offset du EOS dans dst (= pointeur de fin, comme le décomp). */
export function StringCopy_(dst: Uint8Array, src: Uint8Array, dstOffset = 0): number {
  let d = dstOffset;
  let s = 0;
  while (s < src.length && src[s] !== EOS) { dst[d++] = src[s++]; }
  dst[d] = EOS;
  return d;
}

/** 1:1 décomp `StringAppend(dst, src)` : append src à la fin de dst (au EOS).
 *  Retourne l'offset du nouveau EOS. */
export function StringAppend_(dst: Uint8Array, src: Uint8Array): number {
  const end = StringLength_(dst);
  return StringCopy_(dst, src, end);
}

/** STR_CONV_MODE_* (1:1 décomp string_util.h). */
export const STR_CONV_MODE_LEFT_ALIGN = 0;
export const STR_CONV_MODE_RIGHT_ALIGN = 1;
export const STR_CONV_MODE_LEADING_ZEROS = 2;

/** 1:1 décomp `ConvertIntToDecimalStringN(dst, value, mode, n)` : écrit `value`
 *  en décimal (n chiffres max) dans dst (bytes charmap des digits 0-9), EOS final.
 *  Digits charmap : '0'=161…'9'=170 (résolu via charmap). LEFT_ALIGN = pas de
 *  padding (= le cas battle B_BUFF_NUMBER). Retourne l'offset du EOS. */
export function ConvertIntToDecimalStringN_(
  dst: Uint8Array, value: number, mode: number, n: number, dstOffset = 0,
): number {
  const digits: number[] = [];
  let v = Math.max(0, Math.floor(value));
  if (v === 0) digits.push(0);
  else while (v > 0) { digits.push(v % 10); v = Math.floor(v / 10); }
  digits.reverse();
  // Tronque/pad à n chiffres selon le mode.
  let out = digits;
  if (mode === STR_CONV_MODE_LEADING_ZEROS) {
    while (out.length < n) out.unshift(0);
  }
  if (out.length > n && n > 0) out = out.slice(out.length - n);
  const cm = _charmap;
  const zero = cm ? (cm['0'] ?? 161) : 161;
  let d = dstOffset;
  for (const dig of out) dst[d++] = zero + dig;
  dst[d] = EOS;
  return d;
}

/** 1:1 décomp `StringGet_Nickname(nickname)` : strip les bytes de contrôle d'un
 *  nickname (le décomp gère EOS + un code spécial de fin). Notre data : les
 *  nicknames byte se terminent déjà par EOS → no-op de troncature ici (la
 *  source GetMonData NICKNAME donne déjà des bytes propres). Conservé pour la
 *  fidélité de signature ; ajoute un EOS de sûreté. */
export function StringGet_Nickname_(nickname: Uint8Array): Uint8Array {
  const len = StringLength_(nickname);
  if (len < nickname.length) nickname[len] = EOS;
  return nickname;
}

// ─── Map token {B_NAME} → code B_TXT_ (pour encodeTemplate) ─────────────────

/** Mapping nom de token (sans le préfixe `B_`) → code B_TXT_*. Utilisé par
 *  encodeTemplate pour transformer `{B_ATK_NAME_WITH_PREFIX}` → [0xFD, 0x0F]. */
export const B_TXT_NAME_TO_CODE: Record<string, number> = {
  BUFF1: B_TXT_BUFF1, BUFF2: B_TXT_BUFF2, BUFF3: B_TXT_BUFF3,
  COPY_VAR_1: B_TXT_COPY_VAR_1, COPY_VAR_2: B_TXT_COPY_VAR_2, COPY_VAR_3: B_TXT_COPY_VAR_3,
  PLAYER_MON1_NAME: B_TXT_PLAYER_MON1_NAME, OPPONENT_MON1_NAME: B_TXT_OPPONENT_MON1_NAME,
  PLAYER_MON2_NAME: B_TXT_PLAYER_MON2_NAME, OPPONENT_MON2_NAME: B_TXT_OPPONENT_MON2_NAME,
  ATK_NAME_WITH_PREFIX_MON1: B_TXT_ATK_NAME_WITH_PREFIX_MON1, ATK_PARTNER_NAME: B_TXT_ATK_PARTNER_NAME,
  ATK_NAME_WITH_PREFIX: B_TXT_ATK_NAME_WITH_PREFIX, DEF_NAME_WITH_PREFIX: B_TXT_DEF_NAME_WITH_PREFIX,
  EFF_NAME_WITH_PREFIX: B_TXT_EFF_NAME_WITH_PREFIX, ACTIVE_NAME_WITH_PREFIX: B_TXT_ACTIVE_NAME_WITH_PREFIX,
  SCR_ACTIVE_NAME_WITH_PREFIX: B_TXT_SCR_ACTIVE_NAME_WITH_PREFIX,
  CURRENT_MOVE: B_TXT_CURRENT_MOVE, LAST_MOVE: B_TXT_LAST_MOVE,
  LAST_ITEM: B_TXT_LAST_ITEM, LAST_ABILITY: B_TXT_LAST_ABILITY,
  ATK_ABILITY: B_TXT_ATK_ABILITY, DEF_ABILITY: B_TXT_DEF_ABILITY,
  SCR_ACTIVE_ABILITY: B_TXT_SCR_ACTIVE_ABILITY, EFF_ABILITY: B_TXT_EFF_ABILITY,
  TRAINER1_CLASS: B_TXT_TRAINER1_CLASS, TRAINER1_NAME: B_TXT_TRAINER1_NAME,
  PLAYER_NAME: B_TXT_PLAYER_NAME,
  TRAINER1_LOSE_TEXT: B_TXT_TRAINER1_LOSE_TEXT, TRAINER1_WIN_TEXT: B_TXT_TRAINER1_WIN_TEXT,
  PC_CREATOR_NAME: B_TXT_PC_CREATOR_NAME,
  ATK_PREFIX1: B_TXT_ATK_PREFIX1, DEF_PREFIX1: B_TXT_DEF_PREFIX1,
  ATK_PREFIX2: B_TXT_ATK_PREFIX2, DEF_PREFIX2: B_TXT_DEF_PREFIX2,
  ATK_PREFIX3: B_TXT_ATK_PREFIX3, DEF_PREFIX3: B_TXT_DEF_PREFIX3,
  TRAINER2_CLASS: B_TXT_TRAINER2_CLASS, TRAINER2_NAME: B_TXT_TRAINER2_NAME,
  TRAINER2_LOSE_TEXT: B_TXT_TRAINER2_LOSE_TEXT, TRAINER2_WIN_TEXT: B_TXT_TRAINER2_WIN_TEXT,
};

/** Reverse de B_TXT_NAME_TO_CODE : code B_TXT_* → nom de token. Sert UNIQUEMENT
 *  à produire un marqueur LISIBLE pour les cas déférés (trainer lose/win text,
 *  trainer2…). ⚠️ NE PAS utiliser STRINGID_NAMES ici : il est indexé par
 *  STRINGID (id de message), PAS par code B_TXT_* → STRINGID_NAMES[code] donnait
 *  un label FAUX (ex "[PKMNMADESLEEP]" pour B_TXT_TRAINER1_LOSE_TEXT). */
const _CODE_TO_B_TXT_NAME: Record<number, string> = Object.fromEntries(
  Object.entries(B_TXT_NAME_TO_CODE).map(([name, c]) => [c, name]),
);

// ─── Helpers internes byte ───────────────────────────────────────────────────

/** Copie msgData.textBuffs[0..2] → gBattleTextBuff1/2/3 (1:1 décomp
 *  BufferStringBattle 1988-1993). Les textBuffs du snapshot sont des Uint8Array. */
function _loadTextBuffs(msgData: BattleMsgData): void {
  const tb = (msgData as unknown as { textBuffs?: Uint8Array[] }).textBuffs;
  const dst = [gBattleTextBuff1, gBattleTextBuff2, gBattleTextBuff3];
  for (let i = 0; i < 3; i++) {
    const s = tb?.[i];
    const d = dst[i];
    d.fill(0);
    if (s) { for (let k = 0; k < d.length && k < s.length; k++) d[k] = s[k]; }
    else d[0] = B_BUFF_EOS;
  }
}

/** Résout un buffer (gBattleTextBuffN) en bytes à copier : si mini-format
 *  (0xFD) → ExpandBattleTextBuffPlaceholders dans le scratch ; sinon → raw.
 *  (TryGetStatusString : déféré — fallback raw, suffit pour le wild commun.) */
function _resolveBuff(buff: Uint8Array, scratch: Uint8Array): Uint8Array {
  if (buff[0] === B_BUFF_PLACEHOLDER_BEGIN) {
    ExpandBattleTextBuffPlaceholders(buff, scratch);
    return scratch;
  }
  return buff;
}

const _ABILITY_OF = (msgData: BattleMsgData, battler: number): number =>
  ((msgData as unknown as { abilities?: number[] }).abilities?.[battler]) ?? 0;

/** Résout un code placeholder B_TXT_* → bytes à copier dans dst.
 *  1:1 décomp BattleStringExpandPlaceholders switch (2402-2812). */
function _resolveToCpy(code: number, msgData: BattleMsgData): Uint8Array {
  const md = msgData as unknown as {
    battlerAttacker: number; battlerTarget: number; scrActive: number;
    currentMove: number; originallyUsedMove: number; lastItem: number; lastAbility: number;
  };
  switch (code) {
    case B_TXT_BUFF1: return _resolveBuff(gBattleTextBuff1, gStringVarBattle1);
    case B_TXT_BUFF2: return _resolveBuff(gBattleTextBuff2, gStringVarBattle2);
    case B_TXT_BUFF3: return _resolveBuff(gBattleTextBuff3, gStringVarBattle3);
    case B_TXT_COPY_VAR_1: return gStringVarBattle1;
    case B_TXT_COPY_VAR_2: return gStringVarBattle2;
    case B_TXT_COPY_VAR_3: return gStringVarBattle3;
    case B_TXT_PLAYER_MON1_NAME:   return encodeChars(_monNickname(0));
    case B_TXT_OPPONENT_MON1_NAME: return encodeChars(_monNickname(1));
    case B_TXT_PLAYER_MON2_NAME:   return encodeChars(_monNickname(2));
    case B_TXT_OPPONENT_MON2_NAME: return encodeChars(_monNickname(3));
    case B_TXT_ATK_NAME_WITH_PREFIX_MON1: return encodeChars(_monNicknameWithPrefix(md.battlerAttacker));
    case B_TXT_ATK_PARTNER_NAME:   return encodeChars(_monNickname((md.battlerAttacker & ~1) | 2));
    case B_TXT_ATK_NAME_WITH_PREFIX: return encodeChars(_monNicknameWithPrefix(md.battlerAttacker));
    case B_TXT_DEF_NAME_WITH_PREFIX: return encodeChars(_monNicknameWithPrefix(md.battlerTarget));
    case B_TXT_EFF_NAME_WITH_PREFIX: return encodeChars(_monNicknameWithPrefix(gEffectBattler));
    case B_TXT_ACTIVE_NAME_WITH_PREFIX: return encodeChars(_monNicknameWithPrefix(gActiveBattler));
    case B_TXT_SCR_ACTIVE_NAME_WITH_PREFIX: return encodeChars(_monNicknameWithPrefix(md.scrActive));
    case B_TXT_26: return encodeChars(_monNicknameWithPrefix(md.scrActive));
    case B_TXT_CURRENT_MOVE: return encodeChars(_moveName(md.currentMove));
    case B_TXT_LAST_MOVE:    return encodeChars(_moveName(md.originallyUsedMove));
    case B_TXT_LAST_ITEM:    return encodeChars(_itemName(md.lastItem));
    case B_TXT_LAST_ABILITY: return encodeChars(_abilityName(md.lastAbility));
    case B_TXT_ATK_ABILITY:  return encodeChars(_abilityName(_ABILITY_OF(msgData, md.battlerAttacker)));
    case B_TXT_DEF_ABILITY:  return encodeChars(_abilityName(_ABILITY_OF(msgData, md.battlerTarget)));
    case B_TXT_SCR_ACTIVE_ABILITY: return encodeChars(_abilityName(_ABILITY_OF(msgData, md.scrActive)));
    case B_TXT_EFF_ABILITY:  return encodeChars(_abilityName(_ABILITY_OF(msgData, gEffectBattler)));
    case B_TXT_PLAYER_NAME:  return encodeChars(GetPlayerNameString() || 'Joueur');
    case B_TXT_TRAINER1_CLASS: return encodeChars(_resolveTrainerClassNameFr(gTrainerBattleOpponent_A));
    case B_TXT_TRAINER1_NAME:  return encodeChars(_resolveTrainerNameFr(gTrainerBattleOpponent_A));
    case B_TXT_PC_CREATOR_NAME: return encodeChars('BILL');
    case B_TXT_ATK_PREFIX1: case B_TXT_ATK_PREFIX2: case B_TXT_ATK_PREFIX3:
      return encodeChars((md.battlerAttacker & 1) === 0 ? 'ami' : 'ennemi');
    case B_TXT_DEF_PREFIX1: case B_TXT_DEF_PREFIX2: case B_TXT_DEF_PREFIX3:
      return encodeChars((md.battlerTarget & 1) === 0 ? 'ami' : 'ennemi');
    // Cas dresseur 2 / lose-win text / link / frontier : data par-dresseur ou
    // modes non supportés (double/link) → marqueur déféré (= comportement du
    // décodeur actuel, battle-string-decoder:552). Le {B_X} reste visible = signal.
    // 1:1 décomp battle_message.c:2680 : B_TXT_TRAINER1_LOSE_TEXT -> GetTrainerALoseText()
    // (= StringExpandPlaceholders(sTrainerADefeatSpeech)). Voie L : sTrainerADefeatSpeech pose au
    // setup (BattleSetup_StartTrainerBattle). Fallback marqueur si null (voie V / non pose) -> 0 regression.
    case B_TXT_TRAINER1_LOSE_TEXT: {
      if (getTrainerADefeatSpeech()) return GetTrainerALoseText();
      return encodeChars('[B_TRAINER1_LOSE_TEXT]');
    }
    case B_TXT_TRAINER2_CLASS: case B_TXT_TRAINER2_NAME:
    case B_TXT_TRAINER1_WIN_TEXT:
    case B_TXT_TRAINER2_LOSE_TEXT: case B_TXT_TRAINER2_WIN_TEXT:
      return encodeChars('[B_' + (_CODE_TO_B_TXT_NAME[code] ?? code) + ']');
    default:
      return encodeChars('{B_?' + code + '}');
  }
}

// ─── Expanders byte-level (1:1 décomp battle_message.c) ─────────────────────

/** 1:1 décomp `ExpandBattleTextBuffPlaceholders(src, dst)` (2847-2953).
 *  Expand un gBattleTextBuff (mini-format 0xFD…0xFF) → bytes charmap dans dst. */
export function ExpandBattleTextBuffPlaceholders(src: Uint8Array, dst: Uint8Array): void {
  let srcID = 1; // skip B_BUFF_PLACEHOLDER_BEGIN
  dst[0] = EOS;
  while (srcID < src.length && src[srcID] !== B_BUFF_EOS) {
    const tag = src[srcID];
    switch (tag) {
      case B_BUFF_STRING: {
        const hword = src[srcID + 1] | (src[srcID + 2] << 8);
        if (hword === STRINGID_STATSHARPLY || hword === STRINGID_STATHARSHLY) srcID += 3;
        const sText = BATTLE_STRINGS_TABLE[hword];
        StringAppend_(dst, encodeChars(sText ? getString(sText) : ('[str' + hword + ']')));
        srcID += 3;
        break;
      }
      case B_BUFF_NUMBER: {
        const byteCount = src[srcID + 1];
        const maxDigits = src[srcID + 2];
        let value = 0;
        for (let b = 0; b < byteCount; b++) value |= src[srcID + 3 + b] << (b * 8);
        const end = StringLength_(dst);
        ConvertIntToDecimalStringN_(dst, value >>> 0, STR_CONV_MODE_LEFT_ALIGN, maxDigits, end);
        srcID += byteCount + 3;
        break;
      }
      case B_BUFF_MOVE: { StringAppend_(dst, encodeChars(_moveName(src[srcID + 1] | (src[srcID + 2] << 8)))); srcID += 3; break; }
      case B_BUFF_TYPE: { StringAppend_(dst, encodeChars(_typeName(src[srcID + 1]))); srcID += 2; break; }
      case B_BUFF_MON_NICK_WITH_PREFIX: { StringAppend_(dst, encodeChars(_monNicknameWithPrefix(src[srcID + 1]))); srcID += 3; break; }
      case B_BUFF_STAT: { StringAppend_(dst, encodeChars(STAT_NAMES_FR[src[srcID + 1]] ?? '')); srcID += 2; break; }
      case B_BUFF_SPECIES: { StringAppend_(dst, encodeChars(_speciesName(src[srcID + 1] | (src[srcID + 2] << 8)))); srcID += 3; break; }
      case B_BUFF_MON_NICK: { StringAppend_(dst, encodeChars(_monNickname(src[srcID + 1]))); srcID += 3; break; }
      case B_BUFF_NEGATIVE_FLAVOR: {
        // 1:1 décomp battle_message.c:2924 : gPokeblockWasTooXStringTable[flavorId] = saveur
        // POKéBLOCK (FLAVOR_SPICY=0..SOUR=4), extraits sText_PokeblockWasTooX. (Avant : degrés FAUX.)
        const POKEBLOCK_FLAVOR = ['sText_PokeblockWasTooSpicy', 'sText_PokeblockWasTooDry', 'sText_PokeblockWasTooSweet', 'sText_PokeblockWasTooBitter', 'sText_PokeblockWasTooSour'];
        StringAppend_(dst, encodeChars(getString(POKEBLOCK_FLAVOR[src[srcID + 1]] ?? 'sText_PokeblockWasTooSpicy'))); srcID += 2; break;
      }
      case B_BUFF_ABILITY: { StringAppend_(dst, encodeChars(_abilityName(src[srcID + 1]))); srcID += 2; break; }
      case B_BUFF_ITEM: { StringAppend_(dst, encodeChars(_itemName(src[srcID + 1] | (src[srcID + 2] << 8)))); srcID += 3; break; }
      default: srcID++; break;
    }
  }
}

/** 1:1 décomp `BattleStringExpandPlaceholders(src, dst)` (2383-2842).
 *  Itère le template (bytes) ; sur PLACEHOLDER_BEGIN(0xFD) résout le code
 *  B_TXT_* en bytes (via _resolveToCpy) et les copie ; sinon copie le byte
 *  littéral. Trainer lose/win text → append PAUSE_UNTIL_PRESS. EOS final.
 *  Retourne la longueur écrite (sans l'EOS). */
export function BattleStringExpandPlaceholders(src: Uint8Array, dst: Uint8Array, msgData: BattleMsgData): number {
  let dstID = 0;
  let i = 0;
  while (i < src.length && src[i] !== EOS) {
    if (src[i] === PLACEHOLDER_BEGIN) {
      i++;
      const code = src[i];
      const toCpy = _resolveToCpy(code, msgData);
      for (let k = 0; k < toCpy.length && toCpy[k] !== EOS; k++) dst[dstID++] = toCpy[k];
      if (code === B_TXT_TRAINER1_LOSE_TEXT || code === B_TXT_TRAINER2_LOSE_TEXT
          || code === B_TXT_TRAINER1_WIN_TEXT || code === B_TXT_TRAINER2_WIN_TEXT) {
        dst[dstID++] = EXT_CTRL_CODE_BEGIN;
        dst[dstID++] = EXT_CTRL_CODE_PAUSE_UNTIL_PRESS;
      }
    } else {
      dst[dstID++] = src[i];
    }
    i++;
  }
  dst[dstID++] = EOS;
  return dstID - 1;
}

// ─── BufferStringBattle (point d'entrée, 1:1 décomp 1968-2320) ──────────────

/** 1:1 décomp `EWRAM_DATA struct BattleMsgData *gBattleMsgDataPtr` (battle_message.c:52),
 *  posé par BufferStringBattle (:1975) — lu par battle_tv.c BattleTv_SetDataBasedOnString. */
export let gBattleMsgDataPtr: BattleMsgData | null = null;

/** 1:1 décomp `BufferStringBattle(stringID)` (1968) — version voie L byte-level.
 *  Réutilise les `_resolve*StringName` (switch 1:1 déjà porté) pour choisir le
 *  sText, encode le template en bytes, puis expand dans gDisplayedStringBattle.
 *  Retourne la longueur écrite. msgData = snapshot IPC (gBattleBufferA[active][4]). */
export function BufferStringBattle(stringID: number, msgData: BattleMsgData): number {
  gBattleMsgDataPtr = msgData;  // 1:1 :1975
  _loadTextBuffs(msgData);
  let sTextName: string | null = null;
  switch (stringID) {
    case 0: sTextName = _resolveIntroMsgStringName(); break;        // STRINGID_INTROMSG
    case 1: sTextName = _resolveIntroSendoutStringName(); break;    // STRINGID_INTROSENDOUT
    case 2: sTextName = _resolveReturnmonStringName(); break;       // STRINGID_RETURNMON
    case 3: sTextName = _resolveSwitchinmonStringName(); break;     // STRINGID_SWITCHINMON
    case 4: { // STRINGID_USEDMOVE (battle_message.c:2166) : pre-fill BUFF2 = nom du move (raw bytes)
      sTextName = 'sText_AttackerUsedX';
      const mv = (msgData as unknown as { currentMove: number }).currentMove;
      // 1:1 décomp `ChooseTypeOfMoveUsedString` (battle_message.c:2174) : append "!" après
      // le nom du move (template:420 sans "!" ; sText_ExclamationMark*:421-425 = "!" en FR).
      StringCopy_(gBattleTextBuff2, encodeChars(_moveName(mv) + '!'));
      break;
    }
    case 5: case 6: case 7: case 8: case 9: case 10: case 11:
      gDisplayedStringBattle[0] = EOS; return 0; // gap / BATTLEEND (pas de texte simple)
    default:
      sTextName = BATTLE_STRINGS_TABLE[stringID] ?? null;
  }
  if (!sTextName) {
    const dbg = STRINGID_NAMES[stringID] ?? ('STRINGID_' + stringID);
    const b = encodeChars('[' + dbg + ']');
    const n = StringCopy_(gDisplayedStringBattle, b);
    return n;
  }
  const tmpl = getString(sTextName);
  if (tmpl.startsWith('[MISSING:')) {
    const b = encodeChars('[' + sTextName + ' missing]');
    return StringCopy_(gDisplayedStringBattle, b);
  }
  const tmplBytes = encodeTemplate(tmpl, B_TXT_NAME_TO_CODE);
  return BattleStringExpandPlaceholders(tmplBytes, gDisplayedStringBattle, msgData);
}

// ─── Decode bytes → JS string lisible (debug/harness stash) ─────────────────

let _revCharmap: Record<number, string> | null = null;

/** Reverse-charmap : bytes charmap → JS string lisible. Pour le stash debug
 *  `__battleDisplayedText` (= harness/probes). 0xFE→\n, 0xFF→stop, 0xFD/0xFC +
 *  sub-byte → skip (codes placeholder/ext résiduels). PAS pour le rendu (le
 *  rendu consomme les bytes direct). */
export function decodeBytesToString(bytes: Uint8Array): string {
  const cm = _charmap;
  if (!cm) return '<charmap?>';
  if (!_revCharmap) {
    _revCharmap = {};
    for (const k in cm) { if (_revCharmap[cm[k]] === undefined) _revCharmap[cm[k]] = k; }
  }
  let s = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b === EOS) break;
    if (b === CHAR_NEWLINE || b === CHAR_PROMPT_SCROLL) { s += '\n'; continue; } // \n / \l (scroll)
    if (b === CHAR_PROMPT_CLEAR) { continue; } // \p (page-break) → rien en lisible
    if (b === EXT_CTRL_CODE_BEGIN) {
      // skip le sub-code + ses params PAR CODE (1:1 GetExtCtrlCodeLength) :
      // PAUSE_UNTIL_PRESS/WAIT_SE/JPN/ENG = 0 param ; PLAY_BGM/PLAY_SE = 2
      // (u16 — le « À » fantome du texte capture = le byte haut de MUS_CAUGHT
      // 0x160 laisse par l'ancien skip generique 1-param) ;
      // COLOR_HIGHLIGHT_SHADOW = 3 ; le reste = 1.
      const sub = bytes[i + 1];
      const ZERO = new Set([0x09 /*PAUSE_UNTIL_PRESS*/, 0x0A /*WAIT_SE*/, 0x15 /*JPN*/, 0x16 /*ENG*/]);
      const args = ZERO.has(sub) ? 0
        : (sub === 0x0B /*PLAY_BGM*/ || sub === 0x10 /*PLAY_SE*/) ? 2
        : (sub === 0x04 /*COLOR_HIGHLIGHT_SHADOW*/) ? 3
        : 1;
      i += 1 + args;
      continue;
    }
    if (b === PLACEHOLDER_BEGIN) { i++; continue; } // skip code + sub-byte
    s += _revCharmap[b] ?? '';
  }
  return s;
}

// ─── Expose pour debug/test ─────────────────────────────────────────────────

void gBattleTypeFlags; void _getBattlerSide; // (utilisés par les _resolve* importés ; gardés pour parité)

(globalThis as Record<string, unknown>).__battleMessage = {
  gDisplayedStringBattle,
  loadBattleCharmap,
  getBattleCharmap,
  encodeChars,
  encodeTemplate,
  StringLength_,
  StringCopy_,
  StringAppend_,
  ConvertIntToDecimalStringN_,
  StringGet_Nickname_,
  B_TXT_NAME_TO_CODE,
  ExpandBattleTextBuffPlaceholders,
  BattleStringExpandPlaceholders,
  BufferStringBattle,
  decodeBytesToString,
};

// Déclenche le chargement du charmap dès l'import du module (fetch cached =
// instantané car gba-text-system charge déjà charmap.json). Garantit que
// encodeChars/encodeTemplate ont le charmap quand PlayerHandlePrintString tourne
// (après l'intro = plusieurs secondes plus tard).
void loadBattleCharmap();

// ════════════════════════════════════════════════════════════════════════
// FUSION 1:1 : battle-string-decoder.ts (=battle_message.c décodeur/placeholders,
// src/battle_message.c:1968-2950). Dé-splitté pour matcher le fichier décomp unique.
// ════════════════════════════════════════════════════════════════════════
// 1:1 décomp `TRAINER_UNION_ROOM` (include/constants/trainers.h).
const TRAINER_UNION_ROOM = 3072;
// 1:1 décomp `TRAINER_LINK_OPPONENT` (trainers.h) = 2048. AUDIT FIX : était 0x400 (1024).
const TRAINER_LINK_OPPONENT = 2048;

// 1:1 décomp `B_SIDE_PLAYER` / `B_SIDE_OPPONENT` : (battler & 1) → 0 = PLAYER, 1 = OPPONENT.
function _getBattlerSide(battler: number): number { return battler & 1; }

// ─── Trainer name/class resolvers (1:1 décomp gTrainers[id].trainerClass/Name) ─
//     Reverse cache trainerId number → "TRAINER_X" key, built lazy depuis
//     constants/opponents-data.ts. Lookup name/class FR via data-tables.ts
//     (= trainers.json + trainer-class-names-fr.json).

let _trainerIdToKey: Map<number, string> | null = null;
async function _buildTrainerIdCache(): Promise<void> {
  if (_trainerIdToKey) return;
  _trainerIdToKey = new Map();
  try {
    const mod = await import('../include/constants/opponents');
    for (const [key, val] of Object.entries(mod)) {
      if (key.startsWith('TRAINER_') && typeof val === 'number') {
        if (!_trainerIdToKey.has(val)) _trainerIdToKey.set(val, key);
      }
    }
  } catch {
    /* boot ordering edge — cache stays empty until next call */
  }
}
// Fire async load (= populate cache by time first battle starts).
void _buildTrainerIdCache();

function _resolveTrainerKey(trainerId: number): string {
  return _trainerIdToKey?.get(trainerId) ?? `TRAINER_${trainerId}`;
}

function _resolveTrainerNameFr(trainerId: number): string {
  const key = _resolveTrainerKey(trainerId);
  const dt = (globalThis as { gameDataTrainers?: Record<string, { trainerName?: string; name?: string }> }).gameDataTrainers;
  const t = dt?.[key];
  return t?.trainerName ?? t?.name ?? key.replace(/^TRAINER_/, '');
}

function _resolveTrainerClassNameFr(trainerId: number): string {
  const key = _resolveTrainerKey(trainerId);
  const dt = (globalThis as { gameDataTrainers?: Record<string, { trainerClass?: string }> }).gameDataTrainers;
  const trainerClass = dt?.[key]?.trainerClass;
  if (!trainerClass) return 'DRESSEUR';
  const classMap = (globalThis as { gameDataTrainerClassesFr?: Record<string, string> }).gameDataTrainerClassesFr;
  return classMap?.[trainerClass] ?? trainerClass.replace(/^TRAINER_CLASS_/, '');
}

function _getTrainerOpponentB(): number {
  // 1:1 décomp state.ts gTrainerBattleOpponent_B (= 2-opponent doubles).
  const bs = (globalThis as { __battleState?: { gTrainerBattleOpponent_B?: number } }).__battleState;
  return bs?.gTrainerBattleOpponent_B ?? 0;
}

// ─── STAT names (1:1 décomp battle_message.c:430-440) ──────────────────────

const STAT_NAMES_FR: Record<number, string> = {
  0: 'PV',
  1: 'ATTAQUE',
  2: 'DÉFENSE',
  3: 'VITESSE',
  4: 'ATT. SPÉ.',
  5: 'DÉF. SPÉ.',
  6: 'PRÉCISION',
  7: 'ESQUIVE',
};

// ─── Helpers : species/move/ability/item name resolvers ────────────────────

/** Cache numeric species id → "SPECIES_X" enum name (= lazy). */
const _speciesIdToEnumCache = new Map<number, string>();
function _speciesIdToEnum(speciesId: number): string | null {
  if (_speciesIdToEnumCache.has(speciesId)) return _speciesIdToEnumCache.get(speciesId) ?? null;
  try {
    const dt = (globalThis as { gameDataSpecies?: Record<string, unknown> }).gameDataSpecies;
    if (dt) {
      for (const key of Object.keys(dt)) {
        const id = resolveDecompConstant(key);
        if (typeof id === 'number' && id === speciesId) {
          _speciesIdToEnumCache.set(speciesId, key);
          return key;
        }
      }
    }
  } catch { /* fallthrough */ }
  return null;
}

/** Resolve nom species depuis species id numeric.
 *  1:1 décomp `gSpeciesNames[species]` (= names FR extraits depuis decomp data).
 *  Notre port : resolve numeric → "SPECIES_X" → lookup text-tables.json
 *  via getSpeciesNameFr (= retourne nom FR comme "ZIGZATON" pas "ZIGZAGOON"). */
function _speciesName(speciesId: number): string {
  if (!speciesId) return '?';
  const enumName = _speciesIdToEnum(speciesId);
  if (enumName) {
    const fr = _getSpeciesNameFr(enumName);
    if (fr && fr !== enumName) return fr;
    return enumName.replace(/^SPECIES_/, '');
  }
  // 1:1 décomp : un id hors table indexe gSpeciesNames[SPECIES_NONE] = "??????????"
  // (species_names.h:2). On route par la table de noms (pas un littéral FR inventé).
  return _getSpeciesNameFr('SPECIES_NONE') || '??????????';
}

/** Cache numeric → "MOVE_X" enum name (= populated lazy au first lookup).
 *  Built by scanning resolveDecompConstant inverse au runtime. */
const _moveIdToEnumCache = new Map<number, string>();
function _moveIdToEnum(moveId: number): string | null {
  if (_moveIdToEnumCache.has(moveId)) return _moveIdToEnumCache.get(moveId) ?? null;
  // 1:1 décomp : on doit reverse-iterate la table moves. À cause de l'arch
  // notre port (= moves data is Record<MOVE_X, MoveData>), on scan via
  // resolveDecompConstant pour chaque clé connue. Pour speed : build cache
  // une seule fois en scannant un set fixe de moves connus.
  // Approche pragmatique : si moveId <= 354 (= total moves Gen 3), try
  // `MOVE_X` candidate names depuis __game_data globalThis bridge.
  try {
    const dt = (globalThis as { gameDataMoves?: Record<string, unknown> }).gameDataMoves;
    if (dt) {
      for (const key of Object.keys(dt)) {
        const id = resolveDecompConstant(key);
        if (typeof id === 'number' && id === moveId) {
          _moveIdToEnumCache.set(moveId, key);
          return key;
        }
      }
    }
  } catch { /* fallthrough */ }
  return null;
}

/** Resolve nom move depuis move id numeric.
 *  1:1 décomp `gMoveNames[moveId]` (battle_message.c:2172). Notre port :
 *   - Resolve numeric → "MOVE_X" via reverse cache
 *   - Lookup gameData.moveNamesFr[MOVE_X] via getMoveName  - Fallback : enum sans préfixe "MOVE_" */
function _moveName(moveId: number): string {
  if (!moveId) return '?';
  const enumName = _moveIdToEnum(moveId);
  if (enumName) {
    const fr = _getMoveNameFr(enumName);
    if (fr && fr !== enumName) return fr;
    return enumName.replace(/^MOVE_/, '');
  }
  return `Capa#${moveId}`;
}

/** Cache numeric ability id → "ABILITY_X" enum name (lazy). */
const _abilityIdToEnumCache = new Map<number, string>();
function _abilityIdToEnum(abilityId: number): string | null {
  if (_abilityIdToEnumCache.has(abilityId)) return _abilityIdToEnumCache.get(abilityId) ?? null;
  try {
    const an = (globalThis as { gameDataAbilityNamesFr?: Record<string, string> }).gameDataAbilityNamesFr;
    if (an) {
      for (const key of Object.keys(an)) {
        const id = resolveDecompConstant(key);
        if (typeof id === 'number' && id === abilityId) {
          _abilityIdToEnumCache.set(abilityId, key);
          return key;
        }
      }
    }
  } catch { /* fallthrough */ }
  return null;
}

/** Resolve nom ability depuis ability id numeric.
 *  1:1 décomp gAbilityNames[abilityId]. Notre port : reverse cache + lookup
 *  gameDataAbilityNamesFr[ABILITY_X] → FR ("STATIK" pour STATIC). */
function _abilityName(abilityId: number): string {
  if (!abilityId) return '—';
  const enumName = _abilityIdToEnum(abilityId);
  if (enumName) {
    try {
      const an = (globalThis as { gameDataAbilityNamesFr?: Record<string, string> }).gameDataAbilityNamesFr;
      const fr = an?.[enumName];
      if (fr) return fr;
    } catch { /* fallthrough */ }
    return enumName.replace(/^ABILITY_/, '');
  }
  return `Talent#${abilityId}`;
}

/** Cache numeric item id → "ITEM_X" enum name (lazy). */
const _itemIdToEnumCache = new Map<number, string>();
function _itemIdToEnum(itemId: number): string | null {
  if (_itemIdToEnumCache.has(itemId)) return _itemIdToEnumCache.get(itemId) ?? null;
  try {
    const it = (globalThis as { gameDataItems?: Record<string, unknown> }).gameDataItems;
    if (it) {
      for (const key of Object.keys(it)) {
        const id = resolveDecompConstant(key);
        if (typeof id === 'number' && id === itemId) {
          _itemIdToEnumCache.set(itemId, key);
          return key;
        }
      }
    }
  } catch { /* fallthrough */ }
  return null;
}

/** Resolve nom item depuis item id numeric.
 *  1:1 décomp gItems[itemId].name. Notre port : reverse cache + getItemNameFr. */
function _itemName(itemId: number): string {
  if (!itemId) return '—';
  const enumName = _itemIdToEnum(itemId);
  if (enumName) {
    const fr = _getItemNameFr(enumName);
    if (fr && fr !== enumName) return fr;
    return enumName.replace(/^ITEM_/, '');
  }
  return `Objet#${itemId}`;
}

/** Resolve nom type depuis type id numeric. */
function _typeName(typeId: number): string {
  const TYPE_NAMES_FR = [
    'NORMAL', 'COMBAT', 'VOL', 'POISON', 'SOL', 'ROCHE', 'INSECTE', 'SPECTRE',
    'ACIER', '?', 'FEU', 'EAU', 'PLANTE', 'ELECTRIK', 'PSY', 'GLACE', 'DRAGON',
    'TENEBRES',
  ];
  return TYPE_NAMES_FR[typeId] ?? `Type#${typeId}`;
}

// ─── Mon nickname resolver (= gBattleMons[X].nickname Uint8Array u8[10] GBA) ─

/** Read nickname depuis gBattleMons[battlerId]. 1:1 décomp : u8[10] avec EOS 0xFF.
 *  fillBattleMonFromParty (party-storage.ts:401) initialise déjà `mon.nickname`
 *  à `inst.nickname || inst.speciesNameFr`, donc on a toujours un nickname
 *  populé. Le fallback ici est purement défensif (= si gBattleMons pas init). */
function _monNickname(battlerId: number): string {
  const mon = gBattleMons[battlerId];
  if (!mon) return '?';
  if (mon.nickname && typeof mon.nickname === 'string' && mon.nickname.length > 0) {
    return mon.nickname;
  }
  return _speciesName(mon.species ?? 0);
}

/** Préfixe selon side (= player vs enemy). 1:1 décomp `HANDLE_NICKNAME_STRING_CASE`
 *  (battle_message.c:2362-2380).
 *  - Side PLAYER (= bit 0 == 0) → juste nickname.
 *  - Side OPPONENT trainer (= BATTLE_TYPE_TRAINER set) → "X ennemi" (= sText_FoePkmnPrefix " ennemi" appended).
 *  - Side OPPONENT wild (= no trainer flag) → "X sauvage" (= sText_WildPkmnPrefix " sauvage" appended). */
function _monNicknameWithPrefix(battlerId: number): string {
  const nick = _monNickname(battlerId);
  // GET_BATTLER_SIDE : (battlerId & 1) → 0=PLAYER 1=OPPONENT.
  const side = battlerId & 1;
  if (side === 0) return nick;  // PLAYER side → no prefix
  // OPPONENT side : check trainer vs wild via globalThis.
  const bs = (globalThis as { __battleState?: { gBattleTypeFlags?: number } }).__battleState;
  const isTrainerBattle = ((bs?.gBattleTypeFlags ?? 0) & 0x08 /* BATTLE_TYPE_TRAINER */) !== 0;
  return isTrainerBattle ? `${nick} ennemi` : `${nick} sauvage`;
}

// ─── Decode B_BUFF1/2/3 (= mini-format placeholder) 1:1 décomp ─────────────

/** Decode un gBattleTextBuff{1,2,3} content. 1:1 décomp `BattleStringExpand`
 *  (battle_message.c:3046-3200) sub-format :
 *  [0xFD type bytes...] sequence terminée par 0xFF.
 *  type :
 *   - B_BUFF_STRING (0) : stringId u16 little-endian, lookup via gBattleStringsTable
 *   - B_BUFF_NUMBER (1) : byteCount + numericValue (LE)
 *   - B_BUFF_MOVE (2) : moveId u16
 *   - B_BUFF_TYPE (3) : typeId u8
 *   - B_BUFF_MON_NICK_WITH_PREFIX (4) : battler u8 + partyIdx u8
 *   - B_BUFF_STAT (5) : statId u8
 *   - B_BUFF_SPECIES (6) : speciesId u16
 *   - B_BUFF_MON_NICK (7) : battler u8 + partyIdx u8
 *   - B_BUFF_NEGATIVE_FLAVOR (8) : flavorId u8 (= "harshly"/"won't change"/etc.)
 *   - B_BUFF_ABILITY (9) : abilityId u8
 *   - B_BUFF_ITEM (10) : itemId u16 */
function _decodeTextBuff(buf: Uint8Array): string {
  if (!buf || buf.length === 0) return '';
  // Cas 2 (= StringCopy direct par BufferStringBattle special case) : raw ASCII
  // bytes terminés par 0xFF EOS, sans 0xFD prefix.
  if (buf[0] !== B_BUFF_PLACEHOLDER_BEGIN) {
    let out = '';
    for (let i = 0; i < buf.length; i++) {
      if (buf[i] === B_BUFF_EOS) break;
      // Decode comme UTF-8/ASCII direct (= moveName, speciesName, etc.).
      out += String.fromCharCode(buf[i]);
    }
    return out;
  }
  let i = 1;  // skip B_BUFF_PLACEHOLDER_BEGIN
  let out = '';
  while (i < buf.length && buf[i] !== B_BUFF_EOS) {
    const tag = buf[i++];
    switch (tag) {
      case B_BUFF_STRING: {
        // u16 LE stringId puis lookup table-side.
        const stringId = buf[i] | (buf[i + 1] << 8);
        i += 2;
        // 1:1 décomp battle_message.c:2861-2864 : si STATSHARPLY/STATHARSHLY,
        // skip 3 bytes additional (= ignore next B_BUFF_STRING entry STATROSE/
        // STATFELL puisque "sharply" + "rose!" est combiné en "baisse beaucoup!").
        if (stringId === STRINGID_STATSHARPLY || stringId === STRINGID_STATHARSHLY) {
          i += 3;  // skip next B_BUFF_STRING entry [tag, lo, hi]
        }
        const sTextName = BATTLE_STRINGS_TABLE[stringId];
        if (sTextName) {
          const tmpl = getString(sTextName);
          out += tmpl.startsWith('[MISSING:') ? `[?str${stringId}]` : tmpl;
        } else {
          out += `[str${stringId}]`;
        }
        break;
      }
      case B_BUFF_NUMBER: {
        // 1:1 décomp battle_message.c:2866-2881 :
        //   src[+1] = byteCount, src[+2] = maxDigits, src[+3..] = value (byteCount bytes)
        //   srcID advance = byteCount + 3 (total).
        const byteCount = buf[i++];   // i now → maxDigits
        const _maxDigits = buf[i++];  // i now → value byte 0
        void _maxDigits;
        let val = 0;
        for (let b = 0; b < byteCount && i < buf.length; b++) {
          val |= buf[i++] << (b * 8);
        }
        out += String(val);
        break;
      }
      case B_BUFF_MOVE: {
        const moveId = buf[i] | (buf[i + 1] << 8);
        i += 2;
        out += _moveName(moveId);
        break;
      }
      case B_BUFF_TYPE: {
        const typeId = buf[i++];
        out += _typeName(typeId);
        break;
      }
      case B_BUFF_MON_NICK_WITH_PREFIX: {
        const battler = buf[i++];
        // partyIdx pas utilisé dans notre port (= bridge battle-side gBattleMons direct).
        i++;
        out += _monNicknameWithPrefix(battler);
        break;
      }
      case B_BUFF_STAT: {
        const statId = buf[i++];
        out += STAT_NAMES_FR[statId] ?? `Stat#${statId}`;
        break;
      }
      case B_BUFF_SPECIES: {
        const speciesId = buf[i] | (buf[i + 1] << 8);
        i += 2;
        out += _speciesName(speciesId);
        break;
      }
      case B_BUFF_MON_NICK: {
        const battler = buf[i++];
        i++;  // partyIdx unused
        out += _monNickname(battler);
        break;
      }
      case B_BUFF_NEGATIVE_FLAVOR: {
        // 1:1 décomp battle_message.c:2924 : gPokeblockWasTooXStringTable[flavorId] = saveur
        // POKéBLOCK (FLAVOR_SPICY=0..SOUR=4), extraits sText_PokeblockWasTooX. (Avant : faux.)
        const POKEBLOCK_FLAVOR = ['sText_PokeblockWasTooSpicy', 'sText_PokeblockWasTooDry', 'sText_PokeblockWasTooSweet', 'sText_PokeblockWasTooBitter', 'sText_PokeblockWasTooSour'];
        const flavor = buf[i++];
        out += getString(POKEBLOCK_FLAVOR[flavor] ?? 'sText_PokeblockWasTooSpicy');
        break;
      }
      case B_BUFF_ABILITY: {
        const abilityId = buf[i++];
        out += _abilityName(abilityId);
        break;
      }
      case B_BUFF_ITEM: {
        const itemId = buf[i] | (buf[i + 1] << 8);
        i += 2;
        out += _itemName(itemId);
        break;
      }
      default:
        // Unknown buff tag, skip
        i++;
        break;
    }
  }
  return out;
}

// ─── Buffer ENCODERS (= 1:1 décomp PREPARE_*_BUFFER macros) ────────────────
// Construisent un gBattleTextBuff{1,2,3} (mini-format) pour les messages à
// placeholders {B_BUFF1/2/3}. Inverse exact de `_decodeTextBuff` ci-dessus.

/** 1:1 décomp `PREPARE_MON_NICK_BUFFER(buff, battler, partyId)` → {B_BUFFn} = nom du mon
 *  (résolu live via `_monNickname(battler)` au décodage). */
export function buildMonNickBuff(battler: number): Uint8Array {
  return new Uint8Array([B_BUFF_PLACEHOLDER_BEGIN, B_BUFF_MON_NICK, battler & 0xFF, 0, B_BUFF_EOS]);
}

/** 1:1 décomp `PREPARE_*_NUMBER_BUFFER(buff, n, maxDigits)` → {B_BUFFn} = nombre
 *  (EXP, niveau…). 3 bytes LE (max 16M, > tout gain d'EXP ; pas de bit de signe). */
export function buildNumberBuff(value: number, maxDigits = 0): Uint8Array {
  const v = Math.max(0, Math.floor(value));
  return new Uint8Array([
    B_BUFF_PLACEHOLDER_BEGIN, B_BUFF_NUMBER, 3, maxDigits & 0xFF,
    v & 0xFF, (v >> 8) & 0xFF, (v >> 16) & 0xFF,
    B_BUFF_EOS,
  ]);
}

/** 1:1 décomp `PREPARE_MOVE_BUFFER(buff, move)` → {B_BUFFn} = nom de la capacité (par ID). */
export function buildMoveBuff(moveId: number): Uint8Array {
  return new Uint8Array([B_BUFF_PLACEHOLDER_BEGIN, B_BUFF_MOVE, moveId & 0xFF, (moveId >> 8) & 0xFF, B_BUFF_EOS]);
}

// ─── Resolvers data→nom FR réutilisés par battle-message.ts (décodeur byte-level)
//     Ces resolvers sont 1:1 corrects (= les "bonnes" parties du décodeur) ;
//     seul `_substitutePlaceholders` (JS-string, partiel) est remplacé par le
//     byte-level. Réutilisés ici en attendant la fusion (retrait voie V).
//     + les `_resolve*StringName` (logique du switch BufferStringBattle, 1:1).
export {
  _moveName, _abilityName, _itemName, _typeName, _speciesName,
  _monNickname, _monNicknameWithPrefix, STAT_NAMES_FR,
  _resolveTrainerNameFr, _resolveTrainerClassNameFr,
  _getBattlerSide, _getTrainerOpponentB,
  _resolveIntroMsgStringName, _resolveIntroSendoutStringName,
  _resolveReturnmonStringName, _resolveSwitchinmonStringName,
};

/** Buffer raw-string (= 1:1 décomp StringCopy dans un gBattleTextBuff) → {B_BUFFn}
 *  = la string telle quelle (utile quand on a le NOM FR direct, pas l'ID numérique). */
export function buildStringBuff(s: string): Uint8Array {
  return _encodeStringForBuff(s);
}

// ─── Placeholder substitution (= `{B_X}` markers dans strings.json) ─────────

/** Map placeholder name → resolver function. 1:1 décomp `BattleStringExpand`
 *  (battle_message.c:3046+) cases.
 *
 *  Notre port utilise les noms `{B_X}` de strings.json (= extraits depuis decomp
 *  `data/text/*.inc` ou `src/strings.c`). Si un placeholder n'est pas connu,
 *  on le laisse tel quel pour debug. */
function _substitutePlaceholders(tmpl: string, msgData: BattleMsgData): string {
  return tmpl.replace(/\{B_([A-Z0-9_]+)\}/g, (_match, name: string) => {
    switch (name) {
      case 'BUFF1':       return _decodeTextBuff(msgData.textBuffs[0]);
      case 'BUFF2':       return _decodeTextBuff(msgData.textBuffs[1]);
      case 'BUFF3':       return _decodeTextBuff(msgData.textBuffs[2]);
      case 'ATK_NAME_WITH_PREFIX': return _monNicknameWithPrefix(msgData.battlerAttacker);
      case 'DEF_NAME_WITH_PREFIX': return _monNicknameWithPrefix(msgData.battlerTarget);
      case 'SCR_ACTIVE_NAME_WITH_PREFIX':
        // 1:1 décomp battle_message.c:2533-2534 : utilise gBattleScripting.battler.
        return _monNicknameWithPrefix(msgData.scrActive);
      case 'ACTIVE_NAME_WITH_PREFIX':
        // 1:1 décomp battle_message.c:2530-2531 : utilise gActiveBattler.
        return _monNicknameWithPrefix(gActiveBattler);
      case 'EFF_NAME_WITH_PREFIX':
        // 1:1 décomp battle_message.c:2527-2528 : utilise gEffectBattler,
        // PAS gPotentialItemEffectBattler (= 2 globals distincts).
        return _monNicknameWithPrefix(gEffectBattler);
      case 'ATK_NAME':    return _monNickname(msgData.battlerAttacker);
      case 'DEF_NAME':    return _monNickname(msgData.battlerTarget);
      case 'CURRENT_MOVE':return _moveName(msgData.currentMove);
      case 'LAST_MOVE':   return _moveName(msgData.originallyUsedMove);
      case 'LAST_ITEM':   return _itemName(msgData.lastItem);
      case 'LAST_ABILITY':return _abilityName(msgData.lastAbility);
      case 'ATK_ABILITY': return _abilityName(msgData.abilities[msgData.battlerAttacker] ?? 0);
      case 'DEF_ABILITY': return _abilityName(msgData.abilities[msgData.battlerTarget] ?? 0);
      case 'SCR_ACTIVE_ABILITY':
        return _abilityName(msgData.abilities[msgData.scrActive] ?? 0);
      case 'EFF_ABILITY':
        // 1:1 décomp battle_message.c:2580-2582 : utilise gEffectBattler.
        return _abilityName(msgData.abilities[gEffectBattler] ?? 0);
      case 'PLAYER_NAME': {
        // 1:1 décomp `gSaveBlock2Ptr->playerName`.
        return GetPlayerNameString() || 'Joueur';
      }
      case 'TRAINER1_CLASS':
        return _resolveTrainerClassNameFr(gTrainerBattleOpponent_A);
      case 'TRAINER1_NAME':
        return _resolveTrainerNameFr(gTrainerBattleOpponent_A);
      case 'TRAINER2_CLASS':
        // 1:1 décomp : `BATTLE_TYPE_TWO_OPPONENTS` → opponent_B.
        return _resolveTrainerClassNameFr(_getTrainerOpponentB());
      case 'TRAINER2_NAME':
        return _resolveTrainerNameFr(_getTrainerOpponentB());
      case 'PARTNER_CLASS':
      case 'PARTNER_NAME':
        // Partner trainer (Steven multi battle) Phase 1.4 K — wire post Frontier port.
        return `[${name}]`;
      // 1:1 décomp B_TXT_PLAYER_MON1_NAME (0x5) / OPPONENT_MON1_NAME (0x6) / etc.
      // (battle_message.h:16-23). Pour single battle : MON1 = battler 0/1, MON2
      // = battler 2/3.
      case 'PLAYER_MON1_NAME':    return _monNickname(0);
      case 'OPPONENT_MON1_NAME':  return _monNickname(1);
      case 'PLAYER_MON2_NAME':    return _monNickname(2);
      case 'OPPONENT_MON2_NAME':  return _monNickname(3);
      case 'LINK_PLAYER_MON1_NAME':
      case 'LINK_OPPONENT_MON1_NAME':
      case 'LINK_PLAYER_MON2_NAME':
      case 'LINK_OPPONENT_MON2_NAME':
        // Link multi-battle Phase 1 deferred — fallback à single-battle équivalent.
        return _monNickname(name.includes('OPPONENT') ? (name.includes('MON2') ? 3 : 1) : (name.includes('MON2') ? 2 : 0));
      case 'ATK_NAME_WITH_PREFIX_MON1': return _monNicknameWithPrefix(msgData.battlerAttacker);
      case 'ATK_PARTNER_NAME':    return _monNickname((msgData.battlerAttacker & ~1) | 2);
      // Trainer string templates (1:1 décomp B_TXT_TRAINER1_LOSE_TEXT/WIN_TEXT etc.)
      case 'TRAINER1_LOSE_TEXT':
      case 'TRAINER1_WIN_TEXT':
      case 'TRAINER2_LOSE_TEXT':
      case 'TRAINER2_WIN_TEXT':
        return `[${name}]`;
      case 'LINK_PLAYER_NAME':
      case 'LINK_PARTNER_NAME':
      case 'LINK_OPPONENT1_NAME':
      case 'LINK_OPPONENT2_NAME':
      case 'LINK_SCR_TRAINER_NAME':
        // Link Phase 1 deferred — fallback player.
        return GetPlayerNameString() || 'Joueur';
      case 'PC_CREATOR_NAME':
        return 'BILL';
      // Prefix placeholders 1:1 décomp battle_message.c:2704-2728 :
      // - PLAYER side (= ATK_PREFIX*) → "ami" (= sText_AllyPkmnPrefix)
      // - OPPONENT side → "ennemi" (= sText_FoePkmnPrefix2/3/4)
      // Templates utilisent pour différencier "du POKéMON ami" vs "du POKéMON ennemi".
      case 'ATK_PREFIX1': case 'ATK_PREFIX2': case 'ATK_PREFIX3':
        return (msgData.battlerAttacker & 1) === 0 ? 'ami' : 'ennemi';
      case 'DEF_PREFIX1': case 'DEF_PREFIX2': case 'DEF_PREFIX3':
        return (msgData.battlerTarget & 1) === 0 ? 'ami' : 'ennemi';
      default:
        return `{B_${name}}`;
    }
  });
}

// ─── Public API ─────────────────────────────────────────────────────────────

// Expose pour battle-controller-player lazy lookup (= éviter cycle ESM).
// Lazy via getter pour résolution au call time (= module fully initialized).
(globalThis as { __battleStringDecoderApi?: object }).__battleStringDecoderApi = {
  get decodeBattleString() { return decodeBattleString; },
  // Substitue les placeholders {B_X} d'une string template (= gText_WhatWillPkmnDo
  // "Que doit faire {B_ACTIVE_NAME_WITH_PREFIX}?", gText_BattleMenu, etc.) en
  // réutilisant _substitutePlaceholders. Le décodeur principal travaille par
  // stringId ; ce wrapper accepte une string déjà connue + msgData snapshot.
  expandPlaceholders: (src: string, msgData: BattleMsgData) => _substitutePlaceholders(src, msgData),
};

/** Décode stringId + msgData → French text 1:1 décomp `BufferStringBattle`
 *  (battle_message.c:1968-2950) — partial port Phase 1.4 J first pass.
 *
 *  Phase 1.4 J first pass : special cases stringIds 0..11 retournent le default
 *  path "single wild battle" (sText_WildPkmnAppeared, sText_GoPkmn, etc.).
 *  Future : full switch + WILD/TRAINER/LINK/DOUBLE branches. */
export function decodeBattleString(stringId: number, msgData: BattleMsgData): string {
  let sTextName: string | undefined;

  // ─── Special-case stringIds 0..11 (= BufferStringBattle switch) ──────
  // Certains cases pre-populate gBattleTextBuff2 avec data avant lookup
  // (= 1:1 décomp battle_message.c:2166-2176 case STRINGID_USEDMOVE).
  // Notre port : pre-fill le buffer correspondant dans msgData.textBuffs.
  switch (stringId) {
    case 0:
      // 1:1 décomp battle_message.c:1997-2044 STRINGID_INTROMSG.
      sTextName = _resolveIntroMsgStringName();
      break;
    case 1:
      // 1:1 décomp battle_message.c:2045-2088 STRINGID_INTROSENDOUT.
      sTextName = _resolveIntroSendoutStringName();
      break;
    case 2:
      // 1:1 décomp battle_message.c:2090-2116 STRINGID_RETURNMON.
      sTextName = _resolveReturnmonStringName();
      break;
    case 3:
      // 1:1 décomp battle_message.c:2117-2165 STRINGID_SWITCHINMON.
      sTextName = _resolveSwitchinmonStringName();
      break;
    case 4: {
      // 1:1 décomp battle_message.c:2166-2176 : pre-fill BUFF2 avec
      // gMoveNames[currentMove] (= move name FR direct, pas via B_BUFF_MOVE tag).
      sTextName = 'sText_AttackerUsedX';
      const moveName = _moveName(msgData.currentMove);
      // Write directement le moveName en TextBuff2 (= bytes UTF-8 puis EOS).
      // Notre port utilise un encoding ASCII simplifié dans le buff (= chaque char
      // est son code point, puis 0xFF EOS) ; le decoder _decodeTextBuff lit byte
      // par byte. Pour shortcut : on ne décode pas via _decodeTextBuff mais on
      // substitue directement le moveName quand placeholder {B_BUFF2} apparaît.
      // 1:1 décomp `ChooseTypeOfMoveUsedString(gBattleTextBuff2)` (battle_message.c:2174 +
      // 2999-3033) : append "!" APRÈS le nom du move dans BUFF2 (le template
      // sText_AttackerUsedX:420 ne contient PAS le "!"). En FR les 5 sText_ExclamationMark*
      // (battle_message.c:421-425) valent toutes "!" → on append "!" directement.
      msgData.textBuffs[1] = _encodeStringForBuff(moveName + '!');
      break;
    }
    case 5: sTextName = ''; break;                              // STRINGID_BATTLEEND (= no text)
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
      sTextName = ''; break;  // gap (no string assigned in decomp)
    default:
      sTextName = BATTLE_STRINGS_TABLE[stringId];
  }

  if (!sTextName) {
    const debugName = STRINGID_NAMES[stringId] ?? `STRINGID_${stringId}`;
    return `[${debugName}]`;
  }

  const tmpl = getString(sTextName);
  if (tmpl.startsWith('[MISSING:')) {
    return `[${sTextName} missing]`;
  }
  return _substitutePlaceholders(tmpl, msgData);
}

// ─── BufferStringBattle special-case branch helpers ────────────────────────
//     1:1 décomp src/battle_message.c:1997-2165.

/** 1:1 décomp STRINGID_INTROMSG (= "Un X sauvage apparaît!" / trainer variants). */
function _resolveIntroMsgStringName(): string {
  if (gBattleTypeFlags & BATTLE_TYPE_TRAINER) {
    if (gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK)) {
      if (gBattleTypeFlags & BATTLE_TYPE_TOWER_LINK_MULTI) {
        return 'sText_TwoTrainersWantToBattle';
      }
      if (gBattleTypeFlags & BATTLE_TYPE_MULTI) {
        if (gBattleTypeFlags & BATTLE_TYPE_RECORDED) {
          return 'sText_TwoLinkTrainersWantToBattlePause';
        }
        return 'sText_TwoLinkTrainersWantToBattle';
      }
      if (gTrainerBattleOpponent_A === TRAINER_UNION_ROOM) {
        return 'sText_Trainer1WantsToBattle';
      }
      if (gBattleTypeFlags & BATTLE_TYPE_RECORDED) {
        return 'sText_LinkTrainerWantsToBattlePause';
      }
      return 'sText_LinkTrainerWantsToBattle';
    }
    if (gBattleTypeFlags & BATTLE_TYPE_INGAME_PARTNER) {
      return 'sText_TwoTrainersWantToBattle';
    }
    if (gBattleTypeFlags & BATTLE_TYPE_TWO_OPPONENTS) {
      return 'sText_TwoTrainersWantToBattle';
    }
    return 'sText_Trainer1WantsToBattle';
  }
  if (gBattleTypeFlags & BATTLE_TYPE_LEGENDARY) {
    return 'sText_LegendaryPkmnAppeared';
  }
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    return 'sText_TwoWildPkmnAppeared';
  }
  if (gBattleTypeFlags & BATTLE_TYPE_WALLY_TUTORIAL) {
    return 'sText_WildPkmnAppearedPause';
  }
  return 'sText_WildPkmnAppeared';
}

/** 1:1 décomp STRINGID_INTROSENDOUT (= "X, à toi !" / trainer sends mon). */
function _resolveIntroSendoutStringName(): string {
  if (_getBattlerSide(gActiveBattler) === 0 /* B_SIDE_PLAYER */) {
    if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
      if (gBattleTypeFlags & BATTLE_TYPE_INGAME_PARTNER) {
        return 'sText_InGamePartnerSentOutZGoN';
      }
      if (gBattleTypeFlags & BATTLE_TYPE_TWO_OPPONENTS) {
        return 'sText_GoTwoPkmn';
      }
      if (gBattleTypeFlags & BATTLE_TYPE_MULTI) {
        return 'sText_LinkPartnerSentOutPkmnGoPkmn';
      }
      return 'sText_GoTwoPkmn';
    }
    return 'sText_GoPkmn';
  }
  // OPPONENT side.
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    if (gBattleTypeFlags & BATTLE_TYPE_TWO_OPPONENTS) {
      return 'sText_TwoTrainersSentPkmn';
    }
    if (gBattleTypeFlags & BATTLE_TYPE_TOWER_LINK_MULTI) {
      return 'sText_TwoTrainersSentPkmn';
    }
    if (gBattleTypeFlags & BATTLE_TYPE_MULTI) {
      return 'sText_TwoLinkTrainersSentOutPkmn';
    }
    if (gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK)) {
      return 'sText_LinkTrainerSentOutTwoPkmn';
    }
    return 'sText_Trainer1SentOutTwoPkmn';
  }
  if (!(gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK))) {
    return 'sText_Trainer1SentOutPkmn';
  }
  if (gTrainerBattleOpponent_A === TRAINER_UNION_ROOM) {
    return 'sText_Trainer1SentOutPkmn';
  }
  return 'sText_LinkTrainerSentOutPkmn';
}

/** 1:1 décomp STRINGID_RETURNMON (= "X, reviens !" pour rappel ball). */
function _resolveReturnmonStringName(): string {
  if (_getBattlerSide(gActiveBattler) === 0 /* B_SIDE_PLAYER */) {
    const hpScale = gBattleStruct.hpScale ?? 0;
    if (hpScale === 0) return 'sText_PkmnThatsEnough';
    if (hpScale === 1 || (gBattleTypeFlags & BATTLE_TYPE_DOUBLE)) {
      return 'sText_PkmnComeBack';
    }
    if (hpScale === 2) return 'sText_PkmnOkComeBack';
    return 'sText_PkmnGoodComeBack';
  }
  if (gTrainerBattleOpponent_A === TRAINER_LINK_OPPONENT
      || (gBattleTypeFlags & BATTLE_TYPE_RECORDED_LINK)) {
    if (gBattleTypeFlags & BATTLE_TYPE_MULTI) {
      return 'sText_LinkTrainer2WithdrewPkmn';
    }
    return 'sText_LinkTrainer1WithdrewPkmn';
  }
  return 'sText_Trainer1WithdrewPkmn';
}

/** 1:1 décomp STRINGID_SWITCHINMON (= switch-in mid-battle). */
function _resolveSwitchinmonStringName(): string {
  if (_getBattlerSide(gBattleScripting.battler) === 0 /* B_SIDE_PLAYER */) {
    const hpScale = gBattleStruct.hpScale ?? 0;
    if (hpScale === 0 || (gBattleTypeFlags & BATTLE_TYPE_DOUBLE)) {
      return 'sText_GoPkmn2';
    }
    if (hpScale === 1) return 'sText_DoItPkmn';
    if (hpScale === 2) return 'sText_GoForItPkmn';
    return 'sText_YourFoesWeakGetEmPkmn';
  }
  // OPPONENT side switch-in.
  if (gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK)) {
    if (gBattleTypeFlags & BATTLE_TYPE_TOWER_LINK_MULTI) {
      if (gBattleScripting.battler === 1) return 'sText_Trainer1SentOutPkmn2';
      return 'sText_Trainer2SentOutPkmn';
    }
    if (gBattleTypeFlags & BATTLE_TYPE_MULTI) {
      return 'sText_LinkTrainerMultiSentOutPkmn';
    }
    if (gTrainerBattleOpponent_A === TRAINER_UNION_ROOM) {
      return 'sText_Trainer1SentOutPkmn2';
    }
    return 'sText_LinkTrainerSentOutPkmn2';
  }
  if (gBattleTypeFlags & BATTLE_TYPE_TWO_OPPONENTS) {
    if (gBattleScripting.battler === 1) return 'sText_Trainer1SentOutPkmn2';
    return 'sText_Trainer2SentOutPkmn';
  }
  return 'sText_Trainer1SentOutPkmn2';
}

/** 1:1 décomp `StringCopy` : encode une string en bytes ASCII puis EOS=0xFF.
 *  Utilisé par les special cases dans BufferStringBattle pour pre-fill un
 *  gBattleTextBuffN avec data dynamique (= move name / type name / etc.).
 *  Notre port utilise un encoding simplifié : un byte par char (= ASCII / latin-1).
 *  Le decoder _decodeTextBuff lit ces bytes directement. */
function _encodeStringForBuff(s: string): Uint8Array {
  // Account pour EOS terminator + initial bytes.
  const buf = new Uint8Array(Math.max(16, s.length + 1));
  for (let i = 0; i < s.length && i < buf.length - 1; i++) {
    buf[i] = s.charCodeAt(i) & 0xFF;
  }
  buf[Math.min(s.length, buf.length - 1)] = 0xFF;  // EOS
  return buf;
}

/** Strip GBA control codes (= {WAIT_SE}, {PAUSE 32}, \n, \p, etc.) pour
 *  affichage simple (= ShowFieldMessage). Le rendu réel utilise un text printer
 *  qui interprète ces codes. */
export function stripGbaControlCodes(text: string): string {
  return text
    .replace(/\{WAIT_SE\}/g, '')
    .replace(/\{PLAY_SE [A-Z0-9_]+\}/g, '')   // déclencheur sonore (SE joué ailleurs, pas affiché)
    .replace(/\{PLAY_BGM [A-Z0-9_]+\}/g, '')
    .replace(/\{PAUSE_UNTIL_PRESS\}/g, '')
    .replace(/\{PAUSE \d+\}/g, '')
    .replace(/\{COLOR [A-Z_]+\}/g, '')
    .replace(/\\p/g, '\n')   // line break + pause
    .replace(/\\n/g, '\n')   // line break
    .replace(/\\l/g, '\n')   // scroll line
    .replace(/\\$/g, '');
}

/** Comme `stripGbaControlCodes` MAIS pour le rendu via le text printer animé du
 *  combat : PRÉSERVE les codes que `encodeStringForFont` interprète et qui pilotent
 *  le timing 1:1 du message :
 *    - `\p` → CHAR_PROMPT_CLEAR  = affiche le ▼ + ATTEND A (puis clear) — 1:1 décomp
 *             (ex: `sText_WildPkmnAppeared = "...apparaît!\p"`, battle_message.c:382).
 *    - `\l` → CHAR_PROMPT_SCROLL = ▼ + attend A + scroll.
 *    - `{PAUSE N}` → EXT_CTRL_CODE_PAUSE = auto-avance après N frames (PAS d'attente A,
 *             ex: `sText_WildPkmnAppearedPause`).
 *    - `\n` → newline.
 *  Strip uniquement les codes NON gérés par l'encodeur (sons/BGM/color/pause-until-press)
 *  qui s'afficheraient littéralement. C'est le `stripGbaControlCodes` qui jetait le
 *  comportement `\p` (→ `\n`) → plus de ▼ ni d'attente A (user 2026-05-31). */
export function battleStringToPrinterText(text: string): string {
  return text
    .replace(/\{WAIT_SE\}/g, '')
    .replace(/\{PLAY_SE [A-Z0-9_]+\}/g, '')
    .replace(/\{PLAY_BGM [A-Z0-9_]+\}/g, '')
    .replace(/\{COLOR [A-Z_]+\}/g, '')
    // PRÉSERVÉ aussi : {PAUSE_UNTIL_PRESS} (= attente A, ▼) — l'encodeur du printer
    // le gère désormais (EXT_CTRL_CODE_PAUSE_UNTIL_PRESS) ; le stripper rendait
    // ces messages auto-avancés à tort (user 2026-05-31 : "des textes non auto").
    .replace(/\\$/g, '');   // backslash résiduel en fin (≠ \p qui est \\+p, préservé)
}

// ════════════════════════════════════════════════════════════════════════
// INLINE 1:1 : gBattleStringsTable + STRINGID_NAMES (=battle_message.c). Auto-gen
// extract-battle-strings-table.mjs RETIRE (option A user 2026-06-28) : table 1:1
// decomp inline comme dans battle_message.c, maintenue a la main desormais.
// ════════════════════════════════════════════════════════════════════════
export const BATTLESTRINGS_TABLE_START = 12;

/** 1:1 décomp `BATTLESTRINGS_COUNT` (battle_string_ids.h:382). */
export const BATTLESTRINGS_COUNT = 381;

/** Mapping id (number) → "STRINGID_X" name (debug). */
export const STRINGID_NAMES: Record<number, string> = {
  0: "STRINGID_INTROMSG",
  1: "STRINGID_INTROSENDOUT",
  2: "STRINGID_RETURNMON",
  3: "STRINGID_SWITCHINMON",
  4: "STRINGID_USEDMOVE",
  5: "STRINGID_BATTLEEND",
  12: "STRINGID_TRAINER1LOSETEXT",
  13: "STRINGID_PKMNGAINEDEXP",
  14: "STRINGID_PKMNGREWTOLV",
  15: "STRINGID_PKMNLEARNEDMOVE",
  16: "STRINGID_TRYTOLEARNMOVE1",
  17: "STRINGID_TRYTOLEARNMOVE2",
  18: "STRINGID_TRYTOLEARNMOVE3",
  19: "STRINGID_PKMNFORGOTMOVE",
  20: "STRINGID_STOPLEARNINGMOVE",
  21: "STRINGID_DIDNOTLEARNMOVE",
  22: "STRINGID_PKMNLEARNEDMOVE2",
  23: "STRINGID_ATTACKMISSED",
  24: "STRINGID_PKMNPROTECTEDITSELF",
  25: "STRINGID_STATSWONTINCREASE2",
  26: "STRINGID_AVOIDEDDAMAGE",
  27: "STRINGID_ITDOESNTAFFECT",
  28: "STRINGID_ATTACKERFAINTED",
  29: "STRINGID_TARGETFAINTED",
  30: "STRINGID_PLAYERGOTMONEY",
  31: "STRINGID_PLAYERWHITEOUT",
  32: "STRINGID_PLAYERWHITEOUT2",
  33: "STRINGID_PREVENTSESCAPE",
  34: "STRINGID_HITXTIMES",
  35: "STRINGID_PKMNFELLASLEEP",
  36: "STRINGID_PKMNMADESLEEP",
  37: "STRINGID_PKMNALREADYASLEEP",
  38: "STRINGID_PKMNALREADYASLEEP2",
  39: "STRINGID_PKMNWASNTAFFECTED",
  40: "STRINGID_PKMNWASPOISONED",
  41: "STRINGID_PKMNPOISONEDBY",
  42: "STRINGID_PKMNHURTBYPOISON",
  43: "STRINGID_PKMNALREADYPOISONED",
  44: "STRINGID_PKMNBADLYPOISONED",
  45: "STRINGID_PKMNENERGYDRAINED",
  46: "STRINGID_PKMNWASBURNED",
  47: "STRINGID_PKMNBURNEDBY",
  48: "STRINGID_PKMNHURTBYBURN",
  49: "STRINGID_PKMNWASFROZEN",
  50: "STRINGID_PKMNFROZENBY",
  51: "STRINGID_PKMNISFROZEN",
  52: "STRINGID_PKMNWASDEFROSTED",
  53: "STRINGID_PKMNWASDEFROSTED2",
  54: "STRINGID_PKMNWASDEFROSTEDBY",
  55: "STRINGID_PKMNWASPARALYZED",
  56: "STRINGID_PKMNWASPARALYZEDBY",
  57: "STRINGID_PKMNISPARALYZED",
  58: "STRINGID_PKMNISALREADYPARALYZED",
  59: "STRINGID_PKMNHEALEDPARALYSIS",
  60: "STRINGID_PKMNDREAMEATEN",
  61: "STRINGID_STATSWONTINCREASE",
  62: "STRINGID_STATSWONTDECREASE",
  63: "STRINGID_TEAMSTOPPEDWORKING",
  64: "STRINGID_FOESTOPPEDWORKING",
  65: "STRINGID_PKMNISCONFUSED",
  66: "STRINGID_PKMNHEALEDCONFUSION",
  67: "STRINGID_PKMNWASCONFUSED",
  68: "STRINGID_PKMNALREADYCONFUSED",
  69: "STRINGID_PKMNFELLINLOVE",
  70: "STRINGID_PKMNINLOVE",
  71: "STRINGID_PKMNIMMOBILIZEDBYLOVE",
  72: "STRINGID_PKMNBLOWNAWAY",
  73: "STRINGID_PKMNCHANGEDTYPE",
  74: "STRINGID_PKMNFLINCHED",
  75: "STRINGID_PKMNREGAINEDHEALTH",
  76: "STRINGID_PKMNHPFULL",
  77: "STRINGID_PKMNRAISEDSPDEF",
  78: "STRINGID_PKMNRAISEDDEF",
  79: "STRINGID_PKMNCOVEREDBYVEIL",
  80: "STRINGID_PKMNUSEDSAFEGUARD",
  81: "STRINGID_PKMNSAFEGUARDEXPIRED",
  82: "STRINGID_PKMNWENTTOSLEEP",
  83: "STRINGID_PKMNSLEPTHEALTHY",
  84: "STRINGID_PKMNWHIPPEDWHIRLWIND",
  85: "STRINGID_PKMNTOOKSUNLIGHT",
  86: "STRINGID_PKMNLOWEREDHEAD",
  87: "STRINGID_PKMNISGLOWING",
  88: "STRINGID_PKMNFLEWHIGH",
  89: "STRINGID_PKMNDUGHOLE",
  90: "STRINGID_PKMNSQUEEZEDBYBIND",
  91: "STRINGID_PKMNTRAPPEDINVORTEX",
  92: "STRINGID_PKMNWRAPPEDBY",
  93: "STRINGID_PKMNCLAMPED",
  94: "STRINGID_PKMNHURTBY",
  95: "STRINGID_PKMNFREEDFROM",
  96: "STRINGID_PKMNCRASHED",
  97: "STRINGID_PKMNSHROUDEDINMIST",
  98: "STRINGID_PKMNPROTECTEDBYMIST",
  99: "STRINGID_PKMNGETTINGPUMPED",
  100: "STRINGID_PKMNHITWITHRECOIL",
  101: "STRINGID_PKMNPROTECTEDITSELF2",
  102: "STRINGID_PKMNBUFFETEDBYSANDSTORM",
  103: "STRINGID_PKMNPELTEDBYHAIL",
  104: "STRINGID_PKMNSEEDED",
  105: "STRINGID_PKMNEVADEDATTACK",
  106: "STRINGID_PKMNSAPPEDBYLEECHSEED",
  107: "STRINGID_PKMNFASTASLEEP",
  108: "STRINGID_PKMNWOKEUP",
  109: "STRINGID_PKMNUPROARKEPTAWAKE",
  110: "STRINGID_PKMNWOKEUPINUPROAR",
  111: "STRINGID_PKMNCAUSEDUPROAR",
  112: "STRINGID_PKMNMAKINGUPROAR",
  113: "STRINGID_PKMNCALMEDDOWN",
  114: "STRINGID_PKMNCANTSLEEPINUPROAR",
  115: "STRINGID_PKMNSTOCKPILED",
  116: "STRINGID_PKMNCANTSTOCKPILE",
  117: "STRINGID_PKMNCANTSLEEPINUPROAR2",
  118: "STRINGID_UPROARKEPTPKMNAWAKE",
  119: "STRINGID_PKMNSTAYEDAWAKEUSING",
  120: "STRINGID_PKMNSTORINGENERGY",
  121: "STRINGID_PKMNUNLEASHEDENERGY",
  122: "STRINGID_PKMNFATIGUECONFUSION",
  123: "STRINGID_PLAYERPICKEDUPMONEY",
  124: "STRINGID_PKMNUNAFFECTED",
  125: "STRINGID_PKMNTRANSFORMEDINTO",
  126: "STRINGID_PKMNMADESUBSTITUTE",
  127: "STRINGID_PKMNHASSUBSTITUTE",
  128: "STRINGID_SUBSTITUTEDAMAGED",
  129: "STRINGID_PKMNSUBSTITUTEFADED",
  130: "STRINGID_PKMNMUSTRECHARGE",
  131: "STRINGID_PKMNRAGEBUILDING",
  132: "STRINGID_PKMNMOVEWASDISABLED",
  133: "STRINGID_PKMNMOVEISDISABLED",
  134: "STRINGID_PKMNMOVEDISABLEDNOMORE",
  135: "STRINGID_PKMNGOTENCORE",
  136: "STRINGID_PKMNENCOREENDED",
  137: "STRINGID_PKMNTOOKAIM",
  138: "STRINGID_PKMNSKETCHEDMOVE",
  139: "STRINGID_PKMNTRYINGTOTAKEFOE",
  140: "STRINGID_PKMNTOOKFOE",
  141: "STRINGID_PKMNREDUCEDPP",
  142: "STRINGID_PKMNSTOLEITEM",
  143: "STRINGID_TARGETCANTESCAPENOW",
  144: "STRINGID_PKMNFELLINTONIGHTMARE",
  145: "STRINGID_PKMNLOCKEDINNIGHTMARE",
  146: "STRINGID_PKMNLAIDCURSE",
  147: "STRINGID_PKMNAFFLICTEDBYCURSE",
  148: "STRINGID_SPIKESSCATTERED",
  149: "STRINGID_PKMNHURTBYSPIKES",
  150: "STRINGID_PKMNIDENTIFIED",
  151: "STRINGID_PKMNPERISHCOUNTFELL",
  152: "STRINGID_PKMNBRACEDITSELF",
  153: "STRINGID_PKMNENDUREDHIT",
  154: "STRINGID_MAGNITUDESTRENGTH",
  155: "STRINGID_PKMNCUTHPMAXEDATTACK",
  156: "STRINGID_PKMNCOPIEDSTATCHANGES",
  157: "STRINGID_PKMNGOTFREE",
  158: "STRINGID_PKMNSHEDLEECHSEED",
  159: "STRINGID_PKMNBLEWAWAYSPIKES",
  160: "STRINGID_PKMNFLEDFROMBATTLE",
  161: "STRINGID_PKMNFORESAWATTACK",
  162: "STRINGID_PKMNTOOKATTACK",
  163: "STRINGID_PKMNATTACK",
  164: "STRINGID_PKMNCENTERATTENTION",
  165: "STRINGID_PKMNCHARGINGPOWER",
  166: "STRINGID_NATUREPOWERTURNEDINTO",
  167: "STRINGID_PKMNSTATUSNORMAL",
  168: "STRINGID_PKMNHASNOMOVESLEFT",
  169: "STRINGID_PKMNSUBJECTEDTOTORMENT",
  170: "STRINGID_PKMNCANTUSEMOVETORMENT",
  171: "STRINGID_PKMNTIGHTENINGFOCUS",
  172: "STRINGID_PKMNFELLFORTAUNT",
  173: "STRINGID_PKMNCANTUSEMOVETAUNT",
  174: "STRINGID_PKMNREADYTOHELP",
  175: "STRINGID_PKMNSWITCHEDITEMS",
  176: "STRINGID_PKMNCOPIEDFOE",
  177: "STRINGID_PKMNMADEWISH",
  178: "STRINGID_PKMNWISHCAMETRUE",
  179: "STRINGID_PKMNPLANTEDROOTS",
  180: "STRINGID_PKMNABSORBEDNUTRIENTS",
  181: "STRINGID_PKMNANCHOREDITSELF",
  182: "STRINGID_PKMNWASMADEDROWSY",
  183: "STRINGID_PKMNKNOCKEDOFF",
  184: "STRINGID_PKMNSWAPPEDABILITIES",
  185: "STRINGID_PKMNSEALEDOPPONENTMOVE",
  186: "STRINGID_PKMNCANTUSEMOVESEALED",
  187: "STRINGID_PKMNWANTSGRUDGE",
  188: "STRINGID_PKMNLOSTPPGRUDGE",
  189: "STRINGID_PKMNSHROUDEDITSELF",
  190: "STRINGID_PKMNMOVEBOUNCED",
  191: "STRINGID_PKMNWAITSFORTARGET",
  192: "STRINGID_PKMNSNATCHEDMOVE",
  193: "STRINGID_PKMNMADEITRAIN",
  194: "STRINGID_PKMNRAISEDSPEED",
  195: "STRINGID_PKMNPROTECTEDBY",
  196: "STRINGID_PKMNPREVENTSUSAGE",
  197: "STRINGID_PKMNRESTOREDHPUSING",
  198: "STRINGID_PKMNCHANGEDTYPEWITH",
  199: "STRINGID_PKMNPREVENTSPARALYSISWITH",
  200: "STRINGID_PKMNPREVENTSROMANCEWITH",
  201: "STRINGID_PKMNPREVENTSPOISONINGWITH",
  202: "STRINGID_PKMNPREVENTSCONFUSIONWITH",
  203: "STRINGID_PKMNRAISEDFIREPOWERWITH",
  204: "STRINGID_PKMNANCHORSITSELFWITH",
  205: "STRINGID_PKMNCUTSATTACKWITH",
  206: "STRINGID_PKMNPREVENTSSTATLOSSWITH",
  207: "STRINGID_PKMNHURTSWITH",
  208: "STRINGID_PKMNTRACED",
  209: "STRINGID_STATSHARPLY",
  210: "STRINGID_STATROSE",
  211: "STRINGID_STATHARSHLY",
  212: "STRINGID_STATFELL",
  213: "STRINGID_ATTACKERSSTATROSE",
  214: "STRINGID_DEFENDERSSTATROSE",
  215: "STRINGID_ATTACKERSSTATFELL",
  216: "STRINGID_DEFENDERSSTATFELL",
  217: "STRINGID_CRITICALHIT",
  218: "STRINGID_ONEHITKO",
  219: "STRINGID_123POOF",
  220: "STRINGID_ANDELLIPSIS",
  221: "STRINGID_NOTVERYEFFECTIVE",
  222: "STRINGID_SUPEREFFECTIVE",
  223: "STRINGID_GOTAWAYSAFELY",
  224: "STRINGID_WILDPKMNFLED",
  225: "STRINGID_NORUNNINGFROMTRAINERS",
  226: "STRINGID_CANTESCAPE",
  227: "STRINGID_DONTLEAVEBIRCH",
  228: "STRINGID_BUTNOTHINGHAPPENED",
  229: "STRINGID_BUTITFAILED",
  230: "STRINGID_ITHURTCONFUSION",
  231: "STRINGID_MIRRORMOVEFAILED",
  232: "STRINGID_STARTEDTORAIN",
  233: "STRINGID_DOWNPOURSTARTED",
  234: "STRINGID_RAINCONTINUES",
  235: "STRINGID_DOWNPOURCONTINUES",
  236: "STRINGID_RAINSTOPPED",
  237: "STRINGID_SANDSTORMBREWED",
  238: "STRINGID_SANDSTORMRAGES",
  239: "STRINGID_SANDSTORMSUBSIDED",
  240: "STRINGID_SUNLIGHTGOTBRIGHT",
  241: "STRINGID_SUNLIGHTSTRONG",
  242: "STRINGID_SUNLIGHTFADED",
  243: "STRINGID_STARTEDHAIL",
  244: "STRINGID_HAILCONTINUES",
  245: "STRINGID_HAILSTOPPED",
  246: "STRINGID_FAILEDTOSPITUP",
  247: "STRINGID_FAILEDTOSWALLOW",
  248: "STRINGID_WINDBECAMEHEATWAVE",
  249: "STRINGID_STATCHANGESGONE",
  250: "STRINGID_COINSSCATTERED",
  251: "STRINGID_TOOWEAKFORSUBSTITUTE",
  252: "STRINGID_SHAREDPAIN",
  253: "STRINGID_BELLCHIMED",
  254: "STRINGID_FAINTINTHREE",
  255: "STRINGID_NOPPLEFT",
  256: "STRINGID_BUTNOPPLEFT",
  257: "STRINGID_PLAYERUSEDITEM",
  258: "STRINGID_WALLYUSEDITEM",
  259: "STRINGID_TRAINERBLOCKEDBALL",
  260: "STRINGID_DONTBEATHIEF",
  261: "STRINGID_ITDODGEDBALL",
  262: "STRINGID_YOUMISSEDPKMN",
  263: "STRINGID_PKMNBROKEFREE",
  264: "STRINGID_ITAPPEAREDCAUGHT",
  265: "STRINGID_AARGHALMOSTHADIT",
  266: "STRINGID_SHOOTSOCLOSE",
  267: "STRINGID_GOTCHAPKMNCAUGHTPLAYER",
  268: "STRINGID_GOTCHAPKMNCAUGHTWALLY",
  269: "STRINGID_GIVENICKNAMECAPTURED",
  270: "STRINGID_PKMNSENTTOPC",
  271: "STRINGID_PKMNDATAADDEDTODEX",
  272: "STRINGID_ITISRAINING",
  273: "STRINGID_SANDSTORMISRAGING",
  274: "STRINGID_CANTESCAPE2",
  275: "STRINGID_PKMNIGNORESASLEEP",
  276: "STRINGID_PKMNIGNOREDORDERS",
  277: "STRINGID_PKMNBEGANTONAP",
  278: "STRINGID_PKMNLOAFING",
  279: "STRINGID_PKMNWONTOBEY",
  280: "STRINGID_PKMNTURNEDAWAY",
  281: "STRINGID_PKMNPRETENDNOTNOTICE",
  282: "STRINGID_ENEMYABOUTTOSWITCHPKMN",
  283: "STRINGID_CREPTCLOSER",
  284: "STRINGID_CANTGETCLOSER",
  285: "STRINGID_PKMNWATCHINGCAREFULLY",
  286: "STRINGID_PKMNCURIOUSABOUTX",
  287: "STRINGID_PKMNENTHRALLEDBYX",
  288: "STRINGID_PKMNIGNOREDX",
  289: "STRINGID_THREWPOKEBLOCKATPKMN",
  290: "STRINGID_OUTOFSAFARIBALLS",
  291: "STRINGID_PKMNSITEMCUREDPARALYSIS",
  292: "STRINGID_PKMNSITEMCUREDPOISON",
  293: "STRINGID_PKMNSITEMHEALEDBURN",
  294: "STRINGID_PKMNSITEMDEFROSTEDIT",
  295: "STRINGID_PKMNSITEMWOKEIT",
  296: "STRINGID_PKMNSITEMSNAPPEDOUT",
  297: "STRINGID_PKMNSITEMCUREDPROBLEM",
  298: "STRINGID_PKMNSITEMRESTOREDHEALTH",
  299: "STRINGID_PKMNSITEMRESTOREDPP",
  300: "STRINGID_PKMNSITEMRESTOREDSTATUS",
  301: "STRINGID_PKMNSITEMRESTOREDHPALITTLE",
  302: "STRINGID_ITEMALLOWSONLYYMOVE",
  303: "STRINGID_PKMNHUNGONWITHX",
  304: "STRINGID_EMPTYSTRING3",
  305: "STRINGID_PKMNSXPREVENTSBURNS",
  306: "STRINGID_PKMNSXBLOCKSY",
  307: "STRINGID_PKMNSXRESTOREDHPALITTLE2",
  308: "STRINGID_PKMNSXWHIPPEDUPSANDSTORM",
  309: "STRINGID_PKMNSXPREVENTSYLOSS",
  310: "STRINGID_PKMNSXINFATUATEDY",
  311: "STRINGID_PKMNSXMADEYINEFFECTIVE",
  312: "STRINGID_PKMNSXCUREDYPROBLEM",
  313: "STRINGID_ITSUCKEDLIQUIDOOZE",
  314: "STRINGID_PKMNTRANSFORMED",
  315: "STRINGID_ELECTRICITYWEAKENED",
  316: "STRINGID_FIREWEAKENED",
  317: "STRINGID_PKMNHIDUNDERWATER",
  318: "STRINGID_PKMNSPRANGUP",
  319: "STRINGID_HMMOVESCANTBEFORGOTTEN",
  320: "STRINGID_XFOUNDONEY",
  321: "STRINGID_PLAYERDEFEATEDTRAINER1",
  322: "STRINGID_SOOTHINGAROMA",
  323: "STRINGID_ITEMSCANTBEUSEDNOW",
  324: "STRINGID_FORXCOMMAYZ",
  325: "STRINGID_USINGITEMSTATOFPKMNROSE",
  326: "STRINGID_PKMNUSEDXTOGETPUMPED",
  327: "STRINGID_PKMNSXMADEYUSELESS",
  328: "STRINGID_PKMNTRAPPEDBYSANDTOMB",
  329: "STRINGID_EMPTYSTRING4",
  330: "STRINGID_ABOOSTED",
  331: "STRINGID_PKMNSXINTENSIFIEDSUN",
  332: "STRINGID_PKMNMAKESGROUNDMISS",
  333: "STRINGID_YOUTHROWABALLNOWRIGHT",
  334: "STRINGID_PKMNSXTOOKATTACK",
  335: "STRINGID_PKMNCHOSEXASDESTINY",
  336: "STRINGID_PKMNLOSTFOCUS",
  337: "STRINGID_USENEXTPKMN",
  338: "STRINGID_PKMNFLEDUSINGITS",
  339: "STRINGID_PKMNFLEDUSING",
  340: "STRINGID_PKMNWASDRAGGEDOUT",
  341: "STRINGID_PREVENTEDFROMWORKING",
  342: "STRINGID_PKMNSITEMNORMALIZEDSTATUS",
  343: "STRINGID_TRAINER1USEDITEM",
  344: "STRINGID_BOXISFULL",
  345: "STRINGID_PKMNAVOIDEDATTACK",
  346: "STRINGID_PKMNSXMADEITINEFFECTIVE",
  347: "STRINGID_PKMNSXPREVENTSFLINCHING",
  348: "STRINGID_PKMNALREADYHASBURN",
  349: "STRINGID_STATSWONTDECREASE2",
  350: "STRINGID_PKMNSXBLOCKSY2",
  351: "STRINGID_PKMNSXWOREOFF",
  352: "STRINGID_PKMNRAISEDDEFALITTLE",
  353: "STRINGID_PKMNRAISEDSPDEFALITTLE",
  354: "STRINGID_THEWALLSHATTERED",
  355: "STRINGID_PKMNSXPREVENTSYSZ",
  356: "STRINGID_PKMNSXCUREDITSYPROBLEM",
  357: "STRINGID_ATTACKERCANTESCAPE",
  358: "STRINGID_PKMNOBTAINEDX",
  359: "STRINGID_PKMNOBTAINEDX2",
  360: "STRINGID_PKMNOBTAINEDXYOBTAINEDZ",
  361: "STRINGID_BUTNOEFFECT",
  362: "STRINGID_PKMNSXHADNOEFFECTONY",
  363: "STRINGID_TWOENEMIESDEFEATED",
  364: "STRINGID_TRAINER2LOSETEXT",
  365: "STRINGID_PKMNINCAPABLEOFPOWER",
  366: "STRINGID_GLINTAPPEARSINEYE",
  367: "STRINGID_PKMNGETTINGINTOPOSITION",
  368: "STRINGID_PKMNBEGANGROWLINGDEEPLY",
  369: "STRINGID_PKMNEAGERFORMORE",
  370: "STRINGID_DEFEATEDOPPONENTBYREFEREE",
  371: "STRINGID_LOSTTOOPPONENTBYREFEREE",
  372: "STRINGID_TIEDOPPONENTBYREFEREE",
  373: "STRINGID_QUESTIONFORFEITMATCH",
  374: "STRINGID_FORFEITEDMATCH",
  375: "STRINGID_PKMNTRANSFERREDSOMEONESPC",
  376: "STRINGID_PKMNTRANSFERREDLANETTESPC",
  377: "STRINGID_PKMNBOXSOMEONESPCFULL",
  378: "STRINGID_PKMNBOXLANETTESPCFULL",
  379: "STRINGID_TRAINER1WINTEXT",
  380: "STRINGID_TRAINER2WINTEXT",
};

/** Mapping id (number) → sText_X / gText_X (= clé strings.json).
 *  1:1 décomp `gBattleStringsTable[]` (battle_message.c:518-1900). */
export const BATTLE_STRINGS_TABLE: Record<number, string> = {
  12: "sText_Trainer1LoseText",
  13: "sText_PkmnGainedEXP",
  14: "sText_PkmnGrewToLv",
  15: "sText_PkmnLearnedMove",
  16: "sText_TryToLearnMove1",
  17: "sText_TryToLearnMove2",
  18: "sText_TryToLearnMove3",
  19: "sText_PkmnForgotMove",
  20: "sText_StopLearningMove",
  21: "sText_DidNotLearnMove",
  22: "sText_PkmnLearnedMove2",
  23: "sText_AttackMissed",
  24: "sText_PkmnProtectedItself",
  25: "sText_StatsWontIncrease2",
  26: "sText_AvoidedDamage",
  27: "sText_ItDoesntAffect",
  28: "sText_AttackerFainted",
  29: "sText_TargetFainted",
  30: "sText_PlayerGotMoney",
  31: "sText_PlayerWhiteout",
  32: "sText_PlayerWhiteout2",
  33: "sText_PreventsEscape",
  34: "sText_HitXTimes",
  35: "sText_PkmnFellAsleep",
  36: "sText_PkmnMadeSleep",
  37: "sText_PkmnAlreadyAsleep",
  38: "sText_PkmnAlreadyAsleep2",
  39: "sText_PkmnWasntAffected",
  40: "sText_PkmnWasPoisoned",
  41: "sText_PkmnPoisonedBy",
  42: "sText_PkmnHurtByPoison",
  43: "sText_PkmnAlreadyPoisoned",
  44: "sText_PkmnBadlyPoisoned",
  45: "sText_PkmnEnergyDrained",
  46: "sText_PkmnWasBurned",
  47: "sText_PkmnBurnedBy",
  48: "sText_PkmnHurtByBurn",
  49: "sText_PkmnWasFrozen",
  50: "sText_PkmnFrozenBy",
  51: "sText_PkmnIsFrozen",
  52: "sText_PkmnWasDefrosted",
  53: "sText_PkmnWasDefrosted2",
  54: "sText_PkmnWasDefrostedBy",
  55: "sText_PkmnWasParalyzed",
  56: "sText_PkmnWasParalyzedBy",
  57: "sText_PkmnIsParalyzed",
  58: "sText_PkmnIsAlreadyParalyzed",
  59: "sText_PkmnHealedParalysis",
  60: "sText_PkmnDreamEaten",
  61: "sText_StatsWontIncrease",
  62: "sText_StatsWontDecrease",
  63: "sText_TeamStoppedWorking",
  64: "sText_FoeStoppedWorking",
  65: "sText_PkmnIsConfused",
  66: "sText_PkmnHealedConfusion",
  67: "sText_PkmnWasConfused",
  68: "sText_PkmnAlreadyConfused",
  69: "sText_PkmnFellInLove",
  70: "sText_PkmnInLove",
  71: "sText_PkmnImmobilizedByLove",
  72: "sText_PkmnBlownAway",
  73: "sText_PkmnChangedType",
  74: "sText_PkmnFlinched",
  75: "sText_PkmnRegainedHealth",
  76: "sText_PkmnHPFull",
  77: "sText_PkmnRaisedSpDef",
  78: "sText_PkmnRaisedDef",
  79: "sText_PkmnCoveredByVeil",
  80: "sText_PkmnUsedSafeguard",
  81: "sText_PkmnSafeguardExpired",
  82: "sText_PkmnWentToSleep",
  83: "sText_PkmnSleptHealthy",
  84: "sText_PkmnWhippedWhirlwind",
  85: "sText_PkmnTookSunlight",
  86: "sText_PkmnLoweredHead",
  87: "sText_PkmnIsGlowing",
  88: "sText_PkmnFlewHigh",
  89: "sText_PkmnDugHole",
  90: "sText_PkmnSqueezedByBind",
  91: "sText_PkmnTrappedInVortex",
  92: "sText_PkmnWrappedBy",
  93: "sText_PkmnClamped",
  94: "sText_PkmnHurtBy",
  95: "sText_PkmnFreedFrom",
  96: "sText_PkmnCrashed",
  97: "gText_PkmnShroudedInMist",
  98: "sText_PkmnProtectedByMist",
  99: "gText_PkmnGettingPumped",
  100: "sText_PkmnHitWithRecoil",
  101: "sText_PkmnProtectedItself2",
  102: "sText_PkmnBuffetedBySandstorm",
  103: "sText_PkmnPeltedByHail",
  104: "sText_PkmnSeeded",
  105: "sText_PkmnEvadedAttack",
  106: "sText_PkmnSappedByLeechSeed",
  107: "sText_PkmnFastAsleep",
  108: "sText_PkmnWokeUp",
  109: "sText_PkmnUproarKeptAwake",
  110: "sText_PkmnWokeUpInUproar",
  111: "sText_PkmnCausedUproar",
  112: "sText_PkmnMakingUproar",
  113: "sText_PkmnCalmedDown",
  114: "sText_PkmnCantSleepInUproar",
  115: "sText_PkmnStockpiled",
  116: "sText_PkmnCantStockpile",
  117: "sText_PkmnCantSleepInUproar2",
  118: "sText_UproarKeptPkmnAwake",
  119: "sText_PkmnStayedAwakeUsing",
  120: "sText_PkmnStoringEnergy",
  121: "sText_PkmnUnleashedEnergy",
  122: "sText_PkmnFatigueConfusion",
  123: "sText_PlayerPickedUpMoney",
  124: "sText_PkmnUnaffected",
  125: "sText_PkmnTransformedInto",
  126: "sText_PkmnMadeSubstitute",
  127: "sText_PkmnHasSubstitute",
  128: "sText_SubstituteDamaged",
  129: "sText_PkmnSubstituteFaded",
  130: "sText_PkmnMustRecharge",
  131: "sText_PkmnRageBuilding",
  132: "sText_PkmnMoveWasDisabled",
  133: "sText_PkmnMoveIsDisabled",
  134: "sText_PkmnMoveDisabledNoMore",
  135: "sText_PkmnGotEncore",
  136: "sText_PkmnEncoreEnded",
  137: "sText_PkmnTookAim",
  138: "sText_PkmnSketchedMove",
  139: "sText_PkmnTryingToTakeFoe",
  140: "sText_PkmnTookFoe",
  141: "sText_PkmnReducedPP",
  142: "sText_PkmnStoleItem",
  143: "sText_TargetCantEscapeNow",
  144: "sText_PkmnFellIntoNightmare",
  145: "sText_PkmnLockedInNightmare",
  146: "sText_PkmnLaidCurse",
  147: "sText_PkmnAfflictedByCurse",
  148: "sText_SpikesScattered",
  149: "sText_PkmnHurtBySpikes",
  150: "sText_PkmnIdentified",
  151: "sText_PkmnPerishCountFell",
  152: "sText_PkmnBracedItself",
  153: "sText_PkmnEnduredHit",
  154: "sText_MagnitudeStrength",
  155: "sText_PkmnCutHPMaxedAttack",
  156: "sText_PkmnCopiedStatChanges",
  157: "sText_PkmnGotFree",
  158: "sText_PkmnShedLeechSeed",
  159: "sText_PkmnBlewAwaySpikes",
  160: "sText_PkmnFledFromBattle",
  161: "sText_PkmnForesawAttack",
  162: "sText_PkmnTookAttack",
  163: "sText_PkmnAttack",
  164: "sText_PkmnCenterAttention",
  165: "sText_PkmnChargingPower",
  166: "sText_NaturePowerTurnedInto",
  167: "sText_PkmnStatusNormal",
  168: "sText_PkmnHasNoMovesLeft",
  169: "sText_PkmnSubjectedToTorment",
  170: "sText_PkmnCantUseMoveTorment",
  171: "sText_PkmnTighteningFocus",
  172: "sText_PkmnFellForTaunt",
  173: "sText_PkmnCantUseMoveTaunt",
  174: "sText_PkmnReadyToHelp",
  175: "sText_PkmnSwitchedItems",
  176: "sText_PkmnCopiedFoe",
  177: "sText_PkmnMadeWish",
  178: "sText_PkmnWishCameTrue",
  179: "sText_PkmnPlantedRoots",
  180: "sText_PkmnAbsorbedNutrients",
  181: "sText_PkmnAnchoredItself",
  182: "sText_PkmnWasMadeDrowsy",
  183: "sText_PkmnKnockedOff",
  184: "sText_PkmnSwappedAbilities",
  185: "sText_PkmnSealedOpponentMove",
  186: "sText_PkmnCantUseMoveSealed",
  187: "sText_PkmnWantsGrudge",
  188: "sText_PkmnLostPPGrudge",
  189: "sText_PkmnShroudedItself",
  190: "sText_PkmnMoveBounced",
  191: "sText_PkmnWaitsForTarget",
  192: "sText_PkmnSnatchedMove",
  193: "sText_PkmnMadeItRain",
  194: "sText_PkmnRaisedSpeed",
  195: "sText_PkmnProtectedBy",
  196: "sText_PkmnPreventsUsage",
  197: "sText_PkmnRestoredHPUsing",
  198: "sText_PkmnChangedTypeWith",
  199: "sText_PkmnPreventsParalysisWith",
  200: "sText_PkmnPreventsRomanceWith",
  201: "sText_PkmnPreventsPoisoningWith",
  202: "sText_PkmnPreventsConfusionWith",
  203: "sText_PkmnRaisedFirePowerWith",
  204: "sText_PkmnAnchorsItselfWith",
  205: "sText_PkmnCutsAttackWith",
  206: "sText_PkmnPreventsStatLossWith",
  207: "sText_PkmnHurtsWith",
  208: "sText_PkmnTraced",
  209: "sText_StatSharply",
  210: "gText_StatRose",
  211: "sText_StatHarshly",
  212: "sText_StatFell",
  213: "sText_AttackersStatRose",
  214: "gText_DefendersStatRose",
  215: "sText_AttackersStatFell",
  216: "sText_DefendersStatFell",
  217: "sText_CriticalHit",
  218: "sText_OneHitKO",
  219: "sText_123Poof",
  220: "sText_AndEllipsis",
  221: "sText_NotVeryEffective",
  222: "sText_SuperEffective",
  223: "sText_GotAwaySafely",
  224: "sText_WildPkmnFled",
  225: "sText_NoRunningFromTrainers",
  226: "sText_CantEscape",
  227: "sText_DontLeaveBirch",
  228: "sText_ButNothingHappened",
  229: "sText_ButItFailed",
  230: "sText_ItHurtConfusion",
  231: "sText_MirrorMoveFailed",
  232: "sText_StartedToRain",
  233: "sText_DownpourStarted",
  234: "sText_RainContinues",
  235: "sText_DownpourContinues",
  236: "sText_RainStopped",
  237: "sText_SandstormBrewed",
  238: "sText_SandstormRages",
  239: "sText_SandstormSubsided",
  240: "sText_SunlightGotBright",
  241: "sText_SunlightStrong",
  242: "sText_SunlightFaded",
  243: "sText_StartedHail",
  244: "sText_HailContinues",
  245: "sText_HailStopped",
  246: "sText_FailedToSpitUp",
  247: "sText_FailedToSwallow",
  248: "sText_WindBecameHeatWave",
  249: "sText_StatChangesGone",
  250: "sText_CoinsScattered",
  251: "sText_TooWeakForSubstitute",
  252: "sText_SharedPain",
  253: "sText_BellChimed",
  254: "sText_FaintInThree",
  255: "sText_NoPPLeft",
  256: "sText_ButNoPPLeft",
  257: "sText_PlayerUsedItem",
  258: "sText_WallyUsedItem",
  259: "sText_TrainerBlockedBall",
  260: "sText_DontBeAThief",
  261: "sText_ItDodgedBall",
  262: "sText_YouMissedPkmn",
  263: "sText_PkmnBrokeFree",
  264: "sText_ItAppearedCaught",
  265: "sText_AarghAlmostHadIt",
  266: "sText_ShootSoClose",
  267: "sText_GotchaPkmnCaughtPlayer",
  268: "sText_GotchaPkmnCaughtWally",
  269: "sText_GiveNicknameCaptured",
  270: "sText_PkmnSentToPC",
  271: "sText_PkmnDataAddedToDex",
  272: "sText_ItIsRaining",
  273: "sText_SandstormIsRaging",
  274: "sText_CantEscape2",
  275: "sText_PkmnIgnoresAsleep",
  276: "sText_PkmnIgnoredOrders",
  277: "sText_PkmnBeganToNap",
  278: "sText_PkmnLoafing",
  279: "sText_PkmnWontObey",
  280: "sText_PkmnTurnedAway",
  281: "sText_PkmnPretendNotNotice",
  282: "sText_EnemyAboutToSwitchPkmn",
  283: "sText_CreptCloser",
  284: "sText_CantGetCloser",
  285: "sText_PkmnWatchingCarefully",
  286: "sText_PkmnCuriousAboutX",
  287: "sText_PkmnEnthralledByX",
  288: "sText_PkmnIgnoredX",
  289: "sText_ThrewPokeblockAtPkmn",
  290: "sText_OutOfSafariBalls",
  291: "sText_PkmnsItemCuredParalysis",
  292: "sText_PkmnsItemCuredPoison",
  293: "sText_PkmnsItemHealedBurn",
  294: "sText_PkmnsItemDefrostedIt",
  295: "sText_PkmnsItemWokeIt",
  296: "sText_PkmnsItemSnappedOut",
  297: "sText_PkmnsItemCuredProblem",
  298: "sText_PkmnsItemRestoredHealth",
  299: "sText_PkmnsItemRestoredPP",
  300: "sText_PkmnsItemRestoredStatus",
  301: "sText_PkmnsItemRestoredHPALittle",
  302: "sText_ItemAllowsOnlyYMove",
  303: "sText_PkmnHungOnWithX",
  304: "gText_EmptyString3",
  305: "sText_PkmnsXPreventsBurns",
  306: "sText_PkmnsXBlocksY",
  307: "sText_PkmnsXRestoredHPALittle2",
  308: "sText_PkmnsXWhippedUpSandstorm",
  309: "sText_PkmnsXPreventsYLoss",
  310: "sText_PkmnsXInfatuatedY",
  311: "sText_PkmnsXMadeYIneffective",
  312: "sText_PkmnsXCuredYProblem",
  313: "sText_ItSuckedLiquidOoze",
  314: "sText_PkmnTransformed",
  315: "sText_ElectricityWeakened",
  316: "sText_FireWeakened",
  317: "sText_PkmnHidUnderwater",
  318: "sText_PkmnSprangUp",
  319: "sText_HMMovesCantBeForgotten",
  320: "sText_XFoundOneY",
  321: "sText_PlayerDefeatedLinkTrainerTrainer1",
  322: "sText_SoothingAroma",
  323: "sText_ItemsCantBeUsedNow",
  324: "sText_ForXCommaYZ",
  325: "sText_UsingItemTheStatOfPkmnRose",
  326: "sText_PkmnUsedXToGetPumped",
  327: "sText_PkmnsXMadeYUseless",
  328: "sText_PkmnTrappedBySandTomb",
  329: "sText_EmptyString4",
  330: "sText_ABoosted",
  331: "sText_PkmnsXIntensifiedSun",
  332: "sText_PkmnMakesGroundMiss",
  333: "sText_YouThrowABallNowRight",
  334: "sText_PkmnsXTookAttack",
  335: "sText_PkmnChoseXAsDestiny",
  336: "sText_PkmnLostFocus",
  337: "sText_UseNextPkmn",
  338: "sText_PkmnFledUsingIts",
  339: "sText_PkmnFledUsing",
  340: "sText_PkmnWasDraggedOut",
  341: "sText_PreventedFromWorking",
  342: "sText_PkmnsItemNormalizedStatus",
  343: "sText_Trainer1UsedItem",
  344: "sText_BoxIsFull",
  345: "sText_PkmnAvoidedAttack",
  346: "sText_PkmnsXMadeItIneffective",
  347: "sText_PkmnsXPreventsFlinching",
  348: "sText_PkmnAlreadyHasBurn",
  349: "sText_StatsWontDecrease2",
  350: "sText_PkmnsXBlocksY2",
  351: "sText_PkmnsXWoreOff",
  352: "sText_PkmnRaisedDefALittle",
  353: "sText_PkmnRaisedSpDefALittle",
  354: "sText_TheWallShattered",
  355: "sText_PkmnsXPreventsYsZ",
  356: "sText_PkmnsXCuredItsYProblem",
  357: "sText_AttackerCantEscape",
  358: "sText_PkmnObtainedX",
  359: "sText_PkmnObtainedX2",
  360: "sText_PkmnObtainedXYObtainedZ",
  361: "sText_ButNoEffect",
  362: "sText_PkmnsXHadNoEffectOnY",
  363: "sText_TwoInGameTrainersDefeated",
  364: "sText_Trainer2LoseText",
  365: "sText_PkmnIncapableOfPower",
  366: "sText_GlintAppearsInEye",
  367: "sText_PkmnGettingIntoPosition",
  368: "sText_PkmnBeganGrowlingDeeply",
  369: "sText_PkmnEagerForMore",
  370: "sText_DefeatedOpponentByReferee",
  371: "sText_LostToOpponentByReferee",
  372: "sText_TiedOpponentByReferee",
  373: "sText_QuestionForfeitMatch",
  374: "sText_ForfeitedMatch",
  375: "gText_PkmnTransferredSomeonesPC",
  376: "gText_PkmnTransferredLanettesPC",
  377: "gText_PkmnTransferredSomeonesPCBoxFull",
  378: "gText_PkmnTransferredLanettesPCBoxFull",
  379: "sText_Trainer1WinText",
  380: "sText_Trainer2WinText",
};


// ── gXxxStringIds (1:1 battle_message.c, indexe par MULTISTRING_CHOOSER) ───
// (auto-gen extract-battle-string-id-tables.mjs RETIRE, idem.)
export const BATTLE_STRING_ID_TABLES: Record<string, Uint16Array> = {
  gAbsorbDrainStringIds: new Uint16Array([45, 313]),
  gAttractUsedStringIds: new Uint16Array([69, 310]),
  // 1:1 battle_message.c:1148 — BROKEFREE/APPEAREDCAUGHT/AARGH/SHOOTSOCLOSE (échec
  // capture par nb de secousses ; absente = printfromtable → stringId 0 = msg d'intro !).
  gBallEscapeStringIds: new Uint16Array([263, 264, 265, 266]),
  gBerryEffectStringIds: new Uint16Array([297, 342]),
  gBRNPreventionStringIds: new Uint16Array([305, 355, 362]),
  gCaughtMonStringIds: new Uint16Array([375, 376, 377, 378]),
  gFellAsleepStringIds: new Uint16Array([35, 36]),
  gFirstTurnOfTwoStringIds: new Uint16Array([84, 85, 86, 87, 88, 89, 317, 318]),
  gFlashFireStringIds: new Uint16Array([203, 311]),
  gFocusEnergyUsedStringIds: new Uint16Array([99, 229]),
  gFutureMoveUsedStringIds: new Uint16Array([161, 335]),
  gGotBurnedStringIds: new Uint16Array([46, 47]),
  gGotDefrostedStringIds: new Uint16Array([53, 54]),
  gGotFrozenStringIds: new Uint16Array([49, 50]),
  gGotParalyzedStringIds: new Uint16Array([55, 56]),
  gGotPoisonedStringIds: new Uint16Array([40, 41]),
  gInobedientStringIds: new Uint16Array([278, 279, 280, 281, 365]),
  gItemSwapStringIds: new Uint16Array([358, 359, 360]),
  gKOFailedStringIds: new Uint16Array([23, 124]),
  gLeechSeedStringIds: new Uint16Array([104, 105, 27, 106, 313]),
  gMissStringIds: new Uint16Array([23, 24, 345, 26, 332]),
  gMistUsedStringIds: new Uint16Array([97, 229]),
  gMoveWeatherChangeStringIds: new Uint16Array([232, 233, 229, 237, 240, 243]),
  gNoEscapeStringIds: new Uint16Array([226, 227, 33, 274, 357]),
  gPartyStatusHealStringIds: new Uint16Array([253, 253, 253, 253, 322]),
  gPRLZPreventionStringIds: new Uint16Array([199, 355, 362]),
  gProtectLikeUsedStringIds: new Uint16Array([101, 152, 229]),
  gPSNPreventionStringIds: new Uint16Array([201, 355, 362]),
  gRainContinuesStringIds: new Uint16Array([234, 235, 236]),
  gReflectLightScreenSafeguardStringIds: new Uint16Array([229, 78, 352, 77, 353, 79]),
  gRestUsedStringIds: new Uint16Array([82, 83]),
  gSafariGetNearStringIds: new Uint16Array([283, 284]),
  gSafariPokeblockResultStringIds: new Uint16Array([286, 287, 288]),
  gSandStormHailContinuesStringIds: new Uint16Array([238, 244]),
  gSandStormHailDmgStringIds: new Uint16Array([102, 103]),
  gSandStormHailEndStringIds: new Uint16Array([239, 245]),
  gSportsUsedStringIds: new Uint16Array([315, 316]),
  gStatDownStringIds: new Uint16Array([215, 216, 62, 304]),
  gStatUpStringIds: new Uint16Array([213, 214, 61, 304, 325, 326]),
  gStockpileUsedStringIds: new Uint16Array([115, 116]),
  gSubstituteUsedStringIds: new Uint16Array([126, 251]),
  gSwallowFailStringIds: new Uint16Array([247, 76]),
  // 1:1 battle_message.c — AI_HEAL_CONFUSION/PARALYSIS/FREEZE/BURN/POISON/SLEEP
  // (dresseur utilise un objet de soin sur son mon).
  gTrainerItemCuredStatusStringIds: new Uint16Array([296, 291, 294, 293, 292, 295]),
  gTransformUsedStringIds: new Uint16Array([125, 229]),
  // 1:1 battle_message.c — météo OW → message d'ouverture de combat, indexée par
  // WEATHER_* (0-15) : ITISRAINING partout sauf SANDSTORM(8)=273 et DROUGHT(12)=241.
  gWeatherStartsStringIds: new Uint16Array([272, 272, 272, 272, 272, 272, 272, 272, 273, 272, 272, 272, 241, 272, 272, 272]),
  gUproarAwakeStringIds: new Uint16Array([117, 118, 119]),
  gUproarOverTurnStringIds: new Uint16Array([112, 113]),
  gWokeUpStringIds: new Uint16Array([108, 110]),
  gWrappedStringIds: new Uint16Array([90, 92, 91, 93, 91, 328]),
};

/** Lookup : symbol name → resolved stringId at index, ou null si invalid. */
export function getBattleStringId(tableName: string, index: number): number | null {
  const t = BATTLE_STRING_ID_TABLES[tableName];
  if (!t || index < 0 || index >= t.length) return null;
  return t[index];
}
