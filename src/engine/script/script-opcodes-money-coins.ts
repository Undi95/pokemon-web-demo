/**
 * script-opcodes-money-coins.ts — opcodes money / coins 1:1 décomp `money.c` + `coins.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` :
 *   `ScrCmd_addmoney`        (l. 1733-1741) : AddMoney(&money, amount) if !disable.
 *   `ScrCmd_removemoney`     (l. 1743-1751) : RemoveMoney(&money, amount).
 *   `ScrCmd_checkmoney`      (l. 1753-1761) : gSpecialVar_Result = (money >= amount).
 *   `ScrCmd_showmoneybox`    (l. 1763-1772) : DrawMoneyBox(money, x, y).
 *   `ScrCmd_hidemoneybox`    (l. 1774-1781) : HideMoneyBox().
 *   `ScrCmd_updatemoneybox`  (l. 1783-1792) : ChangeAmountInMoneyBox(money).
 *   `ScrCmd_showcoinsbox`    (l. 1794-1801) : ShowCoinsWindow(coins, x, y).
 *   `ScrCmd_hidecoinsbox`    (l. 1803-1810) : HideCoinsWindow().
 *   `ScrCmd_updatecoinsbox`  (l. 1812-1819) : PrintCoinsString(coins).
 *   `ScrCmd_checkcoins`      (l. 2129-2134) : *var = coins.
 *   `ScrCmd_addcoins`        (l. 2136-2145) : GiveCoins(amount).
 *   `ScrCmd_removecoins`     (l. 2147-2156) : gSpecialVar_Result = !RemoveCoins(amount).
 *
 * Et les macros user-level :
 *   `givecoins` (= addcoins), `givemoney` (= addmoney), `takemoney`/`takecoins`.
 */

import { registerOpcode, getOpcodeHandler } from './script-runtime';
import { VarGet, VarSet } from './script-vars';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { parseValue } from './script-opcodes-helpers';
import { GetCoins, AddCoins, RemoveCoins } from '../ui/coins';

/** Alias non-canonique « givecoins » (la macro canonique = `addcoins`, cf. plus
 *  bas). Délègue à `AddCoins` 1:1 (coins.c) = même résultat que l'ancien
 *  `Math.min(MAX_COINS, …)`, sans toucher VAR_RESULT (contrat « give »). */
registerOpcode('givecoins', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  AddCoins(amount);
  return false;
});

/** 1:1 décomp macro `givemoney value` (event.inc) : AddMoney(&money, value). */
registerOpcode('givemoney', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  if (gSaveBlock1Ptr) {
    gSaveBlock1Ptr.money = Math.min(999999, (gSaveBlock1Ptr.money ?? 0) + amount);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_addmoney` (scrcmd.c:1733-1741) :
 *    amount = ScriptReadWord ; disable = ScriptReadByte ;
 *    if (!disable) AddMoney(&money, amount);
 *  AddMoney cap MAX_MONEY=999999 (= 1:1 décomp money.c). */
registerOpcode('addmoney', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  const ignore = VarGet(args[1] ?? '0');
  if (!ignore) {
    if (gSaveBlock1Ptr) gSaveBlock1Ptr.money = Math.min(999999, (gSaveBlock1Ptr.money ?? 0) + amount);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_takemoney` (scrcmd.c:1743-1751) :
 *    RemoveMoney(&money, amount).  // sub from money, floor 0. */
registerOpcode('takemoney', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  if (gSaveBlock1Ptr) {
    gSaveBlock1Ptr.money = Math.max(0, (gSaveBlock1Ptr.money ?? 0) - amount);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_checkmoney` (scrcmd.c:1753-1761) :
 *    gSpecialVar_Result = IsEnoughMoney(&money, amount). */
registerOpcode('checkmoney', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  const has = (gSaveBlock1Ptr?.money ?? 0) >= amount;
  VarSet('VAR_RESULT', has ? 1 : 0);
  return false;
});

/** 1:1 décomp `ScrCmd_checkcoins` (scrcmd.c:2129-2134) :
 *    u16 *ptr = GetVarPointer(ScriptReadHalfword(ctx)); *ptr = GetCoins();
 *  Le résultat va dans la VAR passée en arg, pas VAR_RESULT. */
registerOpcode('checkcoins', (_ctx, args) => {
  const coins = GetCoins();
  const dst = args[0] ?? 'VAR_RESULT';
  if (dst.startsWith('VAR_')) VarSet(dst, coins);
  else VarSet('VAR_RESULT', coins);
  return false;
});

/** 1:1 décomp `ScrCmd_takecoins` (scrcmd.c) :
 *    SubtractCoins(VarGet(amount));  // gSaveBlock1Ptr.coins -= amount, floor 0. */
registerOpcode('takecoins', (_ctx, args) => {
  const amount = VarGet(args[0] ?? '0');
  if (gSaveBlock1Ptr) gSaveBlock1Ptr.coins = Math.max(0, (gSaveBlock1Ptr.coins ?? 0) - amount);
  return false;
});

/** 1:1 décomp `ScrCmd_addcoins` (scrcmd.c:2136-2145) :
 *    u16 coins = VarGet(ScriptReadHalfword(ctx));
 *    if (AddCoins(coins) == TRUE) gSpecialVar_Result = FALSE;
 *    else                          gSpecialVar_Result = TRUE;
 *  (= VAR_RESULT = !succès ; le cap MAX_COINS + le retour bool sont dans
 *  `AddCoins` 1:1, coins.c:57-77). */
registerOpcode('addcoins', (_ctx, args) => {
  const count = VarGet(args[0] ?? '0');
  VarSet('VAR_RESULT', AddCoins(count) ? 0 : 1);
  return false;
});

/** 1:1 décomp `ScrCmd_removemoney` (scrcmd.c:1743) : alias de takemoney. */
registerOpcode('removemoney', (ctx, args) => {
  return getOpcodeHandler('takemoney')?.(ctx, args) ?? false;
});

/** 1:1 décomp `ScrCmd_removecoins` (scrcmd.c:2147-2156) :
 *    u16 coins = VarGet(ScriptReadHalfword(ctx));
 *    if (RemoveCoins(coins) == TRUE) gSpecialVar_Result = FALSE;
 *    else                             gSpecialVar_Result = TRUE;
 *  (= VAR_RESULT = TRUE si remove a échoué, FALSE si succès). */
registerOpcode('removecoins', (_ctx, args) => {
  const count = VarGet(args[0] ?? '0');
  VarSet('VAR_RESULT', RemoveCoins(count) ? 0 : 1);
  return false;
});

// ─── Money/Coins box UI ─────────────────────────────────────────────────────

/** 1:1 décomp `ScrCmd_showmoneybox` (scrcmd.c:1763-1772) :
 *    if (!ignore) DrawMoneyBox(GetMoney(&money), x, y). */
registerOpcode('showmoneybox', (_ctx, args) => {
  const x = parseValue(args[0] ?? '0');
  const y = parseValue(args[1] ?? '0');
  const ignore = parseValue(args[2] ?? '0');
  if (ignore) return false;
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { DrawMoneyBox?: (amt: number, x: number, y: number) => void; _getMoney?: () => number } }).__moneyBoxUI;
    if (ui?.DrawMoneyBox && ui._getMoney) ui.DrawMoneyBox(ui._getMoney(), x, y);
  })();
  return false;
});

/** 1:1 décomp `ScrCmd_hidemoneybox` (scrcmd.c:1774-1781) :
 *    HideMoneyBox(). */
registerOpcode('hidemoneybox', (_ctx, _args) => {
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { HideMoneyBox?: () => void } }).__moneyBoxUI;
    ui?.HideMoneyBox?.();
  })();
  return false;
});

/** 1:1 décomp `ScrCmd_updatemoneybox` (scrcmd.c:1783-1792) :
 *    if (!ignore) ChangeAmountInMoneyBox(GetMoney(&money)). */
registerOpcode('updatemoneybox', (_ctx, args) => {
  const _x = parseValue(args[0] ?? '0');
  const _y = parseValue(args[1] ?? '0');
  const ignore = parseValue(args[2] ?? '0');
  void _x; void _y;
  if (ignore) return false;
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { ChangeAmountInMoneyBox?: (amt: number) => void; _getMoney?: () => number } }).__moneyBoxUI;
    if (ui?.ChangeAmountInMoneyBox && ui._getMoney) ui.ChangeAmountInMoneyBox(ui._getMoney());
  })();
  return false;
});

/** 1:1 décomp `ScrCmd_showcoinsbox` (scrcmd.c:1794-1801) :
 *    ShowCoinsWindow(GetCoins(), x, y). */
registerOpcode('showcoinsbox', (_ctx, args) => {
  const x = parseValue(args[0] ?? '0');
  const y = parseValue(args[1] ?? '0');
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { ShowCoinsWindow?: (amt: number, x: number, y: number) => void; _getCoins?: () => number } }).__moneyBoxUI;
    if (ui?.ShowCoinsWindow && ui._getCoins) ui.ShowCoinsWindow(ui._getCoins(), x, y);
  })();
  return false;
});

/** 1:1 décomp `ScrCmd_hidecoinsbox` (scrcmd.c:1803-1810) :
 *    HideCoinsWindow(). */
registerOpcode('hidecoinsbox', (_ctx, _args) => {
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { HideCoinsWindow?: () => void } }).__moneyBoxUI;
    ui?.HideCoinsWindow?.();
  })();
  return false;
});

/** 1:1 décomp `ScrCmd_updatecoinsbox` (scrcmd.c:1812-1819) :
 *    PrintCoinsString(GetCoins()). */
registerOpcode('updatecoinsbox', (_ctx, _args) => {
  void (async () => {
    const ui = (globalThis as { __moneyBoxUI?: { PrintCoinsString?: (amt: number) => void; _getCoins?: () => number } }).__moneyBoxUI;
    if (ui?.PrintCoinsString && ui._getCoins) ui.PrintCoinsString(ui._getCoins());
  })();
  return false;
});
