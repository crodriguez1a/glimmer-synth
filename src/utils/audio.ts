/*global Synthos, Note*/
const synthesizer = new Synthos();
const notes = new Note();

// TODO Mario - http://tabnabber.com/view_Tab.asp?tabID=5094&sArtist=Super+Mario&sName=theme+song

/**
  @method playNote
  @public
*/
export const playNote = function(frequency:number=130.8) {
  if (frequency) {
    synthesizer.frequencies = [frequency];
    synthesizer.play({})
  }
}

/**
  @method configureSynth
*/
export const configureSynth = function({ type='sine', duration=0.10 }) {
  synthesizer.setType(type);
  synthesizer.setDurations([duration]); // TODO The perfect duration would prevent clicking
}

/**
  @method sustain
*/
export const sustain = function(on:boolean=true) {
  if (on) {
    synthesizer.setDurations([0.50]);
  } else {
    synthesizer.setDurations([0.10]);
  }
}

/**
  @method changeOscillator
*/
export const changeOscillator = function(type:string='triange') {
  synthesizer.setType(type);
}
