"""Dump VRAM[0..2560] in tile format (32 bytes per tile, 80 tiles)."""
import os
DIR = os.path.dirname(os.path.abspath(__file__))
vram = open(os.path.join(DIR, "vram.bin"), "rb").read()

print("Forest tile data in VBA-M VRAM (= BG1 charBase=0):")
print(f"Total non-zero region: 0x000..0xa00 = 2560 bytes = 80 tiles\n")

for tile in range(80):
    row_bytes = vram[tile * 32:(tile + 1) * 32]
    if all(b == 0 for b in row_bytes):
        continue  # skip empty tiles
    # Format as 8 rows of 4 bytes (= 8 pixels per row, 4bpp)
    print(f"Tile {tile:3} (vram[0x{tile*32:04x}..0x{(tile+1)*32:04x}]):")
    for r in range(8):
        row = row_bytes[r * 4:(r + 1) * 4]
        # Convert to 8 pixel indices
        pixels = []
        for b in row:
            pixels.append(b & 0xF)
            pixels.append((b >> 4) & 0xF)
        print(f"  row {r}: " + " ".join(f"{p:x}" for p in pixels))
    if tile >= 10:
        print(f"... (and more, stopping at tile {tile})")
        break
