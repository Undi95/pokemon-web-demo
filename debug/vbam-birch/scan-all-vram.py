"""Comprehensive scan of every 64-byte chunk in VRAM."""
import os
DIR = os.path.dirname(os.path.abspath(__file__))
vram = open(os.path.join(DIR, "vram.bin"), "rb").read()

print(f"VRAM total: {len(vram)} bytes\n")

CHUNK = 256
print(f"Non-zero chunks of {CHUNK} bytes:")
i = 0
last_nz_end = -1
while i < len(vram):
    nz = sum(1 for b in vram[i:i+CHUNK] if b != 0)
    if nz > 0:
        if last_nz_end != i:
            print()  # gap before this region
        # Indicate location
        if i < 0x10000:
            charBase = i // 0x4000
            screenBase = i // 0x800
            label = f"BG: charBase{charBase}_off{i % 0x4000:#x}, screenBase{screenBase}_off{i % 0x800:#x}"
        else:
            obj_off = i - 0x10000
            label = f"OBJ: tile{obj_off // 32}_byteoff{obj_off:#x}"
        print(f"  vram[0x{i:05x}..0x{i+CHUNK:05x}]  {nz:3}/{CHUNK} non-zero  {label}")
        last_nz_end = i + CHUNK
    i += CHUNK
