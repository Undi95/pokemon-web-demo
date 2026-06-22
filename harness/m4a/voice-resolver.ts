/**
 * Résolveur voicegroup + MIDI program (+ note pour keysplit) → Voice concret.
 *
 * Un voicegroup est une bank de 128 voices indexée par MIDI program 0-127.
 * Une voice peut être :
 *   - Concrète (DirectSound, Square, Noise, ProgrammableWave) → utilisable directement
 *   - Keysplit (drumset multi-voice par note) → recurse vers sub-voicegroup + key split table
 *   - KeysplitAll (sub-voicegroup pour toutes les notes) → recurse direct
 *
 * Cette fonction résout récursivement jusqu'à obtenir une voice concrète.
 *
 * NB : pour résoudre les keysplits drumset, il faut aussi charger les "key split
 * tables" (mapping note 0-127 → sub-voice index). Ces tables sont dans le décomp
 * sous gKeySplitTable_X. Pour MVP simple : on retourne null si keysplit (TODO).
 */
import type { Voice, VoiceGroup, VoiceKeysplit, VoiceKeysplitAll } from './voice-types';
import { resolveKeysplitNote } from './voicegroups-data/_keysplit-tables';

/** Lookup d'un voicegroup par nom (sans le préfixe `voicegroup_`). */
export type VoiceGroupLookup = (name: string) => VoiceGroup | null;

/**
 * Résout le voice à utiliser pour une note donnée.
 * @param vg voicegroup principal (= la bank du track MIDI courant)
 * @param midiProgram 0-127 (= program change MIDI)
 * @param midiNote 0-127 (= note jouée, utilisé pour les keysplits drumset)
 * @param lookup callback pour résoudre les sub-voicegroups (recursive keysplit)
 * @returns Voice concrète ou null si non résolu (keysplit non géré, etc.)
 */
export function resolveVoice(
  vg: VoiceGroup,
  midiProgram: number,
  midiNote: number,
  lookup: VoiceGroupLookup,
  depth = 0,
): Voice | null {
  if (depth > 5) return null;  // recursion guard
  // Drumsets : index = midiNote - offset (offset défini par voice_group X, offset).
  // Pour les voicegroups normaux, offset = 0 → midiProgram direct.
  // Quand on est arrivé là via keysplit_all (drumset), midiProgram = midiNote.
  // Le offset s'applique seulement si défini sur le sub-voicegroup résolu.
  const effectiveOffset = vg.offset ?? 0;
  const idx = effectiveOffset > 0
    ? (midiNote - effectiveOffset)         // drumset : index relatif à offset
    : (midiProgram & 0x7F);                // voicegroup normal : program direct
  if (idx < 0 || idx >= vg.voices.length) return null;
  const voice = vg.voices[idx];
  if (!voice) return null;

  // KeysplitAll : sub-voicegroup pour toutes les notes.
  // Le sub-voicegroup utilise la note MIDI comme index voice.
  // Cas typique : drumset où chaque note MIDI = un drum différent.
  if (voice.type === 'keysplit_all') {
    const sub = lookup((voice as VoiceKeysplitAll).subVoicegroupName);
    if (!sub) return null;
    // Pour KeysplitAll, on utilise midiNote (et non midiProgram) comme index
    return resolveVoice(sub, midiNote, midiNote, lookup, depth + 1);
  }

  // Keysplit : table key→sub-voice index (ex: piano avec 4 samples par octave)
  if (voice.type === 'keysplit') {
    const ks = voice as VoiceKeysplit;
    const sub = lookup(ks.subVoicegroupName);
    if (!sub) return null;
    // Lookup table → sub-voice index
    const subIdx = resolveKeysplitNote(ks.splitTableSymbol, midiNote);
    if (subIdx === null) {
      // Fallback : utiliser idx 0 du sub-voicegroup
      return resolveVoice(sub, 0, midiNote, lookup, depth + 1);
    }
    return resolveVoice(sub, subIdx, midiNote, lookup, depth + 1);
  }

  // Voice concrète
  return voice;
}
