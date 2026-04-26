#!/usr/bin/env python3
"""
process_sprite_alpha.py
------------------------
Pré-process PNG indexed décomp → RGBA avec idx 0 = alpha 0.

Pourquoi : convention décomp = idx 0 du palette PNG = couleur transparente.
Mais idx 0 peut avoir la MÊME RGB qu'un autre idx (poke.png idx 0 = idx 5 = blanc).
Si on transparentise par RGB côté navigateur → on efface aussi idx 5 = highlights cassés.

Solution : lire indexed (PIL), output RGBA avec alpha=0 où idx==0 (peu importe RGB).
"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent.parent
SPRITES = [
    "balls/poke.png",
    "balls/open.png",
    "battle_anims/particles.png",
]

for rel in SPRITES:
    in_path = ROOT / "public/decomp/em" / rel
    out_path = in_path.parent / (in_path.stem + "-rgba.png")

    if not in_path.exists():
        print(f"[skip] {rel} introuvable")
        continue

    img = Image.open(in_path)
    if img.mode != "P":
        print(f"[skip] {rel} pas indexed ({img.mode})")
        continue

    # Get raw indexed pixels (palette indexes 0-N)
    indexed = img.load()
    W, H = img.size
    palette = img.getpalette()

    # Build RGBA, alpha=0 où idx==0
    out = Image.new("RGBA", (W, H))
    out_pixels = out.load()
    for y in range(H):
        for x in range(W):
            idx = indexed[x, y]
            if idx == 0:
                out_pixels[x, y] = (0, 0, 0, 0)
            else:
                r = palette[idx * 3]
                g = palette[idx * 3 + 1]
                b = palette[idx * 3 + 2]
                out_pixels[x, y] = (r, g, b, 255)

    out.save(out_path)
    print(f"[ok] {rel} → {out_path.name}")
