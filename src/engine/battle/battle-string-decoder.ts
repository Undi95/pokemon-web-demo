/**
 * battle/battle-string-decoder.ts — Décoder partiel de BufferStringBattle 1:1 décomp
 * `src/battle_message.c:1968-2950`.
 *
 * Architecture 1:1 strict (partielle Phase 1.4 J first pass) :
 *   - Lookup sText_X via BATTLE_STRINGS_TABLE[stringId]
 *   - Fetch template FR depuis strings.json (= initStringsFromDecomp doit avoir
 *     été appelé au boot)
 *   - Substitute placeholders `{B_BUFF1}`, `{B_ATK_NAME_WITH_PREFIX}`, etc. via
 *     msgData snapshot capturé au moment de l'emit
 *   - Special-cases pour stringIds 0..11 (INTROMSG/INTROSENDOUT/RETURNMON/etc.)
 *     qui sont handled par switch dans BufferStringBattle (= pas dans la table)
 *
 * Limitations Phase 1.4 J first pass :
 *   - Special cases utilisent path "single wild battle" (= pas TRAINER/DOUBLE/LINK)
 *   - Resolvers placeholder utilisent fallback "?" si data manquante
 *   - Pas tous les ~70 placeholders implémentés (= les ~15 plus courants suffisent
 *     pour Tackle/Growl/PoisonPowder/etc.)
 *
 * Sources de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_message.c:1968-2950`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/battle_message.h:10-80`
 */

import { BATTLE_STRINGS_TABLE, STRINGID_NAMES } from '../decomp-data/battle-strings-table';
import { getString } from '../gba-strings';
import { gSaveBlock2Ptr } from '../save-block-state';
import { getMoveName as _getMoveNameFr } from '../data/game-data';
import { getSpeciesNameFr as _getSpeciesNameFr, getItemNameFr as _getItemNameFr } from '../data-tables';
import { resolveDecompConstant } from '../decomp-constants';
import type { BattleMsgData } from './battle-event-queue';
import {
  B_BUFF_PLACEHOLDER_BEGIN,
  B_BUFF_STRING,
  B_BUFF_NUMBER,
  B_BUFF_MOVE,
  B_BUFF_TYPE,
  B_BUFF_MON_NICK_WITH_PREFIX,
  B_BUFF_STAT,
  B_BUFF_SPECIES,
  B_BUFF_MON_NICK,
  B_BUFF_ABILITY,
  B_BUFF_ITEM,
  B_BUFF_EOS,
  B_BUFF_NEGATIVE_FLAVOR,
} from './text-buffers';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, gBattleScripting, gEffectBattler, gActiveBattler,
  gBattleTypeFlags, gTrainerBattleOpponent_A, gBattleStruct,
} from './state';
import {
  BATTLE_TYPE_DOUBLE, BATTLE_TYPE_LINK, BATTLE_TYPE_TRAINER, BATTLE_TYPE_MULTI,
  BATTLE_TYPE_LEGENDARY, BATTLE_TYPE_WALLY_TUTORIAL, BATTLE_TYPE_TWO_OPPONENTS,
  BATTLE_TYPE_INGAME_PARTNER, BATTLE_TYPE_TOWER_LINK_MULTI, BATTLE_TYPE_RECORDED,
  BATTLE_TYPE_RECORDED_LINK,
} from './constants';

// 1:1 décomp `TRAINER_UNION_ROOM` (include/constants/trainers.h).
const TRAINER_UNION_ROOM = 3072;
// 1:1 décomp `TRAINER_LINK_OPPONENT` (include/constants/trainers.h).
const TRAINER_LINK_OPPONENT = 0x400;

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
    const mod = await import('../decomp-data/auto/include/constants/opponents-data');
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
  return `Espèce#${speciesId}`;
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
        // STRINGID_STATSHARPLY = 209, STATHARSHLY = 211.
        if (stringId === 209 || stringId === 211) {
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
        // 1:1 décomp battle_message.c:432-438 :
        // 0 = "ne change plus" 1 = "vraiment" 2 = "fortement" 3 = "encore plus"
        const flavor = buf[i++];
        const FLAVOR_FR = ['', ' un peu', ' beaucoup', ' énormément'];
        out += FLAVOR_FR[flavor] ?? '';
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
      case 'ATK_NAME_WITH_PREFIX': return _monNicknameWithPrefix(gBattlerAttacker);
      case 'DEF_NAME_WITH_PREFIX': return _monNicknameWithPrefix(gBattlerTarget);
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
      case 'ATK_NAME':    return _monNickname(gBattlerAttacker);
      case 'DEF_NAME':    return _monNickname(gBattlerTarget);
      case 'CURRENT_MOVE':return _moveName(msgData.currentMove);
      case 'LAST_MOVE':   return _moveName(msgData.originallyUsedMove);
      case 'LAST_ITEM':   return _itemName(msgData.lastItem);
      case 'LAST_ABILITY':return _abilityName(msgData.lastAbility);
      case 'ATK_ABILITY': return _abilityName(msgData.abilities[gBattlerAttacker] ?? 0);
      case 'DEF_ABILITY': return _abilityName(msgData.abilities[gBattlerTarget] ?? 0);
      case 'SCR_ACTIVE_ABILITY':
        return _abilityName(msgData.abilities[msgData.scrActive] ?? 0);
      case 'EFF_ABILITY':
        // 1:1 décomp battle_message.c:2580-2582 : utilise gEffectBattler.
        return _abilityName(msgData.abilities[gEffectBattler] ?? 0);
      case 'PLAYER_NAME': {
        // 1:1 décomp `gSaveBlock2Ptr->playerName`.
        return (gSaveBlock2Ptr.playerName as string | undefined) ?? 'Joueur';
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
      case 'ATK_NAME_WITH_PREFIX_MON1': return _monNicknameWithPrefix(gBattlerAttacker);
      case 'ATK_PARTNER_NAME':    return _monNickname((gBattlerAttacker & ~1) | 2);
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
        return (gSaveBlock2Ptr.playerName as string | undefined) ?? 'Joueur';
      case 'PC_CREATOR_NAME':
        return 'BILL';
      // Prefix placeholders 1:1 décomp battle_message.c:2704-2728 :
      // - PLAYER side (= ATK_PREFIX*) → "ami" (= sText_AllyPkmnPrefix)
      // - OPPONENT side → "ennemi" (= sText_FoePkmnPrefix2/3/4)
      // Templates utilisent pour différencier "du POKéMON ami" vs "du POKéMON ennemi".
      case 'ATK_PREFIX1': case 'ATK_PREFIX2': case 'ATK_PREFIX3':
        return (gBattlerAttacker & 1) === 0 ? 'ami' : 'ennemi';
      case 'DEF_PREFIX1': case 'DEF_PREFIX2': case 'DEF_PREFIX3':
        return (gBattlerTarget & 1) === 0 ? 'ami' : 'ennemi';
      default:
        return `{B_${name}}`;
    }
  });
}

// ─── Public API ─────────────────────────────────────────────────────────────

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
      msgData.textBuffs[1] = _encodeStringForBuff(moveName);
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
    .replace(/\{PAUSE \d+\}/g, '')
    .replace(/\{COLOR [A-Z_]+\}/g, '')
    .replace(/\\p/g, '\n')   // line break + pause
    .replace(/\\n/g, '\n')   // line break
    .replace(/\\l/g, '\n')   // scroll line
    .replace(/\\$/g, '');
}
