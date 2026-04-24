/**
 * Noms français officiels des zones de la Pokémon Emeraude française.
 * Source : `src/data/region_map/region_map_sections.json` dans pokeemeraude.
 * On étendra cette table en la parsant automatiquement plus tard.
 */
export const MAP_NAMES_FR: Record<string, string> = {
  MAPSEC_LITTLEROOT_TOWN: 'BOURG-EN-VOL',
  MAPSEC_OLDALE_TOWN: 'ROCHEFIN-SUR-MER',
  MAPSEC_DEWFORD_TOWN: 'MERADOR',
  MAPSEC_LAVARIDGE_TOWN: 'VOLROC',
  MAPSEC_FALLARBOR_TOWN: 'MYOKARA',
  MAPSEC_VERDANTURF_TOWN: 'VERGAZON',
  MAPSEC_PACIFIDLOG_TOWN: 'PACIFIVILLE',
  MAPSEC_PETALBURG_CITY: 'CLEMENTI-VILLE',
  MAPSEC_SLATEPORT_CITY: 'POIVRESSEL',
  MAPSEC_MAUVILLE_CITY: 'LAVANDIA',
  MAPSEC_RUSTBORO_CITY: 'MEROUVILLE',
  MAPSEC_FORTREE_CITY: 'CIMETRONELLE',
  MAPSEC_LILYCOVE_CITY: 'ATALANOPOLIS',
  MAPSEC_MOSSDEEP_CITY: 'ALGATIA',
  MAPSEC_SOOTOPOLIS_CITY: 'ATLANTIS',
  MAPSEC_EVER_GRANDE_CITY: 'VERTALIA'
};

export function getMapNameFr(mapsecId: string | undefined): string {
  if (!mapsecId) return '???';
  return MAP_NAMES_FR[mapsecId] ?? mapsecId.replace(/^MAPSEC_/, '');
}
