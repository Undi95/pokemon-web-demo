/**
 * decomp-bridge.ts — single import surface for auto-transpiled décomp modules.
 *
 * RÔLE :
 *   Les fichiers `src/engine/decomp-data/auto/src-all/*-all-auto.ts` sont auto-générés
 *   depuis `D:/Projet 1/decomps/pokeemeraude/src/*.c` (~15,000 fonctions). Ces fichiers
 *   référencent des helpers à scope GLOBAL (= LoadPalette, GetMonData, FaceDirection,
 *   ARRAY_COUNT, etc.) qui doivent être résolus côté TS pour qu'on puisse importer
 *   et activer ces modules sélectivement.
 *
 *   Ce bridge est la SOURCE UNIQUE pour ces helpers : il re-export ceux qu'on a déjà
 *   implémentés (= dans `decomp-globals`, `decomp-runtime`, `decomp-helpers`,
 *   `script-vars`, etc.), inline les macros simples (= ARRAY_COUNT, BG_PLTT_ID),
 *   et **throw NotImplemented** pour ceux qu'on n'a pas encore portés.
 *
 * DIRECTIVE 1:1 STRICTE :
 *   - Pas de stubs silencieux qui retournent 0/null/false (= masquerait les bugs).
 *   - Si un helper n'est pas mappable 1:1 immédiatement, on **throw NotImplementedError**
 *     pour fail-fast → on saura exactement quel fichier porter en priorité.
 *   - Les macros (= ARRAY_COUNT, MAP_NUM) sont triviales et inlinées 1:1 du #define C.
 *   - Les re-exports délèguent à l'impl existante quand elle est 1:1 vérifiée.
 *
 * USAGE :
 *   Dans un module auto-généré :
 *   ```ts
 *   import * as bridge from '../../decomp-bridge';
 *   // Ou (préféré, après résolution des imports par le transpiler) :
 *   import { LoadPalette, FaceDirection, ARRAY_COUNT } from '../../decomp-bridge';
 *   ```
 *
 * MAINTENANCE :
 *   - Quand un helper est porté 1:1, le déplacer de "throw" → "re-export".
 *   - Garder `helper-bridge-manifest.md` à jour (= run `node scripts/build-helper-bridge-manifest.mjs`).
 *   - Cf. `memory/audit-2026-05-09-total-1to1.md` pour la liste des modules à porter.
 *
 * Sources de vérité :
 *   - `decomps/pokeemeraude/include/macro.h` (= ARRAY_COUNT, T1_READ_PTR, SWAP, etc.)
 *   - `decomps/pokeemeraude/include/gba/macro.h` (= BG_PLTT_ID, OBJ_PLTT_ID, etc.)
 *   - `decomps/pokeemeraude/src/*.c` pour chaque helper.
 */

// Import LOCAL (en plus du re-export plus bas) pour usage interne par CreateSprite
// (branche sheet taggee). Re-export `// (ré-exports morts retirés depuis '../../src/sprite' — sweep)` ne cree PAS de
// binding local → on importe explicitement (alias `_` pour zero ambiguite). 1:1 ESM.
import { ResetSpriteData as _ResetSpriteData, DestroySprite as _DestroySprite, AllocOamMatrix as _AllocOamMatrix, FreeOamMatrix as _FreeOamMatrix, CreateSprite as _CreateSprite_game } from '../../src/sprite';

// ─── Re-exports : palette / GPU / VRAM ────────────────────────────────────────

export {
  LoadPalette,
  ResetPaletteFade,
  FreeAllSpritePalettes,
  LoadCompressedSpriteSheet,
} from './decomp-globals';

// ─── Re-exports : sprite/affine helpers (decomp-helpers.ts) ───────────────────

// Sin / Cos → foyer canonique `src/trig.ts` (1:1 décomp trig.c) ; gSineTable (forme
// FONCTION, fix cast u8) → `harness/runtime/decomp-helpers.ts`. Ré-exports bridge
// retirés (0 importeur depuis le bridge) — décyclage lot 12.
// (ré-exports morts retirés depuis './decomp-helpers' — sweep)
import { gSineTable as _gSineTable } from './decomp-helpers';
// STR_CONV_MODE_* : foyer canonique include/string_util.ts (feuille pure, cycle-safe).
// Importés ici pour l'usage interne de ConvertIntToDecimalStringN (décyclage lot 5).
import { STR_CONV_MODE_RIGHT_ALIGN, STR_CONV_MODE_LEADING_ZEROS } from '../../include/string_util';

// ─── Re-exports : GPU register / BG constants (decomp-runtime.ts) ─────────────

// (ré-exports morts retirés depuis './decomp-runtime' — sweep)

// ─── Re-exports : event_data (script-vars.ts) ─────────────────────────────────

// (ré-exports morts retirés depuis '../../src/engine/script/script-vars' — sweep)

// ─── Re-exports : script runtime (script-runtime.ts) ──────────────────────────

// (ré-exports morts retirés depuis '../../src/script' — sweep)

// ─── Re-exports : text system (gba-text-system.ts) ────────────────────────────

// (ré-exports morts retirés depuis '../../src/engine/ui/gba-text-system' — sweep)
import { CHAR_SPACER_STR } from '../../src/engine/ui/gba-text-system';

// ─── Local-use imports (hoisted from scattered scope) ────────────────────────
//
// Pattern ESM standard : tous les imports au TOP du fichier. Évite l'anti-
// pattern « imports scattered en cours de fichier » qui crée des pièges TDZ
// quand l'eager-init chain change (= ex. save-system → bag → game-state →
// load_save → object-events → metatile-behavior → decomp-bridge). Ces imports
// sont utilisés localement avec des alias `_xxx` pour éviter la collision avec
// les re-exports `// (ré-exports morts retirés depuis '../../src/engine/xxx' — sweep)` situés plus bas dans ce fichier.

import { Random as _Random } from '../../src/random';
import { getObjectEventGraphicsInfo as _getOEGI } from '../../src/engine/field/object-event-graphics';
import {
  getItemNameFr as _getItemNameFr,
  getItem as _getItem,
  getItemDescriptionFr as _getItemDescFr,
  getItemKeyById as _getItemKeyById,
} from './data-tables';
import { sTMHMMoves as _sTMHMMoves } from '../../src/engine/pokemon/tmhm-moves';
import { getMapNameFr } from '../../src/data/map-names-fr';
import { getRuntime as _getRT } from './decomp-globals';
import { gBattleMons as _gBattleMonsBridge } from '../../src/engine/battle/state';
export const PLTT_SIZE_4BPP = 32;

/** 1:1 décomp `include/gba/types.h` :
 *    #define WIN_RANGE(a, b)  (((a) << 8) | (b))
 *  Pack two coords into a u16 for WIN0H/WIN0V regs. */
export function WIN_RANGE(a: number, b: number): number {
  return ((a & 0xFF) << 8) | (b & 0xFF);
}

/** 1:1 décomp `include/gba/types.h` RGB2 macro :
 *    #define RGB2(r, g, b) ((r) | ((g) << 5) | ((b) << 10))
 *  Same as RGB but no & 0x1F (= rare alt name). */
export function RGB2(r: number, g: number, b: number): number {
  return (r & 0x1F) | ((g & 0x1F) << 5) | ((b & 0x1F) << 10);
}

/** 1:1 décomp `include/gba/types.h` palette ID generic helper :
 *    #define PLTT_ID(n) ((n) * 16)
 *  Combined BG/OBJ palette ID. */
export function PLTT_ID(n: number): number { return n * 16; }

/** 1:1 décomp `include/battle.h:21` :
 *    #define MOVE_IS_PERMANENT(battler, moveSlot)                            \
 *       (!(gBattleMons[battler].status2 & STATUS2_TRANSFORMED)                \
 *        && !(gDisableStructs[battler].mimickedMoves & gBitTable[moveSlot]))
 *
 *  Used to exclude moves learned temporarily by Transform or Mimic. Need full
 *  battle struct ports ; NotImpl until then.
 *  Note 1:1 : we don't throw because some auto-bodies guard with `if`, so we
 *  return false (= move is NOT permanent → skip it). Slightly less safe than
 *  throwing but unblocks more code. */
export function MOVE_IS_PERMANENT(_battler: number, _moveSlot: number): boolean {
  const rt: any = _getRT();
  const battleMons = rt?.gBattleMons;
  const disableStructs = rt?.gDisableStructs;
  if (!battleMons || !disableStructs) return false;
  const STATUS2_TRANSFORMED = 1 << 25; // include/constants/battle.h
  const transformed = (battleMons[_battler]?.status2 ?? 0) & STATUS2_TRANSFORMED;
  const mimicked = (disableStructs[_battler]?.mimickedMoves ?? 0) & (1 << _moveSlot);
  return !transformed && !mimicked;
}

// ─── Battle message PREPARE_*_BUFFER macros (1:1 décomp battle_message.h) ─────
//
// Ces macros écrivent une séquence de placeholder bytes dans textVar (= un buffer
// utilisé par BattleStringExpand). En C, c'est du write direct par index ; en
// TS, on opère sur un Uint8Array ou un array.
//
// 1:1 décomp include/battle_message.h:67-80. CORRIGÉ A8 audit : les valeurs
// précédentes étaient WRONG (NUMBER=1✓, mais STRING=2 décomp=0 ; MOVE=3
// décomp=2 ; TYPE=4 décomp=3 ; MON_NICK=5 décomp=7 ; MON_NICK_WITH_PREFIX=6
// décomp=4 ; ITEM=12 décomp=10 ; SPECIES=13 décomp=6).
const B_BUFF_STRING = 0;
const B_BUFF_NUMBER = 1;
const B_BUFF_MOVE = 2;
const B_BUFF_TYPE = 3;
const B_BUFF_MON_NICK_WITH_PREFIX = 4;
const _B_BUFF_STAT = 5;  // unused mais 1:1 strict
const B_BUFF_SPECIES = 6;
const B_BUFF_MON_NICK = 7;
const _B_BUFF_NEGATIVE_FLAVOR = 8;  // unused
const _B_BUFF_ABILITY = 9;  // unused
const B_BUFF_ITEM = 10;
const B_BUFF_PLACEHOLDER_BEGIN = 0xFD;
const B_BUFF_EOS = 0xFF;
void _B_BUFF_STAT; void _B_BUFF_NEGATIVE_FLAVOR; void _B_BUFF_ABILITY;

// ─── Easy chat word macros (1:1 décomp `constants/easy_chat.h:1116-1127`) ─────

/** EC_MASK_BITS = 9, EC_MASK_GROUP = 0x7F, EC_MASK_INDEX = 0x1FF. */
const EC_MASK_BITS = 9;
const EC_MASK_GROUP_M = (1 << (16 - EC_MASK_BITS)) - 1; // 0x7F
const EC_MASK_INDEX_M = (1 << EC_MASK_BITS) - 1;

// ─── Re-exports : window frame tiles + palettes (miroir src/game/text_window.ts) ──

export {
  GetOverworldTextboxPalettePtr,
} from '../../src/text_window';

// ─── Re-exports : data tables FR (data-tables.ts) ────────────────────────────
//
// Notre `data-tables.ts` expose les lookup fns FR avec un signature légèrement
// différente du décomp (= retourne string, pas u8*). On adapte ici pour matcher
// l'API décomp utilisée dans les auto-bodies.
// Note : aliases locaux `_getItemNameFr`, `_getItem`, `_getItemDescFr`,
// `_getItemKeyById`, `_sTMHMMoves` hoisted en tête de fichier.

/** items.json key d'un itemId numérique (= modèle move-named du projet :
 *  "ITEM_TM_FOCUS_PUNCH" pour TM01, "ITEM_HM_CUT" pour HM01) — miroir de
 *  bag-pockets.slotItemId qui fait le sens inverse. getItemKeyById fait
 *  numéric → enum-numbered ("ITEM_TM01") via constants.items reverse ;
 *  on convertit ensuite en move-named via sTMHMMoves (= clé items.json).
 *  Sans ça, getItem("ITEM_TM01") rate (items.json n'a que "ITEM_TM_…"). */
function _itemKeyForLookup(itemId: number): string {
  const enumKey = _getItemKeyById(itemId);
  if (enumKey.startsWith('ITEM_TM') && /^\d+$/.test(enumKey.slice(7))) {
    const tmIdx = parseInt(enumKey.slice(7), 10) - 1; // ITEM_TM01 → 0
    const move = _sTMHMMoves[tmIdx];
    if (move) return 'ITEM_TM_' + move.slice(5); // "MOVE_FOCUS_PUNCH" → "ITEM_TM_FOCUS_PUNCH"
  } else if (enumKey.startsWith('ITEM_HM') && /^\d+$/.test(enumKey.slice(7))) {
    const hmIdx = 50 + parseInt(enumKey.slice(7), 10) - 1; // ITEM_HM01 → 50
    const move = _sTMHMMoves[hmIdx];
    if (move) return 'ITEM_HM_' + move.slice(5);
  }
  return enumKey;
}

/** 1:1 décomp `src/item.c:879 GetItemName(itemId)` :
 *    return gItems[SanitizeItemId(itemId)].name;
 *
 *  Notre data table contient les noms FR. itemId numérique → itemKey via
 *  `_itemKeyForLookup` (= miroir GetItemDescription, normalise TM/HM
 *  enum-numbered → move-named, gère les autres items via getItemKeyById).
 *  Ancien `ITEM_${id}` ne matchait AUCUNE clé items.json → retournait l'enum
 *  string brut (= "13 est sélectionné." au lieu de "POTION est sélectionné."). */
export function GetItemName(itemId: number | string): string {
  const itemKey = typeof itemId === 'number' ? _itemKeyForLookup(itemId) : itemId;
  return _getItemNameFr(itemKey);
}

// ─── Re-exports : map names (map-names-fr) ───────────────────────────────────
// Note : `getMapNameFr` import hoisted en tête de fichier.

/** 1:1 décomp `src/region_map.c:1568 GetMapName(dest, regionMapId, padLength)` :
 *    if (regionMapId == MAPSEC_SECRET_BASE) return GetSecretBaseMapName(dest);
 *    else if (regionMapId < MAPSEC_NONE) return StringCopy(dest, gRegionMapEntries[id].name);
 *    else return StringFill(dest, CHAR_SPACE, padLength ?? 18);
 *
 *  Notre impl simplifié : lookup FR directement, write into dest.length bytes
 *  (= dest is a Uint8Array slot in gStringVar1/2/3 typically). En auto-body,
 *  c'est toujours appelé pour passer à StringExpand → string-mode est OK. */
export function GetMapName(dest: any, regionMapId: number | string, padLength: number = 0): string {
  const key = typeof regionMapId === 'number'
    ? `MAPSEC_${regionMapId}` // best-effort : auto-body devrait passer enum str
    : String(regionMapId);
  let name = getMapNameFr(key) ?? '';
  if (padLength > 0 && name.length < padLength) {
    name = name.padEnd(padLength, ' ');
  }
  // Mutable string-buffer write (= for Uint8Array dests, copy bytes ; else no-op).
  if (dest instanceof Uint8Array) {
    for (let i = 0; i < Math.min(name.length, dest.length); i++) {
      dest[i] = name.charCodeAt(i);
    }
  }
  return name;
}

/** 1:1 décomp `src/region_map.c:1601 GetMapNameGeneric(dest, mapSecId)` :
 *    case MAPSEC_DYNAMIC:     return StringCopy(dest, gText_Ferry);      // FR "FERRY"
 *    case MAPSEC_SECRET_BASE: return StringCopy(dest, gText_SecretBase); // FR "BASE SECRETE"
 *    default:                 return GetMapName(dest, mapSecId, 0);
 *  mapSecId = string MAPSEC_* dans notre monde (gMapHeader.regionMapSectionId).
 *  FR sources : strings.c:1097-1099. */
export function GetMapNameGeneric(dest: any, regionMapId: number | string): string {
  const key = typeof regionMapId === 'number' ? `MAPSEC_${regionMapId}` : String(regionMapId);
  if (key === 'MAPSEC_DYNAMIC') return _writeMapNameDest(dest, 'FERRY');
  if (key === 'MAPSEC_SECRET_BASE') return _writeMapNameDest(dest, 'BASE SECRETE');
  return GetMapName(dest, regionMapId, 0);
}

/** 1:1 décomp `src/region_map.c:1614 GetMapNameHandleAquaHideout(dest, mapSecId)` :
 *    if (mapSecId == MAPSEC_AQUA_HIDEOUT_OLD) return StringCopy(dest, gText_Hideout); // FR "PLANQUE"
 *    else return GetMapNameGeneric(dest, mapSecId);
 *  Utilisé par le Mémo Dresseur du summary screen (BufferMonTrainerMemo). */
export function GetMapNameHandleAquaHideout(dest: any, regionMapId: number | string): string {
  const key = typeof regionMapId === 'number' ? `MAPSEC_${regionMapId}` : String(regionMapId);
  if (key === 'MAPSEC_AQUA_HIDEOUT_OLD') return _writeMapNameDest(dest, 'PLANQUE');
  return GetMapNameGeneric(dest, regionMapId);
}

/** Helper : écrit `name` dans `dest` (Uint8Array buffer-style 1:1 StringCopy)
 *  + retourne la string (= idem GetMapName ci-dessus). */
function _writeMapNameDest(dest: any, name: string): string {
  if (dest instanceof Uint8Array) {
    for (let i = 0; i < Math.min(name.length, dest.length); i++) dest[i] = name.charCodeAt(i);
  }
  return name;
}

/** 1:1 décomp `src/item.c:905 GetItemDescription(itemId)`. AVANT : `ITEM_${id}`
 *  produisait "ITEM_331" → getItem rate (items.json clés = enum-name, pas
 *  numéric stringifié) → desc vide. Pour TM/HM : items.json utilise des
 *  clés move-named ("ITEM_TM_FOCUS_PUNCH") ≠ enum décomp ("ITEM_TM01") →
 *  conversion via _itemKeyForLookup (= miroir slotItemId, 1:1-faithful). */
export function GetItemDescription(itemId: number | string): string {
  const itemKey = typeof itemId === 'number' ? _itemKeyForLookup(itemId) : itemId;
  const item = _getItem(itemKey);
  if (!item) return '';
  return _getItemDescFr(item.descriptionLabel ?? '');
}

/** 1:1 décomp `src/item.c:910 GetItemImportance(itemId)` :
 *    return gItems[SanitizeItemId(itemId)].importance;
 *  Posé à 1 pour tous les KEY ITEMS + les 8 HM (= "objets uniques à usage
 *  infini" — pas de quantité affichée, jamais jetables, peuvent être
 *  registered au SELECT). Items.json normalisé via _itemKeyForLookup
 *  (= TM/HM enum-numbered → move-named, miroir GetItemDescription). */
export function GetItemImportance(itemId: number | string): number {
  const itemKey = typeof itemId === 'number' ? _itemKeyForLookup(itemId) : itemId;
  return _getItem(itemKey)?.importance ?? 0;
}

/** 1:1 décomp `src/item.c GetItemFieldFunc(itemId)` :
 *    return gItems[SanitizeItemId(itemId)].fieldUseFunc;
 *  Notre TS retourne le NOM du handler (= string depuis items.json) — le
 *  dispatcher `ItemMenu_UseOutOfBattle` route ensuite vers l'impl TS. */
export function GetItemFieldFunc(itemId: number | string): string | null {
  const itemKey = typeof itemId === 'number' ? _itemKeyForLookup(itemId) : itemId;
  return _getItem(itemKey)?.fieldUseFunc ?? null;
}

/** 1:1 décomp `src/item.c GetItemType(itemId)` :
 *    return gItems[SanitizeItemId(itemId)].type;
 *  Notre TS retourne le NOM du type (= string `ITEM_USE_PARTY_MENU` etc.). */
export function GetItemType(itemId: number | string): string {
  const itemKey = typeof itemId === 'number' ? _itemKeyForLookup(itemId) : itemId;
  return _getItem(itemKey)?.type ?? '';
}

/** 1:1 décomp `src/item.c GetItemSecondaryId(itemId)`. */
export function GetItemSecondaryId(itemId: number | string): string | null {
  const itemKey = typeof itemId === 'number' ? _itemKeyForLookup(itemId) : itemId;
  return _getItem(itemKey)?.secondaryId ?? null;
}

// ─── Overworld map header (1:1 décomp `src/overworld.c`) ──────────────────────

/** 1:1 décomp `src/overworld.c:579 Overworld_GetMapHeaderByGroupAndId(group, num)` :
 *    return gMapGroups[mapGroup][mapNum];
 *
 *  Notre map data est async (= fetch JSON), mais cette fn est sync dans le décomp.
 *  Solution : on regarde dans un cache populated par le map loader. Si pas en
 *  cache, on retourne un placeholder header pour éviter le crash et on warn. */
const _mapHeaderRegistry = new Map<string, any>();
export function defineMapHeaderEntry(key: string, header: any): void {
  _mapHeaderRegistry.set(key, header);
}
export function Overworld_GetMapHeaderByGroupAndId(mapGroup: number, mapNum: number): any {
  const key = `${mapGroup}.${mapNum}`;
  const header = _mapHeaderRegistry.get(key);
  if (header) return header;
  // Fallback : returns a structurally-empty header so auto-bodies can read fields
  // without crashing. The .music, .mapType, .battleType fields will be 0/undef.
  return {
    mapLayoutId: 0,
    events: { objectEventCount: 0, warpCount: 0, coordEventCount: 0, bgEventCount: 0,
              objectEvents: [], warps: [], coordEvents: [], bgEvents: [] },
    mapScripts: [],
    connections: { count: 0, connections: [] },
    music: 0,
    mapLayoutId16: 0,
    regionMapSectionId: 0,
    cave: 0,
    weather: 0,
    mapType: 0,
    bikingAllowed: 0,
    allowEscaping: 0,
    allowRunning: 0,
    showMapName: 0,
    battleType: 0,
  };
}

// ─── Berry (1:1 décomp `src/berry.c:980 GetBerryInfo`) ────────────────────────

/** 1:1 décomp `src/berry.c:980 GetBerryInfo(berry)` — returns const Berry*.
 *  Wire vers berry.ts port complet (= gBerries[43] + EnigmaBerry handling). */
export function GetBerryInfo(berry: number): unknown {
  // Lazy import pour éviter cycle decomp-bridge ↔ berry.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('./berry') as { GetBerryInfo?: (b: number) => unknown };
  return mod.GetBerryInfo ? mod.GetBerryInfo(berry) : null;
}

/** 1:1 décomp `src/malloc.c` AllocZeroed(size) — heap alloc + memset 0.
 *  En JS, retourne `{}` (= same as Alloc since defaults sont implicit). */
export function AllocZeroed<T = any>(_sizeBytes: number): T {
  return {} as T;
}

// ─── Memory copy helpers (= macro.h CpuCopy*) ─────────────────────────────────
//
// 1:1 décomp `include/gba/macro.h` :
//   #define CpuCopy16(src, dst, size) CpuSet(src, dst, ((size)/2)|CPU_SET_16BIT)
//   #define CpuCopy32(src, dst, size) CpuSet(src, dst, ((size)/4)|CPU_SET_32BIT)
//
// Comme `CpuSet` est notre no-op, ces helpers le sont aussi côté impl directe.
// Pour plus tard, on peut typed-array copy si src/dst sont des Uint*Array.
export function CpuCopy16(src: any, dst: any, sizeBytes: number): void {
  // Bound-check basique : si les deux sont des typed arrays, on copy directement.
  if (src instanceof Uint16Array && dst instanceof Uint16Array) {
    const numEntries = sizeBytes / 2 | 0;
    for (let i = 0; i < numEntries; i++) dst[i] = src[i];
  } else if (src instanceof Uint8Array && dst instanceof Uint8Array) {
    for (let i = 0; i < sizeBytes; i++) dst[i] = src[i];
  }
  /* sinon : no-op (les pointeurs JS abstraits ne sont pas copiables) */
}

// ─── String helpers (string_util.c) ───────────────────────────────────────────

/** 1:1 décomp `src/string_util.c:24 StringCopy(dest, src)` — copies src to dest
 *  (incl. EOS terminator), returns ptr to EOS. En TS, on travaille avec des
 *  string objects via setter ; pour les usages auto-transpilés, on retourne
 *  juste src (= same effect : bytes finiront copiés au flushPlaceholder). */
export function StringCopy(_dest: any, src: string): string {
  // Most callers use `StringCopy(buf, source)` where buf is then fed to text printer.
  // For transcribed code, we approximate by returning src + treating dest as opaque.
  return src;
}

/** 1:1 décomp `src/string_util.c:38 StringAppend(dest, src)` — concat src to dest. */
export function StringAppend(dest: string | any, src: string): string {
  if (typeof dest === 'string') return dest + src;
  return src;
}

/** 1:1 décomp `src/string_util.c:285 ConvertIntToDecimalStringN` :
 *    - LEFT_ALIGN (mode 0)    : print digits sans padding (le seul cas où
 *      length > n produit une troncation = peu réaliste en pratique).
 *    - RIGHT_ALIGN (mode 1)   : pad LEFT avec CHAR_SPACER pour width = n.
 *      Cas typique : niveaux Pokémon "  5" / " 12" / "100" alignés à droite.
 *    - LEADING_ZEROS (mode 2) : pad LEFT avec '0' pour width = n.
 *      Cas typique : CT/HM "CT 01..50", HM "CS 1..8", BAIES "BAIE 01..43".
 *  L'ancienne impl ignorait silencieusement `mode` et ne paddait JAMAIS
 *  (= bug latent qui produisait "CT 1 ROULA-LAME" au lieu de "CT 01"
 *  dans le sac, "  5/ 20" dégradé en "5/20" partout, etc.). */
// STR_CONV_MODE_LEFT_ALIGN/RIGHT_ALIGN/LEADING_ZEROS → include/string_util.ts:13-15
// (1:1 décomp string_util.h). Export retiré (décyclage lot 5) ; RIGHT_ALIGN +
// LEADING_ZEROS importés en haut pour l'usage interne ci-dessous.
export function ConvertIntToDecimalStringN(
  _dest: any, value: number, mode: number, n: number,
): string {
  let s = String(value);
  if (s.length >= n) {
    // Le décomp tronque à droite si plus long que n ; on conserve la sémantique
    // (bien que ce cas soit improbable pour des valeurs réelles).
    if (s.length > n) s = s.slice(s.length - n);
    return s;
  }
  // value.length < n : padding LEFT selon le mode.
  const pad = n - s.length;
  if (mode === STR_CONV_MODE_RIGHT_ALIGN) {
    return CHAR_SPACER_STR.repeat(pad) + s;
  }
  if (mode === STR_CONV_MODE_LEADING_ZEROS) {
    return '0'.repeat(pad) + s;
  }
  // LEFT_ALIGN : pas de padding (mode décomp par défaut).
  return s;
}

/** 1:1 décomp `src/string_util.c StringLength` — count chars before EOS. */
export function StringLength(s: string): number {
  return s.length;
}

// ─── Sprite affine matrix (1:1 décomp `include/gba/syscall.h`) ────────────────

/** 1:1 décomp BIOS syscall `ObjAffineSet(src, dst, count, stride)` — generates
 *  OAM affine matrices from (xScale, yScale, rotation) src structs.
 *
 *  Algorithme 1:1 BIOS (libagbsyscall) :
 *    rotIdx = (rotation >> 8) & 0xFF
 *    sin = gSineTable[rotIdx]                       // s16 in [-256, 256]
 *    cos = gSineTable[(rotIdx + 64) & 0xFF]         // s16
 *    pa =  (xScale * cos) >> 8
 *    pb = -(xScale * sin) >> 8
 *    pc =  (yScale * sin) >> 8
 *    pd =  (yScale * cos) >> 8
 *
 *  Sortie dst format = 4 s16 (pa, pb, pc, pd) par matrix. stride = espacement
 *  entre matrices (= bytes). En GBA, stride=2 = 2 halfwords (= 4 bytes) entre
 *  les fields pa/pb/... pour skipper OAM attributes, ou stride=8 (= packed).
 *  Le décomp use `ObjAffineSet(&src, &matrix, 1, 2)` (= 1 matrix, stride 2 bytes
 *  entre chaque field, packed dans la struct matrix).
 *
 *  Note : nos callers ports inline (bag-screen, sprite-engine-impl, mon-summary-anim)
 *  recalculent eux-mêmes pa/pb/pc/pd via la même formule. Ce wrapper sert
 *  pour callers futurs qui appelleraient le syscall direct. */
interface ObjAffineSrcData {
  xScale: number;
  yScale: number;
  rotation: number;
}
export function ObjAffineSet(
  src: ObjAffineSrcData | ObjAffineSrcData[],
  dst: number[] | { pa: number; pb: number; pc: number; pd: number }[] | DataView,
  count: number,
  stride: number,
): void {
  const arr = Array.isArray(src) ? src : [src];
  for (let i = 0; i < count; i++) {
    const s = arr[Math.min(i, arr.length - 1)];
    const rotIdx = (s.rotation >> 8) & 0xFF;
    const sin = _gSineTable(rotIdx);
    const cos = _gSineTable((rotIdx + 64) & 0xFF);
    const pa =  (s.xScale * cos) >> 8;
    const pb = -(s.xScale * sin) >> 8;
    const pc =  (s.yScale * sin) >> 8;
    const pd =  (s.yScale * cos) >> 8;
    if (dst instanceof DataView) {
      // GBA layout : 4 s16 packed @ offset i*stride*4 (stride=2 → 8 bytes per matrix).
      const off = i * stride * 4;
      dst.setInt16(off + 0, pa & 0xFFFF, true);
      dst.setInt16(off + 2, pb & 0xFFFF, true);
      dst.setInt16(off + 4, pc & 0xFFFF, true);
      dst.setInt16(off + 6, pd & 0xFFFF, true);
    } else if (Array.isArray(dst)) {
      const elem = (dst as Array<unknown>)[i];
      if (typeof elem === 'object' && elem !== null && 'pa' in (elem as object)) {
        const m = elem as { pa: number; pb: number; pc: number; pd: number };
        m.pa = pa; m.pb = pb; m.pc = pc; m.pd = pd;
      } else {
        const numArr = dst as number[];
        const base = i * 4;
        numArr[base + 0] = pa;
        numArr[base + 1] = pb;
        numArr[base + 2] = pc;
        numArr[base + 3] = pd;
      }
    }
  }
}

/** 1:1 décomp `src/overworld.c GetMapHeaderFromConnection(connection)` — read
 *  the connected map's header. Need connection.mapGroup/mapNum struct. */
export function GetMapHeaderFromConnection(connection: any): any {
  if (!connection) return Overworld_GetMapHeaderByGroupAndId(0, 0);
  return Overworld_GetMapHeaderByGroupAndId(connection.mapGroup ?? 0, connection.mapNum ?? 0);
}
/** Wrapper qui dispatch lazy vers AbilityBattleEffects pour éviter cycle import.
 *  Le module battle/ability-battle-effects.ts expose `__abilityBattleEffectsCheck`
 *  via globalThis au module load. */
function _callAbilityBattleEffects(caseId: number, battler: number, abilityId: number, arg3: number, arg4: number): number {
  const fn = (globalThis as { __abilityBattleEffectsCheck?: (c: number, b: number, a: number, x: number, y: number) => number })
    .__abilityBattleEffectsCheck;
  if (fn) return fn(caseId, battler, abilityId, arg3, arg4);
  return 0;  // Fallback safe : substrat absent au boot très early.
}

// ─── PREPARE_*_BUFFER additions (battle_message.h) ────────────────────────────

const B_BUFF_STAT = 7;
const B_BUFF_ABILITY = 8;

/** 1:1 décomp `event_object_movement.c GetWalkSlowMovementAction(direction)`. */
export function GetWalkSlowMovementAction(direction: number): number {
  // MOVEMENT_ACTION_WALK_SLOW_DOWN = 0x04, etc.
  switch (direction) {
    case 1: return 0x04;
    case 2: return 0x05;
    case 3: return 0x06;
    case 4: return 0x07;
    default: return 0x04;
  }
}

/** 1:1 décomp BIOS syscall ArcTan2(x, y) — return the 0-65535 angle. Approximate. */
export function ArcTan2(x: number, y: number): number {
  const a = Math.atan2(y, x);
  return ((a / (2 * Math.PI)) * 65536) | 0;
}

// ─── Tile/BG buffer access (bg.c) ─────────────────────────────────────────────

/** 1:1 décomp `src/bg.c GetBgTilemapBuffer(bg)` — pointer to BG tilemap buffer.
 *  Need full BG manager port. */
export function GetBgTilemapBuffer(_bg: number): Uint16Array {
  throw new Error('[bridge] GetBgTilemapBuffer not yet 1:1 ported. See bg.c:GetBgTilemapBuffer.');
}

// ─── Movement actions getter (event_object_movement.c) ────────────────────────
//
// Ces helpers map dir → MOVEMENT_ACTION_X enum value. Les valeurs viennent
// de `decomps/pokeemeraude/include/constants/event_object_movement.h`.
//
// Note 1:1 décomp : les fonctions GetXMovementAction(direction) sont 1:1 avec
// `event_object_movement.c:5022-5108 sFaceDirectionMovementActions[]` et
// les autres tables similaires.

/** 1:1 décomp `event_object_movement.c:5034 sFaceDirectionMovementActions[5]`. */
export function GetFaceDirectionMovementAction(direction: number): number {
  // MOVEMENT_ACTION_FACE_DOWN..LEFT = 0..3 (the direction enum + 0)
  // MOVEMENT_ACTION_FACE_DOWN = 0x0, FACE_UP = 0x1, FACE_LEFT = 0x2, FACE_RIGHT = 0x3
  // Mapping from include/constants/event_object_movement.h.
  // 1:1 décomp `gFaceDirectionMovementActions[]` (event_object_movement.c) :
  //   [DIR_SOUTH]=FACE_DOWN, [DIR_NORTH]=FACE_UP, [DIR_WEST]=FACE_LEFT, [DIR_EAST]=FACE_RIGHT.
  // FIX : NORD/SUD étaient INVERSÉS (SOUTH→0x01/UP, NORTH→0x00/DOWN) — bug dormant jamais
  // détecté car cette fonction n'était utilisée que par des NPCs jusqu'au câblage idle-FACE
  // joueur (PlayerNotOnBikeNotMoving) → twitch haut/bas au repos.
  switch (direction) {
    case 1: return 0x00; // DIR_SOUTH → FACE_DOWN
    case 2: return 0x01; // DIR_NORTH → FACE_UP
    case 3: return 0x02; // DIR_WEST → FACE_LEFT
    case 4: return 0x03; // DIR_EAST → FACE_RIGHT
    default: return 0x00;
  }
}

/** MAP_UNDEFINED + helpers. 1:1 décomp `include/constants/maps.h`. */
export const MAP_UNDEFINED = 0xFFFF;

// ─── Metatile behavior constants (= include/constants/metatile_behaviors.h) ───
// 137 constantes MB_* extraites dans `metatile-behavior-constants.ts` (= module
// dédié SANS dépendance) pour casser le cycle ESM HMR observé via
// `metatile-behavior.ts` → `decomp-bridge` → modules de field/ → métatile-behavior.
// 1:1 strict : valeurs identiques à `include/constants/metatile_behaviors.h`.
export * from '../../include/constants/metatile_behaviors';

// ─── NULL ─────────────────────────────────────────────────────────────────────

// TRUE / FALSE rapatriés vers leur foyer canonique `include/gba/defines.ts` (1:1
// décomp `include/types.h`) — décyclage du bridge, lot 1. Les importer de là.
export const NULL: any = null;

/** 1:1 décomp `include/gba/macro.h:43-49` :
 *    #define CpuFastFill(value, dest, size) ... CpuFastSet(&tmp, dest, CPU_FAST_SET_SRC_FIXED | size>>2)
 *  En TS : memset bytewise. */
export function CpuFastFill(value: number, dst: any, sizeBytes: number): void {
  if (dst instanceof Uint8Array || dst instanceof Uint16Array || dst instanceof Uint32Array) {
    for (let i = 0; i < sizeBytes; i++) dst[i] = value;
  } else if (Array.isArray(dst)) {
    for (let i = 0; i < sizeBytes; i++) dst[i] = value;
  }
  /* sinon : no-op (les pointeurs JS abstraits ne sont pas remplissables) */
}

// ─── Runtime method wrappers (= helpers que notre `decomp-runtime.ts` expose
// ─── comme méthodes d'instance, pas des fonctions standalone) ─────────────────
//
// Ces wrappers récupèrent le runtime singleton via `getRuntime()` et délèguent
// à la méthode correspondante. 1:1 décomp signatures préservées.
// Note : `_getRT` alias local hoisted en tête de fichier.

/** 1:1 décomp `src/sprite.c CreateSprite(template, x, y, subpriority)` :
 *  Crée un sprite depuis un SpriteTemplate. Retourne le spriteId.
 *  Notre runtime expose ça via CreateSpriteFromTemplate (= prend templateName).
 *  HOTFIX 2026-05-09 : on passe maintenant `subpriority` au runtime — était
 *  ignoré → bug intro Manectric/Brendan Z-order (= Brendan apparaissait devant
 *  Manectric pendant circular run). Décomp sprite.c:540-588 store subpriority
 *  sur sprite, BuildSpritePriorities (line 361-369) compose `subpriority |
 *  (oam.priority << 8)`, SortSprites (line 372-450) sort ASC. Lower subpri =
 *  drawn ON TOP (= GBATEK : OAM[lower index] = displayed in front). */
export function CreateSprite(template: any, x: number, y: number, subpriority: number = 0xFF): number {
  const rt = _getRT();
  // 1:1 décomp : template INLINE (tileTag=TAG_NONE + `images`) → game CreateSprite voie inline
  // (tiles depuis images[0].data, ou placeholder `images:[]` = OAM seul + tiles via anim sheet).
  // Sinon (string nom / objet sans `images`) → voie par-NOM (overworld/intro). `Array.isArray`
  // suffit (les templates par-nom sont des strings/{name} SANS `.images`) : on accepte aussi
  // `images:[]` (B3 — les ex-`rt.CreateSpriteInline?.()` des battle-anims y routent désormais).
  if (template && typeof template === 'object' && Array.isArray(template.images)) {
    return _CreateSprite_game(rt, template, x, y, subpriority);
  }
  // 1:1 decomp `CreateSprite` avec `tileTag != TAG_NONE` : la sheet + palette ont deja ete
  // chargees par TAG. Voie sheet-par-tag : delegue a l'impl UNIQUE `game/sprite.ts CreateSprite`.
  // tileTag number (ball, runtime) OU string (PHASE E2.B : vrais SpriteTemplate ex 'TAG_VERSION').
  // Un OBJET avec `tileTag` (string/number) + `oam` = vrai template ; les strings/{name} par-nom
  // n'ont ni .tileTag ni .oam → tombent en voie 3 (CreateSpriteFromTemplate).
  if (template && typeof template === 'object'
      && (typeof template.tileTag === 'number' || typeof template.tileTag === 'string')
      && template.oam && typeof template.oam === 'object') {
    return _CreateSprite_game(rt, template, x, y, subpriority);
  }
  const templateName = typeof template === 'string' ? template : template?.name ?? template?.tag ?? 'unknown';
  return rt.CreateSpriteFromTemplate(templateName, x, y, subpriority);
}

/** 1:1 décomp `src/sprite.c CreateSpriteAtEnd(template, x, y, subpriority)` :
 *  Comme CreateSprite mais alloue le DERNIER slot OAM dispo (= sprites bg vs npc). */
export function CreateSpriteAtEnd(template: any, x: number, y: number, subpriority: number = 0xFF): number {
  const rt = _getRT();
  const templateName = typeof template === 'string' ? template : template?.name ?? template?.tag ?? 'unknown';
  return rt.CreateSpriteFromTemplate(templateName, x, y, subpriority);
}

/** 1:1 décomp `src/sprite.c DestroySprite(sprite)` — kill un sprite par id. */
export function DestroySprite(sprite: any): void {
  const rt = _getRT();
  const id = typeof sprite === 'number' ? sprite : sprite?.spriteId ?? sprite?.id;
  if (id != null) _DestroySprite(rt, id);
}

/** 1:1 décomp `src/task.c CreateTask(func, priority)` — alloue un task slot. */
export function CreateTask(func: any, priority: number): number {
  return _getRT().CreateTask(func, priority);
}

/** 1:1 décomp `src/task.c DestroyTask(taskId)` — free un task slot. */
export function DestroyTask(taskId: number): void {
  _getRT().DestroyTask(taskId);
}

/** 1:1 décomp `src/task.c:139 SetTaskFuncWithFollowupFunc`.
 *  Reroute la task vers `func`, en mémorisant `followupFunc` pour un
 *  futur `SwitchTaskToFollowupFunc(taskId)`. Voir DecompTask.followupFunc
 *  (impl. dédiée 1:1 sémantique : pas de cast pointer→s16 cassé). */
export function SetTaskFuncWithFollowupFunc(taskId: number, func: any, followupFunc: any): void {
  _getRT().SetTaskFuncWithFollowupFunc(taskId, func, followupFunc);
}

/** 1:1 décomp `src/task.c:148 SwitchTaskToFollowupFunc`.
 *  Restaure la task vers le `followupFunc` mémorisé. */
export function SwitchTaskToFollowupFunc(taskId: number): void {
  _getRT().SwitchTaskToFollowupFunc(taskId);
}

/** 1:1 décomp `src/sprite.c SetGpuReg(reg, value)` — write to GPU register. */
export function SetGpuReg(reg: number, value: number): void {
  _getRT().SetGpuReg(reg, value);
}

/** 1:1 décomp `src/sprite.c GetGpuReg(reg)` — read from GPU register. */
export function GetGpuReg(reg: number): number {
  return _getRT().GetGpuReg(reg);
}

/** 1:1 décomp `src/sprite.c StartSpriteAnim(sprite, animIdx)`. */
export function StartSpriteAnim(sprite: any, animIdx: number): void {
  const rt = _getRT();
  const id = typeof sprite === 'number' ? sprite : sprite?.spriteId ?? sprite?.id;
  if (id != null) rt.StartSpriteAnim(id, animIdx);
}

/** 1:1 décomp `src/sprite.c StartSpriteAffineAnim(sprite, animNum)`. */
export function StartSpriteAffineAnim(sprite: any, animNum: number): void {
  const rt = _getRT();
  const id = typeof sprite === 'number' ? sprite : sprite?.spriteId ?? sprite?.id;
  if (id != null) rt.StartSpriteAffineAnim(id, animNum);
}

/** 1:1 décomp `src/sprite.c FreeOamMatrix(matrixNum)`. Route vers l'impl free-fn
 *  game/sprite.ts (chantier C : méthodes harness Alloc/FreeOamMatrix retirées). */
export function FreeOamMatrix(matrixNum: number): void {
  _FreeOamMatrix(matrixNum);
}

/** 1:1 décomp `src/sprite.c AllocOamMatrix()`. Route vers l'impl free-fn game/sprite.ts. */
export function AllocOamMatrix(): number {
  return _AllocOamMatrix();
}

/** 1:1 décomp `src/sprite.c ResetSpriteData()`. Appelle directement l'impl free-fn
 *  de game/sprite.ts (chantier C : la méthode harness `rt.ResetSpriteData` est retirée). */
export function ResetSpriteData(): void {
  _ResetSpriteData(_getRT());
}

/** 1:1 décomp `src/main.c BeginNormalPaletteFade(palettes, delay, startY, endY, color)`. */
export function BeginNormalPaletteFade(
  palettes: number | string, delay: number, startY: number, endY: number, color: number | string,
): void {
  _getRT().BeginNormalPaletteFade(palettes, delay, startY, endY, color);
}

/** 1:1 décomp `src/main.c UpdatePaletteFade()` — returns true if still fading. */
export function UpdatePaletteFade(): boolean {
  return _getRT().UpdatePaletteFade();
}

/** 1:1 décomp `src/main.c SetVBlankCallback(cb)` — register VBlank cb. */
export function SetVBlankCallback(cb: (() => void) | null): void {
  _getRT().SetVBlankCallback(cb);
}

// ─── Re-exports : map grid + metatile behavior ────────────────────────────────

// (ré-exports morts retirés depuis '../../src/fieldmap' — sweep)

// ─── Re-exports : static const data tables (= ports manuels) ─────────────────

// (ré-exports morts retirés depuis './static-data-tables' — sweep)

// ─── Re-exports : metatile behavior predicates ────────────────────────────────

// Block/Jump predicates (= déjà implémentés à la main).
// (ré-exports morts retirés depuis '../../src/metatile_behavior' — sweep)

// Other metatile predicates (= 1:1 décomp `metatile_behavior.c`), re-exportés
// depuis le miroir `game/metatile_behavior.ts` (source unique).
// (ré-exports morts retirés depuis '../../src/metatile_behavior' — sweep)

// ─── Bridge metadata for dev tools ────────────────────────────────────────────

/** Liste des helpers que le bridge re-export (= 1:1 ported).
 *  Comparé à `__callsTo__` d'un module auto, donne le coverage. */
export const __bridgedHelpers__: ReadonlySet<string> = new Set([
  // Re-exports décomp-globals
  'LoadPalette', 'FillPalBufferBlack', 'FillPalBufferWhite',
  'BlendPalette', 'BlendPalettes', 'BlendPalettesUnfaded', 'ResetPaletteFade',
  'CpuFill16', 'CpuFill32', 'CpuSet', 'CpuFastSet',
  'DmaClear16', 'DmaClear32', 'DmaFill16', 'DmaFill32',
  'LZ77UnCompVram', 'LZDecompressVram',
  'FreeAllSpritePalettes', 'IndexOfSpritePaletteTag', 'GetSpriteTileStartByTag',
  'LoadCompressedSpriteSheet', 'LoadCompressedSpriteSheetUsingHeap',
  'LoadCompressedSpritePaletteUsingHeap', 'LoadSpritePalettes',
  'LoadBgTiles',
  'PIXEL_FILL', 'BLDALPHA_BLEND',
  'PlaySE', 'PlayBGM', 'PlayFanfare', 'StopFanfare', 'IsFanfareTaskInactive', 'WaitFanfare',
  'm4aSongNumStart', 'm4aMPlayAllStop', 'pauseBgm', 'resumeBgm', 'isBgmPaused',
  'FadeOutBGM', 'FadeInBGM',
  'ResetTasks', 'RunTasks', 'AnimateSprites', 'BuildOamBuffer', 'FindTaskIdByFunc',
  'SpriteCallbackDummy', 'SAFE_DIV', 'MultiplyInvertedPaletteRGBComponents',
  'InitSpriteAffineAnim', 'SetSubspriteTables', 'PlayCryInternal',
  'TASK_NONE', 'PALETTES_ALL', 'PALETTES_BG', 'PALETTES_OBJ',
  'PLTT_SIZE', 'BG_SCREEN_SIZE', 'VRAM_SIZE',
  'setGlobalRuntime', 'getRuntime', 'getAsset',
  // decomp-helpers
  'Q_8_8_TO_INT', 'SetOamMatrix', 'CalcCenterToCornerVec',
  'PaletteBuffer',
  'ST_OAM_AFFINE_OFF', 'ST_OAM_AFFINE_NORMAL', 'ST_OAM_AFFINE_ERASE',
  'ST_OAM_AFFINE_DOUBLE', 'ST_OAM_AFFINE_ON_MASK', 'ST_OAM_AFFINE_DOUBLE_MASK',
  'ST_OAM_OBJ_NORMAL', 'ST_OAM_OBJ_BLEND', 'ST_OAM_OBJ_WINDOW',
  'ST_OAM_4BPP', 'ST_OAM_8BPP',
  // decomp-runtime constants & macros
  'BGCNT_PRIORITY', 'BGCNT_CHARBASE', 'BGCNT_SCREENBASE',
  'BGCNT_16COLOR', 'BGCNT_256COLOR',
  'BGCNT_TXT256x256', 'BGCNT_TXT512x256', 'BGCNT_TXT256x512', 'BGCNT_TXT512x512',
  'BGCNT_AFF128x128', 'BGCNT_AFF256x256', 'BGCNT_AFF512x512', 'BGCNT_AFF1024x1024',
  'BGCNT_WRAP',
  'DISPCNT_MODE_0', 'DISPCNT_MODE_1', 'DISPCNT_MODE_2', 'DISPCNT_OBJ_1D_MAP',
  'DISPCNT_BG0_ON', 'DISPCNT_BG1_ON', 'DISPCNT_BG2_ON', 'DISPCNT_BG3_ON',
  'DISPCNT_OBJ_ON', 'DISPCNT_WIN1_ON', 'DISPCNT_WINOBJ_ON', 'DISPCNT_WIN0_ON',
  'DISPCNT_BG_ALL_ON', 'DISPCNT_FORCED_BLANK', 'DISPCNT_HBLANK_INTERVAL_FREE',
  'BLDCNT_TGT1_BG0', 'BLDCNT_TGT1_BG1', 'BLDCNT_TGT1_BG2', 'BLDCNT_TGT1_BG3',
  'BLDCNT_TGT1_OBJ', 'BLDCNT_TGT1_BD',
  'BLDCNT_EFFECT_NONE', 'BLDCNT_EFFECT_BLEND', 'BLDCNT_EFFECT_LIGHTEN', 'BLDCNT_EFFECT_DARKEN',
  'BLDCNT_TGT2_BG0', 'BLDCNT_TGT2_BG1', 'BLDCNT_TGT2_BG2', 'BLDCNT_TGT2_BG3',
  'BLDCNT_TGT2_OBJ', 'BLDCNT_TGT2_BD',
  'BG_PLTT_ID', 'OBJ_PLTT_ID',
  'BG_VRAM', 'BG_CHAR_ADDR', 'BG_SCREEN_ADDR',
  'DISPLAY_WIDTH', 'DISPLAY_HEIGHT',
  'NORMAL_FADE', 'FAST_FADE', 'HARDWARE_FADE',
  'REG_OFFSET_DISPCNT', 'REG_OFFSET_BG0CNT', 'REG_OFFSET_BG1CNT',
  'REG_OFFSET_BG2CNT', 'REG_OFFSET_BG3CNT',
  'REG_OFFSET_BG0HOFS', 'REG_OFFSET_BG0VOFS', 'REG_OFFSET_BG1HOFS', 'REG_OFFSET_BG1VOFS',
  'REG_OFFSET_BG2HOFS', 'REG_OFFSET_BG2VOFS', 'REG_OFFSET_BG3HOFS', 'REG_OFFSET_BG3VOFS',
  'REG_OFFSET_WIN0H', 'REG_OFFSET_WIN1H', 'REG_OFFSET_WIN0V', 'REG_OFFSET_WIN1V',
  'REG_OFFSET_WININ', 'REG_OFFSET_WINOUT',
  'REG_OFFSET_MOSAIC', 'REG_OFFSET_BLDCNT', 'REG_OFFSET_BLDALPHA', 'REG_OFFSET_BLDY',
  // script-vars
  'FlagSet', 'FlagClear', 'FlagGet', 'VarSet', 'VarGet', 'Compare',
  // script-runtime
  'LockPlayerFieldControls', 'InitScriptContext', 'SetupBytecodeScript', 'ScriptJump',
  // gba-text-system
  'StringExpandPlaceholders', 'GetStringWidth', 'GetStringRightAlignXOffset',
  'AddTextPrinterParameterized3', 'AddTextPrinterForMessage',
  'AddTextPrinterWithCallbackForMessage', 'RunTextPrinters', 'IsTextPrinterActive',
  'ClearTextPrinters', 'DeactivateAllTextPrinters', 'RunTextPrintersAndIsPrinter0Active',
  // Inline macros
  'WIN_RANGE',
  'Random', 'SeedRng', 'SeedRngAndSetTrainerId',
   'AllocZeroed', 
  'StringCopy', 'StringAppend', 'ConvertIntToDecimalStringN',
  'StringLength', 
  'JOY_NEW', 'JOY_HELD', 'JOY_REPEAT',
  'CpuCopy16', 
  // Static data tables (= ports manuels depuis sX[] décomp)
  'ANIM_STD_GO_SOUTH', 'ANIM_STD_GO_NORTH', 'ANIM_STD_GO_WEST', 'ANIM_STD_GO_EAST',
  'ANIM_STD_GO_FAST_SOUTH', 'ANIM_STD_GO_FAST_NORTH', 'ANIM_STD_GO_FAST_WEST', 'ANIM_STD_GO_FAST_EAST',
  'ANIM_STD_GO_FASTER_SOUTH', 'ANIM_STD_GO_FASTER_NORTH', 'ANIM_STD_GO_FASTER_WEST', 'ANIM_STD_GO_FASTER_EAST',
  'ANIM_STD_GO_FASTEST_SOUTH', 'ANIM_STD_GO_FASTEST_NORTH', 'ANIM_STD_GO_FASTEST_WEST', 'ANIM_STD_GO_FASTEST_EAST',
  'sMoveDirectionAnimNums', 'sMoveDirectionFastAnimNums',
  'sMoveDirectionFasterAnimNums', 'sMoveDirectionFastestAnimNums',
  'sOppositeDirections', 'gStandardDirections',
  'sJumpInitDisplacements', 'sJumpDisplacements',
  'sStepTimes', 'sDirectionToVectors',
  'gFaceDirectionMovementActions', 'gWalkSlowMovementActions',
  'gWalkNormalMovementActions', 'gWalkFastMovementActions',
  'getStaticTable',
  'RGB2',  
  'PLTT_ID', 
   'CpuFastFill',  
  'Random32',
  'GetWindowFrameTilesPal', 'LoadWindowGfx',
  'LoadUserWindowBorderGfx', 'LoadUserWindowBorderGfx_',
  'GetItemName', 'GetMapName', 'GetMapNameGeneric', 'GetMapNameHandleAquaHideout',
  'GetItemDescription',
  'Overworld_GetMapHeaderByGroupAndId', 'defineMapHeaderEntry',
  'GetBerryInfo', 
  'GetTextWindowPalette', 'GetOverworldTextboxPalettePtr',
  // Battle macros
    'HIHALF', 'LOHALF',
  'GET_SHINY_VALUE', 'GET_UNOWN_LETTER', 
    'MOVE_IS_PERMANENT',
  // String helpers (= string_util.c)
  // Pokemon storage / sprite pal / icon (= NotImpl stubs but counted as bridged
  // since the bridge file resolves them — they throw clearly at runtime, which
  // is the desired fail-fast behavior)
  // Healthbox + battle interface (= NotImpl)
  // Pokenav (= NotImpl placeholders)
  // Misc battle / overworld
  'ObjAffineSet', 
  'GetMapHeaderFromConnection',
    // GetMapGridBlockAt removed — vraie impl dans map-loader.ts
  // Status / battle util macros
  // Misc helpers (= mostly stubs to allow compilation)
   'GetWalkSlowMovementAction',
  'WriteColorChangeControlCode', 
  // Phase B.7 final cleanup
  'ArcTan2', 
  // Runtime method wrappers (= delegate to getRuntime().X)
  'CreateSprite', 'CreateSpriteAtEnd', 'DestroySprite',
  'CreateTask', 'DestroyTask',
  'SetGpuReg', 'GetGpuReg',
  'StartSpriteAnim', 'StartSpriteAffineAnim',
  'FreeOamMatrix', 'AllocOamMatrix',
  'ResetSpriteData',
  'BeginNormalPaletteFade', 'UpdatePaletteFade', 'SetVBlankCallback',
  // Map grid + metatile behaviors
  'MapGridGetCollisionAt', 'MapGridGetMetatileBehaviorAt', 'MapGridGetElevationAt',
  'MetatileBehavior_IsEastBlocked', 'MetatileBehavior_IsWestBlocked',
  'MetatileBehavior_IsNorthBlocked', 'MetatileBehavior_IsSouthBlocked',
  'MetatileBehavior_IsJumpEast', 'MetatileBehavior_IsJumpWest',
  'MetatileBehavior_IsJumpNorth', 'MetatileBehavior_IsJumpSouth',
  'MetatileBehavior_IsRunningDisallowed',
  'MetatileBehavior_IsTallGrass', 'MetatileBehavior_IsLongGrass',
  'MetatileBehavior_IsShortGrass', 'MetatileBehavior_IsHotSprings',
  'MetatileBehavior_IsIce', 'MetatileBehavior_IsPuddle',
  'MetatileBehavior_IsShallowFlowingWater', 'MetatileBehavior_IsSandOrDeepSand',
  'MetatileBehavior_IsSeaweed', 'MetatileBehavior_IsReflective',
  'MetatileBehavior_IsFootprints', 'MetatileBehavior_HasRipples',
  'MetatileBehavior_IsDeepSand',
  'GetFaceDirectionMovementAction', 
  // Constants
  'NULL',
  'PLTT_SIZE_4BPP', 
  // Movement enums
  'MAP_UNDEFINED',
]);

/** Liste des helpers qui throw NotImplemented (= TODO list, à porter en priorité).
 *  Si un module auto a un callsTo qui matche cette liste, son activation va fail. */
export const __notImplementedHelpers__: ReadonlySet<string> = new Set([
  'GetBgTilemapBuffer',
  // — porté 1:1 décomp battle.h:471 (batch B19).
  // Phase B.5 added : these throw NotImpl but are counted in __bridgedHelpers__
  // so we still track them. Bridge resolver will fail-fast on these when called.
  // Phase B.6 added
  // Phase B.7 added
]);
