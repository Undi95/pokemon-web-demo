#!/usr/bin/env python3
"""
Dump tout ce qui touche une map du décomp dans un fichier markdown lisible.

Usage:
    python scripts/dump_map_info.py LittlerootTown
    python scripts/dump_map_info.py LittlerootTown_BrendansHouse_1F

Sortie : public/decomp/em/map-dumps/<MapName>.md

Inclut :
  - Métadonnées (id, layout, music, type, weather)
  - Connexions vers d'autres maps
  - Object events (NPCs) avec gfx, position, flag, script
  - Warp events
  - Coord events (triggers conditionnels)
  - Bg events (signs/hidden items)
  - Tous les scripts du fichier scripts.inc avec leur contenu
  - Tous les textes (.string)
  - Liste des flags / vars référencés
"""
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DECOMP = REPO.parent / "decomps" / "pokeemeraude"
OUT_DIR = REPO / "public" / "decomp" / "em" / "map-dumps"

if len(sys.argv) < 2:
    print("Usage: dump_map_info.py <MapName>")
    sys.exit(1)

map_name = sys.argv[1]
map_dir = DECOMP / "data" / "maps" / map_name
if not map_dir.exists():
    print(f"Map not found: {map_dir}")
    sys.exit(1)

OUT_DIR.mkdir(parents=True, exist_ok=True)

# --- map.json ---
map_json = json.loads((map_dir / "map.json").read_text(encoding="utf-8"))

# --- scripts.inc ---
scripts_path = map_dir / "scripts.inc"
scripts_text = scripts_path.read_text(encoding="utf-8") if scripts_path.exists() else ""

# Parse labels (script + text) du fichier .inc
LABEL_RE = re.compile(r"^(\w+)::?\s*$", re.M)
STRING_RE = re.compile(r'\.string\s+"((?:\\.|[^"\\])*)"')

scripts = {}      # name -> [lines]
texts = {}        # name -> string
current = None
buf = []
is_text = False

def flush():
    global current, buf, is_text
    if current is None:
        return
    if is_text:
        texts[current] = "".join(buf)
    elif buf:
        scripts[current] = list(buf)
    buf = []
    is_text = False

for raw in scripts_text.splitlines():
    line = raw.strip()
    if not line or line.startswith("@") or line.startswith(";"):
        continue
    m = LABEL_RE.match(line)
    if m:
        flush()
        current = m.group(1)
        continue
    if current is None:
        continue
    sm = STRING_RE.match(line)
    if sm:
        is_text = True
        buf.append(sm.group(1))
        continue
    if line.startswith("."):
        continue
    buf.append(line)
flush()

# --- Référence flags/vars ---
flags = sorted({m.group(0) for s in scripts.values() for line in s
                for m in re.finditer(r"FLAG_\w+", line)})
vars_ = sorted({m.group(0) for s in scripts.values() for line in s
                for m in re.finditer(r"VAR_\w+", line)})

# --- Génère le markdown ---
out = [f"# {map_name}", ""]
out.append("## Métadonnées")
for k in ["id", "layout", "music", "region_map_section", "weather",
          "map_type", "battle_scene", "allow_cycling", "allow_running"]:
    if k in map_json:
        out.append(f"- **{k}** : `{map_json[k]}`")
out.append("")

# Connections
conns = map_json.get("connections") or []
if conns:
    out.append("## Connexions")
    for c in conns:
        out.append(f"- {c['direction']} (offset {c['offset']}) → `{c['map']}`")
    out.append("")

# Object events
oes = map_json.get("object_events") or []
if oes:
    out.append(f"## Object events ({len(oes)} NPCs)")
    out.append("| local_id | gfx | x,y | mvmt | script | flag |")
    out.append("|---|---|---|---|---|---|")
    for o in oes:
        out.append(f"| `{o.get('local_id','')}` | `{o['graphics_id']}` | "
                   f"{o['x']},{o['y']} | `{o['movement_type']}` | "
                   f"`{o['script']}` | `{o['flag']}` |")
    out.append("")

# Warps
warps = map_json.get("warp_events") or []
if warps:
    out.append(f"## Warps ({len(warps)})")
    for i, w in enumerate(warps):
        out.append(f"- #{i} ({w['x']},{w['y']}) → `{w['dest_map']}` warp #{w['dest_warp_id']}")
    out.append("")

# Coord events
ces = map_json.get("coord_events") or []
if ces:
    out.append(f"## Coord events / triggers ({len(ces)})")
    for c in ces:
        cond = ""
        if c.get("var"):
            cond = f" (si `{c['var']}` == `{c.get('var_value','?')}`)"
        out.append(f"- ({c['x']},{c['y']}) → `{c.get('script','')}`{cond}")
    out.append("")

# BG events (signs)
bgs = map_json.get("bg_events") or []
if bgs:
    out.append(f"## BG events / signs ({len(bgs)})")
    for b in bgs:
        out.append(f"- ({b['x']},{b['y']}) [{b['type']}] → `{b.get('script','')}`")
    out.append("")

# Flags référencés
if flags:
    out.append(f"## Flags référencés ({len(flags)})")
    for f in flags: out.append(f"- `{f}`")
    out.append("")

# Vars référencées
if vars_:
    out.append(f"## Variables référencées ({len(vars_)})")
    for v in vars_: out.append(f"- `{v}`")
    out.append("")

# Scripts détaillés
if scripts:
    out.append(f"## Scripts ({len(scripts)})")
    for name, body in scripts.items():
        out.append(f"### {name}")
        out.append("```")
        out.extend(body)
        out.append("```")
    out.append("")

# Textes détaillés
if texts:
    out.append(f"## Textes ({len(texts)})")
    for name, content in texts.items():
        out.append(f"### {name}")
        out.append("```")
        out.append(content)
        out.append("```")
    out.append("")

dest = OUT_DIR / f"{map_name}.md"
dest.write_text("\n".join(out), encoding="utf-8")
print(f"Wrote {dest} ({len(out)} lines)")
