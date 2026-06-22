// Auto-generated from decomps/pokeemeraude/src/intro.c
// DO NOT EDIT
import type { DecompRuntime } from '../../../../harness/runtime/decomp-runtime';
import type { DecompSprite, DecompTask } from '../../../../harness/runtime/decomp-runtime';
// Local helpers (mirroring those in callbacks-auto modules)
function _gs(rt: DecompRuntime, id: number): DecompSprite { return (rt.gSprites[id] as unknown as DecompSprite) ?? ({ spriteId: -1, invisible: true, data: [] } as unknown as DecompSprite); }
function _gt(rt: DecompRuntime, id: number): DecompTask { return (rt.gTasks.get(id) as unknown as DecompTask) ?? ({ taskId: -1, data: [] } as unknown as DecompTask); }

// ─── #define constants ───
export const TAG_VOLBEAT = 1500;
export const TAG_TORCHIC = 1501;
export const TAG_MANECTRIC = 1502;
export const TAG_LIGHTNING = 1503;
export const TAG_BUBBLES = 1504;
export const TAG_SPARKLE = 1505;
export const GFXTAG_DROPS_LOGO = 2000;
export const PALTAG_DROPS = 2000;
export const PALTAG_LOGO = 2001;
export const TAG_FLYGON_SILHOUETTE = 2002;
export const TAG_RAYQUAZA_ORB = 2003;
export const COLOSSEUM_GAME_CODE = 0x65366347 // "Gc6e" in ASCII;
export const TIMER_BIG_DROP_START = 76;
export const TIMER_LOGO_APPEAR = 128;
export const TIMER_LOGO_LETTERS_COLOR = 144;
export const TIMER_BIG_DROP_FALLS = 251;
export const TIMER_LOGO_BLEND_OUT = 256;
export const TIMER_LOGO_DISAPPEAR = 272;
export const TIMER_SMALL_DROP_1 = 368;
export const TIMER_SMALL_DROP_2 = 384;
export const TIMER_SPARKLES = 560;
export const TIMER_FLYGON_SILHOUETTE_APPEAR = 832;
export const TIMER_END_PAN_UP = 904;
export const TIMER_END_SCENE_1 = 1007;
export const TIMER_START_SCENE_2 = 1026;
export const TIMER_MANECTRIC_ENTER = 1088;
export const TIMER_PLAYER_DRIFT_BACK = 1109;
export const TIMER_MANECTRIC_RUN_CIRCULAR = 1168;
export const TIMER_PLAYER_MOVE_FORWARD = 1214;
export const TIMER_TORCHIC_ENTER = 1224;
export const TIMER_FLYGON_ENTER = 1394;
export const TIMER_PLAYER_MOVE_BACKWARD = 1398;
export const TIMER_PLAYER_HOLD_POSITION = 1576;
export const TIMER_PLAYER_EXIT = 1727;
export const TIMER_TORCHIC_SPEED_UP = 1735;
export const TIMER_TORCHIC_EXIT = 1856;
export const TIMER_END_SCENE_2 = 1946;
export const TIMER_START_SCENE_3 = 2068;
export const TIMER_POKEBALL_FADE = 28;
export const TIMER_START_LEGENDARIES = 43;
export const NUM_BUBBLES_IN_SET = 6;
export const NUM_GF_LETTERS = 9;
export const NARROW_HEIGHT = 32;
export const COLOR_CHANGES = 9;

// ─── static const arrays ───
export const sIntroDrops_Pal: any = /* INCGFX_U16 placeholder */ null;
export const sIntroLogo_Pal: any = /* INCGFX_U16 placeholder */ null;
export const sIntroDropsLogo_Gfx: any = /* INCGFX_U32 placeholder */ null;
export const sIntro1Bg_Pal: any = /* INCGFX_U16 placeholder */ null; // 16 x 16
export const sIntro1Bg0_Tilemap: any = /* INCGFX_U32 placeholder */ null;
export const sIntro1Bg1_Tilemap: any = /* INCGFX_U32 placeholder */ null;
export const sIntro1Bg2_Tilemap: any = /* INCGFX_U32 placeholder */ null;
export const sIntro1Bg3_Tilemap: any = /* INCGFX_U32 placeholder */ null;
export const sIntro1Bg_Gfx: any = /* INCGFX_U32 placeholder */ null;
export const sIntroPokeball_Pal: any = /* INCGFX_U16 placeholder */ null;
export const sIntroPokeball_Tilemap: any = /* INCGFX_U32 placeholder */ null;
export const sIntroPokeball_Gfx: any = /* INCGFX_U32 placeholder */ null;
export const sIntroStreaks_Pal: any = /* INCGFX_U16 placeholder */ null; // Unused
export const sIntroStreaks_Gfx: any = /* INCGFX_U32 placeholder */ null; // Unused
export const sIntroStreaks_Tilemap: any = /* INCGFX_U32 placeholder */ null; // Unused
export const sIntroRayquzaOrb_Pal: any = /* INCGFX_U16 placeholder */ null;
export const sIntroMisc_Pal: any = /* INCGFX_U16 placeholder */ null; // Unused
export const sIntroMisc_Gfx: any = /* INCGFX_U32 placeholder */ null; // Rayquza orb, and misc unused gfx
export const sIntroFlygonSilhouette_Pal: any = /* INCGFX_U16 placeholder */ null;
export const sIntroLati_Gfx: any = /* INCGFX_U32 placeholder */ null; // Unused
export const sUnusedData: any = [
    0x02, 0x03, 0x04, 0x05, 0x01, 0x01, 0x01, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x02, 0x0D,
    0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x02, 0x0D, 0x0E, 0x0F,
    0x10, 0x11, 0x12, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20, 0x21, 0x02, 0x0D, 0x0E, 0x0F, 0x10,
    0x11, 0x12, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x00
];
export const sSparkleCoords: any = [
    [124, 40], [102, 30], [77, 30], [54, 15], [148, 9], [63, 28], [93, 40]
];
export const sGroudonRockData: any = [
    [104, 0, 192], [142, 3, 640], [83, 1, 384], [155, 0, 128], [56, 2, 512], [174, 1, 256]
];
export const sKyogreBubbleData: any = [
    [ 66,  64,  1],
    [ 96,  96,  8],
    [128,  64,  1],
    [144,  48,  8],
    [160,  72,  1],
    [176,  96,  8],
    [ 96,  96,  4],
    [112, 104,  8],
    [128,  96,  4],
    [ 88,  32,  4],
    [104,  24,  8],
    [120,  32,  4],
];
export const GAMEFREAK_G = 0;
export const GAMEFREAK_A = 1;
export const GAMEFREAK_M = 2;
export const GAMEFREAK_E = 3;
export const GAMEFREAK_F = 4;
export const GAMEFREAK_R = 5;
export const GAMEFREAK_K = 6;
export const sGameFreakLetterData: any = [
    [GAMEFREAK_G, -72], [GAMEFREAK_A, -56], [GAMEFREAK_M, -40], [GAMEFREAK_E, -24],
    [GAMEFREAK_F, 8], [GAMEFREAK_R, 24], [GAMEFREAK_E, 40], [GAMEFREAK_A, 56], [GAMEFREAK_K, 72]
];
export const sPresentsLetterData: any = [
    [0, -64], [1, -48], [2, -32], [3, -16], [4, 16], [5, 32], [3, 48], [1, 64], [6, 80]
];
export const sGameFreakLettersMoveSpeed: any = [256, 192, 128, 64, 0, 64, 128, 192, 256];
export const sGameFreakLetterStartDelays: any = [0, 23, 23, 49, 62, 36, 36, 10, 10];
