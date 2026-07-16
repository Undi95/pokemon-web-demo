/**
 * mystery_event_script.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/mystery_event_script.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/mystery_event_script.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 *
 * ── STATUT : INERTE (transcrit, PAS câblé) ────────────────────────────────────
 * Sous-système Mystery Event = réception d'un blob de distribution (câble link /
 * e-Reader / record-mixing) puis blit de ses structs BRUTES en mémoire save. C'est
 * du HARDWARE irremplaçable (pas d'espace d'adressage plat, pas de blob binaire reçu,
 * pas de structs brutes chez nous : nos objets sont décodés). Le fichier n'est importé
 * NULLE PART : il ne s'exécute jamais. On le transcrit 1:1 en structure ; là où une
 * opération est irremplaçable, un cast `as unknown as X` MIROIR du cast C (`(u8*)`,
 * `(void*)`, `*(struct T*)`, `memcpy`) préserve la FORME de l'appel — annoté, INERTE.
 *
 * Fonctions décomp NON PORTÉES appelées ici → références locales qui LÈVENT (pas de
 * stub silencieux) : InitRamScript (script.c:381), ValidateEReaderTrainer
 * (battle_tower.c:2933), UnlockTrendySaying (easy_chat.c:5453). Cf. rapport.
 */

import { CpuFill16 } from '../harness/runtime/decomp-globals';
import { PARTY_SIZE, POKEMON_NAME_LENGTH } from '../include/constants/global';
import { SPECIES_EGG } from '../include/constants/species';
import { VAR_ENIGMA_BERRY_AVAILABLE } from '../include/constants/vars';
import { MON_DATA_HELD_ITEM, MON_DATA_SPECIES_OR_EGG } from '../include/pokemon';
import { FLAG_SET_CAUGHT, FLAG_SET_SEEN } from '../include/pokedex';
import { getString } from '../harness/runtime/decomp-strings';
import { BERRY_NAME_LENGTH, IsEnigmaBerryValid, SetEnigmaBerry } from './berry';
import { SpeciesToNationalPokedexNum } from './engine/data/game-data';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { EnableNationalPokedex, EnableResetRTC, VarSet } from './event_data';
import { GiveGiftRibbonToParty } from './give_gift_ribbon_to_party';
import { GiveMailToMon, ItemIsMail } from './mail_data';
import { CalculatePlayerPartyCount, GetMonData, gPlayerParty, gPlayerPartyCount } from './pokemon';
import { GetSetPokedexFlag } from './pokedex';
import { CompactPartySlots } from './pokemon_storage_system';
import { InitScriptContext, RunScriptCommand, RunScriptImmediately, ScriptReadByte, ScriptReadHalfword, ScriptReadWord, SetupBytecodeScript, StopScript } from './script';
import { StringCompare, StringCopyN, StringExpandPlaceholders, gStringVar1, gStringVar2, gStringVar4 } from './string_util';
import { encodeOwText } from './text';
import { CalcByteArraySum, CalcCRC16 } from './util';
import type { Pokemon } from './pokemon';
import type { Mail } from './engine/save/save-blocks';
import type { ScrCmdFunc, ScriptContext, ScriptPtr } from './script';

// ─── constantes décomp inlinées (1:1 include/mystery_event_script.h:4-10) ─────
const MEVENT_STATUS_LOAD_OK = 0;    // enum MEVENT_STATUS
const MEVENT_STATUS_LOAD_ERROR = 1;
const MEVENT_STATUS_SUCCESS = 2;
const MEVENT_STATUS_FAILURE = 3;
const MEVENT_STATUS_FF = 255;       // = 0xFF

// 0x1 in FireRed, 0x2 in LeafGreen, 0x80 in Ruby, 0x100 in Sapphire
const VERSION_MASK = (1 << 9); // 1:1 mystery_event_script.c:23

// #define mScriptBase data[0]  ·  mOffset data[1]  ·  mStatus data[2]  ·  mValid data[3]
// (macros décomp mystery_event_script.c:25-28 — expansées aux usages `ctx.data[N]`)

// ─── Fonctions décomp NON PORTÉES appelées par ce module ──────────────────────
// Références locales qui LÈVENT (pas de stub silencieux). Fichier INERTE : jamais
// exécutées. Câblage futur → l'erreur est explicite. Cf. rapport de transpile.
/** NON PORTÉ — 1:1 `InitRamScript` (script.c:381). Écrit un script en RAM (RAM-script
 *  overworld) : dépend de ClearRamScript / CalculateRamScriptChecksum, non portés. */
function InitRamScript(script: number, size: number, mapGroup: number, mapNum: number, objectId: number): boolean {
  throw new Error('non porté : InitRamScript (mystery event)');
}
/** NON PORTÉ — 1:1 `ValidateEReaderTrainer` (battle_tower.c:2933). Dépend de
 *  ClearEReaderTrainer, non porté. */
function ValidateEReaderTrainer(): void {
  throw new Error('non porté : ValidateEReaderTrainer (mystery event)');
}
/** NON PORTÉ — 1:1 `UnlockTrendySaying` (easy_chat.c:5453). */
function UnlockTrendySaying(index: number): void {
  throw new Error('non porté : UnlockTrendySaying (mystery event)');
}

// 1:1 `EWRAM_DATA static struct ScriptContext sMysteryEventScriptContext = {0}`
// (mystery_event_script.c:30). `= {0}` (zero-init) : mode=STOPPED(0), pointeurs null,
// pile/data à 0 ; cmdTable posé par InitScriptContext.
const sMysteryEventScriptContext: ScriptContext = {
  stackDepth: 0,
  mode: 0,
  comparisonResult: 0,
  nativePtr: null,
  scriptPtr: null,
  stack: new Array<ScriptPtr | null>(20).fill(null),
  cmdTable: [],
  cmdTableEnd: 0,
  data: [0, 0, 0, 0],
};

/** 1:1 `static bool32 CheckCompatibility(u16 unk0, u32 unk1, u16 unk2, u32 version)` (mystery_event_script.c:32-50). */
function CheckCompatibility(unk0: number, unk1: number, unk2: number, version: number): boolean {
  // 0x1 in English FRLG, 0x2 in English RS, 0x4 in German RS
  if (!(unk0 & 0x1))
    return false;
  // Same as above
  if (!(unk1 & 0x1))
    return false;
  // 0x1 in FRLG, 0x4 in RS
  if (!(unk2 & 0x4))
    return false;
  if (!(version & VERSION_MASK))
    return false;
  return true;
}

/** 1:1 `static void SetIncompatible(void)` (mystery_event_script.c:52-56). */
function SetIncompatible(): void {
  StringExpandPlaceholders(gStringVar4, getString('gText_MysteryEventCantBeUsed'));
  SetMysteryEventScriptStatus(MEVENT_STATUS_FAILURE);
}

/** 1:1 `static void InitMysteryEventScript(struct ScriptContext *ctx, u8 *script)` (mystery_event_script.c:58-66). */
function InitMysteryEventScript(ctx: ScriptContext, script: ScriptPtr): void {
  InitScriptContext(ctx, gMysteryEventScriptCmdTable, gMysteryEventScriptCmdTableEnd);
  SetupBytecodeScript(ctx, script);
  // 1:1 `ctx->mScriptBase = (u32)script`. Pas d'espace d'adressage plat : on stocke
  // l'offset logique du blob (script.off). INERTE (la remise-en-base ne s'exécute jamais).
  ctx.data[0] /* mScriptBase */ = script.off >>> 0;
  ctx.data[1] /* mOffset */ = 0;
  ctx.data[2] /* mStatus */ = MEVENT_STATUS_LOAD_OK;
  ctx.data[3] /* mValid */ = 0 /* FALSE */;
}

/** 1:1 `static bool32 RunMysteryEventScriptCommand(struct ScriptContext *ctx)` (mystery_event_script.c:68-74). */
function RunMysteryEventScriptCommand(ctx: ScriptContext): boolean {
  if (RunScriptCommand(ctx) && ctx.data[3] /* mValid */)
    return true;
  else
    return false;
}

/** 1:1 `void InitMysteryEventScriptContext(u8 *script)` (mystery_event_script.c:76-79). */
export function InitMysteryEventScriptContext(script: ScriptPtr): void {
  InitMysteryEventScript(sMysteryEventScriptContext, script);
}

/** 1:1 `bool32 RunMysteryEventScriptContextCommand(u32 *status)` (mystery_event_script.c:81-87).
 *  Adaptation : l'out-param `u32 *status` → box `{ v: number }`. */
export function RunMysteryEventScriptContextCommand(status: { v: number }): boolean {
  let ret = RunMysteryEventScriptCommand(sMysteryEventScriptContext);
  status.v = sMysteryEventScriptContext.data[2] /* mStatus */;
  return ret;
}

/** 1:1 `u32 RunMysteryEventScript(u8 *script)` (mystery_event_script.c:89-96). */
export function RunMysteryEventScript(script: ScriptPtr): number {
  let ctx = sMysteryEventScriptContext;
  InitMysteryEventScript(ctx, script);
  while (RunMysteryEventScriptCommand(ctx))
    ;
  return ctx.data[2] /* mStatus */;
}

/** 1:1 `void SetMysteryEventScriptStatus(u32 status)` (mystery_event_script.c:98-101). */
export function SetMysteryEventScriptStatus(status: number): void {
  sMysteryEventScriptContext.data[2] /* mStatus */ = status;
}

/** 1:1 `static int CalcRecordMixingGiftChecksum(void)` (mystery_event_script.c:103-113). */
function CalcRecordMixingGiftChecksum(): number {
  let i = 0;
  let sum = 0;
  // 1:1 `u8 *data = (u8 *)(&gSaveBlock1Ptr->recordMixingGift.data)` — somme byte-level
  // sur la struct brute (gSaveBlock1Ptr = Proxy `any` → indexation octet tolérée). INERTE.
  let data = gSaveBlock1Ptr.recordMixingGift.data;
  for (i = 0; i < 12 /* sizeof(struct RecordMixingGiftData), global.h:744 = u8+u8+u16+u8[8] = 0x0C */; i++)
    sum += data[i];
  return sum;
}

/** 1:1 `static bool32 IsRecordMixingGiftValid(void)` (mystery_event_script.c:115-128). */
function IsRecordMixingGiftValid(): boolean {
  let data = gSaveBlock1Ptr.recordMixingGift.data;
  let checksum = CalcRecordMixingGiftChecksum();
  if (data.unk0 == 0 || data.quantity == 0 || data.itemId == 0 || checksum == 0 || checksum != gSaveBlock1Ptr.recordMixingGift.checksum)
    return false;
  else
    return true;
}

/** 1:1 `static void ClearRecordMixingGift(void)` (mystery_event_script.c:130-133). */
function ClearRecordMixingGift(): void {
  // 1:1 `CpuFill16(0, &gSaveBlock1Ptr->recordMixingGift, sizeof(...))` (dest = Proxy `any`).
  CpuFill16(0, gSaveBlock1Ptr.recordMixingGift, 16 /* sizeof(struct RecordMixingGift), global.h:752 = int + RecordMixingGiftData = 0x10 */);
}

/** 1:1 `static void SetRecordMixingGift(u8 unk, u8 quantity, u16 itemId)` (mystery_event_script.c:135-148). */
function SetRecordMixingGift(unk: number, quantity: number, itemId: number): void {
  if (!unk || !quantity || !itemId)
  {
    ClearRecordMixingGift();
  }
  else
  {
    gSaveBlock1Ptr.recordMixingGift.data.unk0 = unk;
    gSaveBlock1Ptr.recordMixingGift.data.quantity = quantity;
    gSaveBlock1Ptr.recordMixingGift.data.itemId = itemId;
    gSaveBlock1Ptr.recordMixingGift.checksum = CalcRecordMixingGiftChecksum();
  }
}

/** 1:1 `u16 GetRecordMixingGift(void)` (mystery_event_script.c:150-170). */
export function GetRecordMixingGift(): number {
  let data = gSaveBlock1Ptr.recordMixingGift.data;
  if (!IsRecordMixingGiftValid())
  {
    ClearRecordMixingGift();
    return 0;
  }
  else
  {
    let itemId = data.itemId;
    data.quantity--;
    if (data.quantity == 0)
      ClearRecordMixingGift();
    else
      gSaveBlock1Ptr.recordMixingGift.checksum = CalcRecordMixingGiftChecksum();
    return itemId;
  }
}

/** 1:1 `bool8 MEScrCmd_end(struct ScriptContext *ctx)` (mystery_event_script.c:172-176). */
export function MEScrCmd_end(ctx: ScriptContext): boolean {
  StopScript(ctx);
  return true;
}

/** 1:1 `bool8 MEScrCmd_checkcompat(struct ScriptContext *ctx)` (mystery_event_script.c:178-197). */
export function MEScrCmd_checkcompat(ctx: ScriptContext): boolean {
  let unk0 = 0;
  let unk1 = 0;
  let unk2 = 0;
  let version = 0;
  ctx.data[1] /* mOffset */ = ScriptReadWord(ctx);
  unk0 = ScriptReadHalfword(ctx);
  unk1 = ScriptReadWord(ctx);
  unk2 = ScriptReadHalfword(ctx);
  version = ScriptReadWord(ctx);
  if (CheckCompatibility(unk0, unk1, unk2, version) === true)
    ctx.data[3] /* mValid */ = 1 /* TRUE */;
  else
    SetIncompatible();
  return true;
}

/** 1:1 `bool8 MEScrCmd_nop(struct ScriptContext *ctx)` (mystery_event_script.c:199-202). */
export function MEScrCmd_nop(ctx: ScriptContext): boolean {
  return false;
}

/** 1:1 `bool8 MEScrCmd_setstatus(struct ScriptContext *ctx)` (mystery_event_script.c:204-209). */
export function MEScrCmd_setstatus(ctx: ScriptContext): boolean {
  let status = ScriptReadByte(ctx);
  ctx.data[2] /* mStatus */ = status;
  return false;
}

/** 1:1 `bool8 MEScrCmd_setmsg(struct ScriptContext *ctx)` (mystery_event_script.c:211-218). */
export function MEScrCmd_setmsg(ctx: ScriptContext): boolean {
  let status = ScriptReadByte(ctx);
  // 1:1 `u8 *str = (u8 *)(ScriptReadWord(ctx) - ctx->mOffset + ctx->mScriptBase)`.
  // Pointeur RAM-script remis-en-base = number ; cast (u8*) miroir au sink. INERTE.
  let str = (ScriptReadWord(ctx) - ctx.data[1] /* mOffset */ + ctx.data[0] /* mScriptBase */);
  if (status == MEVENT_STATUS_FF || status == ctx.data[2] /* mStatus */)
    StringExpandPlaceholders(gStringVar4, str as unknown as Uint8Array);
  return false;
}

/** 1:1 `bool8 MEScrCmd_runscript(struct ScriptContext *ctx)` (mystery_event_script.c:220-225). */
export function MEScrCmd_runscript(ctx: ScriptContext): boolean {
  // 1:1 `u8 *script = (u8 *)(ScriptReadWord(ctx) - ctx->mOffset + ctx->mScriptBase)`.
  let script = (ScriptReadWord(ctx) - ctx.data[1] /* mOffset */ + ctx.data[0] /* mScriptBase */);
  RunScriptImmediately(script as unknown as ScriptPtr);
  return false;
}

/** 1:1 `bool8 MEScrCmd_setenigmaberry(struct ScriptContext *ctx)` (mystery_event_script.c:227-263). */
export function MEScrCmd_setenigmaberry(ctx: ScriptContext): boolean {
  let str: Uint8Array;
  let message: string;
  let haveBerry = IsEnigmaBerryValid();
  // 1:1 `u8 *berry = (u8 *)(ScriptReadWord(ctx) - ctx->mOffset + ctx->mScriptBase)`.
  let berry = (ScriptReadWord(ctx) - ctx.data[1] /* mOffset */ + ctx.data[0] /* mScriptBase */);
  StringCopyN(gStringVar1, gSaveBlock1Ptr.enigmaBerry.berry.name, BERRY_NAME_LENGTH + 1);
  SetEnigmaBerry(berry);
  StringCopyN(gStringVar2, gSaveBlock1Ptr.enigmaBerry.berry.name, BERRY_NAME_LENGTH + 1);
  if (!haveBerry)
  {
    str = gStringVar4;
    message = getString('gText_MysteryEventBerry');
  }
  else if (StringCompare(gStringVar1, gStringVar2))
  {
    str = gStringVar4;
    message = getString('gText_MysteryEventBerryTransform');
  }
  else
  {
    str = gStringVar4;
    message = getString('gText_MysteryEventBerryObtained');
  }
  StringExpandPlaceholders(str, message);
  ctx.data[2] /* mStatus */ = MEVENT_STATUS_SUCCESS;
  if (IsEnigmaBerryValid() === true)
    VarSet(VAR_ENIGMA_BERRY_AVAILABLE, 1);
  else
    ctx.data[2] /* mStatus */ = MEVENT_STATUS_LOAD_ERROR;
  return false;
}

/** 1:1 `bool8 MEScrCmd_giveribbon(struct ScriptContext *ctx)` (mystery_event_script.c:265-273). */
export function MEScrCmd_giveribbon(ctx: ScriptContext): boolean {
  let index = ScriptReadByte(ctx);
  let ribbonId = ScriptReadByte(ctx);
  GiveGiftRibbonToParty(index, ribbonId);
  StringExpandPlaceholders(gStringVar4, getString('gText_MysteryEventSpecialRibbon'));
  ctx.data[2] /* mStatus */ = MEVENT_STATUS_SUCCESS;
  return false;
}

/** 1:1 `bool8 MEScrCmd_initramscript(struct ScriptContext *ctx)` (mystery_event_script.c:275-284). */
export function MEScrCmd_initramscript(ctx: ScriptContext): boolean {
  let mapGroup = ScriptReadByte(ctx);
  let mapNum = ScriptReadByte(ctx);
  let objectId = ScriptReadByte(ctx);
  // 1:1 `u8 *script`/`u8 *scriptEnd = (u8 *)(ScriptReadWord(ctx) - ctx->mOffset + ctx->mScriptBase)`.
  let script = (ScriptReadWord(ctx) - ctx.data[1] /* mOffset */ + ctx.data[0] /* mScriptBase */);
  let scriptEnd = (ScriptReadWord(ctx) - ctx.data[1] /* mOffset */ + ctx.data[0] /* mScriptBase */);
  InitRamScript(script, scriptEnd - script, mapGroup, mapNum, objectId);
  return false;
}

/** 1:1 `bool8 MEScrCmd_givenationaldex(struct ScriptContext *ctx)` (mystery_event_script.c:286-292). */
export function MEScrCmd_givenationaldex(ctx: ScriptContext): boolean {
  EnableNationalPokedex();
  StringExpandPlaceholders(gStringVar4, getString('gText_MysteryEventNationalDex'));
  ctx.data[2] /* mStatus */ = MEVENT_STATUS_SUCCESS;
  return false;
}

/** 1:1 `bool8 MEScrCmd_addrareword(struct ScriptContext *ctx)` (mystery_event_script.c:294-300). */
export function MEScrCmd_addrareword(ctx: ScriptContext): boolean {
  UnlockTrendySaying(ScriptReadByte(ctx));
  StringExpandPlaceholders(gStringVar4, getString('gText_MysteryEventRareWord'));
  ctx.data[2] /* mStatus */ = MEVENT_STATUS_SUCCESS;
  return false;
}

/** 1:1 `bool8 MEScrCmd_setrecordmixinggift(struct ScriptContext *ctx)` (mystery_event_script.c:302-309). */
export function MEScrCmd_setrecordmixinggift(ctx: ScriptContext): boolean {
  let unk = ScriptReadByte(ctx);
  let quantity = ScriptReadByte(ctx);
  let itemId = ScriptReadHalfword(ctx);
  SetRecordMixingGift(unk, quantity, itemId);
  return false;
}

/** 1:1 `bool8 MEScrCmd_givepokemon(struct ScriptContext *ctx)` (mystery_event_script.c:311-356). */
export function MEScrCmd_givepokemon(ctx: ScriptContext): boolean {
  let mail: Mail;
  let pokemon: Pokemon;
  let species = 0;
  let heldItem = 0;
  // 1:1 `u32 data = ScriptReadWord(ctx) - ctx->mOffset + ctx->mScriptBase`.
  let data = ScriptReadWord(ctx) - ctx.data[1] /* mOffset */ + ctx.data[0] /* mScriptBase */;
  let pokemonPtr = data;                                             // (void *)data
  let mailPtr = (data + 100 /* sizeof(struct Pokemon) = 0x64 */);    // (void *)(data + sizeof(struct Pokemon))
  // 1:1 `pokemon = *(struct Pokemon *)pokemonPtr` — déréf du blob reçu (raw-memory), INERTE.
  pokemon = pokemonPtr as unknown as Pokemon;
  species = GetMonData(pokemon, MON_DATA_SPECIES_OR_EGG) as number;
  if (species == SPECIES_EGG)
    // décomp strings.c:21 `const u8 gText_EggNickname[] = _("OEUF")` → encoder : la string JS
    // castée en Uint8Array copiait du garbage (0x00) dans gStringVar1, sans EOS.
    StringCopyN(gStringVar1, encodeOwText(getString('gText_EggNickname')), POKEMON_NAME_LENGTH + 1);
  else
    // décomp strings.c:22 `const u8 gText_Pokemon[] = _("POKéMON")` → encoder (idem ci-dessus).
    StringCopyN(gStringVar1, encodeOwText(getString('gText_Pokemon')), POKEMON_NAME_LENGTH + 1);
  if (gPlayerPartyCount == PARTY_SIZE)
  {
    StringExpandPlaceholders(gStringVar4, getString('gText_MysteryEventFullParty'));
    ctx.data[2] /* mStatus */ = MEVENT_STATUS_FAILURE;
  }
  else
  {
    // 1:1 `memcpy(&gPlayerParty[PARTY_SIZE - 1], pokemonPtr, sizeof(struct Pokemon))` — blob reçu, INERTE.
    gPlayerParty[PARTY_SIZE - 1] = pokemonPtr as unknown as Pokemon;
    // 1:1 `memcpy(&mail, mailPtr, sizeof(struct Mail))` (0x22) — blob reçu, INERTE.
    mail = mailPtr as unknown as Mail;
    if (species != SPECIES_EGG)
    {
      let pokedexNum = SpeciesToNationalPokedexNum(species);
      GetSetPokedexFlag(pokedexNum, FLAG_SET_SEEN);
      GetSetPokedexFlag(pokedexNum, FLAG_SET_CAUGHT);
    }
    heldItem = GetMonData(gPlayerParty[PARTY_SIZE - 1], MON_DATA_HELD_ITEM) as number;
    if (ItemIsMail(heldItem))
      GiveMailToMon(gPlayerParty[PARTY_SIZE - 1], mail);
    CompactPartySlots();
    CalculatePlayerPartyCount();
    StringExpandPlaceholders(gStringVar4, getString('gText_MysteryEventSentOver'));
    ctx.data[2] /* mStatus */ = MEVENT_STATUS_SUCCESS;
  }
  return false;
}

/** 1:1 `bool8 MEScrCmd_addtrainer(struct ScriptContext *ctx)` (mystery_event_script.c:358-366). */
export function MEScrCmd_addtrainer(ctx: ScriptContext): boolean {
  // 1:1 `u32 data = ScriptReadWord(ctx) - ctx->mOffset + ctx->mScriptBase`.
  let data = ScriptReadWord(ctx) - ctx.data[1] /* mOffset */ + ctx.data[0] /* mScriptBase */;
  // 1:1 `memcpy(&gSaveBlock2Ptr->frontier.ereaderTrainer, (void *)data, sizeof(...))` (0xBC,
  // global.h:340) — blob reçu (dest = Proxy `any`), INERTE.
  gSaveBlock2Ptr.frontier.ereaderTrainer = data;
  ValidateEReaderTrainer();
  StringExpandPlaceholders(gStringVar4, getString('gText_MysteryEventNewTrainer'));
  ctx.data[2] /* mStatus */ = MEVENT_STATUS_SUCCESS;
  return false;
}

/** 1:1 `bool8 MEScrCmd_enableresetrtc(struct ScriptContext *ctx)` (mystery_event_script.c:368-374). */
export function MEScrCmd_enableresetrtc(ctx: ScriptContext): boolean {
  EnableResetRTC();
  StringExpandPlaceholders(gStringVar4, getString('gText_InGameClockUsable'));
  ctx.data[2] /* mStatus */ = MEVENT_STATUS_SUCCESS;
  return false;
}

/** 1:1 `bool8 MEScrCmd_checksum(struct ScriptContext *ctx)` (mystery_event_script.c:376-387). */
export function MEScrCmd_checksum(ctx: ScriptContext): boolean {
  let checksum = ScriptReadWord(ctx);
  // 1:1 `u8 *data`/`u8 *dataEnd = (u8 *)(ScriptReadWord(ctx) - ctx->mOffset + ctx->mScriptBase)`.
  let data = (ScriptReadWord(ctx) - ctx.data[1] /* mOffset */ + ctx.data[0] /* mScriptBase */);
  let dataEnd = (ScriptReadWord(ctx) - ctx.data[1] /* mOffset */ + ctx.data[0] /* mScriptBase */);
  if (checksum != CalcByteArraySum(data as unknown as Uint8Array, dataEnd - data))
  {
    ctx.data[3] /* mValid */ = 0 /* FALSE */;
    ctx.data[2] /* mStatus */ = MEVENT_STATUS_LOAD_ERROR;
  }
  return true;
}

/** 1:1 `bool8 MEScrCmd_crc(struct ScriptContext *ctx)` (mystery_event_script.c:389-400). */
export function MEScrCmd_crc(ctx: ScriptContext): boolean {
  let crc = ScriptReadWord(ctx);
  // 1:1 `u8 *data`/`u8 *dataEnd = (u8 *)(ScriptReadWord(ctx) - ctx->mOffset + ctx->mScriptBase)`.
  let data = (ScriptReadWord(ctx) - ctx.data[1] /* mOffset */ + ctx.data[0] /* mScriptBase */);
  let dataEnd = (ScriptReadWord(ctx) - ctx.data[1] /* mOffset */ + ctx.data[0] /* mScriptBase */);
  if (crc != CalcCRC16(data as unknown as Uint8Array, dataEnd - data))
  {
    ctx.data[3] /* mValid */ = 0 /* FALSE */;
    ctx.data[2] /* mStatus */ = MEVENT_STATUS_LOAD_ERROR;
  }
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Table de commandes (section data séparée du décomp)
// 1:1 `D:/Projet 1/decomps/pokeemeraude/data/mystery_event_script_cmd_table.s` :
//   gMysteryEventScriptCmdTable:: (.4byte MEScrCmd_* × 17, opcodes 0x00-0x10)
//   gMysteryEventScriptCmdTableEnd::
// `…End` (label de fin) → longueur de la table (= borne haute des opcodes), comme
// InitScriptContext(ctx, table, tableEnd) l'attend (src/script.ts:95).
// ═══════════════════════════════════════════════════════════════════════════════
const gMysteryEventScriptCmdTable: ScrCmdFunc[] = [
  MEScrCmd_nop,                 // 0x00
  MEScrCmd_checkcompat,         // 0x01
  MEScrCmd_end,                 // 0x02
  MEScrCmd_setmsg,              // 0x03
  MEScrCmd_setstatus,           // 0x04
  MEScrCmd_runscript,           // 0x05
  MEScrCmd_initramscript,       // 0x06
  MEScrCmd_setenigmaberry,      // 0x07
  MEScrCmd_giveribbon,          // 0x08
  MEScrCmd_givenationaldex,     // 0x09
  MEScrCmd_addrareword,         // 0x0a
  MEScrCmd_setrecordmixinggift, // 0x0b
  MEScrCmd_givepokemon,         // 0x0c
  MEScrCmd_addtrainer,          // 0x0d
  MEScrCmd_enableresetrtc,      // 0x0e
  MEScrCmd_checksum,            // 0x0f
  MEScrCmd_crc,                 // 0x10
];
const gMysteryEventScriptCmdTableEnd = gMysteryEventScriptCmdTable.length;
