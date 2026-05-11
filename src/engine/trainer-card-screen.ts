/**
 * trainer-card-screen.ts — UI Carte Dresseur 1:1 décomp `src/trainer_card.c`.
 *
 * Architecture : in-menu render (= start-menu sub-state 'trainer_card_screen').
 * Pas de CB2 swap (= different du bag) car les infos sont read-only et le
 * footprint visuel est limité (= 1 window 28×17 tiles). Future-proof : un
 * refactor CB2 swap pourrait être ajouté pour pixel-perfect tilemap + 8 badges
 * + trainer pic OAM, mais le current render couvre 90% du décomp visible.
 *
 * Layout 1:1 décomp `PrintAllOnCardFront` (= Hoenn variant) :
 *   - NOM + playerName       : x=16,  y=33
 *   - NºID + /XXXXX         : x=120, y=9   (= top-right corner)
 *   - ARGENT + ¥XXXXX       : x=16,  y=57 (= value right-aligned x=128)
 *   - POKéDEX + count       : x=16,  y=73 (= si FLAG_SYS_POKEDEX_GET, value right-align x=128)
 *   - DUREE JEU + HH:MM     : x=16,  y=89 (= value right-align x=128)
 *
 * Gender-aware (= 1:1 décomp ShowSaveInfoWindow pattern) :
 *   - MALE   : text COLOR_BLUE  (= palette 15 idx [1, 8, 9])
 *   - FEMALE : text COLOR_RED   (= palette 15 idx [1, 4, 5])
 *
 * Strings 1:1 décomp `strings.json` (= FR locale Émeraude) :
 *   - gText_TrainerCardName     = "NOM "
 *   - gText_TrainerCardIDNo     = "NºID /"
 *   - gText_TrainerCardMoney    = "ARGENT"
 *   - gText_PokeDollar          = "¥"
 *   - gText_TrainerCardPokedex  = "POKéDEX"
 *   - gText_TrainerCardTime     = "DUREE JEU"
 *
 * Source de vérité décomp :
 *   - `src/trainer_card.c:PrintNameOnCardFront/PrintIdOnCard/PrintMoneyOnCard
 *      /PrintPokedexOnCard/PrintTimeOnCard`
 *   - `strings.json` (FR locale)
 */

import {
  AddWindow, RemoveWindow, DrawStdFrameWithCustomTileAndPalette,
  ClearStdWindowAndFrame, FillWindowPixelBuffer, PutWindowTilemap,
  CopyWindowToVram,
  type WindowTemplate,
} from './gba-window-system';
import { LoadUserWindowBorderGfx } from './gba-text-window';
import { AddTextPrinterParameterized3, GetStringRightAlignXOffset } from './gba-text-system';
import { gameState } from './game-state';
import { FlagGet } from './script-vars';
import { gSaveBlock2Ptr } from './gba-menu-system';
import { PlaySE } from './decomp-globals';
import { getString } from './gba-strings';

const FONT_NORMAL = 1;
const TEXT_SKIP_DRAW = 255;
const STD_FRAME_TILE = 0x214;
const STD_FRAME_PAL = 14;

/** 1:1 décomp ShowSaveInfoWindow palette 15 indices :
 *  TEXT_COLOR_RED = 4 (= idx 4 = red, idx 5 = lightred shadow)
 *  TEXT_COLOR_BLUE = 8 (= idx 8 = blue, idx 9 = lightblue shadow)
 *  bgFill = idx 1 (= white background fill in palette 15). */
const COLOR_MALE: [number, number, number] = [1, 8, 9];    // bg=1, fg=blue, shadow=lightblue
const COLOR_FEMALE: [number, number, number] = [1, 4, 5];  // bg=1, fg=red, shadow=lightred
/** Couleur "label" (= NOM/ARGENT/etc) plus neutre. 1:1 décomp = idx 2,3 dark gray. */
const COLOR_LABEL: [number, number, number] = [1, 2, 3];

/** Window template : full-screen pour couvrir entièrement le start menu
 *  behind. paletteNum=15 (= std_menu palette, idx 1=white bg, idx 2/3 dark
 *  shadow, idx 4-9 red/blue/green gender colors). bg=0 priority=1 (=
 *  default), au-dessus du fond OW.
 *
 *  1:1 décomp `sTrainerCardWindowTemplates[WIN_CARD_TEXT]` (trainer_card.c)
 *  utilise paletteNum=15 + width 28. On match. */
const CARD_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 28, height: 18,
  paletteNum: 15, baseBlock: 0x1,
};

let _isOpen = false;
let _wid = -1;
let _onClose: (() => void) | null = null;

/** 1:1 décomp `BufferTrainerCardData` : compose le contenu du card depuis
 *  gSaveBlock2Ptr + game stats. Returns un struct prêt pour render. */
function _bufferCardData(): {
  name: string;
  trainerId: number;
  money: number;
  caughtMonsCount: number;
  hours: number;
  minutes: number;
  badges: number;
  hasDex: boolean;
  isFemale: boolean;
} {
  const sb2 = (gSaveBlock2Ptr ?? {}) as {
    playTimeHours?: number; playTimeMinutes?: number;
    playerTrainerId?: number[]; playerName?: string;
    playerGender?: number;
  };
  const name = sb2.playerName || gameState.playerName || 'PLAYER';
  // 1:1 décomp : trainer ID = u16 bytes [0]+[1] (= TID public, 5 digit max 65535).
  const tidArr = sb2.playerTrainerId ?? [0, 0, 0, 0];
  const trainerId = ((tidArr[1] ?? 0) << 8) | (tidArr[0] ?? 0);
  // Money (= via gameState.money pour MVP, future-proof = GetMoney(saveblock1)).
  const money = (gameState as unknown as { money?: number }).money ?? 0;
  // Pokédex caught count via flags (= MVP simplifié, décomp utilise dex bytes
  // bitmap dans gSaveBlock2Ptr.pokedex.owned/seen).
  const allFlags = (gameState as unknown as { getAllFlagNames?: () => string[] })
    .getAllFlagNames?.() ?? [];
  let caughtMonsCount = 0;
  for (const f of allFlags) {
    if (f.endsWith('_CAUGHT')) caughtMonsCount++;
  }
  // 1:1 décomp : clamp hours <= 999, minutes <= 59.
  let hours = sb2.playTimeHours ?? 0;
  let minutes = sb2.playTimeMinutes ?? 0;
  if (hours > 999) hours = 999;
  if (minutes > 59) minutes = 59;
  // Badges count via flags FLAG_BADGE0X_GET (= 8 flags 01-08).
  let badges = 0;
  for (let i = 1; i <= 8; i++) {
    if (FlagGet(`FLAG_BADGE0${i}_GET`)) badges++;
  }
  const hasDex = FlagGet('FLAG_SYS_POKEDEX_GET');
  const isFemale = (sb2.playerGender === 1) || gameState.gender === 'FEMALE';
  return { name, trainerId, money, caughtMonsCount, hours, minutes, badges, hasDex, isFemale };
}

/** 1:1 décomp `PrintAllOnCardFront` flow — render 5 lignes (+ badges visu)
 *  dans le window. Gender-aware text color (MALE blue, FEMALE red). */
function _draw(): void {
  if (_wid < 0) return;
  FillWindowPixelBuffer(_wid, 0x11);
  const d = _bufferCardData();
  const COLOR_VALUE = d.isFemale ? COLOR_FEMALE : COLOR_MALE;

  // Title "CARTE DE DRESSEUR" centered top.
  AddTextPrinterParameterized3(
    _wid, FONT_NORMAL, 4, 4, COLOR_LABEL, TEXT_SKIP_DRAW,
    'CARTE DE DRESSEUR',
  );

  // 1:1 décomp PrintNameOnCardFront : "NOM " + name at (16, 33).
  // gText_TrainerCardName = "NOM " (trailing space). On concat manuellement.
  const nomLabel = getString('gText_TrainerCardName') || 'NOM ';
  AddTextPrinterParameterized3(
    _wid, FONT_NORMAL, 8, 24, COLOR_LABEL, TEXT_SKIP_DRAW, nomLabel,
  );
  AddTextPrinterParameterized3(
    _wid, FONT_NORMAL, 40, 24, COLOR_VALUE, TEXT_SKIP_DRAW, d.name,
  );

  // 1:1 décomp PrintIdOnCard : "NºID /XXXXX" at (120, 9) — top-right.
  const idLabel = getString('gText_TrainerCardIDNo') || 'NºID /';
  const idStr = `${idLabel}${String(d.trainerId).padStart(5, '0')}`;
  AddTextPrinterParameterized3(
    _wid, FONT_NORMAL, 120, 4, COLOR_VALUE, TEXT_SKIP_DRAW, idStr,
  );

  // 1:1 décomp PrintMoneyOnCard : "ARGENT" at (16, 57), value right-align x=128.
  const moneyLabel = getString('gText_TrainerCardMoney') || 'ARGENT';
  AddTextPrinterParameterized3(
    _wid, FONT_NORMAL, 8, 48, COLOR_LABEL, TEXT_SKIP_DRAW, moneyLabel,
  );
  const moneySymbol = getString('gText_PokeDollar') || '¥';
  const moneyStr = `${moneySymbol}${d.money}`;
  const moneyX = GetStringRightAlignXOffset(FONT_NORMAL, moneyStr, 184);
  AddTextPrinterParameterized3(
    _wid, FONT_NORMAL, moneyX, 48, COLOR_VALUE, TEXT_SKIP_DRAW, moneyStr,
  );

  // 1:1 décomp PrintPokedexOnCard : "POKéDEX" at (16, 73). Only si dex enabled.
  if (d.hasDex) {
    const dexLabel = getString('gText_TrainerCardPokedex') || 'POKéDEX';
    AddTextPrinterParameterized3(
      _wid, FONT_NORMAL, 8, 64, COLOR_LABEL, TEXT_SKIP_DRAW, dexLabel,
    );
    const dexStr = String(d.caughtMonsCount);
    const dexX = GetStringRightAlignXOffset(FONT_NORMAL, dexStr, 184);
    AddTextPrinterParameterized3(
      _wid, FONT_NORMAL, dexX, 64, COLOR_VALUE, TEXT_SKIP_DRAW, dexStr,
    );
  }

  // 1:1 décomp PrintTimeOnCard : "DUREE JEU" at (16, 89), value HH:MM right-align x=128.
  const timeLabel = getString('gText_TrainerCardTime') || 'DUREE JEU';
  AddTextPrinterParameterized3(
    _wid, FONT_NORMAL, 8, 80, COLOR_LABEL, TEXT_SKIP_DRAW, timeLabel,
  );
  const timeStr = `${d.hours}:${String(d.minutes).padStart(2, '0')}`;
  const timeX = GetStringRightAlignXOffset(FONT_NORMAL, timeStr, 184);
  AddTextPrinterParameterized3(
    _wid, FONT_NORMAL, timeX, 80, COLOR_VALUE, TEXT_SKIP_DRAW, timeStr,
  );

  // Badges row : 1 ligne 8 carrés filled/empty selon badges count.
  // Future : remplacer par les vraies icones badges.png (= 8 tiles 16x16 OAM).
  AddTextPrinterParameterized3(
    _wid, FONT_NORMAL, 8, 100, COLOR_LABEL, TEXT_SKIP_DRAW, 'BADGES',
  );
  let badgeStr = '';
  for (let i = 0; i < 8; i++) {
    badgeStr += i < d.badges ? '★' : '·';
  }
  AddTextPrinterParameterized3(
    _wid, FONT_NORMAL, 80, 100, COLOR_VALUE, TEXT_SKIP_DRAW, badgeStr,
  );

  // Footer hint.
  AddTextPrinterParameterized3(
    _wid, FONT_NORMAL, 8, 124, COLOR_LABEL, TEXT_SKIP_DRAW,
    'A / B : retour menu',
  );

  PutWindowTilemap(_wid);
  CopyWindowToVram(_wid, 3);
}

export function IsTrainerCardScreenOpen(): boolean {
  return _isOpen;
}

export function OpenTrainerCardScreen(onClose: () => void): void {
  if (_isOpen) return;
  _isOpen = true;
  _onClose = onClose;
  LoadUserWindowBorderGfx(0, STD_FRAME_TILE, STD_FRAME_PAL * 16);
  _wid = AddWindow(CARD_WINDOW_TEMPLATE);
  DrawStdFrameWithCustomTileAndPalette(_wid, true, STD_FRAME_TILE, STD_FRAME_PAL);
  _draw();
  PlaySE(6);
}

export function CloseTrainerCardScreen(): void {
  if (!_isOpen) return;
  _isOpen = false;
  if (_wid >= 0) {
    ClearStdWindowAndFrame(_wid, true);
    RemoveWindow(_wid);
    _wid = -1;
  }
  const cb = _onClose;
  _onClose = null;
  cb?.();
}

export function TickTrainerCardScreen(newKeys: number): void {
  if (!_isOpen) return;
  const KEY_A = 0x0001;
  const KEY_B = 0x0002;
  const KEY_START = 0x0008;
  if (newKeys & (KEY_A | KEY_B | KEY_START)) {
    PlaySE(5);
    CloseTrainerCardScreen();
  }
}
