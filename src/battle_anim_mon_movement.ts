/**
 * battle_anim_mon_movement.ts — miroir PARTIEL de `src/battle_anim_mon_movement.c`
 * (décomp pokeemeraude) : les AnimTask/templates de MOUVEMENT des battlers
 * consommés par les scripts d'anim de move (goal T4 2026-06-10).
 *
 * Porté 1:1 :
 *   - AnimTask_ShakeMon (:92) + AnimTask_ShakeMon_Step (:113) — Tackle & co.
 *   - AnimTask_ShakeMon2 (:156) + AnimTask_ShakeMon2_Step (:218) — Growl & co.
 *   - gHorizontalLungeSpriteTemplate (:30) + DoHorizontalLunge (:262) +
 *     ReverseHorizontalLungeDirection (:278) — sprite CONTRÔLEUR invisible
 *     (tileTag 0) qui déplace l'ATTAQUANT via TranslateSpriteLinearById.
 *
 * Dettes explicites : les autres tasks/templates du fichier (VerticalDip,
 *   SlideMonToOriginalPos/Offset, WindUpLunge, Sway, ScaleMonAndRestore,
 *   RotateMonSpriteToSide, ShakeTargetBasedOnMovePowerOrDmg, SlideOffScreen)
 *   — portage par vagues avec les moves qui les consomment.
 */
import { Sin, Cos } from './trig';
import { PrepareBattlerSpriteForRotScale, SetSpriteRotScale, ResetSpriteRotScale, GetBattlerAtPosition } from './battle_anim_mons';
import {
  registerAnimTasks, registerAnimTemplates,
} from './engine/battle/battle-anim-registry';
// ANTI-CYCLE ESM (TDZ pokeball/ST_OAM_AFFINE_DOUBLE) : acces LAZY a
// l'interpreteur via sa surface __battleAnimInterpreter — AUCUN import statique.
type AnimItf = {
  getArgs: () => number[]; getAttacker: () => number; getTarget: () => number;
  DestroyAnimVisualTask: (id: number) => void; DestroyAnimSprite: (s: unknown) => void;
};
function _itf(): AnimItf | undefined {
  return (globalThis as Record<string, unknown>).__battleAnimInterpreter as AnimItf | undefined;
}
function _args(): number[] { return _itf()?.getArgs() ?? [0, 0, 0, 0, 0, 0, 0, 0]; }
function _atk(): number { return _itf()?.getAttacker() ?? 0; }
function DestroyAnimVisualTask(id: number): void { _itf()?.DestroyAnimVisualTask(id); }
function DestroyAnimSprite(s: unknown): void { _itf()?.DestroyAnimSprite(s); }
function getRuntime(): unknown { return (globalThis as Record<string, unknown>).__rt; }
// GetBattlerSide : lazy via surface (battler & 1 = side, 1:1 GBA).
function GetBattlerSide(battler: number): number { return battler & 1; }

type AnimSprite = {
  data: number[]; x: number; y: number; x2: number; y2: number; invisible?: boolean;
  callback: ((s: AnimSprite) => void) | null;
  _storedCb6?: ((s: AnimSprite) => void) | null;
};
type AnimTask = { taskId: number; data: number[]; func?: (t: AnimTask) => void };

function _sprites(): Array<AnimSprite | undefined> | undefined {
  return (getRuntime() as unknown as { gSprites?: Array<AnimSprite | undefined> })?.gSprites;
}
/** Sprite id d'un battler — meme resolution que battle_anim_throw (validee
 *  capture) : __battleControllerOpponent.getBattlerMonSpriteId. */
function _battlerSpriteId(battler: number): number {
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as {
    getBattlerMonSpriteId?: (b: number) => number;
  } | undefined;
  const id = co?.getBattlerMonSpriteId?.(battler);
  return (id === undefined || id === null || id < 0) ? 0xFF : id;
}

/** 1:1-net `IsBattlerSpriteVisible(battler)` (battle_anim.c:649) : sprite du
 *  battler présent (enregistré) et pas invisible. Single : le partenaire (2/3)
 *  n'a pas de sprite → false ; double : présent et visible → true. */
function _IsBattlerSpriteVisible(battler: number): boolean {
  const sid = _battlerSpriteId(battler);
  if (sid === 0xFF) return false;
  const sp = _sprites()?.[sid] as { invisible?: boolean; inUse?: boolean } | undefined;
  return !!sp && sp.inUse !== false && !sp.invisible;
}

/** 1:1 `GetAnimBattlerSpriteId(animBattler)` (battle_anim_mons.c:373) —
 *  ANIM_ATTACKER=0 / ANIM_TARGET=1 ; ANIM_ATK_PARTNER=2 / ANIM_DEF_PARTNER=3
 *  résolvent le PARTENAIRE (BATTLE_PARTNER = ^2) s'il est visible (:401-414). */
function GetAnimBattlerSpriteId(animBattler: number): number {
  const atk = _atk();
  const tgt = _itf()?.getTarget() ?? 1;
  if (animBattler === 0) return _battlerSpriteId(atk);
  if (animBattler === 1) return _battlerSpriteId(tgt);
  if (animBattler === 2 /* ANIM_ATK_PARTNER */)
    return _IsBattlerSpriteVisible(atk ^ 2) ? _battlerSpriteId(atk ^ 2) : 0xFF;
  return _IsBattlerSpriteVisible(tgt ^ 2) ? _battlerSpriteId(tgt ^ 2) : 0xFF; // ANIM_DEF_PARTNER
}

// ─── StoreSpriteCallbackInData6 / SetCallbackToStoredInData6 (battle_anim_mons.c) ──
// Plateforme : le ptr C 16+16 bits → champ direct _storedCb6 (même net-effect).
function StoreSpriteCallbackInData6(sprite: AnimSprite, callback: (s: AnimSprite) => void): void {
  sprite._storedCb6 = callback;
}
function SetCallbackToStoredInData6(sprite: AnimSprite): void {
  sprite.callback = sprite._storedCb6 ?? null;
}

/** 1:1 `TranslateSpriteLinearById` (battle_anim_mons.c) : déplace le sprite
 *  d'id data[3] de (data[1], data[2]) pendant data[0] frames. */
function TranslateSpriteLinearById(sprite: AnimSprite): void {
  if (sprite.data[0] > 0) {
    sprite.data[0]--;
    const target = _sprites()?.[sprite.data[3]];
    if (target) {
      target.x2 += sprite.data[1];
      target.y2 += sprite.data[2];
    }
  } else {
    SetCallbackToStoredInData6(sprite);
  }
}

// ─── AnimTask_ShakeMon (battle_anim_mon_movement.c:92) ─────────────────────
// arg0: anim battler · arg1/2: x/y offset · arg3: num shakes · arg4: delay.
function AnimTask_ShakeMon(task: AnimTask): void {
  const spriteId = GetAnimBattlerSpriteId(_args()[0]);
  if (spriteId === 0xFF) {
    DestroyAnimVisualTask(task.taskId);
    return;
  }
  const sp = _sprites()?.[spriteId];
  if (!sp) { DestroyAnimVisualTask(task.taskId); return; }
  // GARDE-FOU opérandes désalignées (sweep 2026-06-11 : numShakes=-1347/-3372,
  // delay=4172 sur Ice Beam & co — la dette bytecode QUICK_ATTACK généralisée,
  // 15 moves rouges) : données corrompues → skip le shake, l'anim continue.
  // RACINE À AUDITER : l'encodage s16 des opérandes createvisualtask.
  if ((_args()[3] | 0) <= 0 || (_args()[3] | 0) > 1000 || (_args()[4] | 0) < 0 || (_args()[4] | 0) > 240) {
    console.warn('[anim] ShakeMon args corrompus (bytecode) :', _args().slice(0, 5).join(','), '— skip');
    DestroyAnimVisualTask(task.taskId);
    return;
  }
  sp.x2 = _args()[1];
  sp.y2 = _args()[2];
  task.data[0] = spriteId;
  task.data[1] = _args()[3];
  task.data[2] = _args()[4];
  task.data[3] = _args()[4];
  task.data[4] = _args()[1];
  task.data[5] = _args()[2];
  task.func = AnimTask_ShakeMon_Step;
  task.func(task);
}
function AnimTask_ShakeMon_Step(task: AnimTask): void {
  const sp = _sprites()?.[task.data[0]];
  if (!sp) { DestroyAnimVisualTask(task.taskId); return; }
  // Garde-fou (2026-06-11) : numShakes aberrant = args pollues par un script
  // aux operandes desalignees (vu : QUICK_ATTACK data[1]=-1031 -> --x===0
  // jamais vrai -> soft-lock waitforvisualfinish). Le decomp ne peut pas
  // produire numShakes<=0 ; nous si (deraillement) -> terminaison propre.
  if (task.data[1] <= 0 || task.data[1] > 1000) {
    sp.x2 = 0; sp.y2 = 0;
    DestroyAnimVisualTask(task.taskId);
    return;
  }
  if (task.data[3] === 0) {
    sp.x2 = (sp.x2 === 0) ? task.data[4] : 0;
    sp.y2 = (sp.y2 === 0) ? task.data[5] : 0;
    task.data[3] = task.data[2];
    if (--task.data[1] <= 0) {
      sp.x2 = 0;
      sp.y2 = 0;
      DestroyAnimVisualTask(task.taskId);
      return;
    }
  } else {
    task.data[3]--;
  }
}

// ─── AnimTask_ShakeMon2 (:156) — alterne +/- les offsets ───────────────────
function AnimTask_ShakeMon2(task: AnimTask): void {
  let spriteId: number;
  let abort = false;
  if (_args()[0] < 4 /* MAX_BATTLERS_COUNT */) {
    spriteId = GetAnimBattlerSpriteId(_args()[0]);
    if (spriteId === 0xFF) { DestroyAnimVisualTask(task.taskId); return; }
  } else if (_args()[0] !== 8 /* ANIM_ATTACKER_FORCE */) {
    // 1:1 :171-193 — position fixe (ANIM_PLAYER_LEFT..OPPONENT_RIGHT), abort si
    // le battler à cette position n'est pas visible.
    let battler: number;
    switch (_args()[0]) {
      case 4 /* ANIM_PLAYER_LEFT   */: battler = GetBattlerAtPosition(0 /* B_POSITION_PLAYER_LEFT   */); break;
      case 5 /* ANIM_PLAYER_RIGHT  */: battler = GetBattlerAtPosition(2 /* B_POSITION_PLAYER_RIGHT  */); break;
      case 6 /* ANIM_OPPONENT_LEFT */: battler = GetBattlerAtPosition(1 /* B_POSITION_OPPONENT_LEFT */); break;
      case 7 /* ANIM_OPPONENT_RIGHT*/:
      default:                         battler = GetBattlerAtPosition(3 /* B_POSITION_OPPONENT_RIGHT*/); break;
    }
    if (!_IsBattlerSpriteVisible(battler)) abort = true;
    spriteId = _battlerSpriteId(battler);
  } else {
    // ANIM_ATTACKER_FORCE : l'attaquant, sans test de visibilité (:195-197).
    spriteId = _battlerSpriteId(_atk());
  }
  if (abort) { DestroyAnimVisualTask(task.taskId); return; }
  const sp = _sprites()?.[spriteId];
  if (!sp) { DestroyAnimVisualTask(task.taskId); return; }
  sp.x2 = _args()[1];
  sp.y2 = _args()[2];
  task.data[0] = spriteId;
  task.data[1] = _args()[3];
  task.data[2] = _args()[4];
  task.data[3] = _args()[4];
  task.data[4] = _args()[1];
  task.data[5] = _args()[2];
  task.func = AnimTask_ShakeMon2_Step;
  task.func(task);
}
function AnimTask_ShakeMon2_Step(task: AnimTask): void {
  const sp = _sprites()?.[task.data[0]];
  if (!sp) { DestroyAnimVisualTask(task.taskId); return; }
  if (task.data[3] === 0) {
    sp.x2 = (sp.x2 === task.data[4]) ? -task.data[4] : task.data[4];
    sp.y2 = (sp.y2 === task.data[5]) ? -task.data[5] : task.data[5];
    task.data[3] = task.data[2];
    if (--task.data[1] === 0) {
      sp.x2 = 0;
      sp.y2 = 0;
      DestroyAnimVisualTask(task.taskId);
      return;
    }
  } else {
    task.data[3]--;
  }
}

// ─── gHorizontalLungeSpriteTemplate (:30) — le lunge de Tackle/Pound/… ──────
// arg0: durée · arg1: distance x. Sprite contrôleur INVISIBLE (tileTag 0).
function DoHorizontalLunge(sprite: AnimSprite): void {
  sprite.invisible = true;
  if (GetBattlerSide(_atk()) !== 0 /* B_SIDE_PLAYER */) {
    sprite.data[1] = -_args()[1];
  } else {
    sprite.data[1] = _args()[1];
  }
  sprite.data[0] = _args()[0];
  sprite.data[2] = 0;
  sprite.data[3] = _battlerSpriteId(_atk());
  sprite.data[4] = _args()[0];
  StoreSpriteCallbackInData6(sprite, ReverseHorizontalLungeDirection);
  sprite.callback = TranslateSpriteLinearById;
}
function ReverseHorizontalLungeDirection(sprite: AnimSprite): void {
  sprite.data[0] = sprite.data[4];
  sprite.data[1] = -sprite.data[1];
  sprite.callback = TranslateSpriteLinearById;
  StoreSpriteCallbackInData6(sprite, DestroyAnimSprite as unknown as (s: AnimSprite) => void);
}

// ─── Slides (Tackle & co — gSlideMonToOffset/OriginalPos, tileTag 0) ────────
// 1:1 InitSpriteDataForLinearTranslation (battle_anim_mons.c) — s16 wraps.
function _s16(v: number): number { return (v << 16) >> 16; }
function InitSpriteDataForLinearTranslation(sprite: AnimSprite): void {
  const x = _s16((sprite.data[2] - sprite.data[1]) << 8);
  const y = _s16((sprite.data[4] - sprite.data[3]) << 8);
  sprite.data[1] = Math.trunc(x / sprite.data[0]);
  sprite.data[2] = Math.trunc(y / sprite.data[0]);
  sprite.data[4] = 0;
  sprite.data[3] = 0;
}
/** 1:1 `TranslateSpriteLinearByIdFixedPoint` (battle_anim_mons.c). */
function TranslateSpriteLinearByIdFixedPoint(sprite: AnimSprite): void {
  if (sprite.data[0] > 0) {
    sprite.data[0]--;
    sprite.data[3] += sprite.data[1];
    sprite.data[4] += sprite.data[2];
    const mon = _sprites()?.[sprite.data[5]];
    if (mon) {
      mon.x2 = _s16(sprite.data[3]) >> 8;
      mon.y2 = _s16(sprite.data[4]) >> 8;
    }
  } else {
    SetCallbackToStoredInData6(sprite);
  }
}

/** 1:1 `SlideMonToOffset` (battle_anim_mon_movement.c) — args :
 *  [battler(0=atk/1=tgt), xOff, yOff, mirrorY, duration]. */
function SlideMonToOffset(sprite: AnimSprite): void {
  const args = _args();
  const battler = !args[0] ? _atk() : (_itf()?.getTarget() ?? 1);
  const monSpriteId = _battlerSpriteId(battler);
  const mon = _sprites()?.[monSpriteId];
  if (!mon) { DestroyAnimSprite(sprite); return; }
  if (GetBattlerSide(battler) !== 0 /* B_SIDE_PLAYER */) {
    args[1] = -args[1];
    if (args[3] === 1) args[2] = -args[2];
  }
  sprite.data[0] = args[4];
  sprite.data[1] = mon.x;
  sprite.data[2] = mon.x + args[1];
  sprite.data[3] = mon.y;
  sprite.data[4] = mon.y + args[2];
  InitSpriteDataForLinearTranslation(sprite);
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  sprite.data[5] = monSpriteId;
  sprite.invisible = true;
  StoreSpriteCallbackInData6(sprite, DestroyAnimSprite as unknown as (s: AnimSprite) => void);
  sprite.callback = TranslateSpriteLinearByIdFixedPoint;
}

/** 1:1 `SlideMonToOriginalPos` — args : [battler, mode(0=xy/1=y/2=x), duration]. */
function SlideMonToOriginalPos(sprite: AnimSprite): void {
  const args = _args();
  const monSpriteId = _battlerSpriteId(!args[0] ? _atk() : (_itf()?.getTarget() ?? 1));
  const mon = _sprites()?.[monSpriteId];
  if (!mon) { DestroyAnimSprite(sprite); return; }
  sprite.data[0] = args[2];
  sprite.data[1] = mon.x + mon.x2;
  sprite.data[2] = mon.x;
  sprite.data[3] = mon.y + mon.y2;
  sprite.data[4] = mon.y;
  InitSpriteDataForLinearTranslation(sprite);
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  sprite.data[5] = mon.x2;
  sprite.data[6] = mon.y2;
  sprite.invisible = true;
  if (args[1] === 1) sprite.data[2] = 0;
  else if (args[1] === 2) sprite.data[1] = 0;
  sprite.data[7] = (args[1] & 0xFF) | (monSpriteId << 8);
  sprite.callback = SlideMonToOriginalPos_Step;
}
function SlideMonToOriginalPos_Step(sprite: AnimSprite): void {
  const lo = sprite.data[7] & 0xFF;
  const monSpriteId = sprite.data[7] >> 8;
  const mon = _sprites()?.[monSpriteId];
  if (sprite.data[0] === 0) {
    if (mon) {
      if (lo < 2) mon.x2 = 0;
      if (lo === 2 || lo === 0) mon.y2 = 0;
    }
    DestroyAnimSprite(sprite);
  } else {
    sprite.data[0]--;
    sprite.data[3] += sprite.data[1];
    sprite.data[4] += sprite.data[2];
    if (mon) {
      mon.x2 = ((_s16(sprite.data[3]) >> 8) << 24 >> 24) + sprite.data[5];
      mon.y2 = ((_s16(sprite.data[4]) >> 8) << 24 >> 24) + sprite.data[6];
    }
  }
}

/** 1:1 `AnimTask_TranslateMonElliptical` (battle_anim_mon_movement.c) :
 *  args [battler, amplX, amplY, nbTours, vitesse 0-5]. Le mon décrit une
 *  ellipse via x2=Sin(angle,amplX), y2=-Cos(angle,amplY)+amplY (départ bas).
 *  wavePeriod = 1<<vitesse. (C1a goal : Tail Whip ENTIER + Quick Attack.) */
function AnimTask_TranslateMonElliptical(task: AnimTask): void {
  const args = _itf()?.getArgs?.() ?? [0, 12, 4, 2, 3];
  const spriteId = _battlerSpriteId(args[0] === 0 ? (_itf()?.getAttacker?.() ?? 0) : (_itf()?.getTarget?.() ?? 1));
  let speed = args[4];
  if (speed > 5) speed = 5;
  const wavePeriod = 1 << speed;
  task.data[0] = spriteId;
  task.data[1] = args[1];
  task.data[2] = args[2];
  task.data[3] = args[3];
  task.data[4] = wavePeriod;
  task.data[5] = 0;
  task.func = AnimTask_TranslateMonElliptical_Step as never;
  AnimTask_TranslateMonElliptical_Step(task);
}
/** 1:1 `AnimTask_TranslateMonEllipticalRespectSide` : amplX inversé côté adverse. */
function AnimTask_TranslateMonEllipticalRespectSide(task: AnimTask): void {
  const args = _itf()?.getArgs?.() ?? [0, 12, 4, 2, 3];
  const atk = _itf()?.getAttacker?.() ?? 0;
  if ((atk & 1) !== 0 /* != B_SIDE_PLAYER */) args[1] = -args[1];
  AnimTask_TranslateMonElliptical(task);
}
function AnimTask_TranslateMonElliptical_Step(task: AnimTask): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ x2: number; y2: number } | undefined> } | undefined;
  const sp = rt?.gSprites?.[task.data[0]];
  if (!sp) { DestroyAnimVisualTask(task.taskId); return; }
  sp.x2 = Sin(task.data[5], _s16(task.data[1]));
  sp.y2 = -Cos(task.data[5], task.data[2]) + task.data[2];
  task.data[5] = (task.data[5] + task.data[4]) & 0xFF;
  if (task.data[5] === 0) task.data[3]--;
  if (task.data[3] === 0) {
    sp.x2 = 0;
    sp.y2 = 0;
    DestroyAnimVisualTask(task.taskId);
  }
}

/** 1:1 `AnimTask_ScaleMonAndRestore` (battle_anim_mon_movement.c) :
 *  args [dX, dY, durée, battler, objMode]. Scale le mon par accumulation
 *  (data10/11 += dX/dY par frame, base 0x100), inverse à mi-course, restore.
 *  (C1b : LEER + plein de moves de statut.) */
function AnimTask_ScaleMonAndRestore(task: AnimTask): void {
  const args = _itf()?.getArgs?.() ?? [-5, -5, 10, 0, 1];
  const battler = args[3] === 0 ? (_itf()?.getAttacker?.() ?? 0) : (_itf()?.getTarget?.() ?? 1);
  const spriteId = _battlerSpriteId(battler);
  const mons = (globalThis as Record<string, unknown>).__battleAnimMons as {
    SetSpriteRotScale?: (id: number, x: number, y: number, r: number) => void;
    ResetSpriteRotScale?: (id: number) => void;
    PrepareBattlerSpriteForRotScale?: (id: number, mode: number) => void;
  } | undefined;
  if (spriteId < 0 || !mons?.SetSpriteRotScale) { DestroyAnimVisualTask(task.taskId); return; }
  mons.PrepareBattlerSpriteForRotScale?.(spriteId, args[4] ?? 0);
  task.data[0] = args[0];
  task.data[1] = args[1];
  task.data[2] = args[2];
  task.data[3] = args[2];
  task.data[4] = spriteId;
  task.data[10] = 0x100;
  task.data[11] = 0x100;
  task.func = AnimTask_ScaleMonAndRestore_Step as never;
}
function AnimTask_ScaleMonAndRestore_Step(task: AnimTask): void {
  const mons = (globalThis as Record<string, unknown>).__battleAnimMons as {
    SetSpriteRotScale?: (id: number, x: number, y: number, r: number) => void;
    ResetSpriteRotScale?: (id: number) => void;
  } | undefined;
  task.data[10] += task.data[0];
  task.data[11] += task.data[1];
  mons?.SetSpriteRotScale?.(task.data[4], task.data[10], task.data[11], 0);
  if (--task.data[2] === 0) {
    if (task.data[3] > 0) {
      task.data[0] = -task.data[0];
      task.data[1] = -task.data[1];
      task.data[2] = task.data[3];
      task.data[3] = 0;
    } else {
      mons?.ResetSpriteRotScale?.(task.data[4]);
      DestroyAnimVisualTask(task.taskId);
      return;
    }
  }
}

// ─── VAGUE F1 fidélité (2026-06-11, qualification user) ─────────────────────
/** 1:1 `AnimTask_ShakeMonInPlace` (battle_anim_mon_movement.c.c:236) — args:
 *  (battler, xOff, yOff, numShakes, delay). 27 usages scripts. */
function AnimTask_ShakeMonInPlace(task: AnimTask): void {
  const a = _args();
  const spriteId = GetAnimBattlerSpriteId(a[0]);
  if (spriteId === 0xFF) { DestroyAnimVisualTask(task.taskId); return; }
  const sp = _sprites()?.[spriteId];
  if (!sp) { DestroyAnimVisualTask(task.taskId); return; }
  sp.x2 += a[1];
  sp.y2 += a[2];
  task.data[0] = spriteId;
  task.data[1] = 0;
  task.data[2] = a[3];
  task.data[3] = 0;
  task.data[4] = a[4];
  task.data[5] = a[1] * 2;
  task.data[6] = a[2] * 2;
  task.func = AnimTask_ShakeMonInPlace_Step;
  AnimTask_ShakeMonInPlace_Step(task);
}
function AnimTask_ShakeMonInPlace_Step(task: AnimTask): void {
  const sp = _sprites()?.[task.data[0]];
  if (!sp) { DestroyAnimVisualTask(task.taskId); return; }
  if (task.data[3] === 0) {
    if (task.data[1] & 1) { sp.x2 += task.data[5]; sp.y2 += task.data[6]; }
    else { sp.x2 -= task.data[5]; sp.y2 -= task.data[6]; }
    task.data[3] = task.data[4];
    if (++task.data[1] >= task.data[2]) {
      if (task.data[1] & 1) { sp.x2 += Math.trunc(task.data[5] / 2); sp.y2 += Math.trunc(task.data[6] / 2); }
      else { sp.x2 -= Math.trunc(task.data[5] / 2); sp.y2 -= Math.trunc(task.data[6] / 2); }
      DestroyAnimVisualTask(task.taskId);
      return;
    }
  } else {
    task.data[3]--;
  }
}

/** 1:1 `AnimTask_SwayMon` (battle_anim_mon_movement.c.c:613) — args:
 *  (axe 0=x/1=y, amplitude, vitesse, numSways, battler). 13 usages. */
function AnimTask_SwayMon(task: AnimTask): void {
  const a = _args();
  if ((_atk() & 1) !== 0 /* != B_SIDE_PLAYER */) a[1] = -a[1];
  const spriteId = GetAnimBattlerSpriteId(a[4]);
  task.data[0] = a[0];
  task.data[1] = a[1];
  task.data[2] = a[2];
  task.data[3] = a[3];
  task.data[4] = spriteId;
  task.data[5] = a[4] === 0 ? _atk() : (_itf()?.getTarget() ?? 1);
  task.data[10] = 0; task.data[11] = 0;
  task.data[12] = 1;
  task.func = AnimTask_SwayMonStep;
}
function AnimTask_SwayMonStep(task: AnimTask): void {
  const sp = _sprites()?.[task.data[4]];
  if (!sp) { DestroyAnimVisualTask(task.taskId); return; }
  const sineIndex = (task.data[10] + task.data[2]) & 0xFFFF;
  task.data[10] = sineIndex;
  const waveIndex = sineIndex >> 8;
  const sineValue = Sin(waveIndex, task.data[1]);
  if (task.data[0] === 0) {
    sp.x2 = sineValue;
  } else {
    const side = task.data[5] & 1; // 0=player
    if (side === 0) sp.y2 = sineValue >= 0 ? sineValue : -sineValue;
    else sp.y2 = sineValue >= 0 ? -sineValue : sineValue;
  }
  if ((waveIndex >= 0x80 && task.data[11] === 0 && task.data[12] === 1)
    || (waveIndex < 0x7f && task.data[11] === 1 && task.data[12] === 0)) {
    task.data[11] ^= 1;
    task.data[12] ^= 1;
    if (--task.data[3] === 0) {
      sp.x2 = 0;
      sp.y2 = 0;
      DestroyAnimVisualTask(task.taskId);
    }
  }
}

/** 1:1 `AnimTask_WindUpLunge` (battle_anim_mon_movement.c.c:741) — args:
 *  (battler, windUpX, windUpYAmp, windUpDur, delay, lungeX, lungeDur). */
function AnimTask_WindUpLunge(task: AnimTask): void {
  const a = _args();
  const wavePeriod = Math.trunc(0x8000 / (a[3] || 1));
  if ((_atk() & 1) !== 0) { a[1] = -a[1]; a[5] = -a[5]; }
  task.data[0] = GetAnimBattlerSpriteId(a[0]);
  task.data[1] = Math.trunc((a[1] << 8) / (a[3] || 1));
  task.data[2] = a[2];
  task.data[3] = a[3];
  task.data[4] = a[4];
  task.data[5] = Math.trunc((a[5] << 8) / (a[6] || 1));
  task.data[6] = a[6];
  task.data[7] = wavePeriod;
  task.data[10] = 0; task.data[11] = 0; task.data[12] = 0;
  task.func = AnimTask_WindUpLunge_Step1;
}
function AnimTask_WindUpLunge_Step1(task: AnimTask): void {
  const sp = _sprites()?.[task.data[0]];
  if (!sp) { DestroyAnimVisualTask(task.taskId); return; }
  task.data[11] += task.data[1];
  sp.x2 = task.data[11] >> 8;
  sp.y2 = Sin((task.data[10] >> 8) & 0xFF, task.data[2]);
  task.data[10] += task.data[7];
  if (--task.data[3] === 0) task.func = AnimTask_WindUpLunge_Step2;
}
function AnimTask_WindUpLunge_Step2(task: AnimTask): void {
  if (task.data[4] > 0) { task.data[4]--; return; }
  const sp = _sprites()?.[task.data[0]];
  if (!sp) { DestroyAnimVisualTask(task.taskId); return; }
  task.data[12] += task.data[5];
  sp.x2 = (task.data[12] >> 8) + (task.data[11] >> 8);
  if (--task.data[6] === 0) { DestroyAnimVisualTask(task.taskId); }
}

/** 1:1 `AnimTask_ShakeTargetBasedOnMovePowerOrDmg` (battle_anim_mon_movement.c.c:868) —
 *  args: (usePowerOrDmg, stepDelay, numShakes, shakeX, shakeY). 15 usages. */
function AnimTask_ShakeTargetBasedOnMovePowerOrDmg(task: AnimTask): void {
  const a = _args();
  const g = globalThis as Record<string, unknown>;
  const base = !a[0] ? ((g.__gAnimMovePower as number) ?? 0) : ((g.__gAnimMoveDmg as number) ?? 0);
  let amp = Math.trunc(base / 12);
  if (amp < 1) amp = 1;
  if (amp > 16) amp = 16;
  task.data[15] = amp;
  task.data[14] = Math.trunc(amp / 2);
  task.data[13] = task.data[14] + (amp & 1);
  task.data[12] = 0;
  task.data[10] = a[3];
  task.data[11] = a[4];
  task.data[7] = GetAnimBattlerSpriteId(1 /* ANIM_TARGET */);
  const sp = _sprites()?.[task.data[7]];
  task.data[8] = sp?.x2 ?? 0;
  task.data[9] = sp?.y2 ?? 0;
  task.data[0] = 0;
  task.data[1] = a[1];
  task.data[2] = a[2];
  task.func = AnimTask_ShakeTargetBasedOnMovePowerOrDmg_Step;
}
function AnimTask_ShakeTargetBasedOnMovePowerOrDmg_Step(task: AnimTask): void {
  const sp = _sprites()?.[task.data[7]];
  if (!sp) { DestroyAnimVisualTask(task.taskId); return; }
  if (++task.data[0] > task.data[1]) {
    task.data[0] = 0;
    task.data[12] = (task.data[12] + 1) & 1;
    if (task.data[10]) {
      sp.x2 = task.data[12] ? task.data[8] + task.data[13] : task.data[8] - task.data[14];
    }
    if (task.data[11]) {
      sp.y2 = task.data[12] ? task.data[15] : 0;
    }
    if (!--task.data[2]) {
      sp.x2 = 0;
      sp.y2 = 0;
      DestroyAnimVisualTask(task.taskId);
    }
  }
}

// ─── VAGUE F2 (sweep final 2026-06-11) ──────────────────────────────────────
/** 1:1 `SetBattlerSpriteYOffsetFromRotation` (battle_anim_mons.c.c:1320) : y2 = |sin|>>3. */
function _SetYOffsetFromRotation(spriteId: number): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ y2: number; oamIndex: number } | undefined>; gOamMatrices?: Array<{ c: number }>; gba?: { oam: Array<{ matrixNum?: number; affineParamIndex?: number }> } } | undefined;
  const sp = rt?.gSprites?.[spriteId];
  if (!sp) return;
  const oam = rt?.gba?.oam[sp.oamIndex];
  const m = rt?.gOamMatrices?.[oam?.matrixNum ?? oam?.affineParamIndex ?? 0];
  let c = m?.c ?? 0;
  if (c < 0) c = -c;
  sp.y2 = c >> 3;
}
/** 1:1 `AnimTask_RotateMonSpriteToSide` (battle_anim_mon_movement.c.c) — args
 *  (durée, deltaRot, battler, mode 0/1/2). 10 hits sweep. */
function AnimTask_RotateMonSpriteToSide(task: AnimTask): void {
  const a = _args();
  const spriteId = GetAnimBattlerSpriteId(a[2]);
  if (spriteId === 0xFF) { DestroyAnimVisualTask(task.taskId); return; }
  PrepareBattlerSpriteForRotScale(spriteId, 0);
  task.data[1] = 0;
  task.data[2] = a[0];
  task.data[3] = a[3] !== 1 ? 0 : a[0] * a[1];
  task.data[4] = a[1];
  task.data[5] = spriteId;
  task.data[6] = a[3];
  const b = a[2] === 0 ? _atk() : (_itf()?.getTarget() ?? 1);
  task.data[7] = (b & 1) === 0 ? 1 : 0; // player side
  if (task.data[7]) { task.data[3] *= -1; task.data[4] *= -1; }
  task.func = AnimTask_RotateMonSpriteToSide_Step;
}
/** 1:1 `AnimTask_RotateMonToSideAndRestore` — mode 2 = aller-retour. */
function AnimTask_RotateMonToSideAndRestore(task: AnimTask): void {
  const a = _args();
  const spriteId = GetAnimBattlerSpriteId(a[2]);
  if (spriteId === 0xFF) { DestroyAnimVisualTask(task.taskId); return; }
  PrepareBattlerSpriteForRotScale(spriteId, 0);
  task.data[1] = 0;
  task.data[2] = a[0];
  const b = a[2] === 0 ? _atk() : (_itf()?.getTarget() ?? 1);
  if ((b & 1) !== 0) a[1] = -a[1];
  task.data[3] = a[3] !== 1 ? 0 : a[0] * a[1];
  task.data[4] = a[1];
  task.data[5] = spriteId;
  task.data[6] = a[3];
  task.data[7] = 1;
  task.data[3] *= -1;
  task.data[4] *= -1;
  task.func = AnimTask_RotateMonSpriteToSide_Step;
}
function AnimTask_RotateMonSpriteToSide_Step(task: AnimTask): void {
  task.data[3] += task.data[4];
  SetSpriteRotScale(task.data[5], 0x100, 0x100, task.data[3] & 0xFFFF);
  if (task.data[7]) _SetYOffsetFromRotation(task.data[5]);
  if (++task.data[1] >= task.data[2]) {
    switch (task.data[6]) {
      case 1:
        ResetSpriteRotScale(task.data[5]);
        DestroyAnimVisualTask(task.taskId);
        return;
      case 0:
      default:
        DestroyAnimVisualTask(task.taskId);
        return;
      case 2:
        task.data[1] = 0;
        task.data[4] *= -1;
        task.data[6] = 1;
        break;
    }
  }
}

// ─── Enregistrement registry (à l'import) ──────────────────────────────────
/** 1:1 `AnimTask_SlideOffScreen` (battle_anim_mon_movement.c.c, 2 hits — Roar/Whirlwind) :
 *  glisse le battler hors écran (x2 += data[1] jusqu à sortir ±32). */
function AnimTask_SlideOffScreen(task: AnimTask): void {
  const a = _args();
  let spriteId: number;
  if (a[0] === 0 || a[0] === 1) spriteId = GetAnimBattlerSpriteId(a[0]);
  else { DestroyAnimVisualTask(task.taskId); return; } // partners = single skip 1:1
  if (spriteId === 0xFF) { DestroyAnimVisualTask(task.taskId); return; }
  task.data[0] = spriteId;
  const tgt = _itf()?.getTarget() ?? 1;
  task.data[1] = (tgt & 1) !== 0 ? a[1] : -a[1];
  task.func = AnimTask_SlideOffScreen_Step;
}
function AnimTask_SlideOffScreen_Step(task: AnimTask): void {
  const sp = _sprites()?.[task.data[0]];
  if (!sp) { DestroyAnimVisualTask(task.taskId); return; }
  sp.x2 += task.data[1];
  if (sp.x2 + sp.x < -32 || sp.x2 + sp.x > 272) {
    DestroyAnimVisualTask(task.taskId);
  }
}
registerAnimTasks({
  AnimTask_SlideOffScreen: AnimTask_SlideOffScreen as never,
  AnimTask_RotateMonSpriteToSide: AnimTask_RotateMonSpriteToSide as never,
  AnimTask_RotateMonToSideAndRestore: AnimTask_RotateMonToSideAndRestore as never,
  AnimTask_ShakeMonInPlace: AnimTask_ShakeMonInPlace as never,
  AnimTask_SwayMon: AnimTask_SwayMon as never,
  AnimTask_WindUpLunge: AnimTask_WindUpLunge as never,
  AnimTask_ShakeTargetBasedOnMovePowerOrDmg: AnimTask_ShakeTargetBasedOnMovePowerOrDmg as never,
  AnimTask_ShakeMon: AnimTask_ShakeMon as never,
  AnimTask_ShakeMon2: AnimTask_ShakeMon2 as never,
  AnimTask_TranslateMonElliptical: AnimTask_TranslateMonElliptical as never,
  AnimTask_TranslateMonEllipticalRespectSide: AnimTask_TranslateMonEllipticalRespectSide as never,
  AnimTask_ScaleMonAndRestore: AnimTask_ScaleMonAndRestore as never,
});
registerAnimTemplates([
  { name: 'gHorizontalLungeSpriteTemplate', tileTag: 0, paletteTag: 0, callback: DoHorizontalLunge as never },
  { name: 'gSlideMonToOffsetSpriteTemplate', tileTag: 0, paletteTag: 0, callback: SlideMonToOffset as never },
  { name: 'gSlideMonToOriginalPosSpriteTemplate', tileTag: 0, paletteTag: 0, callback: SlideMonToOriginalPos as never },
]);

// ════════════════════════════════════════════════════════════════════════════
// Vague « callbacks mouvement » (2026-06-11) : DoVerticalDip +
// SlideMonToOffsetAndBack — 1:1 battle_anim_mon_movement.c:455/:582.
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 `DoVerticalDip` (battle_anim_mon_movement.c:455) —
 *  gVerticalDipSpriteTemplate (tileTag 0 = contrôleur invisible).
 *  args [durée d'un sens, deltaY/frame, battler] : déplace le battler via
 *  TranslateSpriteLinearById (data[1]=0 → X immobile), puis inverse. */
function DoVerticalDip(sprite: AnimSprite): void {
  sprite.invisible = true;
  const spriteId = GetAnimBattlerSpriteId(_args()[2]);
  sprite.data[0] = _args()[0];
  sprite.data[1] = 0;
  sprite.data[2] = _args()[1];
  sprite.data[3] = spriteId;
  sprite.data[4] = _args()[0];
  StoreSpriteCallbackInData6(sprite, ReverseVerticalDipDirection);
  sprite.callback = TranslateSpriteLinearById;
}
/** 1:1 `ReverseVerticalDipDirection` (battle_anim_mon_movement.c:469). */
function ReverseVerticalDipDirection(sprite: AnimSprite): void {
  sprite.data[0] = sprite.data[4];
  sprite.data[2] = -sprite.data[2];
  sprite.callback = TranslateSpriteLinearById;
  StoreSpriteCallbackInData6(sprite, DestroyAnimSprite as unknown as (s: AnimSprite) => void);
}

/** 1:1 `SlideMonToOffsetAndBack` (battle_anim_mon_movement.c:582) —
 *  gSlideMonToOffsetAndBackSpriteTemplate. args [battler(0=atk/1=tgt), xOff,
 *  yOff, mirrorY, durée, back?]. Part de la position COURANTE (x+x2, y+y2) ;
 *  data[3]/data[4] réamorcés à x2<<8 / y2<<8 (offsets fixed-point continus) ;
 *  args[5]≠0 → _End remet x2/y2 du mon à 0 avant destroy. */
function SlideMonToOffsetAndBack(sprite: AnimSprite): void {
  sprite.invisible = true;
  const args = _args();
  const battler = args[0] === 0 /* ANIM_ATTACKER */ ? _atk() : (_itf()?.getTarget() ?? 1);
  const spriteId = _battlerSpriteId(battler);
  const mon = _sprites()?.[spriteId];
  if (!mon) { DestroyAnimSprite(sprite); return; } // garde-fou runtime (pattern SlideMonToOffset)
  if (GetBattlerSide(battler)) {
    args[1] = -args[1]; // mutation in-place 1:1 (gBattleAnimArgs partagé)
    if (args[3] === 1) args[2] = -args[2];
  }
  sprite.data[0] = args[4];
  sprite.data[1] = mon.x + mon.x2;
  sprite.data[2] = sprite.data[1] + args[1];
  sprite.data[3] = mon.y + mon.y2;
  sprite.data[4] = sprite.data[3] + args[2];
  InitSpriteDataForLinearTranslation(sprite);
  sprite.data[3] = mon.x2 << 8;
  sprite.data[4] = mon.y2 << 8;
  sprite.data[5] = spriteId;
  sprite.data[6] = args[5];
  if (!args[5]) {
    StoreSpriteCallbackInData6(sprite, DestroyAnimSprite as unknown as (s: AnimSprite) => void);
  } else {
    StoreSpriteCallbackInData6(sprite, SlideMonToOffsetAndBack_End);
  }
  sprite.callback = TranslateSpriteLinearByIdFixedPoint;
}
/** 1:1 `SlideMonToOffsetAndBack_End` (battle_anim_mon_movement.c:624). */
function SlideMonToOffsetAndBack_End(sprite: AnimSprite): void {
  const mon = _sprites()?.[sprite.data[5]];
  if (mon) {
    mon.x2 = 0;
    mon.y2 = 0;
  }
  DestroyAnimSprite(sprite);
}

registerAnimTemplates([
  { name: 'gVerticalDipSpriteTemplate', tileTag: 0, paletteTag: 0, callback: DoVerticalDip as never },
  { name: 'gSlideMonToOffsetAndBackSpriteTemplate', tileTag: 0, paletteTag: 0, callback: SlideMonToOffsetAndBack as never },
]);

// --- VAGUE F63 : AnimTask_ShakeAndSinkMon (battle_anim_mon_movement.c.c:320-354) ----------
// Le mon tremble (x2 alterne +-arg1 toutes les arg2 frames) en S'ENFONCANT
// (y2 += arg3 Q8.8 cumulatif) pendant arg4 frames. (Dive/Submersion...)
type _SasTask = { taskId: number; data: number[]; func?: unknown };
function _sasItf(): { getArgs?: () => number[]; getAttacker?: () => number; getTarget?: () => number; DestroyAnimVisualTask?: (id: number) => void } {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as never) ?? {};
}
function _sasSpriteId(animBattler: number): number {
  const itf = _sasItf();
  const b = animBattler === 0 ? (itf.getAttacker?.() ?? 0) : (itf.getTarget?.() ?? 1);
  const co = (globalThis as Record<string, unknown>).__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  return co?.getBattlerMonSpriteId?.(b) ?? 0xFF;
}

/** 1:1 AnimTask_ShakeAndSinkMon (+ appel immediat du Step, 1:1). */
function AnimTask_ShakeAndSinkMon(task: _SasTask): void {
  const itf = _sasItf();
  const args = itf.getArgs?.() ?? [0, 4, 2, 96, 30];
  const spriteId = _sasSpriteId(args[0]);
  if (spriteId === 0xFF) { itf.DestroyAnimVisualTask?.(task.taskId); return; }
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ x2: number; y2: number } | undefined> } | undefined;
  const sp = rt?.gSprites?.[spriteId];
  if (sp) sp.x2 = args[1] | 0;
  task.data[0] = spriteId;
  task.data[1] = args[1] | 0;
  task.data[2] = args[2] | 0;
  task.data[3] = args[3] | 0;
  task.data[4] = args[4] | 0;
  task.data[8] = 0;
  task.data[9] = 0;
  task.func = AnimTask_ShakeAndSinkMon_Step;
  AnimTask_ShakeAndSinkMon_Step(task); // 1:1 gTasks[taskId].func(taskId)
}
function AnimTask_ShakeAndSinkMon_Step(task: _SasTask): void {
  const rt = (globalThis as Record<string, unknown>).__rt as { gSprites?: Array<{ x2: number; y2: number } | undefined> } | undefined;
  const sp = rt?.gSprites?.[task.data[0]];
  let x = task.data[1];
  if (task.data[2] === task.data[8]++) {
    task.data[8] = 0;
    if (sp && sp.x2 === x) x = -x;
    if (sp) sp.x2 += x;
  }
  task.data[1] = x;
  task.data[9] += task.data[3];
  if (sp) sp.y2 = task.data[9] >> 8;
  if (--task.data[4] === 0) {
    _sasItf().DestroyAnimVisualTask?.(task.taskId);
    return;
  }
}
registerAnimTasks({ AnimTask_ShakeAndSinkMon: AnimTask_ShakeAndSinkMon as never });
