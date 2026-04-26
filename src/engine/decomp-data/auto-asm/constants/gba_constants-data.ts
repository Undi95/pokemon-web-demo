// AUTO-GENERATED from constants/gba_constants.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/constants/gba_constants.inc
// Generated: 2026-04-26

// ─── .equ / .set constants ──────────────────────────────────────────────────
export const PSR_USR_MODE = 16;
export const PSR_FIQ_MODE = 17;
export const PSR_IRQ_MODE = 18;
export const PSR_SVC_MODE = 19;
export const PSR_ABT_MODE = 23;
export const PSR_UND_MODE = 27;
export const PSR_SYS_MODE = 31;
export const PSR_MODE_MASK = 31;
export const PSR_T_BIT = 32;
export const PSR_F_BIT = 64;
export const PSR_I_BIT = 128;
export const EWRAM_START = 33554432;
/** Raw expr: `EWRAM_START + 0x40000` */
export const EWRAM_END_EXPR = "EWRAM_START + 0x40000";
export const IWRAM_START = 50331648;
/** Raw expr: `IWRAM_START + 0x8000` */
export const IWRAM_END_EXPR = "IWRAM_START + 0x8000";
export const PLTT = 83886080;
/** Raw expr: `PLTT` */
export const BG_PLTT_EXPR = "PLTT";
/** Raw expr: `PLTT + 0x200` */
export const OBJ_PLTT_EXPR = "PLTT + 0x200";
export const VRAM = 100663296;
/** Raw expr: `VRAM` */
export const BG_VRAM_EXPR = "VRAM";
/** Raw expr: `VRAM + 0x10000` */
export const OBJ_VRAM0_EXPR = "VRAM + 0x10000";
/** Raw expr: `VRAM + 0x14000` */
export const OBJ_VRAM1_EXPR = "VRAM + 0x14000";
export const OAM = 117440512;
export const SOUND_INFO_PTR = 50364400;
export const INTR_CHECK = 50364408;
export const INTR_VECTOR = 50364412;
/** Raw expr: `1 << 0` */
export const INTR_FLAG_VBLANK_EXPR = "1 << 0";
/** Raw expr: `1 << 1` */
export const INTR_FLAG_HBLANK_EXPR = "1 << 1";
/** Raw expr: `1 << 2` */
export const INTR_FLAG_VCOUNT_EXPR = "1 << 2";
/** Raw expr: `1 << 3` */
export const INTR_FLAG_TIMER0_EXPR = "1 << 3";
/** Raw expr: `1 << 4` */
export const INTR_FLAG_TIMER1_EXPR = "1 << 4";
/** Raw expr: `1 << 5` */
export const INTR_FLAG_TIMER2_EXPR = "1 << 5";
/** Raw expr: `1 << 6` */
export const INTR_FLAG_TIMER3_EXPR = "1 << 6";
/** Raw expr: `1 << 7` */
export const INTR_FLAG_SERIAL_EXPR = "1 << 7";
/** Raw expr: `1 << 8` */
export const INTR_FLAG_DMA0_EXPR = "1 << 8";
/** Raw expr: `1 << 9` */
export const INTR_FLAG_DMA1_EXPR = "1 << 9";
/** Raw expr: `1 << 10` */
export const INTR_FLAG_DMA2_EXPR = "1 << 10";
/** Raw expr: `1 << 11` */
export const INTR_FLAG_DMA3_EXPR = "1 << 11";
/** Raw expr: `1 << 12` */
export const INTR_FLAG_KEYPAD_EXPR = "1 << 12";
/** Raw expr: `1 << 13` */
export const INTR_FLAG_GAMEPAK_EXPR = "1 << 13";
export const VCOUNT_VBLANK = 160;
export const TOTAL_SCANLINES = 228;
export const REG_BASE = 67108864;
export const OFFSET_REG_DISPCNT = 0;
export const OFFSET_REG_DISPSTAT = 4;
export const OFFSET_REG_VCOUNT = 6;
export const OFFSET_REG_BG0CNT = 8;
export const OFFSET_REG_BG1CNT = 10;
export const OFFSET_REG_BG2CNT = 12;
export const OFFSET_REG_BG3CNT = 14;
export const OFFSET_REG_BG0HOFS = 16;
export const OFFSET_REG_BG0VOFS = 18;
export const OFFSET_REG_BG1HOFS = 20;
export const OFFSET_REG_BG1VOFS = 22;
export const OFFSET_REG_BG2HOFS = 24;
export const OFFSET_REG_BG2VOFS = 26;
export const OFFSET_REG_BG3HOFS = 28;
export const OFFSET_REG_BG3VOFS = 30;
export const OFFSET_REG_BG2PA = 32;
export const OFFSET_REG_BG2PB = 34;
export const OFFSET_REG_BG2PC = 36;
export const OFFSET_REG_BG2PD = 38;
export const OFFSET_REG_BG2X_L = 40;
export const OFFSET_REG_BG2X_H = 42;
export const OFFSET_REG_BG2Y_L = 44;
export const OFFSET_REG_BG2Y_H = 46;
export const OFFSET_REG_BG3PA = 48;
export const OFFSET_REG_BG3PB = 50;
export const OFFSET_REG_BG3PC = 52;
export const OFFSET_REG_BG3PD = 54;
export const OFFSET_REG_BG3X_L = 56;
export const OFFSET_REG_BG3X_H = 58;
export const OFFSET_REG_BG3Y_L = 60;
export const OFFSET_REG_BG3Y_H = 62;
export const OFFSET_REG_WIN0H = 64;
export const OFFSET_REG_WIN1H = 66;
export const OFFSET_REG_WIN0V = 68;
export const OFFSET_REG_WIN1V = 70;
export const OFFSET_REG_WININ = 72;
export const OFFSET_REG_WINOUT = 74;
export const OFFSET_REG_MOSAIC = 76;
export const OFFSET_REG_BLDCNT = 80;
export const OFFSET_REG_BLDALPHA = 82;
export const OFFSET_REG_BLDY = 84;
export const OFFSET_REG_SOUND1CNT = 96;
export const OFFSET_REG_SOUND1CNT_L = 96;
export const OFFSET_REG_NR10 = 96;
export const OFFSET_REG_SOUND1CNT_H = 98;
export const OFFSET_REG_NR11 = 98;
export const OFFSET_REG_NR12 = 99;
export const OFFSET_REG_SOUND1CNT_X = 100;
export const OFFSET_REG_NR13 = 100;
export const OFFSET_REG_NR14 = 101;
export const OFFSET_REG_SOUND2CNT = 104;
export const OFFSET_REG_SOUND2CNT_L = 104;
export const OFFSET_REG_NR21 = 104;
export const OFFSET_REG_NR22 = 105;
export const OFFSET_REG_SOUND2CNT_H = 108;
export const OFFSET_REG_NR23 = 108;
export const OFFSET_REG_NR24 = 109;
export const OFFSET_REG_SOUND3CNT = 112;
export const OFFSET_REG_SOUND3CNT_L = 112;
export const OFFSET_REG_NR30 = 112;
export const OFFSET_REG_SOUND3CNT_H = 114;
export const OFFSET_REG_NR31 = 114;
export const OFFSET_REG_NR32 = 115;
export const OFFSET_REG_SOUND3CNT_X = 116;
export const OFFSET_REG_NR33 = 116;
export const OFFSET_REG_NR34 = 117;
export const OFFSET_REG_SOUND4CNT = 120;
export const OFFSET_REG_SOUND4CNT_L = 120;
export const OFFSET_REG_NR41 = 120;
export const OFFSET_REG_NR42 = 121;
export const OFFSET_REG_SOUND4CNT_H = 124;
export const OFFSET_REG_NR43 = 124;
export const OFFSET_REG_NR44 = 125;
export const OFFSET_REG_SOUNDCNT = 128;
export const OFFSET_REG_SOUNDCNT_L = 128;
export const OFFSET_REG_NR50 = 128;
export const OFFSET_REG_NR51 = 129;
export const OFFSET_REG_SOUNDCNT_H = 130;
export const OFFSET_REG_SOUNDCNT_X = 132;
export const OFFSET_REG_NR52 = 132;
export const OFFSET_REG_SOUNDBIAS = 136;
export const OFFSET_REG_WAVE_RAM = 144;
export const OFFSET_REG_WAVE_RAM0 = 144;
export const OFFSET_REG_WAVE_RAM0_L = 144;
export const OFFSET_REG_WAVE_RAM0_H = 146;
export const OFFSET_REG_WAVE_RAM1 = 148;
export const OFFSET_REG_WAVE_RAM1_L = 148;
export const OFFSET_REG_WAVE_RAM1_H = 150;
export const OFFSET_REG_WAVE_RAM2 = 152;
export const OFFSET_REG_WAVE_RAM2_L = 152;
export const OFFSET_REG_WAVE_RAM2_H = 154;
export const OFFSET_REG_WAVE_RAM3 = 156;
export const OFFSET_REG_WAVE_RAM3_L = 156;
export const OFFSET_REG_WAVE_RAM3_H = 158;
export const OFFSET_REG_FIFO = 160;
export const OFFSET_REG_FIFO_A = 160;
export const OFFSET_REG_FIFO_A_L = 160;
export const OFFSET_REG_FIFO_A_H = 162;
export const OFFSET_REG_FIFO_B = 164;
export const OFFSET_REG_FIFO_B_L = 164;
export const OFFSET_REG_FIFO_B_H = 166;
export const OFFSET_REG_DMA0 = 176;
export const OFFSET_REG_DMA0SAD = 176;
export const OFFSET_REG_DMA0SAD_L = 176;
export const OFFSET_REG_DMA0SAD_H = 178;
export const OFFSET_REG_DMA0DAD = 180;
export const OFFSET_REG_DMA0DAD_L = 180;
export const OFFSET_REG_DMA0DAD_H = 182;
export const OFFSET_REG_DMA0CNT = 184;
export const OFFSET_REG_DMA0CNT_L = 184;
export const OFFSET_REG_DMA0CNT_H = 186;
export const OFFSET_REG_DMA1 = 188;
export const OFFSET_REG_DMA1SAD = 188;
export const OFFSET_REG_DMA1SAD_L = 188;
export const OFFSET_REG_DMA1SAD_H = 190;
export const OFFSET_REG_DMA1DAD = 192;
export const OFFSET_REG_DMA1DAD_L = 192;
export const OFFSET_REG_DMA1DAD_H = 194;
export const OFFSET_REG_DMA1CNT = 196;
export const OFFSET_REG_DMA1CNT_L = 196;
export const OFFSET_REG_DMA1CNT_H = 198;
export const OFFSET_REG_DMA2 = 200;
export const OFFSET_REG_DMA2SAD = 200;
export const OFFSET_REG_DMA2SAD_L = 200;
export const OFFSET_REG_DMA2SAD_H = 202;
export const OFFSET_REG_DMA2DAD = 204;
export const OFFSET_REG_DMA2DAD_L = 204;
export const OFFSET_REG_DMA2DAD_H = 206;
export const OFFSET_REG_DMA2CNT = 208;
export const OFFSET_REG_DMA2CNT_L = 208;
export const OFFSET_REG_DMA2CNT_H = 210;
export const OFFSET_REG_DMA3 = 212;
export const OFFSET_REG_DMA3SAD = 212;
export const OFFSET_REG_DMA3SAD_L = 212;
export const OFFSET_REG_DMA3SAD_H = 214;
export const OFFSET_REG_DMA3DAD = 216;
export const OFFSET_REG_DMA3DAD_L = 216;
export const OFFSET_REG_DMA3DAD_H = 218;
export const OFFSET_REG_DMA3CNT = 220;
export const OFFSET_REG_DMA3CNT_L = 220;
export const OFFSET_REG_DMA3CNT_H = 222;
export const OFFSET_REG_TM0CNT = 256;
export const OFFSET_REG_TM0CNT_L = 256;
export const OFFSET_REG_TM0CNT_H = 258;
export const OFFSET_REG_TM1CNT = 260;
export const OFFSET_REG_TM1CNT_L = 260;
export const OFFSET_REG_TM1CNT_H = 262;
export const OFFSET_REG_TM2CNT = 264;
export const OFFSET_REG_TM2CNT_L = 264;
export const OFFSET_REG_TM2CNT_H = 266;
export const OFFSET_REG_TM3CNT = 268;
export const OFFSET_REG_TM3CNT_L = 268;
export const OFFSET_REG_TM3CNT_H = 270;
export const OFFSET_REG_SIOCNT = 296;
export const OFFSET_REG_SIODATA8 = 298;
export const OFFSET_REG_SIODATA32 = 288;
export const OFFSET_REG_SIOMLT_SEND = 298;
export const OFFSET_REG_SIOMLT_RECV = 288;
export const OFFSET_REG_SIOMULTI0 = 288;
export const OFFSET_REG_SIOMULTI1 = 290;
export const OFFSET_REG_SIOMULTI2 = 292;
export const OFFSET_REG_SIOMULTI3 = 294;
export const OFFSET_REG_KEYINPUT = 304;
export const OFFSET_REG_KEYCNT = 306;
export const OFFSET_REG_RCNT = 308;
export const OFFSET_REG_JOYCNT = 320;
export const OFFSET_REG_JOYSTAT = 344;
export const OFFSET_REG_JOY_RECV = 336;
export const OFFSET_REG_JOY_RECV_L = 336;
export const OFFSET_REG_JOY_RECV_H = 338;
export const OFFSET_REG_JOY_TRANS = 340;
export const OFFSET_REG_JOY_TRANS_L = 340;
export const OFFSET_REG_JOY_TRANS_H = 342;
export const OFFSET_REG_IME = 520;
export const OFFSET_REG_IE = 512;
export const OFFSET_REG_IF = 514;
export const OFFSET_REG_WAITCNT = 516;
/** Raw expr: `REG_BASE + OFFSET_REG_DISPCNT` */
export const REG_DISPCNT_EXPR = "REG_BASE + OFFSET_REG_DISPCNT";
/** Raw expr: `REG_BASE + OFFSET_REG_DISPSTAT` */
export const REG_DISPSTAT_EXPR = "REG_BASE + OFFSET_REG_DISPSTAT";
/** Raw expr: `REG_BASE + OFFSET_REG_VCOUNT` */
export const REG_VCOUNT_EXPR = "REG_BASE + OFFSET_REG_VCOUNT";
/** Raw expr: `REG_BASE + OFFSET_REG_BG0CNT` */
export const REG_BG0CNT_EXPR = "REG_BASE + OFFSET_REG_BG0CNT";
/** Raw expr: `REG_BASE + OFFSET_REG_BG1CNT` */
export const REG_BG1CNT_EXPR = "REG_BASE + OFFSET_REG_BG1CNT";
/** Raw expr: `REG_BASE + OFFSET_REG_BG2CNT` */
export const REG_BG2CNT_EXPR = "REG_BASE + OFFSET_REG_BG2CNT";
/** Raw expr: `REG_BASE + OFFSET_REG_BG3CNT` */
export const REG_BG3CNT_EXPR = "REG_BASE + OFFSET_REG_BG3CNT";
/** Raw expr: `REG_BASE + OFFSET_REG_BG0HOFS` */
export const REG_BG0HOFS_EXPR = "REG_BASE + OFFSET_REG_BG0HOFS";
/** Raw expr: `REG_BASE + OFFSET_REG_BG0VOFS` */
export const REG_BG0VOFS_EXPR = "REG_BASE + OFFSET_REG_BG0VOFS";
/** Raw expr: `REG_BASE + OFFSET_REG_BG1HOFS` */
export const REG_BG1HOFS_EXPR = "REG_BASE + OFFSET_REG_BG1HOFS";
/** Raw expr: `REG_BASE + OFFSET_REG_BG1VOFS` */
export const REG_BG1VOFS_EXPR = "REG_BASE + OFFSET_REG_BG1VOFS";
/** Raw expr: `REG_BASE + OFFSET_REG_BG2HOFS` */
export const REG_BG2HOFS_EXPR = "REG_BASE + OFFSET_REG_BG2HOFS";
/** Raw expr: `REG_BASE + OFFSET_REG_BG2VOFS` */
export const REG_BG2VOFS_EXPR = "REG_BASE + OFFSET_REG_BG2VOFS";
/** Raw expr: `REG_BASE + OFFSET_REG_BG3HOFS` */
export const REG_BG3HOFS_EXPR = "REG_BASE + OFFSET_REG_BG3HOFS";
/** Raw expr: `REG_BASE + OFFSET_REG_BG3VOFS` */
export const REG_BG3VOFS_EXPR = "REG_BASE + OFFSET_REG_BG3VOFS";
/** Raw expr: `REG_BASE + OFFSET_REG_BG2PA` */
export const REG_BG2PA_EXPR = "REG_BASE + OFFSET_REG_BG2PA";
/** Raw expr: `REG_BASE + OFFSET_REG_BG2PB` */
export const REG_BG2PB_EXPR = "REG_BASE + OFFSET_REG_BG2PB";
/** Raw expr: `REG_BASE + OFFSET_REG_BG2PC` */
export const REG_BG2PC_EXPR = "REG_BASE + OFFSET_REG_BG2PC";
/** Raw expr: `REG_BASE + OFFSET_REG_BG2PD` */
export const REG_BG2PD_EXPR = "REG_BASE + OFFSET_REG_BG2PD";
/** Raw expr: `REG_BASE + OFFSET_REG_BG2X_L` */
export const REG_BG2X_L_EXPR = "REG_BASE + OFFSET_REG_BG2X_L";
/** Raw expr: `REG_BASE + OFFSET_REG_BG2X_H` */
export const REG_BG2X_H_EXPR = "REG_BASE + OFFSET_REG_BG2X_H";
/** Raw expr: `REG_BASE + OFFSET_REG_BG2Y_L` */
export const REG_BG2Y_L_EXPR = "REG_BASE + OFFSET_REG_BG2Y_L";
/** Raw expr: `REG_BASE + OFFSET_REG_BG2Y_H` */
export const REG_BG2Y_H_EXPR = "REG_BASE + OFFSET_REG_BG2Y_H";
/** Raw expr: `REG_BASE + OFFSET_REG_BG3PA` */
export const REG_BG3PA_EXPR = "REG_BASE + OFFSET_REG_BG3PA";
/** Raw expr: `REG_BASE + OFFSET_REG_BG3PB` */
export const REG_BG3PB_EXPR = "REG_BASE + OFFSET_REG_BG3PB";
/** Raw expr: `REG_BASE + OFFSET_REG_BG3PC` */
export const REG_BG3PC_EXPR = "REG_BASE + OFFSET_REG_BG3PC";
/** Raw expr: `REG_BASE + OFFSET_REG_BG3PD` */
export const REG_BG3PD_EXPR = "REG_BASE + OFFSET_REG_BG3PD";
/** Raw expr: `REG_BASE + OFFSET_REG_BG3X_L` */
export const REG_BG3X_L_EXPR = "REG_BASE + OFFSET_REG_BG3X_L";
/** Raw expr: `REG_BASE + OFFSET_REG_BG3X_H` */
export const REG_BG3X_H_EXPR = "REG_BASE + OFFSET_REG_BG3X_H";
/** Raw expr: `REG_BASE + OFFSET_REG_BG3Y_L` */
export const REG_BG3Y_L_EXPR = "REG_BASE + OFFSET_REG_BG3Y_L";
/** Raw expr: `REG_BASE + OFFSET_REG_BG3Y_H` */
export const REG_BG3Y_H_EXPR = "REG_BASE + OFFSET_REG_BG3Y_H";
/** Raw expr: `REG_BASE + OFFSET_REG_WIN0H` */
export const REG_WIN0H_EXPR = "REG_BASE + OFFSET_REG_WIN0H";
/** Raw expr: `REG_BASE + OFFSET_REG_WIN1H` */
export const REG_WIN1H_EXPR = "REG_BASE + OFFSET_REG_WIN1H";
/** Raw expr: `REG_BASE + OFFSET_REG_WIN0V` */
export const REG_WIN0V_EXPR = "REG_BASE + OFFSET_REG_WIN0V";
/** Raw expr: `REG_BASE + OFFSET_REG_WIN1V` */
export const REG_WIN1V_EXPR = "REG_BASE + OFFSET_REG_WIN1V";
/** Raw expr: `REG_BASE + OFFSET_REG_WININ` */
export const REG_WININ_EXPR = "REG_BASE + OFFSET_REG_WININ";
/** Raw expr: `REG_BASE + OFFSET_REG_WINOUT` */
export const REG_WINOUT_EXPR = "REG_BASE + OFFSET_REG_WINOUT";
/** Raw expr: `REG_BASE + OFFSET_REG_MOSAIC` */
export const REG_MOSAIC_EXPR = "REG_BASE + OFFSET_REG_MOSAIC";
/** Raw expr: `REG_BASE + OFFSET_REG_BLDCNT` */
export const REG_BLDCNT_EXPR = "REG_BASE + OFFSET_REG_BLDCNT";
/** Raw expr: `REG_BASE + OFFSET_REG_BLDALPHA` */
export const REG_BLDALPHA_EXPR = "REG_BASE + OFFSET_REG_BLDALPHA";
/** Raw expr: `REG_BASE + OFFSET_REG_BLDY` */
export const REG_BLDY_EXPR = "REG_BASE + OFFSET_REG_BLDY";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUND1CNT` */
export const REG_SOUND1CNT_EXPR = "REG_BASE + OFFSET_REG_SOUND1CNT";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUND1CNT_L` */
export const REG_SOUND1CNT_L_EXPR = "REG_BASE + OFFSET_REG_SOUND1CNT_L";
/** Raw expr: `REG_BASE + OFFSET_REG_NR10` */
export const REG_NR10_EXPR = "REG_BASE + OFFSET_REG_NR10";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUND1CNT_H` */
export const REG_SOUND1CNT_H_EXPR = "REG_BASE + OFFSET_REG_SOUND1CNT_H";
/** Raw expr: `REG_BASE + OFFSET_REG_NR11` */
export const REG_NR11_EXPR = "REG_BASE + OFFSET_REG_NR11";
/** Raw expr: `REG_BASE + OFFSET_REG_NR12` */
export const REG_NR12_EXPR = "REG_BASE + OFFSET_REG_NR12";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUND1CNT_X` */
export const REG_SOUND1CNT_X_EXPR = "REG_BASE + OFFSET_REG_SOUND1CNT_X";
/** Raw expr: `REG_BASE + OFFSET_REG_NR13` */
export const REG_NR13_EXPR = "REG_BASE + OFFSET_REG_NR13";
/** Raw expr: `REG_BASE + OFFSET_REG_NR14` */
export const REG_NR14_EXPR = "REG_BASE + OFFSET_REG_NR14";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUND2CNT` */
export const REG_SOUND2CNT_EXPR = "REG_BASE + OFFSET_REG_SOUND2CNT";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUND2CNT_L` */
export const REG_SOUND2CNT_L_EXPR = "REG_BASE + OFFSET_REG_SOUND2CNT_L";
/** Raw expr: `REG_BASE + OFFSET_REG_NR21` */
export const REG_NR21_EXPR = "REG_BASE + OFFSET_REG_NR21";
/** Raw expr: `REG_BASE + OFFSET_REG_NR22` */
export const REG_NR22_EXPR = "REG_BASE + OFFSET_REG_NR22";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUND2CNT_H` */
export const REG_SOUND2CNT_H_EXPR = "REG_BASE + OFFSET_REG_SOUND2CNT_H";
/** Raw expr: `REG_BASE + OFFSET_REG_NR23` */
export const REG_NR23_EXPR = "REG_BASE + OFFSET_REG_NR23";
/** Raw expr: `REG_BASE + OFFSET_REG_NR24` */
export const REG_NR24_EXPR = "REG_BASE + OFFSET_REG_NR24";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUND3CNT` */
export const REG_SOUND3CNT_EXPR = "REG_BASE + OFFSET_REG_SOUND3CNT";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUND3CNT_L` */
export const REG_SOUND3CNT_L_EXPR = "REG_BASE + OFFSET_REG_SOUND3CNT_L";
/** Raw expr: `REG_BASE + OFFSET_REG_NR30` */
export const REG_NR30_EXPR = "REG_BASE + OFFSET_REG_NR30";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUND3CNT_H` */
export const REG_SOUND3CNT_H_EXPR = "REG_BASE + OFFSET_REG_SOUND3CNT_H";
/** Raw expr: `REG_BASE + OFFSET_REG_NR31` */
export const REG_NR31_EXPR = "REG_BASE + OFFSET_REG_NR31";
/** Raw expr: `REG_BASE + OFFSET_REG_NR32` */
export const REG_NR32_EXPR = "REG_BASE + OFFSET_REG_NR32";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUND3CNT_X` */
export const REG_SOUND3CNT_X_EXPR = "REG_BASE + OFFSET_REG_SOUND3CNT_X";
/** Raw expr: `REG_BASE + OFFSET_REG_NR33` */
export const REG_NR33_EXPR = "REG_BASE + OFFSET_REG_NR33";
/** Raw expr: `REG_BASE + OFFSET_REG_NR34` */
export const REG_NR34_EXPR = "REG_BASE + OFFSET_REG_NR34";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUND4CNT` */
export const REG_SOUND4CNT_EXPR = "REG_BASE + OFFSET_REG_SOUND4CNT";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUND4CNT_L` */
export const REG_SOUND4CNT_L_EXPR = "REG_BASE + OFFSET_REG_SOUND4CNT_L";
/** Raw expr: `REG_BASE + OFFSET_REG_NR41` */
export const REG_NR41_EXPR = "REG_BASE + OFFSET_REG_NR41";
/** Raw expr: `REG_BASE + OFFSET_REG_NR42` */
export const REG_NR42_EXPR = "REG_BASE + OFFSET_REG_NR42";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUND4CNT_H` */
export const REG_SOUND4CNT_H_EXPR = "REG_BASE + OFFSET_REG_SOUND4CNT_H";
/** Raw expr: `REG_BASE + OFFSET_REG_NR43` */
export const REG_NR43_EXPR = "REG_BASE + OFFSET_REG_NR43";
/** Raw expr: `REG_BASE + OFFSET_REG_NR44` */
export const REG_NR44_EXPR = "REG_BASE + OFFSET_REG_NR44";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUNDCNT` */
export const REG_SOUNDCNT_EXPR = "REG_BASE + OFFSET_REG_SOUNDCNT";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUNDCNT_L` */
export const REG_SOUNDCNT_L_EXPR = "REG_BASE + OFFSET_REG_SOUNDCNT_L";
/** Raw expr: `REG_BASE + OFFSET_REG_NR50` */
export const REG_NR50_EXPR = "REG_BASE + OFFSET_REG_NR50";
/** Raw expr: `REG_BASE + OFFSET_REG_NR51` */
export const REG_NR51_EXPR = "REG_BASE + OFFSET_REG_NR51";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUNDCNT_H` */
export const REG_SOUNDCNT_H_EXPR = "REG_BASE + OFFSET_REG_SOUNDCNT_H";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUNDCNT_X` */
export const REG_SOUNDCNT_X_EXPR = "REG_BASE + OFFSET_REG_SOUNDCNT_X";
/** Raw expr: `REG_BASE + OFFSET_REG_NR52` */
export const REG_NR52_EXPR = "REG_BASE + OFFSET_REG_NR52";
/** Raw expr: `REG_BASE + OFFSET_REG_SOUNDBIAS` */
export const REG_SOUNDBIAS_EXPR = "REG_BASE + OFFSET_REG_SOUNDBIAS";
/** Raw expr: `REG_BASE + OFFSET_REG_WAVE_RAM` */
export const REG_WAVE_RAM_EXPR = "REG_BASE + OFFSET_REG_WAVE_RAM";
/** Raw expr: `REG_BASE + OFFSET_REG_WAVE_RAM0` */
export const REG_WAVE_RAM0_EXPR = "REG_BASE + OFFSET_REG_WAVE_RAM0";
/** Raw expr: `REG_BASE + OFFSET_REG_WAVE_RAM0_L` */
export const REG_WAVE_RAM0_L_EXPR = "REG_BASE + OFFSET_REG_WAVE_RAM0_L";
/** Raw expr: `REG_BASE + OFFSET_REG_WAVE_RAM0_H` */
export const REG_WAVE_RAM0_H_EXPR = "REG_BASE + OFFSET_REG_WAVE_RAM0_H";
/** Raw expr: `REG_BASE + OFFSET_REG_WAVE_RAM1` */
export const REG_WAVE_RAM1_EXPR = "REG_BASE + OFFSET_REG_WAVE_RAM1";
/** Raw expr: `REG_BASE + OFFSET_REG_WAVE_RAM1_L` */
export const REG_WAVE_RAM1_L_EXPR = "REG_BASE + OFFSET_REG_WAVE_RAM1_L";
/** Raw expr: `REG_BASE + OFFSET_REG_WAVE_RAM1_H` */
export const REG_WAVE_RAM1_H_EXPR = "REG_BASE + OFFSET_REG_WAVE_RAM1_H";
/** Raw expr: `REG_BASE + OFFSET_REG_WAVE_RAM2` */
export const REG_WAVE_RAM2_EXPR = "REG_BASE + OFFSET_REG_WAVE_RAM2";
/** Raw expr: `REG_BASE + OFFSET_REG_WAVE_RAM2_L` */
export const REG_WAVE_RAM2_L_EXPR = "REG_BASE + OFFSET_REG_WAVE_RAM2_L";
/** Raw expr: `REG_BASE + OFFSET_REG_WAVE_RAM2_H` */
export const REG_WAVE_RAM2_H_EXPR = "REG_BASE + OFFSET_REG_WAVE_RAM2_H";
/** Raw expr: `REG_BASE + OFFSET_REG_WAVE_RAM3` */
export const REG_WAVE_RAM3_EXPR = "REG_BASE + OFFSET_REG_WAVE_RAM3";
/** Raw expr: `REG_BASE + OFFSET_REG_WAVE_RAM3_L` */
export const REG_WAVE_RAM3_L_EXPR = "REG_BASE + OFFSET_REG_WAVE_RAM3_L";
/** Raw expr: `REG_BASE + OFFSET_REG_WAVE_RAM3_H` */
export const REG_WAVE_RAM3_H_EXPR = "REG_BASE + OFFSET_REG_WAVE_RAM3_H";
/** Raw expr: `REG_BASE + OFFSET_REG_FIFO` */
export const REG_FIFO_EXPR = "REG_BASE + OFFSET_REG_FIFO";
/** Raw expr: `REG_BASE + OFFSET_REG_FIFO_A` */
export const REG_FIFO_A_EXPR = "REG_BASE + OFFSET_REG_FIFO_A";
/** Raw expr: `REG_BASE + OFFSET_REG_FIFO_A_L` */
export const REG_FIFO_A_L_EXPR = "REG_BASE + OFFSET_REG_FIFO_A_L";
/** Raw expr: `REG_BASE + OFFSET_REG_FIFO_A_H` */
export const REG_FIFO_A_H_EXPR = "REG_BASE + OFFSET_REG_FIFO_A_H";
/** Raw expr: `REG_BASE + OFFSET_REG_FIFO_B` */
export const REG_FIFO_B_EXPR = "REG_BASE + OFFSET_REG_FIFO_B";
/** Raw expr: `REG_BASE + OFFSET_REG_FIFO_B_L` */
export const REG_FIFO_B_L_EXPR = "REG_BASE + OFFSET_REG_FIFO_B_L";
/** Raw expr: `REG_BASE + OFFSET_REG_FIFO_B_H` */
export const REG_FIFO_B_H_EXPR = "REG_BASE + OFFSET_REG_FIFO_B_H";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA0` */
export const REG_DMA0_EXPR = "REG_BASE + OFFSET_REG_DMA0";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA0SAD` */
export const REG_DMA0SAD_EXPR = "REG_BASE + OFFSET_REG_DMA0SAD";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA0SAD_L` */
export const REG_DMA0SAD_L_EXPR = "REG_BASE + OFFSET_REG_DMA0SAD_L";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA0SAD_H` */
export const REG_DMA0SAD_H_EXPR = "REG_BASE + OFFSET_REG_DMA0SAD_H";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA0DAD` */
export const REG_DMA0DAD_EXPR = "REG_BASE + OFFSET_REG_DMA0DAD";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA0DAD_L` */
export const REG_DMA0DAD_L_EXPR = "REG_BASE + OFFSET_REG_DMA0DAD_L";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA0DAD_H` */
export const REG_DMA0DAD_H_EXPR = "REG_BASE + OFFSET_REG_DMA0DAD_H";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA0CNT` */
export const REG_DMA0CNT_EXPR = "REG_BASE + OFFSET_REG_DMA0CNT";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA0CNT_L` */
export const REG_DMA0CNT_L_EXPR = "REG_BASE + OFFSET_REG_DMA0CNT_L";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA0CNT_H` */
export const REG_DMA0CNT_H_EXPR = "REG_BASE + OFFSET_REG_DMA0CNT_H";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA1` */
export const REG_DMA1_EXPR = "REG_BASE + OFFSET_REG_DMA1";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA1SAD` */
export const REG_DMA1SAD_EXPR = "REG_BASE + OFFSET_REG_DMA1SAD";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA1SAD_L` */
export const REG_DMA1SAD_L_EXPR = "REG_BASE + OFFSET_REG_DMA1SAD_L";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA1SAD_H` */
export const REG_DMA1SAD_H_EXPR = "REG_BASE + OFFSET_REG_DMA1SAD_H";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA1DAD` */
export const REG_DMA1DAD_EXPR = "REG_BASE + OFFSET_REG_DMA1DAD";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA1DAD_L` */
export const REG_DMA1DAD_L_EXPR = "REG_BASE + OFFSET_REG_DMA1DAD_L";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA1DAD_H` */
export const REG_DMA1DAD_H_EXPR = "REG_BASE + OFFSET_REG_DMA1DAD_H";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA1CNT` */
export const REG_DMA1CNT_EXPR = "REG_BASE + OFFSET_REG_DMA1CNT";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA1CNT_L` */
export const REG_DMA1CNT_L_EXPR = "REG_BASE + OFFSET_REG_DMA1CNT_L";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA1CNT_H` */
export const REG_DMA1CNT_H_EXPR = "REG_BASE + OFFSET_REG_DMA1CNT_H";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA2` */
export const REG_DMA2_EXPR = "REG_BASE + OFFSET_REG_DMA2";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA2SAD` */
export const REG_DMA2SAD_EXPR = "REG_BASE + OFFSET_REG_DMA2SAD";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA2SAD_L` */
export const REG_DMA2SAD_L_EXPR = "REG_BASE + OFFSET_REG_DMA2SAD_L";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA2SAD_H` */
export const REG_DMA2SAD_H_EXPR = "REG_BASE + OFFSET_REG_DMA2SAD_H";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA2DAD` */
export const REG_DMA2DAD_EXPR = "REG_BASE + OFFSET_REG_DMA2DAD";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA2DAD_L` */
export const REG_DMA2DAD_L_EXPR = "REG_BASE + OFFSET_REG_DMA2DAD_L";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA2DAD_H` */
export const REG_DMA2DAD_H_EXPR = "REG_BASE + OFFSET_REG_DMA2DAD_H";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA2CNT` */
export const REG_DMA2CNT_EXPR = "REG_BASE + OFFSET_REG_DMA2CNT";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA2CNT_L` */
export const REG_DMA2CNT_L_EXPR = "REG_BASE + OFFSET_REG_DMA2CNT_L";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA2CNT_H` */
export const REG_DMA2CNT_H_EXPR = "REG_BASE + OFFSET_REG_DMA2CNT_H";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA3` */
export const REG_DMA3_EXPR = "REG_BASE + OFFSET_REG_DMA3";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA3SAD` */
export const REG_DMA3SAD_EXPR = "REG_BASE + OFFSET_REG_DMA3SAD";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA3SAD_L` */
export const REG_DMA3SAD_L_EXPR = "REG_BASE + OFFSET_REG_DMA3SAD_L";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA3SAD_H` */
export const REG_DMA3SAD_H_EXPR = "REG_BASE + OFFSET_REG_DMA3SAD_H";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA3DAD` */
export const REG_DMA3DAD_EXPR = "REG_BASE + OFFSET_REG_DMA3DAD";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA3DAD_L` */
export const REG_DMA3DAD_L_EXPR = "REG_BASE + OFFSET_REG_DMA3DAD_L";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA3DAD_H` */
export const REG_DMA3DAD_H_EXPR = "REG_BASE + OFFSET_REG_DMA3DAD_H";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA3CNT` */
export const REG_DMA3CNT_EXPR = "REG_BASE + OFFSET_REG_DMA3CNT";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA3CNT_L` */
export const REG_DMA3CNT_L_EXPR = "REG_BASE + OFFSET_REG_DMA3CNT_L";
/** Raw expr: `REG_BASE + OFFSET_REG_DMA3CNT_H` */
export const REG_DMA3CNT_H_EXPR = "REG_BASE + OFFSET_REG_DMA3CNT_H";
/** Raw expr: `REG_BASE + OFFSET_REG_TM0CNT` */
export const REG_TM0CNT_EXPR = "REG_BASE + OFFSET_REG_TM0CNT";
/** Raw expr: `REG_BASE + OFFSET_REG_TM0CNT_L` */
export const REG_TM0CNT_L_EXPR = "REG_BASE + OFFSET_REG_TM0CNT_L";
/** Raw expr: `REG_BASE + OFFSET_REG_TM0CNT_H` */
export const REG_TM0CNT_H_EXPR = "REG_BASE + OFFSET_REG_TM0CNT_H";
/** Raw expr: `REG_BASE + OFFSET_REG_TM1CNT` */
export const REG_TM1CNT_EXPR = "REG_BASE + OFFSET_REG_TM1CNT";
/** Raw expr: `REG_BASE + OFFSET_REG_TM1CNT_L` */
export const REG_TM1CNT_L_EXPR = "REG_BASE + OFFSET_REG_TM1CNT_L";
/** Raw expr: `REG_BASE + OFFSET_REG_TM1CNT_H` */
export const REG_TM1CNT_H_EXPR = "REG_BASE + OFFSET_REG_TM1CNT_H";
/** Raw expr: `REG_BASE + OFFSET_REG_TM2CNT` */
export const REG_TM2CNT_EXPR = "REG_BASE + OFFSET_REG_TM2CNT";
/** Raw expr: `REG_BASE + OFFSET_REG_TM2CNT_L` */
export const REG_TM2CNT_L_EXPR = "REG_BASE + OFFSET_REG_TM2CNT_L";
/** Raw expr: `REG_BASE + OFFSET_REG_TM2CNT_H` */
export const REG_TM2CNT_H_EXPR = "REG_BASE + OFFSET_REG_TM2CNT_H";
/** Raw expr: `REG_BASE + OFFSET_REG_TM3CNT` */
export const REG_TM3CNT_EXPR = "REG_BASE + OFFSET_REG_TM3CNT";
/** Raw expr: `REG_BASE + OFFSET_REG_TM3CNT_L` */
export const REG_TM3CNT_L_EXPR = "REG_BASE + OFFSET_REG_TM3CNT_L";
/** Raw expr: `REG_BASE + OFFSET_REG_TM3CNT_H` */
export const REG_TM3CNT_H_EXPR = "REG_BASE + OFFSET_REG_TM3CNT_H";
/** Raw expr: `REG_BASE + OFFSET_REG_SIOCNT` */
export const REG_SIOCNT_EXPR = "REG_BASE + OFFSET_REG_SIOCNT";
/** Raw expr: `REG_BASE + OFFSET_REG_SIODATA8` */
export const REG_SIODATA8_EXPR = "REG_BASE + OFFSET_REG_SIODATA8";
/** Raw expr: `REG_BASE + OFFSET_REG_SIODATA32` */
export const REG_SIODATA32_EXPR = "REG_BASE + OFFSET_REG_SIODATA32";
/** Raw expr: `REG_BASE + OFFSET_REG_SIOMLT_SEND` */
export const REG_SIOMLT_SEND_EXPR = "REG_BASE + OFFSET_REG_SIOMLT_SEND";
/** Raw expr: `REG_BASE + OFFSET_REG_SIOMLT_RECV` */
export const REG_SIOMLT_RECV_EXPR = "REG_BASE + OFFSET_REG_SIOMLT_RECV";
/** Raw expr: `REG_BASE + OFFSET_REG_SIOMULTI0` */
export const REG_SIOMULTI0_EXPR = "REG_BASE + OFFSET_REG_SIOMULTI0";
/** Raw expr: `REG_BASE + OFFSET_REG_SIOMULTI1` */
export const REG_SIOMULTI1_EXPR = "REG_BASE + OFFSET_REG_SIOMULTI1";
/** Raw expr: `REG_BASE + OFFSET_REG_SIOMULTI2` */
export const REG_SIOMULTI2_EXPR = "REG_BASE + OFFSET_REG_SIOMULTI2";
/** Raw expr: `REG_BASE + OFFSET_REG_SIOMULTI3` */
export const REG_SIOMULTI3_EXPR = "REG_BASE + OFFSET_REG_SIOMULTI3";
/** Raw expr: `REG_BASE + OFFSET_REG_KEYINPUT` */
export const REG_KEYINPUT_EXPR = "REG_BASE + OFFSET_REG_KEYINPUT";
/** Raw expr: `REG_BASE + OFFSET_REG_KEYCNT` */
export const REG_KEYCNT_EXPR = "REG_BASE + OFFSET_REG_KEYCNT";
/** Raw expr: `REG_BASE + OFFSET_REG_RCNT` */
export const REG_RCNT_EXPR = "REG_BASE + OFFSET_REG_RCNT";
/** Raw expr: `REG_BASE + OFFSET_REG_JOYCNT` */
export const REG_JOYCNT_EXPR = "REG_BASE + OFFSET_REG_JOYCNT";
/** Raw expr: `REG_BASE + OFFSET_REG_JOYSTAT` */
export const REG_JOYSTAT_EXPR = "REG_BASE + OFFSET_REG_JOYSTAT";
/** Raw expr: `REG_BASE + OFFSET_REG_JOY_RECV` */
export const REG_JOY_RECV_EXPR = "REG_BASE + OFFSET_REG_JOY_RECV";
/** Raw expr: `REG_BASE + OFFSET_REG_JOY_RECV_L` */
export const REG_JOY_RECV_L_EXPR = "REG_BASE + OFFSET_REG_JOY_RECV_L";
/** Raw expr: `REG_BASE + OFFSET_REG_JOY_RECV_H` */
export const REG_JOY_RECV_H_EXPR = "REG_BASE + OFFSET_REG_JOY_RECV_H";
/** Raw expr: `REG_BASE + OFFSET_REG_JOY_TRANS` */
export const REG_JOY_TRANS_EXPR = "REG_BASE + OFFSET_REG_JOY_TRANS";
/** Raw expr: `REG_BASE + OFFSET_REG_JOY_TRANS_L` */
export const REG_JOY_TRANS_L_EXPR = "REG_BASE + OFFSET_REG_JOY_TRANS_L";
/** Raw expr: `REG_BASE + OFFSET_REG_JOY_TRANS_H` */
export const REG_JOY_TRANS_H_EXPR = "REG_BASE + OFFSET_REG_JOY_TRANS_H";
/** Raw expr: `REG_BASE + OFFSET_REG_IME` */
export const REG_IME_EXPR = "REG_BASE + OFFSET_REG_IME";
/** Raw expr: `REG_BASE + OFFSET_REG_IE` */
export const REG_IE_EXPR = "REG_BASE + OFFSET_REG_IE";
/** Raw expr: `REG_BASE + OFFSET_REG_IF` */
export const REG_IF_EXPR = "REG_BASE + OFFSET_REG_IF";
/** Raw expr: `REG_BASE + OFFSET_REG_WAITCNT` */
export const REG_WAITCNT_EXPR = "REG_BASE + OFFSET_REG_WAITCNT";
export const DMA_DEST_INC = 0;
export const DMA_DEST_DEC = 32;
export const DMA_DEST_FIXED = 64;
export const DMA_DEST_RELOAD = 96;
export const DMA_SRC_INC = 0;
export const DMA_SRC_DEC = 128;
export const DMA_SRC_FIXED = 256;
export const DMA_REPEAT = 512;
export const DMA_16BIT = 0;
export const DMA_32BIT = 1024;
export const DMA_DREQ_ON = 2048;
export const DMA_START_NOW = 0;
export const DMA_START_VBLANK = 4096;
export const DMA_START_HBLANK = 8192;
export const DMA_START_SPECIAL = 12288;
export const DMA_INTR_ENABLE = 16384;
export const DMA_ENABLE = 32768;
export const OAM_OBJ_NORMAL = 0;
export const OAM_OBJ_BLEND = 1024;
export const OAM_OBJ_WINDOW = 2048;
export const OAM_AFFINE_NONE = 0;
export const OAM_AFFINE_NORMAL_SIZE = 256;
export const OAM_OBJ_DISABLED = 512;
export const OAM_AFFINE_DOUBLE_SIZE = 768;
export const OAM_MOSAIC_OFF = 0;
export const OAM_MOSAIC_ON = 4096;
export const OAM_4BPP = 0;
export const OAM_8BPP = 8192;
export const OAM_H_FLIP = 268435456;
export const OAM_V_FLIP = 536870912;
export const OAM_SQUARE = 0;
export const OAM_H_RECTANGLE = 16384;
export const OAM_V_RECTANGLE = 32768;
export const OAM_SIZE_0 = 0;
export const OAM_SIZE_1 = 1073741824;
export const OAM_SIZE_2 = 2147483648;
export const OAM_SIZE_3 = 3221225472;
/** Raw expr: `OAM_SIZE_0 | OAM_SQUARE` */
export const OAM_SIZE_8x8_EXPR = "OAM_SIZE_0 | OAM_SQUARE";
/** Raw expr: `OAM_SIZE_1 | OAM_SQUARE` */
export const OAM_SIZE_16x16_EXPR = "OAM_SIZE_1 | OAM_SQUARE";
/** Raw expr: `OAM_SIZE_2 | OAM_SQUARE` */
export const OAM_SIZE_32x32_EXPR = "OAM_SIZE_2 | OAM_SQUARE";
/** Raw expr: `OAM_SIZE_3 | OAM_SQUARE` */
export const OAM_SIZE_64x64_EXPR = "OAM_SIZE_3 | OAM_SQUARE";
/** Raw expr: `OAM_SIZE_0 | OAM_H_RECTANGLE` */
export const OAM_SIZE_16x8_EXPR = "OAM_SIZE_0 | OAM_H_RECTANGLE";
/** Raw expr: `OAM_SIZE_1 | OAM_H_RECTANGLE` */
export const OAM_SIZE_32x8_EXPR = "OAM_SIZE_1 | OAM_H_RECTANGLE";
/** Raw expr: `OAM_SIZE_2 | OAM_H_RECTANGLE` */
export const OAM_SIZE_32x16_EXPR = "OAM_SIZE_2 | OAM_H_RECTANGLE";
/** Raw expr: `OAM_SIZE_3 | OAM_H_RECTANGLE` */
export const OAM_SIZE_64x32_EXPR = "OAM_SIZE_3 | OAM_H_RECTANGLE";
/** Raw expr: `OAM_SIZE_0 | OAM_V_RECTANGLE` */
export const OAM_SIZE_8x16_EXPR = "OAM_SIZE_0 | OAM_V_RECTANGLE";
/** Raw expr: `OAM_SIZE_1 | OAM_V_RECTANGLE` */
export const OAM_SIZE_8x32_EXPR = "OAM_SIZE_1 | OAM_V_RECTANGLE";
/** Raw expr: `OAM_SIZE_2 | OAM_V_RECTANGLE` */
export const OAM_SIZE_16x32_EXPR = "OAM_SIZE_2 | OAM_V_RECTANGLE";
/** Raw expr: `OAM_SIZE_3 | OAM_V_RECTANGLE` */
export const OAM_SIZE_32x64_EXPR = "OAM_SIZE_3 | OAM_V_RECTANGLE";
/** Raw expr: `1 << 0` */
export const BLDCNT_TGT1_BG0_EXPR = "1 << 0";
/** Raw expr: `1 << 1` */
export const BLDCNT_TGT1_BG1_EXPR = "1 << 1";
/** Raw expr: `1 << 2` */
export const BLDCNT_TGT1_BG2_EXPR = "1 << 2";
/** Raw expr: `1 << 3` */
export const BLDCNT_TGT1_BG3_EXPR = "1 << 3";
/** Raw expr: `1 << 4` */
export const BLDCNT_TGT1_OBJ_EXPR = "1 << 4";
/** Raw expr: `1 << 5` */
export const BLDCNT_TGT1_BD_EXPR = "1 << 5";
/** Raw expr: `BLDCNT_TGT1_BG0 | BLDCNT_TGT1_BG1 | BLDCNT_TGT1_BG2 | BLDCNT_TGT1_BG3 | BLDCNT_TGT1_OBJ | BLDCNT_TGT1_BD` */
export const BLDCNT_TGT1_ALL_EXPR = "BLDCNT_TGT1_BG0 | BLDCNT_TGT1_BG1 | BLDCNT_TGT1_BG2 | BLDCNT_TGT1_BG3 | BLDCNT_TGT1_OBJ | BLDCNT_TGT1_BD";
/** Raw expr: `0 << 6` */
export const BLDCNT_EFFECT_NONE_EXPR = "0 << 6";
/** Raw expr: `1 << 6` */
export const BLDCNT_EFFECT_BLEND_EXPR = "1 << 6";
/** Raw expr: `2 << 6` */
export const BLDCNT_EFFECT_LIGHTEN_EXPR = "2 << 6";
/** Raw expr: `3 << 6` */
export const BLDCNT_EFFECT_DARKEN_EXPR = "3 << 6";
/** Raw expr: `1 << 8` */
export const BLDCNT_TGT2_BG0_EXPR = "1 << 8";
/** Raw expr: `1 << 9` */
export const BLDCNT_TGT2_BG1_EXPR = "1 << 9";
/** Raw expr: `1 << 10` */
export const BLDCNT_TGT2_BG2_EXPR = "1 << 10";
/** Raw expr: `1 << 11` */
export const BLDCNT_TGT2_BG3_EXPR = "1 << 11";
/** Raw expr: `1 << 12` */
export const BLDCNT_TGT2_OBJ_EXPR = "1 << 12";
/** Raw expr: `1 << 13` */
export const BLDCNT_TGT2_BD_EXPR = "1 << 13";
/** Raw expr: `BLDCNT_TGT2_BG0 | BLDCNT_TGT2_BG1 | BLDCNT_TGT2_BG2 | BLDCNT_TGT2_BG3 | BLDCNT_TGT2_OBJ | BLDCNT_TGT2_BD` */
export const BLDCNT_TGT2_ALL_EXPR = "BLDCNT_TGT2_BG0 | BLDCNT_TGT2_BG1 | BLDCNT_TGT2_BG2 | BLDCNT_TGT2_BG3 | BLDCNT_TGT2_OBJ | BLDCNT_TGT2_BD";
