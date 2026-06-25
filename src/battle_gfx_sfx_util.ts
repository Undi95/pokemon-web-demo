/**
 * src/game/battle_gfx_sfx_util.ts — MIROIR 1:1 de `src/battle_gfx_sfx_util.c`
 * (D:/Projet 1/decomps/pokeemeraude/src/battle_gfx_sfx_util.c) — EN COURS.
 *
 * COUVERTURE COMPLÈTE du .c (35 fonctions — certification 2026-06-10) :
 *   ✅ ICI (corps 1:1) : AllocateBattleSpritesData (:87) · FreeBattleSpritesData
 *      (:96) · BattleLoadOpponentMonSpriteGfx (:577) · BattleLoadPlayerMonSpriteGfx
 *      (:630, + branche transformSpecies 1:1) · DecompressTrainerFrontPic (:701) ·
 *      DecompressTrainerBackPic (:710) · FreeTrainerFrontPicPalette (:732) ·
 *      BattleLoadAllHealthBoxesGfxAtOnce (:738) · LoadBattleBarGfx (:826, dette
 *      asset doubles) · BattleInitAllSprites (:831, AUX COMMANDES des boots) ·
 *      CopyAllBattleSpritesInvisibilities (:922) · CopyBattleSpriteInvisibility
 *      (:930) · HandleSpeciesGfxDataChange (:935, Transform single — dormant) ·
 *      BattleLoadSubstituteOrMonSpriteGfx (:1034, doll = dette asset) ·
 *      LoadBattleMonGfxAndAnimate (:1072) · TrySetBehindSubstituteSpriteBit
 *      (:1083) · ClearBehindSubstituteBit (:1089) · GetMonHPBarLevel (:1135) ·
 *      IsBattleSEPlaying (:554, plateforme false doc) · SetBattlerSpriteAffineMode
 *      (:1159, no-op plateforme doc) · LoadAndCreateEnemyShadowSprites (:1183) ·
 *      SpriteCB_EnemyShadow (:1207) · SpriteCB_SetInvisible (:1234) ·
 *      SetBattlerShadowSpriteCallback (:1239) · HideBattlerShadowSprite (:1252) ·
 *      FillAroundBattleWindows (:1260) · ClearTemporarySpeciesSpriteData (:1278) ·
 *      AllocateMonSpritesGfx (:1291) · FreeMonSpritesGfx (:1316) + gMonSpritesGfxPtr.
 *   ✅ RE-HOME nominal : ClearSpritesHealthboxAnimData (:910, vit dans
 *      battle-sprites-data, ré-exporté ici) ; ClearSpritesBattlerHealthboxAnimData
 *      (:916, static = resetBattleSpritesData).
 *   📍 VIVENT AILLEURS (origine décomp = ce fichier, consolidation différée) :
 *      ChooseMoveAndTargetInBattlePalace (:109) + GetBattlePalaceMoveGroup (:296)
 *      → battle_controller_opponent (_ChooseMoveAndTargetInBattlePalace) ;
 *      SpriteCB_TrainerSlideIn (:396) + SpriteCB_TrainerSlideVertical (:412)
 *      → copies locales player/opponent (dette dédoublonnage mineure) ;
 *      SpriteCB_WaitForBattlerBallReleaseAnim (:361) → chain send-out (pokeball).
 *   ⏳ CHANTIER ANIMS (hooks __battleAnim, dette chantier anims de move) :
 *      InitAndLaunchChosenStatusAnimation (:421) · TryHandleLaunchBattleTableAnimation
 *      (:458) + Task (:493) + ShouldAnimBeDoneRegardlessOfSubstitute (:505) ·
 *      InitAndLaunchSpecialAnimation (:523) + Task (:535) · IsMoveWithoutAnimation
 *      (:548).
 *   🔇 RÈGLE BGM/SE (ne pas toucher) : HandleLowHpMusicChange (:1094) ·
 *      BattleStopLowHpSound (:1124) · HandleBattleLowHpMusicChange (:1143)
 *      (hooks __battleHealthbox.handleLowHpMusicChange côté player).
 *   ⚠️ DETTE flux dresseur : le RENDU intro dresseur passe encore par
 *      battle-sendout-anim (sheets tagués) — DecompressTrainer*Pic ci-dessous est
 *      la cible structurelle (re-home du flux au prochain passage dresseur).
 *
 * Divergences plateforme : sheet via PNG pré-extrait (enemy_mon_shadow.png 32×8 =
 * 4 tiles, = gEnemyMonShadow_Gfx 0x80) + palette = PLTE du PNG (tag PALTAG_SHADOW) ;
 * gBattlerSpriteIds via le pont __battleController* (modèle plat, cf. sprite-c-platform).
 * transformSpecies non modélisé (Transform inactif → branche 1:1 par défaut).
 * shadowSpriteId : stocké module-local (1:1 `healthBoxesData[b].shadowSpriteId` —
 * à re-homer dans battle-sprites-data avec le champ struct, dette mineure).
 */

import { CreateTask as _CreateTask, DestroyTask as _DestroyTask } from './task';
import { getRuntime, syncSubspriteOam, LoadPalette } from '../harness/runtime/decomp-globals';
import { OBJ_PLTT_ID } from '../harness/runtime/decomp-runtime';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';
import { LoadSpriteSheet, LoadSpritePalette, FreeSpritePaletteByTag } from './sprite';
import { loadIndexedPngStrict, extractPngPlte, loadTileBin, loadGbaPal } from '../harness/gba/png-loader';
import { GetBattlerSpriteCoord, GetBattlerElevation } from './battle_anim_mons';
import { GET_BATTLER_SIDE, B_SIDE_PLAYER } from './engine/battle/constants';
import { GetBattlerPosition } from './engine/battle/util';
import { GetMonData, MON_DATA_SPECIES, MON_DATA_HP, MON_DATA_MAX_HP, MON_DATA_OT_ID, MON_DATA_PERSONALITY } from './engine/battle/party-storage';
import {
  isBehindSubstitute, setBehindSubstitute, ClearSpritesHealthboxAnimData,
  isBattlerDataInvisible, setBattlerDataInvisible,
  getTransformSpecies, setTransformSpecies,
} from './engine/battle/battle-sprites-data';
import { gBattlersCount } from './engine/battle/state';

// Re-home nominal 1:1 (fichier décomp d'origine = CELUI-CI).
export { ClearSpritesHealthboxAnimData };

import { resetBattleSpritesData } from './engine/battle/battle-sprites-data';

/** 1:1 décomp `void AllocateBattleSpritesData(void)` (battle_gfx_sfx_util.c) :
 *  alloue gBattleSpritesDataPtr (battlerData/healthBoxesData/animationData/battleBars).
 *  Plateforme : storage STATIQUE (battle-sprites-data) → « alloc fraîche » = reset
 *  complet (même état observable qu'un AllocZeroed décomp). */
export function AllocateBattleSpritesData(): void {
  resetBattleSpritesData();
}

/** 1:1 décomp `void FreeBattleSpritesData(void)` : FREE_AND_SET_NULL des 4 blocs.
 *  Plateforme : statique → reset (un accès post-free lit des zéros, comme un
 *  pointeur fraîchement réalloué décomp). */
export function FreeBattleSpritesData(): void {
  resetBattleSpritesData();
}

// ─── gMonSpritesGfxPtr + LOAD GFX MON 1:1 ────────────────────────────────────

/** 1:1 include/constants/pokemon.h `MON_PIC_SIZE` (64×64 4bpp = 0x800). */
export const MON_PIC_SIZE = 0x800;

/** 1:1 décomp `EWRAM_DATA struct MonSpritesGfx *gMonSpritesGfxPtr` (pokemon.h:248) —
 *  modèle MINIMAL : `sprites.ptr[position]` = buffer tiles décompressé du mon de
 *  chaque position (toutes frames empilées ; frame j = subarray(j*MON_PIC_SIZE)).
 *  templates/frameImages non modélisés (CreateSpriteInline plateforme) ; barFontGfx =
 *  dette texte HP opp doubles. Storage statique (pointeur décomp nullable → ptr null). */
export const gMonSpritesGfxPtr: {
  sprites: { ptr: (Uint8Array | null)[] };
  /** 1:1 `barFontGfx` (AllocZeroed 0x1000) — font des digits HP opp DOUBLES
   *  (chargée par LoadBattleBarGfx ; null tant que l'asset n'est pas extrait). */
  barFontGfx: Uint8Array | null;
} = {
  sprites: { ptr: [null, null, null, null] },
  barFontGfx: null,
};

/** 1:1 décomp `void AllocateMonSpritesGfx(void)` (:1291) : AllocZeroed du struct +
 *  firstDecompressed (4 buffers MON_PIC_SIZE*4) + templates/frameImages/barFontGfx.
 *  Plateforme : les buffers naissent au LOAD (loadTileBin) → l'alloc = reset à zéro
 *  (même état observable qu'un AllocZeroed frais). Appelé par CB2_InitBattle
 *  (battle_main.c:593), juste après AllocateBattleSpritesData. */
export function AllocateMonSpritesGfx(): void {
  gMonSpritesGfxPtr.sprites.ptr.fill(null);
  gMonSpritesGfxPtr.barFontGfx = null;
}

/** 1:1 décomp `void FreeMonSpritesGfx(void)` (:1316) : FREE_AND_SET_NULL + ptr[i]=NULL. */
export function FreeMonSpritesGfx(): void {
  gMonSpritesGfxPtr.sprites.ptr.fill(null);
  gMonSpritesGfxPtr.barFontGfx = null;
}

/** species num → dossier assets (= lookup `gMonFrontPicTable[species]`/`gMonBackPicTable
 *  [species]` décomp ; nos PNG pré-extraits vivent sous graphics/pokemon/<dossier>/). */
function _speciesAssetFolder(species: number): string | null {
  const enumName = reverseDecompConstant(species, 'SPECIES_');
  if (!enumName) return null;
  return enumName.replace(/^SPECIES_/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** 1:1 décomp `void BattleLoadOpponentMonSpriteGfx(struct Pokemon *mon, u8 battler)`
 *  (:577). Charge le FRONT pic dans gMonSpritesGfxPtr->sprites.ptr[position] +
 *  palette OBJ slot battler + copie BG palette 8+battler (sert aux anims de moves
 *  qui rendent le mon en BG). Divergences plateforme : ASYNC (PNG pré-extrait =
 *  HandleLoadSpecialPokePic_DontHandleDeoxys + LZDecompressWram) ; transformSpecies
 *  non modélisé (Transform inactif → branche SPECIES_NONE 1:1 :587-590) ; shiny non
 *  modélisé (GetMonFrontSpritePal → normal.pal, dette) ; Castform (:615) non atteignable. */
/** 1:1 décomp `GetMonSpritePalFromSpeciesAndPersonality` : shiny si
 *  GET_SHINY_VALUE(otId, personality) < SHINY_ODDS(8) → shiny.pal (extrait),
 *  sinon normal.pal. (Fix user 2026-06-11 : « le sprite n'est PAS shiny ».) */
function _monSpritePalFile(mon: unknown): string {
  try {
    const otId = (GetMonData(mon as never, MON_DATA_OT_ID as never) as number) >>> 0;
    const personality = (GetMonData(mon as never, MON_DATA_PERSONALITY as never) as number) >>> 0;
    const shinyValue = ((otId >> 16) & 0xFFFF) ^ (otId & 0xFFFF) ^ ((personality >> 16) & 0xFFFF) ^ (personality & 0xFFFF);
    if (shinyValue < 8) return 'shiny.pal';
  } catch { /* mon incomplet -> normal */ }
  return 'normal.pal';
}

export async function BattleLoadOpponentMonSpriteGfx(mon: unknown, battler: number): Promise<void> {
  // 1:1 :585-595 : transformSpecies != SPECIES_NONE → species de la CIBLE Transform
  // (champ battlerData, écrit par HandleSpeciesGfxDataChange) ; sinon species du mon.
  const transformSpecies = getTransformSpecies(battler);
  const species = transformSpecies !== 0 ? transformSpecies
    : (GetMonData(mon as never, MON_DATA_SPECIES) as number);
  const position = GetBattlerPosition(battler);
  const folder = _speciesAssetFolder(species);
  if (!folder) { console.warn('[gfx_sfx_util] BattleLoadOpponentMonSpriteGfx: species inconnue', species); return; }
  // 1:1 :600 HandleLoadSpecialPokePic_DontHandleDeoxys(&gMonFrontPicTable[species],
  //   gMonSpritesGfxPtr->sprites.ptr[position], species, currentPersonality).
  gMonSpritesGfxPtr.sprites.ptr[position] =
    await loadTileBin(`/decomp/em/pokemon/${folder}/anim_front.png`, 4);
  // 1:1 :604-613 : lzPaletteData = GetMonFrontSpritePal(mon) ; LZDecompressWram ;
  //   LoadPalette(buf, OBJ_PLTT_ID(battler), PLTT_SIZE_4BPP) ;
  //   LoadPalette(buf, BG_PLTT_ID(8) + BG_PLTT_ID(battler), PLTT_SIZE_4BPP).
  const pal = await loadGbaPal(`/decomp/em/pokemon/${folder}/${_monSpritePalFile(mon)}`);
  LoadPalette(pal, OBJ_PLTT_ID(battler), 32);
  LoadPalette(pal, (8 + battler) * 16, 32);
  // 1:1 :615-619 (Castform) + :622-626 (transform white blend) : non atteignables.
}

/** 1:1 décomp `void BattleLoadPlayerMonSpriteGfx(struct Pokemon *mon, u8 battler)`
 *  (:630). Idem opponent mais BACK pic (gMonBackPicTable). La branche
 *  ShouldIgnoreDeoxysForm/transform (:656) ne change que le HANDLING Deoxys
 *  (HandleLoadSpecialPokePic vs _DontHandleDeoxys) — même chargement plateforme. */
export async function BattleLoadPlayerMonSpriteGfx(mon: unknown, battler: number): Promise<void> {
  // 1:1 :638-648 : transformSpecies (Transform) sinon species du mon.
  const transformSpecies = getTransformSpecies(battler);
  const species = transformSpecies !== 0 ? transformSpecies
    : (GetMonData(mon as never, MON_DATA_SPECIES) as number);
  const position = GetBattlerPosition(battler);
  const folder = _speciesAssetFolder(species);
  if (!folder) { console.warn('[gfx_sfx_util] BattleLoadPlayerMonSpriteGfx: species inconnue', species); return; }
  // 1:1 :656-667 : HandleLoadSpecialPokePic(&gMonBackPicTable[species], ...).
  gMonSpritesGfxPtr.sprites.ptr[position] =
    await loadTileBin(`/decomp/em/pokemon/${folder}/back.png`, 4);
  // 1:1 :669-678 : mêmes deux LoadPalette que le front (OBJ battler + BG 8+battler).
  const pal = await loadGbaPal(`/decomp/em/pokemon/${folder}/${_monSpritePalFile(mon)}`);
  LoadPalette(pal, OBJ_PLTT_ID(battler), 32);
  LoadPalette(pal, (8 + battler) * 16, 32);
  // 1:1 :680-691 (Castform + transform pink) : non atteignables.
}

// ─── Trainer pics 1:1 (:701-:736) ────────────────────────────────────────────

let _trainerPicMap: Record<string, { png: string }> | null = null;
/** Map TRAINER_PIC_X → {png} (= gTrainerFrontPicTable, /decomp/em/trainer-pics.json). */
async function _ensureTrainerPicMap(): Promise<Record<string, { png: string }>> {
  if (_trainerPicMap) return _trainerPicMap;
  try {
    const resp = await fetch('/decomp/em/trainer-pics.json');
    _trainerPicMap = await resp.json() as Record<string, { png: string }>;
  } catch { _trainerPicMap = {}; }
  return _trainerPicMap;
}

/** 1:1 décomp `void DecompressTrainerFrontPic(u16 frontPicId, u8 battler)` (:701) :
 *  DecompressPicFromTable_2(gTrainerFrontPicTable[picId]) → gMonSpritesGfxPtr->
 *  sprites.ptr[position] + LoadCompressedSpritePalette (palette TAGGUÉE par picId).
 *  Plateforme : picId = enum string "TRAINER_PIC_X" (notre monnaie, = l'index
 *  décomp) ; async PNG. NB : le RENDU intro dresseur actuel passe encore par
 *  battle-sendout-anim (sheet tagué) — ce miroir est la cible structurelle
 *  (dette re-home du flux dresseur, cf. en-tête). */
export async function DecompressTrainerFrontPic(frontPicEnum: string, battler: number): Promise<void> {
  const position = GetBattlerPosition(battler);
  const map = await _ensureTrainerPicMap();
  const entry = map[frontPicEnum];
  if (!entry) { console.warn('[gfx_sfx_util] DecompressTrainerFrontPic: pic inconnu', frontPicEnum); return; }
  gMonSpritesGfxPtr.sprites.ptr[position] = await loadTileBin('/decomp/em/' + entry.png, 4);
  // 1:1 LoadCompressedSpritePalette(&gTrainerFrontPicPaletteTable[picId]) : palette
  // taguée (slot dynamique par tag picId), PLTE du PNG.
  const plte = await extractPngPlte('/decomp/em/' + entry.png);
  if (plte) LoadSpritePalette({ data: plte.subarray(0, 16), tag: frontPicEnum });
}

/** 1:1 décomp `void DecompressTrainerBackPic(u16 backPicId, u8 battler)` (:710) :
 *  copie gTrainerBackPicTable[picId] → buffer position + LoadCompressedPalette
 *  en OBJ_PLTT_ID(battler) (PAS taguée — slot battler direct, comme un mon).
 *  Plateforme : backPicId = gender (0=Brendan/1=May, = TRAINER_BACK_PIC_BRENDAN+gender
 *  du chemin single ; les variantes RS/FRLG = link, non atteignables). */
export async function DecompressTrainerBackPic(backPicId: number, battler: number): Promise<void> {
  const position = GetBattlerPosition(battler);
  const url = backPicId === 1 ? '/decomp/em/trainers/back_pics/may.png'
                              : '/decomp/em/trainers/back_pics/brendan.png';
  gMonSpritesGfxPtr.sprites.ptr[position] = await loadTileBin(url, 4);
  const pal = await loadGbaPal(url.replace(/\.png$/, '.pal')).catch(() => null);
  if (pal) LoadPalette(pal, OBJ_PLTT_ID(battler), 32);
  else {
    const plte = await extractPngPlte(url);
    if (plte) LoadPalette(plte.subarray(0, 16), OBJ_PLTT_ID(battler), 32);
  }
}

/** 1:1 décomp `void FreeTrainerFrontPicPalette(u16 frontPicId)` (:732) :
 *  FreeSpritePaletteByTag(gTrainerFrontPicPaletteTable[picId].tag). */
export function FreeTrainerFrontPicPalette(frontPicEnum: string): void {
  FreeSpritePaletteByTag(frontPicEnum);
}

// ─── LoadBattleBarGfx 1:1 (:826) ─────────────────────────────────────────────

/** 1:1 décomp `void LoadBattleBarGfx(u8 unused)` : LZDecompressWram(
 *  gBattleInterfaceGfx_BattleBar → gMonSpritesGfxPtr->barFontGfx). Consommateur
 *  unique = rendu des digits HP adverses en DOUBLES (battle_interface barFontGfx)
 *  — non atteignable en single. Asset = graphics/battle_interface/battle_bar.png
 *  (pas encore extrait → barFontGfx reste null + warn, dette asset doubles). */
export async function LoadBattleBarGfx(_unused: number): Promise<void> {
  if (gMonSpritesGfxPtr.barFontGfx) return;
  try {
    gMonSpritesGfxPtr.barFontGfx = await loadTileBin('/decomp/em/battle_interface/battle_bar.png', 4);
  } catch {
    console.warn('[gfx_sfx_util] LoadBattleBarGfx: asset battle_bar absent (doubles-only, dette)');
    gMonSpritesGfxPtr.barFontGfx = null;
  }
}

// ─── Transform / Substitute 1:1 (:935-:1093) — DORMANTS structurels ─────────
// (Transform/Substitute = moves non câblés tant que le chantier anims n'émet pas
// B_ANIM_TRANSFORM/SUBSTITUTE ; la STRUCTURE complète est portée, branchée sur
// transformSpecies/behindSubstitute de battle-sprites-data.)

/** 1:1 décomp `void HandleSpeciesGfxDataChange(u8 battlerAtk, u8 battlerDef, bool8 castform)`
 *  (:935). Branche single (pas Contest) : targetSpecies = species du DEF →
 *  load le pic (back si ATK joueur, front sinon) de la TARGET dans le buffer
 *  position de l'ATK + palette de la target en OBJ slot ATK + BG 8+atk +
 *  transformSpecies[atk] = targetSpecies + gBattleMonForms[atk] = 0.
 *  Dettes doc : Castform (:944, formes), blend blanc Transform (:1024,
 *  BlendPalette +6 WHITE = flash cosmétique), Contest. */
export async function HandleSpeciesGfxDataChange(battlerAtk: number, battlerDef: number, castform: boolean): Promise<void> {
  if (castform) return;   // Castform forms : non atteignable (doc en-tête).
  const position = GetBattlerPosition(battlerAtk);
  const defIsPlayer = GET_BATTLER_SIDE(battlerDef) === B_SIDE_PLAYER;
  const defParty = defIsPlayer ? _gPP : _gEP;
  const defMon = defParty[_gBPI[battlerDef] ?? 0];
  if (!defMon) return;
  const targetSpecies = GetMonData(defMon as never, MON_DATA_SPECIES) as number;
  const folder = _speciesAssetFolder(targetSpecies);
  if (!folder) return;
  const atkIsPlayer = GET_BATTLER_SIDE(battlerAtk) === B_SIDE_PLAYER;
  // 1:1 :980-1010 : back pic si l'attaquant est côté joueur, front sinon.
  const pic = atkIsPlayer ? 'back.png' : 'anim_front.png';
  gMonSpritesGfxPtr.sprites.ptr[position] =
    await loadTileBin(`/decomp/em/pokemon/${folder}/${pic}`, 4);
  // 1:1 :1012-1020 : palette de la TARGET species → OBJ slot ATK + BG 8+atk.
  const pal = await loadGbaPal(`/decomp/em/pokemon/${folder}/normal.pal`);
  LoadPalette(pal, OBJ_PLTT_ID(battlerAtk), 32);
  LoadPalette(pal, (8 + battlerAtk) * 16, 32);
  // 1:1 :1008-1010 (vague F78) : DmaCopy32(src, OBJ_VRAM0 + tileNum*32,
  // MON_PIC_SIZE) — le SPRITE du mon affiche le nouveau pic immédiatement
  // (le cache de tuiles du compositor est purgé chaque frame). Manquait :
  // le sprite gardait ses vieilles tuiles (Transform ne « prenait » pas).
  {
    const rt = getRuntime() as unknown as {
      gSprites?: Array<{ oamIndex: number } | undefined>;
      gba?: { oam: Array<{ tileId: number }>; objVram: Uint8Array };
    } | null;
    const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
    const sid = co?.getBattlerMonSpriteId?.(battlerAtk);
    const sp = sid !== undefined && sid !== 0xFF ? rt?.gSprites?.[sid] : undefined;
    const oam = sp ? rt?.gba?.oam[sp.oamIndex] : undefined;
    const src = gMonSpritesGfxPtr.sprites.ptr[position];
    if (oam && src && rt?.gba) {
      rt.gba.objVram.set(src.subarray(0, 0x800), oam.tileId * 32);
    }
  }
  // 1:1 :1029-1030 : transformSpecies posé + form reset.
  setTransformSpecies(battlerAtk, targetSpecies);
}

/** 1:1 décomp `void BattleLoadSubstituteOrMonSpriteGfx(u8 battler, bool8 loadMonSprite)`
 *  (:1034). loadMonSprite=TRUE → recharge le gfx du mon (BattleLoad* selon side) ;
 *  FALSE → le doll Substitute (asset gSubstituteDollGfx NON extrait → dette doc). */
export async function BattleLoadSubstituteOrMonSpriteGfx(battler: number, loadMonSprite: boolean): Promise<void> {
  if (!loadMonSprite) {
    // 1:1 :1040-1058 (vague F79) : le DOLL Substitute — back côté joueur,
    // front côté adverse (assets substitute_doll_*.4bpp.bin extraits
    // byte-exact de graphics/battle_anims/sprites/substitute*.png) +
    // palette doll dans le slot OBJ du battler + copie VRAM OBJ (le
    // LZDecompressVram du C écrit directement la VRAM du mon).
    const isPlayer = GET_BATTLER_SIDE(battler) === B_SIDE_PLAYER;
    const pic = isPlayer ? 'substitute_doll_back' : 'substitute_doll_front';
    const [tilesBuf, palBuf] = await Promise.all([
      fetch(`/decomp/em/battle_anims/sprites/${pic}.4bpp.bin`).then((r) => r.arrayBuffer()),
      fetch('/decomp/em/battle_anims/sprites/substitute_doll.gbapal').then((r) => r.arrayBuffer()),
    ]);
    const tiles = new Uint8Array(tilesBuf);
    const position = GetBattlerPosition(battler) & 3;
    gMonSpritesGfxPtr.sprites.ptr[position] = tiles;
    LoadPalette(new Uint16Array(palBuf), OBJ_PLTT_ID(battler), 32);
    {
      const rt = getRuntime() as unknown as {
        gSprites?: Array<{ oamIndex: number } | undefined>;
        gba?: { oam: Array<{ tileId: number }>; objVram: Uint8Array };
      } | null;
      const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (b: number) => number } | undefined;
      const sid = co?.getBattlerMonSpriteId?.(battler);
      const sp = sid !== undefined && sid !== 0xFF ? rt?.gSprites?.[sid] : undefined;
      const oam = sp ? rt?.gba?.oam[sp.oamIndex] : undefined;
      if (oam && rt?.gba) rt.gba.objVram.set(tiles.subarray(0, 0x800), oam.tileId * 32);
    }
    return;
  }
  const isPlayer = GET_BATTLER_SIDE(battler) === B_SIDE_PLAYER;
  const mon = (isPlayer ? _gPP : _gEP)[_gBPI[battler] ?? 0];
  if (!mon) return;
  await (isPlayer ? BattleLoadPlayerMonSpriteGfx(mon, battler)
                  : BattleLoadOpponentMonSpriteGfx(mon, battler));
}

/** 1:1 décomp `void LoadBattleMonGfxAndAnimate(u8 battler, bool8 loadMonSprite, u8 spriteId)`
 *  (:1072) : BattleLoadSubstituteOrMonSpriteGfx + StartSpriteAnim(forms=0) +
 *  repositionne y (GetBattlerSpriteDefault_Y — plateforme : le sprite garde son y,
 *  le mon transformé est mono-frame chez nous). */
export async function LoadBattleMonGfxAndAnimate(battler: number, loadMonSprite: boolean, _spriteId: number): Promise<void> {
  await BattleLoadSubstituteOrMonSpriteGfx(battler, loadMonSprite);
}

/** 1:1 décomp `void ClearTemporarySpeciesSpriteData(u8 battler, bool8 dontClearSubstitute)`
 *  (:1283) : transformSpecies = SPECIES_NONE + gBattleMonForms = 0 +
 *  (si !dontClearSubstitute) ClearBehindSubstituteBit. Appelé au switch/send-out. */
export function ClearTemporarySpeciesSpriteData(battler: number, dontClearSubstitute: boolean): void {
  setTransformSpecies(battler, 0);
  if (!dontClearSubstitute) ClearBehindSubstituteBit(battler);
}

// ─── Re-homes nominaux 1:1 (fichier décomp d'origine = CELUI-CI) ─────────────

/** 1:1 décomp `bool8 IsBattleSEPlaying(u8 battler)` (:554) : poll les canaux SE
 *  m4a + timeout 30 frames. Plateforme : pas de canaux SE par battler (pattern
 *  __PlaySE fire-and-forget) → false (= « SE fini »), même contrat que les copies
 *  locales historiques des controllers. */
export function IsBattleSEPlaying(_battler: number): boolean {
  return false;
}

/** 1:1 décomp `void BattleLoadAllHealthBoxesGfxAtOnce(void)` (:738) : variante
 *  non-itérative de BattleLoadAllHealthBoxesGfx — notre miroir interface charge
 *  déjà tout d'un coup (async) → délégation directe. */
export async function BattleLoadAllHealthBoxesGfxAtOnce(): Promise<void> {
  await _BLAHBG();
}

/** 1:1 décomp `u8 GetMonHPBarLevel(struct Pokemon *mon)` (:1135) :
 *  GetHPBarLevel(GetMonData(HP), GetMonData(MAX_HP)) du miroir interface. */
export function GetMonHPBarLevel(mon: unknown): number {
  const hp = GetMonData(mon as never, MON_DATA_HP) as number;
  const maxHP = GetMonData(mon as never, MON_DATA_MAX_HP) as number;
  return GetHPBarLevel(hp, maxHP);
}

/** 1:1 décomp `void TrySetBehindSubstituteSpriteBit(u8 battler, u16 move)` (:1083) :
 *  if (move == MOVE_SUBSTITUTE) behindSubstitute = TRUE. (MOVE_SUBSTITUTE = 164.) */
export function TrySetBehindSubstituteSpriteBit(battler: number, move: number): void {
  if (move === 164) setBehindSubstitute(battler, true);
}

/** 1:1 décomp `void ClearBehindSubstituteBit(u8 battler)` (:1089). */
export function ClearBehindSubstituteBit(battler: number): void {
  setBehindSubstitute(battler, false);
}

/** 1:1 décomp `void SetBattlerSpriteAffineMode(u8 affineMode)` (battle_gfx_sfx_util.c) :
 *  pour chaque battler présent : oam.affineMode = mode ; à OFF, SAUVE matrixNum
 *  puis le met à 0 ; à NORMAL, RESTAURE le matrixNum sauvé. C'est LE protocole
 *  d'encadrement des anims de move (décomp PlayerDoMoveAnimation : OFF avant
 *  DoMoveAnim, NORMAL après) — l'ancien no-op « géré par le runtime » était une
 *  dette masquée : les anims corrompaient la matrice/scale des mons (retours
 *  user « Wailord mal placé après son affine » ×3, 2026-06-11). */
const _savedBattlerMatrixNum = [0, 0, 0, 0];
export function SetBattlerSpriteAffineMode(affineMode: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const bs = (globalThis as { __battleState?: { gBattlersCount?: number } }).__battleState;
  const count = bs?.gBattlersCount ?? 2;
  for (let i = 0; i < count; i++) {
    const sid = _battlerSpriteId(i);
    if (sid === undefined || sid === 0xFF) continue;
    const sp = _spr(sid);
    const oam = sp ? (rt as unknown as { gba?: { oam?: Array<{ affineMode?: number; matrixNum?: number }> } }).gba?.oam?.[sp.oamIndex] : undefined;
    if (!oam) continue;
    oam.affineMode = affineMode;
    if (affineMode === 0 /* ST_OAM_AFFINE_OFF */) {
      _savedBattlerMatrixNum[i] = oam.matrixNum ?? 0;
      oam.matrixNum = 0;
    } else {
      oam.matrixNum = _savedBattlerMatrixNum[i];
    }
  }
}
(globalThis as Record<string, unknown>).__SetBattlerSpriteAffineMode = SetBattlerSpriteAffineMode;

// ─── Constantes 1:1 ──────────────────────────────────────────────────────────
const MAX_BATTLERS_COUNT = 4;
/** 1:1 battle_anim.h `BATTLER_COORD_X` / `BATTLER_COORD_Y`. */
const BATTLER_COORD_X = 0;
const BATTLER_COORD_Y = 1;

// ─── Sprite plumbing (modèle plat runtime) ───────────────────────────────────
interface Spr {
  spriteId: number; oamIndex: number;
  x: number; y: number; x2: number; y2: number;
  data: number[]; tileBase: number; invisible: boolean; inUse: boolean;
  callback: ((s: Spr) => void) | null;
}
function _spr(id: number): Spr | undefined {
  return getRuntime()?.gSprites[id] as unknown as Spr | undefined;
}
/** 1:1 `gBattlerSpriteIds[battler]` — via le pont controllers (modèle du port). */
function _battlerSpriteId(battler: number): number {
  const g = globalThis as {
    __battleControllerPlayer?: { getBattlerMonSpriteId?: (b: number) => number };
    __battleControllerOpponent?: { getBattlerMonSpriteId?: (b: number) => number };
  };
  const fn = battler % 2 === 0
    ? g.__battleControllerPlayer?.getBattlerMonSpriteId
    : g.__battleControllerOpponent?.getBattlerMonSpriteId;
  return fn ? fn(battler) : -1;
}

// ─── Assets ombre (gSpriteSheet_EnemyShadow, battle_anim_smokescreen.c.c:127) ──────────────
const ENEMY_SHADOW_PNG = '/decomp/em/battle_interface/enemy_mon_shadow.png';
const GFXTAG_SHADOW = 'GFXTAG_SHADOW';
const PALTAG_SHADOW = 'PALTAG_SHADOW';
let _shadowGfx: Uint8Array | null = null;     // 4 tiles (0x80)
let _shadowPal: Uint16Array | null = null;
let _shadowTileStart = -1;
let _shadowPalSlot = -1;

/** Précharge le gfx ombre (PNG → cache module). Divergence plateforme async. */
export async function ensureEnemyShadowAssets(): Promise<boolean> {
  if (_shadowGfx && _shadowPal) return true;
  try {
    const png = await loadIndexedPngStrict(ENEMY_SHADOW_PNG, 4);
    const plte = await extractPngPlte(ENEMY_SHADOW_PNG);
    if (!plte) return false;
    _shadowGfx = png.charData;
    _shadowPal = plte.subarray(0, 16);
    return true;
  } catch { return false; }
}

/** 1:1 `healthBoxesData[battler].shadowSpriteId` (battle.h) — storage module
 *  (dette : champ struct battle-sprites-data). -1 = pas d'ombre. */
const _shadowSpriteIds: number[] = new Array(MAX_BATTLERS_COUNT).fill(-1);

// ─── SpriteCB 1:1 ────────────────────────────────────────────────────────────

/** 1:1 décomp `void SpriteCB_SetInvisible(struct Sprite *sprite)` (:1234). */
export function SpriteCB_SetInvisible(sprite: Spr): void {
  sprite.invisible = true;
}

/** 1:1 décomp `void SpriteCB_EnemyShadow(struct Sprite *shadowSprite)` (:1207).
 *  Suit le sprite du battler (x/x2) ; invisible si anim de script active, mon
 *  invisible, ou derrière Clone. (transformSpecies non modélisé → branche skip,
 *  1:1 Transform inactif. IsBattlerSpritePresent ≈ sprite inUse en single.) */
export function SpriteCB_EnemyShadow(shadowSprite: Spr): void {
  let invisible = false;
  const battler = shadowSprite.data[0];   // tBattlerId
  const monSpriteId = _battlerSpriteId(battler);
  const battlerSprite = monSpriteId >= 0 ? _spr(monSpriteId) : undefined;

  if (!battlerSprite || !battlerSprite.inUse) {
    shadowSprite.callback = SpriteCB_SetInvisible as unknown as Spr['callback'];
    return;
  }
  const animActive = !!(globalThis as { __battleState?: { gAnimScriptActive?: boolean } })
    .__battleState?.gAnimScriptActive;
  if (animActive || battlerSprite.invisible) invisible = true;
  if (isBehindSubstitute(battler)) invisible = true;

  shadowSprite.x = battlerSprite.x;
  shadowSprite.x2 = battlerSprite.x2;
  shadowSprite.invisible = invisible;
}

// ─── API 1:1 ─────────────────────────────────────────────────────────────────

/** 1:1 décomp `void LoadAndCreateEnemyShadowSprites(void)` (:1183).
 *  Charge le sheet ombre + crée le sprite ombre du battler OPPONENT_LEFT
 *  (32×8, priority 3, subpriority 0xC8, callback initial SetInvisible — activé
 *  par SetBattlerShadowSpriteCallback selon l'élévation de l'espèce).
 *  (Double : OPPONENT_RIGHT — non atteignable, single only.) */
export function LoadAndCreateEnemyShadowSprites(): void {
  const rt = getRuntime();
  if (!rt || !_shadowGfx || !_shadowPal) return;

  // 1:1 LoadCompressedSpriteSheet(&gSpriteSheet_EnemyShadow) (0x80 = 4 tiles).
  _shadowTileStart = LoadSpriteSheet({ data: _shadowGfx, size: 0x80, tag: GFXTAG_SHADOW });
  _shadowPalSlot = LoadSpritePalette({ data: _shadowPal, tag: PALTAG_SHADOW });

  // 1:1 : battler = GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT) = 1 en single.
  const battler = 1;
  const created = rt.CreateSpriteAtOam({
    tileId: _shadowTileStart, paletteBank: _shadowPalSlot,
    x: GetBattlerSpriteCoord(battler, BATTLER_COORD_X),
    y: GetBattlerSpriteCoord(battler, BATTLER_COORD_Y) + 29,
    shape: 1, size: 1,            // 1:1 sOamData_EnemyShadow (32×8)
    priority: 3,                  // 1:1 .priority = 3 (sous le mon)
    subpriority: 0xC8 & 0xFF,     // 1:1 CreateSprite(..., 0xC8)
  });
  const sp = _spr(created.spriteId);
  if (!sp) return;
  sp.tileBase = _shadowTileStart;
  sp.data[0] = battler;                                        // 1:1 .data[0] = battler
  sp.invisible = true;                                         // callback initial = SetInvisible
  sp.callback = SpriteCB_SetInvisible as unknown as Spr['callback'];  // 1:1 template .callback
  _shadowSpriteIds[battler] = created.spriteId;
}

/** 1:1 décomp `void SetBattlerShadowSpriteCallback(u8 battler, u16 species)` (:1239).
 *  L'ombre du joueur n'existe jamais ; l'ombre adverse s'active si l'espèce a une
 *  élévation (gEnemyMonElevation[species] != 0, via GetBattlerElevation 1:1). */
export function SetBattlerShadowSpriteCallback(battler: number, species: number): void {
  if (GET_BATTLER_SIDE(battler) === B_SIDE_PLAYER) return;   // 1:1 :1242
  const shadow = _spr(_shadowSpriteIds[battler]);
  if (!shadow) return;
  // (transformSpecies non modélisé → species tel quel, 1:1 Transform inactif.)
  if (GetBattlerElevation(battler, species) !== 0) {
    shadow.callback = SpriteCB_EnemyShadow as unknown as Spr['callback'];
  } else {
    shadow.callback = SpriteCB_SetInvisible as unknown as Spr['callback'];
  }
}

/** 1:1 décomp `void HideBattlerShadowSprite(u8 battler)` (:1252). */
export function HideBattlerShadowSprite(battler: number): void {
  const shadow = _spr(_shadowSpriteIds[battler]);
  if (shadow) shadow.callback = SpriteCB_SetInvisible as unknown as Spr['callback'];
}

/** 1:1 décomp `void CopyBattleSpriteInvisibility(u8 battler)` (:930-933) :
 *  battlerData[battler].invisible = gSprites[gBattlerSpriteIds[battler]].invisible.
 *  Mémorise l'invisibilité (Vol/Tunnel…) — RESTAURÉE par le reshow (CreateBattlerSprite,
 *  reshow_battle_screen.c:272) pour que le mon reste invisible après un party menu. */
export function CopyBattleSpriteInvisibility(battler: number): void {
  const sp = _spr(_battlerSpriteId(battler));
  if (sp) setBattlerDataInvisible(battler, !!sp.invisible);
}

/** 1:1 décomp `void CopyAllBattleSpritesInvisibilities(void)`. */
export function CopyAllBattleSpritesInvisibilities(): void {
  for (let i = 0; i < gBattlersCount; i++) CopyBattleSpriteInvisibility(i);
}

/** Lecture 1:1 `battlerData[b].invisible` (pour le restore reshow). */
export { isBattlerDataInvisible };

/** 1:1 décomp `void FillAroundBattleWindows(void)` (:1260) : force à 0xF chaque
 *  nibble nul des 9×16 u16 à partir de VRAM+0x240 (= pixels transparents des tiles
 *  18-26 du tileset textbox, charblock BG 0 → opacifiés couleur 15). Notre VRAM BG
 *  est unifiée + mappée 1:1 hardware (gba.ts) → bg(0).vram = view de VRAM+0
 *  (BG0 battle : charBase=0). u16 LE : 0xF000/0x0F00 = byte haut, 0x00F0/0x000F = bas. */
export function FillAroundBattleWindows(): void {
  const rt = getRuntime();
  const vram = (rt as unknown as { gba?: { bg?: (n: number) => { vram: Uint8Array } } })
    ?.gba?.bg?.(0)?.vram;
  if (!vram || vram.length < 0x240 + 9 * 16 * 2) return;
  let off = 0x240;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 16; j++) {
      let lo = vram[off], hi = vram[off + 1];
      if (!(hi & 0xF0)) hi |= 0xF0;   // 1:1 !(*vramPtr & 0xF000)
      if (!(hi & 0x0F)) hi |= 0x0F;   // 1:1 !(*vramPtr & 0x0F00)
      if (!(lo & 0xF0)) lo |= 0xF0;   // 1:1 !(*vramPtr & 0x00F0)
      if (!(lo & 0x0F)) lo |= 0x0F;   // 1:1 !(*vramPtr & 0x000F)
      vram[off] = lo; vram[off + 1] = hi;
      off += 2;
    }
  }
}

// ─── BattleInitAllSprites 1:1 (battle_gfx_sfx_util.c:846-905) — ⚠️ DORMANT ─────
// Machine d'init des sprites combat (healthboxes + ombres), tickée par
// CB2_InitBattleInternal (battle_main). Portée 1:1 ; le CALL-SITE actuel du port
// (battle-decomp-loop case 18 → __battleHealthbox.initAllHealthboxes) sera basculé
// vers CETTE machine après A/B dédié (étape suivante de la migration). Divergence
// plateforme : créations async → cases « busy » (pattern reshow) ; safari/link skippés
// (non atteignables) ; BufferBattlePartyCurrentOrder = hook optionnel (link-only).

import {
  CreateBattlerHealthboxSprites as _CBHS,
  InitBattlerHealthboxCoords as _IBHC,
  UpdateHealthboxAttribute as _UHA,
  SetHealthboxSpriteInvisible as _SHSI,
  BattleLoadAllHealthBoxesGfx as _BLAHBG,
  gHealthboxSpriteIds as _gHbIds,
  GetHPBarLevel,
} from './battle_interface';
import { gPlayerParty as _gPP, gEnemyParty as _gEP } from './engine/battle/party-storage';
import { gBattlerPartyIndexes as _gBPI } from './engine/battle/state';

let _biasBusy = false;
const HEALTHBOX_ALL = 0;

/** 1:1 décomp `bool8 BattleInitAllSprites(u8 *state1, u8 *battler)` — retourne true
 *  quand l'init est finie. state/battler passés par référence ({value}). DORMANT. */
export function BattleInitAllSprites(state1: { value: number }, battler: { value: number }): boolean {
  if (_biasBusy) return false;
  const bc = gBattlersCount;
  let retVal = false;
  switch (state1.value) {
    case 0:
      // 1:1 ClearSpritesBattlerHealthboxAnimData (= healthbox + battlerData) :
      // notre alloc fraîche (AllocateBattleSpritesData) couvre le même reset.
      resetBattleSpritesData();
      // Sous-sprites barre : enregistre le sync per-frame (1:1 AddSubspritesToOamBuffer
      // dans BuildOamBuffer) — l'ancienne voie initAllHealthboxes le posait, la machine
      // reprend ce rôle plateforme.
      (globalThis as Record<string, unknown>)._syncSubspriteOam = syncSubspriteOam;
      state1.value++;
      break;
    case 1:
      // 1:1 BattleLoadAllHealthBoxesGfx(*battler) itératif — notre version charge
      // tout d'un coup (async). + précharge les assets ombre (case 6 en dépend).
      _biasBusy = true;
      void Promise.all([_BLAHBG(), ensureEnemyShadowAssets()]).then(() => { _biasBusy = false; });
      battler.value = 0;
      state1.value++;
      break;
    case 2:
      state1.value++;
      break;
    case 3: {
      // (Safari non atteignable → CreateBattlerHealthboxSprites direct, 1:1 else.)
      const b3 = battler.value;   // capture AVANT incrément (le .then arrive après)
      _biasBusy = true;
      void _CBHS(b3).then((id) => { _gHbIds[b3] = id; _biasBusy = false; });
      battler.value++;
      if (battler.value === bc) { battler.value = 0; state1.value++; }
      break;
    }
    case 4:
      _IBHC(battler.value);
      // (DummyBattleInterfaceFunc = no-op 1:1.)
      battler.value++;
      if (battler.value === bc) { battler.value = 0; state1.value++; }
      break;
    case 5: {
      const b = battler.value;
      const isPlayer = GET_BATTLER_SIDE(b) === B_SIDE_PLAYER;
      const mon = isPlayer ? _gPP[_gBPI[b] ?? 0] : _gEP[_gBPI[b] ?? 0];
      if (mon) _UHA(_gHbIds[b], mon, HEALTHBOX_ALL);
      _SHSI(_gHbIds[b]);
      battler.value++;
      if (battler.value === bc) { battler.value = 0; state1.value++; }
      break;
    }
    case 6:
      LoadAndCreateEnemyShadowSprites();
      // 1:1 BufferBattlePartyCurrentOrder (link-only) → hook optionnel.
      (globalThis as { __battleLink?: { BufferBattlePartyCurrentOrder?: () => void } })
        .__battleLink?.BufferBattlePartyCurrentOrder?.();
      retVal = true;
      break;
  }
  return retVal;
}

// Refs persistantes de la machine (= gBattleCommunication[SPRITES_INIT_STATE1/2]
// du décomp, CB2_InitBattleInternal). Reset à chaque boot via
// resetBattleInitAllSpritesState (appelé par resetHealthboxL → hook global).
const _biasState = { value: 0 };
const _biasBattler = { value: 0 };
export function resetBattleInitAllSpritesState(): void {
  _biasState.value = 0;
  _biasBattler.value = 0;
  _biasBusy = false;
}
/** Tick du call-site (battle-link-start case 18) : passe les refs module 1:1. */
export function BattleInitAllSpritesTick(): boolean {
  return BattleInitAllSprites(_biasState, _biasBattler);
}

// ─── Enregistrement (hook structurel lu par reshow_battle_screen case 19) ────
(globalThis as Record<string, unknown>).__battleGfxSfxUtil = {
  LoadAndCreateEnemyShadowSprites,
  SetBattlerShadowSpriteCallback,
  HideBattlerShadowSprite,
  SpriteCB_EnemyShadow, SpriteCB_SetInvisible,
  ensureEnemyShadowAssets,
  ClearSpritesHealthboxAnimData,
  CopyBattleSpriteInvisibility, CopyAllBattleSpritesInvisibilities,
  BattleInitAllSprites, BattleInitAllSpritesTick, resetBattleInitAllSpritesState,
  AllocateBattleSpritesData, FreeBattleSpritesData,
  BattleLoadOpponentMonSpriteGfx, BattleLoadPlayerMonSpriteGfx,
  AllocateMonSpritesGfx, FreeMonSpritesGfx, gMonSpritesGfxPtr,
  DecompressTrainerFrontPic, DecompressTrainerBackPic, FreeTrainerFrontPicPalette,
  LoadBattleBarGfx, HandleSpeciesGfxDataChange, BattleLoadSubstituteOrMonSpriteGfx,
  LoadBattleMonGfxAndAnimate, ClearTemporarySpeciesSpriteData,
  IsBattleSEPlaying, BattleLoadAllHealthBoxesGfxAtOnce, GetMonHPBarLevel,
  TrySetBehindSubstituteSpriteBit, ClearBehindSubstituteBit, SetBattlerSpriteAffineMode,
};

// ─── Anims de STATUT + anims GENERAL par table (goal T3 2026-06-10) ─────────
// 1:1 battle_gfx_sfx_util.c:349-466.

import { LaunchStatusAnimation } from './battle_anim_status_effects';
import {
  LaunchBattleAnimation as _LaunchBattleAnim, isAnimScriptActive as _animActive,
  tickAnimScript as _tickAnim, setBattleAnimAttackerTarget as _setAnimAtkTgt,
} from './engine/battle/battle-anim-interpreter';
import {
  setStatusAnimActive as _setStatusAnimActive, isStatusAnimActive as _isStatusAnimActive,
  isBehindSubstitute as _behindSub,
  setSpecialAnimActive as _setSpecialAnimActive,
} from './engine/battle/battle-sprites-data';

import {
  STATUS1_FREEZE as _S1_FRZ, STATUS1_POISON as _S1_PSN, STATUS1_TOXIC_POISON as _S1_TOX,
  STATUS1_BURN as _S1_BRN, STATUS1_SLEEP as _S1_SLP, STATUS1_PARALYSIS as _S1_PRZ,
  STATUS2_INFATUATION as _S2_INF, STATUS2_CONFUSION as _S2_CNF, STATUS2_CURSED as _S2_CRS,
  STATUS2_NIGHTMARE as _S2_NGT, STATUS2_WRAPPED as _S2_WRP,
} from './engine/battle/constants';

// 1:1 battle_anim.h:391-400.
const B_ANIM_STATUS_PSN = 0, B_ANIM_STATUS_CONFUSION = 1, B_ANIM_STATUS_BRN = 2,
  B_ANIM_STATUS_INFATUATION = 3, B_ANIM_STATUS_SLP = 4, B_ANIM_STATUS_PRZ = 5,
  B_ANIM_STATUS_FRZ = 6, B_ANIM_STATUS_CURSED = 7, B_ANIM_STATUS_NIGHTMARE = 8,
  B_ANIM_STATUS_WRAPPED = 9;

function _activeBattlerGfx(): number {
  return ((globalThis as Record<string, unknown>).gActiveBattler as number) ?? 0;
}

/** 1:1 décomp `InitAndLaunchChosenStatusAnimation(isStatus2, status)`
 *  (battle_gfx_sfx_util.c:349-381). */
export function InitAndLaunchChosenStatusAnimation(isStatus2: boolean, status: number): void {
  const battler = _activeBattlerGfx();
  _setStatusAnimActive(battler, true);
  if (!isStatus2) {
    if (status === _S1_FRZ) LaunchStatusAnimation(battler, B_ANIM_STATUS_FRZ);
    else if (status === _S1_PSN || (status & _S1_TOX)) LaunchStatusAnimation(battler, B_ANIM_STATUS_PSN);
    else if (status === _S1_BRN) LaunchStatusAnimation(battler, B_ANIM_STATUS_BRN);
    else if (status & _S1_SLP) LaunchStatusAnimation(battler, B_ANIM_STATUS_SLP);
    else if (status === _S1_PRZ) LaunchStatusAnimation(battler, B_ANIM_STATUS_PRZ);
    else _setStatusAnimActive(battler, false); // no animation
  } else {
    if (status & _S2_INF) LaunchStatusAnimation(battler, B_ANIM_STATUS_INFATUATION);
    else if (status & _S2_CNF) LaunchStatusAnimation(battler, B_ANIM_STATUS_CONFUSION);
    else if (status & _S2_CRS) LaunchStatusAnimation(battler, B_ANIM_STATUS_CURSED);
    else if (status & _S2_NGT) LaunchStatusAnimation(battler, B_ANIM_STATUS_NIGHTMARE);
    else if (status & _S2_WRP) LaunchStatusAnimation(battler, B_ANIM_STATUS_WRAPPED); // n'existe pas (1:1)
    else _setStatusAnimActive(battler, false);
  }
}

// gBattleSpritesDataPtr->healthBoxesData[b].animFromTableActive (module-local,
// meme pattern que les autres bits healthBoxesData).
const _animFromTableActive: boolean[] = [false, false, false, false];
export function isAnimFromTableActive(battler: number): boolean { return _animFromTableActive[battler] ?? false; }

/** 1:1 décomp `ShouldAnimBeDoneRegardlessOfSubstitute(animId)` (:428-442). */
function ShouldAnimBeDoneRegardlessOfSubstitute(animId: number): boolean {
  // B_ANIM_* general ids (battle_anim.h) : SUBSTITUTE_TO_MON=5, SUBSTITUTE_FADE=2(?),
  // SNATCH_MOVE, etc. — 1:1 les cases du switch décomp :
  switch (animId) {
    case 2:  // B_ANIM_SUBSTITUTE_FADE
    case 10: // B_ANIM_RAIN_CONTINUES
    case 11: // B_ANIM_SUN_CONTINUES
    case 12: // B_ANIM_SANDSTORM_CONTINUES
    case 13: // B_ANIM_HAIL_CONTINUES
    case 17: // B_ANIM_SNATCH_MOVE
      return true;
    default:
      return false;
  }
}

/** 1:1 décomp `Task_ClearBitWhenBattleTableAnimDone(taskId)` (:444-453). */
function Task_ClearBitWhenBattleTableAnimDone(task: { data: number[]; taskId: number }): void {
  _tickAnim();
  if (!_animActive()) {
    _animFromTableActive[task.data[0]] = false;
    _DestroyTask(task.taskId);
  }
}

/** 1:1 décomp `TryHandleLaunchBattleTableAnimation(activeBattler, atkBattler,
 *  defBattler, tableId, argument)` (:383-426). Retourne TRUE si SKIPPÉE. */
export function TryHandleLaunchBattleTableAnimation(
  activeBattler: number, atkBattler: number, defBattler: number,
  tableId: number, argument: number,
): boolean {
  // 1:1 : Castform behind substitute → set form, skip (CASTFORM_SUBSTITUTE = 0x80).
  if (tableId === 25 /* B_ANIM_CASTFORM_CHANGE */ && (argument & 0x80)) {
    // gBattleMonForms[activeBattler] = argument & ~0x80 — formes = dette Castform.
    return true;
  }
  if (_behindSub(activeBattler) && !ShouldAnimBeDoneRegardlessOfSubstitute(tableId)) {
    return true;
  }
  // 1:1 behindSubstitute && SUBSTITUTE_FADE && invisible → reload gfx, skip :
  // (LoadBattleMonGfxAndAnimate + ClearBehindSubstituteBit — chemin substitute,
  //  rare ; dette douce, log si rencontré.)
  _setAnimAtkTgt(atkBattler, defBattler);
  // gBattleSpritesDataPtr->animationData->animArg = argument (consommé par
  // certains scripts General via les args — posé sur la surface anim).
  (globalThis as Record<string, unknown>).__battleAnimArg = argument;
  _LaunchBattleAnim('gBattleAnims_General', tableId, false);
  const taskId = _CreateTask(Task_ClearBitWhenBattleTableAnimDone, 10);
  const t = (globalThis as { __rt?: { gTasks?: { data: number[] }[] } }).__rt?.gTasks?.[taskId];
  if (t) t.data[0] = activeBattler;
  _animFromTableActive[activeBattler] = true;
  return false;
}

/** 1:1 décomp `Task_ClearBitWhenSpecialAnimDone(taskId)` (battle_gfx_sfx_util.c:535-543) :
 *  ticke le script anim (gAnimScriptCallback()) chaque frame ; à la fin
 *  (gAnimScriptActive == FALSE) → specialAnimActive = 0 + DestroyTask.
 *  tBattlerId = data[0]. */
function Task_ClearBitWhenSpecialAnimDone(task: { data: number[]; taskId: number }): void {
  _tickAnim();
  if (!_animActive()) {
    _setSpecialAnimActive(task.data[0], false);
    _DestroyTask(task.taskId);
  }
}

/** 1:1 décomp `InitAndLaunchSpecialAnimation(activeBattler, atkBattler, defBattler,
 *  tableId)` (battle_gfx_sfx_util.c:523-533) : gBattleAnimAttacker/Target posés,
 *  LaunchBattleAnimation(gBattleAnims_Special, tableId), task de tick + bit
 *  specialAnimActive[activeBattler]. Consommé par DoSwitchOutAnimation
 *  (rappel dans la ball au switch) côté player ET opponent. */
export function InitAndLaunchSpecialAnimation(activeBattler: number, atkBattler: number, defBattler: number, tableId: number): void {
  _setAnimAtkTgt(atkBattler, defBattler);
  _LaunchBattleAnim('gBattleAnims_Special', tableId, false);
  const taskId = _CreateTask(Task_ClearBitWhenSpecialAnimDone, 10);
  const t = (globalThis as { __rt?: { gTasks?: { data: number[] }[] } }).__rt?.gTasks?.[taskId];
  if (t) t.data[0] = activeBattler;
  _setSpecialAnimActive(activeBattler, true);
}

// Surface harness (anti import()-dynamique : l'instance Vite fraiche MENT).
// ⚠️ ÉTENDRE la surface posée plus haut (:728), PAS la réassigner : l'ancienne
// réassignation ÉCRASAIT les 25 fonctions du 1er bloc (HideBattlerShadowSprite,
// LoadAndCreateEnemyShadowSprites, reshow case 19…) → no-ops silencieux chez
// tous les consommateurs globalThis (bug démasqué au port du switch-out).
Object.assign((globalThis as Record<string, unknown>).__battleGfxSfxUtil as Record<string, unknown>, {
  InitAndLaunchChosenStatusAnimation, TryHandleLaunchBattleTableAnimation, isAnimFromTableActive,
  InitAndLaunchSpecialAnimation,
});
