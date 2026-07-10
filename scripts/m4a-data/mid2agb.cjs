/**
 * scripts/m4a-data/mid2agb.cjs — transcription 1:1 de tools/mid2agb (décomp
 * pokeemeraude : main.cpp + midi.cpp + agb.cpp + tables.cpp, YamaArashi 2016).
 * Convertit un .mid source du décomp en .s mp2k, TEXTE IDENTIQUE à l'outil C++
 * (mêmes fprintf, mêmes commentaires) pour rester diffable.
 *
 * Usage CLI (mêmes options que l'outil, lignes de midi.cfg compatibles) :
 *   node scripts/m4a-data/mid2agb.cjs input.mid [output.s] [-E] [-R50] [-G_x] [-V080] [-P5] [-X] [-N] [-L label]
 * Usage module :
 *   const { mid2agb } = require('./mid2agb.cjs');
 *   const sText = mid2agb('path/to/mus_x.mid', ['-E', '-R50', '-G_x', '-V080']);
 *
 * Adaptations JS documentées :
 *  - FILE (fseek/ungetc) → Buffer + curseur (s_pos) ; la sortie est accumulée
 *    dans un tableau de chaînes (s_out) au lieu d'un FILE.
 *  - Les statiques C++ (s_blockCount…) vivent au niveau module et sont TOUS
 *    réinitialisés en tête de mid2agb() (l'outil C++ traite 1 fichier/process).
 *  - stable_sort → Array.sort (stable en ES2019+) via le prédicat EventCompare.
 *  - round(60000000.0f / (float)x) : émulé en float32 avec Math.fround.
 */
'use strict';
const fs = require('fs');
const path = require('path');

// ============================ tables.cpp ============================

const g_noteDurationLUT = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 21, 22, 23, 24, 24, 24, 24, 28, 28, 30, 30, 32, 32, 32, 32, 36, 36, 36, 36,
  40, 40, 42, 42, 44, 44, 44, 44, 48, 48, 48, 48, 52, 52, 54, 54, 56, 56, 56, 56,
  60, 60, 60, 60, 64, 64, 66, 66, 68, 68, 68, 68, 72, 72, 72, 72, 76, 76, 78, 78,
  80, 80, 80, 80, 84, 84, 84, 84, 88, 88, 90, 90, 92, 92, 92, 92, 96,
];

const g_noteVelocityLUT = [
  0, 4, 4, 4, 4, 8, 8, 8, 8, 12, 12, 12, 12, 16, 16, 16, 16, 20, 20, 20,
  20, 24, 24, 24, 24, 28, 28, 28, 28, 32, 32, 32, 32, 36, 36, 36, 36, 40, 40, 40,
  40, 44, 44, 44, 44, 48, 48, 48, 48, 52, 52, 52, 52, 56, 56, 56, 56, 60, 60, 60,
  60, 64, 64, 64, 64, 68, 68, 68, 68, 72, 72, 72, 72, 76, 76, 76, 76, 80, 80, 80,
  80, 84, 84, 84, 84, 88, 88, 88, 88, 92, 92, 92, 92, 96, 96, 96, 96, 100, 100, 100,
  100, 104, 104, 104, 104, 108, 108, 108, 108, 112, 112, 112, 112, 116, 116, 116, 116, 120, 120, 120,
  120, 124, 124, 124, 124, 127, 127, 127,
];

// snprintf(buf, fmt, n) des tables C : %01u remplacé par n.
const g_noteTable = [
  (n) => `Cn${n} `, (n) => `Cs${n} `, (n) => `Dn${n} `, (n) => `Ds${n} `,
  (n) => `En${n} `, (n) => `Fn${n} `, (n) => `Fs${n} `, (n) => `Gn${n} `,
  (n) => `Gs${n} `, (n) => `An${n} `, (n) => `As${n} `, (n) => `Bn${n} `,
];

const g_minusNoteTable = [
  (n) => `CnM${n}`, (n) => `CsM${n}`, (n) => `DnM${n}`, (n) => `DsM${n}`,
  (n) => `EnM${n}`, (n) => `FnM${n}`, (n) => `FsM${n}`, (n) => `GnM${n}`,
  (n) => `GsM${n}`, (n) => `AnM${n}`, (n) => `AsM${n}`, (n) => `BnM${n}`,
];

// ============================ midi.h ============================

const MidiFormat = { SingleTrack: 0, MultiTrack: 1 };

const EventType = {
  EndOfTie: 0x01,
  Label: 0x11,
  LoopEnd: 0x12,
  LoopEndBegin: 0x13,
  LoopBegin: 0x14,
  OriginalTimeSignature: 0x15,
  WholeNoteMark: 0x16,
  Pattern: 0x17,
  TimeSignature: 0x18,
  Tempo: 0x19,
  InstrumentChange: 0x21,
  Controller: 0x22,
  PitchBend: 0x23,
  KeyShift: 0x31,
  Note: 0x40,
  TimeSplit: 0xFE,
  EndOfTrack: 0xFF,
};

function IsPatternBoundary(type) {
  return type === EventType.EndOfTrack || type <= 0x17;
}

function eventEquals(a, b) {
  return a.time === b.time && a.type === b.type && a.note === b.note
    && a.param1 === b.param1 && a.param2 === b.param2;
}

function makeEvent() {
  return { time: 0, type: 0, note: 0, param1: 0, param2: 0 };
}

// ============================ error.cpp ============================

function RaiseError(msg) {
  throw new Error(`mid2agb: ${msg}`);
}

// ============================ main.h (globals) ============================

let g_inputFile = null; // Buffer
let s_pos = 0; // curseur fichier (ftell)
let s_out = []; // sortie .s (g_outputFile)

let g_asmLabel = '';
let g_masterVolume = 127;
let g_voiceGroup = '_dummy';
let g_priority = 0;
let g_reverb = -1;
let g_clocksPerBeat = 1;
let g_exactGateTime = false;
let g_compressionEnabled = true;

// ============================ midi.cpp ============================

let g_midiFormat = 0;
let g_midiTrackCount = 0;
let g_midiTimeDiv = 0;

let g_midiChan = 0;
let g_initialWait = 0;

let s_trackDataStart = 0;
let s_seqEvents = [];
let s_trackEvents = [];
let s_absoluteTime = 0;
let s_blockCount = 0;
let s_minNote = 0;
let s_maxNote = 0;
let s_runningStatus = 0;

function Seek(offset) {
  if (offset < 0 || offset > g_inputFile.length) RaiseError(`failed to seek to ${offset}`);
  s_pos = offset;
}

function Skip(offset) {
  Seek(s_pos + offset);
}

function ReadSignature() {
  if (s_pos + 4 > g_inputFile.length) RaiseError('failed to read signature');
  const sig = g_inputFile.toString('latin1', s_pos, s_pos + 4);
  s_pos += 4;
  return sig;
}

function ReadInt8() {
  if (s_pos >= g_inputFile.length) RaiseError('unexpected EOF');
  return g_inputFile[s_pos++];
}

function ReadInt16() {
  let val = 0;
  val |= ReadInt8() << 8;
  val |= ReadInt8();
  return val;
}

function ReadInt24() {
  let val = 0;
  val |= ReadInt8() << 16;
  val |= ReadInt8() << 8;
  val |= ReadInt8();
  return val;
}

function ReadInt32() {
  let val = 0;
  val |= ReadInt8() << 24;
  val |= ReadInt8() << 16;
  val |= ReadInt8() << 8;
  val |= ReadInt8();
  return val >>> 0;
}

function ReadVLQ() {
  let val = 0;
  let c;
  do {
    c = ReadInt8();
    val <<= 7;
    val |= (c & 0x7F);
  } while (c & 0x80);
  return val;
}

function ReadMidiFileHeader() {
  Seek(0);

  if (ReadSignature() !== 'MThd') RaiseError('MIDI file header signature didn\'t match "MThd"');

  const headerLength = ReadInt32();
  if (headerLength !== 6) RaiseError('MIDI file header length isn\'t 6');

  const midiFormat = ReadInt16();
  if (midiFormat >= 2) RaiseError(`unsupported MIDI format (${midiFormat})`);

  g_midiFormat = midiFormat;
  g_midiTrackCount = ReadInt16();
  g_midiTimeDiv = ReadInt16() << 16 >> 16; // int16_t

  if (g_midiTimeDiv < 0) RaiseError(`unsupported MIDI time division (${g_midiTimeDiv})`);
}

function ReadMidiTrackHeader(offset) {
  Seek(offset);

  if (ReadSignature() !== 'MTrk') RaiseError('MIDI track header signature didn\'t match "MTrk"');

  const size = ReadInt32();
  s_trackDataStart = s_pos;
  return size + 8;
}

function StartTrack() {
  Seek(s_trackDataStart);
  s_absoluteTime = 0;
  s_runningStatus = 0;
}

function SkipEventData() {
  Skip(ReadVLQ());
}

const MidiEventCategory = { Control: 0, SysEx: 1, Meta: 2, Invalid: 3 };

// Retourne {category, typeChan, size} (paramètres par référence du C++).
function DetermineEventCategory() {
  let typeChan = ReadInt8();
  let category;
  let size = 0;

  if (typeChan < 0x80) {
    // If data byte was found, use the running status.
    s_pos--; // ungetc
    typeChan = s_runningStatus;
  }

  if (typeChan === 0xFF) {
    category = MidiEventCategory.Meta;
    size = 0;
    s_runningStatus = 0;
  } else if (typeChan >= 0xF0) {
    category = MidiEventCategory.SysEx;
    size = 0;
    s_runningStatus = 0;
  } else if (typeChan >= 0x80) {
    category = MidiEventCategory.Control;
    switch (typeChan >> 4) {
      case 0xC:
      case 0xD:
        size = 1;
        break;
      default:
        size = 2;
        break;
    }
    s_runningStatus = typeChan;
  } else {
    category = MidiEventCategory.Invalid;
  }

  return { category, typeChan, size };
}

function MakeBlockEvent(event, type) {
  event.type = type;
  event.param1 = s_blockCount++;
  event.param2 = 0;
}

function ReadEventText() {
  const length = ReadVLQ();

  if (length <= 2) {
    if (s_pos + length > g_inputFile.length) RaiseError('failed to read event text');
    const text = g_inputFile.toString('latin1', s_pos, s_pos + length);
    s_pos += length;
    return text;
  } else {
    Skip(length);
    return '';
  }
}

// Retourne true si event est rempli (bool du C++).
function ReadSeqEvent(event) {
  s_absoluteTime += ReadVLQ();
  event.time = s_absoluteTime;

  const { category, size } = DetermineEventCategory();

  if (category === MidiEventCategory.Control) {
    Skip(size);
    return false;
  }

  if (category === MidiEventCategory.SysEx) {
    SkipEventData();
    return false;
  }

  if (category === MidiEventCategory.Invalid) RaiseError('invalid event');

  // meta event
  const metaEventType = ReadInt8();

  if (metaEventType >= 1 && metaEventType <= 7) {
    // text event
    const text = ReadEventText();

    if (text === '[') MakeBlockEvent(event, EventType.LoopBegin);
    else if (text === '][') MakeBlockEvent(event, EventType.LoopEndBegin);
    else if (text === ']') MakeBlockEvent(event, EventType.LoopEnd);
    else if (text === ':') MakeBlockEvent(event, EventType.Label);
    else return false;
  } else {
    switch (metaEventType) {
      case 0x2F: // end of track
        SkipEventData();
        event.type = EventType.EndOfTrack;
        event.param1 = 0;
        event.param2 = 0;
        break;
      case 0x51: // tempo
        if (ReadVLQ() !== 3) RaiseError('invalid tempo size');
        event.type = EventType.Tempo;
        event.param1 = 0;
        event.param2 = ReadInt24();
        break;
      case 0x58: { // time signature
        if (ReadVLQ() !== 4) RaiseError('invalid time signature size');

        const numerator = ReadInt8();
        const denominatorExponent = ReadInt8();

        if (denominatorExponent >= 16) RaiseError('invalid time signature denominator');

        Skip(2); // ignore other values

        const clockTicks = 96 * numerator * g_clocksPerBeat;
        const denominator = 1 << denominatorExponent;
        const timeSig = Math.trunc(clockTicks / denominator);

        if (timeSig <= 0 || timeSig >= 0x10000) RaiseError('invalid time signature');

        event.type = EventType.TimeSignature;
        event.param1 = 0;
        event.param2 = timeSig;
        break;
      }
      default:
        SkipEventData();
        return false;
    }
  }

  return true;
}

function ReadSeqEvents() {
  StartTrack();

  for (;;) {
    const event = makeEvent();

    if (ReadSeqEvent(event)) {
      s_seqEvents.push(event);

      if (event.type === EventType.EndOfTrack) return;
    }
  }
}

function CheckNoteEnd(event) {
  event.param2 += ReadVLQ();

  const { category, typeChan, size } = DetermineEventCategory();

  if (category === MidiEventCategory.Control) {
    const chan = typeChan & 0xF;

    if (chan !== g_midiChan) {
      Skip(size);
      return false;
    }

    switch (typeChan & 0xF0) {
      case 0x80: { // note off
        const note = ReadInt8();
        ReadInt8(); // ignore velocity
        if (note === event.note) return true;
        break;
      }
      case 0x90: { // note on
        const note = ReadInt8();
        const velocity = ReadInt8();
        if (velocity === 0 && note === event.note) return true;
        break;
      }
      default:
        Skip(size);
        break;
    }

    return false;
  }

  if (category === MidiEventCategory.SysEx) {
    SkipEventData();
    return false;
  }

  if (category === MidiEventCategory.Meta) {
    const metaEventType = ReadInt8();
    SkipEventData();

    if (metaEventType === 0x2F) RaiseError('note doesn\'t end');

    return false;
  }

  RaiseError('invalid event');
}

function FindNoteEnd(event) {
  // Save the current file position and running status
  // which get modified by CheckNoteEnd.
  const startPos = s_pos;
  const savedRunningStatus = s_runningStatus;

  event.param2 = 0;

  while (!CheckNoteEnd(event))
    ;

  Seek(startPos);
  s_runningStatus = savedRunningStatus;
}

function ReadTrackEvent(event) {
  s_absoluteTime += ReadVLQ();
  event.time = s_absoluteTime;

  const { category, typeChan, size } = DetermineEventCategory();

  if (category === MidiEventCategory.Control) {
    const chan = typeChan & 0xF;

    if (chan !== g_midiChan) {
      Skip(size);
      return false;
    }

    switch (typeChan & 0xF0) {
      case 0x90: { // note on
        const note = ReadInt8();
        const velocity = ReadInt8();

        if (velocity !== 0) {
          event.type = EventType.Note;
          event.note = note;
          event.param1 = velocity;
          FindNoteEnd(event);
          if (event.param2 > 0) {
            if (note < s_minNote) s_minNote = note;
            if (note > s_maxNote) s_maxNote = note;
          }
        }
        break;
      }
      case 0xB0: // controller event
        event.type = EventType.Controller;
        event.param1 = ReadInt8(); // controller index
        event.param2 = ReadInt8(); // value
        break;
      case 0xC0: // instrument change
        event.type = EventType.InstrumentChange;
        event.param1 = ReadInt8(); // instrument
        event.param2 = 0;
        break;
      case 0xE0: // pitch bend
        event.type = EventType.PitchBend;
        event.param1 = ReadInt8();
        event.param2 = ReadInt8();
        break;
      default:
        Skip(size);
        return false;
    }

    return true;
  }

  if (category === MidiEventCategory.SysEx) {
    SkipEventData();
    return false;
  }

  if (category === MidiEventCategory.Meta) {
    const metaEventType = ReadInt8();
    SkipEventData();

    if (metaEventType === 0x2F) {
      event.type = EventType.EndOfTrack;
      event.param1 = 0;
      event.param2 = 0;
      return true;
    }

    return false;
  }

  RaiseError('invalid event');
}

function ReadTrackEvents() {
  StartTrack();

  s_trackEvents = [];

  s_minNote = 0xFF;
  s_maxNote = 0;

  for (;;) {
    const event = makeEvent();

    if (ReadTrackEvent(event)) {
      s_trackEvents.push(event);

      if (event.type === EventType.EndOfTrack) return;
    }
  }
}

function EventCompare(event1, event2) {
  if (event1.time < event2.time) return true;
  if (event1.time > event2.time) return false;

  let event1Type = event1.type;
  let event2Type = event2.type;

  if (event1.type === EventType.Note) event1Type += event1.note;
  if (event2.type === EventType.Note) event2Type += event2.note;

  if (event1Type < event2Type) return true;
  if (event1Type > event2Type) return false;

  if (event1.type === EventType.EndOfTie) {
    if (event1.note < event2.note) return true;
    if (event1.note > event2.note) return false;
  }

  return false;
}

function MergeEvents() {
  const events = [];

  let trackEventPos = 0;
  let seqEventPos = 0;

  while (s_trackEvents[trackEventPos].type !== EventType.EndOfTrack
    && s_seqEvents[seqEventPos].type !== EventType.EndOfTrack) {
    if (EventCompare(s_trackEvents[trackEventPos], s_seqEvents[seqEventPos]))
      events.push({ ...s_trackEvents[trackEventPos++] });
    else
      events.push({ ...s_seqEvents[seqEventPos++] });
  }

  while (s_trackEvents[trackEventPos].type !== EventType.EndOfTrack)
    events.push({ ...s_trackEvents[trackEventPos++] });

  while (s_seqEvents[seqEventPos].type !== EventType.EndOfTrack)
    events.push({ ...s_seqEvents[seqEventPos++] });

  // Push the EndOfTrack event with the larger time.
  if (EventCompare(s_trackEvents[trackEventPos], s_seqEvents[seqEventPos]))
    events.push({ ...s_seqEvents[seqEventPos] });
  else
    events.push({ ...s_trackEvents[trackEventPos] });

  return events;
}

function ConvertTimes(events) {
  for (const event of events) {
    event.time = Math.trunc((24 * g_clocksPerBeat * event.time) / g_midiTimeDiv);

    if (event.type === EventType.Note) {
      event.param1 = g_noteVelocityLUT[event.param1];

      let duration = Math.trunc((24 * g_clocksPerBeat * event.param2) / g_midiTimeDiv);

      if (duration === 0) duration = 1;

      if (!g_exactGateTime && duration < 96) duration = g_noteDurationLUT[duration];

      event.param2 = duration;
    }
  }
}

function InsertTimingEvents(inEvents) {
  const outEvents = [];

  const timingEvent = makeEvent();
  timingEvent.time = 0;
  timingEvent.type = EventType.TimeSignature;
  timingEvent.param2 = 96 * g_clocksPerBeat;

  for (const event of inEvents) {
    while (EventCompare(timingEvent, event)) {
      outEvents.push({ ...timingEvent });
      timingEvent.time += timingEvent.param2;
    }

    if (event.type === EventType.TimeSignature) {
      if (g_agbTrack === 1 && event.param2 !== timingEvent.param2) {
        const originalTimingEvent = { ...event };
        originalTimingEvent.type = EventType.OriginalTimeSignature;
        outEvents.push(originalTimingEvent);
      }
      timingEvent.param2 = event.param2;
      timingEvent.time = event.time + timingEvent.param2;
    }

    outEvents.push(event);
  }

  return outEvents;
}

function SplitTime(inEvents) {
  const outEvents = [];

  let time = 0;

  for (const event of inEvents) {
    let diff = event.time - time;

    if (diff > 96) {
      const wholeNoteCount = Math.trunc((diff - 1) / 96);
      diff -= 96 * wholeNoteCount;

      for (let i = 0; i < wholeNoteCount; i++) {
        time += 96;
        const timeSplitEvent = makeEvent();
        timeSplitEvent.time = time;
        timeSplitEvent.type = EventType.TimeSplit;
        outEvents.push(timeSplitEvent);
      }
    }

    const lutValue = g_noteDurationLUT[diff];

    if (lutValue !== diff) {
      const timeSplitEvent = makeEvent();
      timeSplitEvent.time = time + lutValue;
      timeSplitEvent.type = EventType.TimeSplit;
      outEvents.push(timeSplitEvent);
    }

    time = event.time;

    outEvents.push(event);
  }

  return outEvents;
}

function CreateTies(inEvents) {
  const outEvents = [];

  for (const event of inEvents) {
    if (event.type === EventType.Note && event.param2 > 96) {
      const tieEvent = { ...event };
      tieEvent.param2 = -1;
      outEvents.push(tieEvent);

      const eotEvent = makeEvent();
      eotEvent.time = event.time + event.param2;
      eotEvent.type = EventType.EndOfTie;
      eotEvent.note = event.note;
      outEvents.push(eotEvent);
    } else {
      outEvents.push(event);
    }
  }

  return outEvents;
}

function CalculateWaits(events) {
  g_initialWait = events[0].time;
  let wholeNoteCount = 0;

  for (let i = 0; i < events.length && events[i].type !== EventType.EndOfTrack; i++) {
    events[i].time = events[i + 1].time - events[i].time;

    if (events[i].type === EventType.TimeSignature) {
      events[i].type = EventType.WholeNoteMark;
      events[i].param2 = wholeNoteCount++;
    }
  }
}

function CalculateCompressionScore(events, index) {
  let score = 0;
  let lastParam1 = events[index].param1;
  let lastVelocity = 0x80;
  let lastType = events[index].type;
  let lastDuration = -0x80000000;
  let lastNote = 0x40;

  if (events[index].time > 0) score++;

  for (let i = index + 1; !IsPatternBoundary(events[i].type); i++) {
    if (events[i].type === EventType.Note) {
      let val = 0;

      if (events[i].note !== lastNote) {
        val++;
        lastNote = events[i].note;
      }

      if (events[i].param1 !== lastVelocity) {
        val++;
        lastVelocity = events[i].param1;
      }

      const duration = events[i].param2;

      if (g_noteDurationLUT[duration] !== lastDuration) {
        val++;
        lastDuration = g_noteDurationLUT[duration];
      }

      if (duration !== lastDuration) val++;

      if (val === 0) val = 1;

      score += val;
    } else {
      lastDuration = -0x80000000;

      if (events[i].type === lastType) {
        if ((lastType !== EventType.Controller && lastType !== 0x25 && lastType !== EventType.EndOfTie) || events[i].param1 === lastParam1) {
          score++;
        } else {
          score += 2;
        }
      } else {
        score += 2;
      }
    }

    lastParam1 = events[i].param1;
    lastType = events[i].type;

    if (events[i].time) score++;
  }

  return score;
}

function IsCompressionMatch(events, index1, index2) {
  if (events[index1].type !== events[index2].type ||
    events[index1].note !== events[index2].note ||
    events[index1].param1 !== events[index2].param1 ||
    events[index1].time !== events[index2].time)
    return false;

  index1++;
  index2++;

  do {
    if (!eventEquals(events[index1], events[index2])) return false;

    index1++;
    index2++;
  } while (!IsPatternBoundary(events[index1].type));

  return IsPatternBoundary(events[index2].type);
}

function CompressWholeNote(events, index) {
  for (let j = index + 1; events[j].type !== EventType.EndOfTrack; j++) {
    while (events[j].type !== EventType.WholeNoteMark) {
      j++;

      if (events[j].type === EventType.EndOfTrack) return;
    }

    if (IsCompressionMatch(events, index, j)) {
      events[j].type = EventType.Pattern;
      events[j].param2 = events[index].param2 & 0x7FFFFFFF;
      events[index].param2 |= 0x80000000;
    }
  }
}

function Compress(events) {
  for (let i = 0; events[i].type !== EventType.EndOfTrack; i++) {
    while (events[i].type !== EventType.WholeNoteMark) {
      i++;

      if (events[i].type === EventType.EndOfTrack) return;
    }

    if (CalculateCompressionScore(events, i) >= 6) {
      CompressWholeNote(events, i);
    }
  }
}

function ReadMidiTracks() {
  let trackHeaderStart = 14;

  ReadMidiTrackHeader(trackHeaderStart);
  ReadSeqEvents();

  g_agbTrack = 1;

  for (let midiTrack = 0; midiTrack < g_midiTrackCount; midiTrack++) {
    trackHeaderStart += ReadMidiTrackHeader(trackHeaderStart);

    for (g_midiChan = 0; g_midiChan < 16; g_midiChan++) {
      ReadTrackEvents();

      if (s_minNote !== 0xFF) {
        let events = MergeEvents();

        // We don't need TEMPO in anything but track 1.
        if (g_agbTrack === 1) {
          s_seqEvents = s_seqEvents.filter((event) => event.type !== EventType.Tempo);
        }

        ConvertTimes(events);
        events = InsertTimingEvents(events);
        events = CreateTies(events);
        events.sort((a, b) => (EventCompare(a, b) ? -1 : EventCompare(b, a) ? 1 : 0));
        events = SplitTime(events);
        CalculateWaits(events);

        if (g_compressionEnabled) Compress(events);

        PrintAgbTrack(events);

        g_agbTrack++;
      }
    }
  }
}

// ============================ agb.cpp ============================

let g_agbTrack = 0;

let s_lastOpName = '';
let s_blockNum = 0;
let s_keepLastOpName = false;
let s_lastNote = 0;
let s_lastVelocity = 0;
let s_noteChanged = false;
let s_velocityChanged = false;
let s_inPattern = false;
let s_extendedCommand = 0;
let s_memaccOp = 0;
let s_memaccParam1 = 0;
let s_memaccParam2 = 0;

function out(text) {
  s_out.push(text);
}

// printf helpers (formats effectivement utilisés par agb.cpp)
function pad2(n) { return String(n).padStart(2, '0'); }
function pad3(n) { return String(n).padStart(3, '0'); }
function hex2(n) { return n.toString(16).toUpperCase().padStart(2, '0'); }
function signed(n) { return n < 0 ? String(n) : `+${n}`; }

function PrintAgbHeader() {
  out('\t.include "MPlayDef.s"\n\n');
  out(`\t.equ\t${g_asmLabel}_grp, voicegroup${g_voiceGroup}\n`);
  out(`\t.equ\t${g_asmLabel}_pri, ${g_priority}\n`);

  if (g_reverb >= 0)
    out(`\t.equ\t${g_asmLabel}_rev, reverb_set+${g_reverb}\n`);
  else
    out(`\t.equ\t${g_asmLabel}_rev, 0\n`);

  out(`\t.equ\t${g_asmLabel}_mvl, ${g_masterVolume}\n`);
  out(`\t.equ\t${g_asmLabel}_key, 0\n`);
  out(`\t.equ\t${g_asmLabel}_tbs, ${g_clocksPerBeat}\n`);
  out(`\t.equ\t${g_asmLabel}_exg, ${g_exactGateTime ? 1 : 0}\n`);
  out(`\t.equ\t${g_asmLabel}_cmp, ${g_compressionEnabled ? 1 : 0}\n`);

  out('\n\t.section .rodata\n');
  out(`\t.global\t${g_asmLabel}\n`);

  out('\t.align\t2\n');
}

function ResetTrackVars() {
  s_lastVelocity = -1;
  s_lastNote = -1;
  s_velocityChanged = false;
  s_noteChanged = false;
  s_keepLastOpName = false;
  s_lastOpName = '';
  s_inPattern = false;
}

function PrintWait(wait) {
  if (wait > 0) {
    out(`\t.byte\tW${pad2(wait)}\n`);
    s_velocityChanged = true;
    s_noteChanged = true;
    s_keepLastOpName = true;
  }
}

// PrintOp(wait, name, argsText|null) — argsText = résultat du vfprintf.
function PrintOp(wait, name, argsText) {
  out('\t.byte\t\t');

  if (argsText !== null) {
    if (!g_compressionEnabled || s_lastOpName !== name) {
      out(`${name}, `);
      s_lastOpName = name;
    } else {
      out('        ');
    }
    out(argsText);
  } else {
    out(name);
    s_lastOpName = name;
  }

  out('\n');

  PrintWait(wait);
}

function PrintByte(text) {
  out(`\t.byte\t${text}\n`);
  s_velocityChanged = true;
  s_noteChanged = true;
  s_keepLastOpName = true;
}

function PrintWord(text) {
  out(`\t .word\t${text}\n`);
}

function PrintNote(event) {
  const note = event.note;
  const velocity = g_noteVelocityLUT[event.param1];
  let duration = -1;

  if (event.param2 !== -1) duration = g_noteDurationLUT[event.param2];

  let gateTimeParam = 0;

  if (g_exactGateTime && duration !== -1) gateTimeParam = event.param2 - duration;

  const gtpBuf = gateTimeParam > 0 ? `, gtp${gateTimeParam}` : '';

  const opName = duration === -1 ? 'TIE   ' : `N${pad2(duration)}   `;

  let noteChanged = true;
  let velocityChanged = true;

  if (g_compressionEnabled) {
    noteChanged = (note !== s_lastNote);
    velocityChanged = (velocity !== s_lastVelocity);
  }

  if (s_keepLastOpName) s_keepLastOpName = false;
  else s_lastOpName = '';

  if (noteChanged || velocityChanged || (gateTimeParam > 0)) {
    s_lastNote = note;

    const noteBuf = note >= 24
      ? g_noteTable[note % 12](Math.trunc(note / 12) - 2)
      : g_minusNoteTable[note % 12](Math.trunc(note / -12) + 2);

    let velocityBuf;

    if (velocityChanged || (gateTimeParam > 0)) {
      s_lastVelocity = velocity;
      velocityBuf = `, v${pad3(velocity)}`;
    } else {
      velocityBuf = '';
    }

    PrintOp(event.time, opName, `${noteBuf}${velocityBuf}${gtpBuf}`);
  } else {
    PrintOp(event.time, opName, null);
  }

  s_noteChanged = noteChanged;
  s_velocityChanged = velocityChanged;
}

function PrintEndOfTieOp(event) {
  const note = event.note;
  const noteChanged = (note !== s_lastNote);

  if (!noteChanged || !s_noteChanged) s_lastOpName = '';

  if (!noteChanged && g_compressionEnabled) {
    PrintOp(event.time, 'EOT   ', null);
  } else {
    s_lastNote = note;
    if (note >= 24)
      PrintOp(event.time, 'EOT   ', g_noteTable[note % 12](Math.trunc(note / 12) - 2));
    else
      PrintOp(event.time, 'EOT   ', g_minusNoteTable[note % 12](Math.trunc(note / -12) + 2));
  }

  s_noteChanged = noteChanged;
}

function PrintSeqLoopLabel(event) {
  s_blockNum = event.param1 + 1;
  out(`${g_asmLabel}_${g_agbTrack}_B${s_blockNum}:\n`);
  PrintWait(event.time);
  ResetTrackVars();
}

function PrintMemAcc(event) {
  switch (s_memaccOp) {
    case 0x00:
      PrintByte(`MEMACC, mem_set, 0x${hex2(s_memaccParam1)}, ${event.param2}`);
      break;
    case 0x01:
      PrintByte(`MEMACC, mem_add, 0x${hex2(s_memaccParam1)}, ${event.param2}`);
      break;
    case 0x02:
      PrintByte(`MEMACC, mem_sub, 0x${hex2(s_memaccParam1)}, ${event.param2}`);
      break;
    case 0x03:
      PrintByte(`MEMACC, mem_mem_set, 0x${hex2(s_memaccParam1)}, 0x${hex2(event.param2)}`);
      break;
    case 0x04:
      PrintByte(`MEMACC, mem_mem_add, 0x${hex2(s_memaccParam1)}, 0x${hex2(event.param2)}`);
      break;
    case 0x05:
      PrintByte(`MEMACC, mem_mem_sub, 0x${hex2(s_memaccParam1)}, 0x${hex2(event.param2)}`);
      break;
    case 0x06:
      PrintByte(`MEMACC, mem_beq, 0x${hex2(s_memaccParam1)}, ${event.param2}`);
      PrintWord(`${g_asmLabel}_${g_agbTrack}_L${s_memaccParam2}`);
      break;
    case 0x07:
      PrintByte(`MEMACC, mem_bne, 0x${hex2(s_memaccParam1)}, ${event.param2}`);
      PrintWord(`${g_asmLabel}_${g_agbTrack}_L${s_memaccParam2}`);
      break;
    case 0x08:
      PrintByte(`MEMACC, mem_bhi, 0x${hex2(s_memaccParam1)}, ${event.param2}`);
      PrintWord(`${g_asmLabel}_${g_agbTrack}_L${s_memaccParam2}`);
      break;
    case 0x09:
      PrintByte(`MEMACC, mem_bhs, 0x${hex2(s_memaccParam1)}, ${event.param2}`);
      PrintWord(`${g_asmLabel}_${g_agbTrack}_L${s_memaccParam2}`);
      break;
    case 0x0A:
      PrintByte(`MEMACC, mem_bls, 0x${hex2(s_memaccParam1)}, ${event.param2}`);
      PrintWord(`${g_asmLabel}_${g_agbTrack}_L${s_memaccParam2}`);
      break;
    case 0x0B:
      PrintByte(`MEMACC, mem_blo, 0x${hex2(s_memaccParam1)}, ${event.param2}`);
      PrintWord(`${g_asmLabel}_${g_agbTrack}_L${s_memaccParam2}`);
      break;
    case 0x0C:
      PrintByte(`MEMACC, mem_mem_beq, 0x${hex2(s_memaccParam1)}, 0x${hex2(event.param2)}`);
      PrintWord(`${g_asmLabel}_${g_agbTrack}_L${s_memaccParam2}`);
      break;
    case 0x0D:
      PrintByte(`MEMACC, mem_mem_bne, 0x${hex2(s_memaccParam1)}, 0x${hex2(event.param2)}`);
      PrintWord(`${g_asmLabel}_${g_agbTrack}_L${s_memaccParam2}`);
      break;
    case 0x0E:
      PrintByte(`MEMACC, mem_mem_bhi, 0x${hex2(s_memaccParam1)}, 0x${hex2(event.param2)}`);
      PrintWord(`${g_asmLabel}_${g_agbTrack}_L${s_memaccParam2}`);
      break;
    case 0x0F:
      PrintByte(`MEMACC, mem_mem_bhs, 0x${hex2(s_memaccParam1)}, 0x${hex2(event.param2)}`);
      PrintWord(`${g_asmLabel}_${g_agbTrack}_L${s_memaccParam2}`);
      break;
    case 0x10:
      PrintByte(`MEMACC, mem_mem_bls, 0x${hex2(s_memaccParam1)}, 0x${hex2(event.param2)}`);
      PrintWord(`${g_asmLabel}_${g_agbTrack}_L${s_memaccParam2}`);
      break;
    case 0x11:
      PrintByte(`MEMACC, mem_mem_blo, 0x${hex2(s_memaccParam1)}, 0x${hex2(event.param2)}`);
      PrintWord(`${g_asmLabel}_${g_agbTrack}_L${s_memaccParam2}`);
      break;
    default:
      break;
  }

  PrintWait(event.time);
}

function PrintExtendedOp(event) {
  // TODO: support for other extended commands

  switch (s_extendedCommand) {
    case 0x08:
      PrintOp(event.time, 'XCMD  ', `xIECV , ${event.param2}`);
      break;
    case 0x09:
      PrintOp(event.time, 'XCMD  ', `xIECL , ${event.param2}`);
      break;
    default:
      PrintWait(event.time);
      break;
  }
}

function PrintControllerOp(event) {
  switch (event.param1) {
    case 0x01:
      PrintOp(event.time, 'MOD   ', `${event.param2}`);
      break;
    case 0x07:
      PrintOp(event.time, 'VOL   ', `${event.param2}*${g_asmLabel}_mvl/mxv`);
      break;
    case 0x0A:
      PrintOp(event.time, 'PAN   ', `c_v${signed(event.param2 - 64)}`);
      break;
    case 0x0C:
    case 0x10:
      PrintMemAcc(event);
      break;
    case 0x0D:
      s_memaccOp = event.param2;
      PrintWait(event.time);
      break;
    case 0x0E:
      s_memaccParam1 = event.param2;
      PrintWait(event.time);
      break;
    case 0x0F:
      s_memaccParam2 = event.param2;
      PrintWait(event.time);
      break;
    case 0x11:
      out(`${g_asmLabel}_${g_agbTrack}_L${event.param2}:\n`);
      PrintWait(event.time);
      ResetTrackVars();
      break;
    case 0x14:
      PrintOp(event.time, 'BENDR ', `${event.param2}`);
      break;
    case 0x15:
      PrintOp(event.time, 'LFOS  ', `${event.param2}`);
      break;
    case 0x16:
      PrintOp(event.time, 'MODT  ', `${event.param2}`);
      break;
    case 0x18:
      PrintOp(event.time, 'TUNE  ', `c_v${signed(event.param2 - 64)}`);
      break;
    case 0x1A:
      PrintOp(event.time, 'LFODL ', `${event.param2}`);
      break;
    case 0x1D:
    case 0x1F:
      PrintExtendedOp(event);
      break;
    case 0x1E:
      s_extendedCommand = event.param2;
      // TODO: loop op
      break;
    case 0x21:
    case 0x27:
      PrintByte(`PRIO  , ${event.param2}`);
      PrintWait(event.time);
      break;
    default:
      PrintWait(event.time);
      break;
  }
}

function PrintAgbTrack(events) {
  out(`\n@**************** Track ${g_agbTrack} (Midi-Chn.${g_midiChan + 1}) ****************@\n\n`);
  out(`${g_asmLabel}_${g_agbTrack}:\n`);

  let wholeNoteCount = 0;
  let loopEndBlockNum = 0;

  ResetTrackVars();

  let foundVolBeforeNote = false;

  for (const event of events) {
    if (event.type === EventType.Note) break;

    if (event.type === EventType.Controller && event.param1 === 0x07) {
      foundVolBeforeNote = true;
      break;
    }
  }

  if (!foundVolBeforeNote)
    PrintByte(`\tVOL   , 127*${g_asmLabel}_mvl/mxv`);

  PrintWait(g_initialWait);
  PrintByte(`KEYSH , ${g_asmLabel}_key+0`);

  for (let i = 0; events[i].type !== EventType.EndOfTrack; i++) {
    const event = events[i];

    if (IsPatternBoundary(event.type)) {
      if (s_inPattern) PrintByte('PEND');
      s_inPattern = false;
    }

    if (event.type === EventType.WholeNoteMark || event.type === EventType.Pattern)
      out(`@ ${pad3(wholeNoteCount++)}   ----------------------------------------\n`);

    switch (event.type) {
      case EventType.Note:
        PrintNote(event);
        break;
      case EventType.EndOfTie:
        PrintEndOfTieOp(event);
        break;
      case EventType.Label:
        PrintSeqLoopLabel(event);
        break;
      case EventType.LoopEnd:
        PrintByte('GOTO');
        PrintWord(`${g_asmLabel}_${g_agbTrack}_B${loopEndBlockNum}`);
        PrintSeqLoopLabel(event);
        break;
      case EventType.LoopEndBegin:
        PrintByte('GOTO');
        PrintWord(`${g_asmLabel}_${g_agbTrack}_B${loopEndBlockNum}`);
        PrintSeqLoopLabel(event);
        loopEndBlockNum = s_blockNum;
        break;
      case EventType.LoopBegin:
        PrintSeqLoopLabel(event);
        loopEndBlockNum = s_blockNum;
        break;
      case EventType.WholeNoteMark:
        if (event.param2 & 0x80000000) {
          out(`${g_asmLabel}_${g_agbTrack}_${pad3((event.param2 & 0x7FFFFFFF) >>> 0)}:\n`);
          ResetTrackVars();
          s_inPattern = true;
        }
        PrintWait(event.time);
        break;
      case EventType.Pattern:
        PrintByte('PATT');
        PrintWord(`${g_asmLabel}_${g_agbTrack}_${pad3(event.param2)}`);

        while (!IsPatternBoundary(events[i + 1].type)) i++;

        ResetTrackVars();
        break;
      case EventType.Tempo: {
        // round(60000000.0f / (float)param2) — arithmétique float32 fidèle.
        const bpm = Math.round(Math.fround(Math.fround(60000000) / Math.fround(event.param2)));
        PrintByte(`TEMPO , ${bpm}*${g_asmLabel}_tbs/2`);
        PrintWait(event.time);
        break;
      }
      case EventType.InstrumentChange:
        PrintOp(event.time, 'VOICE ', `${event.param1}`);
        break;
      case EventType.PitchBend:
        PrintOp(event.time, 'BEND  ', `c_v${signed(event.param2 - 64)}`);
        break;
      case EventType.Controller:
        PrintControllerOp(event);
        break;
      default:
        PrintWait(event.time);
        break;
    }
  }

  PrintByte('FINE');
}

function PrintAgbFooter() {
  const trackCount = g_agbTrack - 1;

  out('\n@******************************************************@\n');
  out('\t.align\t2\n');
  out(`\n${g_asmLabel}:\n`);
  out(`\t.byte\t${trackCount}\t@ NumTrks\n`);
  out('\t.byte\t0\t@ NumBlks\n');
  out(`\t.byte\t${g_asmLabel}_pri\t@ Priority\n`);
  out(`\t.byte\t${g_asmLabel}_rev\t@ Reverb.\n`);
  out('\n');
  out(`\t.word\t${g_asmLabel}_grp\n`);
  out('\n');

  // track pointers
  for (let i = 1; i <= trackCount; i++)
    out(`\t.word\t${g_asmLabel}_${i}\n`);

  out('\n\t.end\n');
}

// ============================ main.cpp ============================

function StripExtension(s) {
  const pos = s.lastIndexOf('.');
  if (pos > 0) s = s.slice(0, pos);
  return s;
}

function GetExtension(s) {
  const pos = s.lastIndexOf('.');
  if (pos > 0) return s.slice(pos + 1);
  return '';
}

function BaseName(s) {
  let posAfterSlash = Math.max(s.lastIndexOf('/'), s.lastIndexOf('\\'));
  if (posAfterSlash < 0) posAfterSlash = 0;
  else posAfterSlash++;

  const dotPos = s.indexOf('.', posAfterSlash);
  if (dotPos > posAfterSlash && dotPos >= 0) s = s.slice(posAfterSlash, dotPos);

  return s;
}

/**
 * Point d'entrée module : équivalent de main() sans fichiers de sortie.
 * argv = options style CLI (ex. ['-E', '-R50', '-G_x', '-V080']).
 * Retourne le texte .s.
 */
function mid2agb(inputFilename, argv = [], outputFilename = '') {
  // Reset de TOUT l'état process (l'outil C++ vit le temps d'un fichier).
  g_asmLabel = '';
  g_masterVolume = 127;
  g_voiceGroup = '_dummy';
  g_priority = 0;
  g_reverb = -1;
  g_clocksPerBeat = 1;
  g_exactGateTime = false;
  g_compressionEnabled = true;
  s_out = [];
  s_pos = 0;
  s_seqEvents = [];
  s_trackEvents = [];
  s_absoluteTime = 0;
  s_blockCount = 0;
  s_runningStatus = 0;
  g_agbTrack = 0;
  g_midiChan = 0;
  g_initialWait = 0;
  s_extendedCommand = 0;
  s_memaccOp = 0;
  s_memaccParam1 = 0;
  s_memaccParam2 = 0;
  ResetTrackVars();

  // Parsing des options (GetArgument : texte collé à l'option ou arg suivant).
  for (let i = 0; i < argv.length; i++) {
    const option = argv[i];
    if (option[0] === '-' && option.length > 1) {
      const getArg = () => (option.length >= 3 ? option.slice(2) : argv[++i]);
      switch (option[1].toUpperCase()) {
        case 'E': g_exactGateTime = true; break;
        case 'G': g_voiceGroup = getArg(); break;
        case 'L': g_asmLabel = getArg(); break;
        case 'N': g_compressionEnabled = false; break;
        case 'P': g_priority = parseInt(getArg(), 10); break;
        case 'R': g_reverb = parseInt(getArg(), 10); break;
        case 'V': g_masterVolume = parseInt(getArg(), 10); break;
        case 'X': g_clocksPerBeat = 2; break;
        default: RaiseError(`unknown option ${option}`);
      }
    }
  }

  if (GetExtension(inputFilename) !== 'mid') RaiseError('input filename extension is not "mid"');

  if (outputFilename === '') outputFilename = StripExtension(inputFilename) + '.s';

  if (g_asmLabel === '') g_asmLabel = BaseName(outputFilename);

  g_inputFile = fs.readFileSync(inputFilename);

  ReadMidiFileHeader();
  PrintAgbHeader();
  ReadMidiTracks();
  PrintAgbFooter();

  return s_out.join('');
}

module.exports = { mid2agb };

// CLI compatible avec les lignes de midi.cfg.
if (require.main === module) {
  const args = process.argv.slice(2);
  const positional = [];
  const options = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i][0] === '-' && args[i].length > 1) {
      options.push(args[i]);
      // Option à argument séparé (-G x) : embarquer l'arg suivant.
      if (args[i].length === 2 && 'GLPRV'.includes(args[i][1].toUpperCase()) && i + 1 < args.length) {
        options.push(args[++i]);
      }
    } else {
      positional.push(args[i]);
    }
  }
  const input = positional[0];
  const output = positional[1] || StripExtension(input) + '.s';
  const text = mid2agb(input, options, output);
  fs.writeFileSync(output, text);
  console.log(`${path.basename(input)} → ${output} (${text.length} chars)`);
}
