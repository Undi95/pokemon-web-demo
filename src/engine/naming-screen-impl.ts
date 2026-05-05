/**
 * naming-screen-impl.ts
 * ──────────────────────
 * 1:1 décomp `src/naming_screen.c` (= 2594 lignes). Skeleton qui implemente
 * les helpers que les auto-callbacks (`auto/src/naming_screen-callbacks-auto.ts`)
 * référencent : sNamingScreen state struct, MainState_* handlers, sInputFuncs,
 * sprite helpers, BG layout setup, keyboard rendering.
 *
 * Phase 3 progressif :
 *   - Visuel : keyboard rendu via window text printer (= pas de sprite cursor
 *     animé, juste highlight palette par tile). Itéré via F tool diff.
 *   - Functional : input arrows + A/B/Start = navigation + select + back + confirm.
 *
 * État global : `sNamingScreen` exposé sur `globalThis` pour que les auto-callbacks
 * y accèdent (= file `@ts-nocheck`, lookup global scope).
 */
import { getRuntime } from './decomp-globals';
import {
  AddWindow, FillWindowPixelBuffer, PutWindowTilemap, CopyWindowToVram,
  InitBgsFromTemplates, ResetBgsAndClearDma3BusyFlags,
  FillBgTilemapBufferRect_Palette0, type WindowTemplate,
} from './gba-window-system';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import {
  ResetPaletteFade, FreeAllSpritePalettes, ResetTasks,
  LoadPalette, ShowBg, HideBg,
  PlaySE,
} from './decomp-globals';
import { gSaveBlock2Ptr } from './gba-menu-system';

// ─── Constants 1:1 décomp src/naming_screen.c ────────────────────────────────
const KBPAGE_LETTERS_LOWER = 0;
const KBPAGE_LETTERS_UPPER = 1;
const KBPAGE_SYMBOLS = 2;
const KBPAGE_COUNT = 3;

const KBROW_COUNT = 4;
const KBCOL_COUNT = 9;  // FR diff (= 9 vs EN 8)

const STATE_FADE_IN = 0;
const STATE_WAIT_FADE_IN = 1;
const STATE_HANDLE_INPUT = 2;
const STATE_MOVE_TO_OK_BUTTON = 3;
const STATE_START_PAGE_SWAP = 4;
const STATE_WAIT_PAGE_SWAP = 5;
const STATE_PRESSED_OK = 6;
const STATE_WAIT_SENT_TO_PC_MESSAGE = 7;
const STATE_FADE_OUT = 8;
const STATE_EXIT = 9;

const NAMING_SCREEN_PLAYER = 0;

// Window IDs in sNamingScreen.windows[] :
const WIN_KB_PAGE_1 = 0;
const WIN_KB_PAGE_2 = 1;
const WIN_TEXT_ENTRY = 2;
const WIN_TEXT_ENTRY_BOX = 3;
const WIN_BANNER = 4;

// 1:1 décomp src/naming_screen.c:281-300 — sKeyboardChars[3][4][9].
// FR : KBCOL_COUNT = 9. Caractères réels qui s'insèrent au A press.
// Notre version : utilise les espaces tels quels, à mapper vers le charmap GBA.
const sKeyboardChars: readonly string[][][] = [
  // KBPAGE_LETTERS_LOWER
  [
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', '.'],
    ['i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', ','],
    ['q', 'r', 's', 't', 'u', 'v', 'w', 'x', ' '],
    ['y', 'z', ' ', ' ', '-', ' ', ' ', ' ', ' '],
  ],
  // KBPAGE_LETTERS_UPPER
  [
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', '.'],
    ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', ','],
    ['Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', ' '],
    ['Y', 'Z', ' ', ' ', '-', ' ', ' ', ' ', ' '],
  ],
  // KBPAGE_SYMBOLS
  [
    ['0', '1', '2', '3', '4', ' ', ' ', ' ', ' '],
    ['5', '6', '7', '8', '9', ' ', ' ', ' ', ' '],
    ['!', '?', '♂', '♀', '/', ' ', ' ', ' ', ' '],
    ['…', '“', '”', '‘', "'", ' ', ' ', ' ', ' '],
  ],
] as const;

// 1:1 décomp src/naming_screen.c:302-306
const sPageColumnCounts: readonly number[] = [
  KBCOL_COUNT,  // KBPAGE_LETTERS_LOWER
  KBCOL_COUNT,  // KBPAGE_LETTERS_UPPER
  6,             // KBPAGE_SYMBOLS (6 cols actives)
];

// 1:1 décomp src/naming_screen.c:200-225 — sBgTemplates[4]
const sBgTemplates_NamingScreen: readonly WindowTemplate[] = [
  // BG0 priority 0 (= banner top)
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0,
    tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0 } as any,
  { bg: 1, charBaseIndex: 2, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0,
    tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0 } as any,
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0,
    tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0 } as any,
  { bg: 3, charBaseIndex: 3, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0,
    tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0 } as any,
];

// 1:1 décomp src/naming_screen.c:228-275 — sWindowTemplates[5]
const sWindowTemplates_NamingScreen: readonly WindowTemplate[] = [
  // WIN_KB_PAGE_1 (BG1)
  { bg: 1, tilemapLeft: 3, tilemapTop: 10, width: 19, height: 8, paletteNum: 10, baseBlock: 0x030 },
  // WIN_KB_PAGE_2 (BG2)
  { bg: 2, tilemapLeft: 3, tilemapTop: 10, width: 19, height: 8, paletteNum: 10, baseBlock: 0x0C8 },
  // WIN_TEXT_ENTRY (BG3)
  { bg: 3, tilemapLeft: 8, tilemapTop: 6, width: 17, height: 2, paletteNum: 10, baseBlock: 0x030 },
  // WIN_TEXT_ENTRY_BOX (BG3)
  { bg: 3, tilemapLeft: 8, tilemapTop: 4, width: 17, height: 2, paletteNum: 10, baseBlock: 0x052 },
  // WIN_BANNER (BG0)
  { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 30, height: 2, paletteNum: 11, baseBlock: 0x074 },
];

// ─── sNamingScreen state struct (1:1 décomp src/naming_screen.c:154-181) ─────

interface NamingScreenState {
  state: number;
  windows: number[];  // 5 window IDs
  inputCharBaseXPos: number;
  bg1vOffset: number;
  bg2vOffset: number;
  bg1Priority: number;
  bg2Priority: number;
  bgToReveal: number;
  bgToHide: number;
  currentPage: number;
  cursorSpriteId: number;
  swapBtnFrameSpriteId: number;
  template: { copyExistingString: number; maxChars: number; iconFunction: number; addGenderIcon: number; initialPage: number; title: string };
  templateNum: number;
  destBuffer: number[];  // pointer to player name buffer (= 7 chars)
  monSpecies: number;
  monGender: number;
  monPersonality: number;
  returnCallback: ((rt: unknown) => void) | null;
  // Runtime state for input :
  cursorRow: number;     // 0-3
  cursorCol: number;     // 0-8
  cursorOnOK: boolean;   // cursor at OK button (= STATE_MOVE_TO_OK_BUTTON)
  textBuffer: string[];  // current name (= up to maxChars chars)
  textPos: number;       // current cursor position in text
}

let sNamingScreen: NamingScreenState | null = null;

(globalThis as Record<string, unknown>).sNamingScreen = new Proxy({}, {
  get(_t, prop) {
    return sNamingScreen ? (sNamingScreen as any)[prop] : undefined;
  },
  set(_t, prop, value) {
    if (sNamingScreen) (sNamingScreen as any)[prop] = value;
    return true;
  },
});

// ─── Templates (= 1:1 décomp sNamingScreenTemplates) ─────────────────────────
//
// IMPORTANT : naming screen est UNIVERSEL — appelé pour player name + PC box
// names + pokémon nicknames + Walda passwords, etc. Reuse pour tous les contexts.
// 1:1 décomp src/naming_screen.c sNamingScreenTemplates[] définit 4+ templates
// avec differents maxChars / icones / titles. Ils partagent tous la mécanique
// keyboard (= sKeyboardChars + Task_NamingScreen state machine).
//
// TODO étendre pour :
//  - NAMING_SCREEN_BOX (templateNum=1) : maxChars=8, "Box X" (= rename PC box)
//  - NAMING_SCREEN_CAUGHT_MON / NICKNAME (templateNum=2) : maxChars=10, "<Pokemon>'S nickname?"
//  - NAMING_SCREEN_WALDA (templateNum=3) : maxChars=15, password Lilycove couple
//
// Pour chaque nouveau template : ajouter entrée + setup correct iconFunction
// (= sprite à gauche du nom, e.g. PC icon, Pokemon front pic, etc.) et title.

const sNamingScreenTemplates = [
  // NAMING_SCREEN_PLAYER (templateNum = 0) :
  {
    copyExistingString: 0,
    maxChars: 7,
    iconFunction: 0,  // = TitleScreen_PlayerIcon (= boy/girl avatar)
    addGenderIcon: 0,
    initialPage: KBPAGE_LETTERS_UPPER,
    title: 'VOTRE NOM?',
  },
  // TODO : NAMING_SCREEN_BOX/CAUGHT_MON/WALDA — ajouter quand nécessaire
];

// ─── DoNamingScreen API 1:1 décomp src/naming_screen.c:396-417 ───────────────

/**
 * 1:1 décomp `DoNamingScreen(templateNum, destBuffer, monSpecies, monGender, monPersonality, returnCallback)`.
 * Initialise sNamingScreen + setup CB2_LoadNamingScreen.
 */
export function DoNamingScreen(
  templateNum: number,
  destBuffer: number[],
  monSpecies: number,
  monGender: number,
  monPersonality: number,
  returnCallback: ((rt: unknown) => void) | null,
): void {
  const rt = getRuntime();
  if (!rt) return;

  const tpl = sNamingScreenTemplates[templateNum];
  if (!tpl) {
    console.warn(`[DoNamingScreen] templateNum ${templateNum} not found`);
    if (returnCallback) returnCallback(rt);
    return;
  }

  sNamingScreen = {
    state: STATE_FADE_IN,
    windows: [-1, -1, -1, -1, -1],
    inputCharBaseXPos: Math.floor((240 - tpl.maxChars * 8) / 2) + 6,
    bg1vOffset: 0,
    bg2vOffset: 0,
    bg1Priority: 1,
    bg2Priority: 2,
    bgToReveal: 0,
    bgToHide: 1,
    currentPage: tpl.initialPage,
    cursorSpriteId: -1,
    swapBtnFrameSpriteId: -1,
    template: tpl,
    templateNum,
    destBuffer,
    monSpecies,
    monGender,
    monPersonality,
    returnCallback,
    cursorRow: 0,
    cursorCol: 0,
    cursorOnOK: false,
    textBuffer: [],
    textPos: 0,
  };

  rt.gMain.state = 0;
  rt.SetMainCallback2(CB2_LoadNamingScreen);
}
(globalThis as Record<string, unknown>).DoNamingScreen = DoNamingScreen;

// ─── CB2_LoadNamingScreen 1:1 décomp src/naming_screen.c:419-464 ─────────────

function CB2_LoadNamingScreen(): void {
  const rt = getRuntime();
  if (!rt || !sNamingScreen) return;

  switch (rt.gMain.state) {
    case 0:
      // ResetVHBlank — no-op chez nous (= VBlank handled par engine)
      NamingScreen_Init();
      rt.gMain.state++;
      break;
    case 1:
      NamingScreen_InitBGs();
      rt.gMain.state++;
      break;
    case 2:
      ResetPaletteFade();
      rt.gMain.state++;
      break;
    case 3:
      rt.ResetSpriteData();
      FreeAllSpritePalettes();
      rt.gMain.state++;
      break;
    case 4:
      ResetTasks();
      rt.gMain.state++;
      break;
    case 5:
      LoadPalettes_NamingScreen();
      rt.gMain.state++;
      break;
    case 6:
      LoadGfx_NamingScreen();
      rt.gMain.state++;
      break;
    case 7:
      // CreateSprites — TODO Phase 3.2 (= cursor sprite, page swap, OK/Back, etc.)
      // Pour l'instant skip, juste use BG rendering
      rt.UpdatePaletteFade();
      NamingScreen_ShowBgs();
      rt.gMain.state++;
      break;
    default:
      // CreateHelperTasks + CreateNamingScreenTask
      rt.CreateTask((t) => Task_NamingScreen(t), 2);
      rt.SetMainCallback2(CB2_NamingScreen);
      break;
  }
}

// ─── NamingScreen_Init (= 1:1 décomp src/naming_screen.c:466-485) ────────────

function NamingScreen_Init(): void {
  if (!sNamingScreen) return;
  sNamingScreen.state = STATE_FADE_IN;
  sNamingScreen.bg1vOffset = 0;
  sNamingScreen.bg2vOffset = 0;
  sNamingScreen.currentPage = sNamingScreen.template.initialPage;
  sNamingScreen.inputCharBaseXPos = Math.floor((240 - sNamingScreen.template.maxChars * 8) / 2) + 6;
  // textBuffer initialized empty (or copy if copyExistingString)
  if (sNamingScreen.template.copyExistingString) {
    sNamingScreen.textBuffer = sNamingScreen.destBuffer.map((c) => String.fromCharCode(c));
    sNamingScreen.textPos = sNamingScreen.textBuffer.length;
  } else {
    sNamingScreen.textBuffer = [];
    sNamingScreen.textPos = 0;
  }
}

// ─── NamingScreen_InitBGs (= 1:1 décomp src/naming_screen.c:498-536) ─────────

function NamingScreen_InitBGs(): void {
  const rt = getRuntime();
  if (!rt || !sNamingScreen) return;

  // DmaClear VRAM/OAM/PLTT
  // (= notre engine reset via initialisation des modules — skip pour MVP)

  // Set DISPCNT mode 0
  rt.SetGpuReg(0x000, 0);  // REG_OFFSET_DISPCNT = 0

  ResetBgsAndClearDma3BusyFlags(0);
  InitBgsFromTemplates(0, sBgTemplates_NamingScreen as any, sBgTemplates_NamingScreen.length);

  // Init standard text box windows + gfx
  // (= utilise notre window system existant)

  // Add 5 windows
  for (let i = 0; i < 5; i++) {
    sNamingScreen.windows[i] = AddWindow(sWindowTemplates_NamingScreen[i]);
  }

  // DISPCNT : OBJ + BG0+1+2+3
  rt.SetGpuReg(0x000, 0x1F40);  // = 1:1 décomp DISPCNT_OBJ_1D_MAP | DISPCNT_OBJ_ON | BG0..3 ON
  rt.SetGpuReg(0x050, 0x0640);  // BLDCNT alpha blend BG1+BG2 target2
  rt.SetGpuReg(0x052, (12 << 0) | (8 << 8));  // BLDALPHA eva=12 evb=8
}

// ─── LoadPalettes (= 1:1 décomp src/naming_screen.c:LoadPalettes) ────────────

function LoadPalettes_NamingScreen(): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp loads :
  //   LoadPalette(gNamingScreenMenu_Pal, BG_PLTT_ID(0), PLTT_SIZE_4BPP * 3)  — banks 0,1,2
  //   LoadPalette(sKeyboard_Pal, BG_PLTT_ID(10), PLTT_SIZE_4BPP)             — bank 10
  //   LoadPalette(GetTextWindowPalette(2), BG_PLTT_ID(11), PLTT_SIZE_4BPP)   — bank 11
  //   LoadPalette(GetTextWindowPalette(0), BG_PLTT_ID(14), PLTT_SIZE_4BPP)   — bank 14
  // Pour MVP : load des palettes basiques (= text foreground/background).
  // F tool diff identifiera les vraies couleurs à load 1:1 décomp.

  // Bank 10 = keyboard text (= white/grey/black)
  const palBank10 = new Uint16Array([
    0x4631,  // 0: bg blue (= keyboard bg)
    0x7FFF,  // 1: white text
    0x0000,  // 2: black shadow
    0x6F7B,  // 3: light grey
    0x52B5,  // 4
    0x3173,  // 5
    0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
  ]);
  LoadPalette(palBank10, 10 * 16, 32);

  // Bank 11 = banner top (= "DEPL. OK RET.")
  const palBank11 = new Uint16Array([
    0x4631, 0x7FFF, 0x0000, 0x6F7B,
    0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000,
  ]);
  LoadPalette(palBank11, 11 * 16, 32);
}

// ─── LoadGfx (= 1:1 décomp src/naming_screen.c:LoadGfx) ──────────────────────

function LoadGfx_NamingScreen(): void {
  // 1:1 décomp loads :
  //   LZ77UnCompWram(gNamingScreenBg_Tilemap, naming_screen_buffer)  — BG3 background
  //   CopyToBgTilemapBuffer(3, ..., 0, 0)  — banner background
  //   LZ77UnCompVram(gNamingScreenBg_Gfx, BG_CHAR_ADDR(3))           — BG3 char data
  //   ...
  // Pour MVP : skip. Le rendu se fait via FillBgTilemapBufferRect_Palette0 + window text printer.
}

// ─── NamingScreen_ShowBgs ───────────────────────────────────────────────────

function NamingScreen_ShowBgs(): void {
  ShowBg(0);
  ShowBg(1);
  HideBg(2);  // Initially BG2 (= second keyboard page) hidden
  ShowBg(3);
}

// ─── CB2_NamingScreen 1:1 décomp src/naming_screen.c:2014 ────────────────────

function CB2_NamingScreen(): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.runTasks();
  // AnimateSprites + BuildOamBuffer ne sont pas critiques pour MVP fonctionnel.
  rt.UpdatePaletteFade();
}

// ─── Task_NamingScreen (= 1:1 décomp src/naming_screen.c:544) ────────────────

function Task_NamingScreen(_task: any): void {
  if (!sNamingScreen) return;
  switch (sNamingScreen.state) {
    case STATE_FADE_IN:
      MainState_FadeIn();
      break;
    case STATE_WAIT_FADE_IN:
      MainState_WaitFadeIn();
      break;
    case STATE_HANDLE_INPUT:
      MainState_HandleInput();
      break;
    case STATE_MOVE_TO_OK_BUTTON:
      MainState_MoveToOKButton();
      MainState_HandleInput();
      break;
    case STATE_PRESSED_OK:
      MainState_PressedOKButton();
      break;
    case STATE_FADE_OUT:
      MainState_FadeOut();
      break;
    case STATE_EXIT:
      MainState_Exit();
      break;
  }
}

// ─── MainState_* (= 1:1 décomp state machine) ────────────────────────────────

function MainState_FadeIn(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp ligne 814 : DrawBgTilemap(3, sNamingScreen->template->title)
  //                        + FillBgTilemapBufferRect for keyboard
  // Pour MVP : draw text via window printer.
  drawTitleAndBanner();
  drawKeyboard();
  drawTextEntry();

  rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, 'RGB_BLACK');
  sNamingScreen.state = STATE_WAIT_FADE_IN;
  // BGM optionnel : MUS_NAMING_SCREEN ou keep current
}

function MainState_WaitFadeIn(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  if (!rt.gPaletteFade.active) {
    sNamingScreen.state = STATE_HANDLE_INPUT;
  }
}

function MainState_HandleInput(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  const newKeys = rt.gMain.newKeys ?? 0;

  const A_BUTTON = 0x01;
  const B_BUTTON = 0x02;
  const SELECT_BUTTON = 0x04;
  const START_BUTTON = 0x08;
  const DPAD_RIGHT = 0x10;
  const DPAD_LEFT = 0x20;
  const DPAD_UP = 0x40;
  const DPAD_DOWN = 0x80;

  if (newKeys & A_BUTTON) {
    // Insert char at cursor pos (or OK press)
    if (sNamingScreen.cursorOnOK) {
      sNamingScreen.state = STATE_PRESSED_OK;
      PlaySE(5);  // SE_SELECT (= bonne route, slot SE pas BGM)
      return;
    }
    const ch = sKeyboardChars[sNamingScreen.currentPage][sNamingScreen.cursorRow][sNamingScreen.cursorCol];
    if (ch && ch !== ' ' && sNamingScreen.textPos < sNamingScreen.template.maxChars) {
      sNamingScreen.textBuffer[sNamingScreen.textPos] = ch;
      sNamingScreen.textPos++;
      drawTextEntry();
      PlaySE(5);  // SE_SELECT (= bonne route, slot SE pas BGM)
    }
  } else if (newKeys & B_BUTTON) {
    // Backspace
    if (sNamingScreen.textPos > 0) {
      sNamingScreen.textPos--;
      sNamingScreen.textBuffer[sNamingScreen.textPos] = '';
      drawTextEntry();
      PlaySE(5);
    }
  } else if (newKeys & START_BUTTON) {
    // OK shortcut
    sNamingScreen.state = STATE_PRESSED_OK;
    PlaySE(5);
  } else if (newKeys & SELECT_BUTTON) {
    // Page swap
    sNamingScreen.currentPage = (sNamingScreen.currentPage + 1) % KBPAGE_COUNT;
    drawKeyboard();
    PlaySE(5);
  } else if (newKeys & DPAD_UP) {
    if (sNamingScreen.cursorRow > 0) sNamingScreen.cursorRow--;
    drawKeyboard();
  } else if (newKeys & DPAD_DOWN) {
    if (sNamingScreen.cursorRow < KBROW_COUNT - 1) sNamingScreen.cursorRow++;
    drawKeyboard();
  } else if (newKeys & DPAD_LEFT) {
    if (sNamingScreen.cursorCol > 0) sNamingScreen.cursorCol--;
    drawKeyboard();
  } else if (newKeys & DPAD_RIGHT) {
    const colCount = sPageColumnCounts[sNamingScreen.currentPage];
    if (sNamingScreen.cursorCol < colCount - 1) sNamingScreen.cursorCol++;
    drawKeyboard();
  }
}

function MainState_MoveToOKButton(): void {
  if (!sNamingScreen) return;
  sNamingScreen.cursorOnOK = true;
}

function MainState_PressedOKButton(): void {
  if (!sNamingScreen) return;
  // Save the entered name to destBuffer
  const name = sNamingScreen.textBuffer.join('');
  if (name) {
    // Copy to destBuffer (= the gSaveBlock2Ptr.playerName buffer reference)
    // For player name, also update gSaveBlock2Ptr.playerName directly
    if (sNamingScreen.templateNum === NAMING_SCREEN_PLAYER) {
      gSaveBlock2Ptr.playerName = name.slice(0, 7);
    }
  }
  sNamingScreen.state = STATE_FADE_OUT;
}

function MainState_FadeOut(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 0, 16, 'RGB_BLACK');
  sNamingScreen.state = STATE_EXIT;
}

function MainState_Exit(): void {
  if (!sNamingScreen) return;
  const rt = getRuntime();
  if (!rt) return;
  if (!rt.gPaletteFade.active) {
    const cb = sNamingScreen.returnCallback;
    if (cb) {
      rt.SetMainCallback2(cb as any);
    }
    sNamingScreen = null;
  }
}

// ─── Drawing helpers (= MVP via window text printer) ─────────────────────────

function drawTitleAndBanner(): void {
  if (!sNamingScreen) return;
  // Banner top : "DEPL. OK RET." (= controls hint)
  const winBanner = sNamingScreen.windows[WIN_BANNER];
  if (winBanner >= 0) {
    FillWindowPixelBuffer(winBanner, 0xCC);  // light blue bg
    AddTextPrinterParameterized3(winBanner, 1, 4, 1, [12, 1, 2], 255, '+DEPL.  ⓞOK  Ⓑ RET.');
    PutWindowTilemap(winBanner);
    CopyWindowToVram(winBanner, 3);
  }
  // Title in TEXT_ENTRY_BOX : "VOTRE NOM?"
  const winTextBox = sNamingScreen.windows[WIN_TEXT_ENTRY_BOX];
  if (winTextBox >= 0) {
    FillWindowPixelBuffer(winTextBox, 0x11);  // white
    AddTextPrinterParameterized3(winTextBox, 1, 24, 0, [1, 2, 3], 255, sNamingScreen.template.title);
    PutWindowTilemap(winTextBox);
    CopyWindowToVram(winTextBox, 3);
  }
}

function drawKeyboard(): void {
  if (!sNamingScreen) return;
  const winKb = sNamingScreen.windows[WIN_KB_PAGE_1];
  if (winKb < 0) return;
  FillWindowPixelBuffer(winKb, 0x77);  // light blue keyboard bg
  // Render each char with cursor highlight
  const page = sKeyboardChars[sNamingScreen.currentPage];
  for (let row = 0; row < KBROW_COUNT; row++) {
    for (let col = 0; col < sPageColumnCounts[sNamingScreen.currentPage]; col++) {
      const ch = page[row][col];
      if (!ch || ch === ' ') continue;
      const x = col * 16 + 4;
      const y = row * 16 + 4;
      const isCursor = !sNamingScreen.cursorOnOK
        && sNamingScreen.cursorRow === row
        && sNamingScreen.cursorCol === col;
      const colors: [number, number, number] = isCursor ? [1, 4, 5] : [1, 2, 3];
      AddTextPrinterParameterized3(winKb, 1, x, y, colors, 255, ch);
    }
  }
  PutWindowTilemap(winKb);
  CopyWindowToVram(winKb, 3);
}

function drawTextEntry(): void {
  if (!sNamingScreen) return;
  const winText = sNamingScreen.windows[WIN_TEXT_ENTRY];
  if (winText < 0) return;
  FillWindowPixelBuffer(winText, 0x11);
  // Display name with underscores for empty positions
  const maxChars = sNamingScreen.template.maxChars;
  let display = '';
  for (let i = 0; i < maxChars; i++) {
    const c = sNamingScreen.textBuffer[i];
    display += (c && c !== ' ') ? c : '_';
    if (i < maxChars - 1) display += ' ';
  }
  AddTextPrinterParameterized3(winText, 1, 8, 1, [1, 2, 3], 255, display);
  PutWindowTilemap(winText);
  CopyWindowToVram(winText, 3);
}
