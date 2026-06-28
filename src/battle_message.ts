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
} from './engine/battle/text-buffers';

import { BATTLE_STRINGS_TABLE, STRINGID_NAMES, BATTLESTRINGS_TABLE_START } from './engine/decomp-data/battle-strings-table';
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
