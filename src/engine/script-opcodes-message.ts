/**
 * script-opcodes-message.ts — opcodes message/msgbox/braille 1:1 décomp
 * `field_message_box.c` + `data/scripts/std_msgbox.inc`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` :
 *   `ScrCmd_message`           (l. 1265-1273) : ShowFieldMessage(text).
 *   `ScrCmd_pokenavcall`       (l. 1275-1283) : ShowPokenavFieldMessage(text).
 *   `ScrCmd_messageautoscroll` (l. 1285-1296) : ShowFieldAutoScrollMessage.
 *   `ScrCmd_messageinstant`    (l. 1298-1308) : ShowFieldMessage non-typewriter.
 *   `ScrCmd_waitmessage`       (l. 1310-1314) : SetupNativeScript(IsFieldMessageBoxHidden).
 *   `ScrCmd_closemessage`      (l. 1316-1329) : HideFieldMessageBox.
 *   `ScrCmd_waitbuttonpress`   (l. 1331-1335) : SetupNativeScript(WaitForAorBPress).
 *   `ScrCmd_braillemessage`    (l. 1481-1533) : LoadAndPrintBrailleMessage.
 *   `ScrCmd_closebraillemessage` (l. 1535-1539) : CloseBrailleWindow.
 *   `ScrCmd_vmessage`          (l. 1541-1547) : alias message + multi-lang.
 *
 * `msgbox` est une COMPOSITE macro `data/scripts/std_msgbox.inc` qui dispatch
 * selon MSGBOX_TYPE (NPC/SIGN/DEFAULT/YESNO/AUTOCLOSE). Notre version : state
 * machine inline via SetupNativeScript (= équivalent fonctionnel des std scripts).
 *
 * `spawnYesNoMenu` importé depuis `./script-opcodes-menu` pour MSGBOX_YESNO.
 */

import { registerOpcode, getOpcodeHandler, SetupNativeScript, getText } from './script-runtime';
import { gSpecialVar } from './script-vars';
import { ShowFieldMessage, IsFieldMessageBoxHidden, HideFieldMessageBox } from './field-message-box';
import { gObjectEvents, FreezeObjectEvent, UnfreezeObjectEvent } from './object-events';
import { GetPlayerFacingDirection, DIR_SOUTH } from './player-avatar';
import {
  Menu_ProcessInputNoWrapClearOnChoose, GetYesNoWindowId,
} from './gba-menu-system';
import { ClearStdWindowAndFrame, RemoveWindow } from './gba-window-system';
import { getSelectedNpc, isAOrBNewlyPressed, OPPOSITE_DIR } from './script-opcodes-helpers';
import { spawnYesNoMenu } from './script-opcodes-menu';

// ─── Message ─────────────────────────────────────────────────────────────────

registerOpcode('message', (_ctx, args) => {
  // 1:1 décomp ScrCmd_message (scrcmd.c:1265-1273) : ShowFieldMessage(text).
  const label = args[0];
  const rawText = getText(label);
  if (!rawText) {
    console.warn(`[opcode message] text '${label}' not found`);
    return false;
  }
  ShowFieldMessage(rawText);
  return false;
});

registerOpcode('waitmessage', (ctx) => {
  // 1:1 décomp ScrCmd_waitmessage (scrcmd.c:1310-1314) :
  //   SetupNativeScript IsFieldMessageBoxHidden.
  SetupNativeScript(ctx, IsFieldMessageBoxHidden);
  return true;
});

registerOpcode('waitbuttonpress', (ctx) => {
  // 1:1 décomp ScrCmd_waitbuttonpress (scrcmd.c:1331-1335) :
  //   SetupNativeScript WaitForAorBPress.
  SetupNativeScript(ctx, isAOrBNewlyPressed);
  return true;
});

registerOpcode('closemessage', (_ctx) => {
  HideFieldMessageBox();
  return false;
});

/** msgbox = composite macro : équivalent à `loadword 0, text` + `callstd N`.
 *  Notre version : run la sequence complète inline (= équivalent fonctionnel
 *  des std scripts MSGBOX_NPC, MSGBOX_DEFAULT, MSGBOX_SIGN, MSGBOX_YESNO).
 *
 *  MSGBOX_NPC      = 2 → lock + faceplayer + message + waitmessage + waitbuttonpress + release
 *  MSGBOX_SIGN     = 3 → lockall + message + waitmessage + waitbuttonpress + releaseall
 *  MSGBOX_DEFAULT  = 4 → idem MSGBOX_NPC (= avec ou sans faceplayer selon variantes)
 *  MSGBOX_YESNO    = 5 → message + waitmessage + spawn yesnobox + wait selection
 *  MSGBOX_AUTOCLOSE= 6 → message + waitmessage + waitbuttonpress + closemessage
 *
 *  Implémenté via SetupNativeScript : state machine polling chaque frame. */
registerOpcode('msgbox', (ctx, args) => {
  const textLabel = args[0];
  const type = args[1] ?? 'MSGBOX_DEFAULT';
  // 1:1 décomp : le linker GBA garantit le label existe au compile time, donc le
  // décomp ne gère pas ce cas. Notre runtime fetch async les textes depuis JSON,
  // un label peut être absent si extract-scripts.mjs ne l'a pas récolté ou si la
  // map JSON est mal chargée. On affiche `[MISSING:label]` à l'écran avec le
  // flow msgbox normal → debug visible + halt jusqu'à A press.
  const lookupText = getText(textLabel);
  if (!lookupText) {
    console.error(`[opcode msgbox] text '${textLabel}' not found — showing [MISSING] placeholder`);
  }
  const rawText = lookupText ?? `[MISSING:${textLabel}]`;

  // 1:1 décomp `data/scripts/std_msgbox.inc` semantics :
  //   MSGBOX_NPC      → lock + faceplayer + message + waitbuttonpress + release
  //   MSGBOX_SIGN     → lockall + message + waitbuttonpress + releaseall
  //   MSGBOX_DEFAULT  → message + waitbuttonpress + return (NO lock, NO facing)
  //   MSGBOX_AUTOCLOSE→ message + waitbuttonpress + closemessage
  //   MSGBOX_YESNO    → message + yesnobox
  const isSign = type === 'MSGBOX_SIGN';
  const isNpc = type === 'MSGBOX_NPC';
  const isYesNo = type === 'MSGBOX_YESNO';
  const isAutoclose = type === 'MSGBOX_AUTOCLOSE';

  let state = 0;

  const tick = (): boolean => {
    switch (state) {
      case 0: {
        // Lock + face NPC selon msgbox type.
        if (isSign) {
          // 1:1 STRICT décomp Std_MsgboxSign : lockall (= FreezeObjectEvents).
          // FreezeObjectEvent set frozen + pause sprite.animPaused (= sinon
          // anim continue à cycler face/walk visuellement malgré frozen).
          for (const n of gObjectEvents) if (n.active) FreezeObjectEvent(n);
        } else if (isNpc) {
          // 1:1 décomp Std_MsgboxNPC : lock (= freeze TOUS sauf player+selected)
          // + faceplayer (= selected NPC tourne vers player).
          const selected = getSelectedNpc();
          for (const n of gObjectEvents) {
            if (n.active && n !== selected) FreezeObjectEvent(n);
          }
          if (selected) {
            FreezeObjectEvent(selected);
            selected.facingDirection = OPPOSITE_DIR[GetPlayerFacingDirection()] ?? DIR_SOUTH;
          }
        }
        // MSGBOX_DEFAULT / MSGBOX_AUTOCLOSE / MSGBOX_YESNO : pas de lock/face.
        ShowFieldMessage(rawText);
        state = 1;
        return false;
      }
      case 1: {
        // Wait for message done.
        if (IsFieldMessageBoxHidden()) {
          state = isYesNo ? 3 : 2;  // YesNo : skip waitbuttonpress, spawn menu directement.
        }
        return false;
      }
      case 2: {
        // Wait for A/B button press. 1:1 décomp `TextPrinterWait` (text.c:884)
        // qui PlaySE(SE_SELECT) sur A/B press → match comportement ROM.
        if (isAOrBNewlyPressed()) {
          // SE_SELECT = 5 (= 1:1 décomp constants/songs.h).
          void import('./decomp-globals').then(({ PlaySE }) => PlaySE(5));
          HideFieldMessageBox();
          // Release frozen NPCs 1:1 STRICT via UnfreezeObjectEvent qui restore
          // sprite.animPaused = backup (= reverse du FreezeObjectEvent).
          if (isSign) {
            for (const n of gObjectEvents) if (n.active) UnfreezeObjectEvent(n);
          } else if (isNpc) {
            for (const n of gObjectEvents) if (n.active) UnfreezeObjectEvent(n);
          }
          void isAutoclose;  // future: AUTOCLOSE pourrait avoir comportement différent
          return true;  // resume bytecode
        }
        return false;
      }
      case 3: {
        // MSGBOX_YESNO : spawn YesNo menu (= 1:1 décomp std_msgbox_yesno script
        // qui call yesnobox + waitstate). Position 1:1 décomp menu.c:98-107
        // sYesNo_WindowTemplates : tilemapLeft=21, tilemapTop=9.
        spawnYesNoMenu(21, 9);
        state = 4;
        return false;
      }
      case 4: {
        // Wait yesnobox selection. Menu_ProcessInputNoWrapClearOnChoose returns
        // cursor pos (0=OUI top, 1=NON bottom), -1 (B pressed), -2 (no choice).
        // 1:1 décomp `script_menu.c:Task_HandleYesNoInput` :
        //   case 0 (OUI top)     → gSpecialVar_Result = 1 (= YES enum)
        //   case 1 / B_PRESSED  → gSpecialVar_Result = 0 (= NO enum)
        // event.inc:1932-1933 confirme : `YES = 1, NO = 0`.
        const result = Menu_ProcessInputNoWrapClearOnChoose();
        if (result === -2) return false;
        const yesNoResult = result === 0 ? 1 : 0;
        gSpecialVar.Result = yesNoResult;
        // Cleanup yesno window.
        const wid = GetYesNoWindowId();
        if (wid >= 0) {
          ClearStdWindowAndFrame(wid, true);
          RemoveWindow(wid);
        }
        // Release dialog + NPC 1:1 STRICT via UnfreezeObjectEvent (= restore
        // sprite.animPaused = backup, sinon anim stuck pause).
        HideFieldMessageBox();
        const npc = getSelectedNpc();
        if (npc) UnfreezeObjectEvent(npc);
        return true;
      }
    }
    return true;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

// ─── Aliases v* (= multi-lang) ──────────────────────────────────────────────

// 1:1 décomp `ScrCmd_vmessage / vmsgbox` (scrcmd.c) :
// Versions "v" prennent un VAR_X qui contient une string offset (= multi-language
// dynamic). Notre runtime est FR-only → traite comme alias des versions normales.
registerOpcode('vmessage', (ctx, args) => getOpcodeHandler('message')?.(ctx, args) ?? false);
registerOpcode('vmsgbox', (ctx, args) => getOpcodeHandler('msgbox')?.(ctx, args) ?? false);

// 1:1 décomp `ScrCmd_messageinstant` (scrcmd.c) : msgbox sans typewriter effect
// (= text appears all at once instead of char-by-char). Dette R3 doc : substrat
// msgbox actuel n'expose pas le flag "instant" → alias message (= typewriter
// effect quand-même). Pas critique gameplay (= seulement cosmétique typewriter
// speed).
registerOpcode('messageinstant', (ctx, args) => getOpcodeHandler('message')?.(ctx, args) ?? false);

// 1:1 décomp `ScrCmd_pokenavcall` (scrcmd.c:1275-1283) — initiates a PokéNav call.
//   2x usage in early-game (= Birch wakes you for ChooseStarter).
//   Dette R3 doc : ShowPokenavFieldMessage demande PokeNav UI subsystem entier
//   non porté (= avatar caller + frame + voice icon). Log + skip honnête.
registerOpcode('pokenavcall', (_ctx, args) => {
  console.log(`[opcode pokenavcall] '${args[0]}' — dette R3 (cascade PokeNav UI U-tier)`);
  return false;
});

// 1:1 décomp `ScrCmd_messageautoscroll` (scrcmd.c:1285-1296) — message that
// auto-scrolls. Dette R3 doc : demande msgbox + auto-advance timer (= sans
// A-press, frame counter cycle).
registerOpcode('messageautoscroll', (_ctx, args) => {
  console.log(`[opcode messageautoscroll] '${args[0]}' — dette R3 (cascade autoscroll timer U-tier)`);
  return false;
});

// ─── Braille ─────────────────────────────────────────────────────────────────

/** 1:1 décomp `ScrCmd_braillemsgbox` (= macro user-level event.inc) :
 *    affiche un message en braille font. 48x usage (Sealed Chamber, Regis caves).
 *  Dette R3 doc : braille font (= graphics/fonts/braille_font.4bpp) pas extrait
 *  côté assets ; demande font glyph rendering custom. Non critique démo Littleroot. */
registerOpcode('braillemsgbox', (_ctx, args) => {
  console.log(`[opcode braillemsgbox] '${args[0]}' — dette R3 (cascade braille font assets U-tier)`);
  return false;
});

/** 1:1 décomp `ScrCmd_braillemessage` (scrcmd.c:1481-1533) :
 *    LoadAndPrintBrailleMessage(text). Affiche un message en braille
 *    dans une fenêtre dimensionnée auto. */
registerOpcode('braillemessage', (_ctx, _args) => false);

/** 1:1 décomp `brailleformat` (event.inc:1024) — DATA marker dans le braille
 *  text payload (= 6 bytes data avant le texte braille). No-op safe. */
registerOpcode('brailleformat', (_ctx, _args) => false);

/** 1:1 décomp `ScrCmd_closebraillemessage` (scrcmd.c:1535-1539) :
 *    CloseBrailleWindow(). */
registerOpcode('closebraillemessage', (_ctx, _args) => false);
