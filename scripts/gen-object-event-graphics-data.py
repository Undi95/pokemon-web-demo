#!/usr/bin/env python3
"""
Génère object-event-graphics-info-data.ts à partir des sources décomp 1:1 STRICT.

Sources :
  D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_pic_tables.h
  D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_graphics_info.h
  D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_graphics_info_pointers.h
"""

import re
import sys

DECOMP_BASE = "D:/Projet 1/decomps/pokeemeraude/src/data/object_events"
PIC_TABLES = f"{DECOMP_BASE}/object_event_pic_tables.h"
BERRY_TABLES = f"{DECOMP_BASE}/berry_tree_graphics_tables.h"
GRAPHICS_INFO = f"{DECOMP_BASE}/object_event_graphics_info.h"
POINTERS = f"{DECOMP_BASE}/object_event_graphics_info_pointers.h"

OUTPUT_TS = "D:/Projet 1/pokemon-web-demo/src/engine/object-event-graphics-info-data.ts"

# ─── Parse pic_tables.h ────────────────────────────────────────────────────────
# Chaque table : `static const struct SpriteFrameImage sPicTable_X[] = { overworld_frame(gObjectEventPic_Y, W, H, FRAME), ... };`

def parse_pic_tables():
    with open(PIC_TABLES, "r") as f:
        content = f.read()
    # Inclure aussi berry_tree_graphics_tables.h pour sPicTable_PechaBerryTree
    with open(BERRY_TABLES, "r") as f:
        content += "\n" + f.read()

    # Trouve toutes les tables `sPicTable_X[] = { ... };`
    table_re = re.compile(
        r'static\s+const\s+struct\s+SpriteFrameImage\s+sPicTable_(\w+)\[\]\s*=\s*\{(.*?)\};',
        re.DOTALL
    )
    frame_re = re.compile(
        r'overworld_frame\(\s*(gObjectEventPic_\w+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)'
    )

    tables = {}
    for m in table_re.finditer(content):
        name = m.group(1)
        body = m.group(2)
        frames = []
        for fm in frame_re.finditer(body):
            frames.append({
                'pic': fm.group(1),
                'width': int(fm.group(2)),
                'height': int(fm.group(3)),
                'frame': int(fm.group(4)),
            })
        tables[name] = frames
    return tables

# ─── Parse graphics_info.h ─────────────────────────────────────────────────────
# Chaque record : `const struct ObjectEventGraphicsInfo gObjectEventGraphicsInfo_X = { .field = value, ... };`

def parse_graphics_info():
    with open(GRAPHICS_INFO, "r") as f:
        content = f.read()

    rec_re = re.compile(
        r'const\s+struct\s+ObjectEventGraphicsInfo\s+gObjectEventGraphicsInfo_(\w+)\s*=\s*\{(.*?)\};',
        re.DOTALL
    )
    field_re = re.compile(r'\.(\w+)\s*=\s*([^,\n}]+?)(?:,|\n|$)')

    records = []
    for m in rec_re.finditer(content):
        name = m.group(1)
        body = m.group(2)
        fields = {}
        for fm in field_re.finditer(body):
            key = fm.group(1).strip()
            val = fm.group(2).strip().rstrip(',').strip()
            fields[key] = val
        records.append({'name': name, 'fields': fields})
    return records

# ─── Parse pointers.h ──────────────────────────────────────────────────────────
# `[OBJ_EVENT_GFX_X] = &gObjectEventGraphicsInfo_Y,`

def parse_pointers():
    with open(POINTERS, "r") as f:
        content = f.read()

    ptr_re = re.compile(r'\[(OBJ_EVENT_GFX_\w+)\]\s*=\s*&gObjectEventGraphicsInfo_(\w+)')
    pointers = []
    for m in ptr_re.finditer(content):
        pointers.append((m.group(1), m.group(2)))
    return pointers

# ─── Convertit C enum → TS code ────────────────────────────────────────────────

def c_to_ts_val(c_val: str) -> str:
    """Convertit une valeur C 1:1 décomp vers TS literal."""
    c_val = c_val.strip().rstrip(',').strip()
    # TRUE / FALSE
    if c_val == "TRUE":
        return "1"
    if c_val == "FALSE":
        return "0"
    # Hex/dec literals — passent tels quels
    return c_val

# OAM lookup : `&gObjectEventBaseOam_X` → identifier TS
def parse_oam(c_val: str) -> str:
    c_val = c_val.strip().rstrip(',').strip()
    if c_val.startswith("&"):
        return c_val[1:]
    return c_val

# ─── Génération TS ─────────────────────────────────────────────────────────────

def gen_ts(pic_tables, records, pointers):
    # Identifie tous les PAL_TAG distinctes utilisés
    pal_tags = set()
    base_oams = set()
    for r in records:
        f = r['fields']
        if 'paletteTag' in f:
            pal_tags.add(f['paletteTag'])
        if 'reflectionPaletteTag' in f:
            pal_tags.add(f['reflectionPaletteTag'])
        if 'oam' in f:
            base_oams.add(parse_oam(f['oam']))

    # Identifie tous les "pic" symbols utilisés (= les gObjectEventPic_X)
    pic_symbols = set()
    for name, frames in pic_tables.items():
        for frm in frames:
            pic_symbols.add(frm['pic'])

    lines = []
    lines.append("/**")
    lines.append(" * object-event-graphics-info-data.ts — Port 1:1 STRICT décomp pure.")
    lines.append(" *")
    lines.append(" * Sources uniques de vérité (= ne JAMAIS diverger) :")
    lines.append(" *   D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_pic_tables.h")
    lines.append(" *   D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_graphics_info.h")
    lines.append(" *   D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_graphics_info_pointers.h")
    lines.append(" *")
    lines.append(" * Généré automatiquement. Si le décomp change : régénérer via gen_graphics_data.py.")
    lines.append(" *")
    lines.append(" * Pattern : chaque graphicsInfo record du décomp devient une factory function")
    lines.append(" * `build_gObjectEventGraphicsInfo_X(pic: Uint8Array)` qui prend les bytes raw")
    lines.append(" * du PNG décompressé et retourne la struct complète 1:1.")
    lines.append(" *")
    lines.append(" * subspriteTables/anims/affineAnims = null (= ports différés vers structs séparées).")
    lines.append(" * Au consumer du record : utiliser SetSubspriteTables, StartSpriteAnim depuis")
    lines.append(" * les structs encore non-portées via le port engine existant.")
    lines.append(" */")
    lines.append("")
    lines.append("import type { ObjectEventGraphicsInfo, SpriteFrameImage } from './object-event-graphics-info';")
    lines.append("import {")
    lines.append("  overworld_frame,")
    lines.append("  TAG_NONE,")
    lines.append("  OBJ_EVENT_PAL_TAG_BRENDAN,")
    lines.append("  OBJ_EVENT_PAL_TAG_BRENDAN_REFLECTION,")
    lines.append("  OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,")
    lines.append("  OBJ_EVENT_PAL_TAG_NPC_1,")
    lines.append("  OBJ_EVENT_PAL_TAG_NPC_2,")
    lines.append("  OBJ_EVENT_PAL_TAG_NPC_3,")
    lines.append("  OBJ_EVENT_PAL_TAG_NPC_4,")
    lines.append("  OBJ_EVENT_PAL_TAG_NPC_1_REFLECTION,")
    lines.append("  OBJ_EVENT_PAL_TAG_NPC_2_REFLECTION,")
    lines.append("  OBJ_EVENT_PAL_TAG_NPC_3_REFLECTION,")
    lines.append("  OBJ_EVENT_PAL_TAG_NPC_4_REFLECTION,")
    lines.append("  OBJ_EVENT_PAL_TAG_QUINTY_PLUMP,")
    lines.append("  OBJ_EVENT_PAL_TAG_QUINTY_PLUMP_REFLECTION,")
    lines.append("  OBJ_EVENT_PAL_TAG_TRUCK,")
    lines.append("  OBJ_EVENT_PAL_TAG_VIGOROTH,")
    lines.append("  OBJ_EVENT_PAL_TAG_ZIGZAGOON,")
    lines.append("  OBJ_EVENT_PAL_TAG_MAY,")
    lines.append("  OBJ_EVENT_PAL_TAG_MAY_REFLECTION,")
    lines.append("  OBJ_EVENT_PAL_TAG_MOVING_BOX,")
    lines.append("  OBJ_EVENT_PAL_TAG_CABLE_CAR,")
    lines.append("  OBJ_EVENT_PAL_TAG_SSTIDAL,")
    lines.append("  OBJ_EVENT_PAL_TAG_PLAYER_UNDERWATER,")
    lines.append("  OBJ_EVENT_PAL_TAG_KYOGRE,")
    lines.append("  OBJ_EVENT_PAL_TAG_KYOGRE_REFLECTION,")
    lines.append("  OBJ_EVENT_PAL_TAG_GROUDON,")
    lines.append("  OBJ_EVENT_PAL_TAG_GROUDON_REFLECTION,")
    lines.append("  OBJ_EVENT_PAL_TAG_UNUSED,")
    lines.append("  OBJ_EVENT_PAL_TAG_SUBMARINE_SHADOW,")
    lines.append("  OBJ_EVENT_PAL_TAG_POOCHYENA,")
    lines.append("  OBJ_EVENT_PAL_TAG_RED_LEAF,")
    lines.append("  OBJ_EVENT_PAL_TAG_DEOXYS,")
    lines.append("  OBJ_EVENT_PAL_TAG_BIRTH_ISLAND_STONE,")
    lines.append("  OBJ_EVENT_PAL_TAG_HO_OH,")
    lines.append("  OBJ_EVENT_PAL_TAG_LUGIA,")
    lines.append("  OBJ_EVENT_PAL_TAG_RS_BRENDAN,")
    lines.append("  OBJ_EVENT_PAL_TAG_RS_MAY,")
    lines.append("  OBJ_EVENT_PAL_TAG_NONE,")
    lines.append("  PALSLOT_PLAYER,")
    lines.append("  PALSLOT_NPC_1,")
    lines.append("  PALSLOT_NPC_2,")
    lines.append("  PALSLOT_NPC_3,")
    lines.append("  PALSLOT_NPC_4,")
    lines.append("  PALSLOT_NPC_SPECIAL,")
    lines.append("  SHADOW_SIZE_S,")
    lines.append("  SHADOW_SIZE_M,")
    lines.append("  SHADOW_SIZE_L,")
    lines.append("  SHADOW_SIZE_XL,")
    lines.append("  TRACKS_NONE,")
    lines.append("  TRACKS_FOOT,")
    lines.append("  TRACKS_BIKE_TIRE,")
    lines.append("  TRACKS_SLITHER,")
    lines.append("} from './object-event-graphics-info';")
    lines.append("import {")
    for oam in sorted(base_oams):
        lines.append(f"  {oam},")
    lines.append("} from './object-event-base-oam';")
    lines.append("")
    lines.append("// ─── sPicTable_* builders 1:1 décomp pic_tables.h ───────────────────────────")
    lines.append("")

    # Pour chaque pic table, on collecte les pic symbols requis.
    # Note : certaines tables utilisent plusieurs symboles (ex sPicTable_BrendanNormal
    # = BrendanNormal + BrendanRunning). On génère une signature multi-arg.

    # Map pic_table_name -> list of unique pic symbols (in order of first occurrence)
    pic_tables_args = {}
    for name, frames in pic_tables.items():
        unique_pics = []
        seen = set()
        for frm in frames:
            if frm['pic'] not in seen:
                seen.add(frm['pic'])
                unique_pics.append(frm['pic'])
        pic_tables_args[name] = unique_pics

    for name, frames in pic_tables.items():
        unique_pics = pic_tables_args[name]
        # Convert PascalCase pic symbol name to camelCase arg
        args = [(p, p[0].lower() + p[1:]) for p in unique_pics]
        arg_str = ", ".join(f"{a}: Uint8Array" for _, a in args)
        lines.append(f"export function build_sPicTable_{name}({arg_str}): SpriteFrameImage[] {{")
        lines.append("  return [")
        # Map pic name -> arg name
        pic_to_arg = {p: a for p, a in args}
        for frm in frames:
            arg = pic_to_arg[frm['pic']]
            lines.append(f"    overworld_frame({arg}, {frm['width']}, {frm['height']}, {frm['frame']}),")
        lines.append("  ];")
        lines.append("}")
        lines.append("")

    # ─── graphicsInfo factories ───────────────────────────────────────────────
    lines.append("// ─── gObjectEventGraphicsInfo_* factories 1:1 décomp graphics_info.h ───────")
    lines.append("")

    for r in records:
        name = r['name']
        f = r['fields']

        # Trouve la table associée. Conv : tableName = name dans la plupart des cas
        # mais peut-être autre (= regarde f['images'])
        if 'images' in f:
            images_val = f['images'].strip()
            # `sPicTable_X` → X
            mref = re.match(r'sPicTable_(\w+)', images_val)
            if mref:
                table_name = mref.group(1)
            else:
                table_name = name  # fallback
        else:
            table_name = name

        # Arg list pour la factory : on prend les pic symbols du pic_table requis
        if table_name in pic_tables_args:
            unique_pics = pic_tables_args[table_name]
            args = [(p, p[0].lower() + p[1:]) for p in unique_pics]
            arg_str = ", ".join(f"{a}: Uint8Array" for _, a in args)
            images_args = ", ".join(a for _, a in args)
            images_call = f"build_sPicTable_{table_name}({images_args})"
        else:
            # Table introuvable : signaler
            arg_str = "/* MISSING_TABLE */"
            images_call = "[] /* MISSING_TABLE */"

        lines.append(f"export function build_gObjectEventGraphicsInfo_{name}({arg_str}): ObjectEventGraphicsInfo {{")
        lines.append("  return {")
        lines.append(f"    tileTag: {c_to_ts_val(f.get('tileTag', 'TAG_NONE'))},")
        lines.append(f"    paletteTag: {c_to_ts_val(f.get('paletteTag', 'OBJ_EVENT_PAL_TAG_NONE'))},")
        lines.append(f"    reflectionPaletteTag: {c_to_ts_val(f.get('reflectionPaletteTag', 'OBJ_EVENT_PAL_TAG_NONE'))},")
        lines.append(f"    size: {c_to_ts_val(f.get('size', '0'))},")
        lines.append(f"    width: {c_to_ts_val(f.get('width', '16'))},")
        lines.append(f"    height: {c_to_ts_val(f.get('height', '32'))},")
        lines.append(f"    paletteSlot: {c_to_ts_val(f.get('paletteSlot', 'PALSLOT_NPC_1'))},")
        lines.append(f"    shadowSize: {c_to_ts_val(f.get('shadowSize', 'SHADOW_SIZE_M'))},")
        lines.append(f"    inanimate: {c_to_ts_val(f.get('inanimate', 'FALSE'))},")
        lines.append(f"    disableReflectionPaletteLoad: {c_to_ts_val(f.get('disableReflectionPaletteLoad', 'FALSE'))},")
        lines.append(f"    tracks: {c_to_ts_val(f.get('tracks', 'TRACKS_FOOT'))},")
        lines.append(f"    oam: {parse_oam(f.get('oam', '&gObjectEventBaseOam_16x32'))},")
        lines.append("    subspriteTables: null,")
        lines.append("    anims: null,")
        lines.append(f"    images: {images_call},")
        lines.append("    affineAnims: null,")
        lines.append("  };")
        lines.append("}")
        lines.append("")

    # ─── gObjectEventGraphicsInfoPointers ─────────────────────────────────────
    lines.append("// ─── gObjectEventGraphicsInfoPointers 1:1 décomp pointers.h ────────────────")
    lines.append("// Mapping graphicsId (string enum) → factory function.")
    lines.append("// Le décomp utilise `[OBJ_EVENT_GFX_X] = &gObjectEventGraphicsInfo_Y` syntax,")
    lines.append("// porté en TS comme un Record<string, factory>.")
    lines.append("")
    lines.append("export type GraphicsInfoFactory = (...pics: Uint8Array[]) => ObjectEventGraphicsInfo;")
    lines.append("")
    lines.append("export const gObjectEventGraphicsInfoPointers: Record<string, GraphicsInfoFactory> = {")
    for (gfx_id, info_name) in pointers:
        lines.append(f"  {gfx_id}: build_gObjectEventGraphicsInfo_{info_name} as GraphicsInfoFactory,")
    lines.append("};")
    lines.append("")

    # ─── Mauville Old Man pointers ────────────────────────────────────────────
    # On parse aussi gMauvilleOldManGraphicsInfoPointers depuis pointers.h.
    with open(POINTERS, "r") as f:
        content = f.read()
    mauville_re = re.compile(r'gMauvilleOldManGraphicsInfoPointers\[\]\s*=\s*\{(.*?)\};', re.DOTALL)
    mm = mauville_re.search(content)
    if mm:
        mauville_entries = []
        for me in re.finditer(r'\[(MAUVILLE_MAN_\w+)\]\s*=\s*&gObjectEventGraphicsInfo_(\w+)', mm.group(1)):
            mauville_entries.append((me.group(1), me.group(2)))
        lines.append("/** 1:1 décomp `gMauvilleOldManGraphicsInfoPointers` (pointers.h:491-499). */")
        lines.append("export const gMauvilleOldManGraphicsInfoPointers: Record<string, GraphicsInfoFactory> = {")
        for (mm_id, info_name) in mauville_entries:
            lines.append(f"  {mm_id}: build_gObjectEventGraphicsInfo_{info_name} as GraphicsInfoFactory,")
        lines.append("};")
        lines.append("")

    # ─── GetObjectEventGraphicsInfo ────────────────────────────────────────────
    lines.append("// ─── GetObjectEventGraphicsInfo 1:1 décomp event_object_movement.c:1538-1541 ─")
    lines.append("/**")
    lines.append(" *  1:1 décomp `GetObjectEventGraphicsInfo` (event_object_movement.c:1538-1541) :")
    lines.append(" *    const struct ObjectEventGraphicsInfo *GetObjectEventGraphicsInfo(u16 graphicsId)")
    lines.append(" *    {")
    lines.append(" *        if (graphicsId >= OBJ_EVENT_GFX_VARS)")
    lines.append(" *            graphicsId = VarGetObjectEventGraphicsId(graphicsId - OBJ_EVENT_GFX_VARS);")
    lines.append(" *        if (graphicsId >= NUM_OBJ_EVENT_GFX)")
    lines.append(" *            graphicsId = OBJ_EVENT_GFX_NINJA_BOY;")
    lines.append(" *        return gObjectEventGraphicsInfoPointers[graphicsId];")
    lines.append(" *    }")
    lines.append(" *")
    lines.append(" *  Notre port prend des string enum (= graphicsId TS), pas de u16 numeric.")
    lines.append(" *  Les caller passe les pics via un dispatch externe (les pics sont chargés")
    lines.append(" *  async PNG → loadTileBin → Uint8Array).")
    lines.append(" */")
    lines.append("export function GetObjectEventGraphicsInfo(")
    lines.append("  graphicsId: string,")
    lines.append("  ...pics: Uint8Array[]")
    lines.append("): ObjectEventGraphicsInfo | null {")
    lines.append("  const factory = gObjectEventGraphicsInfoPointers[graphicsId];")
    lines.append("  if (!factory) return null;")
    lines.append("  return factory(...pics);")
    lines.append("}")
    lines.append("")

    return "\n".join(lines)

# ─── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("Parsing pic_tables.h...", file=sys.stderr)
    pic_tables = parse_pic_tables()
    print(f"  -> {len(pic_tables)} tables", file=sys.stderr)

    print("Parsing graphics_info.h...", file=sys.stderr)
    records = parse_graphics_info()
    print(f"  -> {len(records)} records", file=sys.stderr)

    print("Parsing pointers.h...", file=sys.stderr)
    pointers = parse_pointers()
    print(f"  -> {len(pointers)} pointers", file=sys.stderr)

    print("Generating TS...", file=sys.stderr)
    ts_content = gen_ts(pic_tables, records, pointers)

    with open(OUTPUT_TS, "w", encoding="utf-8") as f:
        f.write(ts_content)
    print(f"Written {OUTPUT_TS}", file=sys.stderr)

    # Vérif : combien de records sans table ?
    table_names = set(pic_tables.keys())
    missing_tables = []
    for r in records:
        f = r['fields']
        if 'images' in f:
            mref = re.match(r'sPicTable_(\w+)', f['images'].strip())
            if mref and mref.group(1) not in table_names:
                missing_tables.append((r['name'], mref.group(1)))
    print(f"Records with missing tables: {len(missing_tables)}", file=sys.stderr)
    for n, t in missing_tables[:10]:
        print(f"  - {n} (table={t})", file=sys.stderr)

    # Vérif paletteTag uniques
    pal_tags = set()
    for r in records:
        f = r['fields']
        if 'paletteTag' in f:
            pal_tags.add(f['paletteTag'])
        if 'reflectionPaletteTag' in f:
            pal_tags.add(f['reflectionPaletteTag'])
    print(f"Unique paletteTags: {sorted(pal_tags)}", file=sys.stderr)

    # Vérif oam uniques
    oams = set()
    for r in records:
        if 'oam' in r['fields']:
            oams.add(parse_oam(r['fields']['oam']))
    print(f"Unique oams: {sorted(oams)}", file=sys.stderr)

if __name__ == "__main__":
    main()
