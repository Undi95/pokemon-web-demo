// src/region_map.ts — foyer 1:1 décomp `src/region_map.c` (noms de lieux FR).
// Décyclé depuis decomp-bridge.ts (spine-decycle, périphériques) : ces fonctions
// lisent la table FR des noms de map (map-names-fr.ts) ; le bridge n'était qu'un relais.
import { getMapNameFr } from './data/map-names-fr';

/** 1:1 décomp `src/region_map.c:1568 GetMapName(dest, regionMapId, padLength)` :
 *    if (regionMapId == MAPSEC_SECRET_BASE) return GetSecretBaseMapName(dest);
 *    else if (regionMapId < MAPSEC_NONE) return StringCopy(dest, gRegionMapEntries[id].name);
 *    else return StringFill(dest, CHAR_SPACE, padLength ?? 18);
 *
 *  Notre impl simplifié : lookup FR directement, write into dest.length bytes
 *  (= dest is a Uint8Array slot in gStringVar1/2/3 typically). En auto-body,
 *  c'est toujours appelé pour passer à StringExpand → string-mode est OK. */
export function GetMapName(dest: any, regionMapId: number | string, padLength: number = 0): string {
  const key = typeof regionMapId === 'number'
    ? `MAPSEC_${regionMapId}` // best-effort : auto-body devrait passer enum str
    : String(regionMapId);
  let name = getMapNameFr(key) ?? '';
  if (padLength > 0 && name.length < padLength) {
    name = name.padEnd(padLength, ' ');
  }
  // Mutable string-buffer write (= for Uint8Array dests, copy bytes ; else no-op).
  if (dest instanceof Uint8Array) {
    for (let i = 0; i < Math.min(name.length, dest.length); i++) {
      dest[i] = name.charCodeAt(i);
    }
  }
  return name;
}

/** 1:1 décomp `src/region_map.c:1601 GetMapNameGeneric(dest, mapSecId)` :
 *    case MAPSEC_DYNAMIC:     return StringCopy(dest, gText_Ferry);      // FR "FERRY"
 *    case MAPSEC_SECRET_BASE: return StringCopy(dest, gText_SecretBase); // FR "BASE SECRETE"
 *    default:                 return GetMapName(dest, mapSecId, 0);
 *  mapSecId = string MAPSEC_* dans notre monde (gMapHeader.regionMapSectionId).
 *  FR sources : strings.c:1097-1099. */
export function GetMapNameGeneric(dest: any, regionMapId: number | string): string {
  const key = typeof regionMapId === 'number' ? `MAPSEC_${regionMapId}` : String(regionMapId);
  if (key === 'MAPSEC_DYNAMIC') return _writeMapNameDest(dest, 'FERRY');
  if (key === 'MAPSEC_SECRET_BASE') return _writeMapNameDest(dest, 'BASE SECRETE');
  return GetMapName(dest, regionMapId, 0);
}

/** 1:1 décomp `src/region_map.c:1614 GetMapNameHandleAquaHideout(dest, mapSecId)` :
 *    if (mapSecId == MAPSEC_AQUA_HIDEOUT_OLD) return StringCopy(dest, gText_Hideout); // FR "PLANQUE"
 *    else return GetMapNameGeneric(dest, mapSecId);
 *  Utilisé par le Mémo Dresseur du summary screen (BufferMonTrainerMemo). */
export function GetMapNameHandleAquaHideout(dest: any, regionMapId: number | string): string {
  const key = typeof regionMapId === 'number' ? `MAPSEC_${regionMapId}` : String(regionMapId);
  if (key === 'MAPSEC_AQUA_HIDEOUT_OLD') return _writeMapNameDest(dest, 'PLANQUE');
  return GetMapNameGeneric(dest, regionMapId);
}

/** Helper : écrit `name` dans `dest` (Uint8Array buffer-style 1:1 StringCopy)
 *  + retourne la string (= idem GetMapName ci-dessus). */
function _writeMapNameDest(dest: any, name: string): string {
  if (dest instanceof Uint8Array) {
    for (let i = 0; i < Math.min(name.length, dest.length); i++) dest[i] = name.charCodeAt(i);
  }
  return name;
}
