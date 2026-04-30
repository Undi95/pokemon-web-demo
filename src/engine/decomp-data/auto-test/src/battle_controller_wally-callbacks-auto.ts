// AUTO-GENERATED (TEST BATCH) by regen-all-to-test.mjs
// Source: battle_controller_wally
// Generated: 2026-04-29
/* eslint-disable */
// @ts-nocheck

import type { DecompRuntime, DecompSprite, DecompTask } from '../../../decomp-runtime';
import { gSineTable, PaletteBuffer, Sin, Cos, Q_8_8_TO_INT, SetOamMatrix, CalcCenterToCornerVec, ST_OAM_AFFINE_OFF, ST_OAM_AFFINE_NORMAL, ST_OAM_AFFINE_DOUBLE, ST_OAM_AFFINE_ERASE, ST_OAM_OBJ_NORMAL, ST_OAM_OBJ_BLEND, ST_OAM_OBJ_WINDOW, ST_OAM_4BPP, ST_OAM_8BPP, RGB, RGB_BLACK, RGB_WHITE, RGB_WHITEALPHA, PLTT_SIZEOF, PLTT_SIZE_4BPP, PLTT_SIZE_8BPP, OBJ_PLTT_ID_FADED, BG_PLTT_ID_FADED, BLDALPHA_BLEND, WIN_RANGE, GET_TRUE_SPRITE_INDEX, ANIM_SPRITES_START } from '../../../decomp-helpers';
import { COLOR_CHANGES, NARROW_HEIGHT, NUM_BUBBLES_IN_SET, NUM_GF_LETTERS, TIMER_BIG_DROP_FALLS, TIMER_BIG_DROP_START, TIMER_END_PAN_UP, TIMER_END_SCENE_1, TIMER_END_SCENE_2, TIMER_FLYGON_ENTER, TIMER_FLYGON_SILHOUETTE_APPEAR, TIMER_LOGO_APPEAR, TIMER_LOGO_BLEND_OUT, TIMER_LOGO_DISAPPEAR, TIMER_LOGO_LETTERS_COLOR, TIMER_MANECTRIC_ENTER } from '../../intro-data';

export type SpriteCallback = (sprite: DecompSprite, rt: DecompRuntime) => void;
export type TaskCallback = (task: DecompTask, rt: DecompRuntime) => void;
export type CB2Callback = (rt: DecompRuntime) => void;

const _emptySprite: any = { data: new Array(16).fill(0), invisible: false, x: 0, y: 0, x2: 0, y2: 0, oamIndex: 0, spriteId: -1 };
const _emptyTask: any = { data: new Array(16).fill(0), func: null, taskId: -1 };
function _gs(rt: DecompRuntime, id: number): DecompSprite { return (rt.gSprites.get(id) as DecompSprite) ?? _emptySprite; }
function _gt(rt: DecompRuntime, id: number): DecompTask { return (rt.gTasks.get(id) as DecompTask) ?? _emptyTask; }

