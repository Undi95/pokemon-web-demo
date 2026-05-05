"""Decode all 128 OAM entries with proper visibility check."""
import os
import struct
DIR = os.path.dirname(os.path.abspath(__file__))
oam = open(os.path.join(DIR, "oam.bin"), "rb").read()

print(f"OAM raw bytes (first 64 sprites = 512 bytes):")
print()

for i in range(128):
    base = i * 8
    a0 = struct.unpack_from("<H", oam, base)[0]
    a1 = struct.unpack_from("<H", oam, base + 2)[0]
    a2 = struct.unpack_from("<H", oam, base + 4)[0]

    # All zero = OAM unused
    if a0 == 0 and a1 == 0 and a2 == 0:
        continue

    y = a0 & 0xFF
    rotscale = (a0 >> 8) & 1   # bit 8 — affine on
    double_or_disable = (a0 >> 9) & 1  # bit 9 — if rotscale=0, this means hidden
    objMode = (a0 >> 10) & 3
    mosaic = (a0 >> 12) & 1
    bpp = (a0 >> 13) & 1
    shape = (a0 >> 14) & 3

    x = a1 & 0x1FF
    if rotscale:
        affineParam = (a1 >> 9) & 0x1F
    else:
        flipH = (a1 >> 12) & 1
        flipV = (a1 >> 13) & 1
    size = (a1 >> 14) & 3

    tileId = a2 & 0x3FF
    prio = (a2 >> 10) & 3
    palBank = (a2 >> 12) & 0xF

    # Hidden: rotscale=0 + double_or_disable=1
    is_hidden = (rotscale == 0 and double_or_disable == 1)
    is_off_screen = (x >= 240 and x <= 480) or y >= 160

    SHAPES = ["sq", "wide", "tall"]
    SIZES_SQ = [8, 16, 32, 64]
    SIZES_W = [(16, 8), (32, 8), (32, 16), (64, 32)]
    SIZES_T = [(8, 16), (8, 32), (16, 32), (32, 64)]

    if shape == 0:
        sz_str = f"{SIZES_SQ[size]}x{SIZES_SQ[size]}"
    elif shape == 1:
        sz_str = f"{SIZES_W[size][0]}x{SIZES_W[size][1]}"
    else:
        sz_str = f"{SIZES_T[size][0]}x{SIZES_T[size][1]}"

    flag = ""
    if is_hidden:
        flag = " HIDDEN"
    elif is_off_screen:
        flag = " off-screen"

    print(f"  OAM[{i:3}]  a0={a0:04x} a1={a1:04x} a2={a2:04x}  ({x},{y}) {sz_str} tile={tileId:3} prio={prio} pal={palBank}{flag}")
