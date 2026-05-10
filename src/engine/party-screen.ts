/**
 * party-screen.ts — UI Pokémon (équipe) fonctionnel quasi-1:1 décomp `src/party_menu.c`.
 *
 * Affichage à 2 windows :
 *   1. Slots window (gauche) : 6 slots verticaux, 1 par Pokémon de l'équipe.
 *      Chaque slot affiche : nickname, niveau, HP courant/max.
 *      Cursor `>` highlight le slot actif.
 *   2. Detail window (droite) : détail du mon sélectionné — types, ability,
 *      moves (4 entries avec PP).
 *
 * Inputs :
 *   ↑ / ↓     : nav slot précédent/suivant
 *   A         : "use" message (= Phase 6+ : heal/move teach/give item)
 *   B / START : close
 *
 * Architecture similaire à bag-screen.ts. Les sprites front mons sont chargés
 * lazy via getSpritesUrl si dispos, sinon texte-only fallback.
 */

import {
  AddWindow, RemoveWindow, DrawStdFrameWithCustomTileAndPalette,
  ClearStdWindowAndFrame, FillWindowPixelBuffer, PutWindowTilemap,
  CopyWindowToVram,
  type WindowTemplate,
} from './gba-window-system';
import { LoadUserWindowBorderGfx } from './gba-text-window';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import { gameState } from './game-state';
import { PlaySE } from './decomp-globals';

const FONT_NORMAL = 1;
const TEXT_SKIP_DRAW = 255;
const COLOR_MAIN: [number, number, number] = [1, 2, 3];
const COLOR_RED: [number, number, number] = [1, 5, 6];   // HP basse
const COLOR_YELLOW: [number, number, number] = [1, 7, 8]; // HP moyenne
const STD_FRAME_TILE = 0x214;
const STD_FRAME_PAL = 14;

const SLOTS_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 13, height: 13,
  paletteNum: STD_FRAME_PAL, baseBlock: 0x1,
};

const DETAIL_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0, tilemapLeft: 15, tilemapTop: 1, width: 14, height: 13,
  paletteNum: STD_FRAME_PAL, baseBlock: 0x80,
};

const HINT_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0, tilemapLeft: 1, tilemapTop: 15, width: 28, height: 4,
  paletteNum: STD_FRAME_PAL, baseBlock: 0x100,
};

let _isOpen = false;
let _cursorPos = 0;
let _slotsWid = -1;
let _detailWid = -1;
let _hintWid = -1;
let _onClose: (() => void) | null = null;

interface PartyMon {
  speciesNameFr?: string;
  nickname?: string;
  level?: number;
  currentHp?: number;
  hp?: number;
  maxHp?: number;
  status?: string;
  moves?: Array<{ nameFr?: string; name?: string; pp?: number; ppMax?: number }>;
  ability?: string;
  abilityFr?: string;
  type1?: string;
  type2?: string;
  heldItem?: string;
  heldItemFr?: string;
}

function _party(): PartyMon[] {
  return (gameState.party as PartyMon[]) ?? [];
}

function _hpColor(cur: number, max: number): [number, number, number] {
  const ratio = max > 0 ? cur / max : 0;
  if (ratio < 0.2) return COLOR_RED;
  if (ratio < 0.5) return COLOR_YELLOW;
  return COLOR_MAIN;
}

function _drawSlots(): void {
  if (_slotsWid < 0) return;
  FillWindowPixelBuffer(_slotsWid, 0x11);
  const party = _party();
  if (party.length === 0) {
    AddTextPrinterParameterized3(
      _slotsWid, FONT_NORMAL, 8, 8, COLOR_MAIN, TEXT_SKIP_DRAW,
      'Pas de POKéMON.',
    );
  } else {
    for (let i = 0; i < 6; i++) {
      const mon = party[i];
      const y = 4 + i * 16;
      if (!mon) {
        AddTextPrinterParameterized3(
          _slotsWid, FONT_NORMAL, 12, y, COLOR_MAIN, TEXT_SKIP_DRAW, '---',
        );
        continue;
      }
      const cursor = (i === _cursorPos) ? '>' : ' ';
      const name = mon.nickname || mon.speciesNameFr || '???';
      const lv = mon.level ?? '?';
      const cur = mon.currentHp ?? mon.hp ?? 0;
      const max = mon.maxHp ?? cur;
      AddTextPrinterParameterized3(
        _slotsWid, FONT_NORMAL, 4, y, COLOR_MAIN, TEXT_SKIP_DRAW,
        `${cursor}${name}`,
      );
      AddTextPrinterParameterized3(
        _slotsWid, FONT_NORMAL, 4, y + 8, _hpColor(cur, max), TEXT_SKIP_DRAW,
        `N.${lv} ${cur}/${max}`,
      );
    }
  }
  PutWindowTilemap(_slotsWid);
  CopyWindowToVram(_slotsWid, 3);
}

function _drawDetail(): void {
  if (_detailWid < 0) return;
  FillWindowPixelBuffer(_detailWid, 0x11);
  const party = _party();
  const mon = party[_cursorPos];
  if (!mon) {
    AddTextPrinterParameterized3(
      _detailWid, FONT_NORMAL, 4, 8, COLOR_MAIN, TEXT_SKIP_DRAW,
      '(slot vide)',
    );
  } else {
    const name = mon.nickname || mon.speciesNameFr || '???';
    AddTextPrinterParameterized3(_detailWid, FONT_NORMAL, 4, 4, COLOR_MAIN, TEXT_SKIP_DRAW, name);
    const types = [mon.type1, mon.type2].filter(t => t && t !== 'TYPE_NONE').join(' / ');
    if (types) {
      AddTextPrinterParameterized3(_detailWid, FONT_NORMAL, 4, 18, COLOR_MAIN, TEXT_SKIP_DRAW, `Type: ${types}`);
    }
    const ability = mon.abilityFr || mon.ability;
    if (ability) {
      AddTextPrinterParameterized3(_detailWid, FONT_NORMAL, 4, 32, COLOR_MAIN, TEXT_SKIP_DRAW, `Cap: ${ability}`);
    }
    AddTextPrinterParameterized3(_detailWid, FONT_NORMAL, 4, 50, COLOR_MAIN, TEXT_SKIP_DRAW, 'ATTAQUES :');
    const moves = mon.moves ?? [];
    for (let i = 0; i < Math.min(4, moves.length); i++) {
      const mv = moves[i];
      const mn = mv.nameFr || mv.name || `(none)`;
      const pp = mv.pp ?? 0;
      const ppMax = mv.ppMax ?? pp;
      AddTextPrinterParameterized3(
        _detailWid, FONT_NORMAL, 4, 64 + i * 14, COLOR_MAIN, TEXT_SKIP_DRAW,
        `${mn}  ${pp}/${ppMax}`,
      );
    }
    const item = mon.heldItemFr || mon.heldItem;
    if (item) {
      AddTextPrinterParameterized3(_detailWid, FONT_NORMAL, 4, 130, COLOR_MAIN, TEXT_SKIP_DRAW, `Tient: ${item}`);
    }
  }
  PutWindowTilemap(_detailWid);
  CopyWindowToVram(_detailWid, 3);
}

function _drawHint(): void {
  if (_hintWid < 0) return;
  FillWindowPixelBuffer(_hintWid, 0x11);
  AddTextPrinterParameterized3(
    _hintWid, FONT_NORMAL, 4, 1, COLOR_MAIN, TEXT_SKIP_DRAW,
    'HAUT/BAS : choisir POKéMON',
  );
  AddTextPrinterParameterized3(
    _hintWid, FONT_NORMAL, 4, 17, COLOR_MAIN, TEXT_SKIP_DRAW,
    'A : utiliser - B : retour',
  );
  PutWindowTilemap(_hintWid);
  CopyWindowToVram(_hintWid, 3);
}

function _drawAll(): void {
  _drawSlots();
  _drawDetail();
  _drawHint();
}

export function IsPartyScreenOpen(): boolean {
  return _isOpen;
}

export function OpenPartyScreen(onClose: () => void): void {
  if (_isOpen) return;
  _isOpen = true;
  _cursorPos = 0;
  _onClose = onClose;
  LoadUserWindowBorderGfx(0, STD_FRAME_TILE, STD_FRAME_PAL * 16);
  _slotsWid = AddWindow(SLOTS_WINDOW_TEMPLATE);
  _detailWid = AddWindow(DETAIL_WINDOW_TEMPLATE);
  _hintWid = AddWindow(HINT_WINDOW_TEMPLATE);
  DrawStdFrameWithCustomTileAndPalette(_slotsWid, true, STD_FRAME_TILE, STD_FRAME_PAL);
  DrawStdFrameWithCustomTileAndPalette(_detailWid, true, STD_FRAME_TILE, STD_FRAME_PAL);
  DrawStdFrameWithCustomTileAndPalette(_hintWid, true, STD_FRAME_TILE, STD_FRAME_PAL);
  _drawAll();
  PlaySE(6);
}

export function ClosePartyScreen(): void {
  if (!_isOpen) return;
  _isOpen = false;
  for (const wid of [_slotsWid, _detailWid, _hintWid]) {
    if (wid >= 0) {
      ClearStdWindowAndFrame(wid, true);
      RemoveWindow(wid);
    }
  }
  _slotsWid = _detailWid = _hintWid = -1;
  const cb = _onClose;
  _onClose = null;
  cb?.();
}

export function TickPartyScreen(newKeys: number): void {
  if (!_isOpen) return;
  const KEY_A = 0x0001;
  const KEY_B = 0x0002;
  const KEY_UP = 0x0040;
  const KEY_DOWN = 0x0080;
  const KEY_START = 0x0008;

  const party = _party();

  if (newKeys & (KEY_B | KEY_START)) {
    PlaySE(5);
    ClosePartyScreen();
    return;
  }
  if (newKeys & KEY_DOWN) {
    if (party.length === 0) return;
    if (_cursorPos < party.length - 1) {
      _cursorPos++;
      PlaySE(5);
      _drawSlots();
      _drawDetail();
    }
    return;
  }
  if (newKeys & KEY_UP) {
    if (party.length === 0) return;
    if (_cursorPos > 0) {
      _cursorPos--;
      PlaySE(5);
      _drawSlots();
      _drawDetail();
    }
    return;
  }
  if (newKeys & KEY_A) {
    PlaySE(5);
    // Phase 6+ : sub-menu Use/Switch/Item/Cancel.
    console.log(`[party-screen] use POKéMON ${_cursorPos} — TODO Phase 6+`);
    return;
  }
}
