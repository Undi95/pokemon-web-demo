#!/usr/bin/env node
/**
 * Extracteur du mapping graphics_id → sprite PNG pour les object_events.
 *
 * La chaîne de résolution dans le décomp :
 *   [OBJ_EVENT_GFX_XXX] = &gObjectEventGraphicsInfo_Yyy
 *   gObjectEventGraphicsInfo_Yyy.images = sPicTable_Zzz
 *   sPicTable_Zzz[0] = overworld_frame(gObjectEventPic_Www, ...)
 *   gObjectEventPic_Www = INCGFX("graphics/object_events/pics/people/xxx.png", ...)
 *
 * On parse les 4 fichiers au regex, on enchaîne et on sort un JSON simple :
 *   {
 *     "OBJ_EVENT_GFX_BOY_2": {
 *       "png": "object_events/people/boy_2.png",
 *       "frameWidth": 16,
 *       "frameHeight": 32
 *     },
 *     ...
 *   }
 *
 * Ce JSON est consommé par le runtime Phaser pour afficher chaque NPC d'une
 * map avec son bon sprite.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const dataDir = join(decompPath, 'src', 'data', 'object_events');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'object-event-graphics.json');

// --- 1. gObjectEventPic_XXX → { png, mwidth, mheight } ---
const picToFile = new Map();
{
  const text = readFileSync(join(dataDir, '..', '..', '..', 'src', 'data', 'object_events', 'object_event_graphics.h'), 'utf8');
  // Exemple :
  // const u32 gObjectEventPic_Boy2[] = INCGFX_U32("graphics/object_events/pics/people/boy_2.png", ".4bpp", "-mwidth 2 -mheight 4");
  const re = /const\s+u32\s+(\w+)\s*\[\]\s*=\s*INCGFX_U32\s*\(\s*"([^"]+\.png)"\s*,\s*"[^"]*"(?:\s*,\s*"-mwidth\s+(\d+)\s+-mheight\s+(\d+)")?\s*\)\s*;/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const [, picName, pngPath, mwStr, mhStr] = m;
    picToFile.set(picName, {
      pngPath,
      mwidth: mwStr ? Number(mwStr) : 2,
      mheight: mhStr ? Number(mhStr) : 4
    });
  }
}
console.log(`[extract-obj-events] ${picToFile.size} pics indexed`);

// --- 2. sPicTable_XXX → first pic name + macro type ---
// macro = 'overworld_frame' (= multi-frame, mwidth/mheight per frame depuis pic INCGFX)
//       | 'obj_frame_tiles' (= single frame, taille = full PNG depuis .width/.height struct).
const picTableToPic = new Map();
{
  const text = readFileSync(join(dataDir, 'object_event_pic_tables.h'), 'utf8');
  // static const struct SpriteFrameImage sPicTable_Boy2[] = {
  //     overworld_frame(gObjectEventPic_Boy2, 2, 4, 0),
  //     ...
  // };
  // Deux macros utilisées : overworld_frame(pic, w, h, idx) et obj_frame_tiles(pic).
  const re = /(?:static\s+)?const\s+struct\s+SpriteFrameImage\s+(\w+)\s*\[\]\s*=\s*\{[^}]*?(overworld_frame|obj_frame_tiles)\s*\(\s*(\w+)\s*[,)]/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const [, tableName, macro, picName] = m;
    picTableToPic.set(tableName, { picName, macro });
  }
}
console.log(`[extract-obj-events] ${picTableToPic.size} pic tables indexed`);

// --- 3. gObjectEventGraphicsInfo_XXX → .images (pic table name) ---
// Also capture frame size from .width / .height fields in the struct.
const gfxInfoToTable = new Map();
const gfxInfoToSize = new Map();
{
  const text = readFileSync(join(dataDir, 'object_event_graphics_info.h'), 'utf8');
  // const struct ObjectEventGraphicsInfo gObjectEventGraphicsInfo_Boy2 = { ... .images = sPicTable_Boy2, ... .width = 16, .height = 32, ... };
  const structRe = /const\s+struct\s+ObjectEventGraphicsInfo\s+(\w+)\s*=\s*\{([^}]+)\}\s*;/g;
  let m;
  while ((m = structRe.exec(text)) !== null) {
    const [, infoName, body] = m;
    const imagesMatch = body.match(/\.images\s*=\s*(\w+)\s*,/);
    if (imagesMatch) gfxInfoToTable.set(infoName, imagesMatch[1]);
    const widthMatch = body.match(/\.width\s*=\s*(\d+)\s*,/);
    const heightMatch = body.match(/\.height\s*=\s*(\d+)\s*,/);
    if (widthMatch && heightMatch) {
      gfxInfoToSize.set(infoName, {
        width: Number(widthMatch[1]),
        height: Number(heightMatch[1])
      });
    }
  }
}
console.log(`[extract-obj-events] ${gfxInfoToTable.size} graphics_info structs indexed`);

// --- 4. OBJ_EVENT_GFX_XXX → gObjectEventGraphicsInfo_YYY ---
const gfxIdToInfo = new Map();
{
  const text = readFileSync(join(dataDir, 'object_event_graphics_info_pointers.h'), 'utf8');
  // [OBJ_EVENT_GFX_BOY_2] = &gObjectEventGraphicsInfo_Boy2,
  const re = /\[(OBJ_EVENT_GFX_\w+)\]\s*=\s*&(\w+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    gfxIdToInfo.set(m[1], m[2]);
  }
}
console.log(`[extract-obj-events] ${gfxIdToInfo.size} graphics_id entries indexed`);

// --- 5. Combine ---
const result = {};
let resolved = 0;
const unresolved = [];
for (const [gfxId, infoName] of gfxIdToInfo) {
  const tableName = gfxInfoToTable.get(infoName);
  if (!tableName) { unresolved.push(`${gfxId}: missing info for ${infoName}`); continue; }
  const tableEntry = picTableToPic.get(tableName);
  if (!tableEntry) { unresolved.push(`${gfxId}: missing pic for table ${tableName}`); continue; }
  const { picName, macro } = tableEntry;
  const pic = picToFile.get(picName);
  if (!pic) { unresolved.push(`${gfxId}: missing PNG for pic ${picName}`); continue; }

  // Strip the "graphics/object_events/pics/" prefix so the path matches our
  // extracted asset layout (public/decomp/em/object_events/...).
  const rel = pic.pngPath.replace(/^graphics\/object_events\/pics\//, 'object_events/');
  const size = gfxInfoToSize.get(infoName);
  // 1:1 décomp `obj_frame_tiles(pic)` macro = single frame, taille = full PNG
  // (= depuis .width/.height struct, pas depuis INCGFX -mwidth/-mheight).
  // Ex : truck PNG 48×48 = 1 frame inanimate. Sans cette détection, l'extractor
  // assumait mwidth=2/mheight=4 (= défauts INCGFX) → frameWidth=16, faux.
  //
  // GOTCHA : ne PAS substituer naïvement size→frame pour les sprites animés
  // (overworld_frame). Beaucoup de NPCs ont .width/.height = taille DISPLAY
  // au runtime (= 16×32 standard) MAIS frame size = 16×32 par mwidth/mheight,
  // donc le résultat est identique. Pour les sprites SPECIAL (= taille
  // non-standard comme truck 48×48), on doit utiliser size.
  //
  // Heuristique : appliquer size→frame UNIQUEMENT si :
  //   1. macro === 'obj_frame_tiles' (= single frame, pas d'anim).
  //   2. ET size.width/height differs de pic.mwidth*8/mheight*8 (= sinon = no-op).
  // Sinon : keep INCGFX defaults pour ne pas casser les NPCs anim standard.
  const isSingleFrame = macro === 'obj_frame_tiles';
  const incgfxWidth = pic.mwidth * 8;
  const incgfxHeight = pic.mheight * 8;
  const sizeDifferent = size && (size.width !== incgfxWidth || size.height !== incgfxHeight);
  const useSize = isSingleFrame && sizeDifferent;
  const frameWidth = useSize ? size.width : incgfxWidth;
  const frameHeight = useSize ? size.height : incgfxHeight;
  result[gfxId] = {
    png: rel,
    frameWidth,
    frameHeight,
    displayWidth: size?.width ?? frameWidth,
    displayHeight: size?.height ?? frameHeight
  };
  resolved++;
}

writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(`\n[extract-obj-events] ${resolved} graphics_id → PNG resolved, ${unresolved.length} unresolved.`);
if (unresolved.length) {
  console.log('First 5 unresolved:');
  unresolved.slice(0, 5).forEach(u => console.log(`  - ${u}`));
}
console.log(`\nWritten: ${outPath}`);
