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

import {
  EOS, EXT_CTRL_CODE_BEGIN, CHAR_NEWLINE,
  EXT_CTRL_CODE_PAUSE_UNTIL_PRESS, CHAR_PROMPT_SCROLL, CHAR_PROMPT_CLEAR,
  encodeStringForFont,
} from './engine/ui/gba-text-printer';
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
} from './engine/battle/text-buffers';
import {
  _moveName, _abilityName, _itemName, _typeName, _speciesName,
  _monNickname, _monNicknameWithPrefix, STAT_NAMES_FR,
  _resolveTrainerNameFr, _resolveTrainerClassNameFr, _getBattlerSide,
  _resolveIntroMsgStringName, _resolveIntroSendoutStringName,
  _resolveReturnmonStringName, _resolveSwitchinmonStringName,
} from './engine/battle/battle-string-decoder';
import { BATTLE_STRINGS_TABLE, STRINGID_NAMES, BATTLESTRINGS_TABLE_START } from './engine/decomp-data/battle-strings-table';
import { STRINGID_STATSHARPLY, STRINGID_STATHARSHLY } from '../include/constants/battle_string_ids';
import { getString } from './engine/ui/gba-strings';
import { gActiveBattler, gEffectBattler, gBattleTypeFlags, gTrainerBattleOpponent_A } from './engine/battle/state';
// Fin de combat dresseur : lose_text expand (1:1 GetTrainerALoseText). Usage RUNTIME (en fonction)
// -> live-binding ESM safe meme si cycle transitif. Fallback marqueur si non pose (voie V).
import { GetTrainerALoseText, getTrainerADefeatSpeech } from './engine/battle/battle-setup-helpers';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import type { BattleMsgData } from './engine/battle/battle-event-queue';

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
    case B_TXT_PLAYER_NAME:  return encodeChars((gSaveBlock2Ptr.playerName as string | undefined) ?? 'Joueur');
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
        const FLAVOR_FR = ['', ' un peu', ' beaucoup', ' énormément'];
        StringAppend_(dst, encodeChars(FLAVOR_FR[src[srcID + 1]] ?? '')); srcID += 2; break;
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

/** 1:1 décomp `BufferStringBattle(stringID)` (1968) — version voie L byte-level.
 *  Réutilise les `_resolve*StringName` (switch 1:1 déjà porté) pour choisir le
 *  sText, encode le template en bytes, puis expand dans gDisplayedStringBattle.
 *  Retourne la longueur écrite. msgData = snapshot IPC (gBattleBufferA[active][4]). */
export function BufferStringBattle(stringID: number, msgData: BattleMsgData): number {
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
