import json, os, glob

DECOMP = "D:/Projet 1/decomps/pokeemeraude/data/maps"
out = []
for d in sorted(glob.glob(os.path.join(DECOMP, "*"))):
    name = os.path.basename(d)
    # only outdoor town/city maps (not the PokemonCenter sub-maps themselves)
    if not (name.endswith("Town") or name.endswith("City")):
        continue
    mj = os.path.join(d, "map.json")
    if not os.path.isfile(mj):
        continue
    data = json.load(open(mj, encoding="utf-8"))
    town_id = data.get("id")
    pc = None
    for w in data.get("warp_events", []):
        dm = w.get("dest_map", "")
        if "POKEMON_CENTER_1F" in dm:
            pc = w
            break
    if pc:
        out.append({"town": name, "id": town_id, "pcx": pc["x"], "pcy": pc["y"], "dest": pc["dest_map"]})

print(json.dumps(out, indent=0))
print("COUNT", len(out))
