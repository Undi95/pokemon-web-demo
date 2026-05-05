"""Diff VBA-M ground truth vs our runtime state.
Compares VRAM, palette, OAM, and BG control registers."""
import os
import struct

DIR = os.path.dirname(os.path.abspath(__file__))
vram = open(os.path.join(DIR, "vram.bin"), "rb").read()
pltt = open(os.path.join(DIR, "pltt.bin"), "rb").read()
oam = open(os.path.join(DIR, "oam.bin"), "rb").read()
ioregs = open(os.path.join(DIR, "ioregs.bin"), "rb").read()

# Decode OAM all 128 sprites
print("=" * 70)
print("OAM ALL 128 SPRITES — VBA-M ground truth")
print("=" * 70)
visible_count = 0
for i in range(128):
    a0 = struct.unpack_from("<H", oam, i * 8)[0]
    a1 = struct.unpack_from("<H", oam, i * 8 + 2)[0]
    a2 = struct.unpack_from("<H", oam, i * 8 + 4)[0]
    if a0 == 0 and a1 == 0 and a2 == 0:
        continue
    y = a0 & 0xFF
    affine = (a0 >> 8) & 3
    objMode = (a0 >> 10) & 3
    shape = (a0 >> 14) & 3
    x = a1 & 0x1FF
    size = (a1 >> 14) & 3
    tileId = a2 & 0x3FF
    prio = (a2 >> 10) & 3
    palBank = (a2 >> 12) & 0xF
    # Hidden if affine=2 (= ST_OAM_AFFINE_ERASE)
    hidden = "(HIDDEN)" if affine == 2 else ""
    # Off-screen detection
    off_screen = "(off-screen)" if (x >= 240 and x < 480) or y >= 160 else ""
    SHAPES = {0: "sq", 1: "wide", 2: "tall"}
    SIZES_SQ = ["8", "16", "32", "64"]
    SIZES_W = ["16x8", "32x8", "32x16", "64x32"]
    sz_str = SIZES_SQ[size] if shape == 0 else SIZES_W[size]
    sprite_visible = not hidden and not off_screen
    if sprite_visible:
        visible_count += 1
        print(f"  OAM[{i:3}] x={x:3} y={y:3}  {SHAPES.get(shape, '?')}{sz_str}  tile={tileId:3} prio={prio} pal={palBank}  affine={affine}  {hidden}{off_screen}")
print(f"\n  Total VISIBLE on-screen sprites: {visible_count}")

# Now let's look at the dialog window glyph data — should be in BG VRAM
print("\n\n" + "=" * 70)
print("VRAM scan — BG charBase 3 region (= dialog) should have tile data")
print("=" * 70)
charbase3 = vram[0xC000:0xC000 + 0x4000]  # 16KB
nz_total = sum(1 for b in charbase3 if b != 0)
print(f"  charBase 3 (vram[0xC000..0xFFFF]): {nz_total}/{len(charbase3)} non-zero")
if nz_total > 0:
    # Find non-zero ranges
    for i in range(0, len(charbase3), 32):
        chunk = charbase3[i:i+32]
        nz = sum(1 for b in chunk if b != 0)
        if nz > 0:
            print(f"    +0x{i:04x} (tile {i//32:4}): {nz}/{len(chunk)} non-zero")
            if i > 1024 * 32:  # stop after first KB of non-zero
                break

# Look at tilemap 0xF000 hex dump
print("\nTilemap @ 0xF000 (first 64 entries u16):")
for row in range(2):
    line = []
    for col in range(32):
        i = (row * 32 + col) * 2
        v = vram[0xF000 + i] | (vram[0xF000 + i + 1] << 8)
        line.append(f"{v:04x}")
    print(f"  row {row}: {' '.join(line)}")

# Look at BG1 tilemap @ 0x3800
print("\nTilemap @ 0x3800 (forest BG1, first 64 entries u16):")
for row in range(2):
    line = []
    for col in range(32):
        i = (row * 32 + col) * 2
        v = vram[0x3800 + i] | (vram[0x3800 + i + 1] << 8)
        line.append(f"{v:04x}")
    print(f"  row {row}: {' '.join(line)}")

# Sanity check: is the dump even valid? Check our shadow.4bpp.bin against vram[0..2048]
print("\n" + "=" * 70)
print("CHECK : vram[0..2048] vs shadow.4bpp.bin (= forest tiles)")
print("=" * 70)
shadow_path = "D:/Projet 1/pokemon-web-demo/public/decomp/em/birch_speech/shadow.4bpp.bin"
if os.path.exists(shadow_path):
    shadow = open(shadow_path, "rb").read()
    print(f"  shadow.4bpp.bin size: {len(shadow)} bytes")
    match_count = sum(1 for i in range(min(len(shadow), 2048)) if vram[i] == shadow[i])
    print(f"  match vram[0..{min(len(shadow), 2048)}] vs shadow: {match_count}/{min(len(shadow), 2048)}")
    if match_count < min(len(shadow), 2048):
        # Show first few mismatches
        for i in range(min(len(shadow), 256)):
            if vram[i] != shadow[i]:
                print(f"    mismatch [0x{i:03x}]: vram={vram[i]:02x} shadow={shadow[i]:02x}")
                break
