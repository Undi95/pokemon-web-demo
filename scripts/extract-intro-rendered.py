#!/usr/bin/env python3
"""
Pré-traite les assets de l'intro Pokémon Émeraude pour rendu Phaser direct.

Décomp pokeemeraude livre les sprites/BG en PNG indexed + tilemap .bin + .pal,
mais Phaser ne peut pas appliquer la palette + composer la tilemap au runtime
sans lib spécifique GBA.

Ce script transforme :
  - PNG indexed atlas + .bin tilemap u16 + .pal JASC → PNG RGBA composé final
  - PNG indexed sprite → PNG RGBA avec transparence (palette idx 0 = transparent)

Sortie : `public/decomp/em/intro-rendered/<scene>/<file>.png` (RGBA prêt à charger)

Note règle "aucun pré-rendu" : ceci est de la **transformation de format** (équivalent
à ce que `gbagfx` fait au build du décomp original), pas du pré-rendu de gameplay.

Usage: python scripts/extract-intro-rendered.py
"""
from PIL import Image
import struct, os, sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
SRC = PROJECT_ROOT / 'public' / 'decomp' / 'em' / 'intro'
DST = PROJECT_ROOT / 'public' / 'decomp' / 'em' / 'intro-rendered'
DST.mkdir(parents=True, exist_ok=True)

# --- Helpers ---

def read_jasc_pal(path):
    """Parse JASC-PAL format: header 'JASC-PAL\\r\\n0100\\r\\nNNN\\r\\n' + N×'r g b\\r\\n'."""
    data = open(path).read()
    lines = data.replace('\r\n','\n').split('\n')
    n = int(lines[2])
    return [tuple(map(int, lines[3+i].split())) for i in range(n)]

def apply_palette(im_indexed, palette_rgb, transparent_idx=0):
    """Apply external palette to indexed PNG. Returns RGBA Image. idx 0 = transparent."""
    if im_indexed.mode != 'P':
        im_indexed = im_indexed.convert('P')
    w, h = im_indexed.size
    pixels = list(im_indexed.getdata())
    out = Image.new('RGBA', (w, h))
    out_data = []
    for px in pixels:
        if px == transparent_idx:
            out_data.append((0, 0, 0, 0))
        else:
            r, g, b = palette_rgb[px] if px < len(palette_rgb) else (255, 0, 255)
            out_data.append((r, g, b, 255))
    out.putdata(out_data)
    return out

def compose_tilemap(atlas_png, tilemap_bin, w_tiles, h_tiles, palette_rgb=None, skip_tile_zero=False):
    """Compose GBA tilemap u16 (tile_id 10b, hflip 1b, vflip 1b, palette 4b) into RGBA.
    Si palette_rgb fourni : utilise palette externe (et idx 0 = transparent).
    Sinon : utilise la palette intégrée du PNG (idx 0 = transparent).
    Si skip_tile_zero : tile_id=0 traité comme background uni (laissé transparent)."""
    atlas = Image.open(atlas_png)
    if palette_rgb is None and atlas.mode == 'P':
        pal = atlas.getpalette() or []
        n = len(pal) // 3
        palette_rgb = [(pal[i*3], pal[i*3+1], pal[i*3+2]) for i in range(n)]
    if atlas.mode == 'P':
        # Convert atlas to indexed array (we keep indices for transparency)
        atlas_idx = atlas
    else:
        atlas_idx = atlas.convert('P')

    atlas_w_tiles = atlas.width // 8
    out = Image.new('RGBA', (w_tiles * 8, h_tiles * 8), (0, 0, 0, 0))
    out_pixels = out.load()

    data = open(tilemap_bin, 'rb').read()
    n_entries = min(len(data) // 2, w_tiles * h_tiles)
    entries = struct.unpack(f'<{n_entries}H', data[:n_entries*2])

    atlas_pixels = atlas_idx.load()

    for i in range(n_entries):
        entry = entries[i]
        tile_id = entry & 0x3FF
        h_flip = bool(entry & 0x400)
        v_flip = bool(entry & 0x800)
        # palette_idx = (entry >> 12) & 0xF  # ignored for single-palette atlases

        if tile_id >= atlas_w_tiles * (atlas.height // 8):
            continue
        if skip_tile_zero and tile_id == 0:
            continue  # tile 0 = background uni (rayquaza, etc.) → laisser transparent

        sx = (tile_id % atlas_w_tiles) * 8
        sy = (tile_id // atlas_w_tiles) * 8
        tx = (i % w_tiles) * 8
        ty = (i // w_tiles) * 8

        for py in range(8):
            for px in range(8):
                src_x = sx + (7 - px if h_flip else px)
                src_y = sy + (7 - py if v_flip else py)
                idx = atlas_pixels[src_x, src_y]
                if idx == 0:
                    continue  # transparent
                r, g, b = palette_rgb[idx] if idx < len(palette_rgb) else (255, 0, 255)
                out_pixels[tx + px, ty + py] = (r, g, b, 255)
    return out

def make_transparent_sprite(in_png, out_png):
    """Lit un PNG indexed, idx 0 → alpha 0, save RGBA."""
    im = Image.open(in_png)
    if im.mode != 'P':
        im.convert('RGBA').save(out_png)
        return
    pal = im.getpalette() or []
    n_colors = len(pal) // 3
    palette_rgb = [(pal[i*3], pal[i*3+1], pal[i*3+2]) for i in range(n_colors)]
    out = apply_palette(im, palette_rgb, transparent_idx=0)
    out.save(out_png)

# --- Scene 1: BG composé via 4 tilemaps + sprites ---

def render_scene1():
    out_dir = DST / 'scene_1'
    out_dir.mkdir(exist_ok=True)
    src = SRC / 'scene_1'

    # 4 BG layers : compose chaque tilemap avec atlas bg.png partagé
    for i in range(4):
        bin_path = src / f'bg{i}_map.bin'
        # Tilemap 32×32 = 1024 entries
        out = compose_tilemap(src / 'bg.png', bin_path, 32, 32)
        out.save(out_dir / f'bg{i}.png')
        print(f'  scene_1/bg{i}.png composed')

    # Sprites : atlas avec transparency
    for sprite in ['flygon.png', 'sparkle.png', 'drops_logo.png']:
        make_transparent_sprite(src / sprite, out_dir / sprite)
        print(f'  scene_1/{sprite} (transparency applied)')

# --- Scene 2: BG composé + sprites ---

def render_scene2():
    out_dir = DST / 'scene_2'
    out_dir.mkdir(exist_ok=True)
    src = SRC / 'scene_2'

    # BG layers — dimensions exactes par layer
    bg_specs = [
        ('clouds_bg.png', 'clouds_bg_map.bin', 32, 64),  # 4096b = 2048 entries u16 = 32×64
        ('trees.png',     'trees_map.bin',     32, 64),
        ('houses.png',    'houses_map.bin',    32, 64),
        ('grass.png',     'grass_map.bin',     32, 32),  # 2048b = 1024 entries u16 = 32×32
    ]
    for atlas_name, bin_name, w, h in bg_specs:
        bin_path = src / bin_name
        if not bin_path.exists(): continue
        out = compose_tilemap(src / atlas_name, bin_path, w, h)
        out_name = atlas_name.replace('.png', '_composed.png')
        out.save(out_dir / out_name)
        print(f'  scene_2/{out_name} ({w}×{h} tiles)')

    # Sprites
    for sprite in ['brendan.png', 'may.png', 'bicycle.png', 'manectric.png',
                   'torchic.png', 'volbeat.png', 'flygon.png']:
        if (src / sprite).exists():
            make_transparent_sprite(src / sprite, out_dir / sprite)
            print(f'  scene_2/{sprite} (transparency)')

# --- Scene 3: BG complexes (Groudon/Kyogre 8bpp affine) + sprites ---

def render_scene3():
    out_dir = DST / 'scene_3'
    out_dir.mkdir(exist_ok=True)
    src = SRC / 'scene_3'

    # Charge la palette principale bg.pal (256 colors gIntro3Bg_Pal)
    bg_pal = read_jasc_pal(src / 'bg.pal') if (src / 'bg.pal').exists() else None

    # Groudon/Kyogre : on applique SIMPLEMENT la palette bg.pal au PNG indexed
    # (vraie compose tilemap = trop complexe pour MVP, le PNG seul donne déjà l'image)
    if bg_pal:
        for sprite_name in ['groudon.png', 'kyogre.png']:
            im = Image.open(src / sprite_name)
            if im.mode == 'P':
                # Le PNG indexed contient l'image pré-composée par le décomp,
                # juste besoin d'appliquer bg.pal à la place de la palette intégrée
                out = apply_palette(im, bg_pal, transparent_idx=0)
                out.save(out_dir / sprite_name)
                print(f'  scene_3/{sprite_name} (bg.pal applied 256 colors)')

    # Rayquaza : tilemap simple 32×32, skip tile 0 (= fond bleu uni)
    if (src / 'rayquaza.bin').exists():
        out = compose_tilemap(src / 'rayquaza.png', src / 'rayquaza.bin', 32, 32, skip_tile_zero=True)
        out.save(out_dir / 'rayquaza.png')
        print(f'  scene_3/rayquaza.png composed (skip tile 0)')

    # Pokéball : tilemap 32×16 (1024 bytes = 512 entries u16)
    if (src / 'pokeball_map.bin').exists():
        out = compose_tilemap(src / 'pokeball.png', src / 'pokeball_map.bin', 32, 16)
        out.save(out_dir / 'pokeball.png')
        print(f'  scene_3/pokeball.png composed')

    # Clouds : 2 tilemaps (left/right)
    if (src / 'clouds_left.bin').exists():
        out = compose_tilemap(src / 'clouds.png', src / 'clouds_left.bin', 32, 64)
        out.save(out_dir / 'clouds_left.png')
        out = compose_tilemap(src / 'clouds.png', src / 'clouds_right.bin', 32, 64)
        out.save(out_dir / 'clouds_right.png')
        print(f'  scene_3/clouds_left+right composed')

    # Sprites
    for sprite in ['lightning.png', 'bubbles.png', 'misc.png']:
        if (src / sprite).exists():
            make_transparent_sprite(src / sprite, out_dir / sprite)
            print(f'  scene_3/{sprite} (transparency)')

# --- Main ---

# --- Title screen ---

def render_title():
    src = PROJECT_ROOT / 'public' / 'decomp' / 'em' / 'boot' / 'title_screen'
    out_dir = PROJECT_ROOT / 'public' / 'decomp' / 'em' / 'title-rendered'
    out_dir.mkdir(parents=True, exist_ok=True)

    # Rayquaza : tilemap 32×32 → composé
    if (src / 'rayquaza.bin').exists() and (src / 'rayquaza.png').exists():
        out = compose_tilemap(src / 'rayquaza.png', src / 'rayquaza.bin', 32, 32, skip_tile_zero=True)
        out.save(out_dir / 'rayquaza.png')
        print(f'  title/rayquaza.png composed (skip tile 0)')

    # Clouds : tilemap 32×32 → composé
    if (src / 'clouds.bin').exists() and (src / 'clouds.png').exists():
        out = compose_tilemap(src / 'clouds.png', src / 'clouds.bin', 32, 32, skip_tile_zero=True)
        out.save(out_dir / 'clouds.png')
        print(f'  title/clouds.png composed (skip tile 0)')

    # Pokemon logo 8bpp : tilemap 32×32 ou 32×8 ?
    # 1024 bytes = 1024 entries u8 (mais on lit u16 dans compose) — c'est un tilemap u8
    # Pour MVP, on charge le PNG entier (logo déjà visuel)
    for direct in ['pokemon_logo.png', 'press_start.png', 'emerald_version.png']:
        if (src / direct).exists():
            make_transparent_sprite(src / direct, out_dir / direct)
            print(f'  title/{direct} (transparency)')

if __name__ == '__main__':
    print('[intro-rendered] Scene 1...')
    render_scene1()
    print('[intro-rendered] Scene 2...')
    render_scene2()
    print('[intro-rendered] Scene 3...')
    render_scene3()
    print('[title-rendered] Title screen...')
    render_title()
    print(f'\n✓ Done. Output : {DST} + title-rendered/')
