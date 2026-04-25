#!/usr/bin/env python3
"""
Dump exhaustif de TOUTES les maps du décomp + index de liaisons.

Usage :
    python scripts/dump_all_maps.py             # dump tout
    python scripts/dump_all_maps.py --only Littleroot   # filtre par préfixe

Sortie dans `public/decomp/em/map-dumps/` :
  - <MapName>.md             dump détaillé de chaque map (NPCs, warps, scripts, textes, flags, vars, tileset, palettes)
  - _INDEX.md                liste de toutes les maps groupées par zone (region_map_section)
  - _LINKS.md                graphe des warps entre maps + scripts cross-map (goto/call vers labels d'une autre map)
  - _FLAGS.md                pour chaque flag : maps qui le set/clear/check
  - _VARS.md                 pour chaque var : maps qui la set/check + valeurs observées
  - _SCRIPTS.md              labels orphelins (scripts/textes goto'd mais introuvables) — utile pour debug

Le but : permettre de répondre à "où est défini ce flag ?", "qui warp ici ?",
"quel script utilise ce texte ?" sans avoir à grep le décomp à chaque fois.
"""
import json
import re
import sys
import argparse
from pathlib import Path
from collections import defaultdict

REPO = Path(__file__).resolve().parent.parent
DECOMP = REPO.parent / "decomps" / "pokeemeraude"
OUT_DIR = REPO / "public" / "decomp" / "em" / "map-dumps"
COMMON_DIR = DECOMP / "data" / "scripts"

LABEL_RE = re.compile(r"^(\w+)::?\s*$", re.M)
STRING_RE = re.compile(r'\.string\s+"((?:\\.|[^"\\])*)"')
FLAG_RE = re.compile(r"FLAG_\w+")
VAR_RE = re.compile(r"VAR_\w+")
GOTO_CALL_RE = re.compile(r"^(?:goto|call|goto_if_eq|goto_if_ne|goto_if_set|goto_if_unset|call_if_eq|call_if_ne|call_if_set|call_if_unset|goto_if_lt|goto_if_gt|call_if_lt|call_if_gt)\s+([\w,]+)$")
WARP_RE = re.compile(r"warp(?:silent|walk|spin)?\s+(MAP_\w+)")
MSGBOX_RE = re.compile(r"msgbox\s+(\w+)")


def parse_inc(text):
    """Parse un fichier .inc en (scripts, texts) avec labels comme clés."""
    scripts, texts = {}, {}
    current = None
    buf = []
    is_text = False

    def flush():
        nonlocal current, buf, is_text
        if current is not None:
            if is_text:
                texts[current] = "".join(buf)
            elif buf:
                scripts[current] = list(buf)
        buf = []
        is_text = False

    for raw in text.splitlines():
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
    return scripts, texts


def load_common():
    """Pool de scripts/textes des fichiers data/scripts/*.inc (partagés entre maps)."""
    scripts, texts = {}, {}
    label_to_file = {}
    if not COMMON_DIR.exists():
        return scripts, texts, label_to_file
    for inc in COMMON_DIR.rglob("*.inc"):
        s, t = parse_inc(inc.read_text(encoding="utf-8"))
        scripts.update(s)
        texts.update(t)
        for n in s: label_to_file[n] = inc.relative_to(DECOMP).as_posix()
        for n in t: label_to_file[n] = inc.relative_to(DECOMP).as_posix()
    return scripts, texts, label_to_file


def collect_map(map_dir):
    """Charge map.json + scripts.inc d'une map. Retourne dict ou None."""
    map_json_p = map_dir / "map.json"
    if not map_json_p.exists():
        return None
    map_json = json.loads(map_json_p.read_text(encoding="utf-8"))
    scripts_p = map_dir / "scripts.inc"
    text = scripts_p.read_text(encoding="utf-8") if scripts_p.exists() else ""
    scripts, texts = parse_inc(text)
    return {
        "name": map_dir.name,
        "json": map_json,
        "scripts": scripts,
        "texts": texts,
        "raw_inc": text,
    }


def write_map_md(m, common_scripts, common_texts, label_to_file, out_dir, all_map_names):
    """Génère le markdown détaillé pour une map."""
    name = m["name"]
    j = m["json"]
    scripts = m["scripts"]
    texts = m["texts"]

    flags = sorted({fm.group(0) for s in scripts.values() for line in s for fm in FLAG_RE.finditer(line)})
    vars_ = sorted({vm.group(0) for s in scripts.values() for line in s for vm in VAR_RE.finditer(line)})

    out = [f"# {name}", ""]
    # --- Métadonnées ---
    out.append("## Métadonnées")
    for k in ["id", "layout", "music", "region_map_section", "weather",
              "map_type", "battle_scene", "show_map_name", "allow_cycling", "allow_running"]:
        if k in j:
            out.append(f"- **{k}** : `{j[k]}`")
    out.append("")

    # --- Connexions ---
    conns = j.get("connections") or []
    if conns:
        out.append("## Connexions")
        for c in conns:
            out.append(f"- {c['direction']} (offset {c['offset']}) → `{c['map']}`")
        out.append("")

    # --- Object events ---
    oes = j.get("object_events") or []
    if oes:
        out.append(f"## Object events ({len(oes)} NPCs)")
        out.append("| local_id | gfx | x,y | mvmt | script | flag |")
        out.append("|---|---|---|---|---|---|")
        for o in oes:
            out.append(f"| `{o.get('local_id','')}` | `{o['graphics_id']}` | "
                       f"{o['x']},{o['y']} | `{o['movement_type']}` | "
                       f"`{o['script']}` | `{o['flag']}` |")
        out.append("")

    # --- Warps ---
    warps = j.get("warp_events") or []
    if warps:
        out.append(f"## Warps ({len(warps)})")
        for i, w in enumerate(warps):
            out.append(f"- #{i} ({w['x']},{w['y']}) → `{w['dest_map']}` warp #{w['dest_warp_id']}")
        out.append("")

    # --- Coord events ---
    ces = j.get("coord_events") or []
    if ces:
        out.append(f"## Coord events / triggers ({len(ces)})")
        for c in ces:
            cond = ""
            if c.get("var"):
                cond = f" (si `{c['var']}` == `{c.get('var_value','?')}`)"
            out.append(f"- ({c['x']},{c['y']}) → `{c.get('script','')}`{cond}")
        out.append("")

    # --- BG events ---
    bgs = j.get("bg_events") or []
    if bgs:
        out.append(f"## BG events / signs ({len(bgs)})")
        for b in bgs:
            out.append(f"- ({b['x']},{b['y']}) [{b['type']}] → `{b.get('script','')}`")
        out.append("")

    # --- Flags ---
    if flags:
        out.append(f"## Flags référencés ({len(flags)})")
        for f in flags: out.append(f"- `{f}`")
        out.append("")

    # --- Vars ---
    if vars_:
        out.append(f"## Variables référencées ({len(vars_)})")
        for v in vars_: out.append(f"- `{v}`")
        out.append("")

    # --- Labels externes appelés (cross-map / common) ---
    locals_set = set(scripts.keys()) | set(texts.keys())
    external = defaultdict(set)
    for sname, body in scripts.items():
        for line in body:
            cm = GOTO_CALL_RE.match(line)
            if cm:
                target = cm.group(1).split(",")[-1]  # last token = label
                if target not in locals_set:
                    if target in common_scripts:
                        external[label_to_file.get(target, "common")].add(target)
                    else:
                        external["UNRESOLVED"].add(target)
            mm = MSGBOX_RE.match(line)
            if mm:
                target = mm.group(1)
                if target not in locals_set and target not in common_texts:
                    external["UNRESOLVED"].add(target)
    if external:
        out.append("## Labels externes appelés (résolus via _common.json ou orphelins)")
        for src_file in sorted(external):
            out.append(f"### {src_file}")
            for label in sorted(external[src_file]):
                out.append(f"- `{label}`")
        out.append("")

    # --- Scripts détaillés ---
    if scripts:
        out.append(f"## Scripts ({len(scripts)})")
        for n, body in scripts.items():
            out.append(f"### {n}")
            out.append("```")
            out.extend(body)
            out.append("```")
        out.append("")

    # --- Textes détaillés ---
    if texts:
        out.append(f"## Textes ({len(texts)})")
        for n, content in texts.items():
            out.append(f"### {n}")
            out.append("```")
            out.append(content)
            out.append("```")
        out.append("")

    (out_dir / f"{name}.md").write_text("\n".join(out), encoding="utf-8")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--only", help="Filtre prefix (ex: Littleroot)")
    args = p.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    maps_dir = DECOMP / "data" / "maps"

    common_scripts, common_texts, label_to_file = load_common()
    print(f"[common] {len(common_scripts)} scripts, {len(common_texts)} texts indexés depuis data/scripts/")

    all_maps = []
    for mdir in sorted(maps_dir.iterdir()):
        if not mdir.is_dir(): continue
        if args.only and not mdir.name.startswith(args.only): continue
        m = collect_map(mdir)
        if m: all_maps.append(m)

    all_names = {m["name"] for m in all_maps}
    for m in all_maps:
        write_map_md(m, common_scripts, common_texts, label_to_file, OUT_DIR, all_names)

    # --- _INDEX.md : maps groupées par region_map_section ---
    by_section = defaultdict(list)
    for m in all_maps:
        sec = m["json"].get("region_map_section", "MAPSEC_NONE")
        by_section[sec].append(m["name"])
    idx = ["# Index des maps", "",
           f"Total : **{len(all_maps)}** maps réparties sur **{len(by_section)}** zones.", ""]
    for sec in sorted(by_section):
        idx.append(f"## {sec} ({len(by_section[sec])} maps)")
        for n in sorted(by_section[sec]):
            idx.append(f"- [{n}]({n}.md)")
        idx.append("")
    (OUT_DIR / "_INDEX.md").write_text("\n".join(idx), encoding="utf-8")

    # --- _LINKS.md : graphe des warps + cross-map calls ---
    warp_graph = defaultdict(list)  # MAP_X → [(dest_map, "(via warp #N)")]
    for m in all_maps:
        for i, w in enumerate(m["json"].get("warp_events") or []):
            warp_graph[m["name"]].append((w["dest_map"], f"warp#{i} → warp#{w['dest_warp_id']}"))

    cross_calls = defaultdict(set)  # MAP_X → {label appelé qui appartient à une autre map}
    map_label_owner = {}  # label → mapName (pour les labels définis dans une scripts.inc de map)
    for m in all_maps:
        for n in list(m["scripts"]) + list(m["texts"]):
            map_label_owner[n] = m["name"]
    for m in all_maps:
        local = set(m["scripts"]) | set(m["texts"])
        for body in m["scripts"].values():
            for line in body:
                cm = GOTO_CALL_RE.match(line)
                if cm:
                    target = cm.group(1).split(",")[-1]
                    if target not in local and target in map_label_owner:
                        cross_calls[m["name"]].add((target, map_label_owner[target]))
                mm = MSGBOX_RE.match(line)
                if mm:
                    target = mm.group(1)
                    if target not in local and target in map_label_owner:
                        cross_calls[m["name"]].add((target, map_label_owner[target]))

    links = ["# Liens entre maps", "",
             "## Graphe des warps", ""]
    for src in sorted(warp_graph):
        links.append(f"### {src}")
        for dst, info in warp_graph[src]:
            links.append(f"- {info} → `{dst}`")
        links.append("")
    if cross_calls:
        links.append("## Appels cross-map (script de A référence label de B)")
        links.append("")
        for src in sorted(cross_calls):
            links.append(f"### {src}")
            for label, owner in sorted(cross_calls[src]):
                links.append(f"- `{label}` (défini dans `{owner}`)")
            links.append("")
    (OUT_DIR / "_LINKS.md").write_text("\n".join(links), encoding="utf-8")

    # --- _FLAGS.md & _VARS.md ---
    flag_users = defaultdict(lambda: defaultdict(set))   # FLAG → op (set/clear/check) → set(sources)
    var_users = defaultdict(lambda: defaultdict(set))    # VAR → op (set/check) → set(sources)

    def index_lines(source, lines):
        for line in lines:
            tokens = line.split()
            if not tokens: continue
            op = tokens[0]
            for fm in FLAG_RE.finditer(line):
                f = fm.group(0)
                if op == "setflag": flag_users[f]["set"].add(source)
                elif op == "clearflag": flag_users[f]["clear"].add(source)
                else: flag_users[f]["check"].add(source)
            for vm in VAR_RE.finditer(line):
                v = vm.group(0)
                if op in ("setvar", "addvar", "subvar", "copyvar"): var_users[v]["set"].add(source)
                else: var_users[v]["check"].add(source)

    for m in all_maps:
        for body in m["scripts"].values():
            index_lines(m["name"], body)
    # Common scripts : preview src file
    for label, body in common_scripts.items():
        src = label_to_file.get(label, "common")
        index_lines(f"common:{Path(src).name}", body)

    flag_md = ["# Flags : où sont-ils set/clear/check ?", ""]
    for f in sorted(flag_users):
        flag_md.append(f"## `{f}`")
        for op in ("set", "clear", "check"):
            users = flag_users[f].get(op)
            if users:
                flag_md.append(f"- **{op}** : {', '.join(sorted(users))}")
        flag_md.append("")
    (OUT_DIR / "_FLAGS.md").write_text("\n".join(flag_md), encoding="utf-8")

    var_md = ["# Variables : où sont-elles set/check ?", ""]
    for v in sorted(var_users):
        var_md.append(f"## `{v}`")
        for op in ("set", "check"):
            users = var_users[v].get(op)
            if users:
                var_md.append(f"- **{op}** : {', '.join(sorted(users))}")
        var_md.append("")
    (OUT_DIR / "_VARS.md").write_text("\n".join(var_md), encoding="utf-8")

    # --- _SCRIPTS.md : labels orphelins (referenced but not in any map ni common) ---
    all_labels = set(map_label_owner.keys()) | set(common_scripts) | set(common_texts)
    orphans_by_map = defaultdict(set)
    for m in all_maps:
        local = set(m["scripts"]) | set(m["texts"])
        for body in m["scripts"].values():
            for line in body:
                cm = GOTO_CALL_RE.match(line)
                if cm:
                    target = cm.group(1).split(",")[-1]
                    if target not in local and target not in all_labels:
                        orphans_by_map[m["name"]].add(target)
                mm = MSGBOX_RE.match(line)
                if mm:
                    target = mm.group(1)
                    if target not in local and target not in all_labels:
                        orphans_by_map[m["name"]].add(target)
    orph_md = ["# Labels orphelins (referenced mais introuvables)", ""]
    if orphans_by_map:
        for m in sorted(orphans_by_map):
            orph_md.append(f"## {m}")
            for label in sorted(orphans_by_map[m]):
                orph_md.append(f"- `{label}`")
            orph_md.append("")
    else:
        orph_md.append("Aucun. Tous les labels sont résolus.")
    (OUT_DIR / "_SCRIPTS.md").write_text("\n".join(orph_md), encoding="utf-8")

    print(f"[dump] {len(all_maps)} maps écrites dans {OUT_DIR}")
    print(f"[dump] index : _INDEX.md ({len(by_section)} zones)")
    print(f"[dump] liens : _LINKS.md ({len(warp_graph)} maps avec warps, {len(cross_calls)} maps avec cross-call)")
    print(f"[dump] flags : _FLAGS.md ({len(flag_users)} flags uniques)")
    print(f"[dump] vars  : _VARS.md  ({len(var_users)} vars uniques)")
    print(f"[dump] orphelins : _SCRIPTS.md ({sum(len(o) for o in orphans_by_map.values())} labels)")


if __name__ == "__main__":
    main()
