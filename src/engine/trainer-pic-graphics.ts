/**
 * trainer-pic-graphics.ts
 * ────────────────────────
 * 1:1 décomp `data/trainer_graphics/front_pic_tables.h` consumer.
 *
 * Foundation pour battle scenes (= Phase 4) qui spawn trainer pics 64x64 :
 *   - Front pic (= adversaire visible at battle start, slides in)
 *   - Back pic (= protagoniste in battle UI, animated when sending out mon)
 *
 * Pattern :
 *   `TRAINER_PIC_X` (= trainer pic enum constant)
 *      → gTrainerFrontPicTable[X] / gTrainerFrontPicPaletteTable[X]
 *      → CompressedSpriteSheet { data: gTrainerFrontPic_X, size: 0x800, tag: X }
 *      → CompressedSpritePalette { data: gTrainerPalette_X, tag: X }
 *
 *   GetTrainerFrontPicInfo(picId) → { gfxSymbol, palSymbol }
 *   CreateTrainerSpriteFromIndex(picId, x, y, subPriority, buffer)
 *      → Load sheet + palette + create 64x64 affine-able sprite
 *
 * Décomp refs :
 *   - data/trainer_graphics/front_pic_tables.h : gTrainerFrontPicTable
 *   - src/field_effect.c:888 CreateTrainerSprite
 *   - src/data/text/facility_class_names.h : facility class names
 *   - src/data/pokemon/trainer_class_lookups.h : facility class → pic index
 *
 * Note : Birch speech sprite (= AddNewGameBirchObject in main-menu-impl.ts)
 * uses sNewGameBirch_Gfx custom 64x64 sheet, NOT the gTrainerFrontPicTable.
 * Birch speech reste sur son path one-off ; ce framework concerne les
 * trainer pics de battle exclusivement.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

/** Per-trainer-pic graphics + palette mapping.
 *  1:1 décomp struct CompressedSpriteSheet (= for gfx) + CompressedSpritePalette. */
export interface TrainerPicInfo {
  /** Décomp gfx symbol (= e.g. 'gTrainerFrontPic_AquaGruntMale'). */
  gfxSymbol: string;
  /** Décomp palette symbol (= e.g. 'gTrainerPalette_AquaGruntMale'). */
  palSymbol: string;
  /** Frame size in bytes. Standard trainer pic = 0x800 (= 64x64 = 64 tiles × 32 bytes). */
  frameSize: number;
}

// ─── Registry ───────────────────────────────────────────────────────────────

const _trainerPicRegistry = new Map<number, TrainerPicInfo>();
const _trainerPicByName = new Map<string, number>();  // TRAINER_PIC_X → numerical id

/** Register a trainer pic info entry. Called au module load via
 *  hydration depuis le generated data file. */
export function registerTrainerPic(picId: number, picName: string, info: TrainerPicInfo): void {
  _trainerPicRegistry.set(picId, info);
  _trainerPicByName.set(picName, picId);
}

/** Lookup trainer pic info by picId. Returns undefined if unregistered. */
export function GetTrainerFrontPicInfo(picId: number): TrainerPicInfo | undefined {
  return _trainerPicRegistry.get(picId);
}

/** Lookup trainer pic id par TRAINER_PIC_X identifier (= string form).
 *  Bridge depuis les générated data files qui usent string keys. */
export function GetTrainerPicIdByName(name: string): number | undefined {
  return _trainerPicByName.get(name);
}

/** Total trainer pics registered (= pour debug + size validation). */
export function GetRegisteredTrainerPicCount(): number {
  return _trainerPicRegistry.size;
}

// ─── Async hydration depuis le generated data file ─────────────────────────
//
// Le data file contient les entries string-form (= TRAINER_PIC_X identifier
// + gTrainerFrontPic_X gfx symbol). On résout les TRAINER_PIC_X à des numerical
// IDs au load via une lookup auto-incrémentée (= 0, 1, 2, ... dans l'ordre).
// Ça matche l'ordre du décomp (= les entries sont indexées par enum value).

let _hydrated = false;
async function _hydrateFromGeneratedData(): Promise<void> {
  if (_hydrated) return;
  _hydrated = true;
  try {
    const tablesMod = await import('./decomp-data/auto/src/trainer-pic-tables-data');
    const gfxEntries = tablesMod.RAW_TRAINER_FRONT_PIC_GFX;
    const palEntries = tablesMod.RAW_TRAINER_FRONT_PIC_PAL;
    // Build pal lookup by trainer pic name (= string).
    const palByName = new Map<string, string>();
    for (const [picName, palSymbol] of palEntries) {
      palByName.set(picName, palSymbol);
    }
    // Register each gfx entry with matching pal. Numerical ID = index in array.
    let id = 0;
    for (const [picName, gfxSymbol] of gfxEntries) {
      const palSymbol = palByName.get(picName) ?? '';
      registerTrainerPic(id, picName, {
        gfxSymbol,
        palSymbol,
        frameSize: 0x800,  // Standard trainer pic size
      });
      id++;
    }
    if (gfxEntries.length > 0) {
      console.log(`[trainer-pic-graphics] hydrated ${gfxEntries.length} trainer pics from extracted data`);
    }
  } catch {
    // Generated file missing / empty / malformed → graceful fallback (= empty
    // registry). Phase 4 battle scenes peuvent register manually leur trainer
    // pics au boot.
  }
}
// Fire-and-forget hydration au module load.
void _hydrateFromGeneratedData();
