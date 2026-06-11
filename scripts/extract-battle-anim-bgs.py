# -*- coding: utf-8 -*-
"""CHANTIER BG ANIM : les ~27 backgrounds de gBattleAnimBackgroundTable.
Parse la table (src/data/battle_anim.h) + le mapping symbole->fichier
(graphics.c), convertit png 4bpp -> .4bpp.bin + .gbapal, copie le tilemap
.bin brut, emet public/decomp/em/battle_anims/anim-bg-manifest.json
{bgId: {image, pal, tilemap, name}}.
"""
import struct, zlib, io, os, re, json, shutil

DECOMP = r'D:/Projet 1/decomps/pokeemeraude'
OUT = 'public/decomp/em/battle_anims/backgrounds'
os.makedirs(OUT, exist_ok=True)

def png_to_4bpp_pal(src):
    d = io.open(src, 'rb').read()
    pos = 8; idat = b''; w = h = 0; plte = None
    while pos < len(d):
        ln, typ = struct.unpack('>I4s', d[pos:pos+8])
        chunk = d[pos+8:pos+8+ln]
        if typ == b'IHDR':
            w, h, bd, ct, comp, filt, inter = struct.unpack('>IIBBBBB', chunk)
            if bd != 4:
                return None, None, 'bd%d' % bd
        elif typ == b'PLTE':
            plte = [(chunk[i], chunk[i+1], chunk[i+2]) for i in range(0, min(ln, 48), 3)]
        elif typ == b'IDAT':
            idat += chunk
        pos += 12 + ln
    raw = zlib.decompress(idat)
    stride = (w * 4 + 7) // 8
    rows = []; prev = bytearray(stride); p = 0
    for y in range(h):
        f = raw[p]; p += 1
        line = bytearray(raw[p:p+stride]); p += stride
        if f == 1:
            for i in range(1, stride): line[i] = (line[i] + line[i-1]) & 0xFF
        elif f == 2:
            for i in range(stride): line[i] = (line[i] + prev[i]) & 0xFF
        elif f == 3:
            for i in range(stride):
                a = line[i-1] if i > 0 else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 0xFF
        elif f == 4:
            for i in range(stride):
                a = line[i-1] if i > 0 else 0
                b = prev[i]; c = prev[i-1] if i > 0 else 0
                pp = a + b - c
                pa, pb, pc = abs(pp-a), abs(pp-b), abs(pp-c)
                pred = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pred) & 0xFF
        rows.append(bytes(line)); prev = line
    px = [[0]*w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            b = rows[y][x >> 1]
            px[y][x] = (b >> 4) & 0xF if (x & 1) == 0 else b & 0xF
    out = bytearray()
    for ty in range(h // 8):
        for tx in range(w // 8):
            for yy in range(8):
                for xx in range(0, 8, 2):
                    out.append(px[ty*8+yy][tx*8+xx] | (px[ty*8+yy][tx*8+xx+1] << 4))
    pal = bytearray()
    cols = plte or []
    for i in range(16):
        r, g, b = cols[i] if i < len(cols) else (0, 0, 0)
        pal += struct.pack('<H', (r >> 3) | ((g >> 3) << 5) | ((b >> 3) << 10))
    return bytes(out), bytes(pal), None

# 1) mapping symbole -> fichier (graphics.c)
gfx_src = io.open(os.path.join(DECOMP, 'src/graphics.c'), encoding='utf-8', errors='ignore').read()
sym2file = {}
for m in re.finditer(r'const u32 (gBattleAnimBg\w+)\[\] = INCGFX_U32\("([^"]+)"', gfx_src):
    sym2file[m.group(1)] = m.group(2)
for m in re.finditer(r'const u32 (gBattleAnimBg\w+)\[\] = INCBIN_U32\("([^"]+?)(?:\.4bpp)?(?:\.gbapal)?\.lz"\)', gfx_src):
    sym2file.setdefault(m.group(1), m.group(2))
print('bg syms:', len(sym2file))

# 2) la table (battle_anim.h) + les noms BG_* (constants)
h_src = io.open(os.path.join(DECOMP, 'src/data/battle_anim.h'), encoding='utf-8', errors='ignore').read()
entries = re.findall(r'\[(BG_\w+)\]\s*=\s*\{(\w+),\s*(\w+),\s*(\w+)\}', h_src)
const_src = io.open(os.path.join(DECOMP, 'include/constants/battle_anim.h'), encoding='utf-8', errors='ignore').read()
bgval = {m.group(1): int(m.group(2)) for m in re.finditer(r'#define (BG_\w+)\s+(\d+)', const_src)}
print('table entries:', len(entries))

# 3) conversion + manifest
manifest = {}
done_files = {}
errors = []
for bgname, img_sym, pal_sym, map_sym in entries:
    bid = bgval.get(bgname)
    if bid is None:
        errors.append(bgname + ' (pas de valeur)')
        continue
    img_rel = sym2file.get(img_sym)
    map_rel = sym2file.get(map_sym)
    if not img_rel or not map_rel:
        errors.append(bgname + ' (sym manquant)')
        continue
    base = os.path.splitext(os.path.basename(img_rel))[0]
    # image+pal (une fois par fichier source)
    if img_rel not in done_files:
        tiles, pal, err = png_to_4bpp_pal(os.path.join(DECOMP, img_rel))
        if err:
            errors.append(bgname + ' (' + err + ')')
            continue
        io.open(os.path.join(OUT, base + '.4bpp.bin'), 'wb').write(tiles)
        io.open(os.path.join(OUT, base + '.gbapal'), 'wb').write(pal)
        done_files[img_rel] = base
    # tilemap : copie brute du .bin
    map_base = os.path.splitext(os.path.basename(map_rel))[0]
    map_out = map_base + '.map.bin'
    src_map = os.path.join(DECOMP, map_rel)
    if os.path.exists(src_map):
        shutil.copyfile(src_map, os.path.join(OUT, map_out))
    else:
        errors.append(bgname + ' (tilemap absent: ' + map_rel + ')')
        continue
    manifest[bid] = {
        'name': bgname,
        'image': done_files[img_rel] + '.4bpp.bin',
        'pal': done_files[img_rel] + '.gbapal',
        'tilemap': map_out,
    }

io.open('public/decomp/em/battle_anims/anim-bg-manifest.json', 'w', encoding='utf-8').write(json.dumps(manifest, indent=0))
print('OK:', len(manifest), '| erreurs:', len(errors))
for e in errors[:8]:
    print('  x', e)
