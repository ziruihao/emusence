import * as Tone from 'tone'
import Tuna from 'tunajs'
import PianoMp3 from 'tonejs-instrument-piano-mp3';
import XylophoneMp3 from 'tonejs-instrument-xylophone-mp3';
import FluteMp3 from 'tonejs-instrument-flute-mp3';
import FrenchHornMp3 from 'tonejs-instrument-french-horn-mp3';
import TubaMp3 from 'tonejs-instrument-tuba-mp3';
import impulse from './ir.wav';

import { UI } from '.';

const CIRCLE_OF_FIFTHS = {
  0: "C",
  1: "G",
  2: "D",
  3: "A",
  4: "E",
  5: "B",
  6: "F#/Gb",
  7: "C#/Db",
  8: "G#/Ab",
  9: "D#/Eb",
  10: "A#/Bb",
  11: "F",
};

const SCALES = {
  C: { circleOfFifthsIndex: 0, chromaticIndex: 0 },
  G: { circleOfFifthsIndex: 1, chromaticIndex: 7 },
  D: { circleOfFifthsIndex: 2, chromaticIndex: 2 },
  A: { circleOfFifthsIndex: 3, chromaticIndex: 9 },
  E: { circleOfFifthsIndex: 4, chromaticIndex: 4 },
  B: { circleOfFifthsIndex: 5, chromaticIndex: 11 },
  "F#/Gb": { circleOfFifthsIndex: 6, chromaticIndex: 6 },
  "C#/Db": { circleOfFifthsIndex: 7, chromaticIndex: 1 },
  "G#/Ab": { circleOfFifthsIndex: 8, chromaticIndex: 8 },
  "D#/Eb": { circleOfFifthsIndex: 9, chromaticIndex: 3 },
  "A#/Bb": { circleOfFifthsIndex: 10, chromaticIndex: 10 },
  F: { circleOfFifthsIndex: 11, chromaticIndex: 5 },
};

const MAJOR_SCALE_INTERVAL = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE_INTERVAL = [0, 2, 3, 5, 7, 8, 10];
const LYDIAN_SCALE_INTERVAL = [0, 2, 4, 6, 7, 9, 11];
const PHRYGIAN_SCALE_INTERVAL = [0, 1, 3, 5, 7, 8, 10];
const LOCRIAN_MAJOR_SCALE_INTERVAL = [0, 2, 4, 5, 6, 8, 10];
const LOCRIAN_SCALE_INTERVAL = [0, 1, 3, 5, 6, 8, 10];

const CHORDS = [
  [0, 2, 4],
  [3, 5, 7],
  [4, 6, 8],
];

export class MusicPlayer {
  constructor() {
    this.outputMIDI = undefined;
    this.audioContext = undefined;
    this.browserInstrument = {};
    this.mode = "NONE";
    this.reset();
  }

  reset() {
    this.currentKey = "C";
    this.prevAvgHeading = 0;
  }

  async switchMode(mode) {
    if (mode === "MIDI") {
      if (this.outputMIDI !== undefined) {
        this.mode = mode;
      } else if (navigator.requestMIDIAccess) {
        const midiAccess = await navigator.requestMIDIAccess();
        const outputs = Array.from(midiAccess.outputs.values());
        const output = outputs[0];
  
        if (output) {
          this.outputMIDI = output;
          this.mode = "MIDI";
          return this.mode;
        } else {
          alert(
            "No MIDI output devices found."
          );
        }
      } else {
        alert("Web MIDI API is not supported by your browser. Please try the latest version of Chrome.");
      }
    } else if (mode == "BROWSER") {
      if (this.audioContext !== undefined) {
        this.mode = "BROWSER";
        return this.mode
      } else if (confirm("This project sounds far better as MIDI piped into the Ableton Live set I provided in the submission. Click CANCEL to try MIDI, or OK to continue with the browser instrument.")) {
        const convolver = new Tone.Convolver(impulse).toDestination();
        this.browserInstrument.piano = new PianoMp3({
          onload: () => {
            this.audioContext = new (window.AudioContext ||
              window.webkitAudioContext)();
            this.mode = "BROWSER";
            UI.audioMode.selected(this.mode)
          },
          onerror: () => {
            UI.audioMode.selected("NONE")
            alert("Error loading Tone.js instrument. Please try the latest version of Chrome, or use a MIDI device.");
          }
        }).toDestination();
        this.browserInstrument.tuba = new TubaMp3({
          onload: () => {
            this.audioContext = new (window.AudioContext ||
              window.webkitAudioContext)();
            this.mode = "BROWSER";
            UI.audioMode.selected(this.mode)
          },
          onerror: () => {
            UI.audioMode.selected("NONE")
            alert("Error loading Tone.js instrument. Please try the latest version of Chrome, or use a MIDI device.");
          }
        }).toDestination();
        this.browserInstrument.frenchHorn = new FrenchHornMp3({
          onload: () => {
            this.audioContext = new (window.AudioContext ||
              window.webkitAudioContext)();
            this.mode = "BROWSER";
            UI.audioMode.selected(this.mode)
          },
          onerror: () => {
            UI.audioMode.selected("NONE")
            alert("Error loading Tone.js instrument. Please try the latest version of Chrome, or use a MIDI device.");
          }
        }).toDestination();
        this.browserInstrument.flute = new FluteMp3({
          onload: () => {
            this.audioContext = new (window.AudioContext ||
              window.webkitAudioContext)();
            this.mode = "BROWSER";
            UI.audioMode.selected(this.mode)
          },
          onerror: () => {
            UI.audioMode.selected("NONE")
            alert("Error loading Tone.js instrument. Please try the latest version of Chrome, or use a MIDI device.");
          }
        }).toDestination();
        this.browserInstrument.xylophone = new XylophoneMp3({
          onload: () => {
            this.audioContext = new (window.AudioContext ||
              window.webkitAudioContext)();
            this.mode = "BROWSER";
            UI.audioMode.selected(this.mode)
          },
          onerror: () => {
            UI.audioMode.selected("NONE")
            alert("Error loading Tone.js instrument. Please try the latest version of Chrome, or use a MIDI device.");
          }
        }).toDestination();
        
        Object.entries(this.browserInstrument).forEach(([k, instrument]) => {
          console.log('Instrument', k, 'connected to reverb')
          instrument.release = 1;
          instrument.connect(convolver);
        })
        return this.mode
      }
    }
    this.mode = "NONE"
    return this.mode
  }

  // Assisted by ChatGPT
  async playNoteInBrowser(midiNote, duration, velocity, channel) {
    const now = Tone.now()
    switch (channel) {
      case 0:
        this.browserInstrument.tuba.triggerAttackRelease(midiToNoteString(midiNote), duration / 1000, Tone.now(), velocity / 100);
        break
      case 1:
        this.browserInstrument.frenchHorn.triggerAttackRelease(midiToNoteString(midiNote), duration / 1000, Tone.now(), velocity / 100);
        break
      case 2:
        this.browserInstrument.flute.triggerAttackRelease(midiToNoteString(midiNote), duration / 1000, Tone.now(), velocity / 100);
        break
      case 3:
        this.browserInstrument.xylophone.triggerAttackRelease(midiToNoteString(midiNote), duration / 1000, Tone.now(), velocity / 100);
        break
      default:
        // this.browserInstrument.tuba.triggerAttackRelease(midiToNoteString(midiNote), duration / 1000, Tone.now(), velocity);
        break
    }
  }

  async play(note, duration, velocity = 100, channel = 0) {
    if (this.mode === "BROWSER") {
      await this.playNoteInBrowser(note, duration, velocity, channel);
    } else if (this.mode === "MIDI") {
      this.outputMIDI.send([0x90 | channel, note, velocity]);
      setTimeout(
        () => this.outputMIDI.send([0x80 | channel, note, 0x00]),
        duration
      );
      await sleep(duration);
    }
  }

  async stopAll() {
    if (this.mode === "BROWSER") {
      return;
    } else {
      for (let i = 0; i < 16; i++) {
        this.outputMIDI.send([0xb0 | i, 0x7b, 0x00]);
      }
    }
  }

  processFlockMovement(currentAvgHeading) {
    const headingDelta = currentAvgHeading - this.prevAvgHeading;
    const headingDeltaAbs = Math.abs(headingDelta);
    const keyChange =
      Math.floor(headingDeltaAbs / 30) * (headingDelta / headingDeltaAbs);
    this.currentKey =
      CIRCLE_OF_FIFTHS[
      (((SCALES[this.currentKey].circleOfFifthsIndex + keyChange) % 12) +
        12) %
      12
      ];
    this.prevAvgHeading = currentAvgHeading;
  }

  getCurrentCirclePos() {
    if (!(this.currentKey in SCALES)) {
      console.log(
        "%c ",
        "font-size: 1px; padding: 240px 123.5px; background-size: 247px 480px; background: no-repeat url(https://i2.wp.com/i.giphy.com/media/11ZSwQNWba4YF2/giphy-downsized.gif?w=770&amp;ssl=1);"
      );
      console.log(
        "%cmusic.js line:118 this.currentKey",
        "color: #007acc;",
        this.currentKey
      );
    }
    return SCALES[this.currentKey].circleOfFifthsIndex * 30;
  }

  getNotesToPlay(octave, chords = false, dissonant = false, minor = false) {
    let key = this.currentKey;
    if (dissonant) {
      key =
        CIRCLE_OF_FIFTHS[
        (((SCALES[this.currentKey].circleOfFifthsIndex + 6) % 12) + 12) % 12
        ];
      console.log("%cmusic.js line:147 dissonant key", "color: #26bfa5;", key);
    }
    const baseNote = 60 + SCALES[key].chromaticIndex + octave * 12;
    const scale = generateMajorKeyNotes(baseNote, minor, 2);
    let notes = [];
    if (chords) {
      notes = CHORDS[Math.floor(Math.random() * CHORDS.length)].map(
        (i) => scale[i]
      );
    } else {
      notes = [scale[Math.floor(Math.random() * scale.length)]];
    }
    return notes;
  }
}

// Assisted by ChatGPT
function midiToNoteString(midiNote) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  const noteName = noteNames[noteIndex];
  return noteName + octave;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateMajorKeyNotes(startingNote, minor = false, octaves = 1) {
  const scaleIntervals = minor ? PHRYGIAN_SCALE_INTERVAL : MAJOR_SCALE_INTERVAL;

  const notes = [];

  for (let o = 0; o < octaves; o += 1) {
    for (let i = 0; i < scaleIntervals.length; i += 1) {
      const note = startingNote + o * 12 + scaleIntervals[i];
      notes.push(note);
    }
  }

  return notes;
}
