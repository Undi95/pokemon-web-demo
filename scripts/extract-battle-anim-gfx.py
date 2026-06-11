# -*- coding: utf-8 -*-
"""PHASE 0bis roadmap anims : les 289 gfx par tag en batch (zero manuel).
Parse gBattleAnimPicTable/gBattleAnimPaletteTable (src/data/battle_anim.h) +
le mapping gBattleAnimSpriteGfx_* -> png (src/graphics.c), convertit chaque
png en .4bpp.bin (byte-exact, convertisseur valide MATCH poke.4bpp) + .gbapal,
emet public/decomp/em/battle_anims/anim-gfx-manifest.json {tagName: {bin, pal, size}}.
"""
import struct, zlib, io, os, re, json

DECOMP = r'D:/Projet 1/decomps/pokeemeraude'
OUT = 'public/decomp/em/battle_anims/sprites'
os.makedirs(OUT, exist_ok=True)

def png_to_4bpp_pal(src, pal_src=None):
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
    cols = plte or []
    if pal_src and os.path.exists(pal_src):
        lines = io.open(pal_src, encoding='ascii', errors='ignore').read().splitlines()
        jc = []
        for L in lines[3:19]:
            parts = L.split()
            if len(parts) == 3:
                jc.append(tuple(int(x) for x in parts))
        if jc: cols = jc
    pal = bytearray()
    for i in range(16):
        r, g, b = cols[i] if i < len(cols) else (0, 0, 0)
        pal += struct.pack('<H', (r >> 3) | ((g >> 3) << 5) | ((b >> 3) << 10))
    return bytes(out), bytes(pal), None

# 1) mapping symbole gfx/pal -> chemin (graphics.c, INCGFX/INCBIN)
gfx_src = io.open(os.path.join(DECOMP, 'src/graphics.c'), encoding='utf-8', errors='ignore').read()
sym2png = {}
sym2pal = {}
for m in re.finditer(r'const u32 (gBattleAnimSpriteGfx_\w+)\[\] = INCGFX_U32\("([^"]+)"', gfx_src):
    sym2png[m.group(1)] = m.group(2)
for m in re.finditer(r'const u32 (gBattleAnimSpritePal_\w+)\[\] = INCGFX_U32\("([^"]+)"', gfx_src):
    sym2pal[m.group(1)] = m.group(2)
# variantes INCBIN
for m in re.finditer(r'const u32 (gBattleAnimSpriteGfx_\w+)\[\] = INCBIN_U32\("([^"]+?)\.4bpp\.lz"\)', gfx_src):
    sym2png.setdefault(m.group(1), m.group(2) + '.png')
for m in re.finditer(r'const u32 (gBattleAnimSpritePal_\w+)\[\] = INCBIN_U32\("([^"]+?)\.gbapal\.lz"\)', gfx_src):
    sym2pal.setdefault(m.group(1), m.group(2) + '.pal')
print('gfx syms:', len(sym2png), '| pal syms:', len(sym2pal))

# 2) les 2 tables (battle_anim.h)
h_src = io.open(os.path.join(DECOMP, 'src/data/battle_anim.h'), encoding='utf-8', errors='ignore').read()
pic_entries = re.findall(r'\{(gBattleAnimSpriteGfx_\w+),\s*(0x[0-9a-fA-F]+|\d+),\s*(ANIM_TAG_\w+)\}', h_src)
pal_entries = re.findall(r'\{(gBattleAnimSpritePal_\w+),\s*(ANIM_TAG_\w+)\}', h_src)
pal_by_tag = {tag: sym for (sym, tag) in pal_entries}
print('pic entries:', len(pic_entries), '| pal entries:', len(pal_entries))

# 3) batch conversion + manifest
manifest = {}
ok = skip = 0
errors = []
for sym, size_s, tag in pic_entries:
    png_rel = sym2png.get(sym)
    if not png_rel:
        errors.append(tag + ' (pas de png pour ' + sym + ')')
        continue
    png_path = os.path.join(DECOMP, png_rel)
    if not os.path.exists(png_path):
        errors.append(tag + ' (png absent: ' + png_rel + ')')
        continue
    base = os.path.splitext(os.path.basename(png_rel))[0]
    # pal externe (.pal JASC a cote ?) sinon PLTE du png ; la table palette peut
    # referencer un AUTRE png (pal partagee) -> resoudre via pal_by_tag
    pal_sym = pal_by_tag.get(tag)
    pal_src_path = None
    if pal_sym and pal_sym in sym2pal:
        prel = sym2pal[pal_sym]
        if prel.endswith('.png'):
            pal_png = os.path.join(DECOMP, prel)
            # PLTE de CE png : converti a la volee (le convertisseur lira plte du png cible)
            pal_src_path = None if not os.path.exists(pal_png) else ('PNG:' + pal_png)
        else:
            pal_src_path = os.path.join(DECOMP, prel)
    tiles, pal, err = png_to_4bpp_pal(png_path, pal_src_path if (pal_src_path and not str(pal_src_path).startswith('PNG:')) else None)
    if err:
        errors.append(tag + ' (' + err + ')')
        continue
    # pal depuis un AUTRE png ?
    if pal_src_path and str(pal_src_path).startswith('PNG:'):
        _, pal2, e2 = png_to_4bpp_pal(pal_src_path[4:])
        if not e2 and pal2: pal = pal2
    binname = base + '.4bpp.bin'
    palname = base + '.gbapal'
    io.open(os.path.join(OUT, binname), 'wb').write(tiles)
    io.open(os.path.join(OUT, palname), 'wb').write(pal)
    size = int(size_s, 16) if size_s.startswith('0x') else int(size_s)
    manifest[tag] = { 'bin': binname, 'pal': palname, 'size': size, 'realBytes': len(tiles) }
    ok += 1

io.open('public/decomp/em/battle_anims/anim-gfx-manifest.json', 'w', encoding='utf-8').write(json.dumps(manifest, indent=0))
print('OK:', ok, '| erreurs:', len(errors))
for e in errors[:12]:
    print('  ✗', e)
