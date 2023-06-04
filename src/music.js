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
    this.reset();
  }

  reset() {
    this.outputMIDI = undefined;
    this.mode = undefined;
    this.audioContext = undefined;
    this.currentKey = "C";
    this.prevAvgHeading = 0;
  }

  async init() {
    if (navigator.requestMIDIAccess) {
      const midiAccess = await navigator.requestMIDIAccess();
      const outputs = Array.from(midiAccess.outputs.values());
      const output = outputs[0];

      if (output) {
        this.outputMIDI = output;
        this.mode = "MIDI";
        console.log("MIDI output device found.");
      } else {
        console.log(
          "No MIDI output devices found. Playing in the browser instead."
        );
      }
    } else {
      console.error("Web MIDI API is not supported by your browser.");
    }
    if (!this.outputMIDI) {
      this.mode = "BROWSER";
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      console.log(this.audioContext.sampleRate);
    }
  }

  hasInitialized() {
    return this.mode !== undefined;
  }

  // Assisted by ChatGPT
  async playNoteInBrowser(midiNote, duration) {
    const frequency = midiToFrequency(midiNote);
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.1;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    await sleep(duration);
    oscillator.stop();
  }

  async play(note, duration, velocity = 100, channel = 0) {
    if (this.mode === "BROWSER") {
      await this.playNoteInBrowser(note, duration);
      return;
    } else {
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
function midiToFrequency(midiNote) {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
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