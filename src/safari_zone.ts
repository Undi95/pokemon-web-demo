/**
 * safari_zone.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/safari_zone.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/safari_zone.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { B_OUTCOME_CAUGHT, B_OUTCOME_NO_SAFARI_BALLS } from '../include/constants/battle';
import { TryPutSafariFanClubOnAir } from './tv';
import { FLAG_SYS_SAFARI_MODE } from '../include/constants/flags';
import { GAME_STAT_ENTERED_SAFARI_ZONE } from '../include/constants/game_stat';
import { STR_CONV_MODE_LEADING_ZEROS } from '../include/string_util';
import { gBattleOutcome, gBattleResults } from './engine/battle/state';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { FlagClear, FlagGet, FlagSet, VarGet, VarSet } from './event_data';
import { GetXYCoordsOneStepInFrontOfPlayer, IncrementGameStat, PlayerGetDestCoords } from './field_player_avatar';
import { SetMainCallback2 } from './main';
import { CB2_ReturnToField_Manual, CB2_ReturnToFieldContinueScript_Manual } from './overworld';
import { RunScriptImmediately, ScriptContext_SetupScript, ScriptContext_Stop } from './script';
import { ConvertIntToDecimalStringN, StringCopy, gStringVar1, gStringVar2 } from './string_util';
import { getString } from './engine/ui/gba-strings';
import { encodeOwText } from './text';
import type { Pokeblock } from './engine/save/save-blocks';

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const CB2_ReturnToField = CB2_ReturnToField_Manual; // variante repo (src/overworld.ts)

/** 1:1 `struct PokeblockFeeder` (safari_zone.c:15). */
interface PokeblockFeeder {
  x: number;
  y: number;
  mapNum: number;
  stepCounter: number;
  pokeblock: Pokeblock;
}

const NUM_POKEBLOCK_FEEDERS = 10; // 1:1 safari_zone.c:24

/** Revue transpiler : PokeblockFeeder zéro (= memset 0 décomp). */
const emptyPokeblockFeeder = (): PokeblockFeeder => ({
  x: 0, y: 0, mapNum: 0, stepCounter: 0,
  pokeblock: { color: 0, spicy: 0, dry: 0, sweet: 0, bitter: 0, sour: 0, feel: 0 },
});

/** 1:1 `const u8 *const gPokeblockNames[]` (pokeblock.c:197-214) — inline en
 *  attendant le port pokeblock.c (revue : PBLOCK_CLR_NONE=NULL puis 15 couleurs). */
const gPokeblockNames: (string | null)[] = [
  null,
  getString('gText_RedPokeblock'), getString('gText_BluePokeblock'), getString('gText_PinkPokeblock'),
  getString('gText_GreenPokeblock'), getString('gText_YellowPokeblock'), getString('gText_PurplePokeblock'),
  getString('gText_IndigoPokeblock'), getString('gText_BrownPokeblock'), getString('gText_LiteBluePokeblock'),
  getString('gText_OlivePokeblock'), getString('gText_GrayPokeblock'), getString('gText_BlackPokeblock'),
  getString('gText_WhitePokeblock'), getString('gText_GoldPokeblock'),
];

/** 1:1 (safari_zone.c:31) */
export let gNumSafariBalls = 0;

/** 1:1 (safari_zone.c:32) */
let sSafariZoneStepCounter = 0;

/** 1:1 (safari_zone.c:33) */
let sSafariZoneCaughtMons = 0;

/** 1:1 (safari_zone.c:34) */
let sSafariZonePkblkUses = 0;

/** 1:1 `static struct PokeblockFeeder sPokeblockFeeders[NUM_POKEBLOCK_FEEDERS]`
 *  (safari_zone.c:35) — revue transpiler : tableau zéro-initialisé. */
const sPokeblockFeeders: PokeblockFeeder[] = Array.from({ length: NUM_POKEBLOCK_FEEDERS }, emptyPokeblockFeeder);

/** 1:1 `bool32 GetSafariZoneFlag(void)` (safari_zone.c:40-43). */
export function GetSafariZoneFlag(): boolean {
  return FlagGet(FLAG_SYS_SAFARI_MODE);
}

/** 1:1 `void SetSafariZoneFlag(void)` (safari_zone.c:45-48). */
export function SetSafariZoneFlag(): void {
  FlagSet(FLAG_SYS_SAFARI_MODE);
}

/** 1:1 `void ResetSafariZoneFlag(void)` (safari_zone.c:50-53). */
export function ResetSafariZoneFlag(): void {
  FlagClear(FLAG_SYS_SAFARI_MODE);
}

/** 1:1 `void EnterSafariMode(void)` (safari_zone.c:55-64). */
export function EnterSafariMode(): void {
  IncrementGameStat(GAME_STAT_ENTERED_SAFARI_ZONE);
  SetSafariZoneFlag();
  ClearAllPokeblockFeeders();
  gNumSafariBalls = 30;
  sSafariZoneStepCounter = 500;
  sSafariZoneCaughtMons = 0;
  sSafariZonePkblkUses = 0;
}

/** 1:1 `void ExitSafariMode(void)` (safari_zone.c:66-73). */
export function ExitSafariMode(): void {
  TryPutSafariFanClubOnAir(sSafariZoneCaughtMons, sSafariZonePkblkUses); // 1:1 :68 (dette TV soldée)
  ResetSafariZoneFlag();
  ClearAllPokeblockFeeders();
  gNumSafariBalls = 0;
  sSafariZoneStepCounter = 0;
}

/** 1:1 `bool8 SafariZoneTakeStep(void)` (safari_zone.c:75-90). */
export function SafariZoneTakeStep(): boolean {
  if (!GetSafariZoneFlag() /* == FALSE */)
  {
    return false;
  }
  DecrementFeederStepCounters();
  sSafariZoneStepCounter--;
  if (sSafariZoneStepCounter == 0)
  {
    ScriptContext_SetupScript('SafariZone_EventScript_TimesUp');
    return true;
  }
  return false;
}

/** 1:1 `void SafariZoneRetirePrompt(void)` (safari_zone.c:92-95). */
export function SafariZoneRetirePrompt(): void {
  ScriptContext_SetupScript('SafariZone_EventScript_RetirePrompt');
}

/** 1:1 `void CB2_EndSafariBattle(void)` (safari_zone.c:97-119). */
export function CB2_EndSafariBattle(): void {
  sSafariZonePkblkUses += gBattleResults.pokeblockThrows;
  if (gBattleOutcome == B_OUTCOME_CAUGHT)
    sSafariZoneCaughtMons++;
  if (gNumSafariBalls != 0)
  {
    SetMainCallback2(CB2_ReturnToField);
  }
  else if (gBattleOutcome == B_OUTCOME_NO_SAFARI_BALLS)
  {
    RunScriptImmediately('SafariZone_EventScript_OutOfBallsMidBattle');
    // Revue transpiler : `WarpIntoMap() + gFieldCallback=FieldCB_ReturnToFieldNoScript
    // CheckMusic + SetMainCallback2(CB2_LoadMap)` — adaptation warp-system : le script
    // vient de poser gSavedWarp (opcode setwarp) → pending warp (pattern DoWhiteOut,
    // import dynamique anti-cycle).
    const saved = (globalThis as { gSavedWarp?: { destMap: string; warpId: number; x: number; y: number } }).gSavedWarp;
    if (saved) {
      void import('./engine/field/warp-system').then((ws) => {
        ws.setPendingWarp({ destMap: saved.destMap, x: saved.x, y: saved.y, elevation: 0, warpId: saved.warpId }, 'step');
      });
    }
    SetMainCallback2(CB2_ReturnToField);
  }
  else if (gBattleOutcome == B_OUTCOME_CAUGHT)
  {
    ScriptContext_SetupScript('SafariZone_EventScript_OutOfBalls');
    ScriptContext_Stop();
    // Revue transpiler : CB2_ReturnToFieldContinueScriptPlayMapMusic → variante repo
    // CB2_ReturnToFieldContinueScript_Manual (chaîne musique = dette tracée).
    SetMainCallback2(CB2_ReturnToFieldContinueScript_Manual);
  }
}

/** 1:1 `static void ClearPokeblockFeeder(u8 index)` (safari_zone.c:121-124).
 *  Revue transpiler : memset(&feeder, 0, sizeof) → remplacement objet zéro. */
function ClearPokeblockFeeder(index: number): void {
  sPokeblockFeeders[index] = emptyPokeblockFeeder();
}

/** 1:1 `static void ClearAllPokeblockFeeders(void)` (safari_zone.c:126-129).
 *  Revue transpiler : memset(tableau, 0, sizeof) → boucle objets zéro. */
function ClearAllPokeblockFeeders(): void {
  for (let i = 0; i < NUM_POKEBLOCK_FEEDERS; i++)
    sPokeblockFeeders[i] = emptyPokeblockFeeder();
}

/** 1:1 `void GetPokeblockFeederInFront(void)` (safari_zone.c:131-151).
 *  Revue transpiler : out-params &x/&y → retour {x,y} (convention repo) ;
 *  VarSet(-1) → wrap u16 0xFFFF (sémantique C). */
export function GetPokeblockFeederInFront(): void {
  const { x, y } = GetXYCoordsOneStepInFrontOfPlayer();
  let i = 0;
  for (i = 0; i < NUM_POKEBLOCK_FEEDERS; i++)
  {
    if (gSaveBlock1Ptr.location.mapNum == sPokeblockFeeders[i].mapNum && sPokeblockFeeders[i].x == x && sPokeblockFeeders[i].y == y)
    {
      VarSet(0x800D /* gSpecialVar_Result */, i);
      StringCopy(gStringVar1, encodeOwText(gPokeblockNames[sPokeblockFeeders[i].pokeblock.color] ?? ''));
      return;
    }
  }
  VarSet(0x800D /* gSpecialVar_Result */, 0xFFFF /* (u16)-1 */);
}

/** 1:1 `void GetPokeblockFeederWithinRange(void)` (safari_zone.c:153-180).
 *  Revue transpiler : out-params &x/&y → retour {x,y} mutables (le C réutilise
 *  x/y comme deltas) ; VarSet(-1) → wrap u16 0xFFFF.
 *  NB fidèle au C : x/y sont MUTÉS dans la boucle sans être rechargés (quirk ROM). */
export function GetPokeblockFeederWithinRange(): void {
  const dest = PlayerGetDestCoords();
  let x = dest.x;
  let y = dest.y;
  let i = 0;
  for (i = 0; i < NUM_POKEBLOCK_FEEDERS; i++)
  {
    if (gSaveBlock1Ptr.location.mapNum == sPokeblockFeeders[i].mapNum)
    {
      // Get absolute value of x and y distance from Pokeblock feeder on current map.
      x -= sPokeblockFeeders[i].x;
      y -= sPokeblockFeeders[i].y;
      if (x < 0)
        x *= -1;
      if (y < 0)
        y *= -1;
      if ((x + y) <= 5)
      {
        VarSet(0x800D /* gSpecialVar_Result */, i);
        return;
      }
    }
  }
  VarSet(0x800D /* gSpecialVar_Result */, 0xFFFF /* (u16)-1 */);
}

// unused

/** 1:1 `struct Pokeblock *SafariZoneGetPokeblockInFront(void)` (safari_zone.c:183-191). */
export function SafariZoneGetPokeblockInFront(): Pokeblock | null {
  GetPokeblockFeederInFront();
  if (VarGet(0x800D) /* gSpecialVar_Result */ == 0xFFFF)
    return null;
  else
    return sPokeblockFeeders[VarGet(0x800D) /* gSpecialVar_Result */].pokeblock;
}

/** 1:1 `struct Pokeblock *SafariZoneGetActivePokeblock(void)` (safari_zone.c:193-201). */
export function SafariZoneGetActivePokeblock(): Pokeblock | null {
  GetPokeblockFeederWithinRange();
  if (VarGet(0x800D) /* gSpecialVar_Result */ == 0xFFFF)
    return null;
  else
    return sPokeblockFeeders[VarGet(0x800D) /* gSpecialVar_Result */].pokeblock;
}

/** 1:1 `void SafariZoneActivatePokeblockFeeder(u8 pkblId)` (safari_zone.c:203-225). */
export function SafariZoneActivatePokeblockFeeder(pkblId: number): void {
  let i = 0;
  for (i = 0; i < NUM_POKEBLOCK_FEEDERS; i++)
  {
    // Find free entry in sPokeblockFeeders
    if (sPokeblockFeeders[i].mapNum == 0 && sPokeblockFeeders[i].x == 0 && sPokeblockFeeders[i].y == 0)
    {
      // Initialize Pokeblock feeder (revue : out-params → retour {x,y})
      const pos = GetXYCoordsOneStepInFrontOfPlayer();
      sPokeblockFeeders[i].mapNum = gSaveBlock1Ptr.location.mapNum;
      // Revue transpiler : copie de STRUCT C (pas une référence — sinon
      // ClearPokeblockFeeder zéroterait le pokeblock du JOUEUR dans la save).
      sPokeblockFeeders[i].pokeblock = { ...gSaveBlock1Ptr.pokeblocks[pkblId] };
      sPokeblockFeeders[i].stepCounter = 100;
      sPokeblockFeeders[i].x = pos.x;
      sPokeblockFeeders[i].y = pos.y;
      break;
    }
  }
}

/** 1:1 `static void DecrementFeederStepCounters(void)` (safari_zone.c:227-240). */
function DecrementFeederStepCounters(): void {
  let i = 0;
  for (i = 0; i < NUM_POKEBLOCK_FEEDERS; i++)
  {
    if (sPokeblockFeeders[i].stepCounter != 0)
    {
      sPokeblockFeeders[i].stepCounter--;
      if (sPokeblockFeeders[i].stepCounter == 0)
        ClearPokeblockFeeder(i);
    }
  }
}

// unused

/** 1:1 `bool8 GetInFrontFeederPokeblockAndSteps(void)` (safari_zone.c:243-257). */
export function GetInFrontFeederPokeblockAndSteps(): boolean {
  GetPokeblockFeederInFront();
  if (VarGet(0x800D) /* gSpecialVar_Result */ == 0xFFFF)
  {
    return false;
  }
  ConvertIntToDecimalStringN(gStringVar2, sPokeblockFeeders[VarGet(0x800D) /* gSpecialVar_Result */].stepCounter, STR_CONV_MODE_LEADING_ZEROS, 3);
  return true;
}
