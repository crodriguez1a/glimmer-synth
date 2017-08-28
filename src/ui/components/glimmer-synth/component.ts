import Component, { tracked } from '@glimmer/component';
import { configureSynth } from './../../../utils/audio';

export default class GlimmerSynth extends Component {
  constructor(opts) {
    super(opts);
    configureSynth({});
  }

  @tracked
  private pianoKeys:Array<Object> = [
    // Frequencies: https://www.seventhstring.com/resources/notefrequencies.html
    {
      code: 97,
      name: 'a',
      frequency: 130.8 // C
    },
    {
      code: 119,
      name: 'w',
      ebony: true,
      frequency: 138.6 // C#
    },
    {
      code: 115,
      name: 's',
      frequency: 146.8 // D
    },
    {
      code: 101,
      name: 'e',
      ebony: true,
      frequency: 155.6 // Eb
    },
    {
      code: 100,
      name: 'd',
      frequency: 164.8 // E
    },
    {
      code: 102,
      name: 'f',
      frequency: 174.6 // F
    },
    {
      code: 116,
      name: 't',
      ebony: true,
      frequency: 185.0 // F#
    },
    {
      code: 103,
      name: 'g',
      frequency: 196.0 // G
    },
    {
      code: 121,
      name: 'y',
      ebony: true,
      frequency: 207.7 // G#
    },
    {
      code: 104,
      name: 'h',
      frequency: 220.0 // A
    },
    {
      code: 117,
      name: 'u',
      ebony: true,
      frequency: 233.1 // Bb
    },
    {
      code: 106,
      name: 'j',
      frequency: 246.9 // B
    },
    {
      code: 107,
      name: 'k',
      frequency: 261.63 // C
    },
    {
      code: 111,
      name: 'o',
      ebony: true,
      frequency: 277.2 // C#
    },
    {
      code: 108,
      name: 'l',
      frequency: 293.7 // D
    },
    {
      code: 112,
      name: 'p',
      ebony: true,
      frequency: 311.1 // Eb
    },
    {
      code: 59,
      name: ';',
      frequency: 329.6 // E
    }
  ];
}
